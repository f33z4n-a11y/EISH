import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { BriefingForm } from "@/components/briefing-form";
import { requireUser } from "@/lib/auth";
import { getBriefing } from "@/lib/briefings";
import { listIssues } from "@/lib/issues";
type Source = { title: string; url: string };
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(); const { id } = await params; const briefing = await getBriefing(actor, id); if (!briefing) notFound();
  const canEdit = actor.roles.includes("EDITOR") || (actor.roles.includes("CONTRIBUTOR") && briefing.authorId === actor.id); if (!canEdit) redirect("/dashboard?akses=ditolak");
  const revision = briefing.revisions.find((item) => item.version === briefing.currentVersion); if (!revision) notFound(); const issues = await listIssues(actor, {});
  return <Workspace current="/briefings"><p><Link href={`/briefings/${id}`}>← Kembali ke detail briefing</Link></p><h1>Edit briefing</h1><p className="notice">Penyimpanan membuat revisi baru. Versi yang sudah terbit tetap tersimpan sebagai snapshot.</p><BriefingForm briefingId={id} version={revision.version} issues={issues.map((issue) => ({ id: issue.id, title: issue.content.title, summary: issue.content.summary, priority: issue.content.priority, references: issue.content.sources }))} initial={{ title: revision.title, date: briefing.date.toISOString().slice(0, 10), session: briefing.session, introduction: revision.introduction, followUp: revision.followUp, items: revision.items.map((item) => ({ issueId: item.issueId, title: item.title, body: item.body, priority: item.priority, references: item.references as Source[] })) }}/></Workspace>;
}
