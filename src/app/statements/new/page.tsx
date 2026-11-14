import { requireUser } from "@/lib/auth";
import { Workspace } from "@/components/workspace";
import { StatementForm } from "@/components/statement-form";
import Link from "next/link";
export default async function Page({ searchParams }: { searchParams: Promise<{ issueId?: string }> }) {
  await requireUser(); const { issueId } = await searchParams;
  if (!issueId) return <Workspace current="/statements"><p><Link href="/statements">← Kembali ke Standby Statement</Link></p><h1>Buat Standby Statement</h1><p className="error">Isu belum dipilih.</p></Workspace>;
  return <Workspace current="/statements"><p><Link href={`/issues/${issueId}`}>← Kembali ke isu</Link></p><h1>Buat Standby Statement</h1><StatementForm issueId={issueId}/></Workspace>;
}
