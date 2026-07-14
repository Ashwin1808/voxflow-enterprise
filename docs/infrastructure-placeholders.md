# Infrastructure Placeholders

This project intentionally leaves DevOps implementation to the user for the current phase.

## Placeholder Architecture

- React Admin Portal
- React Visual IVR
- Spring Cloud Gateway
- Authentication service with Keycloak-issued JWTs
- Fraud service
- Insurance service
- Inbound service
- RabbitMQ
- PostgreSQL
- Redis
- Keycloak

## Current Boundary

The backend code should be written so these dependencies can be connected later, but this phase must not add Docker, Kubernetes, Terraform, GitHub Actions, AWS, Helm, or CI/CD files.

## Development Rule

Services stay simulator-first until real providers are introduced. Fraud and Insurance own their own campaign management because both workflows begin from customer campaign uploads.
