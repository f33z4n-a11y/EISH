import { currentUser } from "@/lib/auth";
import { briefingDocx, briefingPdf } from "@/lib/briefing-export";
import { db } from "@/lib/db";
export async function GET(_request: Request, context: { params: Promise<{ id: string; format: string }> }) {
  const actor = await currentUser(); if (!actor) return Response.json({ error: "Silakan masuk." }, { status: 401 }); const { id, format } = await context.params;
  if (!['pdf', 'docx'].includes(format)) return Response.json({ error: "Format ekspor tidak tersedia." }, { status: 404 });
  const output = format === "pdf" ? await briefingPdf(actor, id) : await briefingDocx(actor, id); if (!output) return Response.json({ error: "Hanya briefing terbit yang dapat diekspor." }, { status: 404 });
  await db.auditEvent.create({ data: { actorId: actor.id, entityType: "BRIEFING", entityId: id, action: `BRIEFING_EXPORT_${format.toUpperCase()}`, metadata: { version: output.version } } });
  return new Response(new Uint8Array(output.buffer), { headers: { "Content-Type": format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="briefing-${id}-v${output.version}.${format}"`, "Cache-Control": "private, no-store" } });
}
