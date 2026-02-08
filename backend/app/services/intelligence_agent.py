import logging
import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.scan import ScanAsset
from app.core.config import settings
import google.generativeai as genai

logger = logging.getLogger(__name__)

class IntelligenceAgent:
    """
    Artificial Intelligence Agent specialized in "reasoning" about network assets.
    Uses Gemini to translate technical discovery data into human-readable insights.
    """
    
    def __init__(self, db: Session):
        self.db = db
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')

    def analyze_asset(self, scan_id: str, asset: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a single asset's discovery data to generate security insights.
        """
        try:
            # Prepare technical context for the LLM
            prompt = f"""
            As a Senior Security Architect for an SME Cyber Dashboard named "found 404", 
            analyze the following technical discovery data for a network device and provide 
            a human-readable "Identity & Risk Synthesis".

            TECHNICAL DATA (JSON):
            {json.dumps(asset, indent=2)}

            GOALS:
            1. Identify what this device likely is (e.g., HR Laptop, Database Server, Unknown IoT).
            2. Explain its role in the network.
            3. Highlight the MOST CRITICAL risk based on its open ports and OS.
            4. Provide a "Security Tip" for a non-technical business owner.

            OUTPUT FORMAT (JSON):
            {{
                "classification": "Brief device category",
                "role_analysis": "What this device does in the business",
                "risk_synthesis": "Plain-English risk description",
                "lateral_movement_risk": "How an attacker might use this device to move elsewhere",
                "security_tip": "One actionable advice"
            }}
            """

            response = self.model.generate_content(prompt)
            
            # Clean up response (handle potential markdown formatting)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:-3].strip()
            elif text.startswith('```'):
                text = text[3:-3].strip()
            
            insight = json.loads(text)
            
            # Update the database record
            db_asset = self.db.query(ScanAsset).filter(
                ScanAsset.scan_id == scan_id,
                ScanAsset.ip_address == asset.get('ip')
            ).first()
            
            if db_asset:
                db_asset.ai_insight = insight
                self.db.commit()
                logger.info(f"Generated AI Insight for {asset.get('ip')}")
            
            return insight

        except Exception as e:
            logger.error(f"Intelligence Agent analysis failed: {e}")
            return {
                "classification": asset.get('device_type', 'Unknown Device'),
                "role_analysis": "Analysis pending deep synthesis.",
                "risk_synthesis": "Potential exposure on open ports detected.",
                "lateral_movement_risk": "Standard pivoting risk.",
                "security_tip": "Keep all services updated to the latest version."
            }

    def batch_analyze(self, scan_id: str, assets: List[Dict[str, Any]]):
        """
        Batch process all assets from a scan.
        """
        for asset in assets:
            self.analyze_asset(scan_id, asset)
