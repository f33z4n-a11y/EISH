import Link from "next/link";
import { redirect } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { BriefingForm } from "@/components/briefing-form";
import { requireUser } from "@/lib/auth";
import { listIssues } from "@/lib/issues";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await requireUser();
  if (!actor.roles.some((r) => r === "EDITOR" || r === "CONTRIBUTOR")) redirect("/dashboard?akses=ditolak");
  const issues = await listIssues(actor, {});
  return <Workspace current="/briefings"><p><Link href="/briefings">← Kembali ke briefing</Link></p><h1>Buat briefing</h1><BriefingForm issues={issues.map((issue) => ({ id: issue.id, title: issue.content.title, summary: issue.content.summary, priority: issue.content.priority, references: issue.content.sources }))}/></Workspace>;
}
