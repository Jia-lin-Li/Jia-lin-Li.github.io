#!/usr/bin/env bash
website_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$website_root"
bash scripts/preview.sh
preview_status=$?
if [ "$preview_status" -ne 0 ]; then
  printf '\nPreview stopped. See the error above and README.md for setup instructions.\nPress Return to close. '
  read -r
fi
exit "$preview_status"
