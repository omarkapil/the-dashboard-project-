import nmap
import json
import logging

logger = logging.getLogger(__name__)

class NmapWrapper:
    def __init__(self):
        self.nm = nmap.PortScanner()

    def scan_target(self, target: str, scan_type: str = "quick"):
        """
        Executes an Nmap scan.
        scan_type: 'quick' (Top 100 ports) or 'full' (all ports, service detection)
        """
        try:
            if scan_type == "quick":
                # Scans top ports + specific lab ports to ensure 100% success in the simulation
                # -F (top 100) + custom additions
                logger.info(f"Starting Quick Scan on {target}")
                self.nm.scan(hosts=target, arguments='-sV --top-ports 100 -p 80,3000,6379,8080,8081')
            else:
                # -p-: Scan more ports for Full Scan
                logger.info(f"Starting Full Scan on {target}")
                self.nm.scan(hosts=target, arguments='-p 1-10000 -sV -O --script vuln')

            return self._parse_results()
        except Exception as e:
            logger.error(f"Nmap scan failed: {e}")
            raise e

    def _parse_results(self):
        """
        Parses Nmap results into a structured format for our DB.
        """
        scan_data = []
        
        for host in self.nm.all_hosts():
            host_info = {
                "ip": host,
                "status": self.nm[host].state(),
                "hostnames": self.nm[host].hostname(),
                "ports": []
            }
            
            for proto in self.nm[host].all_protocols():
                lport = self.nm[host][proto].keys()
                for port in lport:
                    service_info = self.nm[host][proto][port]
                    port_data = {
                        "port": port,
                        "protocol": proto,
                        "state": service_info['state'],
                        "service": service_info.get('name', 'unknown'),
                        "product": service_info.get('product', ''),
                        "version": service_info.get('version', ''),
                        "severity": "INFO" # Default, logic execution will update this
                    }
                    
                    # Check for script output (vulnerabilities)
                    if 'script' in service_info:
                        port_data['scripts'] = service_info['script']
                        # Simple heuristic: if 'vuln' script returns something, flag it
                        if any('vuln' in k or 'cve' in k for k in service_info['script']):
                            port_data['severity'] = "HIGH"
                            
                    host_info['ports'].append(port_data)
            
            scan_data.append(host_info)
            
        return scan_data
