import "dotenv/config";
import { db } from "../src/lib/db";
import { createIssue } from "../src/lib/issues";
import { mutateStatement } from "../src/lib/statements";
import { taxonomyExamples } from "./taxonomy-examples";

const main = async () => {
  const editor = await db.user.findUnique({ where: { username: "editor" }, include: { roles: true } });
  const approver = await db.user.findUnique({ where: { username: "approver" }, include: { roles: true } });
  const categories = await db.category.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  if (!editor || !approver || categories.length !== 12) throw new Error("Seed akun atau 12 kategori belum tersedia.");
  await db.$transaction(async (tx) => {
    const issues = await tx.issueRecord.findMany({ select: { id: true } });
    const ids = issues.map((x) => x.id);
    if (ids.length) {
      await tx.briefingItem.deleteMany({ where: { issueId: { in: ids } } });
      await tx.statement.updateMany({ where: { issueId: { in: ids } }, data: { deletedAt: new Date(), approvedVersion: null } });
      await tx.issueRecord.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date(), publishedVersion: null } });
    }
  });
  const actor = { id: editor.id, roles: editor.roles.map((r) => r.role) } as const;
  const approverActor = { id: approver.id, roles: approver.roles.map((r) => r.role) } as const;
  const statuses = ["ACTIVE", "MONITORING", "ACTIVE", "RESOLVED", "ACTIVE", "MONITORING", "ACTIVE", "ARCHIVED", "ACTIVE", "MONITORING", "ACTIVE", "RESOLVED"] as const;
  const priorities = ["VERY_HIGH", "HIGH", "MEDIUM", "LOW", "HIGH", "VERY_HIGH", "MEDIUM", "LOW", "HIGH", "MEDIUM", "VERY_HIGH", "LOW"] as const;
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const code = category.code ?? "K00";
    const example = taxonomyExamples[code];
    if (!example) throw new Error(`Contoh sintetis ${code} belum tersedia.`);
    const issueId = await createIssue(actor, { ...example, body: "", categoryId: category.id, status: statuses[i], priority: priorities[i], attention: i % 3 === 0, keywords: `${code.toLowerCase()}, komdigi, sintetis`, date: "2026-11-15", session: "PAGI", material: true, sources: [], ownerId: editor.id, assigneeId: "" }, undefined, true, { title: `Pernyataan kesiapan ${code}`, body: `Informasi sintetis mengenai ${example.title.toLowerCase()} sedang diverifikasi. Pembaruan resmi akan disampaikan melalui kanal yang ditetapkan.` }, true);
    const statement = await db.statement.findFirst({ where: { issueId } });
    if (statement) { await mutateStatement(actor, statement.id, 1, "submit"); await mutateStatement(approverActor, statement.id, 1, "approve"); }
  }
  console.log(`Reset selesai: ${categories.length} isu sintetis dibuat.`);
};
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
