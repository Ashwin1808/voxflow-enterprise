# VoxFlow Platform

VoxFlow is an enterprise omnichannel communication platform. The current implementation is intentionally narrowed to Authentication plus three business services: Fraud, Insurance, and Inbound IVR. Docker, Kubernetes, Terraform, GitHub Actions, AWS, and other DevOps implementation work are intentionally left for the user to build later.

## Run UI Prototype

```bash
npm start
```

Then open `http://localhost:4173`.

## Backend Status

| Service | Port | Status |
| --- | --- | --- |
| auth-service | 8081 | Complete — Keycloak resource server, RBAC |
| fraud-service | 8082 | In progress — campaign management, fraud verification, workflow entry points, Visual IVR fallback |
| insurance-service | 8083 | In progress — campaign management, policy renewal, payment simulator links, claims Visual IVR |
| inbound-service | 8084 | In progress — inbound call sessions, DTMF menu routing, agent transfer |

`services/outbound-service` is preserved in the workspace for history, but it is not part of the active Maven reactor and should not be used for the current architecture.

### Run Backend Services

```bash
mvn -pl services/fraud-service -am spring-boot:run
mvn -pl services/insurance-service -am spring-boot:run
mvn -pl services/inbound-service -am spring-boot:run
```

See [docs/authentication.md](docs/authentication.md).

Local Java and Maven are not installed yet on this machine, so backend compilation/tests need JDK 21 and Maven installed locally.

## What Is Built

- Command dashboard for live and scheduled campaigns.
- Campaign manager with status, progress, retry rate, provider, and owner context.
- Workflow Engine view based on the JSON interpreter concept from the spec.
- Visual IVR mobile preview for secure fallback links.
- Provider abstraction status cards for Exotel, Twilio, Razorpay, and Simulator adapters.
- Event stream modeled after `voxflow.topic` RabbitMQ routing keys.
- Keycloak-backed authentication service.
- Fraud service for campaign uploads, fraud verification, card decision flows, and Visual IVR fallback.
- Insurance service for campaign uploads, policy renewal, payment simulator links, and claims Visual IVR fallback.
- Inbound service for IVR menu, DTMF, and agent transfer.
- Infrastructure placeholders for Spring Cloud Gateway, RabbitMQ, PostgreSQL, Redis, and Keycloak.

## Next Engineering Steps

- Finish tests for Fraud, Insurance, and Inbound services.
- Wire the completed UI to these APIs through the future Spring Cloud Gateway.
- Keep all providers simulator-first.
- Leave Docker, Kubernetes, Terraform, CI/CD, monitoring, AWS, and other DevOps work for the user.
