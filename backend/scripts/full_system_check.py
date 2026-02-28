import asyncio
import httpx
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Service health endpoints
SERVICES = {
    "Backend API": "http://localhost:8000/api/v1/",
    "Elasticsearch": "http://localhost:9200",
    "Kibana": "http://localhost:5601",
    "n8n": "http://localhost:5678",
    "Frontend": "http://localhost:5173",
}

async def check_service(name, url):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5.0)
            if response.status_code < 500:
                logger.info(f"✅ {name} is UP ({response.status_code})")
                return True
            else:
                logger.error(f"❌ {name} is DOWN ({response.status_code})")
                return False
        except Exception as e:
            logger.error(f"❌ {name} is UNREACHABLE: {e}")
            return False

async def main():
    logger.info("Starting Full System Health Check...")
    results = await asyncio.gather(*[check_service(name, url) for name, url in SERVICES.items()])
    
    if all(results):
        logger.info("\n🎉 ALL core services are ONLINE and HEALTHY!")
        sys.exit(0)
    else:
        logger.error("\n⚠️ Some services are MISSING or UNREACHABLE.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
