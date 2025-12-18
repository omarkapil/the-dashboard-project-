# SME Cyber Exposure Dashboard - Integrated Documentation

## 🌟 Overview
The SME Cyber Exposure Dashboard is a comprehensive, production-ready security platform designed to protect small and medium enterprises. It combines raw network intelligence (Nmap), artificial intelligence (Gemini), and human-centric design to transform technical data into an audit-ready security posture.

This document covers **all features**, including original core functionality and the enhancements from Phase 1, 2, and 3.

---

## 🚀 Combined Feature List

### 1. Unified Dashboard & Overview
*   **Security Health Score**: A persistent 0-100 score and A-F letter grade representing overall network risk.
*   **The Action Center**: A central "To-Do" list that translates technical vulnerabilities into simple, plain-English security tasks.
*   **Quick Stats**: Real-time counters for Active Assets, Critical Vulnerabilities, and Last Scan Status.
*   **Cyber-Neon UI**: A high-contrast, professional aesthetic designed for modern Security Operation Centers (SOC).

### 2. Intelligent Scanning & Discovery
*   **Deep Nmap Integration**:
    *   **Quick Scan**: Fast discovery of active hosts and ports.
    *   **Full Scan**: In-depth OS fingerprinting and service detection.
*   **Subnet/CIDR Support**: Scan individual IPs (`192.168.1.10`) or entire office networks (`192.168.1.0/24`).
*   **Scan History**: Complete archive of every scan performed, including results and generated actions.

### 3. Active Monitoring & Asset Management
*   **Persistent Network Inventory**: Every device discovered is tracked in a historical database with `First Seen` and `Last Seen` timestamps.
*   **Change Detection Alerts**:
    *   **New Device Detection**: Automatic **HIGH priority** alert when an unauthorized or unknown device joins the network.
    *   **Port Change Detection**: Alerts when a known device opens new or unexpected services.
*   **Live Activity Feed**: A real-time timeline (Twitter-style) of security events, alerts, and system activities.
*   **Offline Tracking**: Automatically identifies and tracks devices that have gone offline.

### 4. Vulnerability & Risk Management
*   **Automated Risk Calculation**: Proprietary engine that deducts points for open high-risk ports (Telnet, RDP, SMB) and detected vulnerabilities.
*   **Network Topology Map**: Visual graph of your network showing how devices are interconnected.
*   **Service Analysis**: Identifies exact software versions and products running on every port.

### 5. AI Advisor & Reporting
*   **AI Security Advisor (Gemini)**: Leverages Large Language Models to write custom, context-aware executive summaries and remediation strategies.
*   **Professional PDF Export**: Generate audit-ready documents with one click, containing:
    *   Executive Summaries (Management-ready)
    *   Key Security Metrics
    *   Prioritized Action Item Tables
*   **Audit-Ready Logs**: Perfect for cyber insurance applications, compliance audits, and management reviews.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Python / FastAPI | High-speed API and core logic |
| **Frontend** | React / Vite | Modern, responsive user interface |
| **Scanner** | Nmap | Network service & vulnerability discovery |
| **AI** | Google Gemini | Threat analysis & report writing |
| **Database** | PostgreSQL | Historical scan & asset storage |
| **Async Tasks** | Celery & Redis | Background scanning & monitoring |
| **Reporting** | ReportLab | Professional PDF generation |
| **Styling**| Tailwind CSS | Premium dashboard aesthetics |

---

## 📁 Architecture Overview

1.  **Scanner Layer**: Nmap probes the target network and returns raw service data.
2.  **Processing Layer**: 
    *   `RiskCalculator` grades the results.
    *   `ActionGenerator` converts ports/vulns into tasks.
    *   `AssetMonitor` compares results against the historical inventory to find changes.
3.  **Intelligence Layer**: Gemini AI summarizes findings into human-readable advice.
4.  **Presentation Layer**: React dashboard visualizes the data, and PDF Generator creates downloadable reports.

---

## 🚦 Installation & Setup

### Prerequisites
*   Docker & Docker Compose
*   (Recommended) Gemini API Key added to `.env`

### Quick Start
```bash
# 1. Start the full stack
docker-compose up -d --build

# 2. Access the Dashboard
http://localhost:5173

# 3. Access API Docs
http://localhost:8000/docs
```

---

## � Roadmap (Future Features)
- [ ] **Automated Remediation**: One-click scripts to close ports or update firewalls.
- [ ] **External Threat Intel**: Integration with Shodan/Censys for external-facing risk.
- [ ] **User Role Management**: Admin vs. Viewer permissions.
- [ ] **Compliance Templates**: Pre-configured checklists for GDPR, NIST, or ISO 27001.

---

Designed for SMEs. Verified for Security. Done for You.
