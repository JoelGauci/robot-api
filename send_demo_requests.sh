#!/bin/bash
# 1. Read optional target URL, fallback to localhost:3000
BASE_URL=${1:-http://localhost:3000}

echo "Starting to send API calls to the Robot server at ${BASE_URL}..."
sleep 2

# 1. GET capabilities
echo "Sending GET capabilities request..."
curl -s -X GET "${BASE_URL}/robot/v1/capabilities" \
  -H "X-Client-App: RobotDashboard"

sleep 1.5

# 2. POST state with user
echo "Sending POST state (Walking) request..."
curl -s -X POST "${BASE_URL}/robot/v1/state" \
  -H "Content-Type: application/json" \
  -H "X-User: joelgauci" \
  -d '{"name": "Walking"}'

sleep 1.5

# 3. POST emote with JWT token in Authorization header
echo "Sending POST emote (Jump) request with JWT..."
curl -s -X POST "${BASE_URL}/robot/v1/emote" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvZWwgR2F1Y2kiLCJpYXQiOjE1MTYyMzkwMjIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiam9lbC5nYXVjaUBleGFtcGxlLmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" \
  -d '{"name": "Jump"}'

sleep 1.5

# 4. POST expression with JWT token in X-JWT-Assertion header
echo "Sending POST expression (Surprised) request with another JWT..."
curl -s -X POST "${BASE_URL}/robot/v1/expression" \
  -H "Content-Type: application/json" \
  -H "X-Custom-Header: ThreeJS-Control" \
  -H "X-JWT-Assertion: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcGlnZWUtc2FtcGxlIiwiY2xpZW50X2lkIjoiMjk4MzgxOTIyIiwic2NvcGVzIjpbInJvYm90OmNvbnRyb2wiLCJyb2JvdDpyZWFkIl0sImV4cCI6OTk5OTk5OTk5OX0.arbitrary_sig" \
  -d '{"name": "Surprised", "value": 0.8}'

echo "Done sending API calls!"
