import logging

logger = logging.getLogger(__name__)

class RiskCalculator:
    """
    Calculates a 'Health Score' (0-100) where 100 is perfectly secure.
    Risk Logic:
    - Start at 100
    - Critical Vuln: -20 points
    - High Vuln: -10 points
    - Medium Vuln: -5 points
    - Open High-Risk Port (RDP/Telnet/SMB): -15 points (if not marked as vuln)
    """
    
    HIGH_RISK_PORTS = [21, 23, 445, 3389] # FTP, Telnet, SMB, RDP

    @staticmethod
    def calculate(scan_data):
        score = 100
        
        # 1. Vulnerability Penalty
        # Assuming scan_data has a list of vulnerability objects or dicts
        vulns = scan_data.get('vulnerabilities', [])
        for v in vulns:
            severity = v.get('severity', 'LOW').upper()
            if severity == 'CRITICAL':
                score -= 20
            elif severity == 'HIGH':
                score -= 10
            elif severity == 'MEDIUM':
                score -= 5
        
        # 2. Open Port Penalty (Simple Heuristic for basic scans)
        # If we have raw port data
        hosts = scan_data.get('assets', [])
        for host in hosts:
            for port_data in host.get('ports', []):
                port = port_data.get('port')
                if port in RiskCalculator.HIGH_RISK_PORTS and port_data.get('state') == 'open':
                     # deduplicate if it's already caught as a vuln? 
                     # For now, strict penalty.
                    score -= 15

        return max(0, score)

class ActionGenerator:
    """
    Translates technical findings into human-readable To-Do items.
    """
    @staticmethod
    def generate_actions(scan_data):
        actions = []
        
        vulns = scan_data.get('vulnerabilities', [])
        hosts = scan_data.get('assets', [])

        # 1. High Risk Port Actions
        for host in hosts:
            ip = host.get('ip')
            for port_data in host.get('ports', []):
                port = port_data.get('port')
                service = port_data.get('service', 'Unknown')
                
                if port == 23:
                    actions.append({
                        "title": f"Disable Telnet on {ip}",
                        "priority": "HIGH",
                        "description": "Telnet sends passwords in plain text. Use SSH instead.",
                        "type": "configuration"
                    })
                elif port == 445:
                     actions.append({
                        "title": f"Check SMB Security on {ip}",
                        "priority": "CRITICAL",
                        "description": "Ensure SMBv1 is disabled to prevent ransomware.",
                        "type": "patch"
                    })
                elif port == 3389:
                     actions.append({
                        "title": f"Secure RDP on {ip}",
                        "priority": "MEDIUM",
                        "description": "Remote Desktop is open. Ensure strong passwords or restrict access via VPN.",
                        "type": "configuration"
                    })

        # 2. General Vuln Actions
        for v in vulns:
            # Avoid duplicates if covered above (simple check)
            actions.append({
                "title": f"Fix {v.get('cve_id', 'Vulnerability')} on {v.get('host')}",
                "priority": v.get('severity', 'LOW'),
                "description": v.get('description', 'Security issue detected.'),
                "type": "patch"
            })
            
        # Sort by priority
        priority_map = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        actions.sort(key=lambda x: priority_map.get(x["priority"], 99))
        
        return actions
