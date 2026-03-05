#!/bin/bash
# Deploy admin to Firebase Hosting for live preview
# Requires: API_URL (your deployed API, e.g. https://xxx.railway.app)
#
# Usage:
#   API_URL=https://your-api.railway.app ./scripts/deploy-firebase.sh
#   # Or for local API: API_URL=http://localhost:3001 ./scripts/deploy-firebase.sh
#
set -e
cd "$(dirname "$0")/.."

API_URL="${API_URL:-https://your-api-url.railway.app}"
echo "Building admin with API_URL=$API_URL"

cd admin
VITE_API_URL="${API_URL}/api" npm run build

cd ..
echo "Deploying to Firebase Hosting..."
npx firebase-tools deploy --only hosting

echo ""
echo "Done! Your admin is live at the Firebase URL above."
