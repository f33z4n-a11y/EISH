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
