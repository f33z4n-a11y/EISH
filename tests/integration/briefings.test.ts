import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../../src/lib/db";
import { createBriefing, changeBriefing, getBriefing } from "../../src/lib/briefings";
import { createIssue } from "../../src/lib/issues";
import { defaultContent } from "../../src/lib/issue-content";
import { briefingDocx, briefingPdf } from "../../src/lib/briefing-export";
import { readWhatsNew } from "../../src/lib/whats-new";

const tag = randomUUID().slice(0, 8);
let editor: { id: string; roles: ["EDITOR"] };
let approver: { id: string; roles: ["APPROVER"] };
let reader: { id: string; roles: ["READER"] };
let issueId: string;
const payload = () => ({ date: "2026-11-13", session: "PAGI", title: `Briefing ${tag}`, introduction: "Pengantar", followUp: "Pantau perkembangan", items: [{ issueId, title: `Isu ${tag}`, body: "Ringkasan", references: [] }] });

beforeAll(async () => {
  const actors = [];
  for (const role of ["EDITOR", "APPROVER", "READER"] as const) {
    await db.role.upsert({ where: { code: role }, create: { code: role }, update: {} });
    const user = await db.user.create({ data: { name: `Briefing ${role}`, email: `${randomUUID()}@example.test`, username: `brief-${randomUUID().slice(0, 20)}`, passwordHash: "not-a-login-account", roles: { create: { role } } } });
    actors.push({ id: user.id, roles: [role] });
  }
  [editor, approver, reader] = actors as [typeof editor, typeof approver, typeof reader];
  issueId = await createIssue(editor, { ...defaultContent(editor.id), title: `Isu ${tag}`, categoryId: "layanan-publik", summary: "Ringkasan" }, undefined, false, undefined, true);
});

afterAll(async () => { await db.$disconnect(); });

describe("alur briefing ringkas", () => {
  it("Editor dapat mengedit saat review, lalu Approver menyetujui dan menerbitkan sekaligus", async () => {
    const id = await createBriefing(editor, payload());
    await changeBriefing(editor, id, 1, "submit");
    await changeBriefing(editor, id, 1, "edit", { ...payload(), title: `Revisi ${tag}` });
    await changeBriefing(editor, id, 2, "submit");
    await changeBriefing(approver, id, 2, "approve_publish");
    const visible = await getBriefing(reader, id);
    expect(visible?.publishedVersion).toBe(2);
    expect(visible?.revisions[0].status).toBe("PUBLISHED");
    expect(visible?.revisions[0].title).toBe(`Revisi ${tag}`);
    const pdf = await briefingPdf(reader, id); const docx = await briefingDocx(reader, id);
    expect(pdf?.buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(docx?.buffer.subarray(0, 2).toString()).toBe("PK");
  });
  it("Apa yang Baru memakai kunjungan beranda sebagai checkpoint", async () => {
    await readWhatsNew(editor, new Date());
    const freshId = await createIssue(editor, { ...defaultContent(editor.id), title: `Checkpoint ${randomUUID()}`, categoryId: "layanan-publik", summary: "Ringkasan baru" }, undefined, false, undefined, true);
    const second = await readWhatsNew(editor, new Date(Date.now() + 1000));
    expect(second.items.some((item) => item.href === `/issues/${freshId}`)).toBe(true);
    expect((await readWhatsNew(editor, new Date(Date.now() + 2000))).items).toHaveLength(0);
  });
});
