# Laporan kemajuan Sprint 4 — Portal, pencarian terpadu dan penguatan

Tanggal: 13 November 2026. PO meminta pekerjaan Sprint 4 dilanjutkan. Implementasi ini tetap lokal dengan data sintetis; tidak mengotorisasi data nyata, pilot, atau deployment produksi.

## Hasil yang sudah diterapkan

- Beranda mengambil proyeksi final secara eksplisit: isu perlu perhatian, isu terbit terbaru, briefing terbit terbaru, dan Standby Statement approved yang sedang berlaku.
- Arsip melakukan pencarian terpadu pada isu/perkembangan, isi briefing, dan Standby Statement. Query domain lebih dulu menerapkan izin; cuplikan baru dibuat dari hasil yang boleh dibaca.
- Administrasi menampilkan akun, status aktif, peran operasional, kategori, dan 100 audit terbaru. Menonaktifkan akun mencabut seluruh session dalam transaksi yang sama.
- Admin dapat mengelola role Reader/Contributor/Editor. Role Approver/Admin tetap tidak diberikan melalui UI karena mandat pemberiannya belum diputuskan.
- Admin dapat menambah serta mengaktifkan/nonaktifkan kategori dengan audit.
- Celah proyeksi Statement diperbaiki: Contributor hanya menerima draft pada isu milik/ditugaskan; draft isu lain tidak muncul melalui daftar atau pencarian terpadu.
- UI administrasi dan tabel audit dibuat responsif serta dapat digulir dengan keyboard.
- “Apa yang Baru” menyimpan checkpoint per pengguna saat beranda dibuka dan menampilkan empat jenis publikasi yang diputuskan PO.
- Ekspor briefing final tersedia dalam PDF dan DOCX dari snapshot terbit; renderer PDF tidak boleh mengambil URL atau file lokal.
- Backup sintetis menghasilkan checksum dan manifest jumlah record. Restore diuji pada database sementara lalu database uji dihapus.
- Profil terisolasi sesuai volume yang disetujui PO selesai dan seluruh sampel berada di bawah target tiga detik pada MacBook pengembangan.

## Validasi aktual

| Pemeriksaan | Hasil |
|---|---|
| Unit/integrasi PostgreSQL | 39 test lulus, 7 berkas |
| E2E Chromium | 8 test lulus |
| Typecheck | Lulus |
| Lint | Lulus |
| Build Next.js | Lulus |
| QA visual ekspor | PDF dan DOCX dirender; sampel bersih tanpa clipping/overlap |
| Restore sintetis | Lulus; checksum dan jumlah record cocok |
| Profil performa | 10 daftar isu konkuren 29,1 ms; statement 31,9 ms; briefing 3,3 ms; pencarian 45,7 ms |
| `git diff --check` | Lulus |

Chromium Playwright dipasang lokal karena binary versi paket belum tersedia. Tes E2E lama diperbarui agar mengikuti struktur expand/collapse dan wording publikasi yang sekarang digunakan; tidak ada assertion keamanan yang dihapus.

## Batas penerimaan

- Penjadwalan backup harian dan penghapusan setelah 30 hari merupakan tanggung jawab infrastruktur Tim TI; skrip lokal tidak memasang scheduler pada MacBook.
- Safari Mac/iPhone, Chrome Android, Edge, dan pembaca layar manual belum diuji karena otomatisasi saat ini hanya menjalankan Chromium.
- UAT PO dan simulasi migrasi historis sintetis formal masih memerlukan pelaksanaan/penerimaan manusia.
- Hasil performa adalah bukti pada MacBook dan database sementara lokal, bukan SLA produksi.
- Penggunaan data nyata dan deployment produksi tetap tidak diizinkan.

Implementasi teknis Sprint 4 selesai untuk cakupan yang dapat diotomasi lokal. Status siap pilot tetap menunggu UAT PO, verifikasi perangkat/pembaca layar, serta kesiapan operasional Tim TI.
