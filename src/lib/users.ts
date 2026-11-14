import { hash } from "bcryptjs";
import { db } from "./db";
import { createUserSchema } from "./validation";
import { canManageUsers } from "./policy";
import type { RoleCode } from "@prisma/client";
export async function createAccount(
  actor: { id: string; roles: RoleCode[] },
  input: unknown,
) {
  if (!canManageUsers(actor.roles)) throw new Error("Akses ditolak");
  const data = createUserSchema.parse(input);
  const passwordHash = await hash(data.password, 12);
  return db.$transaction(async (tx) => {
    // Periksa kembali status dan role aktor saat mutasi.
    const admin = await tx.user.findFirst({
      where: { id: actor.id, active: true, roles: { some: { role: "ADMIN" } } },
    });
    if (!admin) throw new Error("Akses ditolak");
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        passwordHash,
        roles: { create: { role: data.role } },
      },
    });
    await tx.auditEvent.create({
      data: { actorId: actor.id, action: "USER_CREATED", entityId: user.id },
    });
    return { id: user.id };
  });
}

export async function updateAccount(
  actor: { id: string; roles: RoleCode[] },
  userId: string,
  input: { active?: boolean; role?: RoleCode },
) {
  if (!canManageUsers(actor.roles)) throw new Error("Akses ditolak");
  if (userId === actor.id && input.active === false)
    throw new Error("Admin tidak dapat menonaktifkan akunnya sendiri.");
  const operational: RoleCode[] = ["READER", "CONTRIBUTOR", "EDITOR"];
  if (input.role && !operational.includes(input.role))
    throw new Error("Peran tidak dapat diberikan melalui halaman ini.");
  return db.$transaction(async (tx) => {
    const admin = await tx.user.findFirst({ where: { id: actor.id, active: true, roles: { some: { role: "ADMIN" } } } });
    if (!admin) throw new Error("Akses ditolak");
    const target = await tx.user.findUnique({ where: { id: userId } });
    if (!target) throw new Error("Akun tidak ditemukan");
    if (typeof input.active === "boolean") {
      await tx.user.update({ where: { id: userId }, data: { active: input.active } });
      if (!input.active) await tx.session.deleteMany({ where: { userId } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: input.active ? "USER_ACTIVATED" : "USER_DEACTIVATED", entityType: "USER", entityId: userId } });
    }
    if (input.role) {
      await tx.userRole.deleteMany({ where: { userId, role: { in: operational } } });
      await tx.userRole.create({ data: { userId, role: input.role } });
      await tx.auditEvent.create({ data: { actorId: actor.id, action: "USER_ROLE_CHANGED", entityType: "USER", entityId: userId, metadata: { role: input.role } } });
    }
  });
}
