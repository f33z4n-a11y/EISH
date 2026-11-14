"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function StatementForm({ issueId }: { issueId: string }) {
  const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e: React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/statements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issueId,title,body})});const b=await r.json();if(!r.ok){setError(b.error);return}router.push(`/statements/${b.id}`)}catch{setError("Tidak dapat menyimpan pernyataan.")}finally{setBusy(false)}}
  return <form className="card" onSubmit={submit}><label htmlFor="statement-title">Judul</label><input id="statement-title" required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/><label htmlFor="statement-body">Isi pernyataan</label><textarea id="statement-body" required maxLength={20000} value={body} onChange={e=>setBody(e.target.value)}/><p className="muted">Format teks aman: **tebal**, *miring*, daftar dan tautan HTTP/HTTPS.</p>{error&&<p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy?"Menyimpan…":"Simpan draft"}</button></form>;
}
