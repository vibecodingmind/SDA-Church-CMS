# Run Without Docker (dev mode)

## 1. Start database only (Docker)

```bash
cd /Users/guteng/Documents/IAM
docker compose up db -d
```

## 2. Run migrations & seed (first time)

```bash
npx prisma migrate deploy
npx prisma db seed
```

## 3. Terminal 1 – API

```bash
cd /Users/guteng/Documents/IAM
npm run start:dev
```

API runs at **http://localhost:3001**

## 4. Terminal 2 – Admin UI

```bash
cd /Users/guteng/Documents/IAM/admin
npm run dev
```

Admin runs at **http://localhost:5173**

## 5. Login

Open **http://localhost:5173** in your browser.

- **Email:** superadmin@samplechurch.org
- **Password:** Password123!

---

**Summary:** DB in Docker, API + Admin run locally with hot-reload.
