# Laporan Sprint 1 — Isu dan linimasa

Tanggal: 4 November 2026. PO menyetujui aturan hasil peninjauan dan secara eksplisit meminta implementasi Sprint 1. PRD asli tidak diubah. Sprint 2–4, data nyata dan deployment produksi belum diotorisasi.

## Hasil implementasi

- Form/list/detail isu dengan ID stabil, kategori sintetis awal, pemilik/penugasan, ringkasan manual, background, kata kunci, tanggal pertama dicatat, status Active/Monitoring/Resolved/Archived dan flag perhatian terpisah.
- Timeline update bertanggal peristiwa, sesi, penyusun revisi, waktu input/ubah, sumber jamak dan catatan tidak ada perkembangan material. Urutan tanggal terbaru di atas, waktu input menjadi pembeda bila tanggal sama.
- Format Markdown terbatas pada paragraf, tebal, miring, daftar dan tautan HTTP/HTTPS tanpa kredensial. Pratinjau/render memakai elemen React tanpa HTML mentah. Server menolak HTML/gambar/protokol aktif. Sumber tidak diambil otomatis; upload lampiran ditunda sesuai keputusan PO.
- Histori revisi immutable dengan trigger PostgreSQL, FK induk/aktor/kategori dan pointer versi milik objek sendiri. Penomoran versi dan perubahan pointer dikendalikan transaksi; FK pointer diperiksa saat commit sehingga pembuatan induk/revisi tetap atomik.
- Editor menerbitkan revisi isu dan update. Revisi kerja berikutnya tidak menimpa final. Reader hanya menerima revisi terbit; judul, ringkasan, sumber dan hasil pencarian mengikuti proyeksi final. Admin tanpa peran operasional juga hanya final; Approver dapat membaca internal tanpa otomatis mengedit.
- Contributor membuat dan mengubah isu milik/ditugaskan; Editor dapat mengubah penugasan. Otorisasi mutasi mengambil ulang status/peran akun di transaksi. Izin halaman, API dan layanan diperiksa di server.
- Pencarian kata utuh PostgreSQL konfigurasi simple pada isu/update; filter kategori/status/pemilik/tanggal pertama dicatat. Izin diterapkan sebelum pencarian dan hasil, maksimal 100 isu terbaru. Peringatan judul ternormalisasi duplikat nonblokir dan hanya mempertimbangkan judul yang boleh dibaca aktor.
- Optimistic locking menolak penyimpanan versi usang tanpa membuang input formulir. Lock induk sebelum update menyelaraskan publikasi, penugasan dan penghapusan. Audit create/edit/publish/withdraw/delete disimpan dalam transaksi yang sama, dengan jenis objek, aktor, versi, induk dan waktu; tanpa body password/session.
- Editor dapat menarik publikasi dan soft delete isu/update; penarikan induk juga menarik semua update. Archived tetap dapat dibaca sesuai izin. Histori update yang dihapus lunak tersedia pada histori internal induk; isu induk yang dihapus lunak tidak tampil pada UI biasa, tetapi record/revisi/audit tetap disimpan. Tidak ada hapus permanen atau pemulihan otomatis.

## Bukti validasi aktual

| Pemeriksaan | Hasil |
|---|---|
| Lint | Lulus |
| Typecheck termasuk pembuatan tipe Next.js | Lulus |
| Build Next.js | Lulus |
| Unit dan integrasi PostgreSQL | 31 test lulus, 4 berkas; termasuk 13 regresi Sprint 0 |
| Chromium dengan `npm run dev` final | 8 test lulus dalam 54,2 detik: 7 regresi fondasi dan 1 skenario UAT-01/02 menyeluruh |
| Skenario browser Sprint 1 pada build lokal | Lulus terpisah; bukan deployment produksi |
| Migrasi database kosong `eish_sprint1_clean` | Keempat migrasi berhasil |
| Migrasi ulang pada database tersebut | Tidak ada migrasi tertunda |
| Seed ulang pada database tersebut | Berhasil dua kali; kode upsert mempertahankan akun lama; tiga kategori awal tersedia |
| Pemeriksaan patch | `git diff --check` lulus |

Tes baru mencakup tanggal/URL/XSS, ID stabil, audit, Reader/Admin/Contributor lain ditolak pada draft, hak penugasan, publikasi versus draft, pencarian update, sumber, dua tanggal timeline, revisi immutable pada SQL, pointer tidak valid, konflik dua transaksi paralel, akun nonaktif, rollback seluruh revisi/pointer saat audit sengaja gagal, filter final/Archived, serta soft delete dan histori. Pengujian rollback memakai trigger khusus pada database sintetis dan menghapus trigger tersebut setelah pemeriksaan.

Skenario browser membuat akun sintetis unik, membuat isu dan dua update, memeriksa sumber serta format teks, menerbitkan lewat Editor, membaca lewat Reader berukuran 390×844 tanpa overflow horizontal, mencari kata di update, menyimpan dua tab dengan konflik, memastikan draft tidak ada di respons JSON Reader, menolak mutasi Reader dan menarik publikasi. Screenshot hanya tampilan Reader dengan data sintetis; trace Playwright dimatikan supaya password/session tidak direkam. Akun/dokumen uji dipertahankan untuk integritas histori; tes tidak ditujukan pada database nyata.

## Temuan dan penyesuaian

- Build sandbox awal gagal membuka port internal compiler; build bersih pada jalur eksekusi yang diizinkan berhasil dengan TLS/proxy tetap aktif.
- Turbopack development pada instance ini sempat memuat ulang login berulang dan memicu timeout transaksi awal. Alur yang sama lulus pada build lokal dan development webpack; `npm run dev` kini menggunakan opsi resmi `--webpack`. Build tetap menggunakan compiler bawaan Next.js. Tidak menonaktifkan limiter atau assertion untuk meluluskan tes.
- Tes awal sempat membaca `/issues/new` sebelum navigasi detail selesai; kini menunggu heading detail. Locator timeline dibatasi ke heading pertama kartu agar tidak cocok dengan heading sumber. Seluruh suite final kemudian lulus.
- `.env.example` memakai host database IPv4 dan contoh rahasia dalam kutip tunggal. README menjelaskan karakter `#`/`$`, kebutuhan Node 24, serta pembaruan instalasi tanpa reset database.

## Batas penerimaan

Implementasi dan pemeriksaan otomatis selesai untuk cakupan Sprint 1. PO tetap perlu UAT pada MacBook setelah perubahan tersedia di branch yang dipakai. Tidak ada klaim hasil CI GitHub, pemulihan snapshot task baru, audit pembaca layar/WCAG penuh, performa pilot, backup/restore lengkap atau kesiapan produksi. Target formal Q-17 masih terbuka. Briefing, statement, approval, ekspor, dashboard Apa yang Baru dan pencarian lintas dokumen tetap mengikuti sprint berikutnya.

Keputusan PO dicatat pada tambahan Sprint 1 di IMPLEMENTATION-PLAN, OPEN-QUESTIONS dan TECHNICAL-DESIGN. Pernyataan batas Sprint 0 pada bagian lama merupakan catatan historis dan digantikan keputusan Sprint 1 tersebut. Panduan penggunaan dan perintah pembaruan tersedia di README.
