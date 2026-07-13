# VoxFlow Project Status

## Current Task

Task 1: Authentication.

## Progress Tracker

| Component | Status | Notes |
| --- | --- | --- |
| React frontend | Complete | Existing UI left untouched. |
| auth-service + Keycloak | Complete for Task 1 source build | Spring Security resource server, Keycloak realm import, RBAC endpoints, actuator, Swagger, JSON logging, tests, Dockerfile. |
| spring-cloud-gateway | Not started | Planned after business service APIs are ready. |
| campaign-service | Not started | Task 2. |
| workflow-service | Not started | Task 3. |
| payment-service | Not started | Task 5. |
| notification-service | Not started | Needed for Visual IVR/backend messaging. |
| analytics-service | Not started | Common component after core events exist. |
| Docker Compose full stack | Not started | DevOps begins at Task 6 per requested workflow. |
| Kubernetes manifests | Not started | Task 7. |
| Terraform | Not started | Task 8. |
| GitHub Actions | Not started | Task 9. |
| Monitoring | Not started | Task 10. |

## Task 1 Architecture Notes

Authentication is delegated to Keycloak, not implemented as custom JWT logic. The `auth-service` acts as a Spring Boot 3 resource server and identity facade:

- Validates JWTs issued by `voxflow-realm`.
- Maps Keycloak `realm_access.roles` and client roles to Spring Security `ROLE_*` authorities.
- Exposes `/api/v1/auth/me` for current identity.
- Exposes `/api/v1/auth/roles` for the RBAC matrix.
- Protects admin-only endpoints with `@PreAuthorize`.
- Keeps health, readiness, liveness, metrics, Prometheus, and OpenAPI available according to the spec.
- Ships a realm import without users or credentials. Users must be created through Keycloak Admin UI, `kcadm.sh`, or environment-specific automation so no password lands in Git.

## Verification

Java and Maven are not installed on this machine, so Maven tests cannot run locally yet. Source-level structure and syntax were created according to Spring Boot 3 conventions and will be compiled once JDK 21 and Maven or the Maven Wrapper are available.
