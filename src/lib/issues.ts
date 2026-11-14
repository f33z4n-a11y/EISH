import { Prisma, type IssueRecord, type RoleCode } from "@prisma/client";
import { db } from "./db";
import {
  contentSchema,
  normalizedTitle,
  searchText,
  validateKind,
  type IssueContent,
} from "./issue-content";
import { richText } from "./issue-content";
export class IssueError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "INVALID",
  ) {
    super(message);
  }
}
export type Actor = { id: string; roles: RoleCode[] };
const editor = (a: Actor) => a.roles.includes("EDITOR");
export const canCreateIssue = (a: Actor) =>
  editor(a) || a.roles.includes("CONTRIBUTOR");
export const canEditIssue = (
  a: Actor,
  r: Pick<IssueRecord, "ownerId" | "assigneeId">,
) =>
  editor(a) ||
  (a.roles.includes("CONTRIBUTOR") &&
    (r.ownerId === a.id || r.assigneeId === a.id));
export const canReadInternal = (
  a: Actor,
  r: Pick<IssueRecord, "ownerId" | "assigneeId">,
) => canEditIssue(a, r) || a.roles.includes("APPROVER");
async function fresh(tx: Prisma.TransactionClient, a: Actor) {
  const u = await tx.user.findUnique({
    where: { id: a.id },
    include: { roles: true },
  });
  if (!u?.active) throw new IssueError(403, "Akses ditolak.");
  return { id: u.id, roles: u.roles.map((r) => r.role) };
}
async function locked(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM "IssueRecord" WHERE id=${id} FOR UPDATE`;
  const r = await tx.issueRecord.findUnique({ where: { id } });
  if (!r || r.deletedAt) throw new IssueError(404, "Isu tidak ditemukan.");
  return r;
}
async function prepared(
  tx: Prisma.TransactionClient,
  raw: unknown,
  kind: "ISSUE" | "UPDATE",
  a: Actor,
  scope?: IssueRecord,
) {
  const c = contentSchema.parse(raw);
  try {
    validateKind(c, kind);
  } catch {
    throw new IssueError(
      400,
      "Lengkapi judul, kategori, ringkasan atau isi perkembangan.",
    );
  }
  if (!editor(a)) {
    if (
      scope &&
      (c.ownerId !== scope.ownerId || c.assigneeId !== (scope.assigneeId ?? ""))
    )
      throw new IssueError(403, "Hanya Editor dapat mengubah penugasan.");
    if (!scope && (c.ownerId !== a.id || c.assigneeId))
      throw new IssueError(403, "Isu baru harus milik Anda.");
  }
  if (kind === "ISSUE") {
    const category = await tx.category.findFirst({
      where: { id: c.categoryId, active: true },
    });
    if (!category) throw new IssueError(400, "Kategori tidak tersedia.");
    c.categoryName = category.name;
  }
  const ids = [c.ownerId, ...(c.assigneeId ? [c.assigneeId] : [])];
  const users = await tx.user.findMany({
    where: {
      id: { in: ids },
      active: true,
      roles: { some: { role: { in: ["CONTRIBUTOR", "EDITOR"] } } },
    },
    select: { id: true, name: true },
  });
  if (ids.some((id) => !users.some((u) => u.id === id)))
    throw new IssueError(
      400,
      "Pemilik/penanggung jawab harus akun operasional aktif.",
    );
  c.ownerName = users.find((u) => u.id === c.ownerId)!.name;
  c.assigneeName = users.find((u) => u.id === c.assigneeId)?.name ?? "";
  return c;
}
async function audit(
  tx: Prisma.TransactionClient,
  a: Actor,
  record: IssueRecord,
  action: string,
  version: number,
) {
  await tx.auditEvent.create({
    data: {
      actorId: a.id,
      entityType: record.kind,
      entityId: record.id,
      action,
      metadata: { version, parentId: record.parentId },
    },
  });
}
export async function createIssue(
  actor: Actor,
  raw: unknown,
  parentId?: string,
  acceptDuplicate = false,
  standbyStatement?: { title: string; body: string },
  publishNow = false,
) {
  return db.$transaction(async (tx) => {
    const a = await fresh(tx, actor);
    if (!canCreateIssue(a)) throw new IssueError(403, "Akses ditolak.");
    const parent = parentId ? await locked(tx, parentId) : undefined;
    if (parent && (parent.kind !== "ISSUE" || !canEditIssue(a, parent)))
      throw new IssueError(403, "Akses ditolak.");
    const kind = parent ? "UPDATE" : "ISSUE";
    const c = await prepared(tx, raw, kind, a, parent);
    if (publishNow && (!editor(a) || parent))
      throw new IssueError(403, "Hanya Editor dapat langsung menerbitkan isu baru.");
    if (!parent && !acceptDuplicate) {
      // Query hanya judul yang dapat dibaca aktor; tidak membocorkan draft pengguna lain.
      const candidates = await tx.$queryRaw<{ id: string }[]>(
        Prisma.sql`SELECT i.id FROM "IssueRecord" i JOIN "IssueRevision" r ON r."recordId"=i.id AND r.version=CASE WHEN (${editor(a)} OR (${a.roles.includes("CONTRIBUTOR")} AND (i."ownerId"=${a.id} OR i."assigneeId"=${a.id}))) THEN i."currentVersion" ELSE i."publishedVersion" END WHERE i.kind='ISSUE' AND i."deletedAt" IS NULL AND lower(regexp_replace(trim(normalize(r.content->>'title',NFKC)),'[[:space:]]+',' ','g'))=${normalizedTitle(c.title)} LIMIT 1`,
      );
      if (candidates.length)
        throw new IssueError(
          409,
          "Judul serupa sudah ada. Periksa daftar isu sebelum melanjutkan.",
          "DUPLICATE",
        );
    }
    const r = await tx.issueRecord.create({
      data: {
        kind,
        parentId,
        categoryId: kind === "ISSUE" ? c.categoryId : null,
        ownerId: c.ownerId,
        assigneeId: c.assigneeId || null,
        currentVersion: 1,
      },
    });
    await tx.issueRevision.create({
      data: {
        recordId: r.id,
        version: 1,
        actorId: a.id,
        content: c,
        searchText: searchText(c),
      },
    });
    if (!parent && standbyStatement && (standbyStatement.title.trim() || standbyStatement.body.trim())) {
      const title = standbyStatement.title.trim();
      const body = standbyStatement.body;
      if (!title || title.length > 200 || !body.trim() || !richText.safeParse(body).success)
        throw new IssueError(400, "Judul dan isi Standby Statement harus diisi dengan format aman.");
      const statement = await tx.statement.create({ data: { issueId: r.id, authorId: a.id, title } });
      await tx.statementVersion.create({ data: { statementId: statement.id, version: 1, title, body, createdById: a.id } });
      await tx.auditEvent.create({
        data: {
          actorId: a.id,
          entityType: "STATEMENT",
          entityId: statement.id,
          action: "STATEMENT_CREATE",
          metadata: { version: 1, issueId: r.id },
        },
      });
    }
    await audit(tx, a, r, "ISSUE_CREATE", 1);
    if (publishNow) {
      await tx.issueRecord.update({
        where: { id: r.id },
        data: { publishedVersion: 1 },
      });
      await audit(tx, a, r, "ISSUE_PUBLISH", 1);
    }
    return r.id;
  });
}
export async function mutateIssue(
  actor: Actor,
  id: string,
  version: number,
  action: "edit" | "publish" | "withdraw" | "delete",
  raw?: unknown,
) {
  return db.$transaction(async (tx) => {
    const a = await fresh(tx, actor);
    const preliminary = await tx.issueRecord.findUnique({ where: { id } });
    if (!preliminary) throw new IssueError(404, "Isu tidak ditemukan.");
    const scope = preliminary.parentId
      ? await locked(tx, preliminary.parentId)
      : undefined;
    const r = await locked(tx, id);
    const mayDelete = action === "delete" && a.roles.some((role) => role !== "READER");
    if (!mayDelete && (!canEditIssue(a, scope ?? r) || (action !== "edit" && !editor(a))))
      throw new IssueError(403, "Akses ditolak.");
    if (r.currentVersion !== version)
      throw new IssueError(
        409,
        "Data sudah berubah. Input Anda tetap tersedia; buka versi terbaru di tab lain sebelum menggabungkan perubahan.",
        "CONFLICT",
      );
    if (action === "edit") {
      const c = await prepared(tx, raw, r.kind, a, scope ?? r);
      await tx.issueRevision.create({
        data: {
          recordId: id,
          version: version + 1,
          actorId: a.id,
          content: c,
          searchText: searchText(c),
        },
      });
      await tx.issueRecord.update({
        where: { id },
        data: {
          currentVersion: version + 1,
          categoryId: r.kind === "ISSUE" ? c.categoryId : null,
          ownerId: c.ownerId,
          assigneeId: c.assigneeId || null,
        },
      });
    } else if (action === "publish") {
      if (scope && scope.publishedVersion === null)
        throw new IssueError(400, "Terbitkan isu induk terlebih dahulu.");
      await tx.issueRecord.update({
        where: { id },
        data: { publishedVersion: version },
      });
    } else if (action === "withdraw") {
      await tx.issueRecord.update({
        where: { id },
        data: { publishedVersion: null },
      });
      // Penarikan induk juga menarik update agar publikasi ulang harus eksplisit.
      if (!scope)
        await tx.issueRecord.updateMany({
          where: { parentId: id },
          data: { publishedVersion: null },
        });
    } else
      await tx.issueRecord.update({
        where: { id },
        data: { deletedAt: new Date(), publishedVersion: null },
      });
    await audit(
      tx,
      a,
      r,
      `ISSUE_${action.toUpperCase()}`,
      action === "edit" ? version + 1 : version,
    );
    return scope?.id ?? id;
  });
}
export type Projection = {
  id: string;
  content: IssueContent;
  version: number;
  publishedVersion: number | null;
  createdAt: Date;
  updatedAt: Date;
  internal: boolean;
  authorName?: string;
};
export async function issueDetail(
  a: Actor,
  id: string,
  tx: Prisma.TransactionClient = db,
): Promise<null | {
  record: IssueRecord;
  issue: Projection;
  updates: Projection[];
  history: {
    recordId: string;
    version: number;
    content: IssueContent;
    createdAt: Date;
    actor: { name: string };
  }[];
}> {
  const r = await tx.issueRecord.findUnique({
    where: { id },
    include: {
      updates: {
        where: { deletedAt: null },
        include: {
          revisions: {
            orderBy: { version: "desc" },
            include: { actor: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!r || r.kind !== "ISSUE" || r.deletedAt) return null;
  const internal = canReadInternal(a, r);
  const version = internal ? r.currentVersion : r.publishedVersion;
  if (version === null) return null;
  const revision = await tx.issueRevision.findUnique({
    where: { recordId_version: { recordId: id, version } },
    include: { actor: { select: { name: true } } },
  });
  if (!revision) return null;
  const project = (
    record: IssueRecord,
    rev: {
      content: Prisma.JsonValue;
      version: number;
      createdAt: Date;
      actor?: { name: string };
    },
  ): Projection => ({
    id: record.id,
    content: contentSchema.parse(rev.content),
    version: rev.version,
    publishedVersion: record.publishedVersion,
    createdAt: record.createdAt,
    updatedAt: rev.createdAt,
    authorName: rev.actor?.name,
    internal,
  });
  const updates = r.updates
    .flatMap((u) => {
      const rev = u.revisions.find(
        (v) => v.version === (internal ? u.currentVersion : u.publishedVersion),
      );
      return rev ? [project(u, rev)] : [];
    })
    .sort(
      (a, b) =>
        b.content.date.localeCompare(a.content.date) ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    );
  const history = internal
    ? await tx.issueRevision.findMany({
        where: { OR: [{ recordId: id }, { record: { parentId: id } }] },
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true } },
          record: { select: { kind: true } },
        },
      })
    : [];
  return {
    record: r,
    issue: project(r, revision),
    updates,
    history: history.map((h) => ({
      ...h,
      content: contentSchema.parse(h.content),
    })),
  };
}
export type IssueFilters = {
  q?: string;
  category?: string;
  status?: string;
  priority?: string;
  owner?: string;
  from?: string;
  to?: string;
};
export async function listIssues(
  a: Actor,
  f: IssueFilters,
  tx: Prisma.TransactionClient = db,
): Promise<Projection[]> {
  const internal = Prisma.sql`(${editor(a)} OR ${a.roles.includes("APPROVER")} OR (${a.roles.includes("CONTRIBUTOR")} AND (i."ownerId"=${a.id} OR i."assigneeId"=${a.id})))`;
  const q = (f.q ?? "").trim().slice(0, 200);
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      content: Prisma.JsonValue;
      version: number;
      publishedVersion: number | null;
      createdAt: Date;
      updatedAt: Date;
      internal: boolean;
    }>
  >(Prisma.sql`
 SELECT i.id,r.content,r.version,i."publishedVersion",i."createdAt",r."createdAt" AS "updatedAt",${internal} AS internal
 FROM "IssueRecord" i JOIN "IssueRevision" r ON r."recordId"=i.id AND r.version=CASE WHEN ${internal} THEN i."currentVersion" ELSE i."publishedVersion" END
 WHERE i.kind='ISSUE' AND i."deletedAt" IS NULL
 AND (${f.category ?? ""}='' OR r.content->>'categoryId'=${f.category ?? ""})
 AND (${f.status ?? ""}='' OR r.content->>'status'=${f.status ?? ""})
 AND (${f.priority ?? ""}='' OR COALESCE(r.content->>'priority','MEDIUM')=${f.priority ?? ""})
 AND (${f.owner ?? ""}='' OR r.content->>'ownerId'=${f.owner ?? ""})
 AND (${f.from ?? ""}='' OR r.content->>'date'>=${f.from ?? ""})
 AND (${f.to ?? ""}='' OR r.content->>'date'<=${f.to ?? ""})
 AND (${q}='' OR to_tsvector('simple',r."searchText") @@ plainto_tsquery('simple',${q}) OR EXISTS (
 SELECT 1 FROM "IssueRecord" u JOIN "IssueRevision" ur ON ur."recordId"=u.id AND ur.version=CASE WHEN ${internal} THEN u."currentVersion" ELSE u."publishedVersion" END
 WHERE u."parentId"=i.id AND u."deletedAt" IS NULL AND to_tsvector('simple',ur."searchText") @@ plainto_tsquery('simple',${q})
 )) ORDER BY r."createdAt" DESC LIMIT 100`);
  return rows.map((r) => ({ ...r, content: contentSchema.parse(r.content) }));
}
