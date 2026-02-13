import logging
from sqlalchemy.orm import Session
from app.models.scan import NetworkAsset, Scan, Vulnerability, SeverityLevel, ActionItem, ScanStatus

class RiskEngine:
    def __init__(self, db: Session):
        self.db = db
        self.logger = logging.getLogger(__name__)

    def calculate_asset_risk(self, asset: NetworkAsset):
        """
        Calculates the risk score for a single asset.
        Formula: (Asset Value * Max Severity) + (Critical Count * 10) + (High Count * 5)
        Asset Value: Critical=10, High=8, Medium=5, Low=2
        Severity: Critical=10, High=8, Medium=5, Low=2
        """
        
        # 1. Determine Asset Value Score
        asset_value_map = {
            "CRITICAL": 10,
            "HIGH": 8,
            "MEDIUM": 5,
            "LOW": 2
        }
        # Default to MEDIUM (5) if not set
        asset_val_score = asset_value_map.get(str(asset.criticality).upper(), 5)

        # 2. Fetch Vulnerabilities for this Asset (IP match)
        # We need to find the latest scan for this asset to get current vulns
        # Or find all OPEN vulnerabilities across recent scans for this IP
        vulns = self.db.query(Vulnerability).filter(
            Vulnerability.host == asset.ip_address,
            Vulnerability.status == "OPEN" # Assuming we use Enum, string for now
        ).all()

        max_severity = 0
        critical_count = 0
        high_count = 0
        medium_count = 0

        severity_scores = {
            SeverityLevel.CRITICAL: 10,
            SeverityLevel.HIGH: 8,
            SeverityLevel.MEDIUM: 5,
            SeverityLevel.LOW: 2,
            SeverityLevel.INFO: 0
        }

        for v in vulns:
            score = severity_scores.get(v.severity, 0)
            if score > max_severity:
                max_severity = score
            
            if v.severity == SeverityLevel.CRITICAL:
                critical_count += 1
            elif v.severity == SeverityLevel.HIGH:
                high_count += 1
            elif v.severity == SeverityLevel.MEDIUM:
                medium_count += 1

        # 3. Calculate Score
        # Base Score = Value * Max Severity
        base_score = asset_val_score * max_severity
        
        # Additive Factors
        additive = (critical_count * 10) + (high_count * 5) + (medium_count * 1)
        
        final_score = base_score + additive
        
        # Cap at 100 for normalization? Or keep raw? 
        # Let's cap at 100 for UI simplicity, but allow overflow internally?
        # For now, let's just return the raw score.
        
        return float(final_score), critical_count, high_count

    def run_analysis(self):
        """
        Iterates over all assets and updates their risk scores.
        Generates Action Items for high-risk assets.
        """
        assets = self.db.query(NetworkAsset).all()
        
        for asset in assets:
            score, crit_count, high_count = self.calculate_asset_risk(asset)
            asset.risk_score = score
            
            # Generate Action Items if Risk is High
            if score > 50: # Threshold
                self._create_action_item(asset, score, crit_count)
        
        self.db.commit()

    def _create_action_item(self, asset, score, crit_count):
        """Creates a prioritized task for the dashboard."""
        # Check if action already exists to avoid spam
        existing = self.db.query(ActionItem).filter(
            ActionItem.description.like(f"%{asset.ip_address}%"),
            ActionItem.status == "OPEN"
        ).first()

        if not existing:
            priority = "MEDIUM"
            if score > 80: priority = "CRITICAL"
            elif score > 60: priority = "HIGH"

            item = ActionItem(
                title=f"Remediate {asset.hostname or asset.ip_address}",
                description=f"Asset {asset.ip_address} has a Risk Score of {score}. Found {crit_count} Critical Vulnerabilities.",
                priority=priority,
                status="OPEN",
                type="remediation",
                created_at=datetime.utcnow()
            )
            # Link to a scan if possible? ActionItem links to Scan... 
            # We might need to make scan_id nullable or link to the latest scan.
            # For now, we leave scan_id null if allowed.
            self.db.add(item)
