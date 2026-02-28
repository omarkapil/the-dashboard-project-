import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class ElasticIntegration:
    def __init__(self):
        self.url = settings.ELASTICSEARCH_URL
        self.headers = {"Content-Type": "application/json"}

    async def check_health(self) -> bool:
        """Check if Elasticsearch is running and accessible."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.url}/_cluster/health",
                    timeout=5.0
                )
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Elasticsearch health check failed: {str(e)}")
                return False

    async def fetch_recent_alerts(self, index: str = "wazuh-alerts-*", size: int = 100) -> list:
        """Fetch latest alerts/logs from a specific index."""
        query = {
            "size": size,
            "sort": [{"@timestamp": {"order": "desc"}}],
            "query": {
                "match_all": {}
            }
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.url}/{index}/_search",
                    json=query,
                    headers=self.headers,
                    timeout=10.0
                )
                if response.status_code == 200:
                    hits = response.json().get("hits", {}).get("hits", [])
                    return [hit.get("_source", {}) for hit in hits]
                return []
            except Exception as e:
                logger.error(f"Failed to fetch alerts from Elasticsearch: {str(e)}")
                return []
                
    async def inject_dummy_alert(self, index: str, doc: dict) -> bool:
        """Inject a dummy alert for testing purposes."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.url}/{index}/_doc",
                    json=doc,
                    headers=self.headers,
                    timeout=5.0
                )
                return response.status_code in [200, 201]
            except Exception as e:
                logger.error(f"Failed to inject dummy alert: {str(e)}")
                return False

elastic_service = ElasticIntegration()
