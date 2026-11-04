import Link from "next/link";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ akses?: string }>;
}) {
  const { akses } = await searchParams;
  const date = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  return (
    <Workspace current="/dashboard">
      <p className="eyebrow">Ruang kerja komunikasi publik</p>
      <h1>Beranda</h1>
      <p className="muted">{date} · WIB</p>
      {akses && (
        <p className="error" role="alert">
          Anda tidak memiliki izin untuk membuka halaman tersebut.
        </p>
      )}
      <div className="notice">
        <strong>Belum ada informasi yang diterbitkan.</strong>
        <p>
          Perkembangan isu, briefing, dan pernyataan final akan tersedia di
          ruang kerja ini setelah diterbitkan.
        </p>
      </div>
      <section className="grid" aria-label="Dokumen dan informasi">
        <article className="card">
          <p className="eyebrow">Apa yang baru</p>
          <h2>Belum ada perkembangan final</h2>
          <p className="muted">
            Informasi yang sudah diterbitkan akan ditampilkan di sini.
          </p>
          <Link href="/issues">Buka daftar isu →</Link>
        </article>
        <article className="card">
          <p className="eyebrow">Briefing</p>
          <h2>Belum ada briefing terbit</h2>
          <p className="muted">
            Briefing final akan tersedia setelah proses persetujuan.
          </p>
          <Link href="/briefings">Buka briefing →</Link>
        </article>
        <article className="card">
          <p className="eyebrow">Pernyataan</p>
          <h2>Belum ada naskah siap digunakan</h2>
          <p className="muted">
            Hanya naskah disetujui dan berlaku yang menjadi pilihan salin utama.
          </p>
          <Link href="/statements">Buka pernyataan →</Link>
        </article>
      </section>
    </Workspace>
  );
}
