"""
PentesterFlow API Endpoints - Targets
Manage scanning targets
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.scan import Target
from app.schemas.scan import TargetCreate, TargetResponse, TargetDetail

router = APIRouter()


@router.post("/", response_model=TargetResponse)
def create_target(target_in: TargetCreate, db: Session = Depends(get_db)):
    """
    Create a new target for scanning.
    """
    # Check if target with same URL already exists
    existing = db.query(Target).filter(Target.base_url == target_in.base_url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Target with this URL already exists")
    
    target = Target(
        name=target_in.name,
        base_url=target_in.base_url,
        auth_method=target_in.auth_method,
        auth_credentials=target_in.auth_credentials
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    
    return target


@router.get("/", response_model=List[TargetResponse])
def list_targets(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    List all targets.
    """
    targets = db.query(Target).order_by(Target.created_at.desc()).offset(skip).limit(limit).all()
    return targets


@router.get("/{target_id}", response_model=TargetDetail)
def get_target(target_id: str, db: Session = Depends(get_db)):
    """
    Get detailed target information including endpoints and scan history.
    """
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target


@router.patch("/{target_id}", response_model=TargetResponse)
def update_target(target_id: str, target_update: TargetCreate, db: Session = Depends(get_db)):
    """
    Update target details.
    """
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    target.name = target_update.name
    target.base_url = target_update.base_url
    target.auth_method = target_update.auth_method
    target.auth_credentials = target_update.auth_credentials
    
    db.commit()
    db.refresh(target)
    
    return target


@router.delete("/{target_id}")
def delete_target(target_id: str, db: Session = Depends(get_db)):
    """
    Delete a target and all associated data.
    """
    target = db.query(Target).filter(Target.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db.delete(target)
    db.commit()
    
    return {"message": "Target deleted", "target_id": target_id}
