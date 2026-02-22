import os
import time
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Optional, Any

from gvm.connections import UnixSocketConnection, TLSConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
from gvm.errors import GvmError

class OpenVASService:
    """
    Service for interacting with OpenVAS/Greenbone Vulnerability Manager (GVM).
    Handles authentication, target creation, task scheduling, and result parsing.
    """

    def __init__(self):
        # Configuration from environment variables
        self.host = os.getenv("OPENVAS_HOST", "localhost")
        self.port = int(os.getenv("OPENVAS_PORT", 9390))
        self.username = os.getenv("OPENVAS_USER", "admin")
        self.password = os.getenv("OPENVAS_PASSWORD", "admin")
        self.socket_path = os.getenv("OPENVAS_SOCKET", "/run/gvmd/gvmd.sock")
        self.connection_type = os.getenv("OPENVAS_CONNECTION_TYPE", "tls") # or "socket"
        
        self.connection = None
        self.gmp_base = None
        self.gmp = None

    def _connect(self):
        """Establish connection to GVM."""
        retries = 3
        last_error = None
        
        for attempt in range(retries):
            try:
                if self.connection_type == "socket":
                    self.connection = UnixSocketConnection(path=self.socket_path)
                else:
                    # python-gvm 24.1.0 handles SSL internally; no ssl_context param
                    self.connection = TLSConnection(hostname=self.host, port=self.port)
                
                # In python-gvm 24.1.0, Gmp is a factory/connector.
                # We must call connect(), then determine_supported_gmp() to get the
                # versioned protocol object that has authenticate(), create_target(), etc.
                self.gmp_base = Gmp(connection=self.connection, transform=EtreeTransform())
                self.gmp_base.connect()
                self.gmp = self.gmp_base.determine_supported_gmp()
                self.gmp.authenticate(self.username, self.password)
                return True
            except Exception as e:
                last_error = e
                print(f"Attempt {attempt+1}/{retries} failed to connect to OpenVAS at {self.host}: {e}")
                time.sleep(2) # Wait a bit before retrying

        print(f"Error connecting to OpenVAS at {self.host if self.connection_type != 'socket' else self.socket_path}: {last_error}")
        # Re-raise nicely or handled
        raise ConnectionError(f"Could not connect to OpenVAS scanner after {retries} attempts. Ensure the service is running. Details: {last_error}")

    def _disconnect(self):
        """Close the connection."""
        if self.gmp_base:
            try:
                self.gmp_base.disconnect()
            except Exception:
                pass

    def create_target(self, name: str, hosts: List[str], port_list_id: Optional[str] = None) -> str:
        """
        Create a target for scanning.
        :param name: Name of the target
        :param hosts: List of IP addresses or hostnames
        :param port_list_id: Optional ID of a port list to use
        :return: The ID of the created target
        """
        self._connect()
        try:
            # Join hosts list into a comma-separated string
            hosts_str = ",".join(hosts)
            response = self.gmp.create_target(name=name, hosts=[hosts_str], port_list_id=port_list_id)
            # Response is an ElementTree object
            target_id = response.get('id')
            return target_id
        finally:
            self._disconnect()

    def create_task(self, name: str, target_id: str, config_id: Optional[str] = None, scanner_id: Optional[str] = None) -> str:
        """
        Create a scan task.
        :param name: Name of the task
        :param target_id: ID of the target to scan
        :param config_id: ID of the scan configuration (default: Full and fast)
        :param scanner_id: ID of the scanner (default: OpenVAS Default)
        :return: The ID of the created task
        """
        self._connect()
        try:
            # Get default scanner if not provided
            if not scanner_id:
                scanners = self.gmp.get_scanners()
                # Usually the OpenVAS Default scanner is the first one or we can search for it
                # For simplicity, let's try to find one named "OpenVAS Default" or verify the first available
                # But typically gmp.create_task handles defaults if we omit, but GMP requires scanner_id often.
                # Let's get the first available scanner.
                scanner_id = scanners.findall('scanner')[0].get('id')

            # Get default config if not provided (Full and fast)
            if not config_id:
                configs = self.gmp.get_scan_configs()
                for config in configs.findall('config'):
                    if config.find('name').text == "Full and fast":
                        config_id = config.get('id')
                        break
                if not config_id:
                     # Fallback to the first one found
                     config_id = configs.findall('config')[0].get('id')

            response = self.gmp.create_task(name=name, config_id=config_id, target_id=target_id, scanner_id=scanner_id)
            task_id = response.get('id')
            return task_id
        finally:
            self._disconnect()

    def start_scan(self, task_id: str) -> str:
        """
        Start a scan task.
        :param task_id: The ID of the task to start
        :return: The ID of the report associated with this scan run
        """
        self._connect()
        try:
            response = self.gmp.start_task(task_id)
            # The start_task response typically contains the report_id
            report_id = response.find('report_id').text
            return report_id
        finally:
            self._disconnect()

    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of a task.
        :param task_id: The ID of the task
        :return: Dictionary with status, progress, and current report ID
        """
        self._connect()
        try:
            response = self.gmp.get_task(task_id)
            task = response.find('task')
            status = task.find('status').text
            progress = task.find('progress').text
            
            # Use current_report if available, otherwise last_report
            current_report = task.find('current_report')
            last_report = task.find('last_report')
            
            report_id = None
            if current_report is not None:
                report_id = current_report.find('report').get('id')
            elif last_report is not None:
                report_id = last_report.find('report').get('id')
                
            return {
                "status": status,
                "progress": int(progress) if progress.isdigit() else 0,
                "report_id": report_id
            }
        finally:
            self._disconnect()

    def get_results(self, report_id: str) -> List[Dict[str, Any]]:
        """
        Get vulnerabilities from a report.
        :param report_id: The ID of the report
        :return: List of vulnerabilities
        """
        self._connect()
        try:
            # Get the report with results
            response = self.gmp.get_report(report_id, details=True, ignore_pagination=True)
            report = response.find('report')
            
            vulnerabilities = []
            results = report.findall('.//results/result')
            
            for result in results:
                name = result.find('name').text
                host = result.find('host').text
                port = result.find('port').text
                severity = float(result.find('severity').text)
                description = result.find('description').text
                
                # Extract solution if available
                solution_elem = result.find('solution')
                solution = solution_elem.text if solution_elem is not None else ""
                
                # Extract CVEs
                nvt = result.find('nvt')
                cves = []
                if nvt is not None:
                    refs = nvt.findall('refs/ref')
                    for ref in refs:
                        if ref.get('type') == 'cve':
                            cves.append(ref.get('id'))
                
                vulnerabilities.append({
                    "name": name,
                    "host": host,
                    "port": port,
                    "severity": severity,
                    "description": description,
                    "solution": solution,
                    "cves": cves
                })
            
            return vulnerabilities
        finally:
            self._disconnect()

    def get_version(self) -> str:
        """Get GVM version."""
        self._connect()
        try:
            return self.gmp.get_version()
        finally:
            self._disconnect()

# Singleton instance
openvas_service = OpenVASService()
