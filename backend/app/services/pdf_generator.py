"""
PDF Report Generator - Phase 3
Creates professional, audit-ready security reports
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from datetime import datetime
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class PDFReportGenerator:
    """
    Generates professional PDF security reports from scan data.
    """
    
    @staticmethod
    def generate_report(scan_data: dict) -> BytesIO:
        """
        Main entry point. Takes scan data and returns a PDF file as BytesIO.
        
        scan_data structure:
        {
            "scan_id": int,
            "target": str,
            "completed_at": datetime,
            "risk_score": float,
            "assets": [...],
            "actions": [...],
            "vulnerabilities": [...]
        }
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # === PAGE 1: EXECUTIVE SUMMARY ===
        
        # Title
        title = Paragraph("Security Assessment Report", title_style)
        elements.append(title)
        
        # Meta Information
        meta_data = [
            ["Report Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
            ["Scan Target:", scan_data.get("target", "N/A")],
            ["Scan Completed:", str(scan_data.get("completed_at", "N/A"))],
        ]
        meta_table = Table(meta_data, colWidths=[2*inch, 4*inch])
        meta_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.grey),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Health Score Box
        risk_score = scan_data.get("risk_score", 0)
        grade = PDFReportGenerator._calculate_grade(risk_score)
        grade_color = PDFReportGenerator._get_grade_color(grade)
        
        score_data = [[
            Paragraph(f"<b>Security Health Score</b>", normal_style),
            Paragraph(f"<font size=36 color='{grade_color}'><b>{grade}</b></font>", normal_style),
            Paragraph(f"<b>{int(risk_score)}/100</b>", normal_style)
        ]]
        score_table = Table(score_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f3f4f6')),
            ('BOX', (0, 0), (-1, -1), 2, grade_color),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Executive Summary Text
        elements.append(Paragraph("<b>Executive Summary</b>", heading_style))
        critical_count = len([a for a in scan_data.get("actions", []) if a.get("priority") == "CRITICAL"])
        high_count = len([a for a in scan_data.get("actions", []) if a.get("priority") == "HIGH"])
        asset_count = len(scan_data.get("assets", []))
        
        summary_text = f"""
        This security assessment identified <b>{asset_count} network asset(s)</b> on the target network.
        The overall security posture has been graded as <b><font color='{grade_color}'>{grade}</font></b> 
        ({int(risk_score)}/100).<br/><br/>
        
        <b>{critical_count + high_count}</b> high-priority security issues require immediate attention.
        The following sections detail the findings and recommended actions.
        """
        elements.append(Paragraph(summary_text, normal_style))
        elements.append(Spacer(1, 0.4*inch))
        
        # Key Metrics
        elements.append(Paragraph("<b>Key Metrics</b>", heading_style))
        metrics_data = [
            ["Total Assets Discovered", str(asset_count)],
            ["Critical Priority Actions", str(critical_count)],
            ["High Priority Actions", str(high_count)],
            ["Total Open Ports", str(len(scan_data.get("vulnerabilities", [])))],
        ]
        metrics_table = Table(metrics_data, colWidths=[4*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e5e7eb')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(metrics_table)
        
        # Page Break
        elements.append(PageBreak())
        
        # === PAGE 2: ACTION ITEMS ===
        elements.append(Paragraph("<b>Priority Action Items</b>", heading_style))
        elements.append(Spacer(1, 0.2*inch))
        
        actions = scan_data.get("actions", [])
        if actions:
            action_data = [["Priority", "Action Required", "Details"]]
            for action in actions[:15]:  # Limit to top 15
                priority = action.get("priority", "LOW")
                title = action.get("title", "")
                desc = action.get("description", "")[:100]  # Truncate long descriptions
                action_data.append([priority, title, desc])
            
            action_table = Table(action_data, colWidths=[1*inch, 2.5*inch, 2.5*inch])
            action_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(action_table)
        else:
            elements.append(Paragraph("No critical action items detected. System appears secure.", normal_style))
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_RIGHT
        )
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(
            f"Generated by SME Cyber Dashboard | Confidential | Page 1 of 1",
            footer_style
        ))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def _calculate_grade(score: float) -> str:
        """Calculate letter grade from score."""
        if score >= 80:
            return "A"
        elif score >= 60:
            return "B"
        elif score >= 40:
            return "C"
        elif score >= 20:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def _get_grade_color(grade: str):
        """Get color for grade."""
        color_map = {
            "A": colors.HexColor('#10b981'),  # green
            "B": colors.HexColor('#3b82f6'),  # blue
            "C": colors.HexColor('#eab308'),  # yellow
            "D": colors.HexColor('#f97316'),  # orange
            "F": colors.HexColor('#ef4444'),  # red
        }
        return color_map.get(grade, colors.grey)
