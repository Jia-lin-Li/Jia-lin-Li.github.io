#!/usr/bin/env bash
set -euo pipefail
website_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$website_root"
export JEKYLL_ENV=production
exec bash scripts/bundle.sh exec jekyll build --safe
