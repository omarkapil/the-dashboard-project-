import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class SOAROrchestrator:
    def __init__(self):
        self.webhook_url = settings.N8N_WEBHOOK_URL
        self.headers = {"Content-Type": "application/json"}

    async def trigger_playbook(self, playbook_id: str, action: str, data: dict) -> bool:
        """
        Trigger an n8n webhook with a specific action and payload.
        playbook_id: Specific webhook ID or endpoint (e.g., 'block-ip')
        action: Descriptive action name for logging
        data: The contextual data for the playbook (e.g., {"ip": "1.2.3.4", "agent_id": "001"})
        """
        # Append playbook_id to base webhook URL if needed, or use a custom router in n8n
        # Here we assume N8N_WEBHOOK_URL ends with / and playbook_id is the webhook path.
        url = f"{self.webhook_url}{playbook_id}" if playbook_id else self.webhook_url
        
        payload = {
            "action": action,
            "data": data,
            "source": "SME_Security_Center"
        }

        async with httpx.AsyncClient() as client:
            try:
                logger.info(f"Triggering SOAR Playbook '{action}' at {url} with data: {data}")
                response = await client.post(
                    url,
                    json=payload,
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    logger.info(f"SOAR Playbook '{action}' triggered successfully.")
                    return True
                else:
                    logger.error(f"Failed to trigger SOAR playbook: {response.text}")
                    return False

            except Exception as e:
                logger.error(f"Error triggering SOAR playbook '{action}': {str(e)}")
                return False

soar_service = SOAROrchestrator()
