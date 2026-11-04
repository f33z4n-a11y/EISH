import { test, expect } from "@playwright/test";
const password = process.env.SEED_PASSWORD;
async function login(
  page: import("@playwright/test").Page,
  identifier: string,
) {
  if (!password) throw new Error("Isi SEED_PASSWORD sintetis untuk E2E.");
  await page.goto("/login");
  await page.getByLabel("Email atau username").fill(identifier);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
test("anonim diarahkan ke login; formulir dapat dicapai keyboard", async ({
  page,
}) => {
  await page.goto("/issues");
  await expect(page).toHaveURL(/\/login$/);
  await page.keyboard.press("Tab");
  await expect(page.getByText("Lewati navigasi")).toBeFocused();
  await page.getByLabel("Email atau username").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
});
test("Reader login username, navigasi mobile, akses admin ditolak dan logout membatalkan session", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "reader");
  await expect(page.getByRole("link", { name: "Administrasi" })).toHaveCount(0);
  await page.getByRole("link", { name: "Isu", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Isu", exact: true }),
  ).toBeVisible();
  await page.goto("/admin");
  await expect(
    page.getByRole("alert").filter({ hasText: "tidak memiliki izin" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
test("Admin login email dan membuat akun; role Approver tidak tersedia di formulir", async ({
  page,
}) => {
  await login(page, "admin@example.test");
  await page.getByRole("link", { name: "Administrasi" }).click();
  await expect(
    page.locator('select[name="role"] option[value="APPROVER"]'),
  ).toHaveCount(0);
  const username = `e2e-${Date.now()}`;
  await page.getByLabel("Nama", { exact: true }).fill("Akun Sintetis E2E");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`${username}@example.test`);
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password awal").fill(password!);
  await page.getByRole("button", { name: "Buat akun", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("berhasil dibuat");
});
test("mutasi lintas origin dan akses API anonim ditolak", async ({
  request,
}) => {
  const csrf = await request.post("/api/auth/login", {
    headers: { Origin: "https://asing.example" },
    form: { identifier: "reader", password: "salah" },
  });
  expect(csrf.status()).toBe(403);
  const anon = await request.post("/api/admin/users", {
    headers: { Origin: process.env.APP_URL ?? "http://localhost:3000" },
    form: {},
  });
  expect(anon.status()).toBe(401);
});

for (const username of ["contributor", "editor", "approver"]) {
  test(`akun sintetis ${username} dapat masuk tanpa akses administrasi`, async ({
    page,
  }) => {
    await login(page, username);
    await expect(page.getByRole("link", { name: "Administrasi" })).toHaveCount(
      0,
    );
    const blocked = await page.request.post("/api/admin/users", {
      headers: { Origin: process.env.APP_URL ?? "http://localhost:3000" },
      form: {},
    });
    expect(blocked.status()).toBe(403);
  });
}
