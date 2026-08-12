# Running the ShuleFinance backend locally

This guide starts the NestJS API, PostgreSQL, and Redis from a fresh checkout.

For production hardening, backup drills, load testing, monitoring, and deployment, see [hardening-and-deployment.md](hardening-and-deployment.md).

If watch mode reports `Cannot find module apps/api/dist/main`, stop that process and restart it with `npm run dev:api`. Incremental builds now preserve `dist/main.js` between rebuilds.

## Requirements

Install these tools first:

- Node.js 22 or newer
- npm 10 or newer
- Docker Engine with Docker Compose

Run every command from the repository root:

```bash
cd /home/leopardfx/Education-Financial-system-
```

## 1. Install dependencies

```bash
npm install
```

This installs dependencies for the root workspace, `apps/api`, `apps/web`, and `packages/database`.

## 2. Create the environment file

```bash
cp .env.example .env
```

The API resolves this repository-root `.env` file even though npm executes its workspace script from `apps/api`. An optional `apps/api/.env` can override it for API-specific local settings.

For local development, replace `JWT_ACCESS_SECRET` in `.env` with a private random value containing at least 32 characters. One option is:

```bash
openssl rand -base64 48
```

Paste the generated value after `JWT_ACCESS_SECRET=`. Do not commit `.env`.

The default local connection values are:

```dotenv
PORT=4000
DATABASE_URL=postgresql://shulefinance:shulefinance@localhost:5433/shulefinance?schema=public
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:5173
COOKIE_SECURE=false
```

`COOKIE_SECURE=false` is appropriate only for local HTTP development. Production must use HTTPS and `COOKIE_SECURE=true`.

## 3. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

Check their status:

```bash
docker compose ps
```

The local ports are:

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

View service logs when needed:

```bash
docker compose logs -f postgres redis
```

## 4. Prepare the database

Generate the Prisma client:

```bash
npm run db:generate
```

Apply all migrations:

```bash
npm run db:migrate
```

Seed Greenfield Academy and the development staff accounts:

```bash
npm run db:seed
```

Migrations preserve existing data. Do not delete the Docker volume merely to rerun a migration.

## 5. Start the backend

```bash
npm run dev:api
```

The API starts in watch mode at:

```text
http://localhost:4000/api/v1
```

Keep this terminal running. Stop the API with `Ctrl+C`.

## 6. Verify the backend

Open another terminal and check liveness:

```bash
curl http://localhost:4000/api/v1/health/live
```

Check database readiness:

```bash
curl http://localhost:4000/api/v1/health/ready
```

Both responses should contain `"success":true`.

## 7. Start the frontend

In another terminal:

```bash
npm run dev:web
```

Open `http://localhost:5173` and sign in using one of these development accounts:

| Role | Email |
| --- | --- |
| Accountant | `c.njeri@greenfield.ac.ke` |
| Principal | `principal@greenfield.ac.ke` |
| Administrator | `p.ochieng@greenfield.ac.ke` |

Development password: `Greenfield@2026`

School code: `MOE/PRI/KE/08421`

These credentials are for local development only and must be replaced before deployment.

## Useful commands

```bash
# Build the backend
npm run build:api

# Run backend tests
npm run test:api

# Validate the Prisma schema
DATABASE_URL="postgresql://shulefinance:shulefinance@localhost:5433/shulefinance?schema=public" npm run validate --workspace @shulefinance/database

# Open Prisma Studio
DATABASE_URL="postgresql://shulefinance:shulefinance@localhost:5433/shulefinance?schema=public" npm run studio --workspace @shulefinance/database

# Stop PostgreSQL and Redis without deleting their data
docker compose stop

# Start them again
docker compose start
```

## Production-style backend run

Build the API first:

```bash
npm run build:api
```

Then start the compiled application:

```bash
npm run start:prod --workspace @shulefinance/api
```

In an actual deployment, apply committed migrations without creating new migration files:

```bash
npm run db:deploy
```

## Common problems

### `Invalid environment configuration`

Confirm that `.env` exists at the repository root and that `JWT_ACCESS_SECRET` contains at least 32 characters.

### `Environment variable not found: DATABASE_URL`

Create `.env` from `.env.example`, or provide `DATABASE_URL` directly when running a database command.

### PostgreSQL connection refused

Run:

```bash
docker compose ps
docker compose logs postgres
```

Confirm that the connection uses host port `5433`, not `5432`.

### Port already in use

Check which process uses the API or database port:

```bash
ss -ltnp | grep -E ':4000|:5433|:6379'
```

Change `PORT` in `.env` if port `4000` is occupied. If the frontend origin changes, update `CORS_ORIGINS` too.

### Login returns `401`

Rerun `npm run db:seed`, confirm the school code, and use one of the development accounts listed above. Five failed attempts temporarily lock an account for 15 minutes.

### Browser does not retain the session

For local development, use `http://localhost:5173`, keep `COOKIE_SECURE=false`, and ensure `CORS_ORIGINS=http://localhost:5173`. Do not mix `localhost` and `127.0.0.1` between the frontend and API URLs.
