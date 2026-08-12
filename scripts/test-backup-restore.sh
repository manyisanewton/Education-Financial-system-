#!/usr/bin/env bash
set -euo pipefail
restore_db="shulefinance_restore_test"
temp_dir="$(mktemp -d)"
cleanup(){ docker compose exec -T postgres dropdb -U shulefinance --if-exists "$restore_db" >/dev/null 2>&1 || true; rm -rf "$temp_dir"; }
trap cleanup EXIT
backup_path="$(bash scripts/backup-database.sh "$temp_dir")"
sha256sum -c "$backup_path.sha256"
docker compose exec -T postgres dropdb -U shulefinance --if-exists "$restore_db"
docker compose exec -T postgres createdb -U shulefinance "$restore_db"
docker compose exec -T postgres pg_restore -U shulefinance -d "$restore_db" --no-owner --no-acl < "$backup_path"
table_count="$(docker compose exec -T postgres psql -U shulefinance -d "$restore_db" -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")"
school_count="$(docker compose exec -T postgres psql -U shulefinance -d "$restore_db" -Atc "SELECT count(*) FROM schools;")"
test "$table_count" -ge 20
test "$school_count" -ge 1
echo "Restore verification passed: $table_count tables, $school_count school(s)."
