import os
import shodan
from flask import current_app

class ShodanClient:
    def __init__(self, api_key=None):
        # Prefer init arg, then env var
        self.api_key = api_key or os.environ.get('SHODAN_API_KEY')
        self.api = None
        if self.api_key:
            try:
                self.api = shodan.Shodan(self.api_key)
            except Exception as e:
                print(f"Failed to init Shodan API: {e}")

    def get_host_info(self, ip_address):
        """
        Fetch host info from Shodan. Returns dict with open ports, isp, vulns.
        """
        if not self.api:
            return {'error': 'No API Key configured', 'exposed': False}

        try:
            host = self.api.host(ip_address)
            return {
                'exposed': True,
                'ip': host.get('ip_str'),
                'ports': host.get('ports', []),
                'isp': host.get('isp', 'Unknown'),
                'city': host.get('city', 'Unknown'),
                'vulns': host.get('vulns', []), # List of CVE strings
                'last_update': host.get('last_update')
            }
        except shodan.APIError as e:
            # "No information available for that IP" is common for private IPs
            return {'exposed': False, 'message': str(e)}
        except Exception as e:
            return {'exposed': False, 'error': str(e)}
