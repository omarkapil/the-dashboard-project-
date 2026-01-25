from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.scan import Vulnerability, VulnStatus
from app.schemas.scan import VulnerabilityResponse, VulnerabilityUpdate, ScanResponse
from app.services.agent_orchestrator import AgentOrchestrator

router = APIRouter()

@router.get("/", response_model=List[VulnerabilityResponse])
def list_vulnerabilities(
    scan_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    host: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List vulnerabilities with optional filtering.
    """
    query = db.query(Vulnerability)
    
    if scan_id:
        query = query.filter(Vulnerability.scan_id == scan_id)
    if severity:
        query = query.filter(Vulnerability.severity == severity)
    if status:
        query = query.filter(Vulnerability.status == status)
    if host:
        query = query.filter(Vulnerability.host == host)
        
    return query.limit(limit).all()

@router.get("/{vuln_id}", response_model=VulnerabilityResponse)
def get_vulnerability(vuln_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific vulnerability.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vuln

@router.patch("/{vuln_id}", response_model=VulnerabilityResponse)
def update_vulnerability(vuln_id: str, vuln_in: VulnerabilityUpdate, db: Session = Depends(get_db)):
    """
    Update vulnerability details (e.g. status, false positive flag).
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
        
    update_data = vuln_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vuln, field, value)
        
    db.commit()
    db.refresh(vuln)
    return vuln

@router.get("/{vuln_id}/poc")
def get_proof_of_concept(vuln_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the generated Proof of Concept (PoC) for a vulnerability.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    return {
        "id": vuln.id,
        "type": vuln.type,
        "proof_of_concept": vuln.proof_of_concept,
        "remediation": vuln.remediation
    }

@router.post("/{vuln_id}/revalidate")
async def revalidate_vulnerability(vuln_id: str, db: Session = Depends(get_db)):
    """
    Trigger the ValidationAgent to re-verify this specific vulnerability using the LLM.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    # Run Single Validation (simplified orchestrator call)
    from app.services.agent_orchestrator import ValidationAgent
    agent = ValidationAgent(vuln.scan_id, db)
    
    # We construct a synthetic finding context
    finding = {
        "type": vuln.type,
        "severity": vuln.severity,
        "url": vuln.url,
        "parameter": vuln.parameter,
        "evidence": vuln.evidence
    }
    
    result = await agent._validate_with_llm(finding)
    
    # Update DB
    vuln.ai_validation_result = result
    vuln.confidence_score = result.get("confidence_score")
    if not result.get("is_valid"):
        vuln.status = VulnStatus.FALSE_POSITIVE
        
    db.commit()
    
    return result

@router.patch("/{vuln_id}/workflow")
def update_workflow(vuln_id: str, ticket_id: Optional[str] = None, assigned_to: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Update workflow fields: Status, Assignment, Ticket ID.
    """
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
        
    if ticket_id is not None:
        vuln.ticket_id = ticket_id
    if assigned_to is not None:
        vuln.assigned_to = assigned_to
    if status is not None:
        vuln.status = status
        
    db.commit()
    return vuln
