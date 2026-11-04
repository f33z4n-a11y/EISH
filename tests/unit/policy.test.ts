import { describe, expect, it } from "vitest";
import {
  ABSOLUTE_MS,
  IDLE_MS,
  canApprove,
  canManageUsers,
  canReadDraft,
  sessionValid,
} from "../../src/lib/policy";
import { createUserSchema, loginSchema } from "../../src/lib/validation";
import { tokenHash, validOrigin } from "../../src/lib/security";
describe("kebijakan akses dan validasi", () => {
  it("Admin dan penulis biasa tidak otomatis Approver", () => {
    expect(canApprove(["ADMIN"])).toBe(false);
    expect(canApprove(["CONTRIBUTOR"])).toBe(false);
    expect(canApprove(["APPROVER", "CONTRIBUTOR"])).toBe(true);
    expect(canManageUsers(["READER"])).toBe(false);
    expect(canManageUsers(["ADMIN"])).toBe(true);
    expect(canReadDraft(["READER"])).toBe(false);
  });
  it("session habis tepat di batas idle dan absolut", () => {
    const now = new Date();
    expect(
      sessionValid(
        { lastSeenAt: now, expiresAt: new Date(+now + ABSOLUTE_MS) },
        now,
      ),
    ).toBe(true);
    expect(
      sessionValid(
        { lastSeenAt: new Date(+now - IDLE_MS), expiresAt: new Date(+now + 1) },
        now,
      ),
    ).toBe(false);
    expect(sessionValid({ lastSeenAt: now, expiresAt: now }, now)).toBe(false);
  });
  it("normalisasi pengenal tanpa mengubah password", () => {
    expect(
      loginSchema.parse({
        identifier: " READER@EXAMPLE.TEST ",
        password: " Tetap ",
      }),
    ).toEqual({ identifier: "reader@example.test", password: " Tetap " });
  });
  it("menolak username ambigu dan eskalasi role melalui formulir", () => {
    const input = {
      name: "Akun Dummy",
      email: "a@example.test",
      username: "akun",
      password: "password-dummy-12",
      role: "READER",
    };
    expect(createUserSchema.safeParse(input).success).toBe(true);
    expect(
      createUserSchema.safeParse({ ...input, username: "a@example.test" })
        .success,
    ).toBe(false);
    expect(
      createUserSchema.safeParse({ ...input, role: "APPROVER" }).success,
    ).toBe(false);
    expect(
      createUserSchema.safeParse({ ...input, password: "é".repeat(40) })
        .success,
    ).toBe(false);
  });
  it("mutasi hanya menerima origin aplikasi", () => {
    expect(
      validOrigin(
        new Request("http://localhost:3000", {
          headers: { origin: "http://localhost:3000" },
        }),
      ),
    ).toBe(true);
    expect(
      validOrigin(
        new Request("http://localhost:3000", {
          headers: { origin: "https://asing.example" },
        }),
      ),
    ).toBe(false);
    expect(validOrigin(new Request("http://localhost:3000"))).toBe(false);
    expect(tokenHash("token")).not.toContain("token");
  });
});
