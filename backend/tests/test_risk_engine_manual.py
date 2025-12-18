
from app.services.risk_engine import RiskCalculator, ActionGenerator
import json

# Mock Data
mock_scan_data = {
    "assets": [
        {
            "ip": "192.168.1.10",
            "ports": [
                {"port": 80, "state": "open", "service": "http"},
                {"port": 23, "state": "open", "service": "telnet"}, # High Risk
                {"port": 445, "state": "open", "service": "microsoft-ds"} # Critical Risk
            ]
        }
    ],
    "vulnerabilities": [
        {
            "host": "192.168.1.10",
            "severity": "HIGH",
            "description": "Old Apache Version",
            "cve_id": "CVE-2023-XXXX"
        }
    ]
}

def test_risk_engine():
    print("Testing Risk Engine...")
    
    # 1. Test Score
    score = RiskCalculator.calculate(mock_scan_data)
    print(f"Calculated Score: {score}")
    
    # Expected: 100 - 15 (Telnet) - 15 (SMB) - 10 (High Vuln) = 60
    assert score <= 70, f"Score {score} is too high!"
    print("✅ Score Calculation Verified")

    # 2. Test Actions
    actions = ActionGenerator.generate_actions(mock_scan_data)
    print(f"Generated {len(actions)} Actions:")
    for a in actions:
        print(f" - [{a['priority']}] {a['title']}")

    assert any(a['title'] == "Disable Telnet on 192.168.1.10" for a in actions)
    assert any(a['title'] == "Check SMB Security on 192.168.1.10" for a in actions)
    print("✅ Action Generation Verified")

if __name__ == "__main__":
    test_risk_engine()
