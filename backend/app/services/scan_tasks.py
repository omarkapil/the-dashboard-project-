from app.core.celery_app import celery_app
from app.services.nmap_wrapper import NmapWrapper
from app.core.database import SessionLocal
from app.models.scan import Scan, Vulnerability, ScanStatus, ScanAsset, AssetService, ActionItem, Target
from app.services.risk_engine import RiskCalculator, ActionGenerator
from app.services.asset_monitor import AssetMonitor
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def run_scan_task(self, scan_id: int):
    db = SessionLocal()
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    
    if not scan:
        logger.error(f"Scan {scan_id} not found")
        return

    try:
        # Update status to RUNNING and set actual start time
        scan.status = ScanStatus.RUNNING
        scan.started_at = datetime.utcnow()
        db.commit()
        
        # Execute Scan
        scanner = NmapWrapper()
        
        # Determine target URL
        target_host = scan.target_url # Legacy fallback
        if scan.target and scan.target.base_url:
            target_host = scan.target.base_url
            
        if not target_host:
            raise ValueError(f"No valid target URL found for scan {scan.id}")
        
        # SANITIZE TARGET FOR NMAP (Strip protocol, path, port while preserving CIDR)
        clean_target = target_host
        if "://" in target_host:
            from urllib.parse import urlparse
            parsed = urlparse(target_host)
            clean_target = parsed.hostname or parsed.path.split('/')[0]
        elif "/" in target_host and not target_host.startswith("/"):
            # Likely CIDR notation like 192.168.1.0/24
            clean_target = target_host
            
        results = scanner.scan_target(clean_target, scan.scan_type)
        
        # Save Results
        total_risk = 0.0
        vuln_count = 0
        all_vulns = []
        
        # Track seen hosts to create unique assets
        seen_hosts = set()
        
        for host_data in results:
            ip = host_data['ip']
            
            # 1. Create/Update Scan Asset
            if ip not in seen_hosts:
                asset = ScanAsset(
                    scan_id=scan.id,
                    ip_address=ip,
                    hostname=host_data.get('hostnames'),
                    mac_address=host_data.get('mac'),
                    mac_vendor=host_data.get('mac_vendor'),
                    os_name=host_data.get('os_name'),
                    os_accuracy=host_data.get('os_accuracy'),
                    device_type=host_data.get('device_type', 'unknown'),
                    is_new="true" # Flag for notification
                )
                db.add(asset)
                db.flush() # Flush to get asset.id for services
                seen_hosts.add(ip)
            
                # 2. Save Services
                for port_data in host_data['ports']:
                    # Add to AssetService table
                    service = AssetService(
                        asset_id=asset.id,
                        port=port_data['port'],
                        protocol=port_data['protocol'],
                        state=port_data['state'],
                        service_name=port_data['service'],
                        product=port_data['product'],
                        version=port_data['version'],
                        cpe=port_data.get('cpe'),
                        extra_info=port_data.get('extra_info')
                    )
                    db.add(service)

                    # Add to Vulnerabilities table (Active Risks)
                    vuln = Vulnerability(
                        scan_id=scan.id,
                        host=host_data['ip'],
                        port=port_data['port'],
                        protocol=port_data['protocol'],
                        service=port_data['service'],
                        type="Service Exposure",
                        severity=port_data['severity'].lower(),
                        url=f"{port_data['protocol']}://{host_data['ip']}:{port_data['port']}",
                        description=f"Service: {port_data['product']} {port_data['version']}",
                        remediation="Update service or firewall port."
                    )
                    
                    db.add(vuln)
                    vuln_count += 1
                    
                    # Collect for Risk Engine
                    all_vulns.append({
                        "host": host_data['ip'],
                        "severity": port_data['severity'].lower(),
                        "cve_id": "",
                        "description": f"Service: {port_data['product']}"
                    })

        # Phase 1.5: Intelligence Analysis (Gemini)
        # Import inside task to avoid circular deps
        try:
            from app.services.intelligence_agent import IntelligenceAgent
            intelligence = IntelligenceAgent(db)
            intelligence.batch_analyze(scan.id, results)
        except Exception as e:
            logger.error(f"Intelligence analysis failed: {e}")

        # 3. Deep Vulnerability Scan (Nuclei)
        try:
            from app.services.nuclei_wrapper import NucleiWrapper
            nuclei = NucleiWrapper()
            nuclei_findings = nuclei.scan_target(clean_target, scan_type=scan.scan_type)
            
            for finding in nuclei_findings:
                vuln = Vulnerability(
                    scan_id=scan.id,
                    type=finding['type'],
                    severity=finding['severity'],
                    description=finding['description'],
                    url=finding['url'],
                    host=clean_target,
                    service="http" if "http" in finding['url'] else "unknown", # Deduce service
                    cve_id=finding.get('cve_id', ''), # Use .get for safety
                    proof_of_concept=str(finding.get('evidence', '')), # Use .get for safety
                    remediation="Refer to CVE mitigation.",
                    status="OPEN"
                )
                db.add(vuln)
                vuln_count += 1
                all_vulns.append({
                    "host": clean_target,
                    "severity": finding['severity'],
                    "cve_id": finding.get('cve_id', ''), # Use .get for safety
                    "description": finding['description']
                })
                
        except Exception as e:
            logger.error(f"Nuclei scan failed or skipped: {e}")

        # Prepare Data for Risk Engine
        scan_data = {
            "assets": results, 
            "vulnerabilities": all_vulns
        }

        # Calculate Professional Risk Score
        # Fetch Target to get Business Context
        target_obj = db.query(Target).filter(Target.id == scan.target_id).first()
        criticality_multiplier = 1.0
        if target_obj:
            if target_obj.asset_value == "CRITICAL": criticality_multiplier = 2.0
            elif target_obj.asset_value == "HIGH": criticality_multiplier = 1.5
            elif target_obj.asset_value == "LOW": criticality_multiplier = 0.5
            
        base_score = RiskCalculator.calculate(scan_data)
        scan.risk_score = min(100.0, base_score * criticality_multiplier)
        
        # Generate Action Items
        actions = ActionGenerator.generate_actions(scan_data)
        for action in actions:
            db_action = ActionItem(
                scan_id=scan.id,
                title=action['title'],
                description=action['description'],
                priority=action['priority'],
                type=action['type']
            )
            db.add(db_action)

        # Phase 2: Process through Asset Monitor for new device/change detection
        AssetMonitor.process_scan_results(db, scan.id, results)

        scan.status = ScanStatus.COMPLETED
        scan.completed_at = datetime.utcnow()
        
    except Exception as e:
        logger.error(f"Scan failed: {e}")
        scan.status = ScanStatus.FAILED
        scan.risk_score = 0
    finally:
        db.commit()
        db.close()

@celery_app.task
def trigger_periodic_scan(target: str = "localhost"):
    """
    Creates a new scan record and triggers the scan task.
    """
    db = SessionLocal()
    try:
        # Create new scan record
        scan = Scan(target=target, scan_type="quick")
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        # Trigger the actual scan logic
        run_scan_task.delay(scan_id=scan.id)
        logger.info(f"Triggered periodic scan {scan.id} for {target}")
    except Exception as e:
        logger.error(f"Failed to trigger periodic scan: {e}")
    finally:
        db.close()
