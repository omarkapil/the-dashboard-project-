"""
Asset Monitor Service - Phase 2
Tracks network assets over time and detects changes.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.scan import NetworkAsset, ActionItem
import logging

logger = logging.getLogger(__name__)

class AssetMonitor:
    """
    Compares current scan results with historical data to detect:
    1. New devices (never seen before)
    2. Port changes (new ports opened on existing devices)
    3. Devices that went offline
    """
    
    @staticmethod
    def process_scan_results(db: Session, scan_id: int, scan_results: list):
        """
        Main entry point. Takes scan results and updates the persistent inventory.
        Returns a list of detected events (for action items).
        """
        events = []
        current_ips = set()
        
        for host_data in scan_results:
            ip = host_data.get('ip')
            if not ip:
                continue
                
            current_ips.add(ip)
            
            # Get current open ports from scan
            current_ports = ",".join(sorted([str(p.get('port')) for p in host_data.get('ports', []) if p.get('state') == 'open']))
            
            # Check if device exists in persistent inventory
            existing_asset = db.query(NetworkAsset).filter(NetworkAsset.ip_address == ip).first()
            
            if existing_asset:
                # Device already known - check for changes
                old_ports = existing_asset.open_ports or ""
                
                # Port Change Detection
                if current_ports != old_ports:
                    new_ports = set(current_ports.split(",")) - set(old_ports.split(","))
                    if new_ports and new_ports != {''}:
                        event = {
                            "type": "alert",
                            "priority": "MEDIUM",
                            "title": f"New ports opened on {ip}",
                            "description": f"Ports {', '.join(new_ports)} were recently opened on this device."
                        }
                        events.append(event)
                        logger.info(f"Port change detected on {ip}: {new_ports}")
                
                # Update last_seen and ports
                existing_asset.last_seen = datetime.utcnow()
                existing_asset.open_ports = current_ports
                existing_asset.hostname = host_data.get('hostnames') or existing_asset.hostname
                existing_asset.status = "active"
                
            else:
                # NEW DEVICE DETECTED!
                new_asset = NetworkAsset(
                    ip_address=ip,
                    mac_address=host_data.get('mac'),
                    hostname=host_data.get('hostnames'),
                    os_name=host_data.get('os_name'),
                    device_type=host_data.get('device_type', 'unknown'),
                    first_seen=datetime.utcnow(),
                    last_seen=datetime.utcnow(),
                    open_ports=current_ports
                )
                db.add(new_asset)
                
                event = {
                    "type": "new_device",
                    "priority": "HIGH",
                    "title": f"New device discovered: {ip}",
                    "description": f"A new device ({host_data.get('hostnames') or 'Unknown'}) has appeared on the network."
                }
                events.append(event)
                logger.info(f"New device discovered: {ip}")
        
        # Check for devices that went offline
        # (Only if we have a reasonable set of IPs to compare)
        if current_ips:
            previously_active = db.query(NetworkAsset).filter(
                NetworkAsset.status == "active"
            ).all()
            
            for asset in previously_active:
                if asset.ip_address not in current_ips:
                    # This device was not seen in the current scan
                    # Only mark offline if we're scanning the same subnet
                    # For now, we'll just update status
                    asset.status = "offline"
        
        # Create Action Items from events
        for event in events:
            action = ActionItem(
                scan_id=scan_id,
                title=event["title"],
                description=event["description"],
                priority=event["priority"],
                type=event["type"]
            )
            db.add(action)
        
        return events
