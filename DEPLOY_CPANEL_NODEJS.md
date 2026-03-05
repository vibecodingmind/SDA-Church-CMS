# Deploy to cPanel with Setup Node.js App

Your cPanel has **Setup Node.js App** – you can run the full API + Admin + MySQL on cPanel.

---

## Step 1: Create MySQL database (cPanel)

1. cPanel → **MySQL Databases**
2. Create database: `church_cms`
3. Create user and strong password
4. Add user to database → **All Privileges**
5. Note: host = `localhost` (or the value shown in cPanel)

**Connection string format:**
```
mysql://username:password@localhost:3306/database_name
```

---

## Step 2: Setup Node.js App (cPanel)

1. cPanel → **Software** → **Setup Node.js App**
2. Click **Create Application**
3. Settings:
   - **Node.js version:** 18 or 20
   - **Application root:** `church-cms` (or your folder name)
   - **Application URL:** your domain or subdomain (e.g. `api.yourchurch.org`)
   - **Application startup file:** `dist/src/main.js`
   - **Run script:** (leave default or use `node dist/src/main.js`)

4. Click **Create**

---

## Step 3: Upload your project

1. Use **File Manager** or **FTP** to upload the project
2. Upload to the folder that matches your "Application root" (e.g. `church-cms`)
3. Or: clone from GitHub into that folder (if SSH/terminal is available)

**Required files/folders:**
- `dist/` (build output)
- `node_modules/` (or run `npm install --omit=dev` after upload)
- `package.json`
- `prisma/` (schema, migrations)

---

## Step 4: Build locally (before upload)

Build the project for MySQL so it’s ready for cPanel:

```bash
cd /Users/guteng/Documents/IAM

# Use your cPanel MySQL credentials
export DATABASE_URL="mysql://youruser:yourpass@localhost:3306/church_cms"

# Generate MySQL client & create tables (run once, or do this on server)
npx prisma generate --schema=prisma/schema.mysql.prisma
npx prisma db push --schema=prisma/schema.mysql.prisma
npx ts-node prisma/seed.ts

# Build API
npm run build:mysql

# Build admin (use your live API URL)
cd admin
VITE_API_URL=https://api.yourchurch.org npm run build
```

---

## Step 5: Environment variables (Setup Node.js App)

In cPanel → Setup Node.js App → your app → **Environment Variables** (or `.env`):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://user:pass@localhost:3306/church_cms` |
| `JWT_SECRET` | Strong secret (min 32 characters) |
| `CORS_ORIGINS` | `https://yourchurch.org` (your admin domain) |
| `NODE_ENV` | `production` |
| `PORT` | Use the port cPanel assigns (often set automatically) |

---

## Step 6: Install dependencies on server

If you didn’t upload `node_modules/`, SSH or use cPanel Terminal:

```bash
cd ~/church-cms   # or your application root path
npm install --omit=dev --legacy-peer-deps
```

If cPanel runs `npm install` automatically, it may do this for you.

---

## Step 7: Run Prisma on server (first-time setup)

If you haven’t run migrations/push on the server:

```bash
cd ~/church-cms
export DATABASE_URL="mysql://..."   # your cPanel MySQL URL
npx prisma generate --schema=prisma/schema.mysql.prisma
npx prisma db push --schema=prisma/schema.mysql.prisma
node dist/prisma/seed.js
```

---

## Step 8: Deploy Admin (static files)

The admin is static files. Two options:

**A) Same domain subdirectory**  
- Upload `admin/dist/` contents to `public_html/admin/`  
- Admin URL: `https://yourchurch.org/admin/`

**B) Subdomain**  
- Create subdomain `app.yourchurch.org`  
- Upload `admin/dist/` to that subdomain’s `public_html`  
- Admin URL: `https://app.yourchurch.org`

---

## Step 9: Start / restart the app

In Setup Node.js App → your app → **Restart** (or **Start**).

---

## Step 10: Test

- **API:** `https://api.yourchurch.org/health`
- **Admin:** Open your admin URL and log in with:
  - Email: `superadmin@samplechurch.org`
  - Password: `Password123!`

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| 500 error | Application logs in Setup Node.js App |
| Database connection | `DATABASE_URL` correct, MySQL user has rights |
| CORS errors | `CORS_ORIGINS` includes your admin URL (with `https://`) |
| Admin can’t reach API | `VITE_API_URL` in admin build matches your API URL |

---

## Quick checklist

- [ ] MySQL database + user created
- [ ] Node.js app created in cPanel
- [ ] Project built with `build:mysql`
- [ ] `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` set
- [ ] `prisma db push` and seed run (tables exist)
- [ ] Admin built with correct `VITE_API_URL`
- [ ] Admin files uploaded to `public_html`
- [ ] App restarted
