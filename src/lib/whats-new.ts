import type { RoleCode } from "@prisma/client";
import { db } from "./db";
type Actor = { id: string; roles: RoleCode[] };
export type WhatsNewItem = { id: string; label: string; title: string; href: string; publishedAt: Date };

export async function readWhatsNew(actor: Actor, now = new Date()) {
  const checkpoint = await db.readerCheckpoint.findUnique({ where: { userId: actor.id } });
  const events = await db.auditEvent.findMany({
    where: {
      ...(checkpoint ? { createdAt: { gt: checkpoint.lastSeenAt, lte: now } } : { createdAt: { lte: now } }),
      OR: [
        { action: "ISSUE_PUBLISH", entityType: { in: ["ISSUE", "UPDATE"] } },
        { action: "BRIEFING_APPROVE_PUBLISH", entityType: "BRIEFING" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const issueIds = events.filter((event) => event.entityType === "ISSUE" || event.entityType === "UPDATE").map((event) => event.entityId).filter((id): id is string => Boolean(id));
  const briefingIds = events.filter((event) => event.entityType === "BRIEFING").map((event) => event.entityId).filter((id): id is string => Boolean(id));
  const [records, briefings] = await Promise.all([
    db.issueRecord.findMany({ where: { id: { in: issueIds }, deletedAt: null, publishedVersion: { not: null } }, include: { revisions: true } }),
    db.briefing.findMany({ where: { id: { in: briefingIds }, publishedVersion: { not: null } }, include: { revisions: true } }),
  ]);
  const items: WhatsNewItem[] = [];
  for (const event of events) {
    if (!event.entityId) continue;
    if (event.entityType === "BRIEFING") {
      const briefing = briefings.find((item) => item.id === event.entityId); const revision = briefing?.revisions.find((item) => item.version === briefing.publishedVersion && item.status === "PUBLISHED");
      if (briefing && revision) items.push({ id: event.id, label: "Briefing diterbitkan", title: revision.title, href: `/briefings/${briefing.id}`, publishedAt: event.createdAt });
      continue;
    }
    const record = records.find((item) => item.id === event.entityId); const revision = record?.revisions.find((item) => item.version === record.publishedVersion); if (!record || !revision) continue;
    const content = revision.content as { title?: string }; const version = typeof event.metadata === "object" && event.metadata && "version" in event.metadata ? Number(event.metadata.version) : record.publishedVersion;
    items.push({ id: event.id, label: record.kind === "UPDATE" ? "Perkembangan diterbitkan" : version === 1 ? "Isu baru diterbitkan" : "Perubahan isu diterbitkan", title: content.title || (record.kind === "UPDATE" ? "Perkembangan isu" : "Isu"), href: record.parentId ? `/issues/${record.parentId}` : `/issues/${record.id}`, publishedAt: event.createdAt });
  }
  await db.readerCheckpoint.upsert({ where: { userId: actor.id }, create: { userId: actor.id, lastSeenAt: now }, update: { lastSeenAt: now } });
  return { items, firstVisit: checkpoint === null, previousSeenAt: checkpoint?.lastSeenAt ?? null };
}
