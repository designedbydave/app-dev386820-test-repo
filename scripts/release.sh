#!/usr/bin/env bash
# Simulate a release for the ServiceNow change-gate demo:
#   1. bump the version in package.json (patch, minor or major)
#   2. add a CHANGELOG.md entry, so the release has a real code change
#   3. commit, create an annotated tag vX.Y.Z
#   4. push main, then the tag (the tag push starts build-and-deploy)
#
# Usage: scripts/release.sh [patch|minor|major] [--yes]
#   --yes  push without asking for confirmation
set -euo pipefail

BUMP="patch"
ASSUME_YES=false
for arg in "$@"; do
  case "$arg" in
    patch|minor|major) BUMP="$arg" ;;
    --yes|-y) ASSUME_YES=true ;;
    *) echo "Usage: $0 [patch|minor|major] [--yes]" >&2; exit 2 ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"

fail() { echo "error: $*" >&2; exit 1; }

# --- Preconditions -------------------------------------------------------------
[ "$(git branch --show-current)" = "main" ] || fail "switch to main first (git switch main)"
[ -z "$(git status --porcelain --untracked-files=no)" ] || fail "commit or stash your changes first"
git config user.email > /dev/null || fail "set your git identity first: git config --global user.name \"Your Name\" && git config --global user.email you@example.com"

git fetch --quiet --tags origin main
[ "$(git rev-parse main)" = "$(git rev-parse origin/main)" ] \
  || fail "main is not in sync with origin/main (pull or push first)"

# --- Next version --------------------------------------------------------------
CURRENT="v$(node -p "require('./package.json').version")"
LATEST_TAG=$(git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n1)

NEXT=$(npm version "$BUMP" --no-git-tag-version)  # updates package.json, prints vX.Y.Z

# Same rule the workflow enforces: the new tag must be newer than every existing release.
if [ -n "$LATEST_TAG" ] && [ "$(printf '%s\n%s\n' "$LATEST_TAG" "$NEXT" | sort -V | tail -n1)" != "$NEXT" ] \
   || [ "$LATEST_TAG" = "$NEXT" ]; then
  git checkout -- package.json
  fail "$NEXT is not newer than the latest tag $LATEST_TAG (package.json was $CURRENT); set package.json's version to $LATEST_TAG first"
fi

# --- Change, commit, tag -------------------------------------------------------
[ -f CHANGELOG.md ] || printf '# Changelog\n\n' > CHANGELOG.md
printf -- '- %s %s: demo release (%s bump from %s)\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$NEXT" "$BUMP" "$CURRENT" >> CHANGELOG.md

git add package.json CHANGELOG.md
git commit --quiet -m "Release $NEXT"
git tag -a "$NEXT" -m "Release $NEXT"

echo "Prepared $NEXT (previous tag: ${LATEST_TAG:-none})"
git log --oneline -1

# --- Push ----------------------------------------------------------------------
if ! $ASSUME_YES; then
  read -r -p "Push main and $NEXT to origin? This starts build-and-deploy. [y/N] " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Not pushed. To undo locally: git tag -d $NEXT && git reset --hard HEAD~1"
    exit 0
  fi
fi

# main first: the workflow checks that the tagged commit is already on origin/main.
git push --quiet origin main
git push --quiet origin "$NEXT"

echo "Pushed $NEXT. Follow the run at:"
echo "  $(git remote get-url origin | sed -E 's#^git@github.com:#https://github.com/#; s#\.git$##')/actions"
