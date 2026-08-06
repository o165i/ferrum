#!/bin/sh
# Полный локальный запуск в одну команду: ./scripts/dev-up.sh
# Требует: Docker + Docker Compose. Ничего больше ставить руками не нужно —
# npm install/prisma generate/миграции происходят внутри контейнеров.
set -e

if [ ! -f .env ]; then
  echo "[dev-up] .env не найден, копирую из .env.example"
  cp .env.example .env
  SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-only-secret-change-me")
  # заменяем плейсхолдер секрета на реально сгенерированный
  case "$(uname)" in
    Darwin) sed -i '' "s#replace-me-with-a-random-32-byte-secret#${SECRET}#" .env ;;
    *) sed -i "s#replace-me-with-a-random-32-byte-secret#${SECRET}#" .env ;;
  esac
fi

echo "[dev-up] поднимаю Postgres и приложение..."
docker compose up -d --build

echo "[dev-up] жду готовности приложения (миграции применяются автоматически при старте)..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "[dev-up] загружаю тестовые данные..."
docker compose --profile tools run --rm seed

echo "[dev-up] готово. http://localhost:3000"
echo "[dev-up] admin@ferrum.dev / Admin123!  |  user@ferrum.dev / User123!"
