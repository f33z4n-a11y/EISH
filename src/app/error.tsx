"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="konten">
      <h1>Halaman belum dapat dimuat</h1>
      <p>Terjadi gangguan. Coba kembali atau hubungi Admin Sistem.</p>
      <button onClick={reset}>Coba kembali</button>
    </main>
  );
}
