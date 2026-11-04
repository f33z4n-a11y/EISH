import { z } from "zod";
export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}
export const loginSchema = z.object({
  identifier: z.string().min(1).max(254).transform(normalizeIdentifier),
  password: z
    .string()
    .min(1)
    .max(72)
    .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
});
export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(normalizeIdentifier),
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_.-]+$/)
    .transform(normalizeIdentifier),
  password: z
    .string()
    .min(12)
    .max(72)
    .refine(
      (v) => Buffer.byteLength(v, "utf8") <= 72,
      "Password maksimal 72 byte UTF-8.",
    ),
  role: z.enum(["READER", "CONTRIBUTOR", "EDITOR"]),
});
