# PentesterFlow - AI-Driven DAST Platform

![PentesterFlow Dashboard](https://via.placeholder.com/1200x600?text=PentesterFlow+AI+DAST+Command+Center)

## 🌟 Overview
**PentesterFlow** is a professional-grade agentic dynamic application security testing (DAST) platform. It leverages autonomous AI agents to intelligently discover, test, and validate vulnerabilities in web applications and infrastructure. Unlike traditional scanners, PentesterFlow uses contextual reasoning and LLM-backed validation to minimize noise and provide actionable security intelligence.

---

## 🚀 Key Features

### 1. Autonomous AI Agent Workflow
- **Recon Agent**: Automatically maps application structure and runs **Nmap infrastructure discovery** to find hidden ports and services.
- **Attack Agent**: Generates context-aware payloads (SQLi, XSS, BOLA) and evaluates infrastructure risks like unauthenticated databases.
- **Validation Agent**: Uses Google Gemini (1.5-Flash) to filter false positives with high precision.
- **Reporting Agent**: Generates professional PDF reports with executive summaries and Python-based PoC scripts.

### 2. Professional Security Dashboard
- **Real-Time AI Console**: Track agent reasoning chains as they navigate and test your targets.
- **Integrated Vulnerability Lab**: Manage, verify, and resolve findings in a unified interface.
- **Dynamic Risk Engine**: Automatically calculates a security health score based on asset criticality and vulnerability severity.

### 3. Unified Simulation Lab
- Includes a one-click **Vulnerable Lab Environment** to test the platform against real-world scenarios (Juice Shop, Redis, Nginx).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Orchestrator** | Python / Agentic Workflow (LangGraph style) |
| **Backend** | FastAPI / SQLAlchemy / PostgreSQL |
| **Frontend** | React / Vite / Tailwind CSS / Lucide Icons |
| **Task Queue** | Celery / Redis |
| **AI / LLM** | Google Gemini 1.5 Flash |
| **Scanners** | Nmap / Playwright / Nuclei |

---

## 🚦 Quick Start

### 1. Clone & Configure
```bash
git clone https://github.com/omarkapil/the-dashboard-project-.git
cd the-dashboard-project-
```
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key_here
```

### 2. Launch the Platform
```bash
docker-compose up -d --build
```

### 3. Start the Simulation Lab (Optional)
```bash
docker-compose -f docker-compose.lab.yml up -d
```

### 4. Access the Command Center
Go to [http://localhost:5173](http://localhost:5173)

---

## 🧪 Scanning the Lab
To see the full power of the AI agents:
1. Add target `http://lab_gateway`.
2. Click **AI Scan**.
3. Watch the findings (Redis, Juice Shop, etc.) appear in the **History** and **Reports** tabs.

---

## 🔮 Roadmap
- [ ] Custom LLM Fine-tuning for security reports.
- [ ] Two-way Jira/Linear integration.
- [ ] Cloud Security Posture Management (CSPM).

---

**PentesterFlow** — *The Future of AI-Native Security Testing.*
