#!/usr/bin/env bash
# Trainify Production Health Check / Monitoring Script
# Can be run manually or triggered on a schedule (e.g., cron, GitHub Actions).
#
# Usage:
#   BACKEND_URL=https://your-backend.example.com ./monitoring/health-check.sh
#   Or for local testing:
#   ./monitoring/health-check.sh

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected_status" ]; then
    echo "✅ $name — HTTP $status"
  else
    echo "❌ $name — expected HTTP $expected_status, got $status"
    FAIL=1
  fi
}

echo "═══════════════════════════════════════════"
echo "  Trainify Health Check"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════"
echo ""

# Backend checks
echo "Backend ($BACKEND_URL):"
check "Auth Login Redirect"    "$BACKEND_URL/auth/login"    302
check "Auth Token (no session)" "$BACKEND_URL/auth/token"    401
check "Trip API (no params)"    "$BACKEND_URL/api/trip"      400

echo ""

# Frontend check
echo "Frontend ($FRONTEND_URL):"
check "Frontend Served"         "$FRONTEND_URL"              200

echo ""
echo "═══════════════════════════════════════════"
if [ "$FAIL" -eq 0 ]; then
  echo "  All checks passed ✅"
else
  echo "  Some checks failed ❌"
  exit 1
fi
