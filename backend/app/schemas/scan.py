from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ScanStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class VulnerabilityBase(BaseModel):
    host: str
    port: Optional[int] = None
    protocol: Optional[str] = None
    service: Optional[str] = None
    severity: str
    description: Optional[str] = None
    remediation: Optional[str] = None

class Vulnerability(VulnerabilityBase):
    id: int
    scan_id: int

    class Config:
        from_attributes = True

class ScanAssetBase(BaseModel):
    ip_address: str
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    os_name: Optional[str] = None
    device_type: Optional[str] = "unknown"

class ScanAsset(ScanAssetBase):
    id: int
    scan_id: int

    class Config:
        from_attributes = True

class ScanBase(BaseModel):
    target: str
    scan_type: str = "quick"

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    id: int
    status: ScanStatus
    risk_score: float
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    type: Optional[str] = None

class ActionItem(ActionItemBase):
    id: int
    scan_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScanDetail(ScanResponse):
    vulnerabilities: List[Vulnerability] = []
    assets: List[ScanAsset] = []
    actions: List[ActionItem] = []
