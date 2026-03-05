#!/bin/bash
# Add a member (auto-login) - usage: ./scripts/add-member.sh "Full Name" "email@example.com" [API_URL]
# churchId is optional - uses your church scope when omitted
FULL_NAME="${1:-New Member}"
EMAIL="${2:-}"
API_URL="${3:-http://localhost:3001/api}"

TOKEN=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@samplechurch.org","password":"Password123!"}' | jq -r '.accessToken')

if [ -n "$EMAIL" ]; then
  BODY="{\"fullName\":\"$FULL_NAME\",\"email\":\"$EMAIL\"}"
else
  BODY="{\"fullName\":\"$FULL_NAME\"}"
fi

curl -s -X POST "$API_URL/members" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d "$BODY" | jq .
