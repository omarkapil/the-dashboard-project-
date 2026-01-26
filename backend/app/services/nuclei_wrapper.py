import subprocess
import json
import logging
import os
from typing import List, Dict

logger = logging.getLogger(__name__)

class NucleiWrapper:
    """
    Wrapper for ProjectDiscovery Nuclei Vulnerability Scanner.
    """
    
    def __init__(self):
        self.binary_path = "nuclei"
        
    def scan_target(self, target: str, scan_type: str = "quick") -> List[Dict]:
        """
        Run Nuclei scan against a target.
        """
        output_file = f"/tmp/nuclei_{os.urandom(4).hex()}.json"
        
        # Build command
        # -nc: no colors
        # -j: json output
        # -silent: show only results
        cmd = [self.binary_path, "-u", target, "-json", "-o", output_file, "-silent"]
        
        if scan_type == "quick":
            # Scan for critical/high CVEs and misconfigs
            cmd.extend(["-s", "critical,high", "-t", "cves/,misconfiguration/"])
        else:
            # Full scan
            cmd.extend(["-s", "critical,high,medium", "-t", "cves/,misconfiguration/,exposures/,vulnerabilities/"])
            
        try:
            logger.info(f"Starting Nuclei scan on {target}: {' '.join(cmd)}")
            subprocess.run(cmd, check=True, timeout=600)  # 10 min timeout
            
            # Parse results
            results = []
            if os.path.exists(output_file):
                with open(output_file, 'r') as f:
                    for line in f:
                        try:
                            finding = json.loads(line)
                            results.append(self._transform_finding(finding))
                        except json.JSONDecodeError:
                            continue
                os.remove(output_file)
                
            return results
            
        except subprocess.TimeoutExpired:
            logger.error("Nuclei scan timed out")
            return []
        except Exception as e:
            logger.error(f"Nuclei scan failed: {str(e)}")
            return []

    def _transform_finding(self, finding: Dict) -> Dict:
        """
        Convert Nuclei JSON to our internal structure.
        """
        info = finding.get('info', {})
        return {
            "type": info.get('name', 'Unknown Vulnerability'),
            "severity": info.get('severity', 'info'),
            "description": info.get('description', ''),
            "cve_id": info.get('classification', {}).get('cve-id', None),
            "url": finding.get('matched-at', ''),
            "service": finding.get('type', 'http'),
            "evidence": finding.get('matcher-status', {})
        }
