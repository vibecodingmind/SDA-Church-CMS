# Church CMS IAM - Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --legacy-peer-deps

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

COPY . .
RUN npm run build

# Build admin (same-origin: /api)
WORKDIR /app/admin
RUN npm ci --legacy-peer-deps
ENV VITE_API_URL="/api"
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/admin/dist ./admin/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/prisma.config.ts ./

RUN npm ci --omit=dev --legacy-peer-deps && npx prisma generate

EXPOSE 3000

# Push schema, seed (idempotent), then start
CMD ["sh", "-c", "npx prisma db push --accept-data-loss 2>/dev/null || true; node dist/prisma/seed.js 2>/dev/null || true; exec node dist/src/main.js"]
