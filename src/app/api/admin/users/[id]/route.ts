import type { RoleCode } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { validOrigin, redirectResponse } from "@/lib/security";
import { updateAccount } from "@/lib/users";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!validOrigin(request)) return new Response("Permintaan ditolak.", { status: 403 });
  const actor = await currentUser(); if (!actor) return new Response("Silakan masuk.", { status: 401 });
  try { const form = await request.formData(); const action = String(form.get("action") ?? ""); const role = String(form.get("role") ?? "") as RoleCode; await updateAccount(actor, (await context.params).id, action === "toggle" ? { active: form.get("active") === "true" } : { role }); return redirectResponse("/admin?hasil=diperbarui"); } catch { return redirectResponse("/admin?hasil=gagal"); }
}
