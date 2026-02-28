# found 404 // Intelligence-Driven Security Hub

![found 404 Dashboard](https://via.placeholder.com/1200x600?text=found+404+Core+Node+Command+Center)

## 🌟 Overview
**found 404** is a high-intelligence agentic security platform designed for deep infrastructure discovery and vulnerability analysis. It leverages autonomous AI agents to intelligently map, test, and synthesize security insights for corporate networks. Using **Gemini-backed reasoning** and **Neural Topology** visualization, found 404 provides a state-of-the-art DAST experience that goes beyond simple signatures to provide true operational intelligence.

---

## 🚀 Key Features

### 1. Neural Network Topology
- **Interactive Hex-Graph**: A custom-engineered D3-powered force graph with neon status rings and interactive nodes.
- **Deep CIDR Discovery**: Correctly parses and maps entire subnets (e.g., `/24`), identifying and classifying every device in the infrastructure.
- **Smart Data Recovery**: Automatically prioritizes the most feature-rich scan results for a consistent "Neural Network" view.

### 2. Autonomous AI Intelligence Agent
- **Validation Engine**: Performs real-time reasoning to filter false positives and provide actionable remediation tips.
- **SIEM & SOAR Orchestration**: (New) Unified stack featuring **Wazuh** (EDR), **Elasticsearch** (Logging), and **n8n** (Automated Playbooks) for real-time threat response.

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
| **SIEM** | **Wazuh** / **Elasticsearch** / **Kibana** |
| **SOAR** | **n8n** (Workflow Automation) |
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

**found 404** — *Neural Asset Discovery & Intelligence Hub.*
