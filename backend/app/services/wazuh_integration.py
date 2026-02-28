import httpx
import base64
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class WazuhIntegration:
    def __init__(self):
        self.api_url = settings.WAZUH_API_URL
        self.user = settings.WAZUH_API_USER
        self.password = settings.WAZUH_API_PASSWORD
        self.token = None

    async def get_token(self):
        """Authenticate to Wazuh API and get JWT token."""
        auth_str = f"{self.user}:{self.password}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()
        headers = {
            "Authorization": f"Basic {b64_auth_str}"
        }
        # In lab environments, Wazuh uses self-signed certs
        async with httpx.AsyncClient(verify=False) as client:
            try:
                response = await client.post(
                    f"{self.api_url}/security/user/authenticate", 
                    headers=headers, 
                    timeout=10.0
                )
                if response.status_code == 200:
                    self.token = response.json().get("data", {}).get("token")
                    return self.token
                logger.error(f"Wazuh auth failed with status {response.status_code}: {response.text}")
                return None
            except Exception as e:
                logger.error(f"Failed to connect to Wazuh API: {str(e)}")
                return None

    async def get_agents(self):
        """Fetch list of Wazuh agents and their status."""
        if not self.token:
            await self.get_token()
        if not self.token:
            return []

        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        async with httpx.AsyncClient(verify=False) as client:
            try:
                response = await client.get(
                    f"{self.api_url}/agents", 
                    headers=headers,
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json().get("data", {}).get("affected_items", [])
                return []
            except Exception as e:
                logger.error(f"Failed to fetch Wazuh agents: {str(e)}")
                return []

    async def trigger_active_response(self, agent_id: str, command: str, arguments: list = []):
        """Trigger an active response on a specific agent."""
        if not self.token:
            await self.get_token()
        if not self.token:
            return False

        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        payload = {
            "command": command,
            "arguments": arguments,
            "custom": False
        }
        async with httpx.AsyncClient(verify=False) as client:
            try:
                response = await client.put(
                    f"{self.api_url}/active-response?agents_list={agent_id}", 
                    headers=headers,
                    json=payload,
                    timeout=10.0
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Failed to trigger Wazuh active response: {str(e)}")
                return False

wazuh_service = WazuhIntegration()
