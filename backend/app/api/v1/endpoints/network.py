from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.models.scan import NetworkAsset

router = APIRouter()

# Pydantic Schema
class NetworkAssetResponse(BaseModel):
    id: int
    ip_address: str
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    os_name: Optional[str] = None
    device_type: str
    status: str
    first_seen: datetime
    last_seen: datetime
    open_ports: Optional[str] = None
    criticality: Optional[str] = "MEDIUM"
    risk_score: float = 0.0
    
    class Config:
        from_attributes = True

@router.get("/assets", response_model=List[NetworkAssetResponse])
def get_network_inventory(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all known network assets from the persistent inventory.
    Optional filter by status (active, offline, retired).
    """
    query = db.query(NetworkAsset)
    if status:
        query = query.filter(NetworkAsset.status == status)
    
    # Sort by last_seen descending
    assets = query.order_by(NetworkAsset.last_seen.desc()).all()
    return assets

@router.get("/assets/new", response_model=List[NetworkAssetResponse])
def get_new_devices(db: Session = Depends(get_db)):
    """
    Get devices discovered in the last 24 hours.
    """
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(hours=24)
    
    assets = db.query(NetworkAsset).filter(
        NetworkAsset.first_seen >= cutoff
    ).order_by(NetworkAsset.first_seen.desc()).all()
    return assets

@router.get("/activity")
def get_recent_activity(limit: int = 20, db: Session = Depends(get_db)):
    """
    Get recent security events and activity.
    Returns action items marked as alerts/new_device.
    """
    from app.models.scan import ActionItem
    
    events = db.query(ActionItem).filter(
        ActionItem.type.in_(["new_device", "alert"])
    ).order_by(ActionItem.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "type": e.type,
            "title": e.title,
            "description": e.description,
            "priority": e.priority,
            "timestamp": e.created_at
        }
        for e in events
    ]
