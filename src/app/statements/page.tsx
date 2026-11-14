import Link from "next/link";
import { Workspace } from "@/components/workspace";
import { requireUser } from "@/lib/auth";
import { listStatements } from "@/lib/statements";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await requireUser();
  const statements = await listStatements(actor);
  return <Workspace current="/statements"><p className="eyebrow">Ruang kerja EISH</p><h1>Standby Statement</h1>
    {!statements.length && <section className="card"><h2>Belum ada standby statement</h2><p className="muted">Buat standby statement dari halaman isu yang dapat Anda kelola.</p></section>}
    {statements.map((s) => { const v = s.versions.find((x) => x.version === (s.approvedVersion ?? s.currentVersion)) ?? s.versions[0]; return <article className="card" key={s.id}><h2><Link href={`/statements/${s.id}`}>{s.title}</Link></h2><p className="muted">Isu: <Link href={`/issues/${s.issueId}`}>{s.issueId}</Link> · Versi {v?.version} · {v?.status ?? "DRAFT"}</p></article>; })}
  </Workspace>;
}
