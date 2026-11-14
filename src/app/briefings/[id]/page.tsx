import Link from "next/link";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { IssueText } from "@/components/issue-text";
import { requireUser } from "@/lib/auth";
import { getBriefing } from "@/lib/briefings";
import { BriefingActions } from "@/components/briefing-actions";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(); const b = await getBriefing(actor, (await params).id); if (!b) notFound();
  return <Workspace current="/briefings"><p><Link href="/briefings">← Kembali ke briefing</Link></p><h1>Briefing {b.date.toISOString().slice(0, 10)}</h1>
    {b.publishedVersion && <div className="issue-actions"><a className="button" href={`/api/briefings/${b.id}/export/pdf`}>Unduh PDF</a><a className="button" href={`/api/briefings/${b.id}/export/docx`}>Unduh Word</a></div>}
    {b.revisions.map((r) => <article className="card" key={r.version}><h2>{r.title}</h2><p>Versi {r.version} · {r.status}</p><IssueText text={r.introduction}/>{r.items.map((item) => <section key={item.position}><h3>{item.position}. {item.title}</h3><IssueText text={item.body}/></section>)}<h3>Langkah tindak lanjut</h3><IssueText text={r.followUp}/>{b.internal && r.version === b.currentVersion && <BriefingActions id={b.id} version={r.version} status={r.status} canEdit={actor.roles.includes("EDITOR") || (actor.roles.includes("CONTRIBUTOR") && b.authorId === actor.id)} canApprove={actor.roles.includes("APPROVER")}/>}</article>)}
  </Workspace>;
}
