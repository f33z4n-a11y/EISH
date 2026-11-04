import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RoleCode } from "@prisma/client";
import { db } from "./db";
import { ABSOLUTE_MS, IDLE_MS, sessionValid } from "./policy";
import { appUrl, throttleKey, tokenHash } from "./security";
export const SESSION_COOKIE = "eish_session";
// Hash pembanding tetap untuk mengurangi perbedaan waktu akun tidak ditemukan.
const dummyHash = hash("bukan-password-pengguna", 12);
export async function allowedAttempt(
  identifier: string,
  now = new Date(),
): Promise<boolean> {
  const keys = [throttleKey(`identifier:${identifier}`), throttleKey("global")];
  return db.$transaction(async (tx) => {
    let allowed = true;
    for (const [index, key] of keys.entries()) {
      await tx.loginThrottle.upsert({
        where: { key },
        create: { key, attempts: 0, windowStart: now },
        update: {},
      });
      // Reset dan increment atomic di PostgreSQL; tidak bergantung memori proses.
      await tx.loginThrottle.updateMany({
        where: {
          key,
          windowStart: { lte: new Date(now.getTime() - 15 * 60_000) },
        },
        data: { attempts: 0, windowStart: now },
      });
      const row = await tx.loginThrottle.update({
        where: { key },
        data: { attempts: { increment: 1 } },
      });
      if (row.attempts > (index === 0 ? 5 : 100)) allowed = false;
    }
    return allowed;
  });
}
export async function authenticate(identifier: string, password: string) {
  if (!(await allowedAttempt(identifier))) return null;
  const user = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    include: { roles: true },
  });
  const correct = await compare(
    password,
    user?.passwordHash ?? (await dummyHash),
  );
  if (!user || !user.active || !correct) {
    await db.auditEvent.create({ data: { action: "LOGIN_FAILED" } });
    return null;
  }
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.session.create({
      data: {
        tokenHash: tokenHash(token),
        userId: user.id,
        createdAt: now,
        lastSeenAt: now,
        expiresAt: new Date(now.getTime() + ABSOLUTE_MS),
      },
    });
    await tx.auditEvent.create({
      data: { actorId: user.id, action: "LOGIN_SUCCESS", entityId: user.id },
    });
  });
  return token;
}
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: appUrl().protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ABSOLUTE_MS / 1000,
  };
}
export async function currentUser(token?: string, now = new Date()) {
  const raw = token ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw || !/^[A-Za-z0-9_-]{43}$/.test(raw)) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(raw) },
    include: { user: { include: { roles: true } } },
  });
  if (!session || !session.user.active || !sessionValid(session, now))
    return null;
  const touched = await db.session.updateMany({
    where: {
      id: session.id,
      expiresAt: { gt: now },
      lastSeenAt: { gt: new Date(now.getTime() - IDLE_MS) },
      user: { active: true },
    },
    data: { lastSeenAt: now },
  });
  if (touched.count !== 1) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    username: session.user.username,
    roles: session.user.roles.map((r) => r.role),
  };
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function requireRole(role: RoleCode) {
  const user = await requireUser();
  if (!user.roles.includes(role)) redirect("/dashboard?akses=ditolak");
  return user;
}
