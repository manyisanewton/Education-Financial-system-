# Phase 8: hardening and deployment

## Automated verification

From the repository root:

```bash
npm run test:hardening
npm run build:web
```

The API suite includes HTTP smoke tests, permission-guard tests, sensitive-controller metadata checks, and school-isolation tests. CI repeats tests and both production builds against PostgreSQL and Redis services.

## Backup and restore rehearsal

Start the development PostgreSQL container, ensure migrations and seed data exist, then run:

```bash
npm run test:backup
```

The script creates a checksummed custom-format backup, restores it into an isolated temporary database, checks its schema and school data, and drops only that test database. Keep production backups encrypted and off-host. Set retention and perform a documented quarterly restore rehearsal.

## Load test

Install k6, start a seeded API, then provide a real test account:

```bash
BASE_URL=http://localhost:4000/api/v1 \
TEST_EMAIL=admin@greenfield.test \
TEST_PASSWORD='test-password' \
npm run test:load
```

The scenario ramps through normal traffic and a 100-user spike. Its release thresholds are under 1% failed requests, p95 below 750 ms, and p99 below 1.5 seconds. Run this against an isolated staging school—never production—because it creates authentication traffic and reads financial data.

## Production deployment

Create a deployment `.env` outside source control with strong, unique values:

```dotenv
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
JWT_ACCESS_SECRET=...
METRICS_TOKEN=...
APP_ORIGIN=https://finance.example.school
SCHOOL_REGISTRATION_NUMBER=...
WEB_PORT=8080
```

Validate and build:

```bash
docker compose --env-file /secure/path/shulefinance.env -f compose.production.yaml config
docker compose --env-file /secure/path/shulefinance.env -f compose.production.yaml build
```

Before starting the new API version, take a backup and run Prisma migrations as a one-off release task using the same image and environment. Then start services:

```bash
docker compose --env-file /secure/path/shulefinance.env -f compose.production.yaml up -d
```

Place the web port behind TLS. PostgreSQL and Redis have no published host ports in the production compose file.

## Monitoring

- Liveness: `GET /api/v1/health/live`
- Readiness: `GET /api/v1/health/ready`
- Prometheus metrics: `GET /api/v1/metrics` with `Authorization: Bearer <METRICS_TOKEN>`

The Prometheus example reads its bearer value from `/run/secrets/shulefinance_metrics_token`. Alert on sustained readiness failure, 5xx errors at the proxy, p95 latency, failed notification jobs, CPU/memory, database connections/storage, and backup age. Route critical alerts to at least two staff members.

See [security-review.md](security-review.md) for the launch checklist and accepted gaps.
