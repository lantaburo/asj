#!/usr/bin/env bash

set -euo pipefail

DATA_DIR="${AJS_PGDATA:-/tmp/ajs-local-pgdata}"
HOST="${AJS_PGHOST:-127.0.0.1}"
PORT="${AJS_PGPORT:-5432}"
USER_NAME="${AJS_PGUSER:-postgres}"
DB_NAME="${AJS_PGDATABASE:-ajs}"
LOG_FILE="${AJS_PGLOG:-/tmp/ajs-local-pg.log}"

run_pg() {
  curl -fsS https://pkgx.sh | sh -s -- +postgres "$@"
}

ensure_cluster() {
  if [[ -d "${DATA_DIR}/base" ]]; then
    return
  fi

  run_pg initdb -D "$DATA_DIR" -U "$USER_NAME" -A trust >/dev/null
}

is_running() {
  run_pg pg_ctl -D "$DATA_DIR" status >/dev/null 2>&1
}

start_server() {
  ensure_cluster

  if is_running; then
    return
  fi

  run_pg pg_ctl \
    -D "$DATA_DIR" \
    -l "$LOG_FILE" \
    -o "-p $PORT -h $HOST" \
    start -w >/dev/null
}

ensure_database() {
  start_server

  local exists
  exists="$(
    run_pg psql \
      -h "$HOST" \
      -p "$PORT" \
      -U "$USER_NAME" \
      -d postgres \
      -Atqc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'"
  )"

  if [[ "$exists" == "1" ]]; then
    return
  fi

  run_pg createdb -h "$HOST" -p "$PORT" -U "$USER_NAME" "$DB_NAME" >/dev/null
}

stop_server() {
  if ! [[ -d "${DATA_DIR}/base" ]]; then
    return
  fi

  if ! is_running; then
    return
  fi

  run_pg pg_ctl -D "$DATA_DIR" stop -m fast -w >/dev/null
}

print_status() {
  if ! [[ -d "${DATA_DIR}/base" ]]; then
    echo "Local Postgres cluster belum diinisialisasi di $DATA_DIR."
    return
  fi

  if is_running; then
    echo "Local Postgres berjalan di $HOST:$PORT dengan database $DB_NAME."
    return
  fi

  echo "Local Postgres sudah diinisialisasi tetapi belum berjalan."
}

prepare_database() {
  ensure_database
  npm run db:migrate:deploy
  npm run db:seed
}

case "${1:-}" in
  start)
    ensure_database
    echo "Local Postgres siap di $HOST:$PORT dengan database $DB_NAME."
    ;;
  stop)
    stop_server
    echo "Local Postgres dihentikan."
    ;;
  status)
    print_status
    ;;
  prepare)
    prepare_database
    ;;
  *)
    echo "Usage: bash scripts/local-postgres.sh {start|stop|status|prepare}" >&2
    exit 1
    ;;
esac
