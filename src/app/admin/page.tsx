import { Workspace } from "@/components/workspace";
import { requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string }>;
}) {
  await requireRole("ADMIN");
  const { hasil } = await searchParams;
  return (
    <Workspace current="/admin">
      <p className="eyebrow">Administrasi</p>
      <h1>Penyediaan akun</h1>
      <p className="muted">
        Akun disediakan Admin. Pendaftaran mandiri tidak tersedia.
      </p>
      {hasil && (
        <p role="status" className={hasil === "berhasil" ? "notice" : "error"}>
          {hasil === "berhasil"
            ? "Akun berhasil dibuat."
            : "Akun tidak dapat dibuat. Periksa isian dan pastikan email/username belum digunakan."}
        </p>
      )}
      <section className="card mt-6 max-w-xl">
        <h2>Buat akun pengguna</h2>
        <form action="/api/admin/users" method="post">
          <label htmlFor="name">Nama</label>
          <input
            name="name"
            id="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />
          <label htmlFor="email">Email</label>
          <input
            name="email"
            id="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
          <label htmlFor="username">Username</label>
          <input
            name="username"
            id="username"
            required
            minLength={3}
            maxLength={40}
            pattern="[a-zA-Z0-9_.-]+"
            aria-describedby="username-help"
            autoComplete="off"
          />
          <p id="username-help" className="muted text-sm">
            Huruf, angka, titik, garis bawah atau tanda hubung; tanpa @.
          </p>
          <label htmlFor="new-password">Password awal</label>
          <input
            name="password"
            id="new-password"
            type="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
          <label htmlFor="role">Peran</label>
          <select name="role" id="role">
            <option value="READER">Pembaca</option>
            <option value="CONTRIBUTOR">Kontributor Monitoring</option>
            <option value="EDITOR">Editor</option>
          </select>
          <button type="submit">Buat akun</button>
        </form>
      </section>
      <p className="notice">
        Pemberian peran Katim/Approver dan Admin belum tersedia melalui formulir
        ini; kewenangan pemberian peran menunggu keputusan PO. Akun sintetis
        tersedia untuk pengujian lokal.
      </p>
    </Workspace>
  );
}
