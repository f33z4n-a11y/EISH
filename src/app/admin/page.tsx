import { Workspace } from "@/components/workspace";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { roleLabels } from "@/lib/policy";
export const dynamic = "force-dynamic";
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string }>;
}) {
  const actor = await requireRole("ADMIN");
  const { hasil } = await searchParams;
  const [users, categories, audits] = await Promise.all([
    db.user.findMany({ include: { roles: true }, orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.auditEvent.findMany({ include: { actor: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <Workspace current="/admin">
      <p className="eyebrow">Administrasi</p>
      <h1>Penyediaan akun</h1>
      <p className="muted">
        Akun disediakan Admin. Pendaftaran mandiri tidak tersedia.
      </p>
      {hasil && (
        <p role="status" className={hasil === "berhasil" ? "notice" : "error"}>
          {hasil === "berhasil" || hasil === "diperbarui"
            ? hasil === "berhasil" ? "Akun berhasil dibuat." : "Perubahan berhasil disimpan."
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
      <section className="card admin-section">
        <h2>Akun dan peran operasional</h2>
        <p className="muted">Perubahan status langsung mencabut seluruh session akun. Role Approver dan Admin tetap tidak dapat diberikan melalui UI.</p>
        {users.map((user) => { const operational = user.roles.find((item) => ["READER", "CONTRIBUTOR", "EDITOR"].includes(item.role))?.role ?? "READER"; return <article className="admin-row" key={user.id}><div><strong>{user.name}</strong><p className="muted">{user.username} · {user.active ? "Aktif" : "Nonaktif"}</p><p>{user.roles.map((item) => roleLabels[item.role]).join(", ")}</p></div><form action={`/api/admin/users/${user.id}`} method="post"><input type="hidden" name="action" value="role"/><label htmlFor={`role-${user.id}`}>Peran operasional</label><select id={`role-${user.id}`} name="role" defaultValue={operational}><option value="READER">Pembaca</option><option value="CONTRIBUTOR">Kontributor Monitoring</option><option value="EDITOR">Editor</option></select><button>Simpan peran</button></form><form action={`/api/admin/users/${user.id}`} method="post"><input type="hidden" name="action" value="toggle"/><input type="hidden" name="active" value={String(!user.active)}/><button disabled={user.id === actor.id}>{user.active ? "Nonaktifkan" : "Aktifkan"}</button></form></article>; })}
      </section>
      <section className="card admin-section"><h2>Kategori isu</h2><form action="/api/admin/categories" method="post"><label htmlFor="category-name">Nama kategori baru</label><input id="category-name" name="name" required minLength={2} maxLength={100}/><button>Tambah kategori</button></form>{categories.map((category) => <div className="admin-row" key={category.id}><p><strong>{category.name}</strong> · {category.active ? "Aktif" : "Nonaktif"}</p><form action={`/api/admin/categories/${category.id}`} method="post"><input type="hidden" name="active" value={String(!category.active)}/><button>{category.active ? "Nonaktifkan" : "Aktifkan"}</button></form></div>)}</section>
      <section className="card admin-section"><h2>100 audit terbaru</h2><div className="audit-table" role="region" aria-label="Audit terbaru" tabIndex={0}><table><thead><tr><th>Waktu</th><th>Pelaku</th><th>Tindakan</th><th>Jenis</th></tr></thead><tbody>{audits.map((audit) => <tr key={audit.id}><td>{audit.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td><td>{audit.actor?.name ?? "Sistem"}</td><td>{audit.action}</td><td>{audit.entityType ?? "-"}</td></tr>)}</tbody></table></div></section>
    </Workspace>
  );
}
