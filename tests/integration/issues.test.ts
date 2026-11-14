import "dotenv/config";
import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { db } from "../../src/lib/db";
import {
  createIssue,
  mutateIssue,
  issueDetail,
  listIssues,
  type Actor,
} from "../../src/lib/issues";
import { defaultContent } from "../../src/lib/issue-content";
const tag = randomUUID().slice(0, 8);
let contributor: Actor,
  other: Actor,
  editor: Actor,
  reader: Actor,
  approver: Actor,
  admin: Actor;
let id: string, updateId: string;
const users: string[] = [];
beforeAll(async () => {
  for (const role of [
    "CONTRIBUTOR",
    "EDITOR",
    "READER",
    "APPROVER",
    "ADMIN",
    "CONTRIBUTOR",
  ] as const) {
    await db.role.upsert({
      where: { code: role },
      create: { code: role },
      update: {},
    });
    const u = await db.user.create({
      data: {
        name: `Sprint1 ${role}`,
        email: `${randomUUID()}@example.test`,
        username: `s1-${randomUUID()}`,
        passwordHash: "not-a-login-account",
        roles: { create: { role } },
      },
    });
    users.push(u.id);
  }
  [contributor, editor, reader, approver, admin, other] = users.map(
    (id, i) => ({
      id,
      roles: [
        (
          [
            "CONTRIBUTOR",
            "EDITOR",
            "READER",
            "APPROVER",
            "ADMIN",
            "CONTRIBUTOR",
          ] as const
        )[i],
      ],
    }),
  );
});
afterAll(async () => {
  await db.$disconnect();
});
const content = () => ({
  ...defaultContent(contributor.id),
  title: `Layanan ${tag}`,
  categoryId: "layanan-publik",
  summary: "Ringkasan final",
  background: "Latar belakang",
});
describe("isu dan publikasi dengan PostgreSQL", () => {
  it("membuat isu, audit atomik dan ID stabil", async () => {
    id = await createIssue(contributor, content());
    expect(
      await db.auditEvent.count({
        where: { entityId: id, action: "ISSUE_CREATE" },
      }),
    ).toBe(1);
    expect((await issueDetail(contributor, id))?.issue.version).toBe(1);
    expect((await issueDetail(contributor, id))?.issue.content.priority).toBe("MEDIUM");
  });
  it("Editor dapat membuat dan menerbitkan isu dalam satu transaksi", async () => {
    const fastId = await createIssue(editor, { ...content(), title: `Jalur cepat ${randomUUID()}` }, undefined, false, undefined, true);
    expect((await issueDetail(reader, fastId))?.issue.publishedVersion).toBe(1);
    expect(await db.auditEvent.count({ where: { entityId: fastId, action: { in: ["ISSUE_CREATE", "ISSUE_PUBLISH"] } } })).toBe(2);
  });
  it("Reader, Admin dan Contributor lain tidak dapat membaca draft", async () => {
    for (const a of [reader, admin, other]) {
      expect(await issueDetail(a, id)).toBeNull();
      expect(await listIssues(a, { q: tag })).toHaveLength(0);
    }
    expect(await issueDetail(approver, id)).not.toBeNull();
  });
  it("menolak mutasi dan penugasan oleh aktor tanpa kewenangan", async () => {
    await expect(
      mutateIssue(other, id, 1, "edit", content()),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      mutateIssue(contributor, id, 1, "publish"),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      mutateIssue(contributor, id, 1, "edit", {
        ...content(),
        ownerId: other.id,
      }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(createIssue(reader, content())).rejects.toMatchObject({
      status: 403,
    });
  });
  it("Editor menerbitkan; draft baru tidak mengubah final atau hasil pencarian Reader", async () => {
    await mutateIssue(editor, id, 1, "publish");
    await mutateIssue(contributor, id, 1, "edit", {
      ...content(),
      title: `Judul berubah ${tag}`,
      summary: `rahasiaunik${tag}`,
    });
    expect((await issueDetail(reader, id))?.issue.content.summary).toBe(
      "Ringkasan final",
    );
    expect(await listIssues(reader, { q: `rahasiaunik${tag}` })).toHaveLength(
      0,
    );
    expect((await issueDetail(contributor, id))?.issue.id).toBe(id);
  });
  it("dua simpan serentak hanya satu berhasil dan histori tidak hilang", async () => {
    const results = await Promise.allSettled([
      mutateIssue(contributor, id, 2, "edit", {
        ...content(),
        summary: "Simpan pertama",
      }),
      mutateIssue(contributor, id, 2, "edit", {
        ...content(),
        summary: "Simpan kedua",
      }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect(await db.issueRevision.count({ where: { recordId: id } })).toBe(3);
  });
  it("peringatan duplikat nonblokir dan tidak membocorkan isu di luar penugasan", async () => {
    await expect(
      createIssue(contributor, { ...content(), title: `  LAYANAN   ${tag}  ` }),
    ).rejects.toMatchObject({
      code: "DUPLICATE",
    });
    const accepted = await createIssue(contributor, content(), undefined, true);
    expect(accepted).not.toBe(id);
  });
  it("dua update tersusun menurut tanggal peristiwa; sumber dan catatan material tersimpan", async () => {
    const base = {
      ...content(),
      title: "Update lama",
      date: "2026-11-01",
      body: "Peristiwa pertama",
      sources: [{ title: "Sumber sintetis", url: "https://example.test/a" }],
    };
    updateId = await createIssue(contributor, base, id);
    await createIssue(
      contributor,
      {
        ...base,
        title: "Update baru",
        date: "2026-11-03",
        material: false,
        body: "",
      },
      id,
    );
    const d = await issueDetail(contributor, id);
    expect(d!.updates.map((u) => u.content.date)).toEqual([
      "2026-11-03",
      "2026-11-01",
    ]);
    expect(d!.updates[0].content.material).toBe(false);
    expect(d!.updates[1].content.sources).toHaveLength(1);
    expect((await issueDetail(reader, id))!.updates).toHaveLength(0);
  });
  it("pencarian update mengikuti versi terbit dan histori revisi immutable", async () => {
    await mutateIssue(editor, updateId, 1, "publish");
    expect(
      (await listIssues(reader, { q: "Peristiwa pertama" })).some(
        (i) => i.id === id,
      ),
    ).toBe(true);
    await mutateIssue(contributor, updateId, 1, "edit", {
      ...content(),
      date: "2026-11-01",
      body: `draftunik${tag}`,
      title: "Revisi update",
    });
    expect(await listIssues(reader, { q: `draftunik${tag}` })).toHaveLength(0);
    expect((await issueDetail(reader, id))!.updates[0].content.body).toBe(
      "Peristiwa pertama",
    );
    await expect(
      db.issueRevision.update({
        where: { recordId_version: { recordId: updateId, version: 1 } },
        data: { searchText: "rusak" },
      }),
    ).rejects.toThrow();
  });
  it("FK pointer menolak nomor revisi yang tidak dimiliki objek", async () => {
    await expect(
      db.$executeRaw`UPDATE "IssueRecord" SET "publishedVersion"=999 WHERE id=${id}`,
    ).rejects.toThrow();
  });
  it("penugasan Editor memberi akses Contributor yang ditugaskan", async () => {
    const d = await issueDetail(editor, id);
    await mutateIssue(editor, id, d!.issue.version, "edit", {
      ...d!.issue.content,
      assigneeId: other.id,
    });
    expect(await issueDetail(other, id)).not.toBeNull();
  });
  it("kegagalan audit membatalkan revisi dan pointer dalam transaksi yang sama", async () => {
    const before = await issueDetail(editor, id);
    const functionName = `test_issue_audit_${tag}`;
    await db.$executeRawUnsafe(
      `CREATE FUNCTION ${functionName}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Kegagalan audit sintetis'; END $$`,
    );
    await db.$executeRawUnsafe(
      `CREATE TRIGGER ${functionName} BEFORE INSERT ON "AuditEvent" FOR EACH ROW WHEN (NEW."entityId" = '${id}' AND NEW.action = 'ISSUE_EDIT') EXECUTE FUNCTION ${functionName}()`,
    );
    try {
      await expect(
        mutateIssue(editor, id, before!.issue.version, "edit", {
          ...before!.issue.content,
          summary: "Perubahan yang harus rollback",
        }),
      ).rejects.toThrow();
      const after = await issueDetail(editor, id);
      expect(after!.issue.version).toBe(before!.issue.version);
      expect(after!.issue.content.summary).toBe(before!.issue.content.summary);
      expect(after!.history.length).toBe(before!.history.length);
    } finally {
      await db.$executeRawUnsafe(
        `DROP TRIGGER ${functionName} ON "AuditEvent"`,
      );
      await db.$executeRawUnsafe(`DROP FUNCTION ${functionName}()`);
    }
  });
  it("filter kategori/status/pemilik/tanggal memakai final; Archived tetap terbaca", async () => {
    const c = {
      ...content(),
      title: `Arsip ${tag}`,
      status: "ARCHIVED" as const,
      date: "2026-11-02",
    };
    const archived = await createIssue(editor, c);
    await mutateIssue(editor, archived, 1, "publish");
    const f = {
      q: `Arsip ${tag}`,
      category: "layanan-publik",
      status: "ARCHIVED",
      owner: contributor.id,
      from: "2026-11-01",
      to: "2026-11-03",
    };
    expect((await listIssues(reader, f)).map((r) => r.id)).toContain(archived);
    expect(await listIssues(reader, { ...f, from: "2026-11-03" })).toHaveLength(
      0,
    );
    expect(await listIssues(reader, { ...f, status: "ACTIVE" })).toHaveLength(
      0,
    );
  });
  it("akun nonaktif tidak dapat memutasi lewat layanan", async () => {
    await db.user.update({ where: { id: other.id }, data: { active: false } });
    const d = await issueDetail(editor, id);
    await expect(
      mutateIssue(other, id, d!.issue.version, "edit", d!.issue.content),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("soft delete update menjaga revisi dan audit; penarikan induk menutup akses final", async () => {
    await mutateIssue(editor, updateId, 2, "delete");
    expect(
      await db.issueRevision.count({ where: { recordId: updateId } }),
    ).toBe(2);
    expect(
      (await issueDetail(contributor, id))!.history.some(
        (h) => h.recordId === updateId,
      ),
    ).toBe(true);
    const d = await issueDetail(editor, id);
    await mutateIssue(editor, id, d!.issue.version, "withdraw");
    expect(await issueDetail(reader, id)).toBeNull();
    await mutateIssue(editor, id, d!.issue.version, "delete");
    expect(await issueDetail(editor, id)).toBeNull();
    expect(
      await db.issueRevision.count({ where: { recordId: id } }),
    ).toBeGreaterThan(1);
  });
});
