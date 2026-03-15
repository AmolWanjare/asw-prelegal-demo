#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Building Prelegal Docker image..."
docker build -t prelegal .

echo "Stopping any existing container..."
docker rm -f prelegal-app 2>/dev/null || true

echo "Starting Prelegal..."
docker run -d \
  --name prelegal-app \
  -p 8000:8000 \
  --env-file .env \
  prelegal

echo ""
echo "Prelegal is running at http://localhost:8000"
