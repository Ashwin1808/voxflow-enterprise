# VoxFlow — AWS-Scale Target Architecture

The repository runs fully on a laptop (Docker + 7 Spring Boot services). This document
describes the target production architecture on AWS, as it would be built for a real
company — same services, same event flows, same codebase.

## Logical Architecture (today, local)

```
React (Vite) ── REST/JWT ──► auth 8081 │ fraud 8082 │ insurance 8083 │ inbound 8084
                             provider 8085 │ analytics 8086 │ outbound 8087
                                  │
            RabbitMQ voxflow.topic (call.status, call.decision, …)
                                  │
                            PostgreSQL (fraud/insurance/inbound/provider/analytics DBs)
```

## Target Architecture (AWS, production)

```
                        ┌──────────────────────────────────────────┐
   Users ──► CloudFront ─► SPA (S3 + CloudFront CDN, edge caching)
                        └────────────────┬─────────────────────────┘
                                         │ /api (JWT via ALB OIDC)
                        ┌────────────────▼─────────────────────────┐
                        │          ALB (TLS, path routing)         │
                        │   EKS  (managed node groups, HPA)        │
                        │  auth │ fraud │ insurance │ inbound      │
                        │  provider │ analytics │ outbound (xN)    │
                        └───┬──────────────────────────────┬───────┘
                            │  Amazon MQ for RabbitMQ      │  PostgreSQL → RDS
                            │  (or MSK Kafka w/ mirror)    │  Aurora (Multi-AZ,
                            │                              │   read replicas, PITR)
                            ▼                              ▼
                     call.status / call.decision      RDS Aurora PostgreSQL
                     fan-out consumers, idempotent
```

### Key decisions and reasoning

| Decision | Why |
| --- | --- |
| Event bus: Amazon MQ (RabbitMQ) → MSK (Kafka) | RabbitMQ protocol matches today's code; Kafka unlocks replay/partitions at scale |
| Aurora PostgreSQL (Multi-AZ) | Native Postgres (Flyway migrations unchanged), cross-AZ failover, read replicas for dashboards |
| EKS + HPA | Per-service autoscaling — dialer scales by queue depth (`outbound.call.queue`), dashboards by load |
| Outbound dialer as stateless workers | Multiple replicas consume the same queue; semaphore inside a replica is *per-pod*, queue depth is the real limiter |
| S3 + CloudFront for the SPA | Static assets at the edge, API on ALB only |
| ALB OIDC → Keycloak (IDP) | Central auth; services only validate JWTs |
| Terraform modules | VPC, EKS, RDS, MQ, S3, Route 53, IAM — all as code, PR-reviewed |
| ArgoCD (GitOps) | Repo is the single source of truth; Argo syncs the desired state, self-heals drift |
| GitHub Actions CD | Build → Trivy → push to GHCR → tag vX.Y.Z → ArgoCD picks it up |

### Outbound call flow (the core loop)

1. `fraud-service` campaign auto-starts at `scheduledStartAt` (15s poller).
2. For each PENDING contact it publishes `call.status=QUEUED`.
3. `outbound-service` listeners consume the queue → dial via `CallProvider`
   (emulator locally, Twilio in prod — same code path).
4. Provider events (DIALING/RINGING/ANSWERED/NO_ANSWER) publish back to the bus.
5. `fraud-service` applies events to sessions (idempotent, terminal states lock).
6. Agent decision (API) or customer keypad/Visual IVR → `call.decision` → decision applied.
7. All sessions terminal → campaign auto-completes; metrics flow to Prometheus/Grafana.

### Reliability & security

- **Retries & idempotency**: RabbitMQ dead-lettering + consumer idempotency (terminal states skipped).
- **Secrets**: env-injected (never committed); AWS Secrets Manager in prod; `.env` is gitignored locally.
- **Security scanning**: Trivy (deps + images) and CodeQL in CI; only scanned images ship.
- **Observability**: Prometheus scrape targets per service; Loki log aggregation; Grafana dashboards provisioned as code.
- **Backup**: Aurora PITR + daily snapshots; S3 versioning for artifacts and uploads.

### Migration path (local → AWS)

1. `docker compose up` (this repo) = exact production topology, locally.
2. Push images to GHCR via the CD workflow (tag `v*`).
3. Terraform provisions VPC/EKS/RDS/MQ (modules in `infra/terraform/`).
4. ArgoCD app-of-apps syncs `deploy/` manifests (deployments, services, HPA, ingress).
5. Flip `SPRING_DATASOURCE_URL`, `SPRING_RABBITMQ_HOST` env to AWS endpoints — no code changes.
