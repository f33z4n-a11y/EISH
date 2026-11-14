import { currentUser } from "@/lib/auth";
import { listBriefings, createBriefing } from "@/lib/briefings";
import { issueResponse } from "@/lib/issue-response";
import { validOrigin } from "@/lib/security";
export async function GET() { const actor = await currentUser(); if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 }); return Response.json(await listBriefings(actor), { headers: { "Cache-Control": "private, no-store" } }); }
export async function POST(request: Request) { if (!validOrigin(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 }); const actor = await currentUser(); if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 }); try { const id = await createBriefing(actor, await request.json()); return Response.json({ id }, { status: 201 }); } catch (error) { return issueResponse(error); } }
