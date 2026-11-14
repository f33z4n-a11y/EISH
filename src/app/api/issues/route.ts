import { currentUser } from "@/lib/auth";
import { createIssue, listIssues } from "@/lib/issues";
import { validOrigin } from "@/lib/security";
import { issueResponse } from "@/lib/issue-response";
export async function GET(request: Request) {
  const actor = await currentUser();
  if (!actor)
    return Response.json({ error: "Silakan masuk." }, { status: 401 });
  return Response.json(
    await listIssues(
      actor,
      Object.fromEntries(new URL(request.url).searchParams),
    ),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const actor = await currentUser();
  if (!actor)
    return Response.json({ error: "Silakan masuk." }, { status: 401 });
  try {
    const body = await request.json();
    if (
      body.parentId !== undefined &&
      (typeof body.parentId !== "string" || !body.parentId)
    )
      return Response.json({ error: "Induk tidak valid." }, { status: 400 });
    const id = await createIssue(
      actor,
      body.content,
      body.parentId,
      body.acceptDuplicate === true,
      body.standbyStatement,
      body.publishNow === true,
    );
    return Response.json(
      { id: body.parentId ?? id, recordId: id },
      { status: 201 },
    );
  } catch (e) {
    return issueResponse(e);
  }
}
