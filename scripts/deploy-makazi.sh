#!/bin/bash
# Build for cPanel deploy - sdachurchcms.makazi.direct
# Run from project root: ./scripts/deploy-makazi.sh
#
# Your MySQL is on cPanel - run "db push" and "seed" ON THE SERVER after upload.
# This script only builds locally.

set -e
cd "$(dirname "$0")/.."

export DATABASE_URL="mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms"

echo "1. Generating MySQL Prisma client..."
npx prisma generate --schema=prisma/schema.mysql.prisma

echo "2. Building API..."
npm run build:mysql

echo "3. Building admin..."
cd admin
VITE_API_URL=https://sdachurchcms.makazi.direct/api npm run build

echo ""
echo "Done! Upload to cPanel:"
echo "  - dist/"
echo "  - admin/dist/"
echo "  - node_modules/ (or run npm install --omit=dev on server)"
echo "  - package.json, prisma/"
echo ""
echo "Then on cPanel (SSH or Terminal), run:"
echo "  export DATABASE_URL='mysql://makazidirect_sdachurchcms:RoyalTour2026%40%40@localhost:3306/makazidirect_sdachurchcms'"
echo "  npx prisma db push --schema=prisma/schema.mysql.prisma"
echo "  node dist/prisma/seed.js"
