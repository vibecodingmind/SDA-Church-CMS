# Admin Quick Start

## One Command Setup

```bash
./scripts/setup.sh
```

Then open **http://localhost:3000** in your browser.

## Login

**Pastor (limited access):**
- **Email:** admin@samplechurch.org
- **Password:** Password123!

**Full admin (all features):**
- **Email:** superadmin@samplechurch.org
- **Password:** Password123!

## What You Can Do

- **Dashboard** – Overview and shortcuts
- **Members** – View, add, edit, delete members
- **Users** – View users, invite new admins
- **Roles** – Manage roles
- **Permissions** – View all permissions
- **Organization** – Conferences, districts, churches
- **Audit Logs** – View activity logs

## If You Already Have Containers Running

```bash
docker compose up -d
```

Then open http://localhost:3000

## Ports

| Service   | URL                         |
|-----------|-----------------------------|
| Admin UI  | http://localhost:3000      |
| API       | http://localhost:3001      |
| Swagger   | http://localhost:3001/api/docs |
