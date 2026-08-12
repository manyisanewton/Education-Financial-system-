# ShuleFinance — Greenfield Academy

A premium, bilingual school finance platform for Greenfield Academy. The staff frontend currently uses realistic Kenyan mock data while the production backend foundation is developed.

## Run locally

```bash
npm install
npm run dev
```

## Production check

```bash
npm run build
```

The repository uses an npm workspace structure:

- `apps/web` — React staff portal
- `apps/api` — NestJS backend API
- `packages/database` — shared Prisma schema, migrations, and seed data

The frontend is organized by components and features. Every visual component has its own stylesheet, while shared design tokens and base controls live in `apps/web/src/styles/global.css`.

## Backend foundation

Phase One of the production backend is located in `apps/api`, with the PostgreSQL schema and seeds in `packages/database`. See [docs/backend-architecture.md](docs/backend-architecture.md) for architecture and local setup.

Phase Two adds server-backed staff authentication, rotating sessions, account lockout, password recovery, audit events, and role/permission guards. See [docs/authentication.md](docs/authentication.md) for the security model and deployment requirements.

For complete local backend setup and troubleshooting, see [docs/running-backend.md](docs/running-backend.md).

Role persistence and permission-level behavior are documented in [docs/roles-and-permissions.md](docs/roles-and-permissions.md).
