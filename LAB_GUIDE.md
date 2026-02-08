# 🧪 Virtual Lab Guide (5-Node Simulation)

found 404 includes a rich **Simulated Corporate Network** to help you test the scanner's capabilities (Asset Discovery, OS Detection, Vulnerability Finding).

## 🏗️ Topology Overview
The lab creates a virtual subnet with 5 unique devices:

| Device Name | IP (Dynamic) | OS Simulation | Services | Vulnerabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Gateway** (Router) | `172.x.0.1` | Cisco IOS / Linux | DNS, DHCP | Info Disclosure |
| **Corporate DB** | `172.x.0.x` | Linux | Redis (6379) | **Unauth Access** |
| **File Server** | `172.x.0.x` | Linux | SMB (139/445) | **WannaCry Risk** |
| **HR Workstation** | `172.x.0.x` | Windows 10 | RDP (3389) | Weak Credentials |
| **Dev Laptop** | `172.x.0.x` | Ubuntu Linux | SSH (22), Nginx | Open SSH |

## 🚀 Deployment Instructions

### 1. Start the Lab
Run this command from the project root:
```powershell
docker-compose -f docker-compose.lab.yml up -d
```
*Note: This uses dynamic IP allocation to avoid conflicts with your local network.*

### 2. Identify the Target Network
Since IPs are dynamic, you need to find the Docker subnet range. Run:
```powershell
docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}/{{.IPPrefixLen}}{{end}}" lab_gateway
```
Example Output: `172.18.0.2/16`. This means your target range is **`172.18.0.0/24`**.

### 3. Run a Scan
1. Open the [Dashboard](http://localhost:5173).
2. Go to **Overview**.
3. In "Start New Scan", enter the subnet (e.g., `172.18.0.0/24`).
4. Click **Scan**.

## 📊 What You Will See
- **Network Topology**: A star or mesh graph showing all 5 devices.
- **Icon Classification**: The Windows PC will have a `Monitor` icon, the Router a `Radio` icon, etc.
- **Vulnerabilities**:
    - **Redis**: "Unauthenticated Redis Server"
    - **SMB**: "Samba Server Detected"
    - **RDP**: "Remote Desktop Protocol"

## 🧹 Cleanup
To stop and remove the lab environment:
```powershell
docker-compose -f docker-compose.lab.yml down -v
```
