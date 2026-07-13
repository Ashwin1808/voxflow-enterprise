# VoxFlow Platform

VoxFlow is an enterprise omnichannel communication platform inspired by the attached master engineering specification. This first build is a working operations-console prototype that turns the spec into a tangible product surface: campaign management, workflow simulation, provider health, payments visibility, Visual IVR, and RabbitMQ-style event activity.

## Run UI Prototype

```bash
npm start
```

Then open `http://localhost:4173`.

## Backend Status

Task 1 Authentication has been added under `services/auth-service`.

- Java 21 + Spring Boot 3 resource server.
- Keycloak realm: `infra/keycloak/voxflow-realm.json`.
- RBAC roles: `ADMIN`, `AGENT`, `CUSTOMER`, `DEVELOPER`.
- Protected APIs: `/api/v1/auth/me`, `/api/v1/auth/roles`, `/api/v1/auth/admin/health`.
- Ops endpoints: `/actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/metrics`, `/actuator/prometheus`, `/api-docs`, `/swagger-ui.html`.

Local Java and Maven are not installed yet, so backend compilation/tests need JDK 21 and Maven before running.

## What Is Built

- Command dashboard for live and scheduled campaigns.
- Campaign manager with status, progress, retry rate, provider, and owner context.
- Workflow Engine view based on the JSON interpreter concept from the spec.
- Visual IVR mobile preview for secure fallback links.
- Provider abstraction status cards for Exotel, Twilio, Razorpay, and Simulator adapters.
- Event stream modeled after `voxflow.topic` RabbitMQ routing keys.

## Next Engineering Steps

- Add React + Vite + Tailwind build tooling once dependencies can be installed.
- Create Spring Boot service skeletons for gateway, campaign, workflow, payment, notification, analytics, auth, and ai-worker.
- Add PostgreSQL/Flyway migrations for campaigns, contacts, workflows, IVR sessions, transactions, notifications, and audit logs.
- Add Docker Compose for PostgreSQL, Redis, RabbitMQ, Keycloak, and the frontend.
- Convert static state into API contracts under `/api/v1`.
