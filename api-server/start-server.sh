#!/bin/bash
pkill -f "chat-server" 2>/dev/null
sleep 1

export OPENROUTER_API_KEY="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"
node /opt/chat-server.js &
SERVER_PID=$!
echo "PID: $SERVER_PID"
sleep 4

echo "=== Process ==="
ps -p $SERVER_PID -o pid,comm,state 2>/dev/null || echo "Process not running"

echo "=== Port ==="
ss -tlnp | grep 3001 || echo "Port 3001 not listening"

echo "=== Local curl test ==="
curl -s --max-time 15 http://127.0.0.1:3001/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"say hi in 3 words"}]}' 2>&1 | head -5
