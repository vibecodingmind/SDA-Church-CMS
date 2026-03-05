#!/bin/bash
# Get access token - usage: ./scripts/login.sh [API_URL]
API_URL="${1:-http://localhost:3001}"
curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@samplechurch.org","password":"Password123!"}' | jq -r '.accessToken'
