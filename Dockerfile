# ---- deps: все зависимости (нужны для сборки) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- prod-deps: только production-зависимости (пойдут в runtime-образ) ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---- build: компилируем Next.js ----
FROM node:20-alpine AS build
WORKDIR /app
# Prisma на Alpine нужен openssl, иначе выбирает неподходящий движок
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# env.ts проверяет переменные уже во время сборки; настоящие значения придут при запуске.
# Заданы прямо в команде, поэтому в переменные окружения образа не попадают.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    NEXTAUTH_SECRET="build-time-placeholder" \
    npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
# сгенерированный Prisma-клиент (в prod-deps его нет)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Перед стартом сервера сам применяет непримененные миграции (prisma migrate deploy
# идемпотентен — безопасно гонять на каждом старте контейнера).
ENTRYPOINT ["./docker-entrypoint.sh"]
