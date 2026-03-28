#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REGISTRY_HOST="${1:-210.99.214.195:5000}"
APP_TAG="${2:-$(date +%Y%m%d-%H%M)}"
WEB_PUBLIC_API_BASE_URL="${3:-https://diff.xn----qd6ew2cx70c6uae40epc.com/api}"

LOCAL_BACKEND_IMAGE="docdiff-backend:${APP_TAG}"
LOCAL_FRONTEND_IMAGE="docdiff-frontend:${APP_TAG}"
REMOTE_BACKEND_IMAGE="${REGISTRY_HOST}/docdiff-backend:${APP_TAG}"
REMOTE_FRONTEND_IMAGE="${REGISTRY_HOST}/docdiff-frontend:${APP_TAG}"
REMOTE_BACKEND_LATEST="${REGISTRY_HOST}/docdiff-backend:latest"
REMOTE_FRONTEND_LATEST="${REGISTRY_HOST}/docdiff-frontend:latest"

push_with_retry() {
  local image="$1"
  local max_retries=3
  local attempt=1
  while true; do
    if docker push "${image}"; then
      return 0
    fi
    if [ "${attempt}" -ge "${max_retries}" ]; then
      echo "push failed after ${max_retries} attempts: ${image}" >&2
      return 1
    fi
    echo "push retry ${attempt}/${max_retries} failed: ${image}" >&2
    sleep 3
    attempt=$((attempt + 1))
  done
}

cd "${ROOT_DIR}"

echo "[1/6] backend image build: ${LOCAL_BACKEND_IMAGE}"
docker build \
  --platform linux/amd64 \
  -f backend/Dockerfile \
  -t "${LOCAL_BACKEND_IMAGE}" \
  backend

echo "[2/6] backend image tag/push: ${REMOTE_BACKEND_IMAGE}"
docker tag "${LOCAL_BACKEND_IMAGE}" "${REMOTE_BACKEND_IMAGE}"
push_with_retry "${REMOTE_BACKEND_IMAGE}"
docker tag "${LOCAL_BACKEND_IMAGE}" "${REMOTE_BACKEND_LATEST}"
push_with_retry "${REMOTE_BACKEND_LATEST}"

echo "[3/6] frontend image build: ${LOCAL_FRONTEND_IMAGE}"
docker build \
  --platform linux/amd64 \
  -f frontend/Dockerfile \
  --build-arg VITE_API_URL="${WEB_PUBLIC_API_BASE_URL}" \
  -t "${LOCAL_FRONTEND_IMAGE}" \
  frontend

echo "[4/6] frontend image tag/push: ${REMOTE_FRONTEND_IMAGE}"
docker tag "${LOCAL_FRONTEND_IMAGE}" "${REMOTE_FRONTEND_IMAGE}"
push_with_retry "${REMOTE_FRONTEND_IMAGE}"
docker tag "${LOCAL_FRONTEND_IMAGE}" "${REMOTE_FRONTEND_LATEST}"
push_with_retry "${REMOTE_FRONTEND_LATEST}"

echo "Done."
echo "backend(tag):   ${REMOTE_BACKEND_IMAGE}"
echo "backend(latest): ${REMOTE_BACKEND_LATEST}"
echo "frontend(tag):   ${REMOTE_FRONTEND_IMAGE}"
echo "frontend(latest): ${REMOTE_FRONTEND_LATEST}"
