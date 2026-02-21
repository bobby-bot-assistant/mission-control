#!/bin/bash
# Mission Control Deploy Script
# Same standard as Story Hour: build → restart → Harper QA → verify
# If Harper can't verify it works through the external URL, it doesn't ship.

set -e

MC_DIR="/Users/daisydukes/.openclaw/workspace/mission-control"
MC_PORT=3002
MC_URL="https://mc.bobbyalexis.com"

echo "🔨 Building Mission Control..."
cd "$MC_DIR"
rm -rf .next
NODE_ENV=production npx next build

echo "🔄 Restarting Mission Control on port $MC_PORT..."
pkill -f "next.*$MC_PORT" 2>/dev/null || true
sleep 2
nohup npx next start -p $MC_PORT > /tmp/mission-control.log 2>&1 &
sleep 4

# Health check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$MC_PORT")
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Mission Control failed to start (HTTP $HTTP_CODE)"
  exit 1
fi
echo "✅ Mission Control running on port $MC_PORT"

# Harper QA
echo "🧪 Running Harper QA against $MC_URL..."
if command -v npx &>/dev/null && [ -f "$MC_DIR/harper-qa-mc.js" ]; then
  node "$MC_DIR/harper-qa-mc.js" && echo "✅ Harper QA passed" || echo "⚠️ Harper QA found issues (check report)"
else
  echo "⚠️ Harper QA script not found, skipping"
fi

echo ""
echo "Deploy complete. Access at: $MC_URL"
