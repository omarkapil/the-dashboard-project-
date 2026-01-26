# PentesterFlow - AI-Driven DAST Platform

![PentesterFlow Dashboard](https://via.placeholder.com/1200x600?text=PentesterFlow+AI+DAST+Command+Center)

## 🌟 Overview
**PentesterFlow** is a professional-grade agentic dynamic application security testing (DAST) platform. It leverages autonomous AI agents to intelligently discover, test, and validate vulnerabilities in web applications and infrastructure. Unlike traditional scanners, PentesterFlow uses contextual reasoning and LLM-backed validation to minimize noise and provide actionable security intelligence.

---

## 🚀 Key Features

### 1. Advanced Asset Discovery & Topology
- **Deep Network Scanning**: Integrates **Nmap** with OS detection (`-O`) and Aggressive Service Scan (`-A`).
- **Visual Topology**: Interactive 2D graph visualization of network assets (Gateways, Servers, Workstations).
- **Device Fingerprinting**: Automatically identifies OS (Windows/Linux/Cisco) and Device Type (Mobile/Server/Router) using heuristic analysis.

### 2. Autonomous AI Agent Workflow
- **Recon Agent**: Automatically maps application structure and identifies hidden ports and services.
- **Attack Agent**: Generates context-aware payloads (SQLi, XSS, BOLA).
- **Vulnerability Engine**: Now powered by **Nuclei** for deep, template-based vulnerability scanning (CVEs, Misconfigurations).
- **Validation Agent**: Uses Google Gemini (1.5-Flash) to filter false positives.

### 3. Professional Security Dashboard
- **Asset Detail Panel**: Rich slide-out panel showing MAC Vendor, Uptime, and detailed Service Versions per asset.
- **Real-Time Risk Score**: Dynamic scoring engine (0-100) that caps your score based on detected vulnerabilities.
- **Unified Simulation Lab**: 5-node virtual corporate network for realistic training and testing.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Orchestrator** | Python / Agentic Workflow |
| **Backend** | FastAPI / SQLAlchemy / PostgreSQL / Celery |
| **Frontend** | React / Vite / Tailwind CSS / Lucide Icons |
| **Discovery** | **Nmap** (OS Detection) / **Netcat** (Simulation) |
| **Scanning** | **Nuclei** (Vulnerabilities) / Subfinder |
| **AI / LLM** | Google Gemini 1.5 Flash |

## 📄 Documentation & Guides

- **[Lab Guide](LAB_GUIDE.md)**: How to deploy the 5-node Virtual Corp Network.
- **[Architecture](docs/ARCHITECTURE.md)**: System design and data flow.
- **[API Reference](docs/API_GUIDE.md)**: REST API endpoints.

---

## 🚦 Quick Start

### 1. Clone & Configure
```bash
git clone https://github.com/omarkapil/the-dashboard-project-.git
cd the-dashboard-project-
```
Create a `.env` file:
```env
GEMINI_API_KEY=your_key_here
```

### 2. Launch Platform
```bash
docker-compose up -d --build
```

### 3. Launch Virtual Lab (Optional)
Deploy the simulated corporate network:
```bash
docker-compose -f docker-compose.lab.yml up -d
```

### 4. Access Command Center
Go to [http://localhost:5173](http://localhost:5173).

---

## 🧪 How to Test (The "Happy Path")
1.  **Start the Lab**: Run the command in Step 3.
2.  **Scan the Network**:
    *   Go to **Dashboard**.
    *   Enter Target: `172.18.0.0/24` (or your dynamic Docker subnet).
    *   Click **Scan**.
3.  **Explore**:
    *   Go to **Network Topology**.
    *   Click on nodes (Router, Redis, Windows PC).
    *   See vulnerabilities like **Open Redis** or **SMB**.

---

## 🔮 Roadmap
- [ ] TShark/Wireshark Traffic Analysis Integration.
- [ ] Automated Report PDF Export.
- [ ] Cloud Security Posture Management (CSPM).

---

**PentesterFlow** — *AI-Native Asset Discovery & Security Testing.*
