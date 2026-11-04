import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "../../src/lib/db";
import { authenticate, currentUser } from "../../src/lib/auth";
import { createAccount } from "../../src/lib/users";
import { IDLE_MS } from "../../src/lib/policy";
import { tokenHash } from "../../src/lib/security";
const tag = randomUUID().slice(0, 8);
const username = `test-${tag}`;
const password = "sintetis-password-aman";
let id: string;
let token: string;
describe("autentikasi dengan PostgreSQL sebenarnya", () => {
  beforeAll(async () => {
    await db.role.upsert({
      where: { code: "READER" },
      create: { code: "READER" },
      update: {},
    });
    const user = await db.user.create({
      data: {
        name: "Uji Sintetis",
        email: `${username}@example.test`,
        username,
        passwordHash: await hash(password, 12),
        roles: { create: { role: "READER" } },
      },
    });
    id = user.id;
  });
  afterAll(async () => {
    if (id) {
      await db.auditEvent.deleteMany({ where: { actorId: id } });
      await db.session.deleteMany({ where: { userId: id } });
      await db.userRole.deleteMany({ where: { userId: id } });
      await db.user.delete({ where: { id } });
    }
    await db.$disconnect();
  });
  it("login username dan email menghasilkan session opaque dengan hash saja di database", async () => {
    token = (await authenticate(username, password))!;
    expect(token).toBeTruthy();
    expect((await currentUser(token))?.id).toBe(id);
    expect(
      await db.session.findUnique({ where: { tokenHash: token } }),
    ).toBeNull();
    const emailToken = await authenticate(`${username}@example.test`, password);
    expect(emailToken).toBeTruthy();
    expect((await currentUser(emailToken!))?.id).toBe(id);
  });
  it("password salah dan akun tidak ada sama-sama gagal", async () => {
    expect(await authenticate(username, "salah")).toBeNull();
    expect(await authenticate(`tidak-ada-${tag}`, password)).toBeNull();
  });
  it("akun nonaktif menolak session lama dan login baru", async () => {
    await db.user.update({ where: { id }, data: { active: false } });
    expect(await currentUser(token)).toBeNull();
    expect(await authenticate(username, password)).toBeNull();
    await db.user.update({ where: { id }, data: { active: true } });
  });
  it("session lewat batas idle ditolak", async () => {
    await db.session.update({
      where: { tokenHash: tokenHash(token) },
      data: { lastSeenAt: new Date(Date.now() - IDLE_MS - 1000) },
    });
    expect(await currentUser(token)).toBeNull();
  });
  it("batas absolut delapan jam ditolak meski idle belum habis", async () => {
    await db.session.update({
      where: { tokenHash: tokenHash(token) },
      data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() - 1) },
    });
    expect(await currentUser(token)).toBeNull();
  });
  it("perubahan role terbaca pada session berikutnya", async () => {
    await db.role.upsert({
      where: { code: "EDITOR" },
      create: { code: "EDITOR" },
      update: {},
    });
    const raw = (await import("node:crypto"))
      .randomBytes(32)
      .toString("base64url");
    await db.session.create({
      data: {
        userId: id,
        tokenHash: tokenHash(raw),
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    await db.userRole.create({ data: { userId: id, role: "EDITOR" } });
    expect((await currentUser(raw))?.roles).toContain("EDITOR");
    await db.userRole.delete({
      where: { userId_role: { userId: id, role: "EDITOR" } },
    });
    expect((await currentUser(raw))?.roles).not.toContain("EDITOR");
  });
  it("role reader tidak dapat membuat akun meski memanggil layanan langsung", async () => {
    await expect(createAccount({ id, roles: ["READER"] }, {})).rejects.toThrow(
      "Akses ditolak",
    );
    await expect(
      createAccount(
        { id, roles: ["ADMIN"] },
        {
          name: "Palsu",
          email: "palsu@example.test",
          username: "palsu",
          password,
          role: "READER",
        },
      ),
    ).rejects.toThrow("Akses ditolak");
  });
  it("pembatasan percobaan bertahan di database", async () => {
    const target = `rate-${tag}`;
    for (let i = 0; i < 5; i++)
      expect(await authenticate(target, password)).toBeNull();
    const { allowedAttempt } = await import("../../src/lib/auth");
    expect(await allowedAttempt(target)).toBe(false);
  });
});
