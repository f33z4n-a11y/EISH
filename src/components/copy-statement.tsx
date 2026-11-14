"use client";
import { useState } from "react";
export function CopyStatement({ text, compact = false }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? "Tersalin" : "Copy pernyataan";
  return <button type="button" aria-label={label} title={label} className={`copy-statement${compact ? " copy-statement-compact" : " copy-statement-icon"}`} onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{compact ? (copied ? "Tersalin" : "Salin") : <span aria-hidden="true">⧉</span>}</button>;
}
