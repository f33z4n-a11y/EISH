"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function StatementActions({ id, version, status, body }: { id: string; version: number; status: string; body: string }) {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function act(action: string) { setBusy(true); setError(""); try { const reason = action === "revoke" ? window.prompt("Alasan pencabutan wajib diisi") : null; if (action === "revoke" && !reason?.trim()) return; const validUntil = action === "approve" ? window.prompt("Berlaku sampai (ISO, opsional), contoh 2027-12-31T23:59:59+07:00") : null; const r = await fetch(`/api/statements/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, version, reason, validUntil }) }); const b = await r.json(); if (!r.ok) { setError(b.error); return; } router.refresh(); } catch { setError("Operasi gagal."); } finally { setBusy(false); } }
  async function copy() { try { await navigator.clipboard.writeText(body); setError("Teks approved disalin."); } catch { setError("Tidak dapat menyalin teks."); } }
  return <div className="issue-actions">{status === "DRAFT" && <button disabled={busy} onClick={() => act("submit")}>Kirim untuk review</button>}{status === "IN_REVIEW" && <button disabled={busy} onClick={() => act("approve")}>Setujui versi</button>}{status === "APPROVED" && <><button disabled={busy} onClick={copy}>Salin teks approved</button><button disabled={busy} onClick={() => act("revoke")}>Cabut versi</button></>}{error && <p role="status" className="muted">{error}</p>}</div>;
}
