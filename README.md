# snoopfish 🕵️‍♂️🐟

> **Autonomous Web-Forensic Auditor for Vendors, Recruiters & Ghost Programs.**  
> Built for **Swim with TinyFish Hackathon @ Presidency University**.

---

<p align="center">
  <a href="https://snoopfish.vercel.app">
    <img src="https://img.shields.io/badge/Frontend%20Production-snoopfish.vercel.app-F7A8D8?style=for-the-badge&logo=vercel&logoColor=121212" alt="Vercel Production" />
  </a>
  <a href="https://snoopfish-backend.onrender.com/health">
    <img src="https://img.shields.io/badge/Backend%20API%20Service-snoopfish--backend.onrender.com-76E5B1?style=for-the-badge&logo=render&logoColor=121212" alt="Render API" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Next.js%2014%20|%20FastAPI%20|%20TinyFish%20Agents%20|%20SQLite-FFAE33?style=flat-square" alt="Architecture" />
  <img src="https://img.shields.io/badge/Tests-10%2F10%20Passing%20(pytest)-76E5B1?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/Lint-flake8%20Clean-54C4F8?style=flat-square" alt="Lint" />
  <img src="https://img.shields.io/badge/License-MIT-F9D849?style=flat-square" alt="License" />
</p>

---

## 1. Executive Summary & Problem Landscape

### The Modern Threat Landscape
Students, early-career job seekers, and independent procurement managers are besieged by increasingly sophisticated fraudulent schemes:
- **Predatory Job Recruiters:** Impersonating legitimate agencies on WhatsApp, Telegram, or cloned landing pages, demanding advance "training security fees" or "equipment insurance deposits."
- **Ghost Vendors & Shadow E-Commerce:** Freshly registered, visually cloned online storefronts offering cut-price inventory, collecting advance wire payments or credit card numbers before vanishing.
- **Unaccredited Credential Mills:** Educational ventures issuing fake degrees or bootcamps with fabricated board director accreditations and fictitious corporate registration numbers.

### The Manual Due-Diligence Burden
Performing forensic background due diligence on a suspicious entity today is intensely manual and takes 20 to 30 minutes across multiple fragmented platforms:
1. **Domain & DNS Registrars (WHOIS/RDAP):** Checking creation dates, registrar cloaking shields, and expiry patterns.
2. **Corporate Filings (MCA / SEC EDGAR / Companies House):** Manually searching corporate registration indices, identifying active Directors (DINs), and confirming active legal filing standing.
3. **Consumer Threat Forums & Blacklists:** Digging through unindexed discussion threads on Reddit (`r/Scams`), Trustpilot, Better Business Bureau, and national cybercrime databases.

Because of this friction, **over 85% of users skip verification entirely**—only uncovering the fraud after irreversible financial loss.

### The SnoopFish Solution
**SnoopFish** is an autonomous web-agent intelligence pipeline. Instead of relying on brittle, paywalled, or non-existent public APIs, SnoopFish dispatches real **TinyFish autonomous web agents** running inside cloud headless browser containers. 

The agent navigates live registrar queries, executes corporate directory searches, scans threat boards, and extracts verified structured attributes. SnoopFish calculates an explainable **0–100 Composite Trust Score** and streams both the structured forensic dossier and the live remote browser cam directly to the user's dashboard in real time.

---

## 2. System Architecture & Dual Execution Strategy

### High-Level Full-Stack Data Flow

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                       |
|  - Neo-Brutalist Dashboard (Next.js 14 App Router, TypeScript, Tailwind CSS)           |
|  - Real-Time Investigation Radar (Progressive 4-phase radar ticker + stopwatch)         |
|  - "The TinyFish Browser Cam" (Retro arcade monitor with live iframe stream)            |
|  - Forensic Dossier Display (0-100 Trust Score gauge, director DINs, risk flags)        |
+--------------------------------------------+--------------------------------------------+
                                             | HTTP / Server-Sent Events (SSE)
                                             v
+-----------------------------------------------------------------------------------------+
|                               FASTAPI ORCHESTRATION LAYER                               |
|  - POST /api/audit/stream  --> Streams live TinyFish progress & final JSON dossier      |
|  - GET  /api/audit/stream  --> Browser-native EventSource query-param streaming        |
|  - GET  /api/audits        --> Fetches persistent SQLite forensic audit archive         |
|  - GET  /health            --> Health probe & TinyFish configuration handshake          |
|  - Heuristic Trust Scorer  --> 0-100 composite risk scoring engine                      |
+--------------------------------------------+--------------------------------------------+
                                             |
             +-------------------------------+-------------------------------+
             | (Live Agent Mode)                                             | (Demo Replay Mode)
             v                                                               v
+-----------------------------------------+     +-----------------------------------------+
|        TINYFISH CLOUD AGENT API         |     |       INTERNAL DEMO SIMULATOR           |
| (https://agent.tinyfish.ai/v1/          |     | (/demo-feed/[slug] Next.js Route)       |
|  automation/run-sse)                    |     | - Preset 1: Apex Global Logistics       |
| - Headless Chromium Container           |     |   (11-day fresh domain, unverified MCA, |
| - Step 1: WHOIS DNS & Domain Age Scan   |     |    advance fee fraud threads)           |
| - Step 2: MCA/SEC Directory Verification|     | - Preset 2: Infosys Technologies Ltd    |
| - Step 3: Threat Forum Intelligence     |     |   (25+ years aged, active CIN,          |
| - Emits: streaming_url, logs, result    |     |    accredited board of directors)       |
+--------------------+--------------------+     +--------------------+--------------------+
                     |                                               |
                     +-----------------------+-----------------------+
                                             |
                                             v
                      +---------------------------------------------+
                      |         SQLITE PERSISTENCE LAYER            |
                      |   (snoopfish.db via async aiosqlite)        |
                      | - Audit ID, Entity Name, Target URL         |
                      | - Trust Score, Risk Tier, Raw Report JSON   |
                      | - Timestamped history with 1-click replay   |
                      +---------------------------------------------+
```

### Dual Execution Strategy

```
                                 [ User Submits Audit Target ]
                                               |
                                               v
                                 Is Demo Mode Switch Active?
                                      /                 \
                                    YES                  NO
                                    /                     \
        +-----------------------------------+     +-----------------------------------+
        |       OFFLINE PITCH FAILOVER      |     |         LIVE TINYFISH AGENT       |
        | - Zero-latency presentation mode  |     | - Real-time headless browser run  |
        | - Streams from demo_data.py       |     | - TinyFish API via async HTTP SSE |
        | - Iframe points to internal route |     | - Iframe streams live cloud URL   |
        |   `/demo-feed/[slug]`             |     |   emitted by TinyFish server      |
        | - Guaranteed 100% stage uptime    |     | - Laser-focused 3-query budget    |
        +-----------------------------------+     +-----------------------------------+
                                    \                     /
                                     v                   v
                        [ Synthesize 0-100 Composite Trust Score ]
                                           |
                                           v
                        [ Stream Typed SSE Events to Dashboard ]
                                           |
                                           v
                        [ Persist Completed Dossier to SQLite ]
```

---

## 3. Complete Codebase Breakdown

```
D:\projects\tinyfish AI\
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # GitHub Actions pipeline (lint + unit tests + Next.js build)
├── backend/
│   ├── app/
│   │   ├── __init__.py                 # Backend package namespace
│   │   ├── config.py                   # Pydantic Settings loading environment & CORS origins
│   │   ├── db.py                       # SQLite database schema, aiosqlite connection pool & queries
│   │   ├── main.py                     # FastAPI server, lifespan hooks, CORS regex, and endpoints
│   │   ├── models.py                   # Pydantic schemas (AuditRequest, TinyFishAuditOutput, Scorer)
│   │   └── services/
│   │       ├── __init__.py             # Services package namespace
│   │       ├── demo_data.py            # High-fidelity mock SSE streams (Apex scam vs. Infosys legit)
│   │       └── tinyfish_client.py      # Async HTTP SSE client with query caps & stream parsing
│   ├── tests/
│   │   ├── __init__.py                 # Test package namespace
│   │   ├── test_api.py                 # Health, validation, CORS, SSE, and SQLite integration tests
│   │   └── test_scorer.py              # Heuristic trust score algorithm unit tests & clamping checks
│   ├── .env.example                    # Template environment variables (safe dummy values)
│   ├── requirements.txt                # Production Python dependencies
│   └── test_tinyfish.py                # Standalone connection smoke test for live TinyFish API
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── demo-feed/
│   │       │   └── [slug]/
│   │       │       └── page.tsx        # Simulated browser arcade view for pitch demo replay
│   │       ├── globals.css             # Tailwind base and Neo-Brutalist surface resets
│   │       ├── layout.tsx              # Metadata, fonts, and root container layout
│   │       └── page.tsx                # Main dual-pane dashboard, radar ticker & dossier UI
│   ├── next.config.mjs                 # Next.js configuration with backend proxy rewrites
│   ├── package.json                    # Node dependencies (Next.js 14, React 18, Tailwind, Lucide)
│   ├── postcss.config.mjs              # PostCSS plugins for Tailwind CSS
│   ├── tailwind.config.ts              # Neo-Brutalist color tokens, hard zero-blur box shadows
│   └── tsconfig.json                   # TypeScript compiler options & path aliases
├── .gitignore                          # Strict exclusion of .env, *.db, *.gemini, node_modules, .next
├── pre_build_project_documentation.md  # Original hackathon project specification and roadmap
└── README.md                           # Comprehensive documentation & architecture guide
```

### Detailed Component Mechanics

#### Backend (`backend/`)
- **[`backend/app/main.py`](backend/app/main.py):** Initializes the FastAPI application with metadata ("SnoopFish API"). Employs an `asynccontextmanager` lifespan hook that guarantees SQLite tables exist upon startup. Configures `CORSMiddleware` with `allow_origin_regex=r"https://.*\.vercel\.app"` alongside explicit origins (`http://localhost:3000`), enabling seamless cross-origin SSE consumption on local machines, Vercel preview environments, and production. Mounts:
  - `GET /health`: Health status probe verifying TinyFish key presence.
  - `POST /api/audit/stream`: Consumes `AuditRequest` JSON, yielding SSE event streams.
  - `GET /api/audit/stream`: URL-query alternative compatible with browser-native `EventSource`.
  - `GET /api/audits`: Returns historical audit records sorted chronologically from SQLite.
- **[`backend/app/config.py`](backend/app/config.py):** Built on `pydantic-settings`. Reads `TINYFISH_API_KEY`, `TINYFISH_API_URL`, `CORS_ORIGINS`, and `PORT` from `.env`. Sanitizes `CORS_ORIGINS` whether passed as a raw JSON array string or comma-delimited list.
- **[`backend/app/models.py`](backend/app/models.py):** Implements Pydantic v2 validation contracts:
  - `AuditRequest`: Validates incoming target entity names (min length 1) and optional URL targets.
  - `TinyFishAuditOutput`: Strict contract capturing `domain_age_days`, `registration_verified`, `registered_directors`, `risk_flags`, and `summary`.
  - `AuditScoreReport`: Encapsulates calculated trust score, risk tier, color classification, and point deduction receipts.
  - `calculate_trust_score(...)`: Core algorithm calculating deductions and clamping output between 0 and 100.
  - `TINYFISH_OUTPUT_SCHEMA`: Native JSON schema passed into the TinyFish agent API to guarantee deterministic JSON output extraction.
- **[`backend/app/services/tinyfish_client.py`](backend/app/services/tinyfish_client.py):** The primary autonomous engine interface. Wraps `httpx.AsyncClient` with a 180s read timeout. Constructs a laser-focused goal prompt restricting agent execution to a strict budget of **maximum 3 queries and no more than 4 page navigations** (WHOIS -> Corporate Registry -> Fraud Forum Scan), instructing the agent to bypass peripheral blog links and synthesize immediately. Streams response chunks via `aiter_lines()`, parsing SSE event buffers into normalized event types: `status`, `streaming_url`, `progress`, `result`, and `error`.
- **[`backend/app/services/demo_data.py`](backend/app/services/demo_data.py):** Provides the fail-safe presentation engine. Yields timed, realistic SSE events for two high-fidelity profiles:
  - **Apex Global Logistics (High-Risk Scam):** 11-day domain age, privacy guard, 0 matching MCA corporate records, Reddit advance-fee freight fraud reports (Score: 25).
  - **Infosys Technologies Ltd (Low-Risk Legit):** 25+ years domain age, verified CIN `L85110KA1981PLC013115`, accredited board directors (Score: 96).
  - Points the `streaming_url` to the internal simulated browser routes `/demo-feed/apex` and `/demo-feed/infosys`.
- **[`backend/app/db.py`](backend/app/db.py):** Asynchronous SQLite persistence using `aiosqlite`. Manages the `audits` table (`id`, `target_name`, `target_url`, `score`, `risk_level`, `report_json`, `created_at`). Features thread-safe helper routines `save_audit(...)` and `get_recent_audits(limit=10)`.

#### Frontend (`frontend/`)
- **[`frontend/src/app/page.tsx`](frontend/src/app/page.tsx):** The core command center:
  - **Top Nav:** Lowercase chunky branding (`snoopfish`), mode switch pill (Live Agent vs. Safe Demo Mode), and Past Audits history drawer trigger.
  - **Hero Section:** Pastel Pink canvas (`#F7A8D8`) with cheekily bold headline `"background checks....kinda"`, entity search capsule, and 1-click preset demo buttons.
  - **Live Investigation Workspace:** Mustard Yellow canvas (`#F9D849`) housing:
    - *Left Card ("The TinyFish Browser Cam"):* Styled like a retro arcade monitor with a pulsing red `LIVE FEED` recording indicator, expandable viewport modal (`Expand Monitor`), and a real-time agent execution ticker.
    - *Right Card ("Forensic Dossier"):* While an audit is running, displays the animated **4-Step Progressive Radar** and live stopwatch timer (`⏱️ 00:xxs`). Once complete, transforms into the verified dossier featuring the 0–100 Trust Score gauge, director DIN list, risk flag callouts, summary, and a 1-click **Export Markdown Dossier** button.
  - **SSE Client:** Custom `fetch` stream consumer using `ReadableStream` and `TextDecoder` that dynamically splits `data: ` chunks and translates events to the UI.
- **[`frontend/src/app/demo-feed/[slug]/page.tsx`](frontend/src/app/demo-feed/[slug]/page.tsx):** Dedicated simulated browser environment for offline demo runs. Renders realistic browser chrome, address bar with SSL lock, auto-cycling tabs (WHOIS -> MCA Corporate Registry -> Reddit Scam Search), pulsing highlight callouts, and an animated floating agent cursor.
- **[`frontend/tailwind.config.ts`](frontend/tailwind.config.ts):** Encodes the Neo-Brutalist Super Hello design system with custom color tokens:
  - `neo-pink`: `#F7A8D8` (Hero background)
  - `neo-yellow`: `#F9D849` (Workspace canvas)
  - `neo-orange`: `#FFAE33` (Action buttons & primary CTA)
  - `neo-cream`: `#FFFDF9` (Surface cards & inputs)
  - `neo-black`: `#121212` (Borders, hard shadows, text)
  - `neo-mint`: `#76E5B1` (Low risk / high trust indicators)
  - `neo-red`: `#FF6B6B` (Severe danger / scam alert indicators)
  - `neo-blue`: `#54C4F8` (Pills, badges, and accents)
  - Zero-blur hard offset shadows: `shadow-neo` (`4px 4px 0px 0px #121212`), `shadow-neo-lg` (`6px 6px`), `shadow-neo-xl` (`8px 8px`), and `shadow-neo-hover` (`2px 2px`).
- **[`frontend/next.config.mjs`](frontend/next.config.mjs):** Configured with Next.js rewrites mapping all client-side `/api/:path*` requests directly to `BACKEND_URL` (defaulting to the live Render deployment `https://snoopfish-backend.onrender.com/api/:path*`), eliminating CORS overhead in hosted environments.

---

## 4. Forensic Trust Scoring Engine & Radar Phases

### The 4 Progressive Investigation Phases

| Phase | Radar Phase Name | Actions Performed by Autonomous Agent |
|---|---|---|
| **Phase 1** | **🌐 Resolving DNS & Registrar Integrity** | Queries global RDAP/WHOIS databases. Measures domain age in days. Inspects registrar reputation and detects obfuscated privacy shields in high-risk jurisdictions. |
| **Phase 2** | **🏛️ Querying Corporate & Director Registries** | Navigates Ministry of Corporate Affairs (MCA), SEC EDGAR, or state databases. Validates legal entity incorporation, active CIN/GST standing, and verifies registered board members. |
| **Phase 3** | **🛡️ Sweeping Consumer Threat Intel & Blacklists** | Scours Reddit (`r/Scams`), Trustpilot, Better Business Bureau, and blacklists. Flags advance-fee fraud patterns, cloned portal layouts, or spoofed contact numbers. |
| **Phase 4** | **⚡ Synthesizing Forensic Dossier** | Evaluates gathered telemetry against deterministic deduction rules, calculates the 0–100 Trust Score, assigns the categorical risk tier, and compiles the final dossier. |

### Mathematical Scoring Algorithm

```
Base Trust Score = 100 Points

Deduction Heuristics:
├── Domain Age Check:
│   ├── If domain_age_days < 30 days  ──> Deduct 40 Points  (High-risk fly-by-night domain)
│   └── Else if domain_age_days < 90  ──> Deduct 20 Points  (Fresh, unestablished domain)
├── Corporate Registration Check:
│   └── If registration_verified == False ──> Deduct 35 Points (Unverified shadow entity)
└── Consumer Threat Signals:
    └── Each identified risk flag detected ──> Deduct 10 Points (Capped at -30 Points max)

Final Trust Score = Clamp(Score, min=0, max=100)
```

### Risk Tier Categorization

```
Trust Score   Risk Tier           Classification & Action Recommended
─────────────────────────────────────────────────────────────────────────────────────────────
80 – 100      LOW_RISK            High confidence verified entity. Longstanding domain history,
              (Mint Green)        active corporate filings, and clean public records.

50 – 79       MODERATE_CAUTION    Proceed with diligence. Intermediate domain freshness, limited
              (Mustard Yellow)    filing records, or minor consumer disputes noted.

0 – 49        SEVERE_DANGER       Critical alert. Substantial fraud indicators: newly minted
              (Neo Red)           domain, unverified corporate standing, or active scam reports.
```

---

## 5. Local Quickstart Guide

### Prerequisites
- **Node.js:** `v20.x` or higher
- **Python:** `3.11` or `3.12`
- **Git**

### 1. Clone & Prepare Directory
```bash
git clone https://github.com/rishikeshyadavv/snoopfish.git
cd snoopfish
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env   # Windows
# cp .env.example .env    # Linux/macOS
```

Ensure `backend/.env` contains your API credentials:
```env
TINYFISH_API_KEY=your_tinyfish_api_key_here
TINYFISH_API_URL=https://agent.tinyfish.ai/v1/automation/run-sse
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
PORT=8000
ENVIRONMENT=development
```

Start the FastAPI development orchestrator:
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: `http://localhost:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# (Optional) Point to local backend if not using Render default:
# set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Testing & Quality Assurance

SnoopFish maintains a 100% passing test suite covering API contracts, CORS rules, scoring heuristics, and SQLite persistence:

```bash
cd backend
pytest tests/ -v
```

### Automated Test Suite Matrix (10/10 Passing):

| Test Case | Target Subsystem | Verification Criteria |
|---|---|---|
| `test_health_check` | API Health | Confirms `GET /health` returns HTTP 200, status "ok", and validates TinyFish configuration flag. |
| `test_stream_post_validation` | Input Validation | Confirms `POST /api/audit/stream` rejects empty or whitespace-only target names with HTTP 422. |
| `test_stream_get_validation` | Query Validation | Confirms `GET /api/audit/stream` rejects missing target queries with HTTP 422. |
| `test_get_audits_endpoint` | Data Retrieval | Confirms `GET /api/audits` returns structured array of historical records. |
| `test_db_persistence` | SQLite Engine | Validates async table creation, insertion, and retrieval of report JSON via `aiosqlite`. |
| `test_demo_audit_stream_post` | Stream Orchestrator | Verifies `POST` with `demo=true` yields valid `text/event-stream` chunks (`status`, `streaming_url`, `result`). |
| `test_scorer_fresh_unverified_domain`| Heuristic Scorer | Tests fresh domain (<30d) + unverified status yields score < 40 and "SEVERE_DANGER" tier. |
| `test_scorer_verified_aged_domain` | Heuristic Scorer | Tests aged domain (>365d) + 0 flags yields score >= 85 and "LOW_RISK" tier. |
| `test_scorer_clamped_bounds` | Heuristic Scorer | Validates extreme penalties never produce negative scores or exceed the 0–100 boundary. |
| `test_scorer_moderate_risk` | Heuristic Scorer | Confirms 50–79 score calculations produce "MODERATE_CAUTION" tier and orange accent. |

### Code Quality & Linting
```bash
cd backend
flake8 . --count --max-line-length=120 --statistics
```
*(0 errors, 0 warnings across all Python modules)*

---

## 7. Production Deployment Runbook

### Live Deployments
- **Frontend (Vercel):** [https://snoopfish.vercel.app](https://snoopfish.vercel.app)
- **Backend (Render):** [https://snoopfish-backend.onrender.com](https://snoopfish-backend.onrender.com)

### Backend Deployment (Render Web Service)
1. **Environment:** Python 3.12
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables Configured:**
   - `TINYFISH_API_KEY`: Production TinyFish automation API key.
   - `TINYFISH_API_URL`: `https://agent.tinyfish.ai/v1/automation/run-sse`
   - `CORS_ORIGINS`: `["https://snoopfish.vercel.app","http://localhost:3000"]`
   - `ENVIRONMENT`: `production`

### Frontend Deployment (Vercel)
1. **Framework Preset:** Next.js
2. **Root Directory:** `frontend`
3. **Build Command:** `next build`
4. **Output Directory:** `.next`
5. **Environment Variables Configured:**
   - `NEXT_PUBLIC_API_URL`: `https://snoopfish-backend.onrender.com`
   - `BACKEND_URL`: `https://snoopfish-backend.onrender.com`

---

## 8. Security & Data Privacy

- **Zero Credential Leakage:** All API keys are isolated via environment variables. `backend/.env.example` contains only mock dummy values.
- **Git Hygiene:** Root [`.gitignore`](.gitignore) strictly excludes `.env`, `*.db`, `*.sqlite`, `.pytest_cache/`, `node_modules/`, `.next/`, and local agent configuration folders (`.antigravity/`, `.gemini/`).
- **No Session Token Storage:** SnoopFish never persists raw cookies, session tokens, or sensitive user passwords gathered during autonomous browsing sessions; only forensic public metadata is logged to the local SQLite store.
- **CORS Protection:** Fast-failing CORS middleware blocks unauthorized third-party domains while supporting legitimate Vercel preview environments.

---

## 9. Team & Attribution

Developed with 💖 for the **Swim with TinyFish Hackathon** hosted at **Presidency University**.

- **Autonomous Agent Engine:** [TinyFish AI](https://tinyfish.ai)
- **Design Aesthetic:** Super Hello Neo-Brutalist Retro-Tech
- **License:** MIT License
