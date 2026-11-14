import { currentUser } from "@/lib/auth";
import { getStatement, mutateStatement } from "@/lib/statements";
import { validOrigin } from "@/lib/security";
import { issueResponse } from "@/lib/issue-response";
export async function GET(_r: Request, c: { params: Promise<{ id: string }> }) {
  const actor = await currentUser(); if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 });
  const s = await getStatement(actor, (await c.params).id); if (!s) return Response.json({ error: "Pernyataan tidak ditemukan." }, { status: 404 });
  return Response.json(s, { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(request: Request, c: { params: Promise<{ id: string }> }) {
  if (!validOrigin(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const actor = await currentUser(); if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 });
  try {
    const b = await request.json();
    if (!Number.isSafeInteger(b.version) || !["edit", "submit", "approve", "revoke", "delete"].includes(b.action)) return Response.json({ error: "Aksi tidak valid." }, { status: 400 });
    return Response.json({ id: await mutateStatement(actor, (await c.params).id, b.version, b.action, b) });
  } catch (e) { return issueResponse(e); }
}
