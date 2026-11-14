import { Prisma, type RoleCode } from "@prisma/client";
import { db } from "./db";
import { IssueError } from "./issues";
import { richText } from "./issue-content";

export type StatementActor = { id: string; roles: RoleCode[] };
export const canEditStatement = (a: StatementActor, issue: { ownerId: string; assigneeId: string | null }) =>
  a.roles.includes("EDITOR") || (a.roles.includes("CONTRIBUTOR") && (issue.ownerId === a.id || issue.assigneeId === a.id));
export const canApproveStatement = (a: StatementActor) => a.roles.includes("APPROVER");

function bodyInput(raw: unknown) {
  if (!raw || typeof raw !== "object") throw new IssueError(400, "Isi pernyataan tidak valid.");
  const b = raw as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const body = typeof b.body === "string" ? b.body : "";
  if (!title || title.length > 200) throw new IssueError(400, "Judul pernyataan wajib diisi.");
  const parsed = richText.safeParse(body);
  if (!parsed.success || !body.trim()) throw new IssueError(400, "Isi pernyataan wajib diisi dan harus menggunakan format aman.");
  return { title, body, changeReason: typeof b.changeReason === "string" ? b.changeReason.trim().slice(0, 500) : null };
}

async function actor(tx: Prisma.TransactionClient, a: StatementActor) {
  const u = await tx.user.findUnique({ where: { id: a.id }, include: { roles: true } });
  if (!u?.active) throw new IssueError(403, "Akses ditolak.");
  return { id: u.id, roles: u.roles.map((r) => r.role) };
}

export async function listStatements(a: StatementActor) {
  const canAllInternal = a.roles.some((r) => ["EDITOR", "APPROVER"].includes(r));
  const contributor = a.roles.includes("CONTRIBUTOR");
  const rows = await db.statement.findMany({
    where: { deletedAt: null, ...(canAllInternal ? {} : contributor ? { OR: [{ issue: { OR: [{ ownerId: a.id }, { assigneeId: a.id }] } }, { approvedVersion: { not: null } }] } : { approvedVersion: { not: null } }) },
    include: { issue: { select: { id: true, ownerId: true, assigneeId: true, deletedAt: true } }, versions: { orderBy: { version: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  if (canAllInternal) return rows;
  const now = new Date();
  return rows.map((s) => ({
    ...s,
    versions: contributor && (s.issue.ownerId === a.id || s.issue.assigneeId === a.id) ? s.versions : s.versions.filter((v) => v.version === s.approvedVersion && v.status === "APPROVED" && (!v.validFrom || v.validFrom <= now) && (!v.validUntil || v.validUntil > now)),
  })).filter((s) => s.versions.length > 0);
}

export async function getStatement(a: StatementActor, id: string) {
  const rows = await listStatements(a);
  const s = rows.find((x) => x.id === id);
  if (!s || s.issue.deletedAt) return null;
  const internal = a.roles.some((r) => ["EDITOR", "APPROVER"].includes(r)) || (a.roles.includes("CONTRIBUTOR") && (s.issue.ownerId === a.id || s.issue.assigneeId === a.id));
  if (!internal && !s.approvedVersion) return null;
  return { ...s, internal };
}

export async function createStatement(a: StatementActor, issueId: string, raw: unknown) {
  return db.$transaction(async (tx) => {
    const fresh = await actor(tx, a);
    const issue = await tx.issueRecord.findUnique({ where: { id: issueId } });
    if (!issue || issue.kind !== "ISSUE" || issue.deletedAt || !canEditStatement(fresh, issue)) throw new IssueError(403, "Akses ditolak.");
    const c = bodyInput(raw);
    const s = await tx.statement.create({ data: { issueId, authorId: fresh.id, title: c.title } });
    await tx.statementVersion.create({ data: { statementId: s.id, version: 1, title: c.title, body: c.body, changeReason: c.changeReason, createdById: fresh.id } });
    await tx.auditEvent.create({ data: { actorId: fresh.id, entityType: "STATEMENT", entityId: s.id, action: "STATEMENT_CREATE", metadata: { version: 1 } } });
    return s.id;
  });
}

export async function mutateStatement(a: StatementActor, id: string, version: number, action: "edit" | "submit" | "approve" | "revoke" | "delete", raw?: unknown) {
  return db.$transaction(async (tx) => {
    const fresh = await actor(tx, a);
    const s = await tx.statement.findUnique({ where: { id }, include: { issue: true, versions: { orderBy: { version: "desc" } } } });
    if (!s || s.deletedAt || s.issue.deletedAt) throw new IssueError(404, "Pernyataan tidak ditemukan.");
    const v = s.versions.find((x) => x.version === version);
    if (!v) throw new IssueError(409, "Versi pernyataan tidak ditemukan.", "CONFLICT");
    if (["edit", "submit"].includes(action) && !canEditStatement(fresh, s.issue)) throw new IssueError(403, "Akses ditolak.");
    if (["approve", "revoke"].includes(action) && !canApproveStatement(fresh)) throw new IssueError(403, "Hanya Approver dapat melakukan tindakan ini.");
    if (action === "edit") {
      if (v.status !== "DRAFT") throw new IssueError(400, "Hanya versi draft yang dapat disunting.");
      const c = bodyInput(raw);
      const next = version + 1;
      await tx.statementVersion.create({ data: { statementId: id, version: next, title: c.title, body: c.body, changeReason: c.changeReason, createdById: fresh.id } });
      await tx.statement.update({ where: { id }, data: { currentVersion: next, title: c.title } });
      version = next;
    } else if (action === "submit") {
      if (v.status !== "DRAFT") throw new IssueError(400, "Versi ini bukan draft.");
      await tx.statementVersion.update({ where: { statementId_version: { statementId: id, version } }, data: { status: "IN_REVIEW" } });
    } else if (action === "approve") {
      if (v.status !== "IN_REVIEW") throw new IssueError(400, "Versi harus dalam review sebelum disetujui.");
      const untilRaw = typeof raw === "object" && raw && "validUntil" in raw ? (raw as { validUntil: unknown }).validUntil : null;
      const validUntil = typeof untilRaw === "string" && untilRaw ? new Date(untilRaw) : null;
      if (validUntil && (Number.isNaN(validUntil.getTime()) || validUntil <= new Date())) throw new IssueError(400, "Tanggal berlaku sampai harus lebih besar dari sekarang.");
      await tx.statementVersion.updateMany({ where: { statementId: id, status: "APPROVED" }, data: { status: "SUPERSEDED" } });
      await tx.statementVersion.update({ where: { statementId_version: { statementId: id, version } }, data: { status: "APPROVED", approvedById: fresh.id, validFrom: new Date(), validUntil } });
      await tx.statement.update({ where: { id }, data: { approvedVersion: version } });
    } else if (action === "revoke") {
      if (v.status !== "APPROVED") throw new IssueError(400, "Hanya versi approved yang dapat dicabut.");
      await tx.statementVersion.update({ where: { statementId_version: { statementId: id, version } }, data: { status: "REVOKED", revokedAt: new Date(), revokeReason: typeof raw === "object" && raw && "reason" in raw ? String((raw as { reason: unknown }).reason).slice(0, 500) : "Dicabut oleh Approver" } });
      await tx.statement.updateMany({ where: { id, approvedVersion: version }, data: { approvedVersion: null } });
    } else {
      if (!canEditStatement(fresh, s.issue)) throw new IssueError(403, "Akses ditolak.");
      await tx.statement.update({ where: { id }, data: { deletedAt: new Date(), approvedVersion: null } });
    }
    await tx.auditEvent.create({ data: { actorId: fresh.id, entityType: "STATEMENT", entityId: id, action: `STATEMENT_${action.toUpperCase()}`, metadata: { version } } });
    return id;
  });
}
