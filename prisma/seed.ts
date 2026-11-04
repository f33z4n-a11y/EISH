import "dotenv/config";
import { PrismaClient, RoleCode } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Seed sintetis dilarang di produksi.");
  const password = process.env.SEED_PASSWORD;
  if (
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72 ||
    password.startsWith("GANTI")
  )
    throw new Error("Isi SEED_PASSWORD sintetis minimal 12 karakter.");
  const passwordHash = await hash(password, 12);
  for (const role of Object.values(RoleCode)) {
    await db.role.upsert({
      where: { code: role },
      create: { code: role },
      update: {},
    });
    const username = role.toLowerCase();
    // Pengulangan tidak mereset password/status/peran akun yang sudah ada.
    await db.user.upsert({
      where: { username },
      update: {},
      create: {
        name: `Akun Sintetis ${role}`,
        email: `${username}@example.test`,
        username,
        passwordHash,
        roles: { create: { role } },
      },
    });
  }
  console.log("Seed lima akun sintetis selesai; akun lama tidak diubah.");
}
main()
  .catch(() => {
    console.error(
      "Seed gagal. Periksa konfigurasi lokal dan koneksi database.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
