"""
PentesterFlow API Endpoints - Scans
Extended scan endpoints with AI agent integration
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio

from app.core.database import get_db
from app.models.scan import Scan, ScanStatus, Target
from app.schemas.scan import (
    ScanCreate, ScanResponse, ScanDetail, ScanSummary,
    AgentLogResponse
)
from app.services.scan_tasks import run_scan_task

router = APIRouter()


# ============================================================================
# SCAN ENDPOINTS
# ============================================================================

@router.post("/", response_model=ScanResponse)
def create_scan(scan_in: ScanCreate, db: Session = Depends(get_db)):
    """
    Create a new scan and start it in the background.
    Supports both legacy (target_url) and new (target_id) formats.
    """
    # Handle legacy format
    target_url = scan_in.target_url
    target_id = scan_in.target_id
    
    # If target_id provided, get URL from target
    if target_id:
        target = db.query(Target).filter(Target.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        target_url = target.base_url
    
    if not target_url:
        raise HTTPException(status_code=400, detail="Either target_id or target_url required")
    
    # Create scan record
    scan = Scan(
        target_id=target_id,
        target_url=target_url,
        scan_type=scan_in.scan_type,
        configuration=scan_in.configuration,
        status=ScanStatus.QUEUED
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Trigger Celery Task (legacy Nmap scan)
    # For AI-powered scans, use /ai endpoint below
    run_scan_task.delay(scan_id=scan.id)
    
    return scan


@router.post("/ai", response_model=ScanResponse)
async def create_ai_scan(scan_in: ScanCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Create a new AI-powered scan using the agent orchestrator.
    This runs the full PentesterFlow workflow:
    1. Recon Agent → 2. Attack Agent → 3. Validation Agent → 4. Reporting Agent
    """
    from app.services.agent_orchestrator import AgentOrchestrator
    
    # Handle target resolution
    target_url = scan_in.target_url
    target_id = scan_in.target_id
    auth_credentials = None
    
    if target_id:
        target = db.query(Target).filter(Target.id == target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        target_url = target.base_url
        auth_credentials = target.auth_credentials
    
    if not target_url:
        raise HTTPException(status_code=400, detail="Either target_id or target_url required")
    
    # Create scan record
    scan = Scan(
        target_id=target_id,
        target_url=target_url,
        scan_type=scan_in.scan_type or "full",
        configuration=scan_in.configuration,
        status=ScanStatus.QUEUED
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Run AI orchestrator in background
    async def run_ai_scan(scan_id: str, url: str, creds: dict):
        orchestrator = AgentOrchestrator(scan_id)
        await orchestrator.run_full_scan(url, creds)
    
    background_tasks.add_task(
        lambda: asyncio.run(run_ai_scan(scan.id, target_url, auth_credentials))
    )
    
    return scan


@router.get("/", response_model=List[ScanSummary])
def list_scans(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all scans with optional status filter.
    """
    query = db.query(Scan)
    
    if status:
        query = query.filter(Scan.status == status)
    
    scans = query.order_by(Scan.started_at.desc()).offset(skip).limit(limit).all()
    return scans


@router.get("/{scan_id}", response_model=ScanDetail)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """
    Get detailed scan information including vulnerabilities and agent logs.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/{scan_id}/logs", response_model=List[AgentLogResponse])
def get_scan_logs(scan_id: str, db: Session = Depends(get_db)):
    """
    Get AI agent logs for a specific scan.
    Shows the reasoning chain of all agents.
    """
    from app.models.scan import AgentLog
    
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    logs = db.query(AgentLog).filter(AgentLog.scan_id == scan_id).order_by(AgentLog.timestamp).all()
    return logs


@router.post("/{scan_id}/stop")
def stop_scan(scan_id: str, db: Session = Depends(get_db)):
    """
    Stop a running scan.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    if scan.status not in [ScanStatus.QUEUED, ScanStatus.RUNNING]:
        raise HTTPException(status_code=400, detail="Scan is not running")
    
    scan.status = ScanStatus.FAILED
    db.commit()
    
    return {"message": "Scan stopped", "scan_id": scan_id}


@router.delete("/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    """
    Delete a scan and all its associated data.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    db.delete(scan)
    db.commit()
    
    return {"message": "Scan deleted", "scan_id": scan_id}
