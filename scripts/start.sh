#!/bin/sh
# Railway/Docker startup: create tables, seed, then run app
set -e

echo "==> Running prisma db push..."
npx prisma db push --accept-data-loss

echo "==> Running seed..."
node dist/prisma/seed.js

echo "==> Starting app..."
exec node dist/src/main.js
