# 🖥️ Frontend Explanation — SME Cyber Exposure Dashboard
### *A Beginner-Friendly, Line-by-Line Guide*

> 📅 Last Updated: February 2026  
> 👤 Author: Project Team  
> 🎯 Purpose: Help any beginner understand how the frontend works, file by file, concept by concept.

---

## 📁 The Frontend Folder Structure

Here is the complete map of the frontend. Every folder has a specific job:

```
frontend/
├── index.html                   ← The ONE HTML file that loads everything
├── package.json                 ← List of all libraries (dependencies) used
├── vite.config.js               ← Vite build tool configuration
├── tailwind.config.js           ← Custom color palette & design system
└── src/
    ├── main.jsx                 ← Entry point — starts the React app
    ├── App.jsx                  ← Root component — the top of the tree
    ├── index.css                ← Global styles, custom CSS classes
    ├── gradient-styles.css      ← Extra gradient animations
    │
    ├── context/
    │   └── AuthContext.jsx      ← Login state shared across all pages
    │
    ├── layout/
    │   └── Layout.jsx           ← The page wrapper (header + taskbar)
    │
    ├── pages/
    │   └── Dashboard.jsx        ← The main dashboard page (brain of the UI)
    │
    ├── services/
    │   └── api.js               ← All API calls to the backend in one place
    │
    └── components/
        ├── dashboard/           ← All the dashboard widgets/panels
        │   ├── RiskScore.jsx        ← Security health score gauge
        │   ├── ScanButton.jsx       ← Start a new scan button
        │   ├── ScanHistory.jsx      ← Table of past scans
        │   ├── ActionCenter.jsx     ← Auto-generated remediation tasks
        │   ├── NetworkTopology.jsx  ← Visual network map
        │   ├── VulnerabilitiesPanel.jsx ← Vulnerability management panel
        │   ├── AgentLogViewer.jsx   ← AI agent thinking log viewer
        │   ├── TargetsManager.jsx   ← Target management
        │   ├── ActivityFeed.jsx     ← Live activity stream
        │   ├── Reports.jsx          ← PDF report generator
        │   ├── AssetDetailPanel.jsx ← Device detail popup
        │   └── Taskbar.jsx          ← Bottom status bar
        │
        ├── OpenVAS/             ← OpenVAS scanner specific components
        │   ├── ScanButton.jsx       ← Start OpenVAS scan
        │   ├── RiskChart.jsx        ← Vulnerability severity chart
        │   ├── Scheduler.jsx        ← Schedule automated scans
        │   └── VulnerabilitiesList.jsx ← OpenVAS results list
        │
        └── ui/
            └── Tabs.jsx             ← Reusable tabs navigation component
```

---

## 🌐 Part 1: `index.html` — The Single HTML File

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>found 404 // Core Node</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 🔍 Line-by-Line Explanation

| Line | What it does |
|------|--------------|
| `<!doctype html>` | Tells the browser "this is an HTML5 document" |
| `<meta charset="UTF-8" />` | Supports all characters including Arabic, emoji, etc. |
| `<meta name="viewport" ...>` | Makes the page responsive on mobile devices |
| `<title>found 404 // Core Node</title>` | The text shown in the browser tab |
| `<div id="root"></div>` | This is the **container** where React injects the entire app. It starts empty. React fills it in. |
| `<script type="module" src="/src/main.jsx">` | Loads the JavaScript app. `type="module"` means it supports modern ES6 imports |

> **Key concept**: This is a **Single Page Application (SPA)**. There's only ONE HTML file. React dynamically swaps content inside `<div id="root">` without ever reloading the page.

> ### 📝 ملخص بالعربي — Part 1
> هذا الملف هو **صفحة HTML الوحيدة** في المشروع بالكامل. يحتوي فقط على:
> - عنصر `<div id="root">` الذي يُحقن فيه كامل تطبيق React
> - وسم `<script>` الذي يحمّل ملف JavaScript الرئيسي
> التطبيق من نوع **SPA** (تطبيق صفحة واحدة) — لا تُعاد تحميل الصفحة أبدًا بل يتغير المحتوى ديناميكيًا

---

## 📦 Part 2: `package.json` — The Dependencies List

```json
{
    "name": "sme-cyber-dashboard-frontend",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "axios": "^1.6.2",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "recharts": "^2.10.3",
        "lucide-react": "^0.294.0",
        "react-force-graph-2d": "^1.25.4",
        "d3-force": "^3.0.0",
        "ldrs": "^1.0.1"
    },
    "devDependencies": {
        "vite": "^5.0.0",
        "tailwindcss": "^3.3.6"
    }
}
```

### 🔍 Explanation

Think of `package.json` as a **shopping list** of all the tools and libraries the project needs.

#### The `scripts` section — Commands you can run:
| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts the **development server** at `localhost:5173` with hot-reload |
| `npm run build` | **Compiles** the project into static files ready for production |
| `npm run preview` | Previews the compiled production build locally |

#### The `dependencies` — Libraries used in production:
| Library | Purpose |
|---------|---------|
| `react` | The core React library — the UI framework |
| `react-dom` | Connects React to the actual browser DOM (the HTML page) |
| `axios` | Makes HTTP requests to the backend API (like `fetch` but more powerful) |
| `recharts` | Creates **charts and graphs** (used for the risk visualization charts) |
| `lucide-react` | Provides **hundreds of clean icons** (Shield, Bug, Activity, Brain, etc.) |
| `react-force-graph-2d` | Creates the **interactive network topology map** showing devices and connections |
| `d3-force` | Physics-based layout engine for the network graph — makes nodes repel/attract |
| `ldrs` | Animated **loading spinners** for scan progress indicators |

#### The `devDependencies` — Only used during development:
| Library | Purpose |
|---------|---------|
| `vite` | The **build tool and dev server** — much faster than webpack |
| `tailwindcss` | Utility-first CSS framework for styling |

> ### 📝 ملخص بالعربي — Part 2
> هذا الملف هو **قائمة المكتبات** المستخدمة في المشروع:
> - **React**: إطار عمل واجهة المستخدم الرئيسي
> - **Axios**: لإرسال الطلبات للـ API في الخلفية
> - **Recharts**: لرسم المخططات البيانية للمخاطر
> - **Lucide-react**: مكتبة الأيقونات (درع، حشرة، نشاط، إلخ)
> - **Vite**: أداة البناء السريعة التي تشغّل السيرفر التطويري

---

## ⚡ Part 3: `vite.config.js` — The Build Tool Config

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    }
})
```

### 🔍 Explanation

**Vite** is the tool that:
1. Starts the development server
2. Instantly applies code changes without reloading (called **Hot Module Replacement / HMR**)
3. Compiles all code into a single deployable bundle

| Setting | Purpose |
|---------|---------|
| `plugins: [react()]` | Tells Vite to understand JSX syntax (React's HTML-in-JavaScript format) |
| `host: true` | Makes the server accessible from other devices on the network (not just `localhost`) — needed inside Docker |
| `port: 5173` | The dev server runs on port 5173 (so you visit `http://localhost:5173`) |
| `watch: { usePolling: true }` | Detects file changes even inside Docker containers (where normal file watching doesn't work) |

> ### 📝 ملخص بالعربي — Part 3
> هذا الملف يُهيّئ **Vite** — أداة البناء السريعة:
> - يسمح لـ Vite بفهم React وJSX
> - يشغّل السيرفر على المنفذ 5173
> - يعمل داخل Docker بفضل إعداد `usePolling`

---

## 🎨 Part 4: `tailwind.config.js` — The Design System & Color Palette

```javascript
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                cyber: {
                    dark: "#020617",      // Deepest background — almost black
                    deep: "#0f172a",      // Dark navy
                    light: "#1e293b",     // Card backgrounds
                    accent: "#38bdf8",    // Sky Blue — primary interactive color
                    vibrant: "#8b5cf6",   // Purple — secondary highlights
                    neon: "#22d3ee",      // Cyan — glowing text effects
                    danger: "#ef4444",    // Red — critical alerts
                    success: "#10b981",   // Green — safe/good states
                    warning: "#f59e0b"    // Amber — medium warnings
                }
            },
            boxShadow: {
                'neon': '0 0 20px rgba(56, 189, 248, 0.3)',
                'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }
        }
    }
}
```

### 🔍 Explanation

**Tailwind CSS** is a utility-first CSS framework. Instead of writing `.my-button { color: blue; }`, you write `className="text-blue-500"` directly on the element.

This file extends Tailwind with **custom cybersecurity-themed colors** so you can write things like:
- `bg-cyber-dark` → deepest black background
- `text-cyber-accent` → sky blue interactive text
- `border-cyber-neon` → glowing cyan border
- `shadow-neon` → neon blue glow effect

#### The Custom Color System:
| CSS Name | Hex Color | Used For |
|----------|-----------|---------|
| `cyber-dark` | `#020617` | Main page background |
| `cyber-deep` | `#0f172a` | Secondary dark sections |
| `cyber-light` | `#1e293b` | Card backgrounds, panels |
| `cyber-accent` | `#38bdf8` | Buttons, links, focus states |
| `cyber-vibrant` | `#8b5cf6` | AI/code elements, secondary highlights |
| `cyber-neon` | `#22d3ee` | Glowing text, live indicators |
| `cyber-danger` | `#ef4444` | Critical vulnerabilities, errors |
| `cyber-success` | `#10b981` | Completed scans, safe assets |
| `cyber-warning` | `#f59e0b` | Medium severity warnings |

> ### 📝 ملخص بالعربي — Part 4
> هذا الملف يُعرّف **نظام الألوان والتصميم** للمشروع بأكمله:
> - كل لون له اسم مخصص (مثل `cyber-accent` للأزرق السمائي)
> - هذه الألوان تُعطي المشروع مظهرًا احترافيًا بثيم الأمن السيبراني (أسود + أزرق + بنفسجي)
> - الظلال النيون تُضفي تأثير الوهج المتوهج على العناصر التفاعلية

---

## 🎨 Part 5: `src/index.css` — Global Styles

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #020617;
  color: #f8fafc;
}

body {
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.08), transparent), 
              radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.08), transparent),
              #020617;
}

@layer components {
  .glass-card {
    @apply bg-white/5 backdrop-blur-md border border-white/10 shadow-glass rounded-2xl;
  }
  .glass-card-interactive {
    @apply glass-card hover:bg-white/10 hover:border-white/20 hover:shadow-neon cursor-pointer;
  }
  .neon-text {
    @apply text-cyber-neon drop-shadow-[0_0_8px_rgba(34,211,238,0.5)];
  }
}
```

### 🔍 Explanation

This file contains the **global styles** applied to the entire application.

| Code | Purpose |
|------|---------|
| `@tailwind base/components/utilities` | Injects all Tailwind CSS into the project |
| `font-family: 'Inter'` | Sets the font for the whole app to Inter — a clean modern typeface |
| `background: radial-gradient(...)` | Creates the subtle purple + blue **background glow** effect visible on the whole page |
| `.glass-card` | A **reusable CSS class** that creates the glassmorphism card effect — semi-transparent with blur and border |
| `.glass-card-interactive` | Same as `.glass-card` but **glows on hover** (for clickable cards) |
| `.neon-text` | Makes text glow with a cyan neon effect |
| `backdrop-blur-md` | The **frosted glass blur** effect behind panels |
| `::-webkit-scrollbar` | **Customizes the scrollbar** — makes it thin and blue instead of the default browser scrollbar |

> **"Glassmorphism"** is a modern design trend where panels look like frosted glass — see-through with a blur behind them. The `.glass-card` class creates this effect.

> ### 📝 ملخص بالعربي — Part 5
> هذا الملف يحتوي على **الأنماط العامة** للتطبيق:
> - الخط المستخدم في كل مكان: **Inter**
> - خلفية الصفحة: تدرج دائري بألوان بنفسجية وزرقاء خفية
> - **glassmorphism**: تأثير الزجاج المثلج على البطاقات (شفاف مع ضبابية)
> - شريط التمرير مخصص بلون أزرق رفيع

---

## 🚀 Part 6: `src/main.jsx` — The App Entry Point

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
```

### 🔍 Line-by-Line Explanation

| Line | What it does |
|------|--------------|
| `import React from 'react'` | Imports the React library — required for JSX to work |
| `import ReactDOM from 'react-dom/client'` | Imports the tool that connects React to the browser HTML |
| `import App from './App.jsx'` | Imports our root `App` component |
| `import './index.css'` | Loads global styles for the entire app |
| `document.getElementById('root')` | Finds the `<div id="root">` in `index.html` |
| `ReactDOM.createRoot(...).render(...)` | Tells React: *"Take the `<App />` component and inject it inside `<div id="root">`"* |
| `<React.StrictMode>` | A development tool that **warns you about potential issues** in your code (only in development, not production) |

> **This is where React "wakes up"**. Everything before this is just files — this line is what actually starts the app in the browser.

> ### 📝 ملخص بالعربي — Part 6
> هذا الملف هو **نقطة الإقلاع** لتطبيق React. يقوم بـ:
> - استيراد مكتبة React وـ ReactDOM
> - إيجاد العنصر `<div id="root">` في HTML
> - حقن مكون `<App />` بداخله — وهنا يبدأ التطبيق فعليًا

---

## 🌳 Part 7: `src/App.jsx` — The Root Component

```jsx
import React from 'react';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <Dashboard />
    );
}

export default App;
```

### 🔍 Explanation

`App.jsx` is extremely simple — it's just a **router/starter** that renders the main `Dashboard` page.

- In bigger applications, `App.jsx` would contain routing (using React Router) to switch between multiple pages like `/login`, `/dashboard`, `/settings`
- In this project, the single-page approach means everything lives inside the Dashboard page, which handles its own navigation via **tabs**

> ### 📝 ملخص بالعربي — Part 7
> هذا المكون هو **جذر شجرة React**. بسيط جدًا — فقط يُعرض مكون `Dashboard` الذي يحتوي على كل شيء.
> في مشاريع أكبر، سيحتوي هذا الملف على نظام توجيه (routing) لعدة صفحات

---

## 🔌 Part 8: `src/services/api.js` — The Backend Communication Layer

This is one of the **most important files** in the frontend. It's the only place where the frontend talks to the backend.

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});
```

### 🔍 The Axios Instance

| Code | Purpose |
|------|---------|
| `import axios from 'axios'` | Imports the HTTP request library |
| `import.meta.env.VITE_API_URL` | Reads the API URL from environment variables (configurable without code changes) |
| `\|\| 'http://localhost:8000/api/v1'` | If no env variable is set, use this default URL |
| `axios.create({...})` | Creates a **pre-configured axios instance**. All requests automatically use `baseURL` and headers |

Think of `api` as a **pre-addressed envelope** — you don't need to write the full address every time, just the specific path.

---

### 🔍 The Service Objects

The file is organized into **service modules**, each handling one type of data:

#### `scanService` — Manage Scans
```javascript
export const scanService = {
    startScan: (target, type) => api.post('/scans/', { target_url: target, scan_type: type }),
    getScans: () => api.get('/scans/'),
    getScanDetails: (id) => api.get(`/scans/${id}`),
    getReport: (id) => api.get(`/reports/${id}`),
};
```
| Method | HTTP Call | What It Does |
|--------|-----------|--------------|
| `startScan(target, type)` | `POST /scans/` | Starts a new security scan |
| `getScans()` | `GET /scans/` | Gets the list of all scans |
| `getScanDetails(id)` | `GET /scans/{id}` | Gets details of one specific scan |

#### `targetService` — Manage Targets
```javascript
export const targetService = {
    create: (data) => api.post('/targets/', data),
    list: (params) => api.get('/targets/', { params }),
    get: (id) => api.get(`/targets/${id}`),
    update: (id, data) => api.patch(`/targets/${id}`, data),
    discover: (domain) => api.post('/targets/discover', null, { params: { domain } }),
    delete: (id) => api.delete(`/targets/${id}`),
};
```
Full **CRUD** (Create, Read, Update, Delete) for targets. `discover` is special — it tells the backend to auto-discover subdomains.

#### `vulnerabilityService` — Manage Vulnerabilities
```javascript
export const vulnerabilityService = {
    list: (params) => api.get('/vulnerabilities/', { params }),
    update: (id, data) => api.patch(`/vulnerabilities/${id}`, data),
    revalidate: (id) => api.post(`/vulnerabilities/${id}/revalidate`),
    markFalsePositive: (id) => api.patch(`/vulnerabilities/${id}`, { status: 'false_positive' }),
    markFixed: (id) => api.patch(`/vulnerabilities/${id}`, { status: 'fixed' }),
};
```
Allows you to manage vulnerability lifecycle: mark as fixed, mark as false positive, or re-validate with AI.

#### `dashboardService` — Dashboard Data
```javascript
export const dashboardService = {
    getRiskOverview: () => api.get('/dashboard/risk-overview'),
    getActionItems: () => api.get('/dashboard/actions'),
    refreshRiskScores: () => api.post('/dashboard/refresh-risk'),
};
```

> ### 📝 ملخص بالعربي — Part 8
> هذا الملف هو **طبقة التواصل مع الـ API**. كل طلب HTTP للـ Backend يمر من هنا:
> - **scanService**: بدء الفحوصات وجلب نتائجها
> - **targetService**: إدارة الأهداف (إضافة، تعديل، حذف، اكتشاف)
> - **vulnerabilityService**: إدارة الثغرات (تحديد الحالة، طلب إعادة التحقق من AI)
> - **dashboardService**: جلب البيانات الإجمالية للوحة التحكم
> جميع الطلبات تستخدم **Axios** وتتوجه لـ `http://localhost:8000/api/v1`

---

## 🔐 Part 9: `src/context/AuthContext.jsx` — Authentication State

```jsx
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    const login = (newToken, username, role) => {
        setToken(newToken);
        setUser({ username, role });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
```

### 🔍 Line-by-Line Explanation

| Code | Purpose |
|------|---------|
| `createContext(null)` | Creates a **React context** — a way to share data across all components without passing it as props each time |
| `useState(() => localStorage.getItem('token'))` | Reads the saved token from the browser's **localStorage** on startup. This is how the user stays logged in after refreshing |
| `useEffect([token, user])` | Whenever `token` or `user` changes, **save them to localStorage** so they persist across page refreshes |
| `login(newToken, username, role)` | Called when user logs in — stores the JWT token and user info |
| `logout()` | Called when user logs out — clears everything |
| `<AuthContext.Provider value={...}>` | **Wraps children** with the auth context. Any child component can now access `token`, `user`, `login`, `logout` |
| `export const useAuth = () => useContext(AuthContext)` | A **custom hook** — any component can call `const { user, logout } = useAuth()` to access auth state |

> **Context** is like a **broadcast signal**. Instead of passing `user` prop through 10 layers of components, any component can just "tune in" to the AuthContext broadcast.

> ### 📝 ملخص بالعربي — Part 9
> هذا الملف يُدير **حالة تسجيل الدخول** للتطبيق بأكمله:
> - يحفظ **token** المستخدم في `localStorage` حتى يبقى مسجلاً بعد تحديث الصفحة
> - يوفر دوال `login()` و`logout()` لأي مكون يحتاجها
> - **Context** يعمل كـ "بث عام" — أي مكون يمكنه الوصول لبيانات المستخدم بدون تمرير props

---

## 🏗️ Part 10: `src/layout/Layout.jsx` — The Page Shell

```jsx
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-cyber-dark text-gray-100 ...">
            {/* Background Glow Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-vibrant/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-accent/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl ...">
                <h1>found <span>404</span></h1>
                <nav>Command Center | Engines | Intelligence | Infrastructure</nav>
            </header>

            {/* Main Content — everything gets injected here */}
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>

            <Taskbar />
        </div>
    );
};
```

### 🔍 Explanation

`Layout` is the **permanent wrapper** that every page uses. It contains:

| Section | Purpose |
|---------|---------|
| **Background Glows** | Two large blurred circles (purple top-right, blue bottom-left) create the ambient glow effect behind everything |
| **Header** | Sticky top bar with the brand name "found 404", nav links, and an admin avatar |
| `{children}` | **Placeholder** where the actual page content is injected. When you do `<Layout><Dashboard/></Layout>`, Dashboard appears here |
| **Taskbar** | The fixed bottom status bar |
| `sticky top-0 z-50` | Header stays at the top even when you scroll. `z-50` means it appears above all other content |
| `backdrop-blur-xl` | The header has a **frosted glass blur** so content scrolling behind it looks cool |

> **`{children}`** is one of React's most powerful patterns. It's like a **slot** that accepts any JSX you put between the opening and closing tags of the component.

> ### 📝 ملخص بالعربي — Part 10
> هذا المكون هو **الغلاف الثابت** لكل صفحة. يحتوي على:
> - تأثيرات الوهج الخلفي (دوائر ضبابية بنفسجية وزرقاء)
> - **الهيدر** الثابت في الأعلى مع اسم المشروع وروابط التنقل
> - `{children}` — الفتحة التي يُحقن فيها محتوى كل صفحة
> - **Taskbar** — شريط الحالة الثابت في الأسفل

---

## 🧠 Part 11: `src/pages/Dashboard.jsx` — The Main Dashboard (Brain of the UI)

This is the **largest and most important** frontend file. It controls which tab is shown, handles scan polling, and coordinates all widgets.

### 🔍 State Variables

```jsx
const [activeTab, setActiveTab] = useState('overview');   // Which tab is active
const [refreshKey, setRefreshKey] = useState(0);          // Forces child re-renders
const [latestScan, setLatestScan] = useState(null);       // Latest scan data
const [selectedScanId, setSelectedScanId] = useState(null); // Selected scan for AI logs
const [isScanning, setIsScanning] = useState(false);      // Is a scan running?
```

`useState` is how React **remembers data** between renders. When you call `setActiveTab('network')`, React re-renders the component with the new value.

---

### 🔍 The Polling System (Auto-Detect Scan Progress)

```jsx
useEffect(() => {
    const checkScanStatus = async () => {
        const response = await scanService.getScans();
        const runningScan = response.data?.find(s => s.status === 'RUNNING' || s.status === 'QUEUED');

        if (runningScan) {
            setIsScanning(true);
            pollInterval = setInterval(checkScanStatus, 3000); // Check every 3 seconds
        } else {
            if (isScanning) {
                setIsScanning(false);
                setActiveTab('network'); // ← AUTO-REDIRECT when scan finishes!
                setRefreshKey(prev => prev + 1);
            }
        }
    };

    checkScanStatus();
    const initialInterval = setInterval(checkScanStatus, 10000); // Check every 10s normally
    return () => clearInterval(initialInterval); // Cleanup on unmount
}, [isScanning, refreshKey]);
```

**This is the auto-refresh system:**

| Logic | What happens |
|-------|-------------|
| Every 10 seconds | Checks if any scan is `RUNNING` or `QUEUED` |
| Scan found running | Sets `isScanning = true`, increases polling to every 3 seconds |
| Scan just finished | Sets `isScanning = false`, **auto-switches to the Network tab**, triggers data refresh |
| Component unmount | Clears the interval to prevent memory leaks |

---

### 🔍 The Tab System

```jsx
const tabs = [
    { id: 'overview',        label: 'Overview',        icon: <LayoutDashboard /> },
    { id: 'scanner',         label: 'Scanner',         icon: <ScanIcon /> },
    { id: 'targets',         label: 'Targets',         icon: <Target /> },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <Bug /> },
    { id: 'ai-console',      label: 'AI Console',      icon: <Brain /> },
    { id: 'network',         label: 'Network',         icon: <Network /> },
    { id: 'history',         label: 'History',         icon: <History /> },
    { id: 'reports',         label: 'Reports',         icon: <FileText /> },
    { id: 'active',          label: 'Live',            icon: <Activity /> },
    { id: 'settings',        label: 'Settings',        icon: <Settings /> },
];
```

And each tab renders different content:
```jsx
{activeTab === 'overview' && <RiskScore /> <ScanButton /> <ActionCenter /> <ScanHistory />}
{activeTab === 'scanner' && <OpenVasScanButton /> <RiskChart /> <VulnerabilitiesList />}
{activeTab === 'targets' && <TargetsManager />}
{activeTab === 'vulnerabilities' && <VulnerabilitiesPanel />}
{activeTab === 'ai-console' && <AgentLogViewer />}
{activeTab === 'network' && <NetworkTopology />}
{activeTab === 'history' && <ScanHistory />}
{activeTab === 'reports' && <Reports />}
{activeTab === 'active' && <ActivityFeed />}
```

The `&&` operator means: **"Only render this if the condition is true"**. It's React's way of doing conditional rendering.

> ### 📝 ملخص بالعربي — Part 11
> هذا هو **الدماغ الرئيسي** للواجهة الأمامية. يتحكم في:
> - **نظام التبويبات**: أي تبويب مفتوح يحدد ما يُعرض
> - **نظام الاستطلاع (Polling)**: كل 10 ثوانٍ يسأل الـ Backend هل يوجد فحص نشط؟
> - إذا انتهى الفحص، يتحول تلقائيًا لتبويب **الشبكة** لعرض النتائج
> - `useState` لحفظ البيانات بين التصيُّرات، `useEffect` لتنفيذ كود جانبي

---

## 🔩 Part 12: The Dashboard Components (Widgets)

### 12.1 — `RiskScore.jsx` — Security Health Gauge

```jsx
const RiskScore = ({ score }) => {
    // Determines grade (A/B/C/D/F) and color based on score
    if (score >= 80) { grade = 'A'; label = 'Excellent'; color = 'green' }
    else if (score >= 60) { grade = 'B'; label = 'Good'; color = 'blue' }
    else if (score >= 40) { grade = 'C'; label = 'Fair'; color = 'yellow' }
    else if (score >= 20) { grade = 'D'; label = 'Poor'; color = 'orange' }
    else { grade = 'F'; label = 'Critical'; color = 'red' }

    // SVG circle: strokeDashoffset creates the "filling" arc animation
    strokeDashoffset={440 - (440 * score) / 100}
};
```

This component renders a **circular progress gauge** using an SVG (Scalable Vector Graphic):
- The circle has a circumference of `440` units
- `strokeDashoffset` controls how much of the circle is "filled"
- Score 100% → offset = 0 (full circle) | Score 0% → offset = 440 (empty circle)
- The grade letter (A/B/C/D/F) is overlaid in the center

---

### 12.2 — `ScanButton.jsx` — Start Scan Widget

```jsx
const ScanButton = ({ onScanStarted }) => {
    const [loading, setLoading] = useState(false);
    const [target, setTarget] = useState('localhost');

    const handleScan = async () => {
        setLoading(true);
        try {
            await scanService.startScan(target, 'quick');
            if (onScanStarted) onScanStarted(); // ← Notify parent
        } finally {
            setLoading(false);
        }
    };
};
```

| Concept | Explanation |
|---------|-------------|
| `loading` state | When `true`, shows a spinner instead of the button text (prevents double-clicking) |
| `await scanService.startScan(...)` | **Async/await**: Wait for the API response before continuing |
| `onScanStarted()` | **Callback prop** — tells the parent Dashboard "scan started!" so it can update its state |
| `disabled={loading}` | Button is disabled while the request is processing |

---

### 12.3 — `ActionCenter.jsx` — Auto-Generated Task List

```jsx
const ActionCenter = () => {
    const [actions, setActions] = useState([]);

    useEffect(() => {
        fetchActions(); // Load on mount
    }, []);

    const fetchActions = async () => {
        const { data } = await dashboardService.getActionItems();
        setActions(data);
    };
};
```

This widget:
1. **Automatically loads** action items from the backend when it first appears (`useEffect` with empty deps `[]`)
2. The backend's `RiskEngine` creates these action items automatically when risk scores are high
3. Each action shows its **priority, title, and description** with color-coded borders (red = CRITICAL, orange = HIGH, yellow = MEDIUM)

---

### 12.4 — `ScanHistory.jsx` — Past Scans Table

This component renders a **sortable table** of all past scans. Key features:
- Loads on mount and whenever `refresh` prop changes (parent triggers this when a new scan completes)
- Each row shows: Scan ID, Target, Status (with icon), Risk Score (color-coded), Date, and Actions
- **Expandable rows**: Click a scan ID to reveal more details (duration, scan type, vulnerability count)
- **Download Report**: Opens the PDF report URL in a new browser tab

---

### 12.5 — `Taskbar.jsx` — Bottom Status Bar

```jsx
const Taskbar = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer); // Cleanup!
    }, []);
};
```

A fixed bottom bar that:
- Updates a **live clock** every second using `setInterval`
- Shows static status indicators: "System Secure", "Backend: Online", "Monitoring Active"
- The `return () => clearInterval(timer)` is a **cleanup function** — when the component unmounts, the timer stops (preventing memory leaks)

> ### 📝 ملخص بالعربي — Part 12 (مكونات لوحة التحكم)
> - **RiskScore**: يُعرض درجة الأمان كقرص دائري SVG مع حرف تقدير (A/B/C/D/F)
> - **ScanButton**: زر يُرسل طلبًا للـ API لبدء الفحص، مع منع النقر المزدوج
> - **ActionCenter**: يجلب تلقائيًا قائمة المهام ذات الأولوية من الـ Backend
> - **ScanHistory**: جدول بكل الفحوصات السابقة مع تفاصيل قابلة للتوسع
> - **Taskbar**: شريط حالة سفلي يعرض ساعة حية تُحدَّث كل ثانية

---

## 🗺️ Part 13: The Complete Frontend Data Flow

Here is **what happens visually and technically** when you use the app:

```
BROWSER OPENS:
─────────────
1. Browser loads index.html
2. React starts via main.jsx → App.jsx → Dashboard.jsx
3. useEffect fires:
   └─ Checks scan status every 10 seconds in background
   └─ Calls dashboardService.refreshRiskScores()

USER CLICKS A TAB:
──────────────────
4. setActiveTab('vulnerabilities') is called
5. React re-renders Dashboard
6. {activeTab === 'vulnerabilities' && <VulnerabilitiesPanel />} evaluates to true
7. VulnerabilitiesPanel mounts and fetches data from backend

USER TYPES TARGET AND CLICKS SCAN:
───────────────────────────────────
8. ScanButton.handleScan() runs
9. scanService.startScan('192.168.1.0/24', 'quick') → POST /api/v1/scans/
10. Backend returns { "id": "abc-123", "status": "queued" }
11. onScanStarted() callback fires → Dashboard switches to 'history' tab
12. isScanning = true → polling increases to every 3 seconds
13. Banner "Scanning Active" appears with pulsing AI brain icon

SCAN COMPLETES:
───────────────
14. Polling detects no more RUNNING scans
15. isScanning = false
16. refreshKey incremented → child components reload their data
17. Auto-redirect to 'network' tab to show discovered assets
18. NetworkTopology renders the interactive graph
```

---

## 🔑 Part 14: Key React Concepts Used in This Project

| Concept | What It Is | Where Used |
|---------|-----------|------------|
| **Component** | A reusable UI piece. A function that returns JSX | Every `.jsx` file |
| **Props** | Data passed from parent to child component | `<ScanHistory refresh={refreshKey} />` |
| **State (`useState`)** | Data that lives inside a component and triggers re-render when changed | `activeTab`, `isScanning`, etc. |
| **Effect (`useEffect`)** | Runs code as a side effect (API calls, timers) after rendering | Polling, data fetching |
| **Context** | Global state shareable across the entire component tree | `AuthContext` |
| **Conditional Rendering** | `{condition && <Component />}` — render only if true | Tab switching in Dashboard |
| **Callback Props** | Pass a function as a prop so a child can "call up" to its parent | `onScanStarted` in ScanButton |
| **Async/Await** | Modern way to handle asynchronous operations (API calls) | All API calls in services |
| **Cleanup Functions** | `return () => clearInterval(...)` inside useEffect prevents memory leaks | Taskbar, Dashboard polling |
| **Fragment** | `<React.Fragment>` — a wrapper that doesn't add HTML elements | ScanHistory expandable rows |

---

## 📚 Quick Reference Glossary

| Term | Simple Explanation |
|------|--------------------|
| **JSX** | JavaScript + HTML combined syntax. React components are written in JSX |
| **Component** | A self-contained, reusable piece of UI (like a button or a card) |
| **Props** | Short for "properties" — data passed from a parent to a child component |
| **State** | Data stored inside a component. When state changes, React re-renders |
| **Hook** | Special React functions that start with `use` (useState, useEffect, useContext) |
| **useEffect** | Runs code AFTER rendering — used for API calls, timers, subscriptions |
| **Context** | Global shared data — avoids "prop drilling" through many levels |
| **Render** | The process of React computing and updating the UI |
| **DOM** | Document Object Model — the browser's internal representation of your HTML |
| **SPA** | Single Page Application — one HTML file, content changes via JavaScript |
| **HMR** | Hot Module Replacement — code changes appear instantly without full reload |
| **Tailwind** | CSS framework where you style elements with class names like `bg-blue-500` |
| **Axios** | HTTP client library for making API requests (like fetch but more powerful) |
| **async/await** | JavaScript syntax for writing asynchronous code that reads like synchronous |
| **Polling** | Repeatedly checking for updates (e.g., checking scan status every 3 seconds) |
| **Glassmorphism** | Design style: semi-transparent panels with frosted blur effect |
| **Callback** | A function passed as an argument, called when something happens |
| **Vite** | Ultra-fast frontend build tool and dev server |

---

*This document was auto-generated as part of the SME Cyber Exposure Dashboard project documentation.*
