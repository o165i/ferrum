import pino from "pino";

/**
 * Логи идут в stdout в JSON — это то, что ожидает любой контейнерный
 * оркестратор (Docker, k8s). Никогда не логируем пароли/токены/секреты:
 * вызывающий код обязан сам исключать такие поля из объекта context.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
