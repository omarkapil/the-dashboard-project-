"""
PentesterFlow Pydantic Schemas
Request/Response models for API endpoints
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class ScanStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SeverityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class VulnStatus(str, Enum):
    OPEN = "open"
    FIXED = "fixed"
    FALSE_POSITIVE = "false_positive"
    ACCEPTED = "accepted"


# ============================================================================
# TARGET SCHEMAS
# ============================================================================

class TargetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    base_url: str
    auth_method: Optional[str] = None
    auth_credentials: Optional[Dict[str, Any]] = None


class TargetResponse(BaseModel):
    id: str
    name: str
    base_url: str
    tech_stack: Optional[Dict[str, Any]] = None
    auth_method: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TargetDetail(TargetResponse):
    endpoints: List["EndpointResponse"] = []
    scans: List["ScanSummary"] = []


# ============================================================================
# SCAN SCHEMAS
# ============================================================================

class ScanCreate(BaseModel):
    target_id: Optional[str] = None
    target_url: Optional[str] = None  # Legacy support
    scan_type: str = "full"
    configuration: Optional[Dict[str, Any]] = None


class ScanSummary(BaseModel):
    id: str
    status: ScanStatus
    scan_type: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    risk_score: float = 0.0

    class Config:
        from_attributes = True


class ScanResponse(ScanSummary):
    target_id: Optional[str] = None
    target_url: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScanDetail(ScanResponse):
    agent_thoughts: Optional[Dict[str, Any]] = None
    vulnerabilities: List["VulnerabilityResponse"] = []
    agent_logs: List["AgentLogResponse"] = []
    assets: List["ScanAssetResponse"] = []
    actions: List["ActionItemResponse"] = []


# ============================================================================
# VULNERABILITY SCHEMAS
# ============================================================================

class VulnerabilityBase(BaseModel):
    type: Optional[str] = None
    severity: SeverityLevel = SeverityLevel.LOW
    url: str
    parameter: Optional[str] = None
    description: Optional[str] = None


class VulnerabilityCreate(VulnerabilityBase):
    scan_id: str
    evidence: Optional[Dict[str, Any]] = None


class VulnerabilityResponse(VulnerabilityBase):
    id: str
    scan_id: str
    status: VulnStatus
    confidence_score: Optional[float] = None
    ai_validation_result: Optional[Dict[str, Any]] = None
    proof_of_concept: Optional[str] = None
    remediation: Optional[str] = None
    created_at: datetime
    
    # Legacy fields
    host: Optional[str] = None
    port: Optional[int] = None
    service: Optional[str] = None
    cve_id: Optional[str] = None

    class Config:
        from_attributes = True


class VulnerabilityUpdate(BaseModel):
    status: Optional[VulnStatus] = None
    remediation: Optional[str] = None


# ============================================================================
# AGENT LOG SCHEMAS
# ============================================================================

class AgentLogCreate(BaseModel):
    scan_id: str
    agent_name: str
    action: str
    reasoning: Optional[Dict[str, Any]] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None


class AgentLogResponse(BaseModel):
    id: str
    scan_id: str
    agent_name: str
    action: str
    reasoning: Optional[Dict[str, Any]] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINT SCHEMAS
# ============================================================================

class EndpointCreate(BaseModel):
    target_id: str
    url: str
    method: str = "GET"
    parameters: Optional[Dict[str, Any]] = None
    authentication_required: bool = False


class EndpointResponse(BaseModel):
    id: str
    target_id: str
    url: str
    method: str
    parameters: Optional[Dict[str, Any]] = None
    authentication_required: bool
    discovered_at: datetime
    last_tested: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# LEGACY SCHEMAS (backward compatibility)
# ============================================================================

class ScanAssetResponse(BaseModel):
    id: int
    scan_id: str
    ip_address: str
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    os_name: Optional[str] = None
    device_type: str = "unknown"

    class Config:
        from_attributes = True


class ActionItemResponse(BaseModel):
    id: int
    scan_id: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Forward reference updates
TargetDetail.model_rebuild()
ScanDetail.model_rebuild()
