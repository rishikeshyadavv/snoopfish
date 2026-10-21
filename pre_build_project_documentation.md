================================================================================
                    VERIFYLENS: PROJECT PRE-BUILD SPECIFICATION
================================================================================
Event: Swim with TinyFish Hackathon (Presidency University)
Architecture: Next.js Frontend + FastAPI Orchestrator + TinyFish Web Agent API
Budget Target: $0.00 (Free Tiers: TinyFish $8 Starter, Vercel, Render)
Tooling Environment: opencode / antigravity IDE / agy cli

================================================================================
1. PRODUCT REQUIREMENTS DOCUMENT (PRD)
================================================================================

1.1 Project Overview
-------------------
VerifyLens is an autonomous forensic due-diligence and background auditor for 
vendors, suspicious job offers, and public entities. It turns unstructured, 
multi-page public web investigations into a deterministic, real-time trust score 
and comprehensive risk report.

1.2 Problem Statement
--------------------
Students, job-seekers, and small businesses are constantly targeted by fraudulent 
recruiters, ghost e-commerce vendors, and unaccredited educational programs. 
Verifying legitimacy requires manually navigating 3 to 5 fragmented public 
registries, WHOIS lookups, and consumer forums—a process taking 20 to 30 minutes 
that users routinely skip.

1.3 Target Audience & Personas
-----------------------------
- Students / Job Seekers: Pasting suspicious internship or job offer URLs to 
  determine if the business has a real registration, active domain age, or known 
  scam history.
- Small Business Owners / Buyers: Entering prospective supplier or vendor names 
  to inspect registration status (CIN/GST), active directors, and community 
  sentiment prior to issuing advance payments.

1.4 Functional Requirements
--------------------------
- FR-1 (Input Handling): Accept target entity name and/or target URL via REST 
  and responsive Web UI.
- FR-2 (Agent Execution & Live Stream): Trigger an asynchronous TinyFish agent 
  run (via /v1/automation/run-sse or /v1/automation/run-async). Instantly capture 
  and stream the `streaming_url` to the client for live browser session viewing.
- FR-3 (Deterministic Extraction): Enforce strict JSON schema validation on the 
  TinyFish agent output to capture domain age, registration status, active 
  officers, risk flags, and an executive summary.
- FR-4 (Risk Assessment Engine): Heuristically calculate a 0-100 composite 
  Trust Score based on registry verification, domain freshness, and negative 
  reports.
- FR-5 (Local Persistence & Export): Store completed audits in local SQLite for 
  instant replay, with one-click Markdown summary export.

1.5 Non-Functional Requirements
------------------------------
- Zero-Cost Operation: Built exclusively on free tiers (TinyFish free starter 
  wallet credits, FastAPI local/free server, static Next.js frontend).
- Responsiveness: UI must present the live streaming session iframe and initial 
  status chips within 3 seconds of audit launch.
- Pitch Resilience: Must support an offline/cached demo fallback mode to guard 
  against slow stage Wi-Fi during judge evaluation.


================================================================================
2. SYSTEM ARCHITECTURE DESIGN
================================================================================

2.1 Flow & Architecture Diagram
-------------------------------
                +------------------------------------------+
                |           Client (Next.js 14)            |
                |  - Single-page target audit form         |
                |  - Embedded live TinyFish streaming iframe|
                |  - Real-time score & findings dashboard  |
                +--------------------+---------------------+
                                     | HTTP / Server-Sent Events (SSE)
                                     v
                +------------------------------------------+
                |        FastAPI Orchestration Layer       |
                |  - POST /api/audit/start                 |
                |  - GET /api/audit/stream/{task_id}       |
                |  - Composite Risk Scorer                 |
                |  - SQLite Audit Store                    |
                +--------------------+---------------------+
                                     |
                                     v TinyFish SDK / SSE Endpoint
                +------------------------------------------+
                |            TinyFish Agent API            |
                |  (Remote Headless Browser Engine)        |
                |  - Step 1: WHOIS Domain Age Lookup       |
                |  - Step 2: Public Corporate Search       |
                |  - Step 3: Scam/Sentiment Forum Scan     |
                |  - Emits: streaming_url, status events   |
                +------------------------------------------+

2.2 Data Contract / Output Schema (TinyFish Target)
--------------------------------------------------
{
  "type": "object",
  "properties": {
    "target_name": { "type": "string" },
    "domain_age_days": { "type": "integer" },
    "registration_verified": { "type": "boolean" },
    "registered_directors": { 
      "type": "array", 
      "items": { "type": "string" } 
    },
    "risk_flags": { 
      "type": "array", 
      "items": { "type": "string" } 
    },
    "summary": { "type": "string" }
  },
  "required": [
    "target_name", 
    "domain_age_days", 
    "registration_verified", 
    "risk_flags", 
    "summary"
  ]
}

2.3 Trust Score Calculation Logic
---------------------------------
Base Score = 100
- If domain_age_days < 30: Deduct 40 points (High-risk new domain)
- If domain_age_days < 90: Deduct 20 points
- If registration_verified is False: Deduct 35 points (Unverified corporate entity)
- Each risk flag detected: Deduct 10 points (Max deduction 30 points)
Clamp final score between 0 and 100.
Color Scale:
- 80 - 100: Low Risk (Green)
- 50 - 79: Moderate Caution (Yellow/Orange)
- 0 - 49: Severe Danger / Likely Fraud (Red)


================================================================================
3. DEVELOPMENT ROADMAP
================================================================================

Phase 1: Environment Setup & Core Agent Test (Hours 0 - 2)
---------------------------------------------------------
[ ] 1.1 Scaffold project directories: `/backend` and `/frontend`.
[ ] 1.2 Setup Python virtual environment and install `fastapi`, `uvicorn`, 
        `tinyfish`, `pydantic`, `httpx`.
[ ] 1.3 Add `.env` containing `TINYFISH_API_KEY`.
[ ] 1.4 Write and run a standalone script `test_tinyfish.py` to confirm API key 
        validity, trigger an agent run, and inspect the returned `streaming_url`.

Phase 2: Backend Orchestrator & Scoring Logic (Hours 2 - 5)
-----------------------------------------------------------
[ ] 2.1 Craft the goal prompt for TinyFish instructing multi-source lookup.
[ ] 2.2 Wire FastAPI SSE streaming endpoint to relay TinyFish progress directly.
[ ] 2.3 Implement the composite risk scoring algorithm and SQLite persistence.
[ ] 2.4 Add `/api/audit/mock` endpoint serving hardcoded real audit results for 
        instant, zero-token local testing.

Phase 3: Frontend Implementation (Hours 5 - 8)
----------------------------------------------
[ ] 3.1 Initialize Next.js 14 project with Tailwind CSS and Lucide icons.
[ ] 3.2 Build the dual-pane dashboard:
        - Left: Target submission form, execution logs, live streaming iframe.
        - Right: Trust score meter, status badges, risk bullet points, summary.
[ ] 3.3 Connect frontend SSE client to FastAPI stream endpoint.
[ ] 3.4 Add "Demo Mode / Replay" switch for rapid pitch evaluation.

Phase 4: Hardening, Pitch Preparation & Verification (Hours 8 - 10)
-------------------------------------------------------------------
[ ] 4.1 Test end-to-end flow on 2 real test cases (1 reputable site, 1 newly 
        created/suspicious domain).
[ ] 4.2 Record a fallback 60-second video of an end-to-end run to prevent 
        network failure risks during judging.
[ ] 4.3 Structure the 3-minute pitch deck: Problem -> TinyFish Live Action -> 
        Impact & Future Scope.


================================================================================
4. CI/CD PIPELINE CONFIGURATION
================================================================================

File: `.github/workflows/ci-cd.yml`

name: VerifyLens CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest flake8

      - name: Lint Backend
        run: |
          cd backend
          flake8 . --count --max-line-length=120 --statistics

      - name: Run Backend Tests
        env:
          TESTING: "true"
          TINYFISH_API_KEY: ${{ secrets.TINYFISH_API_KEY }}
        run: |
          cd backend
          pytest tests/ -v

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Build Next.js Application
        run: |
          cd frontend
          npm run build


================================================================================
5. COMPREHENSIVE TESTING STRATEGY
================================================================================

5.1 Unit Tests (`backend/tests/test_scorer.py`)
-----------------------------------------------
- Test Scorer Algorithm:
  * Fresh domain (< 30 days) + unverified status must produce score < 40.
  * Verified domain (> 365 days) with 0 risk flags must produce score >= 85.
  * Score must strictly clamp between 0 and 100 under extreme penalty inputs.
- Test Schema Validation:
  * Validate JSON responses matching the Pydantic model.
  * Handle missing optional fields gracefully without throwing 500 errors.

5.2 Integration Tests (`backend/tests/test_api.py`)
--------------------------------------------------
- Test API Health: `GET /health` returns 200 OK.
- Test Mock Audit: `POST /api/audit/mock` returns valid structured report card.
- TinyFish Gateway Mock: When `TESTING=true`, mock external network calls to 
  TinyFish endpoints with deterministic JSON event payloads.

5.3 Demo Pitch Hardening & Fail-Safe Protocol
--------------------------------------------
- Stage Wi-Fi Failure Contingency:
  1. Frontend contains a toggle: `Use Local Replay Mode`.
  2. If selected, the app streams pre-recorded agent events and displays a 
     pre-loaded local video inside the browser preview container.
  3. Guarantees 100% demo success rate in front of judges regardless of 
     venue connectivity.
================================================================================