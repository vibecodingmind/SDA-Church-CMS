# Deploy to Production (Single Source: GitHub)

One GitHub repo → Deploy to live. Admin and API can be deployed separately.

---

## Why Docker Showed Fewer Features

Docker serves a **built image**. If you added features after the last `docker compose build`, the image is outdated. Fix:

```bash
docker compose build admin --no-cache
docker compose up -d
```

Now Docker admin = same features as `npm run dev`.

---

## Deployment Options

| Part | Service | Notes |
|------|---------|-------|
| **Admin UI** | Firebase Hosting, Vercel, Netlify | Static files – easy, free tier |
| **API + Database** | Railway, Render, Fly.io | NestJS + PostgreSQL |

Firebase Hosting can host the **admin only**. The API must run elsewhere (Firebase doesn't run Node.js backends or PostgreSQL).

---

## Option A: Firebase (Admin) + Railway (API)

### 1. Deploy API to Railway

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub → Select `vibecodingmind/SDA-Church-CMS`
3. Add PostgreSQL (Railway provides one)
4. Set env vars: `JWT_SECRET`, `DATABASE_URL` (from Railway), `CORS_ORIGINS` (your Firebase URL)
5. Railway gives you an API URL, e.g. `https://your-app.railway.app`

### 2. Deploy Admin to Firebase Hosting

`firebase.json` is already configured (serves `admin/dist`).

```bash
cd /Users/guteng/Documents/IAM
npm install -g firebase-tools
firebase login
firebase use  # Create or select your Firebase project

# Build admin with your live API URL (from Railway step above)
cd admin
VITE_API_URL=https://your-app.railway.app npm run build

# Deploy
cd ..
firebase deploy
```

Your admin will be live at `https://your-project.web.app` (or similar).

### 3. Update CORS

In Railway, set `CORS_ORIGINS` to your Firebase URL, e.g. `https://your-project.web.app`

---

## Option B: All on Railway (Simpler)

Deploy both admin + API from one repo on Railway:

1. Railway project → Add GitHub repo
2. Add PostgreSQL
3. Add two services from same repo:
   - **API**: Root folder, build `npm run build`, start `node dist/src/main.js`
   - **Admin**: Subfolder `admin`, build `npm run build`, serve `admin/dist` as static

Railway can host both. Single dashboard, one database.

---

## Build Config for Production

The admin reads API URL from `VITE_API_URL` at **build time**. Set it when building for production:

```bash
# For Firebase or any static host
VITE_API_URL=https://your-api-url.com npm run build --prefix admin
```

---

## Single Source of Truth

Everything lives in **GitHub**. To update:

```bash
git add .
git commit -m "Your changes"
git push
```

Then:
- **Railway**: Auto-deploys on push
- **Firebase**: Run `firebase deploy` after push (or add GitHub Action for CI/CD)
