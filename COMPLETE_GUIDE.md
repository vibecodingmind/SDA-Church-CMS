# Church CMS – Complete Step-by-Step Guide

Follow this guide from start to finish.

---

## Part 1: Run Locally (Test on Your Computer)

### Step 1.1: Go to the project folder

```bash
cd /Users/guteng/Documents/IAM
```

Always run commands from this folder.

---

### Step 1.2: Start the database

```bash
docker compose up db -d
```

This starts PostgreSQL. Wait until it says "Healthy".

---

### Step 1.3: Start the API

Open a new terminal, then:

```bash
cd /Users/guteng/Documents/IAM
npm run start:dev
```

Leave this running. The API will be at http://localhost:3001

---

### Step 1.4: Start the Admin UI

Open another new terminal, then:

```bash
cd /Users/guteng/Documents/IAM/admin
npm run dev
```

Leave this running. The Admin will be at http://localhost:5173

---

### Step 1.5: Login

1. Open http://localhost:5173 in your browser  
2. Login with:
   - **Email:** superadmin@samplechurch.org  
   - **Password:** Password123!

You can use all admin features: Members, Users, Roles, Organization, Audit.

---

## Part 2: Deploy to cPanel (sdachurchcms.makazi.direct)

### Step 2.1: Set your JWT secret

Edit `.env.cpanel` and change:

```
JWT_SECRET="your-production-jwt-secret-min-32-characters-long"
```

to a random string (32+ characters), for example:

```
JWT_SECRET="ChurchCMS-2026-SecureKey-MakaziDirect-XyZ123"
```

Save the file.

---

### Step 2.2: Build the project

From the project folder:

```bash
cd /Users/guteng/Documents/IAM
./scripts/deploy-makazi.sh
```

Wait until it finishes. It will:
- Generate the MySQL client
- Build the API
- Build the Admin

---

### Step 2.3: Create Node.js app in cPanel

1. Log in to cPanel  
2. Go to **Software** → **Setup Node.js App**  
3. Click **Create Application**  
4. Use:
   - **Node.js version:** 18 or 20  
   - **Application root:** `church-cms`  
   - **Application URL:** Select your domain (sdachurchcms.makazi.direct)  
   - **Application startup file:** `dist/src/main.js`  
5. Click **Create**  

---

### Step 2.4: Add environment variables in cPanel

In Setup Node.js App, open your app → **Environment Variables** (or edit `.env` in the app folder).

Add:

| Name | Value |
|------|-------|
| DATABASE_URL | `mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms` |
| JWT_SECRET | (the value you set in Step 2.1) |
| CORS_ORIGINS | `https://sdachurchcms.makazi.direct` |
| NODE_ENV | `production` |

Note: `%40` is the encoded form of `@` in the password.

---

### Step 2.5: Upload your project

1. Open **File Manager** in cPanel  
2. Go to the folder for your Node.js app (e.g. `church-cms` or `~/church-cms`)  
3. Upload these from your computer:

   - `dist/` (entire folder)  
   - `admin/dist/` (entire folder)  
   - `prisma/` (entire folder)  
   - `package.json`  
   - `package-lock.json`  

You can upload via:
- Drag and drop
- Or ZIP on your computer, upload, then extract in cPanel

---

### Step 2.6: Install dependencies on the server

If `node_modules` was not uploaded:

1. Open **Terminal** in cPanel (or use SSH)  
2. Go to your app folder:
   ```bash
   cd ~/church-cms
   ```
3. Install production dependencies:
   ```bash
   npm install --omit=dev --legacy-peer-deps
   ```

---

### Step 2.7: Create database tables and seed

Still in Terminal on the server:

```bash
cd ~/church-cms
export DATABASE_URL='mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms'
npx prisma db push --schema=prisma/schema.mysql.prisma
node dist/prisma/seed.js
```

---

### Step 2.8: Start the app

1. Go back to **Setup Node.js App**  
2. Click **Start** or **Restart** for your app  

---

### Step 2.9: Test your site

1. Open https://sdachurchcms.makazi.direct  
2. Login with:
   - **Email:** superadmin@samplechurch.org  
   - **Password:** Password123!  

Change this password after the first login.

---

## Part 3: Daily Use

### Run locally

```bash
cd /Users/guteng/Documents/IAM
docker compose up db -d
npm run start:dev          # Terminal 1
cd admin && npm run dev    # Terminal 2
```

Then open http://localhost:5173

---

### Deploy changes to cPanel

1. Update your code  
2. Run: `./scripts/deploy-makazi.sh`  
3. Upload new `dist/` and `admin/dist/` to cPanel  
4. Restart the app in Setup Node.js App  

---

## Part 4: Troubleshooting

| Problem | What to check |
|---------|----------------|
| Login fails | JWT_SECRET correct and at least 32 characters |
| Can't connect to database | DATABASE_URL correct, database exists, user has rights |
| 500 error | Check Application Logs in Setup Node.js App |
| Blank page | Correct `admin/dist/` uploaded, app restarted |

---

## Quick reference

| What | Where |
|------|--------|
| Local Admin | http://localhost:5173 |
| Local API | http://localhost:3001 |
| Live site | https://sdachurchcms.makazi.direct |
| Full admin login | superadmin@samplechurch.org / Password123! |
| Pastor login | admin@samplechurch.org / Password123! |
