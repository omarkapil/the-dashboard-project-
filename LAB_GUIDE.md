# 🧪 PentesterFlow Lab Environment Guide (Unified Network)

This guide helps you set up a **Simulated Corporate Server** (`lab_gateway`) that hosts multiple vulnerable services on different ports.

## 1. Start the Lab
Open a new terminal in the project folder and run:

```powershell
docker-compose -f docker-compose.lab.yml up -d --build
```
*This starts the Gateway and 3 hidden vulnerable services.*

## 2. Verify Simulation
The **Gateway** acts as a single target IP with multiple open ports:

| Port | Configured Service | Hidden Container | Vulnerability Type |
| :--- | :--- | :--- | :--- |
| **80** | Corporate Landing | `lab_target_nginx` | Outdated Server, Header Leaks |
| **3000** | Employee Portal | `juice-shop`| SQL Injection, XSS (OWASP Top 10) |
| **6379** | Database Cache | `vulnerable-redis` | Unauthenticated Remote Access |

## 3. Run the "One-Click" Scan
Go to your Dashboard (**Targets** Tab) and add the single unified target:

- **Name**: Simulated Corp Server
- **URL**: `http://lab_gateway`
- **Auth**: None
- **Criticality**: CRITICAL

> **Note**: The scanner will resolve `lab_gateway` to the internal container IP and scan all ports.

## 4. Expected Results
When you run a **Full Scan** on this target, the scanner should report:
1.  **Multiple Open Ports**: 80, 3000, 6379, etc.
2.  **Critical Risks**:
    - "Unprotected Redis" (Port 6379)
    - "Vulnerable Web App" (Port 3000)
    - "Information Disclosure" (Port 80)
3.  **Asset Discovery**: One host found (`lab_gateway`) with multiple service fingerprints.

## 5. Cleanup
To stop the lab:
```powershell
docker-compose -f docker-compose.lab.yml down
```
