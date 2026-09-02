import { z } from "zod";

/**
 * Все переменные окружения проходят валидацию один раз при старте процесса.
 * Если чего-то не хватает — приложение падает сразу с понятной ошибкой,
 * а не где-то в середине обработки запроса.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),
});

// `next build` импортирует API-роуты при сборке, но реальные секреты
// доступны только в runtime (docker-compose / .env на сервере).
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

const envInput = isBuildTime
  ? {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://build:build@localhost:5432/build?schema=public",
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ?? "build-time-placeholder-not-used-at-runtime",
    }
  : process.env;

const parsed = envSchema.safeParse(envInput);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment configuration. Check .env against .env.example");
}

export const env = parsed.data;
