import "dotenv/config";
import { db } from "../src/lib/db";
import { listIssues, mutateIssue } from "../src/lib/issues";
import { taxonomyExamples } from "./taxonomy-examples";

const main = async () => {
  const editor = await db.user.findUnique({ where: { username: "editor" }, include: { roles: true } });
  if (!editor) throw new Error("Akun Editor sintetis tidak tersedia.");
  const actor = { id: editor.id, roles: editor.roles.map((role) => role.role) };
  const [issues, categories] = await Promise.all([
    listIssues(actor, {}),
    db.category.findMany({ where: { active: true }, select: { id: true, code: true } }),
  ]);
  const codeByCategoryId = new Map(categories.map((category) => [category.id, category.code]));
  let updated = 0;
  for (const issue of issues) {
    const code = codeByCategoryId.get(issue.content.categoryId);
    const example = code ? taxonomyExamples[code] : undefined;
    if (!example || !/^K\d{2} · /.test(issue.content.title)) continue;
    await mutateIssue(actor, issue.id, issue.version, "edit", { ...issue.content, ...example });
    await mutateIssue(actor, issue.id, issue.version + 1, "publish");
    updated += 1;
  }
  console.log(`${updated} isu sintetis diperbarui melalui revisi baru.`);
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
