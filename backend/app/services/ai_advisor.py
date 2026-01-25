import google.generativeai as genai
from app.core.config import settings
from app.models.scan import Scan
import logging

logger = logging.getLogger(__name__)

class AIAdvisor:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception:
                self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
        else:
            logger.warning("GEMINI_API_KEY not set. Using AI Advisor Demo Mode.")
            self.model = None

    async def generate_report(self, scan: Scan):
        if not self.model:
            # Demo Mode Response
            return f"""# Executive Security Summary (DEMO MODE)

**Assessment Date:** {scan.completed_at or 'Today'}
**Target:** {scan.target}

## 1. Executive Summary
The security assessment of **{scan.target}** identified **{len(scan.vulnerabilities)}** potential issues. The overall security posture is **Moderate**. Immediate attention is recommended for exposed services that may not require public access.

## 2. Risk Analysis
The calculated Risk Score is **{scan.risk_score} / 100**.
- **Critical/High Risks**: {len([v for v in scan.vulnerabilities if v.severity in ['HIGH', 'CRITICAL']])} found.
- **Open Ports**: {len(scan.vulnerabilities)} services detected.

## 3. Recommended Actions
1.  **Review Firewall Rules**: Restrict access to strictly necessary ports only.
2.  **Patch Management**: Ensure all detected services ({', '.join(set([v.service for v in scan.vulnerabilities][:3]))}) are updated to the latest stable versions.
3.  **Network Segmentation**: Isolate critical assets from the public-facing interface.

*Note: This is a generated sample report because no valid GEMINI_API_KEY was provided.*"""

        # Construct prompt
        vuln_summary = "\n".join([
            f"- {v.service} (Port {v.port}): {v.severity} - {v.description}"
            for v in scan.vulnerabilities
        ])
        
        prompt = f"""
        You are a Cyber Security Expert communicating to a non-technical CEO.
        Analyze the following scan results for target: {scan.target}
        
        Vulnerabilities found:
        {vuln_summary}

        Please provide:
        1. An Executive Summary (1-2 sentences, simple language).
        2. A 'risk score' explanation (why is it High/Medium/Low?).
        3. 3 Actionable Steps to fix the most critical issues.
        
        Tone: Professional, calm, but urgent if high risks exist. Avoid jargon where possible.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API failed: {e}")
            return "Error generating AI report."
