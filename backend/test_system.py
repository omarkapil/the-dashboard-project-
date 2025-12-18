import requests
import sys

BASE_URL = "http://localhost:5000/api"

def run_test():
    print("[-] Starting System Verification...")
    
    # 1. Test Login
    print(f"[*] Testing Login to {BASE_URL}/auth/login...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
    except requests.exceptions.ConnectionError:
        print("[!] Connection Refused. Is the backend running?")
        sys.exit(1)

    if resp.status_code == 200:
        print("[+] Login SUCCESS")
        data = resp.json()
        token = data.get('access_token')
        print(f"    Token received: {token[:15]}...")
    else:
        print(f"[!] Login FAILED: {resp.status_code} - {resp.text}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Dashboard Data
    print(f"[*] Testing Dashboard Data fetch to {BASE_URL}/dashboard...")
    resp = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    
    if resp.status_code == 200:
        print("[+] Dashboard Data SUCCESS")
        print(f"    Data: {str(resp.json())[:100]}...")
    else:
        print(f"[!] Dashboard Data FAILED: {resp.status_code} - {resp.text}")
        sys.exit(1)

    # 3. Test Scan Status
    print(f"[*] Testing Scan Status to {BASE_URL}/scan/status...")
    resp = requests.get(f"{BASE_URL}/scan/status", headers=headers)
    
    if resp.status_code == 200:
        print("[+] Scan Status SUCCESS")
        print(f"    Data: {resp.json()}")
    else:
        print(f"[!] Scan Status FAILED: {resp.status_code} - {resp.text}")
        sys.exit(1)

    print("\n[ok] ALL SYSTEMS OPERATIONAL")

if __name__ == "__main__":
    run_test()
