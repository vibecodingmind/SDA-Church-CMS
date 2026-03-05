# Deploy Church CMS to sdachurchcms.makazi.direct

Your cPanel setup for **sdachurchcms.makazi.direct**

---

## Your configuration

| Item | Value |
|------|-------|
| **Domain** | sdachurchcms.makazi.direct |
| **Database** | makazidirect_sdachurchcms |
| **DB User** | makazidirect_sdachurchcms |
| **DB Host** | localhost (when app runs on same cPanel) |

The `.env.cpanel` file has your DATABASE_URL. Add a strong `JWT_SECRET` before deploying.

---

## Step 1: Set JWT secret

Edit `.env.cpanel` and replace `your-production-jwt-secret-min-32-characters-long` with a random 32+ character secret:

```
JWT_SECRET="a-random-string-at-least-32-chars-long-abc123"
```

---

## Step 2: Build for cPanel (MySQL)

Run the deploy script from the project root:

```bash
./scripts/deploy-makazi.sh
```

This generates the MySQL Prisma client, builds the API, and builds the admin (pointing at `https://sdachurchcms.makazi.direct/api`). No local MySQL needed—`prisma db push` and `seed` run on cPanel after upload (Step 4).

**Local dev after build:** If you switch back to PostgreSQL locally, run `npx prisma generate --schema=prisma/schema.prisma`.

---

## Step 3: Setup Node.js App in cPanel

1. cPanel → **Software** → **Setup Node.js App**
2. **Create Application**
   - Node.js version: 18 or 20
   - Application root: `church-cms` (or folder where you'll upload)
   - Application URL: `sdachurchcms.makazi.direct`
   - Startup file: `dist/src/main.js`

---

## Step 4: Upload & run on cPanel

1. Upload to your app folder:
   - `dist/` (API build)
   - `admin/dist/` (admin build – NestJS serves this at /)
   - `node_modules/` (or run `npm install --omit=dev` on server)
   - `package.json`
   - `prisma/`

2. In cPanel Terminal or SSH (from your app folder), create tables and seed:
   ```bash
   export DATABASE_URL='mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms'
   npx prisma db push --schema=prisma/schema.mysql.prisma
   node dist/prisma/seed.js
   ```

3. In Setup Node.js App → **Environment variables**, add:
   - `DATABASE_URL` = `mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms`
   - `JWT_SECRET` = your secret (32+ chars)
   - `CORS_ORIGINS` = `https://sdachurchcms.makazi.direct` (same origin, so this allows the admin)
   - `NODE_ENV` = `production`

---

## Step 5: Restart

Setup Node.js App → your app → **Restart**

---

## Login after deploy

- **URL:** https://sdachurchcms.makazi.direct
- **Email:** superadmin@samplechurch.org
- **Password:** Password123!

**Change the password after first login.**
