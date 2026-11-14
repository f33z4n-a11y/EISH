import Link from "next/link";
import { Workspace } from "@/components/workspace";
import { requireUser } from "@/lib/auth";
import { searchArchive, type ArchiveKind } from "@/lib/archive";
export const dynamic = "force-dynamic";
const labels = { ISSUE: "Isu", BRIEFING: "Briefing", STATEMENT: "Standby Statement" } as const;
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; jenis?: string }> }) {
  const actor = await requireUser(); const params = await searchParams; const q = params.q?.slice(0, 200) ?? ""; const kind: ArchiveKind = ["ISSUE", "BRIEFING", "STATEMENT"].includes(params.jenis ?? "") ? params.jenis as ArchiveKind : "ALL"; const results = await searchArchive(actor, q, kind);
  return <Workspace current="/archive"><p className="eyebrow">Pencarian terpadu</p><h1>Arsip</h1><form className="card filters" method="get"><label htmlFor="archive-q">Cari informasi yang tersedia</label><input id="archive-q" name="q" defaultValue={q} maxLength={200}/><label htmlFor="archive-kind">Jenis informasi</label><select id="archive-kind" name="jenis" defaultValue={kind}><option value="ALL">Semua</option><option value="ISSUE">Isu</option><option value="BRIEFING">Briefing</option><option value="STATEMENT">Standby Statement</option></select><button>Cari</button></form>{q && <p role="status" className="muted">{results.length} hasil ditemukan. Maksimal 100 hasil.</p>}{results.map((result) => <article className="card archive-result" key={`${result.kind}-${result.href}-${result.title}`}><span className="badge">{labels[result.kind]} · {result.status}</span><h2><Link href={result.href}>{result.title}</Link></h2><p>{result.excerpt || "Tidak ada cuplikan."}</p></article>)}{q && !results.length && <p className="notice">Tidak ada informasi yang dapat ditampilkan sesuai kata pencarian dan hak akses Anda.</p>}</Workspace>;
}
