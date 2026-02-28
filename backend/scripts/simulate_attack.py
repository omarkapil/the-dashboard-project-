#!/usr/bin/env python3
import asyncio
import httpx
import json
import uuid
import time
from datetime import datetime

# URLs (Assuming running locally in dev mode against the Docker stack)
ELASTICSEARCH_URL = "http://elasticsearch:9200"
BACKEND_API_URL = "http://localhost:8000/api/v1"

async def inject_dummy_alert():
    print("--- 1. Injecting Dummy Alert into Elasticsearch ---")
    alert_id = str(uuid.uuid4())
    doc = {
        "@timestamp": datetime.utcnow().isoformat(),
        "agent": {"id": "001", "name": "web-server-01", "ip": "192.168.1.50"},
        "rule": {"level": 12, "description": "Multiple failed login attempts", "id": "5710", "mitre": {"tactic": ["Credential Access"]}},
        "decoder": {"name": "sshd"},
        "data": {"srcip": "203.0.113.10", "dstuser": "root"}
    }
    
    # Try creating an index if it's the first time
    async with httpx.AsyncClient() as client:
        try:
            # We'll put it in a wazuh-alerts-* index mock
            index_name = f"wazuh-alerts-4.x-{datetime.utcnow().strftime('%Y.%m.%d')}"
            
            response = await client.post(
                f"{ELASTICSEARCH_URL}/{index_name}/_doc",
                json=doc,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Successfully injected alert: {alert_id}")
                return True
            else:
                print(f"❌ Failed to inject alert: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error communicating with Elasticsearch: {e}")
            print("❗ Ensure Elasticsearch is running on localhost:9200")
            return False

async def trigger_backend_analysis():
    print("\n--- 2. Triggering Backend SIEM Analysis ---")
    
    # First, create a mock target/scan since the architecture requires a scan_id
    async with httpx.AsyncClient() as client:
        try:
            # Create Target
            target_res = await client.post(
                f"{BACKEND_API_URL}/targets/",
                json={"base_url": f"localhost-{str(uuid.uuid4())[:8]}", "name": "SIEM Automation Target"}
            )
            if target_res.status_code == 400:
                # Fallback: get first target or handle
                list_res = await client.get(f"{BACKEND_API_URL}/targets/")
                target_id = list_res.json()[0]["id"]
            elif target_res.status_code != 200:
                print(f"❌ Failed to create target: {target_res.text}")
                return False
            else:
                target_id = target_res.json()["id"]
            
            # Start a SIEM scan
            scan_res = await client.post(
                f"{BACKEND_API_URL}/scans/",
                json={"target_id": target_id, "scan_type": "quick"}
            )
            
            if scan_res.status_code != 200:
                print(f"❌ Failed to create scan: {scan_res.text}")
                return False
                
            scan_id = scan_res.json()["id"]
            print(f"✅ Created mock scan with ID: {scan_id}")
            
            # Trigger Analysis
            analysis_res = await client.post(f"{BACKEND_API_URL}/siem/analyze/{scan_id}")
            if analysis_res.status_code == 200:
                print(f"✅ SIEM Pipeline started for Scan ID: {scan_id}")
                return scan_id
            else:
                print(f"❌ Failed to trigger analysis: {analysis_res.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error connecting to backend: {e}")
            return False

async def main():
    print("=============================================")
    print(" SME Dashboard: SIEM Automation Verification ")
    print("=============================================")
    
    # 1. Inject Alert
    success = await inject_dummy_alert()
    
    if not success:
        return
        
    time.sleep(2) # Give ES a moment to index
    
    # 2. Trigger Orchestrator
    scan_id = await trigger_backend_analysis()
    
    if scan_id:
        print("\n--- 3. Verification ---")
        print("To verify the complete SOAR loop:")
        print("1. Check the backend logs: docker-compose logs -f backend celery_worker")
        print("   Look for 'start_siem_analysis' and 'Triggering SOAR Playbook'")
        print("2. Check n8n (http://localhost:5678) to see if the webhook was received")
        print("3. Check the dashboard frontend SIEM components")
        
if __name__ == "__main__":
    asyncio.run(main())
