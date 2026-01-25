# 🤖 AI Agent Workflow

PentesterFlow uses a proprietary multi-agent system to simulate a professional manual pentest.

## 🌊 The Workflow Chain

### 1. Reconnaissance Agent
- **Infrastructure**: Executes Nmap to identify OS versions and open services.
- **Web**: Uses Playwright/Chromium to crawl the DOM, handling React/Vue/Angular routing.
- **Data**: Passes a unified "Target Context" to the next stage.

### 2. Attack Agent
- **Payload Selection**: Matches findings (e.g., Redis on 6379, Login on /auth) to specific test scripts.
- **Execution**: Sends active probes and analyzes response headers and bodies.
- **Feedback**: Records findings with "Evidence" (raw requests/responses).

### 3. Validation Agent (LLM)
- **Intelligence**: Takes "Low Confidence" findings and sends them to Google Gemini 1.5 Flash.
- **Decision**: The LLM acts as the senior lead, confirming if the finding is a true vulnerability or a developer-intended feature.
- **Noise Reduction**: Eliminates up to 90% of automated scanner "false alarms".

### 4. Reporting Agent
- **Translation**: Converts technical JSON findings into human language.
- **Remediation**: Generates Python scripts that developers can use to reproduce the bug.
- **Consolidation**: Finalizes the Risk Score and builds the PDF.
