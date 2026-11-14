import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { validOrigin, redirectResponse } from "@/lib/security";
export async function POST(request: Request) {
  if (!validOrigin(request)) return new Response("Permintaan ditolak.", { status: 403 }); const actor = await currentUser(); if (!actor?.roles.includes("ADMIN")) return new Response("Akses ditolak.", { status: 403 });
  try { const name = String((await request.formData()).get("name") ?? "").trim(); if (name.length < 2 || name.length > 100) throw new Error(); await db.$transaction(async (tx) => { const category = await tx.category.create({ data: { code: `CUSTOM-${Date.now()}`, name } }); await tx.auditEvent.create({ data: { actorId: actor.id, action: "CATEGORY_CREATED", entityType: "CATEGORY", entityId: category.id } }); }); return redirectResponse("/admin?hasil=diperbarui"); } catch { return redirectResponse("/admin?hasil=gagal"); }
}
