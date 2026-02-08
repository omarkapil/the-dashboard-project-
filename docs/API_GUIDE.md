# 🔌 REST API Documentation

found 404 provides a fully documented REST API for integration with CI/CD pipelines and external dashboards.

## 🔑 Authentication
Currently, the API is open for internal network use. Standard Bearer Token authentication is planned for Phase 2.

## 🏷️ Endpoints

### Targets
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/targets/` | List all configured scan targets. |
| `POST` | `/api/v1/targets/` | Create a new target. |
| `GET` | `/api/v1/targets/{id}` | Get detailed target info & history. |
| `POST` | `/api/v1/targets/discover` | Trigger Subfinder subdomain enumeration. |

### Scans
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scans/ai` | **The Primary Entry Point**. Triggers the full Agentic AI workflow. |
| `GET` | `/api/v1/scans/` | List all scan history. |
| `GET` | `/api/v1/scans/{id}` | Get real-time status and findings. |
| `GET` | `/api/v1/scans/{id}/logs` | Fetch the AI agent reasoning chain. |

### Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/{id}` | Fetch LLM-generated executive summary. |
| `GET` | `/api/v1/reports/{id}/pdf` | Download a professional PDF security report. |

## 🧪 Real-time Updates
Scanning progress is available via polling the `/api/v1/scans/{id}` endpoint. The `status` field will transition from `queued` -> `running` -> `completed` (or `failed`).
