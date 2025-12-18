from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class ScanStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True)
    scan_type = Column(String, default="quick") # quick, full
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING)
    risk_score = Column(Float, default=0.0) # 0-10 or A-F logic handled in separate mapping
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    assets = relationship("ScanAsset", back_populates="scan", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")

class ScanAsset(Base):
    __tablename__ = "scan_assets"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    
    ip_address = Column(String, index=True)
    hostname = Column(String, nullable=True)
    mac_address = Column(String, nullable=True)
    os_name = Column(String, nullable=True)
    device_type = Column(String, default="unknown") # server, router, workstation, unknown
    
    # Phase 2: Tracking fields
    is_new = Column(String, default="false") # "true" if first time seen
    
    scan = relationship("Scan", back_populates="assets")

# Persistent Network Inventory (Phase 2)
class NetworkAsset(Base):
    """
    Persistent inventory of all discovered devices.
    This allows tracking devices across multiple scans.
    """
    __tablename__ = "network_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    mac_address = Column(String, nullable=True, index=True)
    hostname = Column(String, nullable=True)
    os_name = Column(String, nullable=True)
    device_type = Column(String, default="unknown")
    status = Column(String, default="active") # active, offline, retired
    
    # Tracking
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    # Open ports snapshot (JSON string for simplicity)
    open_ports = Column(String, nullable=True) # e.g., "22,80,443"


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    
    host = Column(String)
    port = Column(Integer, nullable=True)
    protocol = Column(String, nullable=True) # tcp/udp
    service = Column(String, nullable=True) # http, ssh
    cve_id = Column(String, nullable=True)
    severity = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(String, nullable=True)
    remediation = Column(String, nullable=True) # AI generated or static

    scan = relationship("Scan", back_populates="vulnerabilities")

class ActionItem(Base):
    __tablename__ = "action_items"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    
    title = Column(String)
    description = Column(String)
    priority = Column(String) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String, default="OPEN") # OPEN, IN_PROGRESS, RESOLVED, IGNORED
    type = Column(String) # patch, configuration, investigation
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scan = relationship("Scan", back_populates="actions")

# Update Scan relationship
Scan.actions = relationship("ActionItem", back_populates="scan", cascade="all, delete-orphan")
