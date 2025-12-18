"""
OpenVAS Connector - Interface to GVM/OpenVAS vulnerability scanner
"""
from gvm.connections import UnixSocketConnection, TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
import os
import xml.etree.ElementTree as ET
from datetime import datetime

class OpenVASConnector:
    def __init__(self, host=None, port=None, username=None, password=None):
        self.host = host or os.environ.get('OPENVAS_HOST', 'localhost')
        self.port = int(port or os.environ.get('OPENVAS_PORT', 9390))
        self.username = username or os.environ.get('GVM_USER', 'admin')
        self.password = password or os.environ.get('GVM_PASS', 'admin')
        self.connection = None
        self.gmp = None

    def connect(self):
        """Establish connection to OpenVAS/GVM"""
        try:
            # Use TLS connection for remote GVM
            self.connection = TLSConnection(hostname=self.host, port=self.port)
            self.gmp = Gmp(connection=self.connection, transform=EtreeTransform())
            
            # Authenticate
            self.gmp.authenticate(self.username, self.password)
            print(f"[+] Connected to OpenVAS at {self.host}:{self.port}")
            return True
        except Exception as e:
            print(f"[!] Failed to connect to OpenVAS: {e}")
            return False

    def disconnect(self):
        """Close connection"""
        if self.connection:
            self.connection.disconnect()

    def get_version(self):
        """Get GVM version"""
        if not self.gmp:
            self.connect()
        version = self.gmp.get_version()
        return ET.tostring(version, encoding='unicode')

    def create_target(self, name, hosts):
        """
        Create a scan target
        Args:
            name: Target name
            hosts: Comma-separated list of IPs/hostnames
        Returns:
            target_id
        """
        if not self.gmp:
            self.connect()
        
        response = self.gmp.create_target(name=name, hosts=[hosts])
        target_id = response.get('id')
        print(f"[+] Created target '{name}' with ID: {target_id}")
        return target_id

    def create_task(self, name, target_id, scanner_id=None, config_id=None):
        """
        Create a scan task
        Args:
            name: Task name
            target_id: Target ID from create_target
            scanner_id: Scanner to use (default: OpenVAS Default)
            config_id: Scan config (default: Full and fast)
        Returns:
            task_id
        """
        if not self.gmp:
            self.connect()
        
        # Use default scanner and config if not specified
        if not scanner_id:
            scanners = self.gmp.get_scanners()
            scanner_id = scanners.xpath('scanner/@id')[0]
        
        if not config_id:
            configs = self.gmp.get_scan_configs()
            # Find "Full and fast" config
            for config in configs.xpath('config'):
                if 'Full and fast' in config.find('name').text:
                    config_id = config.get('id')
                    break
        
        response = self.gmp.create_task(
            name=name,
            config_id=config_id,
            target_id=target_id,
            scanner_id=scanner_id
        )
        task_id = response.get('id')
        print(f"[+] Created task '{name}' with ID: {task_id}")
        return task_id

    def start_scan(self, task_id):
        """Start a scan task"""
        if not self.gmp:
            self.connect()
        
        response = self.gmp.start_task(task_id)
        report_id = response.xpath('report_id')[0].text
        print(f"[+] Started scan task {task_id}, report ID: {report_id}")
        return report_id

    def get_task_status(self, task_id):
        """Get status of a task"""
        if not self.gmp:
            self.connect()
        
        response = self.gmp.get_task(task_id)
        status = response.xpath('task/status/text()')[0]
        progress = response.xpath('task/progress/text()')[0]
        return {'status': status, 'progress': int(progress)}

    def get_results(self, task_id):
        """
        Get scan results for a task
        Returns list of vulnerabilities
        """
        if not self.gmp:
            self.connect()
        
        # Get the task to find the latest report
        task = self.gmp.get_task(task_id)
        reports = task.xpath('task/last_report/report/@id')
        
        if not reports:
            return []
        
        report_id = reports[0]
        report = self.gmp.get_report(report_id)
        
        vulnerabilities = []
        for result in report.xpath('report/report/results/result'):
            vuln = {
                'name': result.find('name').text,
                'host': result.find('host').text,
                'port': result.find('port').text,
                'severity': float(result.find('severity').text),
                'description': result.find('description').text,
                'cve': result.find('.//ref[@type="cve"]') .get('id') if result.find('.//ref[@type="cve"]') is not None else None,
                'solution': result.find('solution') .text if result.find('solution') is not None else None,
            }
            vulnerabilities.append(vuln)
        
        return vulnerabilities

    def scan_network(self, target_name, hosts):
        """
        Convenience method to create and run a full scan
        Args:
            target_name: Name for this scan
            hosts: IP addresses/ranges to scan
        Returns:
            task_id
        """
        try:
            if not self.connect():
                return None
            
            target_id = self.create_target(target_name, hosts)
            task_id = self.create_task(f"Scan_{target_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}", target_id)
            report_id = self.start_scan(task_id)
            
            return task_id
        except Exception as e:
            print(f"[!] Error during scan: {e}")
            return None
        finally:
            self.disconnect()
