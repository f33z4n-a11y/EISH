import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../src/lib/db";
import { createIssue } from "../../src/lib/issues";
import { defaultContent } from "../../src/lib/issue-content";
import { createStatement, getStatement, listStatements, mutateStatement } from "../../src/lib/statements";
import { searchArchive } from "../../src/lib/archive";
const tag = randomUUID().slice(0, 8);
let contributor: { id: string; roles: ["CONTRIBUTOR"] }, approver: { id: string; roles: ["APPROVER"] };
let issueId = "", statementId = "";
describe("statement workflow dengan PostgreSQL", () => {
  beforeAll(async () => {
    for (const role of ["CONTRIBUTOR", "APPROVER"] as const) await db.role.upsert({ where: { code: role }, create: { code: role }, update: {} });
    const a = await db.user.create({ data: { name: `Statement Contributor ${tag}`, email: `sc-${tag}@example.test`, username: `sc-${tag}`, passwordHash: "synthetic", roles: { create: { role: "CONTRIBUTOR" } } } });
    const b = await db.user.create({ data: { name: `Statement Approver ${tag}`, email: `sa-${tag}@example.test`, username: `sa-${tag}`, passwordHash: "synthetic", roles: { create: { role: "APPROVER" } } } });
    contributor = { id: a.id, roles: ["CONTRIBUTOR"] }; approver = { id: b.id, roles: ["APPROVER"] };
    issueId = await createIssue(contributor, { ...defaultContent(a.id), title: `Isu statement ${tag}`, categoryId: "layanan-publik", summary: "Sintetis" });
  });
  afterAll(async () => {
    if (statementId) { await db.statementVersion.deleteMany({ where: { statementId } }); await db.statement.delete({ where: { id: statementId } }); }
    // Revisi isu dilindungi trigger immutable; data uji dibiarkan sebagai histori sintetis.
    for (const id of [contributor?.id, approver?.id]) if (id) { await db.auditEvent.deleteMany({ where: { actorId: id } }); await db.userRole.deleteMany({ where: { userId: id } }); try { await db.user.delete({ where: { id } }); } catch { /* terikat histori isu sintetis */ } }
    await db.$disconnect();
  });
  it("draft → review → approved → revoked, dengan Reader hanya menerima approved", async () => {
    statementId = await createStatement(contributor, issueId, { title: "Pernyataan sintetis", body: "Isi **aman**" });
    await expect(getStatement({ id: randomUUID(), roles: ["READER"] }, statementId)).resolves.toBeNull();
    await mutateStatement(contributor, statementId, 1, "submit");
    await mutateStatement(approver, statementId, 1, "approve");
    const approved = await getStatement({ id: randomUUID(), roles: ["READER"] }, statementId);
    expect(approved).not.toBeNull();
    expect(approved!.versions).toHaveLength(1);
    await mutateStatement(approver, statementId, 1, "revoke", { reason: "Tidak berlaku" });
    await expect(getStatement({ id: randomUUID(), roles: ["READER"] }, statementId)).resolves.toBeNull();
  });
  it("penulis biasa tidak dapat approve", async () => {
    const id = await createStatement(contributor, issueId, { title: "Pernyataan kedua", body: "Isi kedua" });
    await mutateStatement(contributor, id, 1, "submit");
    await expect(mutateStatement(contributor, id, 1, "approve")).rejects.toMatchObject({ status: 403 });
    await db.statementVersion.deleteMany({ where: { statementId: id } }); await db.statement.delete({ where: { id } });
  });
  it("Contributor tidak menerima draft statement milik isu lain melalui daftar atau pencarian terpadu", async () => {
    const foreign = await db.user.create({ data: { name: `Contributor lain ${tag}`, email: `foreign-${tag}@example.test`, username: `foreign-${tag}`, passwordHash: "synthetic", roles: { create: { role: "CONTRIBUTOR" } } } });
    const foreignActor = { id: foreign.id, roles: ["CONTRIBUTOR" as const] };
    const foreignIssue = await createIssue(foreignActor, { ...defaultContent(foreign.id), title: `Isu asing ${tag}`, categoryId: "layanan-publik", summary: "Sintetis" });
    const secret = `draft-rahasia-${tag}`;
    const foreignStatement = await createStatement(foreignActor, foreignIssue, { title: "Draft asing", body: secret });
    expect((await listStatements(contributor)).some((item) => item.id === foreignStatement)).toBe(false);
    expect(await searchArchive(contributor, secret)).toHaveLength(0);
  });
});
