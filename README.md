# VoxFlow Platform

VoxFlow is an enterprise omnichannel communication platform. The current implementation is intentionally narrowed to three business services: Fraud, Inbound IVR, and Outbound IVR. Docker and DevOps are intentionally left for the user to implement later.

## Run UI Prototype

```bash
npm start
```

Then open `http://localhost:4173`.

## Backend Status

| Service | Port | Status |
| --- | --- | --- |
| auth-service | 8081 | Complete — Keycloak resource server, RBAC |
| fraud-service | 8082 | In progress — fraud sessions, decisions, card status, Visual IVR fallback |
| inbound-service | 8083 | In progress — inbound call sessions, DTMF menu routing, agent transfer |
| outbound-service | 8084 | In progress — outbound simulator calls, attempts, Visual IVR fallback |

### Run Backend Services

```bash
mvn -pl services/fraud-service -am spring-boot:run
mvn -pl services/inbound-service -am spring-boot:run
mvn -pl services/outbound-service -am spring-boot:run
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
- Fraud service for fraud verification and card decision flows.
- Inbound service for IVR menu, DTMF, and agent transfer.
- Outbound service for simulator outbound call requests and Visual IVR fallback.

## Next Engineering Steps

- Finish tests for Fraud, Inbound, and Outbound services.
- Wire the completed UI to these three APIs.
- Keep all providers simulator-first.
- Leave Docker, Kubernetes, Terraform, CI/CD, monitoring, and other DevOps work for the user.
