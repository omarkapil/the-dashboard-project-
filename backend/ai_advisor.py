from models import Risk

def get_security_advice():
    """
    Generates a 'CEO Summary' of the current security posture based on top risks.
    In a real scenario, this would call the Gemini API.
    """
    # Get top 3 critical risks
    top_risks = Risk.query.filter(Risk.status != 'Closed')\
        .order_by(Risk.custom_score.desc())\
        .limit(3).all()
    
    if not top_risks:
        return "Great job! No critical vulnerabilities detected. Your system appears secure."

    # Mock AI generation
    summary = "CEO SUMMARY: Critical vulnerabilities detected. "
    details = []
    for risk in top_risks:
        details.append(f"Asset '{risk.asset.name}' is exposed to {risk.vulnerability.cve_id} (Score: {risk.custom_score})")
    
    summary += " | ".join(details)
    summary += ". Immediate action required to patch these systems to prevent potential data breaches."
    
    return summary
