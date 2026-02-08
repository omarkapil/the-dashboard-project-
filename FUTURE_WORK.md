# 🔮 Future Work & Roadmap

**found 404** is designed for continuous evolution. Below are the planned features and research areas for the upcoming versions.

## 🚀 Phase 1: Core Intelligence (Next 3 Months)
- **Visual Pentesting**: Use Google Gemini Vision to "look" at screenshots and find UI-level vulnerabilities (e.g., exposed credentials in cleartext).
- **Custom Exploitation Scripts**: Allow users to upload their own Nuclei templates or Python probes to be used by the Attack Agent.
- **Enhanced BOLA Detection**: State-aware agents that can swap JWT tokens between two simulated users to prove authorization bypass.

## 🛡️ Phase 2: Enterprise Integration (Next 6 Months)
- **CI/CD Integration**: A GitHub Action that fails builds if the AI agent finds a CRITICAL vulnerability.
- **RBAC & Multi-tenant**: Team workspaces with different permissions (Admin, Analyst, Client).
- **Linear/Jira Sync**: Automatically create tickets for High/Critical findings.

## 🌐 Phase 3: Scaling & Ecosystem (Long Term)
- **Cloud Agent**: An agent dedicated to scanning AWS S3 buckets and IAM permissions.
- **API Registry**: Automatically generate OpenAPI specs from scan data.
- **Vulnerability Marketplace**: A community-driven repository of "Agent Personas" optimized for different tech stacks (e.g., a "Blockchain Auditor" agent).

---

## 🛠️ Contribution
We welcome contributions in the areas of:
- New Attack Agent payloads.
- Improved LLM prompts for reasoning.
- Documentation and localization.
