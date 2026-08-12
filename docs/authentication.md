# Authentication and authorization

Phase Two replaces the frontend demonstration login with server-managed staff authentication.

## Security model

- Passwords are hashed with bcrypt using cost factor 12 and are never returned or logged.
- The access token is a 15-minute signed JWT stored in an HTTP-only, SameSite=Strict cookie.
- Refresh tokens are cryptographically random, stored only as SHA-256 hashes, rotated after every use, and revocable per session.
- Reuse of an already-rotated refresh token revokes every active session for that user.
- Five failed logins lock the account for 15 minutes; login and recovery endpoints also have IP rate limits.
- Suspended and invited accounts cannot authenticate.
- Password resets expire after 30 minutes, are single-use, and revoke every existing session.
- Authentication events include request ID and IP address in the immutable audit log.
- API routes are protected by default. Only routes marked `@Public()` bypass authentication.
- Permission checks use tenant-scoped database roles, so suspension and permission changes take effect without waiting for a JWT to expire.

## Endpoints

All endpoints use the configured `/api/v1` prefix.

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/change-password`

## Development accounts

After `npm run db:seed`, the Accountant, Principal, and Administrator choices shown on the login page use the development-only password `Greenfield@2026`. Never use seeded credentials in a deployed environment.

Password-reset email delivery is intentionally provider-neutral. In development only, the recovery endpoint returns a token so the reset flow can be integrated and tested. Production never returns this token; an email provider and queued delivery worker must be connected before release.

## Production requirements

- Generate a unique `JWT_ACCESS_SECRET` of at least 32 random characters.
- Set `COOKIE_SECURE=true` and serve the web and API applications over HTTPS.
- Restrict `CORS_ORIGINS` to the deployed web origin.
- Replace the seeded accounts and password.
- Connect password-reset email delivery and keep tokens out of application logs.
- Run expired session and reset-token cleanup as a scheduled job.
