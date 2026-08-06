import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/** Бросает 401, если запрос не аутентифицирован. Возвращает сессию иначе. */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }
  return session;
}

/** Бросает 401/403, если пользователь не ADMIN. */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return session;
}
