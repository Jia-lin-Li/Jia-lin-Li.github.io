#!/usr/bin/env bash
set -euo pipefail
website_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$website_root"
export JEKYLL_ENV=development
printf 'Local preview: http://127.0.0.1:4173/\nKeep this terminal open. Press Control+C to stop.\n'
exec bash scripts/bundle.sh exec jekyll serve --config _config.yml,_config.dev.yml --destination _site-preview --host 127.0.0.1 --port 4173 --watch --force_polling
