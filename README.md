# Church CMS IAM

Production-grade Identity & Access Management (IAM) foundation for a Church Management System serving 3,000+ local churches.

## Architecture

- **RBAC**: Role-Based Access Control with dynamic permissions from database
- **Scope-Based Access**: Data filtered by church/district/conference hierarchy
- **JWT Authentication**: Access tokens (15 min) + refresh tokens (7 days, hashed in DB)
- **Security**: bcrypt (12 rounds), rate limiting, account lockout, Helmet, CORS

### Hierarchy

```
Conference → District → Church → Members
```

## Tech Stack

- Node.js + TypeScript
- NestJS
- PostgreSQL + Prisma ORM 7 (with @prisma/adapter-pg)
- JWT (passport-jwt)
- bcrypt, class-validator, Helmet

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

> **Note:** Prisma 7 requires the `@prisma/adapter-pg` driver. Install with `npm install --legacy-peer-deps` if you encounter peer dependency conflicts.

### Setup

1. **Clone and install**

   ```bash
   cd IAM
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string
   - `JWT_SECRET` – At least 32 characters (use a strong secret in production)

3. **Database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run**

   ```bash
   npm run start:dev
   ```

### Seed Data

After `npx prisma db seed`:

- Default permissions (MEMBER:VIEW, USER:CREATE, etc.)
- Default roles (PASTOR, CHURCH_ADMIN, DISTRICT_ADMIN, CONFERENCE_ADMIN)
- Sample organization: Conference → District → Church
- Sample user: `admin@samplechurch.org` / `Password123!`
- Sample members: John Smith, Mary Johnson, David Williams, and more

## API Endpoints

### Public

| Method | Path              | Description                    |
|--------|-------------------|--------------------------------|
| GET    | /                 | Hello                          |
| GET    | /health           | Health check                   |
| GET    | /api/docs         | Swagger API documentation      |
| POST   | /auth/login       | Login                          |
| POST   | /auth/refresh     | Refresh tokens                 |
| POST   | /auth/forgot-password | Request password reset    |
| POST   | /auth/reset-password  | Reset password with token |
| POST   | /auth/accept-invite  | Accept user invite         |

### Protected (require JWT + permission)

| Method | Path                    | Permission      |
|--------|-------------------------|-----------------|
| POST   | /auth/logout            | (authenticated) |
| GET    | /members                | MEMBER:VIEW     |
| POST   | /members                | MEMBER:CREATE   |
| GET    | /users                  | USER:VIEW       |
| POST   | /users/invite           | USER:CREATE     |
| GET    | /roles                  | ROLE:VIEW       |
| GET    | /permissions            | PERMISSION:VIEW |
| GET    | /organization/conferences | ORGANIZATION:VIEW |
| GET    | /audit                  | AUDIT:VIEW      |
| GET    | /audit/scope            | AUDIT:VIEW      |

### Example: Login and fetch members

```bash
# One-liner (requires jq)
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@samplechurch.org","password":"Password123!"}' | jq -r '.accessToken')
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/members
```

### Helper Scripts (requires jq)

```bash
./scripts/login.sh          # Get access token
./scripts/members.sh         # Get members (auto-login)
./scripts/add-member.sh "Name" "email@example.com"   # Add member
./scripts/setup.sh           # Docker build + up + seed
```

App runs on port **3001** when using Docker.

## Environment Variables

| Variable               | Description                    | Default        |
|------------------------|--------------------------------|----------------|
| DATABASE_URL           | PostgreSQL connection string   | Required       |
| JWT_SECRET             | JWT signing secret (min 32)   | Required       |
| JWT_ACCESS_EXPIRY      | Access token expiry           | 15m            |
| JWT_REFRESH_EXPIRY     | Refresh token expiry          | 7d             |
| BCRYPT_ROUNDS          | bcrypt salt rounds            | 12             |
| CORS_ORIGINS           | Allowed origins (comma-sep)    | localhost:3001 |
| RATE_LIMIT_TTL         | Rate limit window (seconds)   | 60             |
| RATE_LIMIT_MAX         | Max requests per window       | 10             |
| LOGIN_LOCKOUT_ATTEMPTS | Failed attempts before lock   | 5              |
| LOGIN_LOCKOUT_DURATION | Lockout duration (seconds)    | 900            |

## Deployment

### Production Checklist

1. **Secrets**: Use a secrets manager (e.g. AWS Secrets Manager) for `JWT_SECRET` and `DATABASE_URL`.
2. **Database**: Run migrations before deploy: `npx prisma migrate deploy`.
3. **HTTPS**: Serve behind a reverse proxy (nginx, Caddy) with TLS.
4. **CORS**: Set `CORS_ORIGINS` to your frontend domain(s).
5. **Rate limiting**: Adjust `RATE_LIMIT_*` for expected traffic.
6. **Logging**: Configure structured logging and monitoring.

### Docker (recommended - one command)

```bash
./scripts/setup.sh
# Then open http://localhost:3002 - Admin UI (login: admin@samplechurch.org / Password123!)
# API at http://localhost:3001 | Swagger at http://localhost:3001/api/docs
```

Or manually:
```bash
docker compose build
docker compose up -d
docker compose exec app npx prisma db seed
```

**Admin UI** runs on port 3002. **API** runs on port 3001.

**Development:**
```bash
docker compose -f docker-compose.dev.yml up
# Hot-reload, PostgreSQL, optional Prisma Studio with --profile tools
```

**Scripts:** `npm run docker:build`, `npm run docker:up`, `npm run docker:dev`

## Project Structure

```
src/
├── config/           # Env validation, config service
├── common/           # Guards, decorators, interceptors, scope service
├── prisma/           # PrismaService
├── modules/
│   ├── auth/         # Login, refresh, JWT strategy
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── organization/ # Conference, District, Church
│   ├── audit/
│   └── members/      # Example scope-filtered resource
```

## Features

- **Swagger**: API docs at `/api/docs`
- **Password reset**: Forgot-password flow with time-limited tokens
- **User invites**: Invite by email with role and scope
- **Logout**: Revoke refresh tokens
- **Token invalidation**: Automatic when user role/scope changes
- **Scope-aware audit**: Query audit logs within your scope
- **Password policy**: Min 8 chars, upper, lower, number, special char
- **Docker**: Production and dev docker-compose

## Security Notes

- **bcrypt**: 12 rounds for password hashing (OWASP recommendation).
- **JWT**: Short-lived access tokens limit exposure if leaked.
- **Refresh tokens**: Stored as SHA-256 hash only; never store plain tokens.
- **Scope in token**: Reduces DB lookups; invalidate tokens when role/scope changes.
- **Audit**: Sensitive actions logged server-side; never trust client for audit data.
- **Lockout**: 5 failed attempts lock account for 15 minutes.

## License

UNLICENSED
