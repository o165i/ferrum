# ---- deps: все зависимости (нужны для сборки) ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- prod-deps: только production-зависимости (пойдут в runtime-образ) ----
FROM node:20-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---- build: компилируем Next.js ----
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
RUN npx prisma generate
# Placeholder-значения только для стадии сборки; в runtime-образ они не попадают,
# реальные переменные задаёт docker-compose / оркестратор.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ARG NEXTAUTH_SECRET="build-time-placeholder-not-used-at-runtime"
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
RUN npm run build

# ---- runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# node:20-slim (Debian) НЕ несёт системную libssl из коробки — Node использует
# свою статически слинкованную копию для TLS, а Prisma-движку нужна именно
# системная библиотека. Ставим её явно, как и в build-стадии.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npx prisma generate

RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Перед стартом сервера сам применяет непримененные миграции (prisma migrate deploy
# идемпотентен — безопасно гонять на каждом старте контейнера).
ENTRYPOINT ["./docker-entrypoint.sh"]
