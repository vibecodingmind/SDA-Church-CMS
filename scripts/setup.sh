#!/bin/bash
# Full setup: build, start, seed. Run from project root.
set -e
echo "Building and starting containers..."
docker compose build
docker compose up -d
echo "Waiting for app to be ready..."
sleep 8
echo "Running seed..."
docker compose exec app npx prisma db seed
echo ""
echo "=========================================="
echo "  Church CMS - Ready!"
echo "=========================================="
echo ""
echo "  Admin UI:  http://localhost:3002"
echo "  API:       http://localhost:3001"
echo "  Swagger:   http://localhost:3001/api/docs"
echo ""
echo "  Login: admin@samplechurch.org"
echo "  Password: Password123!"
echo ""
echo "  Open http://localhost:3002 in your browser"
echo "=========================================="
