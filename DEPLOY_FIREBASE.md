# Deploy Church CMS – Firebase + Railway Preview

Use **Firebase Hosting** for the admin UI and **Railway** for the API + database.  
You get a free live preview while you decide on cPanel/domain later.

---

## Part 1: Deploy API to Railway (free tier)

Railway runs your NestJS API and PostgreSQL database.

### 1. Create Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `vibecodingmind/SDA-Church-CMS` (or your repo)
4. Railway will detect the project and start a build

### 2. Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway creates the DB and sets `DATABASE_URL` in your app’s environment

### 3. Set environment variables

In your service → **Variables**, add:

| Variable       | Value                                      |
|----------------|--------------------------------------------|
| `DATABASE_URL` | *(auto from PostgreSQL)*                   |
| `JWT_SECRET`   | A random 32+ character string              |
| `NODE_ENV`     | `production`                               |
| `CORS_ORIGINS` | `https://YOUR-FIREBASE-URL.web.app` (set after Part 2) |

### 4. Get your API URL

After deploy, open your service → **Settings** → **Networking** → **Generate Domain**.  
Note the URL (e.g. `https://sda-church-cms-production-xxx.up.railway.app`).

---

## Part 2: Deploy admin to Firebase Hosting

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → choose a name (e.g. `sda-church-cms`)
3. Copy the **Project ID** (e.g. `sda-church-cms-12345`)

### 2. Update `.firebaserc`

Replace `your-firebase-project-id` with your Project ID:

```json
{
  "projects": {
    "default": "sda-church-cms-12345"
  }
}
```

### 3. Install Firebase CLI and login

```bash
npm install -g firebase-tools
firebase login
```

### 4. Build and deploy

```bash
# Replace with your actual Railway API URL (no trailing slash)
export API_URL=https://sda-church-cms-production-xxx.up.railway.app
./scripts/deploy-firebase.sh
```

Or:

```bash
API_URL=https://your-railway-url.up.railway.app ./scripts/deploy-firebase.sh
```

### 5. Finish setup

1. Copy your Firebase URL (e.g. `https://sda-church-cms-xxx.web.app`)
2. In Railway → your service → **Variables**, set:
   - `CORS_ORIGINS` = `https://sda-church-cms-xxx.web.app`
3. Redeploy the Railway service if needed

---

## One-command deploy (after first setup)

```bash
API_URL=https://your-railway-url.up.railway.app ./scripts/deploy-firebase.sh
```

---

## Login

- **URL:** your Firebase Hosting URL (e.g. `https://xxx.web.app`)
- **Email:** `superadmin@samplechurch.org`
- **Password:** `Password123!`

Change the password after first login.

---

## Option B: Railway only (one URL, no Firebase)

Deploy everything to Railway in one go – API and admin from the same URL:

1. Push your code to GitHub
2. Railway → **New Project** → **Deploy from GitHub** → select your repo
3. Add **PostgreSQL** (Railway → + New → Database → PostgreSQL)
4. Set env vars: `JWT_SECRET`, `NODE_ENV=production`
5. Generate a **public domain** for your service
6. Deploy

The Dockerfile builds both API and admin. NestJS serves:
- Admin at `/`
- API at `/api`

One URL for everything. No Firebase needed. The app auto-runs `prisma db push` and seed on startup.
