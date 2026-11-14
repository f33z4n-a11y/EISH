import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { validOrigin, redirectResponse } from "@/lib/security";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!validOrigin(request)) return new Response("Permintaan ditolak.", { status: 403 }); const actor = await currentUser(); if (!actor?.roles.includes("ADMIN")) return new Response("Akses ditolak.", { status: 403 });
  try { const form = await request.formData(); const active = form.get("active") === "true"; const id = (await context.params).id; await db.$transaction(async (tx) => { await tx.category.update({ where: { id }, data: { active } }); await tx.auditEvent.create({ data: { actorId: actor.id, action: active ? "CATEGORY_ACTIVATED" : "CATEGORY_DEACTIVATED", entityType: "CATEGORY", entityId: id } }); }); return redirectResponse("/admin?hasil=diperbarui"); } catch { return redirectResponse("/admin?hasil=gagal"); }
}
