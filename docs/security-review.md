# Security review

Reviewed for Phase 8 on 12 August 2026. Re-run this review before each production release and after material authentication, payment, or infrastructure changes.

## Controls implemented

- Authentication uses short-lived access tokens, rotating server-side refresh sessions, HttpOnly cookies, account lockout, and login throttling.
- Authorization is enforced by API permission guards. The frontend hides inaccessible navigation, but it is not treated as a security boundary.
- Every business query is required to use the authenticated `schoolId`; automated isolation tests cover students and payments.
- DTO validation rejects unknown fields and transforms validated inputs. Prisma parameterizes database queries.
- Payment capture has idempotency keys and unique constraints. Reversals preserve an audit trail rather than deleting transactions.
- Helmet, explicit credentialed CORS origins, strict same-site cookies, and secure production cookies are enabled.
- Production startup rejects localhost/wildcard CORS, insecure cookies, missing metrics authentication, an example JWT secret, and missing proxy trust.
- Metrics require a bearer token. Readiness and liveness endpoints intentionally expose no sensitive data.
- Containers use a non-root API process, private database/cache networking, persistent volumes, and health checks.

## Required deployment controls

- Terminate TLS at a trusted reverse proxy or managed load balancer and redirect HTTP to HTTPS.
- Store database, Redis, JWT, SMTP/SMS, and metrics credentials in a secret manager; never commit `.env` files.
- Encrypt database disks, backups, and document storage at rest. Restrict backup access and test restoration quarterly.
- Allow database and Redis access only from the private application network. Do not publish their ports publicly.
- Put the API behind a WAF/rate limiter and alert on login failures, 5xx rate, latency, failed notification jobs, storage, and database saturation.
- Centralize structured logs with retention and access controls. Do not log access tokens, cookies, passwords, payment credentials, or student documents.
- Patch base images and npm dependencies regularly; run dependency, container, and secret scans in release CI.

## Open items before public launch

- Connect production email/SMS providers and object storage; the current notification delivery path is suitable for development only.
- Add malware scanning and signed, expiring download URLs when expense/student documents are stored externally.
- Commission an independent penetration test and privacy review for Kenyan data-protection obligations.
- Add field-level encryption only where the final data classification requires it; platform encryption at rest remains mandatory.
- Expand school-isolation integration tests to every newly introduced repository query.

No security review can establish that software is vulnerability-free. This document records controls and remaining risks, not a certification.
