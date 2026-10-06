#!/usr/bin/env bash
# Simulated deployment for the demo pipeline: serves the built site on the runner
# and waits until /health.json responds. Swap this for a real deploy step
# (S3 sync, Azure Static Web Apps, Pages, etc.) in a customer pipeline.
#
# Usage: deploy-local.sh <site-dir> <port> <environment>
set -euo pipefail

SITE_DIR="${1:?site dir required}"
PORT="${2:-4321}"
TARGET_ENV="${3:-test}"
PID_FILE="${RUNNER_TEMP:-/tmp}/site.pid"
LOG_FILE="${RUNNER_TEMP:-/tmp}/site.log"
READY_URL="http://localhost:${PORT}/health.json"
MAX_WAIT_SECONDS=30
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying ${SITE_DIR} to '${TARGET_ENV}' on port ${PORT}"

nohup node "${SCRIPT_DIR}/serve.mjs" "${SITE_DIR}" "${PORT}" > "${LOG_FILE}" 2>&1 &
echo $! > "${PID_FILE}"

for ((i = 1; i <= MAX_WAIT_SECONDS; i++)); do
  if curl -fsS "${READY_URL}" > /dev/null 2>&1; then
    echo "Site is ready after ${i}s: $(curl -fsS "${READY_URL}")"
    exit 0
  fi
  if ! kill -0 "$(cat "${PID_FILE}")" 2> /dev/null; then
    echo "::error::Server exited during startup"
    cat "${LOG_FILE}"
    exit 1
  fi
  sleep 1
done

echo "::error::Site did not become ready within ${MAX_WAIT_SECONDS}s"
cat "${LOG_FILE}"
exit 1
