# ShuleFinance backend architecture

## Backend foundation

The platform is an npm-workspace monorepo. The React application lives in `apps/web`, the TypeScript modular-monolith API lives in `apps/api`, and the shared database layer lives in `packages/database`.

### Runtime services

- NestJS HTTP API on port 4000
- PostgreSQL as the source of truth
- Redis for caching and later job queues; authentication sessions currently remain durable in PostgreSQL
- Prisma for schema management and transactional data access

### Design guarantees

- Every school-owned aggregate contains `school_id`.
- Monetary values use PostgreSQL `decimal`, never floating-point values.
- Student balances are derived from invoices and payment allocations.
- Payment reversal retains the original payment.
- Duplicate provider/payment references are constrained per school.
- Invoice batches require an idempotency key.
- Audit events are append-only application records.
- Environment variables are validated before the API accepts traffic.
- API errors and success responses use a consistent envelope and request ID.

### Local startup

See [running-backend.md](running-backend.md) for the complete setup, verification, production-style startup, and troubleshooting guide.

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:api
```

PostgreSQL is exposed on host port `5433` to avoid conflicts with an existing local PostgreSQL installation.

Endpoints:

- `GET http://localhost:4000/api/v1/health/live`
- `GET http://localhost:4000/api/v1/health/ready`
- `GET http://localhost:4000/api/v1`
Phase Two authentication is active. Development staff credentials are documented in [authentication.md](authentication.md) and [running-backend.md](running-backend.md).
