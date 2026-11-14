import { PasswordField } from "@/components/password-field";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string }>;
}) {
  const { gagal } = await searchParams;
  return (
    <main id="konten" className="login">
      <a className="brand-block" href="/login">
        <span className="brand">SIGAP</span>
        <span className="brand-subtitle">Sistem Intelijen dan Gerak Analisis Publik</span>
      </a>
      <p className="muted">
        Masuk untuk mengakses ruang kerja isu, briefing, dan pernyataan.
      </p>
      <section className="card" aria-labelledby="judul-login">
        <h2 id="judul-login">Masuk ke akun Anda</h2>
        {gagal && (
          <p className="error" role="alert">
            Tidak dapat masuk. Periksa email/username dan password, atau coba
            kembali beberapa saat lagi.
          </p>
        )}
        <form action="/api/auth/login" method="post">
          <label htmlFor="identifier">Email atau username</label>
          <input
            id="identifier"
            name="identifier"
            autoComplete="username"
            required
            maxLength={254}
            autoCapitalize="none"
          />
          <label htmlFor="password">Password</label>
          <PasswordField />
          <button type="submit" className="w-full">
            Masuk
          </button>
        </form>
        <p className="muted text-sm mt-4">
          Akun disediakan oleh Admin Sistem. Hubungi Admin bila Anda belum
          memiliki akses.
        </p>
      </section>
      <p className="muted text-sm mt-5">
        Lingkungan pengembangan · Gunakan data sintetis saja.
      </p>
    </main>
  );
}
