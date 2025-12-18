"""
Comprehensive System Test - OpenVAS Integration
Tests all backend APIs and functionality
"""
import requests
import json
import time

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"

def test_login():
    """Test login functionality"""
    print("\n=== Testing Login ===")
    response = requests.post(LOGIN_URL, json={
        "username": "admin",
        "password": "admin123"
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful")
        print(f"   Token: {data['access_token'][:20]}...")
        print(f"   User: {data['username']} ({data['role']})")
        return data['access_token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_dashboard(token):
    """Test dashboard data endpoint"""
    print("\n=== Testing Dashboard API ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Dashboard data retrieved")
        print(f"   Total Assets: {len(data.get('assets', []))}")
        print(f"   Total Risks: {data.get('total_risks', 0)}")
        print(f"   Risk Score: {data.get('risk_score', 0)}")
        return data
    else:
        print(f"❌ Dashboard failed: {response.text}")
        return None

def test_scan_status(token):
    """Test scan status endpoint"""
    print("\n=== Testing Scan Status ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/scan/status", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Scan status retrieved")
        print(f"   Is Scanning: {data.get('is_scanning', False)}")
        return data
    else:
        print(f"❌ Scan status failed: {response.text}")
        return None

def test_topology(token):
    """Test network topology endpoint"""
    print("\n=== Testing Network Topology ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/topology", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Topology data retrieved")
        print(f"   Nodes: {len(data.get('nodes', []))}")
        print(f"   Links: {len(data.get('links', []))}")
        if data.get('nodes'):
            print(f"   Sample nodes:")
            for node in data['nodes'][:3]:
                print(f"     - {node.get('label', 'Unknown')} ({node.get('type', 'N/A')})")
        return data
    else:
        print(f"❌ Topology failed: {response.text}")
        return None

def test_device_details(token, device_id=1):
    """Test device details endpoint"""
    print(f"\n=== Testing Device Details (ID: {device_id}) ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/device/{device_id}", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Device details retrieved")
        print(f"   Name: {data.get('name', 'Unknown')}")
        print(f"   IP: {data.get('ip_address', 'N/A')}")
        print(f"   OS: {data.get('os_type', 'Unknown')} {data.get('os_version', '')}")
        print(f"   Hostname: {data.get('hostname', 'N/A')}")
        print(f"   MAC: {data.get('mac_address', 'N/A')}")
        print(f"   Open Ports: {len(data.get('open_ports', []))}")
        print(f"   Vulnerabilities: {len(data.get('vulnerabilities', []))}")
        if data.get('risk_summary'):
            rs = data['risk_summary']
            print(f"   Risk Summary:")
            print(f"     Total: {rs.get('total', 0)}")
            print(f"     Open: {rs.get('open', 0)}")
            print(f"     Critical: {rs.get('critical', 0)}")
            print(f"     Risk Score: {rs.get('total_risk_score', 0):.2f}")
        
        # Display port details
        if data.get('open_ports'):
            print(f"\n   Port Details:")
            for port in data['open_ports'][:5]:  # Show first 5
                print(f"     {port.get('port')}/{port.get('protocol')} - {port.get('service')} ({port.get('product', '')} {port.get('version', '')})")
        
        return data
    else:
        print(f"❌ Device details failed: {response.text}")
        if response.status_code == 404:
            print(f"   Device ID {device_id} not found. Trying to list assets...")
            return None
        return None

def test_external_risk(token):
    """Test external risk (Shodan) endpoint"""
    print("\n=== Testing External Risk API ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/external-risk", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ External risk data retrieved")
        print(f"   Data: {json.dumps(data, indent=2)}")
        return data
    else:
        print(f"❌ External risk failed: {response.text}")
        return None

def run_all_tests():
    """Run all system tests"""
    print("=" * 60)
    print("COMPREHENSIVE SYSTEM TEST - OpenVAS Integration")
    print("=" * 60)
    
    # Test 1: Login
    token = test_login()
    if not token:
        print("\n❌ CRITICAL: Login failed. Cannot continue tests.")
        return False
    
    # Test 2: Dashboard
    dashboard_data = test_dashboard(token)
    
    # Test 3: Scan Status
    scan_status = test_scan_status(token)
    
    # Test 4: Network Topology
    topology_data = test_topology(token)
    
    # Test 5: Device Details
    # Try to get device ID from topology or dashboard
    device_id = None
    if topology_data and topology_data.get('nodes'):
        for node in topology_data['nodes']:
            if node.get('id') != 'central-switch' and isinstance(node.get('id'), int):
                device_id = node['id']
                break
    
    if device_id:
        device_details = test_device_details(token, device_id)
    else:
        print("\n⚠️  No device IDs found in topology. Trying device ID 1...")
        device_details = test_device_details(token, 1)
    
    # Test 6: External Risk
    external_risk = test_external_risk(token)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    results = {
        "Login": token is not None,
        "Dashboard": dashboard_data is not None,
        "Scan Status": scan_status is not None,
        "Topology": topology_data is not None,
        "Device Details": device_details is not None,
        "External Risk": external_risk is not None
    }
    
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test:20s}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    return all(results.values())

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
