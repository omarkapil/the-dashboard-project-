import random
import nmap
import time
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO
from models import db, Asset, Vulnerability, Risk, RiskHistory

def calculate_risk_score(cvss, criticality, exposure_multiplier):
    return cvss * criticality * exposure_multiplier

SCAN_IN_PROGRESS = False

def is_scan_running():
    return SCAN_IN_PROGRESS

def run_network_scan(target_range):
    global SCAN_IN_PROGRESS
    SCAN_IN_PROGRESS = True
    print(f"Starting Nmap scan on {target_range}...")
    try:
        nm = nmap.PortScanner()
        # Ping scan (-sn) first to find live hosts
        # Then -sV (Version) and -O (OS) on live hosts. 
        # For speed in this MVP, we might stick to -sV -O but limit ports or use fast mode.
        # Note: -O requires root/admin privileges usually. Falls back gracefully if not.
        
        # Scan Top 100 ports + Version + OS + Scripts (vulners)
        nm.scan(hosts=target_range, arguments='-sV -O --top-ports 100 --script vulners')
        
        scanned_assets = []
        
        for host in nm.all_hosts():
            # Get Hostname
            hostname = nm[host].hostname() if nm[host].hostname() else host
            
            # Get MAC and IP
            mac = nm[host]['addresses'].get('mac', 'Unknown')
            ip = nm[host]['addresses'].get('ipv4', host)
            
            # Extract detailed OS information
            os_match = nm[host].get('osmatch', [])
            os_type = "Unknown"
            os_version = ""
            os_details_text = ""
            os_family = "Unknown"
            
            if os_match:
                os_type = os_match[0]['name']
                os_family = os_type  # For backwards compatibility  
                os_version = f"{os_match[0].get('accuracy', 'N/A')}%"
                # Store full OS match details
                os_details_text = "; ".join([f"{m['name']} ({m.get('accuracy', 'N/A')}%)" for m in os_match[:3]])
            
            # Determine Type based on OS
            asset_type = "Network Device"
            if "windows" in os_type.lower():
                asset_type = "Workstation"
            elif "linux" in os_type.lower() or "unix" in os_type.lower():
                asset_type = "Server"
            elif "router" in os_type.lower() or "switch" in os_type.lower():
                asset_type = "Network Equipment"
            
            # Process Open Ports & Services - build structured JSON
            ports_list = []
            for proto in nm[host].all_protocols():
                lport = nm[host][proto].keys()
                for port in lport:
                    service = nm[host][proto][port]
                    service_name = service.get('name', 'unknown')
                    product = service.get('product', '')
                    version = service.get('version', '')
                    
                    port_info = {
                        'port': port,
                        'protocol': proto,
                        'state': service.get('state', 'unknown'),
                        'service': service_name,
                        'product': product,
                        'version': version,
                        'extrainfo': service.get('extrainfo', '')
                    }
                    ports_list.append(port_info)
            
            # Update/Create Asset with enhanced fields
            asset = Asset.query.filter_by(ip_address=ip).first()
            if not asset:
                asset = Asset(
                    name=hostname, 
                    type=asset_type, 
                    ip_address=ip,
                    mac_address=mac,
                    hostname=hostname,
                    os_type=os_type,
                    os_version=os_version,
                    os_family=os_family,
                    os_details=os_details_text,
                    open_ports=ports_list,
                    installed_software=[],
                    last_seen=datetime.utcnow(),
                    criticality=5
                )
                db.session.add(asset)
            else:
                # Update existing asset
                asset.name = hostname
                asset.hostname = hostname
                asset.os_type = os_type
                asset.os_version = os_version
                asset.os_family = os_family
                asset.os_details = os_details_text
                asset.mac_address = mac
                asset.open_ports = ports_list
                asset.last_seen = datetime.utcnow()
            
            
            db.session.commit()
            scanned_assets.append(asset)

            # Process CVEs from vulners script
            import re
            for proto in nm[host].all_protocols():
                for port in nm[host][proto].keys():
                    service = nm[host][proto][port]
                    
                    # Check for script output (vulners)
                    if 'script' in service and 'vulners' in service['script']:
                        vuln_text = service['script']['vulners']
                        product = service.get('product', '')
                        version = service.get('version', '')
                        
                        cves = re.findall(r'CVE-\d{4}-\d{4,7}', vuln_text)
                        
                        for cve in set(cves):
                            vuln = Vulnerability.query.filter_by(cve_id=cve).first()
                            if not vuln:
                                vuln = Vulnerability(
                                    cve_id=cve, 
                                    description=f"Detected via Nmap on port {port} ({product} {version})", 
                                    base_score=7.0
                                )
                                db.session.add(vuln)
                                db.session.commit()
                            
                            risk = Risk.query.filter_by(asset_id=asset.id, vulnerability_id=vuln.id).first()
                            if not risk:
                                risk = Risk(
                                    asset_id=asset.id,
                                    vulnerability_id=vuln.id,
                                    custom_score=calculate_risk_score(vuln.base_score, asset.criticality, 1.0),
                                    status='New',
                                    exposure_multiplier=1.0
                                )
                                db.session.add(risk)
        
        db.session.commit()
        return len(scanned_assets)
    except Exception as e:
        print(f"Scan error: {e}")
        # Dont raise in production usually, but for debugging yes
        return 0
    finally:
        SCAN_IN_PROGRESS = False

def check_shodan_exposure(ip_address, api_key=None):
    """
    Checks if an IP is exposed on Shodan.
    If no API key is provided, returns mock data.
    """
    if not api_key:
        # Mock Response
        print(f"Mocking Shodan check for {ip_address}")
        return {
            'exposed': random.choice([True, False]),
            'ports': [80, 443, 22] if random.random() > 0.5 else [],
            'isp': 'Mock ISP',
            'city': 'Cyber City'
        }
    
    try:
        import shodan
        api = shodan.Shodan(api_key)
        host = api.host(ip_address)
        return {
            'exposed': True,
            'ports': host.get('ports', []),
            'isp': host.get('isp', 'Unknown'),
            'city': host.get('city', 'Unknown')
        }
    except Exception as e:
        print(f"Shodan lookup failed: {e}")
        return {'exposed': False, 'error': str(e)}

def run_remediation(asset_ip, action_type):
    """
    Simulates a remediation action via SSH (Paramiko).
    In a real scenario, this would connect and run commands.
    """
    import paramiko
    print(f"Initiating remediation ({action_type}) on {asset_ip}...")
    
    # Mocking the success for MVP safety
    # In real life:
    # ssh = paramiko.SSHClient()
    # ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    # ssh.connect(asset_ip, username='admin', password='password')
    # stdin, stdout, stderr = ssh.exec_command('sudo apt-get update && sudo apt-get upgrade -y')
    
    time.sleep(2) # Simulate work
    return True

def seed_mock_data():
    # Assets
    assets = [
        Asset(name="Main Database Server", type="Server", criticality=9),
        Asset(name="Employee Workstation 1", type="Workstation", criticality=4),
        Asset(name="Web Server", type="Server", criticality=8),
        Asset(name="Guest Wi-Fi Router", type="Network", criticality=2)
    ]
    db.session.add_all(assets)
    db.session.commit()

    # Vulnerabilities
    vulns = [
        Vulnerability(cve_id="CVE-2023-1234", description="SQL Injection vulnerability", base_score=9.8),
        Vulnerability(cve_id="CVE-2023-5678", description="Cross-Site Scripting (XSS)", base_score=6.1),
        Vulnerability(cve_id="CVE-2023-9012", description="Weak Password Policy", base_score=4.5),
        Vulnerability(cve_id="CVE-2024-0001", description="Remote Code Execution", base_score=9.0)
    ]
    db.session.add_all(vulns)
    db.session.commit()

    # Risks
    risks = []
    for asset in assets:
        # Assign random vulns to assets
        for vuln in random.sample(vulns, k=random.randint(1, 3)):
            score = calculate_risk_score(vuln.base_score, asset.criticality, 1.0)
            risk = Risk(
                asset_id=asset.id,
                vulnerability_id=vuln.id,
                custom_score=score,
                status=random.choice(['New', 'New', 'In Progress', 'Closed'])
            )
            risks.append(risk)
    
    db.session.add_all(risks)
    db.session.commit()

    # History (Mock last 7 days)
    base_score = sum(r.custom_score for r in risks if r.status != 'Closed')
    for i in range(7, 0, -1):
        date = datetime.now() - timedelta(days=i)
        # Random fluctuation
        daily_score = max(0, base_score + random.randint(-50, 50))
        compliance = random.uniform(60, 95)
        history = RiskHistory(date=date, total_risk_score=daily_score, compliance_percentage=compliance)
        db.session.add(history)
    db.session.commit()

def generate_pdf_report():
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = styles['Title']
    story.append(Paragraph("SME Cyber Exposure Report", title_style))
    story.append(Spacer(1, 12))

    # Executive Summary
    story.append(Paragraph("Executive Summary", styles['Heading2']))
    
    # Calculate stats
    total_risks = Risk.query.count()
    open_risks = Risk.query.filter(Risk.status != 'Closed').all()
    closed_risks = Risk.query.filter_by(status='Closed').count()
    total_score = sum(r.custom_score for r in open_risks)
    compliance = (closed_risks / total_risks * 100) if total_risks > 0 else 100

    summary_text = f"""
    <b>Total Risk Score:</b> {total_score:.2f}<br/>
    <b>Compliance Score:</b> {compliance:.1f}%<br/>
    <b>Open Vulnerabilities:</b> {len(open_risks)}<br/>
    <b>Resolved Vulnerabilities:</b> {closed_risks}
    """
    story.append(Paragraph(summary_text, styles['Normal']))
    story.append(Spacer(1, 12))

    # Vulnerability Details Table
    story.append(Paragraph("Critical & High Risks", styles['Heading2']))
    
    data = [['Asset', 'Vulnerability', 'Severity', 'Score', 'Status']]
    
    # Sort by score desc
    sorted_risks = sorted(open_risks, key=lambda x: x.custom_score, reverse=True)
    
    for risk in sorted_risks:
        data.append([
            risk.asset.name,
            risk.vulnerability.cve_id,
            str(risk.vulnerability.base_score),
            f"{risk.custom_score:.1f}",
            risk.status
        ])

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    
    # Proof of Progress
    story.append(Spacer(1, 20))
    story.append(Paragraph("Remediation Progress", styles['Heading2']))
    progress_text = f"The organization has successfully remediated {closed_risks} out of {total_risks} identified vulnerabilities."
    story.append(Paragraph(progress_text, styles['Normal']))

    doc.build(story)
    buffer.seek(0)
    return buffer
