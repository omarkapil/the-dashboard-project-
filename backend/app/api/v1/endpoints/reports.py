from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scan import Scan
from app.services.ai_advisor import AIAdvisor
from app.services.pdf_generator import PDFReportGenerator
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ReportResponse(BaseModel):
    scan_id: str
    ai_analysis: str

@router.get("/{scan_id}", response_model=ReportResponse)
async def get_report(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    advisor = AIAdvisor()
    # Note: In production, this might be cached or stored in DB.
    # For MVP, we generate on fly or check if we store it (we didn't add report_text field yet, maybe later).
    # Since generate_report is blocking/sync wrapper for now (or async?), `generate_content` is sync by default unless async method used.
    # Making the route async allows FastAPI to run it in threadpool.
    
    analysis = await advisor.generate_report(scan)
    
    return ReportResponse(scan_id=scan.id, ai_analysis=analysis)

@router.get("/{scan_id}/pdf")
def download_pdf_report(scan_id: str, db: Session = Depends(get_db)):
    """
    Generate and download a professional PDF security report.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Resolve target URL safely
    target_name = "unknown_target"
    if scan.target and scan.target.base_url:
        target_name = scan.target.base_url
    elif scan.target_url:
        target_name = scan.target_url

    # Prepare scan data for PDF
    scan_data = {
        "scan_id": scan.id,
        "target": target_name,
        "completed_at": scan.completed_at,
        "risk_score": scan.risk_score,
        "assets": [
            {
                "ip": a.ip_address,
                "hostname": a.hostname,
                "device_type": a.device_type
            }
            for a in scan.assets
        ],
        "actions": [
            {
                "title": action.title,
                "description": action.description,
                "priority": action.priority,
                "type": action.type
            }
            for action in scan.actions
        ],
        "vulnerabilities": [
            {
                "host": v.host,
                "port": v.port,
                "service": v.service,
                "severity": v.severity
            }
            for v in scan.vulnerabilities
        ]
    }
    
    # Generate PDF
    pdf_buffer = PDFReportGenerator.generate_report(scan_data)
    
    # Return as downloadable file
    safe_filename = target_name.replace('https://', '').replace('http://', '').replace('/', '_').replace(':', '')
    filename = f"security_report_{safe_filename}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
