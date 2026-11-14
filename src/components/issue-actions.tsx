"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function IssueActions({
  id,
  version,
  published,
  deleteOnly = false,
}: {
  id: string;
  version: number;
  published: boolean;
  deleteOnly?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(action: string) {
    if (
      action === "delete" &&
      !confirm("Hapus isu ini? Isu tidak akan tampil lagi; histori tetap disimpan.")
    )
      return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/issues/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version }),
      });
      const b = await r.json();
      if (!r.ok) {
        setError(b.error);
        return;
      }
      if (action === "delete")
        router.push(b.id === id ? "/issues" : `/issues/${b.id}`);
      router.refresh();
    } catch {
      setError("Operasi gagal. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="issue-actions">
      {!deleteOnly && <button disabled={busy} onClick={() => act("publish")}>
        {published ? `Terbitkan perubahan ${version}` : "Terbitkan isu"}
      </button>}
      {!deleteOnly && published && (
        <button disabled={busy} onClick={() => act("withdraw")}>
          Tarik publikasi
        </button>
      )}
      <button disabled={busy} onClick={() => act("delete")}>
        Hapus
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
