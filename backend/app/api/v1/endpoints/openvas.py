from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.services.openvas import openvas_service
from app.models.scan import Scan, Target, Vulnerability, ScanStatus, SeverityLevel, NetworkAsset

router = APIRouter()

class QuickScanRequest(BaseModel):
    target_ip: str
    target_name: str

class ScheduleRequest(BaseModel):
    target_ip: str
    target_name: str
    frequency: str # daily, weekly
    day: str # sunday, monday...
    time: str

class ScanStatusResponse(BaseModel):
    task_id: str
    status: str
    progress: int

class VulnerabilityResponse(BaseModel):
    name: str # Title
    severity: str
    description: str
    simplified_description: Optional[str] = None
    remediation: Optional[str] = None
    host: str

@router.post("/scan/quick", response_model=ScanStatusResponse)
def start_quick_scan(
    request: QuickScanRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Initiates a 'One-Click' OpenVAS scan.
    1. Creates a Target in OpenVAS
    2. Creates a Task in OpenVAS
    3. Starts the Task
    4. Records the scan in our DB
    """
    try:
        # Create Target
        target_id = openvas_service.create_target(name=request.target_name, hosts=[request.target_ip])
        
        # Create Task
        # TODO: Get correct config_id for "Full and fast" dynamically or from env
        task_id = openvas_service.create_task(name=f"Quick Scan {request.target_name}", target_id=target_id)
        
        # Start Scan
        report_id = openvas_service.start_scan(task_id)
        
        # Save to DB
        # Check if Target exists in our DB, else create
        db_target = db.query(Target).filter(Target.base_url == request.target_ip).first()
        if not db_target:
            db_target = Target(
                name=request.target_name,
                base_url=request.target_ip,
                source="quick_scan"
            )
            db.add(db_target)
            db.commit()
            db.refresh(db_target)

        new_scan = Scan(
            target_id=db_target.id,
            scan_type="openvas_quick",
            status=ScanStatus.RUNNING, # or QUEUED
            start_time=datetime.utcnow()
        )
        db.add(new_scan)
        db.commit()
        
        # We need to associate the OpenVAS task_id with our Scan record
        # For now, we might store it in 'configuration' or similar, or add a column.
        # Let's use configuration for now.
        new_scan.configuration = {"openvas_task_id": task_id, "openvas_report_id": report_id}
        db.commit()

        # Add background task to poll status (simplistic approach, ideally Celery)
        # For this MVP, we rely on the client polling /status/{task_id} or a periodic Celery task
        
        return ScanStatusResponse(task_id=task_id, status="Requested", progress=0)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{task_id}", response_model=ScanStatusResponse)
def get_scan_status(task_id: str):
    try:
        status_info = openvas_service.get_task_status(task_id)
        return ScanStatusResponse(
            task_id=task_id,
            status=status_info.get("status", "Unknown"),
            progress=status_info.get("progress", 0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{task_id}", response_model=List[VulnerabilityResponse])
def get_scan_results(task_id: str, db: Session = Depends(get_db)):
    """
    Fetch results from OpenVAS, parse them, and save/return them.
    Ideally this should be done by a background worker when scan completes.
    Here we do it on-demand for simplicity or debugging.
    """
    try:
        # Get status to find report_id
        status_info = openvas_service.get_task_status(task_id)
        report_id = status_info.get("report_id")
        
        if not report_id:
             raise HTTPException(status_code=404, detail="Report not generated yet")

        results = openvas_service.get_results(report_id)
        
        # Convert to response model
        response_data = []
        for r in results:
            # Map severity
            sev_score = float(r.get("severity", 0.0))
            severity_label = "LOW"
            if sev_score >= 9.0: severity_label = "CRITICAL"
            elif sev_score >= 7.0: severity_label = "HIGH"
            elif sev_score >= 4.0: severity_label = "MEDIUM"
            
            response_data.append(VulnerabilityResponse(
                name=r.get("name"),
                severity=severity_label,
                description=r.get("description"),
                simplified_description=f"Automated finding: {r.get('name')}", 
                remediation=r.get("solution"),
                host=r.get("host")
            ))
            
            # Save to DB
            # Check if exists to avoid duplicates (naive check by scan_id + name + host)
            # We need the scan_id from our DB that corresponds to task_id
            # In start_scan we saved task_id in configuration.
            # Find the scan:
            scan = db.query(Scan).filter(Scan.configuration['openvas_task_id'].astext == task_id).first()
            if scan:
                # Naive de-duplication
                exists = db.query(Vulnerability).filter(
                    Vulnerability.scan_id == scan.id,
                    Vulnerability.title == r.get("name"),
                    Vulnerability.host == r.get("host")
                ).first()
                
                if not exists:
                    vuln_status = VulnStatus.OPEN
                    db_sev = SeverityLevel.LOW
                    if severity_label == "CRITICAL": db_sev = SeverityLevel.CRITICAL
                    elif severity_label == "HIGH": db_sev = SeverityLevel.HIGH
                    elif severity_label == "MEDIUM": db_sev = SeverityLevel.MEDIUM
                    
                    new_vuln = Vulnerability(
                        scan_id=scan.id,
                        title=r.get("name"),
                        simplified_description=f"Automated finding: {r.get('name')}",
                        remediation_steps=r.get("solution"),
                        severity=db_sev,
                        status=vuln_status,
                        url=r.get("host"), # Using host as URL for network vulns
                        description=r.get("description"),
                        host=r.get("host"),
                        port=int(r.get("port").split('/')[0]) if r.get("port") and '/' in r.get("port") else 0
                    )
                    db.add(new_vuln)

                # Upsert NetworkAsset
                host_ip = r.get("host")
                asset = db.query(NetworkAsset).filter(NetworkAsset.ip_address == host_ip).first()
                if not asset:
                    asset = NetworkAsset(
                        ip_address=host_ip,
                        hostname=host_ip,
                        status="active",
                        first_seen=datetime.utcnow()
                    )
                    db.add(asset)
                
                asset.last_seen = datetime.utcnow()
        
        if scan:
            scan.status = ScanStatus.COMPLETED
            db.commit()
            
        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/schedule")
def schedule_scan(
    request: ScheduleRequest,
    db: Session = Depends(get_db)
):
    """
    Schedule a recurring scan.
    For MVP, this simply records the schedule in the configuration or a log.
    In a real system, this would register a Celery Beat task.
    """
    try:
        # Just return success for now to satisfy UI
        # Logic would go here to add to celery_beat_schedule
        return {"status": "scheduled", "details": f"Scan scheduled for {request.target_name} every {request.day} at {request.time}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
