import "dotenv/config";
import { db } from "../src/lib/db";
import { createIssue, createIssue as createUpdate, mutateIssue } from "../src/lib/issues";
import { mutateStatement } from "../src/lib/statements";

const run = async () => {
  const editor = await db.user.findUnique({ where: { username: "editor" }, include: { roles: true } });
  const approver = await db.user.findUnique({ where: { username: "approver" }, include: { roles: true } });
  const category = await db.category.findFirst({ where: { active: true } });
  if (!editor || !approver || !category) throw new Error("Akun editor/approver atau kategori belum tersedia. Jalankan seed terlebih dahulu.");
  const actor = { id: editor.id, roles: editor.roles.map((r) => r.role) } as const;
  const approverActor = { id: approver.id, roles: approver.roles.map((r) => r.role) } as const;
  const samples = [
    ["Gangguan layanan digital publik", "Pemulihan layanan sedang dipantau setelah gangguan akses pada jam sibuk.", "Tim teknis mengaktifkan jalur cadangan dan memantau kapasitas secara berkala.", "Pernyataan resmi pemulihan layanan"],
    ["Perubahan kebijakan layanan komunikasi", "Rencana perubahan kebijakan berdampak pada alur layanan dan perlu disiapkan komunikasinya.", "Analisis dampak lintas unit telah dimulai untuk memastikan transisi berjalan terukur.", "Pernyataan kebijakan layanan"],
    ["Penguatan keamanan sistem informasi", "Pemantauan keamanan ditingkatkan menyusul temuan anomali pada salah satu sistem pendukung.", "Tim keamanan melakukan penguatan konfigurasi dan validasi log secara bertahap.", "Pernyataan keamanan sistem"],
  ];
  for (const [title, summary, background, statementTitle] of samples) {
    const id = await createIssue(actor, { title, summary, background, body: "", categoryId: category.id, status: "ACTIVE", priority: "HIGH", attention: true, keywords: "sintetis, dashboard", date: "2026-11-13", session: "PAGI", material: true, sources: [], ownerId: editor.id, assigneeId: "" }, undefined, true, { title: statementTitle, body: `Informasi ini merupakan pernyataan sintetis untuk pengujian. ${summary}` }, true);
    for (const [date, body] of [["2026-11-13", "Perkembangan terbaru telah diterbitkan dan sedang dipantau oleh tim terkait."], ["2026-11-12", "Mitigasi awal selesai dilakukan dan hasilnya sedang dievaluasi."]]) {
      const update = await createUpdate(actor, { title: "Perkembangan mitigasi", summary: "", background: "", body, categoryId: "", status: "ACTIVE", priority: "HIGH", attention: false, keywords: "", date, session: "PAGI", material: true, sources: [], ownerId: editor.id, assigneeId: "" }, id);
      await mutateIssue(actor, update, 1, "publish");
    }
    const statement = (await db.statement.findFirst({ where: { issueId: id } }))!;
    await mutateStatement(actor, statement.id, 1, "submit");
    await mutateStatement(approverActor, statement.id, 1, "approve");
  }
};
run().finally(() => db.$disconnect());
