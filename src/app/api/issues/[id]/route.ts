import { currentUser } from "@/lib/auth";
import { issueDetail, mutateIssue } from "@/lib/issues";
import { validOrigin } from "@/lib/security";
import { issueResponse } from "@/lib/issue-response";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await currentUser();
  if (!actor)
    return Response.json({ error: "Silakan masuk." }, { status: 401 });
  const d = await issueDetail(actor, (await context.params).id);
  if (!d)
    return Response.json({ error: "Isu tidak ditemukan." }, { status: 404 });
  return Response.json(
    { issue: d.issue, updates: d.updates, history: d.history },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!validOrigin(request))
    return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const actor = await currentUser();
  if (!actor)
    return Response.json({ error: "Silakan masuk." }, { status: 401 });
  try {
    const b = await request.json();
    if (
      !["edit", "publish", "withdraw", "delete"].includes(b.action) ||
      !Number.isSafeInteger(b.version) ||
      b.version < 1
    )
      return Response.json({ error: "Aksi tidak valid." }, { status: 400 });
    const id = await mutateIssue(
      actor,
      (await context.params).id,
      b.version,
      b.action,
      b.content,
    );
    return Response.json({ id });
  } catch (e) {
    return issueResponse(e);
  }
}
