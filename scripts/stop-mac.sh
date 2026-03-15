#!/usr/bin/env bash
set -euo pipefail

echo "Stopping Prelegal..."
docker stop prelegal-app 2>/dev/null || true
docker rm prelegal-app 2>/dev/null || true
echo "Prelegal stopped."
