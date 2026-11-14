import { currentUser } from "@/lib/auth";
import { createStatement, listStatements } from "@/lib/statements";
import { validOrigin } from "@/lib/security";
import { issueResponse } from "@/lib/issue-response";
export async function GET() {
  const actor = await currentUser();
  if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 });
  return Response.json({ statements: await listStatements(actor) }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(request: Request) {
  if (!validOrigin(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const actor = await currentUser();
  if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 });
  try {
    const b = await request.json();
    if (typeof b.issueId !== "string") return Response.json({ error: "Isu wajib dipilih." }, { status: 400 });
    return Response.json({ id: await createStatement(actor, b.issueId, b) }, { status: 201 });
  } catch (e) { return issueResponse(e); }
}
