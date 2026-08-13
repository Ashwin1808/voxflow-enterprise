# VoxFlow — Fraud-Call Platform (Event-Driven Microservices)

Enterprise-grade, interview-ready fraud-verification call platform. Upload 100+ customers, schedule a campaign, and VoxFlow auto-dials every customer through a progressive dialer, walks them through IVR (keypad + Visual IVR), records decisions (approved / blocked / disputed / no-answer) in real time, and reflects everything live on the dashboard.

**Zero cost to run** — the dialer ships with a free local emulator. A Twilio adapter is included and enabled with one env var flip.

```
                 ┌──────────────────────────────────────────────────────┐
                 │                     Frontend (React)                  │
                 │          Campaigns · Live sessions · Providers        │
                 └──────────────┬───────────────────────────┬────────────┘
                                │ REST (JWT / Keycloak)     │ REST (JWT)
                    ┌───────────▼───────────┐       ┌───────▼────────────┐
                    │    fraud-service      │       │  outbound-service  │
                    │  campaigns · sessions │       │     dialer (8087)  │
                    │  decisions · Visual   │       │ emulator|twilio    │
                    │  IVR · auto-starter   │       │ TwiML · webhooks   │
                    └───────────┬───────────┘       └───────┬────────────┘
                                │      RabbitMQ  voxflow.topic (event bus)
                                ▼                            ▼
                    call.status ─────────────► outbound.call.queue (auto-dial)
                    call.status ─────────────► fraud.call.queue    (state sync)
                    call.decision ───────────► fraud.decision.queue (decisions)
                                │
                    ┌───────────▼───────────────────────────────────────┐
                    │            PostgreSQL (sessions, decisions)       │
                    └───────────────────────────────────────────────────┘
```

## Services

| Service | Port | Responsibility |
| --- | --- | --- |
| auth-service | 8081 | Keycloak resource server, RBAC (ADMIN / AGENT) |
| fraud-service | 8082 | Campaigns, contacts, sessions, decisions, auto-start/complete, Visual IVR page |
| insurance-service | 8083 | Insurance campaign workflows |
| inbound-service | 8084 | Inbound IVR, DTMF routing |
| provider-service | 8085 | Provider adapters (Exotel, Twilio, Razorpay, Simulator) |
| analytics-service | 8086 | Event analytics |
| outbound-service | 8087 | Progressive dialer — **EmulatorCallProvider** (free, default) or **TwilioCallProvider** |
| frontend | 4173 | React + Vite + MUI dashboard |

## Quickstart (local, free)

Requirements: JDK 21 (`export JAVA_HOME=$(/usr/libexec/java_home -v 21)`), Maven, Docker (Keycloak, RabbitMQ, PostgreSQL), Node 20.

```bash
# 1. Infra (RabbitMQ, Keycloak, PostgreSQL)
#    (run the containers as listed in docs/architecture.md or your local setup)

# 2. Backend — boots auth(8081) fraud(8082) insurance(8083) inbound(8084)
#    provider(8085) analytics(8086) outbound(8087)
./start-backend.sh

# 3. Frontend
cd frontend && npm install && npm run dev   # or: npm run build && node server.js
```

Open http://localhost:4173 → log in `admin / admin`.

### Visual IVR customer app (visapp-style)

Customer-facing SPA (React + Vite, served from http://localhost:4180) — the
"visual IVR" self-service flow, in the style of a real credit-card activation
product:

1. **Agent** sends the link from the Session's **Visual IVR** panel — it gets a
   unique signed token.
2. **Customer** opens the link → sees the fraud summary (card on file, amount,
   last 4 digits, etc.) and taps **Continue**.
3. **Verify OTP** — a 6-digit code is generated server-side (5 min expiry) and
   shown to the agent (in this demo the agent reads it over the phone; plug in
   your SMS provider to send it instead). Wrong codes are rejected.
4. **Decision** — customer chooses Approve / Decline; the session is updated in
   real time (agent dashboard reflects `APPROVED` / `DECLINED`, card status
   `ACTIVE` / `FROZEN`).
5. **Receipt** — a PDF receipt is generated on the fly and downloaded.
6. Every step records a timeline entry (`VISUAL_IVR_VIEWED` → `OTP_REQUESTED` →
   `OTP_VERIFIED` → `DECISION_APPROVED` → …) visible to the agent in
   **Sessions**.

Run: `cd visual-ivr-app && npm install && npm run dev`
(`VISUAL_IVR_BASE_URL` in `.env` controls the link the agent copies).

### Run the full demo (10 minutes, free)

1. **Dashboard** → **Campaigns** → **New campaign** → set a start time ~2 minutes ahead.
2. **Upload CSV** (`data/contacts.csv` — 100 customers) or **Load 100 samples**.
3. Wait — the campaign auto-starts at the scheduled time.
4. Watch the dialer: 7 concurrent lines, contacts stream through
   PENDING → DIALING → RINGING → ANSWERED / NO_ANSWER.
5. A customer answers → session flips to **Call Flow** → agent approves/blocks,
   or the customer self-serves via **Visual IVR** (open the public link on your phone).
6. When all sessions reach a terminal state the campaign **auto-completes**.
7. Watch live metrics in Grafana (dialer calls placed, answer rate, lines in use).

### Switch to real phone calls (Twilio, optional)

1. Create a Twilio trial account (free credit, no card).
2. In `.env` (gitignored): `CALL_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID=…`,
   `TWILIO_AUTH_TOKEN=…`, `TWILIO_FROM_NUMBER=…` (your trial number).
3. Your own mobile must be verified in Twilio (trial accounts call verified numbers only).
4. Restart outbound-service. Every dial is now a real PSTN call with full TwiML IVR
   (press 1 to approve, 2 to block) and status webhooks/polling.

## Architecture & Platform Engineering

- **Event-driven core** — single RabbitMQ `voxflow.topic` exchange; services share
  nothing but events (`call.status`, `call.decision`); consumers are idempotent.
- **Progressive dialer** — bounded concurrency (7 lines), QUEUED re-dispatch on
  busy lines, provider abstraction (`CallProvider`) with emulator + Twilio adapters.
- **Real-time state machine** — sessions transition on every event; terminal states
  lock decisions; campaigns auto-complete.
- **Security** — OAuth2/OIDC via Keycloak, method-level RBAC, public scope limited
  to IVR webhooks, secrets via env (never committed).
- **CI/CD** — GitHub Actions: matrix build+test (JDK 21), Trivy (dependency + image),
  CodeQL, npm lint/build; CD publishes to GHCR on tags.
- **Containerization** — one generic multi-stage Dockerfile for all Java services;
  `docker compose up` runs the whole stack + observability.
- **Observability** — Prometheus scrapes all services (JVM + custom dialer metrics),
  Loki + Promtail for centralized logs, Grafana with a provisioned VoxFlow dashboard.
- **Cloud-scale story** (design, not yet provisioned) — see `docs/architecture.md`:
  AWS EKS, ALB, Aurora PostgreSQL, Amazon MQ / MSK, S3, CloudWatch, Route 53,
  Terraform + ArgoCD GitOps.

## Repo Layout

```
services/         7 Spring Boot microservices
  outbound-service   dialer: telephony/{Emulator,Twilio}CallProvider, TwiMlService
workflow-engine/  shared event DTOs (call.status / call.decision)
frontend/         React dashboard (Campaigns, Call Sessions, Providers, Simulator)
infra/            Dockerfiles, docker-compose, Keycloak realm, Prometheus/Grafana/Loki
.github/workflows CI (build+test+Trivy+CodeQL), CD (GHCR), CodeQL schedule
data/             sample contacts CSV (100 customers)
docs/             architecture.md, demo-script.md, authentication.md
```

## Documentation

- [docs/architecture.md](docs/architecture.md) — AWS-scale target architecture
- [docs/demo-script.md](docs/demo-script.md) — the 10-minute interview demo script
- [docs/authentication.md](docs/authentication.md) — Keycloak setup details
