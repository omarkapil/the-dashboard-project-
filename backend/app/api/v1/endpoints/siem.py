from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.services.elastic_integration import elastic_service
from app.services.wazuh_integration import wazuh_service
from app.services.agent_orchestrator import AgentOrchestrator
from app.models.scan import Scan, ScanStatus
import datetime

router = APIRouter()

@router.get("/health", response_model=Dict[str, Any])
async def siem_health():
    """Check health of SIEM tools (Elasticsearch, Wazuh)."""
    elastic_ok = await elastic_service.check_health()
    wazuh_token = await wazuh_service.get_token()
    
    return {
        "elasticsearch": {
            "status": "online" if elastic_ok else "offline"
        },
        "wazuh": {
            "status": "online" if wazuh_token else "offline"
        }
    }

@router.get("/alerts", response_model=List[Dict[str, Any]])
async def get_siem_alerts(limit: int = 50):
    """Fetch raw alerts directly from Elasticsearch."""
    alerts = await elastic_service.fetch_recent_alerts(size=limit)
    return alerts

@router.get("/agents", response_model=List[Dict[str, Any]])
async def get_wazuh_agents():
    """Fetch active endpoint agents from Wazuh."""
    agents = await wazuh_service.get_agents()
    return agents

@router.post("/analyze/{scan_id}", response_model=Dict[str, Any])
async def trigger_siem_analysis(scan_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger the SIEM Agent pipeline to analyze alerts and orchestrate SOAR actions."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    orchestrator = AgentOrchestrator(scan_id)
    
    async def run_pipeline():
        try:
            scan.status = ScanStatus.RUNNING
            db.commit()
            
            await orchestrator.run_siem_pipeline()
            
            scan.status = ScanStatus.COMPLETED
            scan.completed_at = datetime.datetime.utcnow()
            scan.end_time = scan.completed_at
            db.commit()
        except Exception as e:
            db.rollback()
            scan.status = ScanStatus.FAILED
            db.commit()
    
    background_tasks.add_task(run_pipeline)
    
    return {"message": "SIEM analysis pipeline started in the background", "scan_id": scan_id}
