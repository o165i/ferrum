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

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment configuration. Check .env against .env.example");
}

export const env = parsed.data;
