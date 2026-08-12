#!/usr/bin/env bash
set -euo pipefail
backup_dir="${1:-backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$backup_dir/shulefinance-$timestamp.dump"
docker compose exec -T postgres pg_dump -U shulefinance -d shulefinance --format=custom --no-owner --no-acl > "$target"
test -s "$target"
sha256sum "$target" > "$target.sha256"
echo "$target"
