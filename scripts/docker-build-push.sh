#!/usr/bin/env bash
# Build (and optionally push) betmundial-web images from the current tree.
# Usage:
#   ./scripts/docker-build-push.sh live|staging [--push]
# Checkout the right branch yourself first (master=live, development=staging).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-}"
PUSH="${2:-}"
SHA="$(git rev-parse --short HEAD)"
REGISTRY="${REGISTRY:-ghcr.io/betmundial-ke}"

case "$TARGET" in
  live)
    IMAGE="$REGISTRY/web-live"
    APP_ENV=live
    ;;
  staging)
    IMAGE="$REGISTRY/web-staging"
    APP_ENV=staging
    ;;
  *)
    echo "Usage: $0 live|staging [--push]" >&2
    exit 1
    ;;
esac

OTC="${REACT_APP_OTCMEKI:-}"
if [[ -z "$OTC" && -f .env ]]; then
  # shellcheck disable=SC1091
  set -a
  # Only pull OTCMEKI if present; do not source whole .env into shell history noise
  OTC="$(grep -E '^REACT_APP_OTCMEKI=' .env | head -1 | cut -d= -f2- || true)"
  set +a
fi

DOCKER=(docker)
if ! docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
fi

echo "==> Building $IMAGE:$SHA (APP_ENV=$APP_ENV)"
"${DOCKER[@]}" build \
  --build-arg "APP_ENV=$APP_ENV" \
  --build-arg "REACT_APP_OTCMEKI=$OTC" \
  -t "$IMAGE:$SHA" \
  -t "$IMAGE:local" \
  .

if [[ "$PUSH" == "--push" ]]; then
  echo "==> Pushing $IMAGE:$SHA"
  "${DOCKER[@]}" push "$IMAGE:$SHA"
  "${DOCKER[@]}" tag "$IMAGE:$SHA" "$IMAGE:latest"
  "${DOCKER[@]}" push "$IMAGE:latest"
fi

echo "Done: $IMAGE:$SHA"
