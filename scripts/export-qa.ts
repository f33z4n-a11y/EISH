import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "../src/lib/db";
import { briefingDocx, briefingPdf } from "../src/lib/briefing-export";
async function main() {
  const briefing = await db.briefing.findFirst({ where: { publishedVersion: { not: null } }, orderBy: { updatedAt: "desc" }, include: { author: { include: { roles: true } } } });
  if (!briefing) throw new Error("Tidak ada briefing sintetis terbit untuk QA ekspor.");
  const actor = { id: briefing.author.id, roles: briefing.author.roles.map((item) => item.role) }; const [pdf, docx] = await Promise.all([briefingPdf(actor, briefing.id), briefingDocx(actor, briefing.id)]); if (!pdf || !docx) throw new Error("Snapshot terbit tidak ditemukan.");
  const directory = resolve("tmp/export-qa"); mkdirSync(directory, { recursive: true }); writeFileSync(resolve(directory, "briefing-sample.pdf"), pdf.buffer); writeFileSync(resolve(directory, "briefing-sample.docx"), docx.buffer); console.log(directory);
}
main().finally(() => db.$disconnect());
