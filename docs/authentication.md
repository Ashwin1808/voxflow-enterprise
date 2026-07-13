# Authentication

Task 1 implements authentication with Keycloak and Spring Security, matching the master engineering specification.

## Why Keycloak

VoxFlow does not issue custom JWTs. Keycloak owns OAuth2/OIDC, Authorization Code with PKCE, service-to-service credentials, refresh-token rotation, RBAC roles, and future MFA. The Spring Boot service validates Keycloak tokens and maps roles into application authorities.

## Components

- `infra/keycloak/voxflow-realm.json`: Realm, clients, scopes, and roles.
- `services/auth-service`: Spring Boot 3 resource server.
- `SecurityConfig`: JWT validation, Keycloak role mapping, endpoint authorization.
- `AuthController`: `/api/v1/auth/me`, `/api/v1/auth/roles`, `/api/v1/auth/admin/health`.
- `logback-spring.xml`: Structured JSON console logs.
- `application.yml`: Profiles, actuator, Prometheus, Swagger/OpenAPI, Keycloak issuer config.

## RBAC

| Role | Allowed |
| --- | --- |
| `ADMIN` | All endpoints, campaign management, user management, reports, metrics. |
| `AGENT` | Inbound calls, customer context, payment status, campaign metrics. |
| `CUSTOMER` | Visual IVR portal, payment page, own transaction history. |
| `DEVELOPER` | API docs, health endpoints, metrics. |

## Endpoints

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/api/v1/auth/me` | Authenticated user |
| `GET` | `/api/v1/auth/roles` | `ADMIN`, `DEVELOPER` |
| `GET` | `/api/v1/auth/admin/health` | `ADMIN` |
| `GET` | `/actuator/health` | Public |
| `GET` | `/actuator/health/liveness` | Public |
| `GET` | `/actuator/health/readiness` | Public |
| `GET` | `/actuator/prometheus` | `ADMIN`, `DEVELOPER` |
| `GET` | `/api-docs` | Public in dev/staging |

## Local Run Shape

After JDK 21 and Maven are installed:

```bash
mvn -pl services/auth-service -am test
mvn -pl services/auth-service -am spring-boot:run
```

The service expects Keycloak at:

```bash
KEYCLOAK_ISSUER_URI=http://localhost:8089/realms/voxflow-realm
```

## Keycloak User Creation

The realm file intentionally contains no users or passwords. Create users via Keycloak Admin UI, `kcadm.sh`, or environment automation, then assign one or more realm roles:

- `ADMIN`
- `AGENT`
- `CUSTOMER`
- `DEVELOPER`

This keeps credentials out of Git and matches the DevSecOps rules in the engineering spec.

## Production Behavior

In production, the API Gateway validates tokens at the edge and forwards requests to services. Each service remains a resource server so direct pod-to-pod access still enforces JWT validation. OpenTelemetry will propagate correlation IDs and trace IDs once the monitoring task starts.
