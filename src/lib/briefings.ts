import { Prisma, type BriefingSession, type IssuePriority, type RoleCode } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";
import { IssueError } from "./issues";
import { richText } from "./issue-content";

type Actor = { id: string; roles: RoleCode[] };
const input = z.object({
  date: z.iso.date(),
  session: z.enum(["PAGI", "MALAM", "INSIDENTIL"]),
  title: z.string().trim().min(1).max(200),
  introduction: richText,
  followUp: richText,
  items: z.array(z.object({
    issueId: z.string().min(1),
    title: z.string().trim().min(1).max(200),
    body: richText,
    priority: z.enum(["VERY_HIGH", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
    references: z.array(z.object({ title: z.string(), url: z.url() })).max(20),
  })).min(1).max(30),
});
export type BriefingInput = z.infer<typeof input>;
async function fresh(tx: Prisma.TransactionClient, actor: Actor) {
  const user = await tx.user.findUnique({ where: { id: actor.id }, include: { roles: true } });
  if (!user?.active) throw new IssueError(403, "Akses ditolak.");
  return user.roles.map((r) => r.role);
}
async function audit(tx: Prisma.TransactionClient, actor: Actor, id: string, version: number, action: string) {
  await tx.auditEvent.create({ data: { actorId: actor.id, entityType: "BRIEFING", entityId: id, action: `BRIEFING_${action}`, metadata: { version } } });
}
async function itemsFor(tx: Prisma.TransactionClient, actor: Actor, raw: BriefingInput) {
  const issueIds = raw.items.map((item) => item.issueId);
  if (new Set(issueIds).size !== issueIds.length) throw new IssueError(400, "Satu isu hanya boleh dipilih sekali.");
  const records = await tx.issueRecord.findMany({ where: { id: { in: issueIds }, kind: "ISSUE", deletedAt: null } });
  if (records.length !== issueIds.length || records.some((r) => !actor.roles.includes("EDITOR") && r.ownerId !== actor.id && r.assigneeId !== actor.id)) throw new IssueError(403, "Isu pilihan tidak dapat diakses.");
  return raw.items.map((item, position) => ({ ...item, position: position + 1, priority: item.priority as IssuePriority, references: item.references as Prisma.InputJsonValue }));
}
export async function createBriefing(actor: Actor, raw: unknown) {
  const parsed = input.safeParse(raw);
  if (!parsed.success) throw new IssueError(400, "Isi briefing tidak valid.");
  return db.$transaction(async (tx) => {
    const roles = await fresh(tx, actor);
    if (!roles.includes("CONTRIBUTOR") && !roles.includes("EDITOR")) throw new IssueError(403, "Akses ditolak.");
    const selected = await itemsFor(tx, { ...actor, roles }, parsed.data);
    const briefing = await tx.briefing.create({ data: { date: new Date(`${parsed.data.date}T00:00:00Z`), session: parsed.data.session as BriefingSession, authorId: actor.id } });
    await tx.briefingRevision.create({ data: { briefingId: briefing.id, version: 1, authorId: actor.id, title: parsed.data.title, introduction: parsed.data.introduction, followUp: parsed.data.followUp, items: { create: selected } } });
    await audit(tx, actor, briefing.id, 1, "CREATE");
    return briefing.id;
  });
}
export async function getBriefing(actor: Actor, id: string) {
  const briefing = await db.briefing.findUnique({ where: { id }, include: { revisions: { include: { items: { orderBy: { position: "asc" } } }, orderBy: { version: "desc" } } } });
  if (!briefing) return null;
  const internal = actor.roles.some((role) => ["EDITOR", "APPROVER"].includes(role)) || (actor.roles.includes("CONTRIBUTOR") && briefing.authorId === actor.id);
  const revisions = internal ? briefing.revisions : briefing.revisions.filter((revision) => revision.version === briefing.publishedVersion && revision.status === "PUBLISHED");
  if (!revisions.length) return null;
  return { ...briefing, revisions, internal };
}
export async function listBriefings(actor: Actor) {
  const rows = await db.briefing.findMany({ orderBy: { date: "desc" }, select: { id: true, date: true, session: true, authorId: true, currentVersion: true, publishedVersion: true, revisions: { select: { version: true, status: true, title: true } } } });
  return rows.filter((row) => row.publishedVersion || actor.roles.some((role) => ["EDITOR", "APPROVER"].includes(role)) || (actor.roles.includes("CONTRIBUTOR") && row.authorId === actor.id)).map((row) => ({ ...row, revisions: row.revisions.filter((revision) => actor.roles.some((role) => ["EDITOR", "APPROVER"].includes(role)) || (actor.roles.includes("CONTRIBUTOR") && row.authorId === actor.id) || revision.version === row.publishedVersion) }));
}
export async function changeBriefing(actor: Actor, id: string, version: number, action: "edit" | "submit" | "approve_publish", raw?: unknown) {
  return db.$transaction(async (tx) => {
    const roles = await fresh(tx, actor);
    await tx.$queryRaw`SELECT id FROM "Briefing" WHERE id=${id} FOR UPDATE`;
    const briefing = await tx.briefing.findUnique({ where: { id }, include: { revisions: true } });
    if (!briefing) throw new IssueError(404, "Briefing tidak ditemukan.");
    const revision = briefing.revisions.find((r) => r.version === version);
    if (!revision || briefing.currentVersion !== version) throw new IssueError(409, "Versi briefing sudah berubah.", "CONFLICT");
    const writer = roles.includes("EDITOR") || (roles.includes("CONTRIBUTOR") && briefing.authorId === actor.id);
    if (["edit", "submit"].includes(action) && !writer || action === "approve_publish" && !roles.includes("APPROVER")) throw new IssueError(403, "Akses ditolak.");
    if (action === "edit") {
      if (!["DRAFT", "IN_REVIEW", "PUBLISHED"].includes(revision.status)) throw new IssueError(400, "Briefing ini tidak dapat diedit.");
      const parsed = input.safeParse(raw);
      if (!parsed.success) throw new IssueError(400, "Isi briefing tidak valid.");
      const selected = await itemsFor(tx, { ...actor, roles }, parsed.data);
      await tx.briefingRevision.create({ data: { briefingId: id, version: version + 1, authorId: actor.id, title: parsed.data.title, introduction: parsed.data.introduction, followUp: parsed.data.followUp, items: { create: selected } } });
      await tx.briefing.update({ where: { id }, data: { currentVersion: version + 1, date: new Date(`${parsed.data.date}T00:00:00Z`), session: parsed.data.session } });
      version++;
    } else if (action === "submit") {
      if (revision.status !== "DRAFT") throw new IssueError(400, "Hanya draft yang dapat dikirim untuk review.");
      await tx.briefingRevision.update({ where: { briefingId_version: { briefingId: id, version } }, data: { status: "IN_REVIEW" } });
    } else {
      if (revision.status !== "IN_REVIEW") throw new IssueError(400, "Briefing harus dalam review.");
      const now = new Date();
      await tx.briefingRevision.update({ where: { briefingId_version: { briefingId: id, version } }, data: { status: "PUBLISHED", approvedById: actor.id, approvedAt: now, publishedAt: now } });
      await tx.briefing.update({ where: { id }, data: { publishedVersion: version } });
    }
    await audit(tx, actor, id, version, action.toUpperCase());
    return id;
  });
}
