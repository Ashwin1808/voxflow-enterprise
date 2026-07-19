# VoxFlow Project Status

## Current Task

Scope reset: keep Authentication and build only Fraud, Insurance, and Inbound services for now. Campaign management is required inside Fraud and Insurance because both workflows begin from customer campaign uploads.

## Progress Tracker

| Component | Status | Notes |
| --- | --- | --- |
| React frontend | Complete | Architected into a modular React 18 ESM directory layout containing core api clients, service adapters, custom hooks, and page layout wrappers. |
| auth-service + Keycloak | Complete | Resource server, realm import, RBAC, actuator, Swagger. |
| fraud-service | Complete | Persistence integrated, entities mapped, and database schema initialized with Flyway. |
| insurance-service | Complete | Persistence integrated, entities mapped, and database schema initialized with Flyway. |
| inbound-service | Complete | Call session persistence added and schema migration script created. |
| Compilation Fixes | Complete | Fixed record method references and constructor dependency injection in tests. |
| RabbitMQ | Complete | Fully implemented RabbitMQ topology, exchanges, queues, routing keys, publishers, DTOs, and listener skeletons. |
| PostgreSQL | Complete | Mapped Entities (Campaigns, Sessions, Policies, WorkflowDefinitions, Executions), JPA Repositories, Flyway Migrations, and seeded workflow definitions. |
| outbound-service | Inactive | Files preserved for history, removed from active Maven modules. Do not extend it for current scope. |
| spring-cloud-gateway | Placeholder | Future routing layer only; no implementation in this phase. |
| Redis | Placeholder | Architecture dependencies documented, not implemented in this phase. |
| Docker / Kubernetes / Terraform / GitHub Actions / AWS | User-owned | Do not implement for now. |

## Current Architecture

The project is now intentionally smaller than the original master specification:

- `auth-service`: authentication and RBAC foundation.
- `fraud-service`: campaign management, fraud verification workflow, card decision, Visual IVR.
- `insurance-service`: campaign management, policy renewal workflow, payment simulator links, claims Visual IVR.
- `inbound-service`: inbound call routing, DTMF, agent transfer, customer self service.

Simulator-first is the default. Spring Cloud Gateway, RabbitMQ, PostgreSQL, Redis, Docker, Kubernetes, Terraform, GitHub Actions, AWS, and monitoring are deferred as placeholders.

## Verification

Java and Maven are not installed on this machine, so Maven tests cannot run locally until JDK 21 and Maven are installed.

## Next Steps

1. Finish the three focused business services: Fraud, Insurance, and Inbound.
2. Add tests for all three services.
3. Wire the UI to Fraud, Insurance, and Inbound APIs.
4. Stop before Docker/DevOps; user will handle that part.
