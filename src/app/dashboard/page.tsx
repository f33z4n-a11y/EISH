import Link from "next/link";
import { Workspace } from "@/components/workspace";
import { DashboardIssues } from "@/components/dashboard-issues";
import { requireUser } from "@/lib/auth";
import { issueDetail, listIssues } from "@/lib/issues";
import { listBriefings } from "@/lib/briefings";
import { listStatements } from "@/lib/statements";
import { readWhatsNew } from "@/lib/whats-new";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function Dashboard({ searchParams }: { searchParams: Promise<{ akses?: string }> }) {
  const actor = await requireUser();
  const { akses } = await searchParams;
  const reader = { id: actor.id, roles: ["READER" as const] };
  const [issues, briefings, statements, whatsNew] = await Promise.all([listIssues(reader, {}), listBriefings(reader), listStatements(reader), readWhatsNew(actor)]);
  const order = { VERY_HIGH: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const ranked = issues.filter((issue) => ["ACTIVE", "MONITORING"].includes(issue.content.status)).sort((a, b) => order[a.content.priority] - order[b.content.priority] || b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 20);
  const [details, categories] = await Promise.all([
    Promise.all(ranked.map((issue) => issueDetail(reader, issue.id))),
    db.category.findMany({ where: { id: { in: ranked.map((issue) => issue.content.categoryId) } }, select: { id: true, code: true } }),
  ]);
  const categoryCodeById = new Map(categories.map((category) => [category.id, category.code]));
  const statementByIssue = new Map(statements.flatMap((statement) => {
    const approved = statement.versions.find((version) => version.version === statement.approvedVersion && version.status === "APPROVED");
    return approved ? [[statement.issueId, { id: statement.id, body: approved.body }] as const] : [];
  }));
  const cards = ranked.map((issue, index) => ({ id: issue.id, title: issue.content.title, summary: issue.content.summary, category: issue.content.categoryName ?? "Isu", categoryCode: categoryCodeById.get(issue.content.categoryId) ?? null, status: issue.content.status, priority: issue.content.priority, updatedAt: issue.updatedAt.toISOString(), updates: details[index]?.updates.slice(0, 1).map((update) => ({ body: update.content.body, submittedAt: update.createdAt.toISOString() })) ?? [], statement: statementByIssue.get(issue.id) ?? null }));
  const latestBriefing = briefings[0];
  const briefingTitle = latestBriefing?.revisions.find((revision) => revision.version === latestBriefing.publishedVersion)?.title;
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date());
  return <Workspace current="/dashboard"><div className="dashboard-page">
    <div className="dashboard-intro"><div><h1>Isu Strategis dan Ringkasan Situasi Komdigi</h1><p>Prioritas penanganan dan perkembangan terbaru dari informasi yang sudah diterbitkan.</p></div><div className="dashboard-intro-side"><span>{date} · WIB</span></div></div>
    {akses && <p className="error" role="alert">Anda tidak memiliki izin untuk membuka halaman tersebut.</p>}
    <DashboardIssues issues={cards}/>
    <section className="dashboard-bottom" aria-label="Informasi tambahan"><div className="dashboard-support"><h2>Apa yang Baru</h2><p className="muted">{whatsNew.firstVisit ? "Publikasi terbaru pada kunjungan pertama." : "Sejak terakhir membuka beranda."}</p>{whatsNew.items.length ? <ul>{whatsNew.items.slice(0, 5).map((item) => <li key={item.id}><span>{item.label}</span><Link href={item.href}>{item.title}</Link></li>)}</ul> : <p>Belum ada publikasi baru.</p>}</div><div className="dashboard-support"><h2>Briefing terbaru</h2><p>{briefingTitle ?? "Belum ada briefing terbit."}</p><Link href={latestBriefing ? `/briefings/${latestBriefing.id}` : "/briefings"}>Buka briefing →</Link></div><div className="dashboard-support"><h2>Standby Statement</h2><p>{statements.length ? `${statements.length} naskah siap digunakan` : "Belum ada naskah siap digunakan."}</p><Link href="/statements">Lihat pernyataan →</Link></div></section>
  </div></Workspace>;
}
