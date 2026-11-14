"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyStatement } from "@/components/copy-statement";
import { priorities, statuses } from "@/lib/issue-content";

type Issue = {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryCode: string | null;
  status: keyof typeof statuses;
  priority: keyof typeof priorities;
  updatedAt: string;
  updates: { body: string; submittedAt: string }[];
  statement: { id: string; body: string } | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export function DashboardIssues({ issues }: { issues: Issue[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const filtered = issues.filter(
    (issue) =>
      (status === "ALL" || issue.status === status) &&
      (priority === "ALL" || issue.priority === priority) &&
      `${issue.title} ${issue.category} ${issue.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  const visible = filtered.slice(0, 6);
  const veryHigh = issues.filter((issue) => issue.priority === "VERY_HIGH").length;
  const monitoring = issues.filter((issue) => issue.status === "MONITORING").length;
  const ready = issues.filter((issue) => issue.statement).length;

  return (
    <>
      <div className="dashboard-metrics">
        <div className="dashboard-metric"><span>Isu aktif & dipantau</span><strong>{issues.length}</strong></div>
        <div className="dashboard-metric metric-red"><span>Prioritas sangat tinggi</span><strong>{veryHigh}</strong></div>
        <div className="dashboard-metric metric-amber"><span>Dalam pemantauan</span><strong>{monitoring}</strong></div>
        <div className="dashboard-metric metric-green"><span>Standby Statement siap</span><strong>{ready}<small>/{issues.length}</small></strong></div>
      </div>

      <div className="dashboard-controls">
        <div><label htmlFor="dashboard-search">Cari isu</label><input id="dashboard-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Judul, kategori, atau ringkasan" /></div>
        <div><label htmlFor="dashboard-status">Status penanganan</label><select id="dashboard-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">Semua status</option><option value="ACTIVE">Aktif</option><option value="MONITORING">Dipantau</option></select></div>
        <div><label htmlFor="dashboard-priority">Prioritas isu</label><select id="dashboard-priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="ALL">Semua prioritas</option><option value="VERY_HIGH">Sangat tinggi</option><option value="HIGH">Tinggi</option><option value="MEDIUM">Sedang</option><option value="LOW">Rendah</option></select></div>
      </div>

      <section className="dashboard-issue-grid">
        <div className="dashboard-section-heading">
          <h2>Isu prioritas dan terbaru</h2>
          <span>{filtered.length} isu</span>
        </div>
        {visible.length ? (
          <>
            <div className="dashboard-grid-items">
              {visible.map((issue) => {
                const update = issue.updates[0];
                return (
                  <article key={issue.id} className="dashboard-grid-card">
                    <div className="dashboard-card-top">
                      <span className="dashboard-category">{issue.categoryCode ? `${issue.categoryCode} · ` : ""}{issue.category}</span>
                      <span className={`dashboard-status-badge status-${issue.status.toLowerCase()}`}>{statuses[issue.status]}</span>
                      <span className={`dashboard-badge priority-${issue.priority.toLowerCase()}`}>{priorities[issue.priority]}</span>
                    </div>
                    <h3><Link href={`/issues/${issue.id}?from=dashboard`}>{issue.title}<span aria-hidden="true"> →</span></Link></h3>
                    <time className="dashboard-updated" dateTime={issue.updatedAt}>Diperbarui {formatDate(issue.updatedAt)} WIB</time>
                    <p className="dashboard-summary">{issue.summary}</p>
                    <section className="dashboard-latest-update">
                      {update ? (
                        <><h4>Perkembangan terakhir</h4><time className="dashboard-update-time" dateTime={update.submittedAt}>{formatDate(update.submittedAt)} WIB</time><p>{update.body}</p></>
                      ) : (
                        <p className="dashboard-no-update">Belum ada perkembangan terbaru</p>
                      )}
                    </section>
                    <footer className={`dashboard-statement-footer ${issue.statement ? "is-ready" : ""}`}>
                      <div><small>Standby Statement</small><strong>{issue.statement ? "Siap digunakan" : "Belum tersedia"}</strong></div>
                      {issue.statement && <div className="dashboard-statement-actions"><CopyStatement text={issue.statement.body} compact /><Link href={`/statements/${issue.statement.id}`}>Lihat</Link></div>}
                    </footer>
                  </article>
                );
              })}
            </div>
            {filtered.length > visible.length && <div className="dashboard-view-all"><Link href="/issues">Lihat semua {filtered.length} isu →</Link></div>}
          </>
        ) : <div className="dashboard-empty">Tidak ada isu yang cocok dengan filter.</div>}
      </section>
    </>
  );
}
