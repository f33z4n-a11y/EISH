import type { RoleCode } from "@prisma/client";
import { getBriefing, listBriefings } from "./briefings";
import { listIssues } from "./issues";
import { listStatements } from "./statements";
type Actor = { id: string; roles: RoleCode[] };
export type ArchiveKind = "ALL" | "ISSUE" | "BRIEFING" | "STATEMENT";
export type ArchiveResult = { kind: Exclude<ArchiveKind, "ALL">; title: string; excerpt: string; href: string; status: string; updatedAt: Date };
const contains = (value: string, query: string) => value.toLocaleLowerCase("id-ID").includes(query);
const excerpt = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 240);
export async function searchArchive(actor: Actor, rawQuery: string, kind: ArchiveKind = "ALL") {
  const query = rawQuery.trim().toLocaleLowerCase("id-ID"); if (!query) return []; const results: ArchiveResult[] = [];
  if (kind === "ALL" || kind === "ISSUE") for (const issue of await listIssues(actor, { q: rawQuery })) results.push({ kind: "ISSUE", title: issue.content.title, excerpt: excerpt(issue.content.summary), href: `/issues/${issue.id}`, status: issue.content.status, updatedAt: issue.updatedAt });
  if (kind === "ALL" || kind === "STATEMENT") for (const statement of await listStatements(actor)) for (const version of statement.versions) if (contains(`${version.title} ${version.body}`, query)) results.push({ kind: "STATEMENT", title: version.title, excerpt: excerpt(version.body), href: `/statements/${statement.id}`, status: version.status, updatedAt: version.updatedAt });
  if (kind === "ALL" || kind === "BRIEFING") for (const row of await listBriefings(actor)) { const briefing = await getBriefing(actor, row.id); if (!briefing) continue; for (const revision of briefing.revisions) { const searchable = `${revision.title} ${revision.introduction} ${revision.followUp} ${revision.items.map((item) => `${item.title} ${item.body}`).join(" ")}`; if (contains(searchable, query)) results.push({ kind: "BRIEFING", title: revision.title, excerpt: excerpt(`${revision.introduction} ${revision.items.map((item) => item.body).join(" ")}`), href: `/briefings/${briefing.id}`, status: revision.status, updatedAt: briefing.date }); } }
  return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 100);
}
