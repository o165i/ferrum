# FERRUM — backend skeleton

Рабочий, запускаемый локально бэкенд-скелет для проекта FERRUM.
Это **первая итерация** (Requirements → Architecture → Database → Backend/API → Auth),
согласно шагам 1–5 из технического задания. Frontend-прототип (`ferrum-prototype.jsx`)
пока не подключён к API — это следующий шаг.

## 1. Стек и почему он выбран

| Слой | Технология | Почему |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Frontend и Backend в одном репозитории, API-роуты как serverless-функции, легко деплоится в контейнер |
| DB | PostgreSQL | Персистентная реляционная БД, требование задания |
| ORM | Prisma | Миграции, типобезопасность, готовый `Prisma.PrismaClientKnownRequestError` для обработки ошибок БД |
| Auth | Auth.js (next-auth v4), Credentials + JWT-сессии | Проверенная библиотека, не пишем свою криптографию; JWT — потому что Credentials provider в NextAuth v4 официально несовместим с database sessions |
| Валидация | Zod | Единая схема валидации на входе каждого API-роута |
| Пароли | bcryptjs | Хэширование с солью, 12 раундов |
| Логи | pino | Структурированные JSON-логи в stdout — то, что ожидает Docker/Kubernetes |
| Тесты | Vitest | Быстрый unit-test раннер, совместимый с TS/ESM из коробки |
| Контейнеризация | Docker + docker-compose | app + postgres, multi-stage build, `output: "standalone"` |

## 2. Структура проекта

```
src/
  app/
    api/
      health/route.ts              GET  /api/health
      auth/register/route.ts       POST /api/auth/register
      auth/[...nextauth]/route.ts  Auth.js (signin/signout/session)
      products/route.ts            GET, POST /api/products
      products/[id]/route.ts       GET, PUT, DELETE /api/products/:id
    layout.tsx, page.tsx           временная стартовая страница
  lib/
    env.ts                        валидация переменных окружения при старте
    logger.ts                     pino-логгер
    errors.ts                     доменные ошибки + единый маппинг в HTTP-ответ
    prisma.ts                     singleton Prisma-клиент
    auth.ts                       конфигурация Auth.js
    session.ts                    requireAuth() / requireAdmin() хелперы
    validation/
      auth.ts                     Zod-схемы регистрации
      product.ts                  Zod-схемы CRUD и списка товаров
  types/next-auth.d.ts             типы session.user.id / role
prisma/
  schema.prisma                   модели User, Product
  seed.ts                         тестовые пользователи + товары из прототипа
Dockerfile
docker-compose.yml
.env.example
```

Разделение ответственности: UI (`app/`) отдельно от бизнес-логики и доступа к БД (`lib/`, `prisma/`),
валидация отдельно от обработчиков роутов, ошибки — через единый `toErrorResponse`.

## 3. Модель данных

```
User
 ├─ id            String (cuid)
 ├─ email         String  @unique
 ├─ passwordHash  String
 ├─ name          String?
 ├─ role          USER | ADMIN
 └─ createdAt / updatedAt

Product
 ├─ id            String (cuid)
 ├─ ref           String  @unique     (напр. "FR-014")
 ├─ name, slug
 ├─ category      OUTERWEAR | KNITWEAR | DENIM | TOPS | ACCESSORIES
 ├─ color
 ├─ priceCents / saleCents            (деньги в центах, без float)
 ├─ description, sizes[], images[]
 ├─ stock, isActive
 └─ createdAt / updatedAt
```

`isActive` используется для soft delete — `DELETE /api/products/:id` не стирает
строку из БД, а помечает товар неактивным (история заказов в будущем не сломается).

## 4. API

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/api/health` | public | статус приложения + доступность БД |
| POST | `/api/auth/register` | public | регистрация, роль всегда `USER` |
| POST | `/api/auth/callback/credentials` | public | логин (через Auth.js) |
| POST | `/api/auth/signout` | authenticated | логаут (через Auth.js) |
| GET | `/api/products` | public | список: `?category=&color=&search=&sort=price_asc\|price_desc\|newest&page=&pageSize=` |
| POST | `/api/products` | ADMIN | создать товар |
| GET | `/api/products/:id` | public | один товар |
| PUT | `/api/products/:id` | ADMIN | обновить товар |
| DELETE | `/api/products/:id` | ADMIN | деактивировать товар (soft delete) |

Ошибки — всегда в формате `{ "error": { "code": "...", "message": "...", "issues"?: ... } }`
и правильные статусы: 400 / 401 / 403 / 404 / 409 / 500. Наружу никогда не уходят
stack trace, данные подключения к БД или прочие внутренности — см. `lib/errors.ts`.

## 5. Локальный запуск

### Вариант А — одна команда (рекомендуется)

Нужен только Docker. `npm install`, генерация Prisma-клиента, миграции и сид —
всё автоматически.

```bash
# macOS / Linux / Git Bash / WSL
./scripts/dev-up.sh

# Windows PowerShell
.\scripts\dev-up.ps1
```

Что происходит внутри:
1. Если `.env` нет — копируется из `.env.example`, `NEXTAUTH_SECRET` генерируется сам.
2. `docker compose up -d --build` поднимает Postgres и приложение.
3. Контейнер приложения при **каждом старте** сам применяет непримененные
   миграции (`prisma migrate deploy` внутри `docker-entrypoint.sh`) — руками
   это больше не нужно.
4. Разово прогоняется сид (`docker compose --profile tools run --rm seed`) —
   сам по себе при обычном `up` он не запускается, только явной командой.

Готово: `http://localhost:3000`.

### Вариант Б — руками, но всё ещё через Docker

```bash
cp .env.example .env
# впиши NEXTAUTH_SECRET (например: openssl rand -base64 32)

docker compose up -d --build                   # db + app, миграции применятся сами
docker compose --profile tools run --rm seed   # один раз — тестовые данные
```

### Вариант В — Node локально, Postgres в Docker (для дебага без пересборки образа)

```bash
npm install
cp .env.example .env
# в .env поменять DATABASE_URL хост "db" -> "localhost"

docker compose up -d db
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Тестовые пользователи после сида:

- `admin@ferrum.dev` / `Admin123!` (роль ADMIN)
- `user@ferrum.dev` / `User123!` (роль USER)

### Проверить, что всё работает

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
```

## 6. CI/CD

`.gitlab-ci.yml` — на каждый push/MR: `install` (npm ci + prisma generate) →
`check` (lint, unit-тесты, `prisma validate` — параллельно) → `build` (`next build`) →
`docker-build` (сборка образа через docker:dind, только для `main` и merge request'ов).
Ничего не деплоит — это проверочный пайплайн (CI); деплой (CD, `deploy`-stage
с `environment:` и т.п.) добавим отдельно, когда определитесь с хостингом/registry.

`npm ci` в пайплайне не спотыкается об интерактивное подтверждение install-скриптов
Prisma — они заранее разрешены в `package.json` через поле `allowScripts`
(современный npm с версии ~11 требует явного разрешения на выполнение
post/preinstall-скриптов пакетов — это защита от supply-chain атак).

## 7. Тесты

```bash
npm test
```

Пока покрыты Zod-схемы валидации (`src/lib/validation/__tests__`). Следующий шаг —
integration-тесты на API-роуты (регистрация → логин → создание товара админом)
и позже E2E на весь пользовательский сценарий.

## 8. Известные ограничения этой итерации

- Frontend ещё живёт отдельно как прототип (`ferrum-prototype.jsx`) и не подключён
  к этому API — это следующий этап работы.
- Нет сущности заказа/корзины — CRUD пока только для `Product`. Полноценный
  lifecycle (Cart → Order → Payment status) добавляется отдельным шагом,
  чтобы не смешивать несколько больших фич в одном PR.
- `prisma migrate dev` создаст первую миграцию при первом запуске у каждого
  разработчика — сам файл миграции в этот архив не включён, чтобы не подгонять
  его под чужую версию Prisma engine.
- Runtime-образ несёт с собой полный `node_modules` (а не урезанный
  `output: "standalone"`), потому что `prisma migrate deploy` и сид должны
  уметь выполняться прямо внутри контейнера при старте. Компромисс:
  образ немного больше, зато миграции/сид не требуют ручных шагов ни локально,
  ни в CI/CD.
- Скрипты в `scripts/` уже с правами на исполнение в архиве; если git при
  клонировании их сбросит — `chmod +x scripts/dev-up.sh docker-entrypoint.sh`.
