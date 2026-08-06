import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"), // bcrypt truncates beyond 72 bytes
  name: z.string().trim().min(1).max(80).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
