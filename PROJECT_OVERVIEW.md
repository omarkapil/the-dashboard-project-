# found 404: Intelligence-Driven Security (Q&A)

This document provides a comprehensive explanation of the **found 404** platform, its goals, features, and the technologies that power it.

---

## 🎯 General Goals & Vision

### Q: What is found 404?
**A:** found 404 is a professional-grade **Intelligence-Driven Security** platform. It acts as an autonomous security hub that doesn't just scan for bugs but "understands" the neural topology of the applications and infrastructure it protects.

### Q: Why was found 404 created?
**A:** Traditional scanners often produce a lot of "noise" and lack the context to understand complex network relationships. found 404 was created to bridge this gap by using **Neural Network Topology** and **AI Intelligence Agents** that reason about exposures and identify critical risk paths.

---

## 🚀 Core Features

### Q: What makes found 404 "Agentic"?
**A:** Instead of a linear script, the platform uses specialized AI agents:
- **Intelligence Agent**: Synthesizes discovery results into specialized "Device Knowledge".
- **Risk Engine**: Calculates exposure scores based on business context and technical findings.
- **Validation Hub**: Uses Gemini Pro to reasoning through scan data and filter out noise.

### Q: How does it handle asset discovery?
**A:** It integrates deeply with **Nmap** for network scanning, OS detection, and service fingerprinting. It then visualizes this data in an interactive **Network Topology Graph**, making it easy to see the "attack surface."

### Q: What is the vulnerability engine?
**A:** It leverages **Nuclei**, a powerful template-based scanner, to look for thousands of known vulnerabilities, misconfigurations, and CVEs across web services, protocols, and network layers.

---

## 🛠️ Technology Stack

### Q: What technologies are used in the Backend?
**A:** 
- **Language**: Python 3.10+
- **Framework**: **FastAPI** (for high-performance asynchronous API endpoints).
- **Database**: **PostgreSQL** with **SQLAlchemy** ORM.
- **Task Queue**: **Celery** with **Redis** (for handling long-running scans in the background).
- **Security Tools**: **Nmap** (discovery), **Nuclei** (scanning), **Playwright** (browser automation).

### Q: What technologies are used in the Frontend?
**A:** 
- **Framework**: **React** with **Vite** (for a fast, modern build experience).
- **Styling**: **Tailwind CSS** (for a clean, professional UI).
- **Visualization**: **React Force Graph** and **D3.js** (for the network topology view).
- **Icons**: **Lucide React**.

### Q: How is AI integrated?
**A:** The platform uses **Gemini Pro** via the `google-generativeai` SDK. Gemini acts as the "core node brain," reasoning through scan results and generating strategic security insights.

---

## 📂 Project Structure

### Q: How is the repository organized?
**A:** 
- `/backend`: Contains the FastAPI server, AI agent logic, scan orchestrators, and database models.
- `/frontend`: Contains the React source code, components, and dashboard UI.
- `/lab_config`: Contains scripts and configurations for the virtual simulation lab.
- `docker-compose.yml`: The main configuration to launch the entire platform.
- `docker-compose.lab.yml`: Configuration for the 5-node virtual corporate network.

---

## ⚙️ Installation & Setup

### Q: How do I get found 404 running?
**A:** 
1. **Clone the Repo**: 
   ```bash
   git clone https://github.com/omarkapil/the-dashboard-project-.git
   cd the-dashboard-project-
   ```
2. **Configure AI**: Create a `.env` file in the root and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
3. **Launch with Docker**: 
   ```bash
   docker-compose up -d --build
   ```
4. **Access the UI**: Open your browser to `http://localhost:5173`.

### Q: How do I test it without a real target?
**A:** You can launch the **Simulated Corporate Network** (Virtual Lab):
```bash
docker-compose -f docker-compose.lab.yml up -d
```
This creates 5 virtual nodes (Router, Windows PC, Linux Servers) with intentional vulnerabilities for you to practice scanning.

---

## 🔮 The Future

### Q: What's next for found 404?
**A:** The roadmap includes:
- **Vision Integration**: Using AI to "see" screenshots of web pages to find UI-level security issues.
- **Enterprise Features**: Role-Based Access Control (RBAC) and integration with Jira/GitHub.
- **Cloud Scanning**: Specialized agents for AWS/Azure security posture management.
