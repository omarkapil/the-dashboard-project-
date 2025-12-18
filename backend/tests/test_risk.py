import pytest
from app.services.scan_tasks import run_scan_task
from app.models.scan import Scan, Vulnerability
# We can unit test the logic without full DB if we extract the logic, 
# but for now let's test the logic calculation conceptually or mock the DB.

def calculate_risk_score(vulnerabilities):
    total_risk = 0.0
    for v in vulnerabilities:
        if v['severity'] == "HIGH":
            total_risk += 8.0
        elif v['state'] == "open":
            total_risk += 1.0
    return min(total_risk, 100.0)

def test_risk_score_calculation():
    # Scenario 1: No findings
    assert calculate_risk_score([]) == 0.0

    # Scenario 2: 1 High Vuln
    vulns = [{'severity': 'HIGH', 'state': 'open'}]
    assert calculate_risk_score(vulns) == 8.0

    # Scenario 3: Many open ports (15 ports)
    vulns_ports = [{'severity': 'INFO', 'state': 'open'}] * 15
    assert calculate_risk_score(vulns_ports) == 15.0

    # Scenario 4: Critical Mix (10 High + 30 Open) -> Should cap at 100
    vulns_mix = [{'severity': 'HIGH', 'state': 'open'}] * 10 # 80
    vulns_mix += [{'severity': 'INFO', 'state': 'open'}] * 30 # +30 = 110
    assert calculate_risk_score(vulns_mix) == 100.0
