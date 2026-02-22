# 🧠 Backend Explanation — SME Cyber Exposure Dashboard
### *A Beginner-Friendly, Line-by-Line Guide*

> 📅 Last Updated: February 2026  
> 👤 Author: Project Team  
> 🎯 Purpose: Help any beginner understand how the backend works, file by file, line by line.

---

## 📁 The Backend Folder Structure

Before we dive in, here's a map of what exists in the backend so you can visualize the whole system:

```
backend/
├── app/
│   ├── main.py              ← The ENTRY POINT — where everything starts
│   ├── core/
│   │   ├── config.py        ← Settings & environment variables
│   │   ├── database.py      ← Database connection
│   │   ├── risk_engine.py   ← Calculates risk scores for assets
│   │   └── celery_app.py    ← Background job scheduler
│   ├── models/
│   │   └── scan.py          ← Database table definitions
│   ├── api/
│   │   └── api.py           ← URL routing (which URL goes where)
│   └── services/            ← The business logic (scanning, AI, etc.)
│       ├── agent_orchestrator.py
│       ├── ai_advisor.py
│       ├── nmap_wrapper.py
│       ├── nuclei_wrapper.py
│       ├── openvas.py
│       ├── pdf_generator.py
│       ├── risk_engine.py
│       └── scan_tasks.py
```

---

## 🟢 Part 1: `main.py` — The Entry Point (The Front Door of Your App)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api import api_router
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to SME Cyber Exposure Dashboard API"}
```

### 🔍 Line-by-Line Explanation

| Line | What it does |
|------|--------------|
| `from fastapi import FastAPI` | Imports the **FastAPI** library. FastAPI is the framework we use to build our API server — think of it like a restaurant kitchen manager who receives orders (HTTP requests) and sends back food (responses). |
| `from fastapi.middleware.cors import CORSMiddleware` | Imports **CORS middleware**. CORS is a browser security feature. Without this, your frontend (React) would be **blocked** from talking to your backend because they run on different ports. |
| `from app.core.config import settings` | Imports our app's **settings file** (explained in Part 2). Think of `settings` as a notebook containing all app configurations. |
| `from app.api.api import api_router` | Imports our **URL router** — basically the map that says "when someone visits `/scans`, call this function". |
| `from app.core.database import engine, Base` | Imports the **database engine** (the connection to SQLite/PostgreSQL) and `Base` (the parent class all database models inherit from). |
| `Base.metadata.create_all(bind=engine)` | **Auto-creates all database tables** on startup if they don't exist. It looks at all your model classes and builds the database schema for you. |
| `app = FastAPI(title=..., openapi_url=...)` | **Creates the app instance**. The `title` shows in the auto-generated API docs. `openapi_url` is where the docs JSON lives so tools like Swagger can read it. |
| `app.add_middleware(CORSMiddleware, ...)` | **Attaches CORS rules** so the frontend at `localhost:5173` (React/Vite) is allowed to call the backend at `localhost:8000`. `allow_methods=["*"]` means all HTTP methods (GET, POST, DELETE, etc.) are accepted. |
| `app.include_router(api_router, ...)` | **Registers all routes** (URLs) from `api_router` under the prefix `/api/v1`. So `/scans` becomes `/api/v1/scans`. |
| `@app.get("/")` | A **decorator** that says: "When someone visits the root URL `/`, run this function." |
| `return {"message": "Welcome..."}` | Returns a **JSON response** — proof the server is alive. |

> ### 📝 ملخص بالعربي — Part 1
> هذا الملف هو **باب الدخول الرئيسي** للتطبيق. عند تشغيل السيرفر، هذا أول ملف يُحمَّل. يقوم بـ:
> - إنشاء تطبيق FastAPI
> - السماح للواجهة الأمامية (React) بالتواصل مع السيرفر عبر إعداد CORS
> - ربط جميع المسارات (URLs) بالتطبيق
> - إنشاء جداول قاعدة البيانات تلقائيًا عند بدء التشغيل

---

## ⚙️ Part 2: `core/config.py` — The Settings Notebook

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SME Cyber Exposure Dashboard"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./test.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    NMAP_PATH: str = "nmap"
    OPENVAS_HOST: str = "localhost"
    OPENVAS_PORT: int = 9390
    OPENVAS_USER: str = "admin"
    OPENVAS_PASSWORD: str = "admin"
    GEMINI_API_KEY: str = ""
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
```

### 🔍 Explanation

| Setting | Purpose |
|---------|---------|
| `BaseSettings` | A special class from `pydantic` that reads values from your `.env` file automatically. So instead of hardcoding passwords in code (dangerous!), they get loaded from the `.env` file on your computer. |
| `PROJECT_NAME` | Just the display name of the project. |
| `API_V1_STR = "/api/v1"` | The **URL prefix** for all endpoints. Every API route starts with `/api/v1/`. |
| `DATABASE_URL` | Tells the backend **where the database is**. By default it uses `SQLite` (a file-based database, `test.db`), but in production you'd switch to PostgreSQL. |
| `REDIS_URL` | The address of the **Redis server**, which is used by Celery for background job queues. |
| `NMAP_PATH` | The command to run **Nmap** (network scanner tool). `"nmap"` means it's installed globally on the system. |
| `OPENVAS_*` | Connection details for **OpenVAS**, the vulnerability scanner. |
| `GEMINI_API_KEY` | Your **Google Gemini AI** key, used to power the AI advisor and vulnerability analysis. |
| `BACKEND_CORS_ORIGINS` | A list of allowed frontend URLs. React dev server runs on port `5173`, so we whitelist it here. |
| `model_config = SettingsConfigDict(env_file=".env")` | Tells Pydantic to read secrets from the `.env` file in your project root. |
| `settings = Settings()` | Creates **one single instance** of the settings. All other files import this one object. |

> ### 📝 ملخص بالعربي — Part 2
> هذا الملف هو **دفتر الإعدادات** للمشروع بالكامل. يحتوي على:
> - اسم المشروع وعنوان API
> - عنوان قاعدة البيانات (SQLite أو PostgreSQL)
> - إعدادات Redis وCelery للمهام الخلفية
> - مفاتيح الأدوات الأمنية (Nmap, OpenVAS) ومفتاح Gemini AI
> - يقرأ القيم الحساسة تلقائيًا من ملف `.env` بدلاً من كتابتها مباشرة في الكود

---

## 🗄️ Part 3: `core/database.py` — The Database Connection

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 🔍 Explanation

| Code | Purpose |
|------|---------|
| `create_engine(...)` | Creates the **database engine** — the telephone line between Python and the database. `check_same_thread: False` is an SQLite-specific fix so multiple requests can share the database. |
| `SessionLocal = sessionmaker(...)` | A **factory** that creates sessions. A `Session` is like a shopping cart — you add/remove/query items, then `commit()` to save changes. If something goes wrong, you can `rollback()`. |
| `autocommit=False` | Changes are **not saved automatically**. You must call `db.commit()` explicitly. |
| `autoflush=False` | SQLAlchemy won't push pending changes before every query. Gives you more control. |
| `class Base(DeclarativeBase)` | The **parent class** for all database models. Every table (`Scan`, `Target`, `Vulnerability`) inherits from this. |
| `def get_db()` | A **dependency injection function**. Creates a fresh database session, hands it to the API function (`yield db`), and **always closes it** in the `finally` block — even if something crashes. Prevents connection leaks. |

> ### 📝 ملخص بالعربي — Part 3
> هذا الملف هو **قناة الاتصال بين الكود وقاعدة البيانات**. يقوم بـ:
> - إنشاء "محرك" الاتصال بقاعدة البيانات (SQLite أو PostgreSQL)
> - إنشاء "جلسة" لكل طلب API (مثل فتح اتصال مؤقت)
> - `get_db()` تضمن إغلاق الاتصال دائمًا بعد انتهاء العملية، حتى في حالة حدوث خطأ

---

## 🗺️ Part 4: `api/api.py` — The URL Router (The Traffic Map)

```python
from fastapi import APIRouter
from app.api.v1.endpoints import scans, reports, network, targets, vulnerabilities, openvas, dashboard

api_router = APIRouter()

api_router.include_router(targets.router, prefix="/targets", tags=["targets"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(vulnerabilities.router, prefix="/vulnerabilities", tags=["vulnerabilities"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(network.router, prefix="/network", tags=["network"])
api_router.include_router(openvas.router, prefix="/openvas", tags=["openvas"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@api_router.get("/")
def root():
    return {"message": "PentesterFlow API is running", "version": "2.0"}
```

### 🔍 Explanation

- **`APIRouter()`** — Creates a **router object** — a container that groups related URLs together. Think of it like a **switchboard operator** who routes incoming calls to the right department.

- **`include_router(targets.router, prefix="/targets")`** — Any URL starting with `/targets` is handled by the `targets` module. Full URL examples:
  - `GET /api/v1/targets` → lists all targets
  - `POST /api/v1/targets` → creates a new target
  - `DELETE /api/v1/targets/123` → deletes target with ID 123

- **`tags=[...]`** — Labels that appear in the auto-generated Swagger API documentation.

- Full URL structure: `http://localhost:8000` + `/api/v1` + `/scans` = `http://localhost:8000/api/v1/scans`

### 🗂️ Available Endpoints Summary

| Prefix | Module | Purpose |
|--------|--------|---------|
| `/targets` | `targets.py` | Manage scan targets (websites/apps) |
| `/scans` | `scans.py` | Start, stop, and view security scans |
| `/vulnerabilities` | `vulnerabilities.py` | View and manage discovered vulnerabilities |
| `/reports` | `reports.py` | Generate and download PDF reports |
| `/network` | `network.py` | Network asset inventory |
| `/openvas` | `openvas.py` | OpenVAS vulnerability scanner integration |
| `/dashboard` | `dashboard.py` | Summary statistics for the dashboard UI |

> ### 📝 ملخص بالعربي — Part 4
> هذا الملف هو **خريطة المسارات (URLs)** للتطبيق. يوجّه كل طلب HTTP إلى القسم المناسب:
> - `/targets` → كل ما يتعلق بالأهداف
> - `/scans` → الفحوصات الأمنية
> - `/vulnerabilities` → الثغرات الأمنية المكتشفة
> - `/dashboard` → بيانات لوحة التحكم

---

## 🏗️ Part 5: `models/scan.py` — The Database Blueprint

This is one of the **most important files** in the backend. It defines what every table in your database looks like — like designing the columns in an Excel spreadsheet before you fill in the data.

### 📌 5.1 — Enums (Predefined Value Lists)

```python
class ScanStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class SeverityLevel(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class VulnStatus(str, enum.Enum):
    OPEN = "open"
    FIXED = "fixed"
    FALSE_POSITIVE = "false_positive"
    ACCEPTED = "accepted"
```

**Enums** are like a **multiple-choice list**. Instead of allowing any random text into a database column, you restrict it to specific allowed values. This prevents typos and invalid data.

- A scan can only ever be: `queued`, `running`, `completed`, or `failed`
- A vulnerability severity can only be: `critical`, `high`, `medium`, `low`, or `info`

---

### 📌 5.2 — The `Target` Table

```python
class Target(Base):
    __tablename__ = "targets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    base_url = Column(Text, nullable=False)
    source = Column(String(50), default="manual")
    tech_stack = Column(JSON, nullable=True)
    auth_method = Column(String(50), nullable=True)
    auth_credentials = Column(JSON, nullable=True)
    asset_value = Column(Enum("CRITICAL","HIGH","MEDIUM","LOW"), default="MEDIUM")
    data_sensitivity = Column(Enum("PII","FINANCIAL","NONE"), default="NONE")

    scans = relationship("Scan", back_populates="target", cascade="all, delete-orphan")
    endpoints = relationship("Endpoint", back_populates="target", cascade="all, delete-orphan")
```

A **Target** is a website or application you want to scan. Each column is a field for that target:

| Column | Purpose |
|--------|---------|
| `id` | Unique UUID (like a barcode) auto-generated for each target |
| `name` | Human-readable name, e.g. `"Company Main Website"` |
| `base_url` | The actual URL, e.g. `https://company.com` |
| `source` | Did you add it manually? Or did the discovery agent find it? (`manual`, `discovery`, `aws`) |
| `tech_stack` | JSON object storing detected technologies e.g. `{"cms": "WordPress", "server": "Nginx"}` |
| `auth_method` | How to authenticate: `jwt`, `cookie`, `basic`, or `none` |
| `asset_value` | Business importance: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` |
| `data_sensitivity` | Does it handle personal data (`PII`) or financial data? |
| `scans` (relationship) | Links to all Scans done on this target |
| `cascade="all, delete-orphan"` | If you delete a Target, all its related Scans are automatically deleted |

---

### 📌 5.3 — The `Scan` Table

```python
class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    target_id = Column(String(36), ForeignKey("targets.id"), nullable=True)
    target_url = Column(String, index=True, nullable=True)
    status = Column(Enum(ScanStatus), default=ScanStatus.QUEUED)
    scan_type = Column(String(50), default="full")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    agent_thoughts = Column(JSON, nullable=True)
    risk_score = Column(Float, default=0.0)
```

A **Scan** represents one security scanning session. When you click "Start Scan" on the dashboard, a new Scan record is created here.

| Column | Purpose |
|--------|---------|
| `target_id` | **Foreign Key** — links this scan to a Target (like a relationship/join table) |
| `status` | Current state: `queued → running → completed` |
| `scan_type` | `"full"`, `"quick"`, or `"custom"` |
| `agent_thoughts` | JSON logs from the AI agent — its "thinking process" stored for transparency |
| `risk_score` | Calculated risk score (0–100+) after the scan finishes |
| `@property` methods | `vulnerabilities_count`, `assets_count`, `target_display` compute values on the fly without storing them in the DB |

---

### 📌 5.4 — The `Vulnerability` Table

```python
class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(String(36), primary_key=True, ...)
    scan_id = Column(String(36), ForeignKey("scans.id"))
    type = Column(String(100))           # SQLi, XSS, IDOR, BOLA
    severity = Column(Enum(SeverityLevel), ...)
    url = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    ai_validation_result = Column(JSON, nullable=True)
    remediation = Column(Text, nullable=True)
    simplified_description = Column(Text, nullable=True)
```

Each vulnerability found by a scan is stored here.

| Column | Purpose |
|--------|---------|
| `type` | Type of vulnerability: `SQLi` (SQL Injection), `XSS`, `BOLA`, `IDOR` |
| `severity` | How dangerous it is: Critical / High / Medium / Low / Info |
| `evidence` | Raw HTTP request/response proving the vulnerability is real |
| `confidence_score` | How confident the AI is: `0.9` = 90% sure it's a real vulnerability |
| `ai_validation_result` | The Gemini AI analysis result stored as JSON |
| `remediation_steps` | Step-by-step fix instructions |
| `simplified_description` | AI-generated plain English explanation for non-technical people |

---

### 📌 5.5 — Other Important Tables

| Table | Purpose |
|-------|---------|
| `AgentLog` | Records every action the AI agent takes — great for auditing and debugging |
| `Endpoint` | Discovered API endpoints on a target (e.g. `GET /api/users`, `POST /api/login`) |
| `ScanAsset` | Network devices found during a scan (IP, hostname, OS, MAC address) |
| `AssetService` | Open ports/services on each network device (port 80 = HTTP, port 22 = SSH) |
| `NetworkAsset` | Persistent device inventory across all scans |
| `ActionItem` | Auto-generated to-do tasks when a high-risk asset is found |

> ### 📝 ملخص بالعربي — Part 5
> هذا الملف هو **مخطط قاعدة البيانات**. كل كلاس (class) هو جدول في قاعدة البيانات:
> - **Target**: الأهداف (المواقع والتطبيقات المراد فحصها)
> - **Scan**: جلسات الفحص الأمني
> - **Vulnerability**: الثغرات الأمنية المكتشفة
> - **AgentLog**: سجلات تفكير الذكاء الاصطناعي
> - **ScanAsset**: الأجهزة الشبكية المكتشفة
> - العلاقات بين الجداول (relationships) تربطها ببعضها تلقائيًا باستخدام Foreign Keys

---

## 🧮 Part 6: `core/risk_engine.py` — The Risk Calculator

```python
class RiskEngine:
    def calculate_asset_risk(self, asset: NetworkAsset):
        asset_value_map = {"CRITICAL": 10, "HIGH": 8, "MEDIUM": 5, "LOW": 2}
        asset_val_score = asset_value_map.get(str(asset.criticality).upper(), 5)

        vulns = self.db.query(Vulnerability).filter(
            Vulnerability.host == asset.ip_address,
            Vulnerability.status == "OPEN"
        ).all()

        for v in vulns:
            score = severity_scores.get(v.severity, 0)
            # tracks: max_severity, critical_count, high_count

        base_score = asset_val_score * max_severity
        additive = (critical_count * 10) + (high_count * 5) + (medium_count * 1)
        final_score = base_score + additive
        return float(final_score), critical_count, high_count
```

### 🔍 Explanation

The **Risk Engine** is like an **accountant for danger**. It calculates how risky each network device is using this formula:

```
Risk Score = (Asset Importance × Worst Vulnerability Severity)
           + (Critical Vulnerabilities × 10)
           + (High Vulnerabilities × 5)
           + (Medium Vulnerabilities × 1)
```

**Examples:**
- A **Critical** server with a **Critical** vulnerability: `10 × 10 = 100` 🔴
- A **Low-value** device with only **Low** vulnerabilities: `2 × 2 = 4` 🟢

### Key Methods

| Method | Purpose |
|--------|---------|
| `calculate_asset_risk(asset)` | Calculates the risk score for one single asset |
| `run_analysis()` | Loops through ALL assets, updates their scores, creates ActionItems for dangerous ones |
| `_create_action_item(asset, score, ...)` | Generates a prioritized task card if risk score is high enough |

### Priority Thresholds

| Score | Priority |
|-------|----------|
| > 80 | 🔴 CRITICAL |
| > 60 | 🟠 HIGH |
| > 50 | 🟡 MEDIUM |

> ### 📝 ملخص بالعربي — Part 6
> **محرك المخاطر** يحسب درجة خطورة كل جهاز في الشبكة باستخدام معادلة تأخذ بعين الاعتبار:
> - **أهمية الجهاز**: هل هو خادم رئيسي أم جهاز عادي؟
> - **خطورة الثغرات**: كم ثغرة حرجة وعالية توجد عليه؟
>
> إذا تجاوز الجهاز درجة خطورة 50، يتم إنشاء مهمة علاجية تلقائيًا للفريق الأمني في لوحة التحكم

---

## ⏰ Part 7: `core/celery_app.py` — The Background Job Scheduler

```python
from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.services.scan_tasks']
)

celery_app.conf.beat_schedule = {
    "hourly-network-scan": {
        "task": "app.services.scan_tasks.trigger_periodic_scan",
        "schedule": crontab(minute=0),  # Every hour at :00
        "args": ("localhost",),
    },
}
```

### 🔍 Explanation

**Celery** is a **task queue system**. Imagine a restaurant — when a customer orders, the waiter doesn't stand in the kitchen waiting for the food to cook. They take the next order immediately, while the kitchen works in the background.

That's what Celery does for the backend:
- When a scan is triggered, instead of making the HTTP request wait for 5 minutes, Celery **puts the scan in a queue**
- The API immediately returns `{"status": "queued"}` to the user
- A **Celery worker** picks up the task and runs it in the background
- The frontend polls for updates

| Setting | Purpose |
|---------|---------|
| `broker=settings.REDIS_URL` | Where Celery **sends** tasks to — Redis is the message conveyor belt |
| `backend=settings.REDIS_URL` | Where Celery **stores task results** — also Redis |
| `include=[...]` | Which Python modules contain tasks Celery should know about |
| `beat_schedule` | An **automatic timer** — like a cron job. Runs `trigger_periodic_scan` every hour automatically |
| `crontab(minute=0)` | "Run at minute 0 of every hour" = every hour on the hour |

> ### 📝 ملخص بالعربي — Part 7
> **Celery** هو نظام **المهام الخلفية**. بدلاً من جعل المستخدم ينتظر انتهاء الفحص (الذي قد يستغرق دقائق):
> - يتم وضع المهمة في قائمة انتظار وتُنفَّذ في الخلفية
> - **Redis** هو "صندوق البريد" الذي ينقل المهام بين الأجزاء
> - **beat_schedule** يشغّل فحصًا تلقائيًا كل ساعة دون تدخل بشري

---

## 🔗 Part 8: The Big Picture — How Everything Works Together

Here is the **complete flow** of what happens when a user clicks "Start Scan" on the dashboard:

```
Step 1: 🖥️  Frontend (React) sends:
            POST http://localhost:8000/api/v1/scans
            Body: { "target_url": "https://company.com", "scan_type": "full" }

Step 2: 🚪  main.py receives the request and passes it to the router

Step 3: 🗺️  api.py looks at the URL (/scans) and routes it to scans.router

Step 4: 📋  The scans endpoint function runs
            Reads configuration from config.py (settings)
            Uses get_db() from database.py to open a DB session

Step 5: 💾  A new Scan record is saved to the DB with status = "queued"
            A response is immediately sent back: { "id": "abc-123", "status": "queued" }

Step 6: 📦  A Celery task is sent to Redis
            The scan runs in the BACKGROUND (user doesn't wait)

Step 7: ⚙️  Worker runs the actual security tools:
            → nmap_wrapper.py   (discovers open ports and services)
            → nuclei_wrapper.py (tests for known CVEs and vulnerabilities)
            → openvas.py        (deep vulnerability scanning)
            → agent_orchestrator.py (AI agent coordinates everything)

Step 8: 💾  All results are saved to the DB:
            → Vulnerabilities → vulnerabilities table
            → Network devices → scan_assets table
            → AI thoughts     → agent_logs table

Step 9: 🧮  risk_engine.py calculates risk scores for all discovered assets
            If score > 50, an ActionItem is created automatically

Step 10: 🤖 Gemini AI (ai_advisor.py) analyzes vulnerabilities:
             → Validates findings
             → Generates simplified descriptions
             → Suggests remediation steps

Step 11: ✅  The Scan status is updated to "completed"
             Frontend polls GET /api/v1/scans/abc-123 and displays results
```

> ### 📝 ملخص بالعربي — Part 8 (الخريطة الكاملة)
> عندما يضغط المستخدم على "ابدأ الفحص":
> 1. الواجهة الأمامية ترسل طلبًا للسيرفر عبر API
> 2. السيرفر يستلم الطلب ويوجهه للمكان الصحيح عبر الراوتر
> 3. يُحفظ سجل الفحص في قاعدة البيانات بحالة "في الانتظار"
> 4. يُوضع الفحص في قائمة انتظار Celery لتنفيذه في الخلفية
> 5. تُشغَّل أدوات الفحص الفعلية (Nmap، Nuclei، OpenVAS)
> 6. النتائج تُحفظ في قاعدة البيانات
> 7. محرك المخاطر يحسب درجات الخطورة
> 8. الذكاء الاصطناعي (Gemini) يحلل النتائج ويقترح الحلول
> 9. الواجهة الأمامية تعرض النتائج للمستخدم

---

## 📚 Quick Reference Glossary

| Term | Simple Explanation |
|------|--------------------|
| **FastAPI** | Python framework for building APIs fast. Like Django but lighter and faster |
| **API** | Application Programming Interface — a way for software to talk to each other |
| **Endpoint** | A specific URL in the API (e.g. `/api/v1/scans`) |
| **HTTP Method** | The type of request: GET (read), POST (create), PUT (update), DELETE (remove) |
| **SQLAlchemy** | Python library to interact with databases using Python code instead of SQL |
| **ORM** | Object Relational Mapper — lets you use Python classes instead of writing SQL queries |
| **Session** | A temporary connection to the database for one request |
| **Migration** | Controlled change to the database structure (like running an update) |
| **Celery** | Background job runner — handles long tasks so users don't wait |
| **Redis** | Fast in-memory database used as a message broker for Celery |
| **CORS** | Browser security feature — your backend must explicitly allow requests from the frontend |
| **JSON** | JavaScript Object Notation — a text format for sending structured data |
| **UUID** | Unique ID like `"550e8400-e29b-41d4-a716-446655440000"` — avoids ID collisions |
| **Foreign Key** | A column that links a row in one table to a row in another table |
| **Relationship** | SQLAlchemy links between tables so you can access related data easily |
| **Decorator** | `@app.get("/")` — a Python shortcut to attach extra behavior to a function |
| **Dependency Injection** | FastAPI automatically gives functions what they need (e.g. the DB session) |
| **Enum** | A fixed set of allowed string values (like a dropdown list) |
| **Pydantic** | Python library for data validation — ensures incoming data is the right type and shape |

---

*This document was auto-generated as part of the SME Cyber Exposure Dashboard project documentation.*
