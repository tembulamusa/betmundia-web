#!/usr/bin/env bash
# Build the staging web image from this checkout and deploy it.
#
#   ./scripts/deploy-staging.sh              # build development HEAD and deploy
#   ./scripts/deploy-staging.sh --no-deploy  # build only
#
# Why this exists rather than scripts/docker-build-push.sh:
#
#   * The build host is x86_64 and dev laptops are arm64, so the image is built
#     on pr-api-apps-1 from a git archive of the current HEAD. Building locally
#     produces an arm64 image the server cannot run.
#   * Pushing to ghcr needs write:packages, which the host token and the usual
#     gh token both lack, so the image stays local to the build host and is
#     deployed from there by tag.
#
# Deploying anything other than development is how staging lost the casino
# provider fix four times: images hand-built from unpushed feature branches,
# each cut from a base that predated the fix, deployed by setting the image tag
# directly and bypassing WEB_STAGING_TAG. development is the staging branch
# (see package.json "staging"), so that is what this builds.
set -euo pipefail

BRANCH="${BRANCH:-development}"
HOST="${HOST:-betmundialAPI}"
# Relative on purpose: both ssh and scp resolve a relative remote path against
# the login home, but scp does not expand $HOME in a destination -- it takes it
# literally and fails with "No such file or directory".
REMOTE_DIR="${REMOTE_DIR:-web-dev}"
COMPOSE_DIR="${COMPOSE_DIR:-/opt/betmundial-test/web/web-test}"
IMAGE="${IMAGE:-ghcr.io/betmundial-ke/web-staging}"
DEPLOY=1
[[ "${1:-}" == "--no-deploy" ]] && DEPLOY=0

cd "$(dirname "$0")/.."

# Refuse to ship a tree that is not what is committed: the tag is a commit sha,
# so uncommitted edits would be invisible in the deployed image's name.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree is dirty -- commit or stash first" >&2
  exit 1
fi

git fetch -q origin "$BRANCH"
git checkout -q "$BRANCH"
git merge -q --ff-only "origin/$BRANCH"
SHA="$(git rev-parse --short=8 HEAD)"
echo "==> $BRANCH at $SHA"

# A lobby that renders no tiles is the failure this guards against; it is
# cheaper to fail here than to discover it on staging.
if ! grep -q '"blackbird", "egtdigital"' src/components/pages/casino/casino-game.js; then
  echo "casino-game.js is missing blackbird/egtdigital from inProduction." >&2
  echo "Rebase onto origin/$BRANCH -- see memory: casino-lobby-provider-allowlist" >&2
  exit 1
fi

TAR="$(mktemp -t webdev)".tar.gz
git archive --format=tar.gz HEAD -o "$TAR"
ssh "$HOST" "rm -rf $REMOTE_DIR && mkdir -p $REMOTE_DIR"
scp -q "$TAR" "$HOST:$REMOTE_DIR/src.tar.gz"
rm -f "$TAR"

echo "==> building $IMAGE:$SHA on $HOST"
ssh "$HOST" "cd $REMOTE_DIR && tar xzf src.tar.gz && rm src.tar.gz && \
  sudo -n docker build --build-arg APP_ENV=staging \
    --build-arg REACT_APP_OTCMEKI=\"\${REACT_APP_OTCMEKI:-}\" \
    -t $IMAGE:$SHA ."

# Verify the artefact, not the source: a build arg or stale layer could still
# produce a bundle without the fix.
echo "==> verifying built bundle"
ssh "$HOST" "sudo -n docker run --rm --entrypoint sh $IMAGE:$SHA -c \
  'grep -q \"\\\"blackbird\\\",\\\"egtdigital\\\"\" /usr/share/nginx/html/static/js/main.*.js'" \
  || { echo "built bundle lacks the provider allowlist entries" >&2; exit 1; }

if (( DEPLOY == 0 )); then
  echo "built $IMAGE:$SHA (not deployed)"
  exit 0
fi

echo "==> deploying $SHA"
ssh "$HOST" "cd $COMPOSE_DIR && \
  sudo -n sed -i 's/^WEB_STAGING_TAG=.*/WEB_STAGING_TAG=$SHA/' .env && \
  sudo -n docker compose up -d --no-deps web-test"

sleep 12
ssh "$HOST" "sudo -n docker ps --filter name=bm-web-test --format '{{.Image}} | {{.Status}}'"
echo "==> https://staging.betmundial.com/casino/providers/blackbird"
