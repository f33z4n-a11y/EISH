"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { priorities, statuses, type IssueContent } from "@/lib/issue-content";
import { IssueText } from "./issue-text";
type Choice = { id: string; name: string; code?: string | null };
export function IssueEditor({
  initial,
  id,
  parentId,
  version,
  kind,
  categories,
  users,
  assignment,
  canPublishNow = false,
}: {
  initial: IssueContent;
  id?: string;
  parentId?: string;
  version?: number;
  kind: "ISSUE" | "UPDATE";
  categories: Choice[];
  users: Choice[];
  assignment: boolean;
  canPublishNow?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initial);
  const [sources, setSources] = useState(
    initial.sources.map((s) => `${s.title} | ${s.url}`).join("\n"),
  );
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [standbyTitle, setStandbyTitle] = useState("");
  const [standbyBody, setStandbyBody] = useState("");
  function field<K extends keyof IssueContent>(k: K, v: IssueContent[K]) {
    setContent((c) => ({ ...c, [k]: v }));
    if (k === "title") setDuplicate(false);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "draft";
    setBusy(true);
    setError("");
    try {
      const parsed = sources
        .split("\n")
        .filter((s) => s.trim())
        .map((s, index) => {
          const i = s.indexOf("|");
          const url = i < 0 ? s.trim() : s.slice(i + 1).trim();
          return {
            title: i < 0 ? `Referensi ${index + 1}` : s.slice(0, i).trim(),
            url,
          };
        });
      const response = await fetch(id ? `/api/issues/${id}` : "/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { ...content, sources: parsed },
          parentId,
          version,
          action: "edit",
          acceptDuplicate: duplicate,
          standbyStatement:
            kind === "ISSUE" && (standbyTitle.trim() || standbyBody.trim())
              ? { title: standbyTitle, body: standbyBody }
              : undefined,
          publishNow: intent === "publish",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error);
        if (result.code === "DUPLICATE") setDuplicate(true);
        return;
      }
      router.push(`/issues/${result.id}`);
      router.refresh();
    } catch {
      setError("Tidak dapat menyimpan. Input Anda tetap tersedia.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="card issue-form">
      {error && (
        <div role="alert" className="error">
          {error}{" "}
          {id && (
            <a
              href={`/issues/${parentId ?? id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buka versi terbaru di tab lain
            </a>
          )}
        </div>
      )}
      <label htmlFor="issue-title">
        {kind === "ISSUE" ? "Judul isu" : "Judul perkembangan (opsional)"}
      </label>
      <input
        id="issue-title"
        value={content.title}
        required={kind === "ISSUE"}
        maxLength={200}
        onChange={(e) => field("title", e.target.value)}
      />
      {kind === "ISSUE" && (
        <>
          <label htmlFor="category">Kategori</label>
          <select
            id="category"
            required
            value={content.categoryId}
            onChange={(e) => field("categoryId", e.target.value)}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `${c.code} · ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <label htmlFor="status">Status isu</label>
          <select
            id="status"
            value={content.status}
            onChange={(e) =>
              field("status", e.target.value as IssueContent["status"])
            }
          >
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="priority">Prioritas isu</label>
          <select id="priority" value={content.priority} onChange={(e) => field("priority", e.target.value as IssueContent["priority"])}>{Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <label htmlFor="summary">Ringkasan manual</label>
          <textarea
            id="summary"
            required
            value={content.summary}
            maxLength={20000}
            onChange={(e) => field("summary", e.target.value)}
          />
          <label htmlFor="background">Latar belakang</label>
          <textarea
            id="background"
            value={content.background}
            maxLength={20000}
            onChange={(e) => field("background", e.target.value)}
          />
          <label htmlFor="keywords">Kata kunci</label>
          <input
            id="keywords"
            value={content.keywords}
            maxLength={500}
            onChange={(e) => field("keywords", e.target.value)}
          />
        </>
      )}
      <label htmlFor="date">
        {kind === "ISSUE" ? "Tanggal pertama dicatat" : "Tanggal peristiwa"}
      </label>
      <input
        id="date"
        type="date"
        required
        value={content.date}
        onChange={(e) => field("date", e.target.value)}
      />
      {kind === "UPDATE" && (
        <>
          <label htmlFor="session">Sesi</label>
          <select
            id="session"
            value={content.session}
            onChange={(e) =>
              field("session", e.target.value as IssueContent["session"])
            }
          >
            <option value="PAGI">Pagi</option>
            <option value="MALAM">Malam</option>
            <option value="INSIDENTIL">Insidentil</option>
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={!content.material}
              onChange={(e) => field("material", !e.target.checked)}
            />
            Tidak ada perkembangan material
          </label>
          <label htmlFor="body">Isi perkembangan</label>
          <textarea
            id="body"
            required={content.material}
            value={content.body}
            maxLength={20000}
            onChange={(e) => field("body", e.target.value)}
          />
        </>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={content.attention}
          onChange={(e) => field("attention", e.target.checked)}
        />
        Perlu perhatian
      </label>
      <p className="muted" id="format-help">
        Format: **tebal**, *miring*, baris diawali - untuk daftar, dan
        [label](https://alamat). HTML dan gambar tidak didukung.
      </p>
      <button type="button" onClick={() => setPreview(!preview)}>
        {" "}
        {preview ? "Tutup pratinjau" : "Pratinjau format teks"}
      </button>
      {preview && (
        <section aria-label="Pratinjau teks">
          <IssueText
            text={
              kind === "ISSUE"
                ? `${content.summary}\n${content.background}`
                : content.body
            }
          />
        </section>
      )}
      <label htmlFor="sources">Sumber referensi</label>
      <p className="muted">
        Satu tautan per baris, misalnya https://alamat. Sistem menampilkan
        referensi bernomor. Maksimal 20 sumber.
      </p>
      <textarea
        id="sources"
        value={sources}
        onChange={(e) => setSources(e.target.value)}
      />
      {kind === "ISSUE" && assignment && (
        <>
          <label htmlFor="owner">Pemilik isu</label>
          <select
            id="owner"
            value={content.ownerId}
            onChange={(e) => field("ownerId", e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <label htmlFor="assignee">Ditugaskan kepada</label>
          <select
            id="assignee"
            value={content.assigneeId}
            onChange={(e) => field("assigneeId", e.target.value)}
          >
            <option value="">Tidak ada penugasan tambahan</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </>
      )}
      {kind === "ISSUE" && !id && (
        <fieldset className="card">
          <legend>Standby Statement awal (opsional)</legend>
          <p className="muted">Draft ini akan terkait dengan isu dan belum terlihat Reader sampai disetujui Approver.</p>
          <label htmlFor="standby-title">Judul Standby Statement</label>
          <input id="standby-title" value={standbyTitle} maxLength={200} onChange={(e) => setStandbyTitle(e.target.value)} />
          <label htmlFor="standby-body">Isi Standby Statement</label>
          <textarea id="standby-body" value={standbyBody} maxLength={20000} onChange={(e) => setStandbyBody(e.target.value)} />
        </fieldset>
      )}
      <button type="submit" value="draft" disabled={busy}>
        {busy
          ? "Menyimpan…"
          : duplicate
            ? "Tetap buat isu dengan judul serupa"
            : "Simpan draft"}
      </button>
      {canPublishNow && (
        <button type="submit" value="publish" disabled={busy}>
          {busy ? "Menyimpan…" : "Terbitkan sekarang"}
        </button>
      )}
    </form>
  );
}
