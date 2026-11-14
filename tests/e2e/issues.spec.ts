import { test, expect } from "@playwright/test";
import { hash } from "bcryptjs";
import { db } from "../../src/lib/db";
test("UAT-01/02: isu, timeline, final Reader, konflik dan pencarian aman", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const readerContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const reader = await readerContext.newPage();
  const password = process.env.SEED_PASSWORD!;
  const tag = Date.now().toString();
  const accounts: Record<string, string> = {};
  const passwordHash = await hash(password, 12);
  for (const role of ["CONTRIBUTOR", "EDITOR", "READER"] as const) {
    const username = `s1-${role.toLowerCase()}-${tag}`;
    await db.user.create({
      data: {
        name: `Uji Browser ${role}`,
        username,
        email: `${username}@example.test`,
        passwordHash,
        roles: { create: { role } },
      },
    });
    accounts[role.toLowerCase()] = username;
  }
  await db.$disconnect();
  async function login(p: typeof page, username: string) {
    await p.goto("/login");
    await p.getByLabel("Email atau username").fill(accounts[username]);
    await p.getByLabel("Password", { exact: true }).fill(password);
    await p.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(p).toHaveURL(/\/dashboard$/);
  }
  await login(page, "contributor");
  await page.goto("/issues");
  await page.getByRole("link", { name: /Buat isu/, exact: true }).click();
  await page
    .getByLabel("Judul isu", { exact: true })
    .fill(`Isu sintetis ${tag}`);
  await page
    .getByLabel("Kategori", { exact: true })
    .selectOption("k09-komunikasi-publik");
  await page.getByLabel("Ringkasan manual").fill("Ringkasan awal **final**");
  await page
    .getByLabel("Latar belakang")
    .fill("- Catatan pertama\n- Catatan kedua");
  await page
    .getByLabel("Sumber referensi")
    .fill("Sumber awal | https://example.test/awal");
  await page.getByRole("button", { name: "Simpan draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: `Isu sintetis ${tag}`, exact: true }),
  ).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await login(reader, "reader");
  await reader.goto(`/issues/${id}`);
  await expect(
    reader.getByRole("heading", { name: `Isu sintetis ${tag}` }),
  ).toHaveCount(0);
  const draft = await reader.request.get(`/api/issues/${id}`);
  expect(draft.status()).toBe(404);
  for (const date of ["2026-11-01", "2026-11-03"]) {
    await page
      .getByRole("link", { name: "Tambah perkembangan", exact: true })
      .click();
    await page
      .getByLabel("Judul perkembangan (opsional)")
      .fill(`Peristiwa ${date}`);
    await page.getByLabel("Tanggal peristiwa").fill(date);
    await page
      .getByLabel("Isi perkembangan")
      .fill(`perkembanganuji${tag} tanggal ${date}`);
    await page
      .getByLabel("Sumber referensi")
      .fill(
        "Sumber satu | https://example.test/satu\nSumber dua | https://example.test/dua",
      );
    await page
      .getByRole("button", { name: "Simpan draft", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/issues/${id}$`));
  }
  const timeline = page.locator("details.timeline-item > summary");
  await expect(timeline.nth(0)).toContainText("2026-11-03");
  await expect(timeline.nth(1)).toContainText("2026-11-01");
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await login(page, "editor");
  await page.goto(`/issues/${id}`);
  await page
    .getByRole("button", { name: "Terbitkan isu", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Revisi kerja 1 · Revisi terbit 1.", { exact: false }),
  ).toBeVisible();
  for (let i = 0; i < 2; i++) {
    const article = page.locator("details.timeline-item").nth(i);
    await article.locator("summary").click();
    await article
      .getByRole("button", { name: "Terbitkan isu", exact: true })
      .click();
    await expect(
      article.getByText("Revisi kerja 1 · Terbit 1", { exact: true }),
    ).toBeVisible();
  }
  await reader.goto(`/issues/${id}`);
  await expect(
    reader.getByRole("heading", { name: `Isu sintetis ${tag}` }),
  ).toBeVisible();
  await expect(reader.locator("details.timeline-item")).toHaveCount(2);
  expect(
    await reader.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await reader.screenshot({
    path: "test-results/sprint1-reader-mobile.png",
    fullPage: true,
  });
  await expect(
    reader.getByRole("link", { name: "Sunting isu", exact: true }),
  ).toHaveCount(0);
  for (const item of await reader.locator("details.timeline-item").all())
    await item.locator("summary").click();
  await expect(reader.getByRole("link", { name: "Sumber satu" })).toHaveCount(
    2,
  );
  await expect(
    reader.locator("strong").filter({ hasText: "final" }),
  ).toBeVisible();
  await reader.goto(`/issues?q=perkembanganuji${tag}`);
  await expect(
    reader.getByRole("link", { name: `Isu sintetis ${tag}`, exact: true }),
  ).toBeVisible();
  await page.goto(`/issues/${id}/edit`);
  const second = await context.newPage();
  await second.goto(`/issues/${id}/edit`);
  await page.getByLabel("Judul isu", { exact: true }).fill(`Judul baru ${tag}`);
  await page.getByLabel("Ringkasan manual").fill(`drafttersembunyi${tag}`);
  await page.getByRole("button", { name: "Simpan draft", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/issues/${id}$`));
  await second.getByLabel("Ringkasan manual").fill("Input konflik tetap ada");
  await second
    .getByRole("button", { name: "Simpan draft", exact: true })
    .click();
  await expect(
    second.getByRole("alert").filter({ hasText: "Data sudah berubah" }),
  ).toBeVisible();
  await expect(second.getByLabel("Ringkasan manual")).toHaveValue(
    "Input konflik tetap ada",
  );
  await reader.goto(`/issues?q=drafttersembunyi${tag}`);
  await expect(
    reader.getByRole("link", { name: `Judul baru ${tag}`, exact: true }),
  ).toHaveCount(0);
  const json = await (await reader.request.get(`/api/issues/${id}`)).text();
  expect(json).not.toContain(`drafttersembunyi${tag}`);
  expect(json).not.toContain(`Judul baru ${tag}`);
  const denied = await reader.request.post(`/api/issues/${id}`, {
    headers: { Origin: "http://localhost:3000" },
    data: { action: "publish", version: 2 },
  });
  expect(denied.status()).toBe(403);
  await page
    .getByRole("button", { name: "Terbitkan perubahan 2", exact: true })
    .click();
  await expect(
    page.getByText("Revisi kerja 2 · Revisi terbit 2.", { exact: false }),
  ).toBeVisible();
  await reader.goto(`/issues/${id}`);
  await expect(
    reader.getByRole("heading", { name: `Judul baru ${tag}` }),
  ).toBeVisible();
  await expect(
    reader.getByText(`drafttersembunyi${tag}`, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tarik publikasi", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Revisi kerja 2 · Belum diterbitkan.", { exact: false }),
  ).toBeVisible();
  expect((await reader.request.get(`/api/issues/${id}`)).status()).toBe(404);
  await context.close();
  await readerContext.close();
});
