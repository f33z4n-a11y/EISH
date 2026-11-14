import Link from "next/link";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { IssueText } from "@/components/issue-text";
import { requireUser } from "@/lib/auth";
import { getStatement } from "@/lib/statements";
import { StatementActions } from "@/components/statement-actions";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(); const s = await getStatement(actor, (await params).id); if (!s) notFound();
  return <Workspace current="/statements"><p><Link href={`/issues/${s.issueId}`}>← Kembali ke isu</Link> · <Link href="/statements">Daftar Standby Statement</Link></p><h1>{s.title}</h1><p className="muted">Isu: <Link href={`/issues/${s.issueId}`}>{s.issueId}</Link></p>
    {s.versions.map((v) => <article className="card" key={v.version}><h2>Versi {v.version} · {v.status}</h2><IssueText text={v.body}/><p className="muted">Dibuat {v.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</p>{s.internal && <StatementActions id={s.id} version={v.version} status={v.status} body={v.body}/>}</article>)}
  </Workspace>;
}
