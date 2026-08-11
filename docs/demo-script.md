# VoxFlow — Interview Demo Script (10 minutes, 100% free)

Pre-requisites (5 min before): `./start-backend.sh` running, Keycloak up, frontend
served at `http://localhost:4173`, Grafana at `http://localhost:3000` (admin/admin).

Login: `admin / admin`.

---

## 0:30 — One-liner

> "VoxFlow is an event-driven fraud-verification platform. When a payment looks
> suspicious, we auto-dial the customer through a progressive dialer, verify them
> with IVR, record their decision, and update our system of record in real time."

## 1:00 — Campaigns (the trigger)

- Open **Campaigns** → **New campaign**, set a start time ~1 minute ahead.
- Click **Load 100 samples** (or Upload CSV → `data/contacts.csv`).
- Talk: "100 customer contacts loaded — each has a phone, card, merchant, amount."

## 2:00 — Auto-start (the wow)

- Let the clock hit the scheduled time — **no button clicks**.
- Watch: campaign flips to **RUNNING**, contacts stream PENDING → DIALING → RINGING.
- Talk: "A scheduler starts the campaign; for each contact we publish
  `call.status=QUEUED` to RabbitMQ. The outbound service consumes that queue and
  dials — 7 concurrent lines, so calls are progressive, not a stampede."

## 4:00 — Live session state machine

- Open **Call Sessions** — rows flipping ANSWERED / NO_ANSWER live.
- Open a session → see the state machine (DIALING → RINGING → ANSWERED).
- Talk: "Every provider event publishes back to the bus; fraud-service consumes it
  and transitions the session. Terminal states lock — we never double-decide."

## 5:00 — The decision loop (two paths)

- Path A (agent): on an ANSWERED session click **Approve** / **Block** → status updates instantly.
- Path B (customer): copy the session's **Visual IVR** public link → open in a phone
  browser / new tab → press 1 (approve) or 2 (block) → the session updates **from the customer side**.
- Talk: "The same decision channel serves the agent API and the customer-facing
  Visual IVR — one event, `call.decision`, fanned out."

## 7:00 — Providers page + architecture

- Open **Providers** → config card: `EMULATOR` (free, default).
- Talk: "There's a `CallProvider` interface — the emulator runs the full dialer for
  free; the Twilio adapter is a one-line env flip. Same code path, same events,
  real PSTN calls. For the interview you can say: 'I've used this pattern with both.'"

## 8:00 — Observability (Grafana)

- Grafana → **VoxFlow — Dialer & Platform Overview**.
- Point at: calls placed, answer rate, lines busy, services up, JVM heap.
- Talk: "Prometheus scrapes every service; business metrics come from Micrometer
  counters in the dialer; logs aggregate through Loki."

## 9:00 — Platform engineering (talk track)

- "CI: GitHub Actions — matrix build/test on JDK 21, Trivy + CodeQL scans gate every push."
- "CD: tag `v*` → images publish to GHCR → ArgoCD syncs Kubernetes (GitOps, self-healing)."
- "Scale: services share nothing but RabbitMQ events; dialer scales by queue depth;
  Aurora Postgres for the system of record. Everything is containerized —
  `docker compose up` boots the full stack including observability."

## 9:45 — Wrap

> "Runs entirely free locally — no Twilio credit, no cloud bill. The design is the
> same one that would run at production scale on AWS." (Point to docs/architecture.md)

---

## Cheat sheet — numbers to drop

| Metric | Value |
| --- | --- |
| Dialer concurrency | 7 lines |
| Emulator answer rate | 75% |
| Sample contacts per click | 100 |
| Event bus | RabbitMQ `voxflow.topic` (fan-out) |
| Services | 7 Spring Boot + React frontend |
| State machine | PENDING → DIALING → RINGING → ANSWERED/NO_ANSWER → APPROVED/BLOCKED/VISUAL_IVR_SENT |
| Campaign lifecycle | SCHEDULED → RUNNING → COMPLETED (auto) |
