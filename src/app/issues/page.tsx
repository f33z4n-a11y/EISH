import Link from "next/link";
import { Workspace } from "@/components/workspace";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canCreateIssue, listIssues, type IssueFilters } from "@/lib/issues";
import { priorities, statuses } from "@/lib/issue-content";
import { listStatements } from "@/lib/statements";
import { IssueActions } from "@/components/issue-actions";
import { AutoFilterForm } from "@/components/auto-filter-form";
export const dynamic = "force-dynamic";
export default async function Issues({
  searchParams,
}: {
  searchParams: Promise<IssueFilters>;
}) {
  const actor = await requireUser();
  const f = await searchParams;
  const issues = await listIssues(actor, f);
  const owners = [
    ...new Map(
      (await listIssues(actor, {})).map((i) => [
        i.content.ownerId,
        { id: i.content.ownerId, name: i.content.ownerName },
      ]),
    ).values(),
  ];
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: [{ code: "asc" }, { name: "asc" }],
  });
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const statementByIssue = new Map<string, string>();
  for (const s of await listStatements(actor)) {
    const approved = s.versions.some((v) => v.version === s.approvedVersion && v.status === "APPROVED");
    const draft = s.versions.some((v) => v.status === "DRAFT" || v.status === "IN_REVIEW");
    const label = approved
      ? "Siap digunakan"
      : draft
        ? "Draft / dalam review"
        : "Belum siap";
    const previous = statementByIssue.get(s.issueId);
    if (
      !previous ||
      (label === "Siap digunakan" && previous !== "Siap digunakan") ||
      (label === "Draft / dalam review" && previous === "Belum siap")
    )
      statementByIssue.set(s.issueId, label);
  }
  const briefingByIssue = new Map<string, string>();
  const briefingItems = await db.briefingItem.findMany({
    where: {
      issueId: { in: issues.map((issue) => issue.id) },
      ...(!actor.roles.some((role) => ["EDITOR", "CONTRIBUTOR", "APPROVER"].includes(role))
        ? { revision: { status: "PUBLISHED" as const } }
        : {}),
    },
    select: { issueId: true, revision: { select: { status: true } } },
  });
  for (const item of briefingItems) {
    const label = item.revision.status === "PUBLISHED" ? "Sudah terbit" : "Draft / proses persetujuan";
    if (!briefingByIssue.has(item.issueId) || label === "Sudah terbit") briefingByIssue.set(item.issueId, label);
  }
  return (
    <Workspace current="/issues">
      <header className="issues-page-header">
        <div>
          <h1>Daftar isu</h1>
          <p>Temukan isu dan perkembangan sesuai hak akses Anda.</p>
        </div>
        {canCreateIssue(actor) && (
          <Link href="/issues/new" className="button">
            + Buat isu
          </Link>
        )}
      </header>
      <AutoFilterForm>
        <div className="filter-search"><label htmlFor="q">Cari isu</label><input id="q" name="q" defaultValue={f.q} maxLength={200} placeholder="Judul atau kata kunci" /></div>
        <div><label htmlFor="category">Kategori</label><select id="category" name="category" defaultValue={f.category}>
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code ? `${c.code} · ${c.name}` : c.name}
            </option>
          ))}
        </select></div>
        <div><label htmlFor="priority">Prioritas</label><select id="priority" name="priority" defaultValue={f.priority}><option value="">Semua prioritas</option>{Object.entries(priorities).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div><label htmlFor="status">Status</label><select id="status" name="status" defaultValue={f.status}>
          <option value="">Semua status</option>
          {Object.entries(statuses).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select></div>
        <details className="advanced-filter"><summary>Filter lanjutan</summary><label htmlFor="owner">Pemilik isu</label>
        <select id="owner" name="owner" defaultValue={f.owner}>
          <option value="">Semua pemilik</option>
          {owners.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <label htmlFor="from">Tanggal pertama dicatat mulai</label>
        <input id="from" name="from" type="date" defaultValue={f.from} />
        <label htmlFor="to">Sampai tanggal</label>
        <input id="to" name="to" type="date" defaultValue={f.to} /></details>
        <Link className="filter-reset" href="/issues">Reset</Link>
      </AutoFilterForm>
      <div className="issue-results-heading">
        <strong>{issues.length} isu ditemukan</strong>
        <span>Maksimal 100 hasil terbaru</span>
      </div>
      <div className="issue-list">
        {issues.map((i) => {
          const category = categoryById.get(i.content.categoryId);
          return (
            <article className="issue-list-row" key={i.id}>
              <div className="issue-list-content">
                <div className="issue-list-badges">
                  <span className={`issue-list-badge status-${i.content.status.toLowerCase()}`}>
                    {statuses[i.content.status]}
                  </span>
                  <span className={`issue-list-badge priority-${i.content.priority.toLowerCase()}`}>
                    {priorities[i.content.priority]}
                  </span>
                  {i.content.attention && (
                    <span className="issue-list-badge attention-badge">Perlu perhatian</span>
                  )}
                </div>
                <h2>
                  <Link href={`/issues/${i.id}`}>
                    {i.content.title} <span aria-hidden="true">→</span>
                  </Link>
                </h2>
                <p className="issue-list-summary">{i.content.summary.slice(0, 240)}</p>
              </div>

              <dl className="issue-list-meta">
                <div>
                  <dt>Kategori</dt>
                  <dd>{category?.code ? `${category.code} · ` : ""}{i.content.categoryName}</dd>
                </div>
                <div>
                  <dt>Pembuat / pemilik</dt>
                  <dd>{i.content.ownerName}</dd>
                </div>
                <div>
                  <dt>Diperbarui</dt>
                  <dd className="issue-list-updated">
                    <time dateTime={i.updatedAt.toISOString()}>
                      {i.updatedAt.toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Jakarta",
                      })} WIB
                    </time>
                  </dd>
                </div>
                <div>
                  <dt>Standby Statement</dt>
                  <dd>{statementByIssue.get(i.id) ?? "Belum dibuat"}</dd>
                </div>
                <div>
                  <dt>Briefing</dt>
                  <dd>{briefingByIssue.get(i.id) ?? "Belum dimasukkan"}</dd>
                </div>
                {i.internal && (
                  <div>
                    <dt>Publikasi</dt>
                    <dd>{i.publishedVersion === i.version ? "Revisi ini terbit" : "Draft"}</dd>
                  </div>
                )}
              </dl>

              {actor.roles.some((role) => role !== "READER") && (
                <IssueActions id={i.id} version={i.version} published={i.publishedVersion !== null} deleteOnly />
              )}
            </article>
          );
        })}
      </div>
      {!issues.length && (
        <p className="notice">Belum ada isu yang dapat ditampilkan.</p>
      )}
    </Workspace>
  );
}
