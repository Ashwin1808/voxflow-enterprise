# VoxFlow Project Status

## Current Task

Scope reset: only Fraud, Inbound, and Outbound services for now.

## Progress Tracker

| Component | Status | Notes |
| --- | --- | --- |
| React frontend | Complete | Existing UI left untouched. |
| auth-service + Keycloak | Complete | Resource server, realm import, RBAC, actuator, Swagger. |
| fraud-service | In progress | Fraud sessions, fraud decisions, card status, Visual IVR fallback. |
| inbound-service | In progress | Inbound call session, DTMF menu routing, agent transfer. |
| outbound-service | In progress | Outbound simulator call request, attempts, Visual IVR fallback. |
| campaign-service | Removed from current scope | Replaced by focused Fraud/Inbound/Outbound services. |
| spring-cloud-gateway | Deferred | User will decide later. |
| payment-service | Deferred | Not in current three-service scope. |
| notification-service | Deferred | Not in current three-service scope. |
| analytics-service | Deferred | Not in current three-service scope. |
| Docker / DevOps | User-owned | Do not implement for now. |

## Current Architecture

The project is now intentionally smaller than the original master specification:

- `auth-service`: authentication and RBAC foundation.
- `fraud-service`: fraud verification business flow.
- `inbound-service`: inbound IVR business flow.
- `outbound-service`: outbound IVR business flow.

Simulator-first is the default. Twilio, Exotel, RabbitMQ, Docker, Kubernetes, Terraform, and monitoring are deferred.

## Verification

Java and Maven are not installed on this machine, so Maven tests cannot run locally until JDK 21 and Maven are installed.

## Next Steps

1. Finish the three focused services.
2. Add tests for all three services.
3. Wire the UI to Fraud, Inbound, and Outbound APIs.
4. Stop before Docker/DevOps; user will handle that part.
