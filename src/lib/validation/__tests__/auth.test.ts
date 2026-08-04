import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation/auth";

describe("registerSchema", () => {
  it("normalizes email and accepts a valid account", () => {
    const result = registerSchema.parse({ email: " User@Example.com ", password: "password123", name: "User" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects a short password", () => {
    expect(registerSchema.safeParse({ email: "user@example.com", password: "short" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ email: "invalid", password: "password123" }).success).toBe(false);
  });
});
