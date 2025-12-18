from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.scan import Scan
from app.schemas.scan import ScanCreate, ScanResponse, ScanDetail
from app.services.scan_tasks import run_scan_task

router = APIRouter()

@router.post("/", response_model=ScanResponse)
def create_scan(scan_in: ScanCreate, db: Session = Depends(get_db)):
    """
    Create a new scan and start it in the background.
    """
    scan = Scan(target=scan_in.target, scan_type=scan_in.scan_type)
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Trigger Celery Task
    run_scan_task.delay(scan_id=scan.id)
    
    return scan

@router.get("/", response_model=List[ScanResponse])
def read_scans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve scans.
    """
    scans = db.query(Scan).offset(skip).limit(limit).all()
    return scans

@router.get("/{scan_id}", response_model=ScanDetail)
def read_scan(scan_id: int, db: Session = Depends(get_db)):
    """
    Get specific scan details including vulnerabilities.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
