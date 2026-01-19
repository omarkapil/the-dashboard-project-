"""
PentesterFlow API Endpoints - Vulnerabilities
Manage discovered vulnerabilities
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.scan import Vulnerability, VulnStatus
from app.schemas.scan import VulnerabilityResponse, VulnerabilityUpdate

router = APIRouter()


@router.get("/", response_model=List[VulnerabilityResponse])
def list_vulnerabilities(
    skip: int = 0, 
    limit: int = 100,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    scan_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all vulnerabilities with optional filters.
    """
    query = db.query(Vulnerability)
    
    if severity:
        query = query.filter(Vulnerability.severity == severity)
    if status:
        query = query.filter(Vulnerability.status == status)
    if scan_id:
        query = query.filter(Vulnerability.scan_id == scan_id)
    
    vulns = query.order_by(Vulnerability.created_at.desc()).offset(skip).limit(limit).all()
    return vulns


@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability(vuln_id: str, db: Session = Depends(get_db)):
    """
    Get detailed vulnerability information.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vuln


@router.patch("/{vuln_id}", response_model=VulnerabilityResponse)
def update_vulnerability(vuln_id: str, vuln_update: VulnerabilityUpdate, db: Session = Depends(get_db)):
    """
    Update vulnerability status (e.g., mark as false positive, fixed).
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    if vuln_update.status:
        vuln.status = vuln_update.status
    if vuln_update.remediation:
        vuln.remediation = vuln_update.remediation
    
    db.commit()
    db.refresh(vuln)
    
    return vuln


@router.get("/{vuln_id}/poc")
def get_proof_of_concept(vuln_id: str, db: Session = Depends(get_db)):
    """
    Get proof of concept script for a vulnerability.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    return {
        "vulnerability_id": vuln_id,
        "type": vuln.type,
        "proof_of_concept": vuln.proof_of_concept or "No PoC generated yet",
        "remediation": vuln.remediation or "No remediation available"
    }


@router.post("/{vuln_id}/revalidate")
async def revalidate_vulnerability(vuln_id: str, db: Session = Depends(get_db)):
    """
    Re-run AI validation on a vulnerability.
    """
    from app.services.agent_orchestrator import ValidationAgent
    
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    # Create validation agent and re-validate
    validator = ValidationAgent(vuln.scan_id, db)
    
    finding = {
        "type": vuln.type,
        "url": vuln.url,
        "severity": vuln.severity.value if hasattr(vuln.severity, 'value') else vuln.severity,
        "description": vuln.description,
        "evidence": vuln.evidence,
        "confidence": vuln.confidence_score or 0.5
    }
    
    result = await validator.execute({"findings": [finding]})
    
    return {
        "vulnerability_id": vuln_id,
        "validation_result": result
    }
