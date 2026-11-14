"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BriefingActions({ id, version, status, canEdit, canApprove }: { id: string; version: number; status: string; canEdit: boolean; canApprove: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function act(action: "submit" | "approve_publish") {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/briefings/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, version }) });
      const data = await response.json();
      if (!response.ok) setError(data.error); else router.refresh();
    } catch { setError("Tindakan gagal."); } finally { setBusy(false); }
  }
  return <div className="issue-actions">
    {canEdit && ["DRAFT", "IN_REVIEW", "PUBLISHED"].includes(status) && <Link className="button" href={`/briefings/${id}/edit`}>Edit briefing</Link>}
    {canEdit && status === "DRAFT" && <button disabled={busy} onClick={() => act("submit")}>Kirim untuk persetujuan</button>}
    {canApprove && status === "IN_REVIEW" && <button disabled={busy} onClick={() => act("approve_publish")}>Setujui dan terbitkan</button>}
    {error && <p role="alert" className="error">{error}</p>}
  </div>;
}
