import Link from "next/link";
import { Workspace } from "@/components/workspace";
import { requireUser } from "@/lib/auth";
import { listBriefings } from "@/lib/briefings";
export const dynamic = "force-dynamic";
const labels = { PAGI: "Pagi", MALAM: "Malam", INSIDENTIL: "Insidentil" };
export default async function Page() {
  const actor = await requireUser();
  const rows = await listBriefings(actor);
  return <Workspace current="/briefings"><h1>Briefing</h1>
    {actor.roles.some((r) => r === "EDITOR" || r === "CONTRIBUTOR") && <p><Link className="button" href="/briefings/new">Buat briefing</Link></p>}
    {rows.length === 0 && <p className="notice">Belum ada briefing yang dapat ditampilkan.</p>}
    {rows.map((row) => { const revision = row.revisions.find((r) => r.version === (row.publishedVersion ?? row.currentVersion)); return <article className="card" key={row.id}><h2><Link href={`/briefings/${row.id}`}>{revision?.title ?? "Briefing"}</Link></h2><p>{row.date.toISOString().slice(0, 10)} · {labels[row.session]} · {revision?.status}</p></article>; })}
  </Workspace>;
}
