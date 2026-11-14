import Link from "next/link";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { IssueActions } from "@/components/issue-actions";
import { IssueText } from "@/components/issue-text";
import { CopyStatement } from "@/components/copy-statement";
import { requireUser } from "@/lib/auth";
import { canEditIssue, issueDetail, type Projection } from "@/lib/issues";
import { priorities, statuses } from "@/lib/issue-content";
import { listStatements } from "@/lib/statements";
const date = (value: Date | string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
const time = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(d) + " WIB";
function Sources({ item }: { item: Projection }) {
  return (
    <>
      <h3>Sumber referensi</h3>
      {item.content.sources.length ? (
        <ol>
          {item.content.sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title || `Referensi ${i + 1}`}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">Belum ada sumber.</p>
      )}
    </>
  );
}
export const dynamic = "force-dynamic";
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const actor = await requireUser();
  const { id } = await params;
  const { from } = await searchParams;
  void from;
  const d = await issueDetail(actor, id);
  if (!d) notFound();
  const { issue, updates, record } = d;
  const c = issue.content;
  const edit = canEditIssue(actor, record);
  const publish = actor.roles.includes("EDITOR");
  const statements = (await listStatements(actor)).filter((s) => s.issueId === id);
  return (
    <Workspace current="/issues">
      <p className="issue-detail-back">
        <Link href="/dashboard">← Kembali ke dashboard</Link>
      </p>
      <h1 className="issue-detail-title">{c.title}</h1>
      <span className={`badge detail-badge status-${c.status.toLowerCase()}`}>{statuses[c.status]}</span><span className={`badge detail-badge priority-${c.priority.toLowerCase()}`}>Prioritas: {priorities[c.priority]}</span>
      {c.attention && <span className="badge">Perlu perhatian</span>}
      {issue.internal && (
        <p className="notice">
          Revisi kerja {issue.version} ·{" "}
          {issue.publishedVersion
            ? `Revisi terbit ${issue.publishedVersion}`
            : "Belum diterbitkan"}
          . Reader hanya melihat revisi terbit.
        </p>
      )}
      <p className="issue-detail-meta">
        {c.categoryName} · Pemilik: {c.ownerName}
        {c.assigneeName && ` · Ditugaskan: ${c.assigneeName}`}
      </p>
      <p className="issue-detail-meta">Tanggal pertama dicatat: <strong>{date(c.date)}</strong></p>
      <p className="muted issue-detail-meta">Ringkasan diperbarui: <strong>{time(issue.updatedAt)}</strong></p>
      {edit && (
        <div className="issue-actions">
          <Link className="button" href={`/issues/${id}/edit`}>
            Sunting isu
          </Link>
          <Link className="button" href={`/issues/${id}/updates/new`}>
            Tambah perkembangan
          </Link>
        </div>
      )}
      {publish && (
        <IssueActions
          id={id}
          version={issue.version}
          published={issue.publishedVersion !== null}
        />
      )}
      {!publish && actor.roles.some((role) => role !== "READER") && (
        <IssueActions id={id} version={issue.version} published={issue.publishedVersion !== null} deleteOnly />
      )}
      <div className="detail-sections">
      <details className="card issue-section detail-section" open>
        <summary><span className="detail-icon detail-icon-blue">⌁</span>1. Ringkasan dan latar belakang</summary>
        <h2>Ringkasan terkini</h2>
        <IssueText text={c.summary} />
        <h2>Latar belakang</h2>
        <IssueText text={c.background} />
        <p>Kata kunci: {c.keywords || "Belum diisi"}</p>
        <Sources item={issue} />
      </details>
      <details className="card issue-section detail-section detail-statement" open>
        <summary><span className="detail-icon detail-icon-gold">❝</span>3. Standby Statement <span className="detail-count">{statements.length}</span></summary>
        {!statements.length && (
          <p className="muted">Belum ada standby statement untuk isu ini.</p>
        )}
        {statements.map((s) => {
          const v = s.versions.find((x) => x.version === (s.approvedVersion ?? s.currentVersion)) ?? s.versions[0];
          return (
            <article key={s.id} className="statement-inline">
              <h3>{v?.title ?? s.title}</h3>
              <p className="muted">Versi {v?.version} · {v?.status === "APPROVED" ? "Siap digunakan" : v?.status}</p>
              {v && <IssueText text={v.body} />}
              {v?.status === "APPROVED" && <CopyStatement text={v.body} />}
              <Link href={`/statements/${s.id}`}>Kelola versi dan persetujuan</Link>
            </article>
          );
        })}
        {edit && <Link className="button" href={`/statements/new?issueId=${id}`}>Buat Standby Statement</Link>}
      </details>
      <details className="card issue-section detail-section detail-timeline" open>
      <summary><span className="detail-icon detail-icon-blue">⌁</span>2. Perkembangan isu</summary>
      {!updates.length && (
        <p className="notice">Belum ada perkembangan yang dapat ditampilkan.</p>
      )}
      {updates.map((u) => (
        <details key={u.id} className="card timeline-item">
          <summary>
                {u.content.date} · {(u.content.title || "Perkembangan isu").replace(/mitigasi/gi, "isu")}
          </summary>
          {!u.content.material && (
            <p className="notice">Tidak ada perkembangan material</p>
          )}
          {u.content.attention && (
            <span className="badge">Perlu perhatian</span>
          )}
          <IssueText text={u.content.body} />
          <p className="muted">
            Penyusun revisi: {u.authorName} · Waktu submit: {time(u.createdAt)}
          </p>
          {u.internal && (
            <p>
              Revisi kerja {u.version} ·{" "}
              {u.publishedVersion ? `Terbit ${u.publishedVersion}` : "Draft"}
            </p>
          )}
          <Sources item={u} />
          {edit && (
            <Link href={`/issues/${id}/updates/${u.id}/edit`}>
              Sunting perkembangan
            </Link>
          )}
          {publish && (
            <IssueActions
              id={u.id}
              version={u.version}
              published={u.publishedVersion !== null}
            />
          )}
        </details>
      ))}
      </details>
      </div>
      {issue.internal && (
        <section>
          <h2>Histori revisi internal</h2>
          {d.history.map((h, i) => (
            <details className="card timeline-item" key={i}>
              <summary>
                {h.content.title || "Perkembangan"} · Revisi {h.version} ·{" "}
                {time(h.createdAt)} · {h.actor.name}
              </summary>
              <p>
                {h.content.date} · {statuses[h.content.status]} ·{" "}
                {h.content.categoryName}
              </p>
              <IssueText
                text={[
                  h.content.summary,
                  h.content.background,
                  h.content.body,
                ].join("\n")}
              />
              <p>
                {h.content.keywords} · Pemilik: {h.content.ownerName}
              </p>
              <ol>
                {h.content.sources.map((s, j) => (
                  <li key={j}>
                    <a href={s.url} rel="noopener noreferrer" target="_blank">
                      {s.title || `Referensi ${j + 1}`}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </section>
      )}
    </Workspace>
  );
}
