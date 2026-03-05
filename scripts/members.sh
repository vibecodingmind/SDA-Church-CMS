#!/bin/bash
# Get members (auto-login) - usage: ./scripts/members.sh [API_URL]
API_URL="${1:-http://localhost:3001/api}"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@samplechurch.org","password":"Password123!"}' | jq -r '.accessToken')
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/members" | jq .
