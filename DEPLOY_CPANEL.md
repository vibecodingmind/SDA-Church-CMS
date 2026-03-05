# Deploy with cPanel + MySQL

This guide covers deploying Church CMS IAM using **cPanel** and **MySQL** (instead of PostgreSQL).

---

## Important: cPanel + Node.js

**Most cPanel shared hosting does NOT run Node.js.** It's built for PHP, Apache, MySQL.

**You need one of these:**
- **cPanel with "Setup Node.js App"** (NodeSelector) – some hosts offer this
- **VPS or dedicated server with cPanel** – you can install Node.js
- **Hybrid:** Admin (static) on cPanel, API on Railway/Render

---

## Option 1: Admin on cPanel + API elsewhere (Easiest)

Deploy only the **admin UI** to cPanel (static files). Run the API on Railway/Render with PostgreSQL.

1. Build admin with your API URL:
   ```bash
   cd admin
   VITE_API_URL=https://your-api.railway.app npm run build
   ```
2. Upload `admin/dist/` contents to cPanel `public_html` (via File Manager or FTP)
3. Set CORS on your API to allow your cPanel domain

**No MySQL migration needed** – API stays on PostgreSQL (Railway/Render).

---

## Option 2: Full cPanel + MySQL (Requires Node.js support)

If your cPanel has **Node.js** (Setup Node.js App):

**MySQL packages are already in the project.** Use these steps:

### 1. Create MySQL database in cPanel

1. cPanel → **MySQL Databases**
2. Create database: `church_cms`
3. Create user with password
4. Add user to database (All Privileges)
5. Note: host is usually `localhost`, or use the "Remote MySQL" host if connecting from outside

**Connection string format:**
```
mysql://username:password@localhost:3306/database_name
```

### 2. Switch project to MySQL

```bash
cd /Users/guteng/Documents/IAM

# Set your cPanel MySQL URL (replace with your cPanel DB credentials)
export DATABASE_URL="mysql://youruser:yourpass@localhost:3306/church_cms"

# Generate Prisma client for MySQL
npx prisma generate --schema=prisma/schema.mysql.prisma

# Create tables (push schema to MySQL)
npx prisma db push --schema=prisma/schema.mysql.prisma

# Seed the database
npx ts-node prisma/seed.ts
```

### 3. Build for production

```bash
# Build API (uses MySQL Prisma client)
npm run build

# Build admin (set your live API URL)
cd admin
VITE_API_URL=https://your-cpanel-domain.com/api npm run build
```

### 4. Upload to cPanel

**API (if Node.js is supported):**
- Upload project to a folder (e.g. `church-api`)
- Point "Setup Node.js App" to that folder
- Set startup: `node dist/src/main.js`
- Set env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`

**Admin:**
- Upload contents of `admin/dist/` to `public_html` or a subdomain

---

## Option 3: MySQL migration files (schema only)

The `prisma/schema.mysql.prisma` file is provided. You need to:

1. Create migrations from it (or use `prisma db push` for dev):
   ```bash
   npx prisma migrate dev --schema=prisma/schema.mysql.prisma --name init_mysql
   ```

2. Update `prisma.config.ts` and `PrismaService` to support MySQL when `DATABASE_URL` starts with `mysql://`

---

## MySQL vs PostgreSQL summary

| | PostgreSQL (default) | MySQL (cPanel) |
|---|---------------------|----------------|
| Schema | `prisma/schema.prisma` | `prisma/schema.mysql.prisma` |
| Adapter | `@prisma/adapter-pg` + `pg` | `@prisma/adapter-mariadb` + `mariadb` |
| DATABASE_URL | `postgresql://...` | `mysql://...` |

---

## Recommendation

- **cPanel shared hosting (no Node.js):** Use Option 1 – admin on cPanel, API on Railway
- **cPanel with Node.js:** Use Option 2 – full stack on cPanel with MySQL
- **Easiest live setup:** Railway for API + DB, Firebase/Vercel for admin
