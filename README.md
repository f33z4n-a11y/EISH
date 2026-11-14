# EISH — Pusat Isu dan Pernyataan

Aplikasi internal komunikasi publik. Implementasi lokal saat ini mencakup autentikasi, isu/timeline, Standby Statement, briefing, beranda informasi final, pencarian terpadu, dan administrasi dasar Sprint 4. Ekspor briefing, titik acuan “Apa yang Baru”, latihan backup/restore terisolasi, serta keputusan operasional pilot masih belum selesai. Jangan gunakan data nyata atau menerapkan ke produksi.

Sumber kebutuhan: [PRD v1.0](docs/EISH_PRD_v1.0.md). Lihat [desain](docs/TECHNICAL-DESIGN.md), [rencana](docs/IMPLEMENTATION-PLAN.md), [keputusan](docs/OPEN-QUESTIONS.md), serta laporan Sprint 0–4 di folder `docs`.

## Prasyarat

Node.js 24 (versi pengembangan tercatat di `.nvmrc`), npm, Docker dengan Compose. PostgreSQL 17 berjalan lokal melalui Compose; tidak diekspos selain loopback. Paket JavaScript dipin di package-lock.json. Perintah dijalankan dari root repositori.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan isi nilai lokal. Buat `POSTGRES_PASSWORD` acak tanpa karakter URL khusus (misalnya hasil `openssl rand -hex 24`); samakan dengan password pada `DATABASE_URL`. Isi `AUTH_SECRET` acak minimal 32 karakter dan `SEED_PASSWORD` sintetis minimal 12 karakter (maksimal 72 byte UTF-8, tidak diawali `GANTI`). Apit nilai rahasia dengan tanda kutip tunggal, terutama bila mengandung `#` atau `$`, agar tidak dipotong sebagai komentar/variabel. Nilai hex dari `openssl rand -hex 32` menghindari karakter khusus. Jangan menyalin nilai rahasia ke chat atau Git.
2. Jalankan:

   ```bash
   npm ci
   npm run db:generate
   docker compose up -d db --wait
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

3. Buka aplikasi pada port 3000. `APP_URL` harus sama persis dengan origin browser, termasuk protokol dan port, agar pemeriksaan CSRF bekerja. Jangan mengubahnya menjadi URL eksternal untuk mengakali pemeriksaan.

Pada cloud ini, cache Prisma bawaan mungkin baca-saja. Bila demikian gunakan `export XDG_CACHE_HOME=/tmp/eish-cache` sebelum perintah Prisma. Untuk perintah jaringan/Docker gunakan jalur eksekusi yang diizinkan platform; jangan menonaktifkan proxy atau verifikasi TLS.

Seed hanya untuk development/test dan menolak `NODE_ENV=production`. Lima username sintetis: `contributor`, `editor`, `approver`, `reader`, `admin`; email masing-masing `<username>@example.test`. Password diambil dari `SEED_PASSWORD` lokal, tidak disimpan dalam dokumentasi atau kode. Role `approver` mewakili Katim. Pengulangan seed tidak menggandakan akun dan tidak mereset password, status atau peran akun lama. Perubahan `SEED_PASSWORD` setelah akun dibuat tidak mengganti password akun yang ada.

## Akses dan session

- Login menggunakan email atau username + password. Password disimpan sebagai bcrypt cost 12, maksimal 72 byte UTF-8 agar tidak terpotong diam-diam. Username unik, tanpa `@`, dan dinormalisasi huruf kecil; email juga dinormalisasi.
- Session opaque acak 256 bit, hanya hash token di database; cookie HttpOnly, SameSite=Lax, Secure jika `APP_URL` HTTPS. Cookie maksimum 8 jam; server menegakkan idle 30 menit dan batas absolut 8 jam.
- Logout menghapus session server. Akun nonaktif dan perubahan peran diperiksa pada permintaan terlindungi berikutnya, bukan menunggu cookie habis. UI bukan batas otorisasi.
- Percobaan login dibatasi PostgreSQL: 5 per pengenal per 15 menit dan 100 global per 15 menit. Batas global adalah perlindungan awal development; sizing pilot menunggu profil beban. Pesan gagal tidak mengungkap keberadaan akun. Pengujian berulang dapat terkena pembatasan; tunggu jendela berakhir atau gunakan database pengujian baru, jangan mematikan limiter.
- Admin dapat membuat akun Reader/Contributor/Editor; tidak ada pendaftaran mandiri. Pemberian role Approver/Admin melalui UI belum tersedia karena mandat pemberian role belum diputuskan. Nonaktif akun dan pengelolaan peran lengkap melalui UI dijadwalkan Sprint 4; mekanisme server nonaktif akun sudah diuji.
- Tidak ada halaman/function approval pada Sprint 0. Fungsi kebijakan mengizinkan Katim sebagai Approver dan menolak Admin biasa; alur approval aktual diuji saat Sprint 2/3.

## Pengujian

Gunakan database lokal sintetis yang telah dimigrasi dan di-seed. Jangan arahkan tes ke database nyata. Suite integrasi membuat akun unik dan menghapus akun uji miliknya; E2E menambahkan satu akun dummy melalui UI Admin dan mempertahankannya untuk audit.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:performance
```

`npm test` menjalankan unit dan integrasi PostgreSQL; kegagalan database membuat integrasi gagal, bukan dilewati. E2E menjalankan server dev secara otomatis bila belum ada. `SEED_PASSWORD` harus cocok dengan akun seed, dan APP_URL harus menggunakan port 3000 sesuai konfigurasi pengujian. Build produksi lokal dapat dijalankan dengan `npm run build` dan `npm start`; ini bukan penerapan produksi.

## Docker aplikasi

```bash
docker compose --profile aplikasi build app
docker compose --profile aplikasi up -d app
```

Migrasi tetap dijalankan dari host dengan `npm run db:migrate` sebelum memulai app. Image standalone berjalan sebagai user non-root dan tidak memuat `.env`. Hentikan server host pada port 3000 sebelum menjalankan app container. Compose BuildKit memasang CA publik sesi sebagai secret `proxy_ca`; di cloud memakai `CODEX_PROXY_CERT`, di luar cloud memakai CA sistem. Proxy bawaan tetap dipertahankan dan TLS tetap diverifikasi. Sesuaikan path CA sistem jika memakai OS non-Linux.

`docker compose down` menghentikan layanan tanpa menghapus volume database. Jangan memakai `down -v` kecuali sengaja menghapus seluruh data dummy lokal. Backup/restore lengkap dijadwalkan Sprint 4.

## Backup dan restore development

Backup dan latihan restore hanya untuk database sintetis lokal. Dump custom PostgreSQL, manifest checksum, dan laporan disimpan di folder `backups/` yang diabaikan Git.

```bash
npm run db:backup
npm run db:restore-test -- backups/eish-synthetic-<waktu>.dump
```

Restore membuat database sementara `eish_restore_test_<acak>`, memverifikasi checksum serta jumlah record, lalu menghapusnya. Skrip ini bukan prosedur produksi; Tim TI tetap bertanggung jawab atas jadwal harian, retensi 30 hari, RPO 24 jam, dan RTO 8 jam.


## Menggunakan Sprint 1

1. Contributor membuka Isu → Buat isu, memilih kategori awal, mengisi judul/ringkasan/tanggal, lalu menyimpan draft. ID tidak berubah saat judul diganti. Judul serupa memberi peringatan sebelum konfirmasi simpan.
2. Tambah perkembangan dengan tanggal peristiwa, sesi, isi atau catatan tidak ada perkembangan material. Sumber jamak ditulis satu URL per baris; sistem menampilkannya sebagai referensi bernomor. Tidak ada pengambilan URL otomatis atau upload lampiran.
3. Format teks terbatas: `**tebal**`, `*miring*`, baris `- daftar`, `[label](https://alamat)`. Gunakan tombol pratinjau. HTML, gambar dan protokol aktif ditolak.
4. Editor menerbitkan isu, lalu tiap update yang sudah final. Reader hanya melihat revisi terbit; edit berikutnya tetap draft sampai diterbitkan lagi. Riwayat revisi internal dapat dibuka dari detail isu.
5. Editor dapat mengganti pemilik/penugasan, menarik publikasi dan menghapus lunak. Penarikan isu juga menarik update; publikasi ulang tiap update harus eksplisit. Arsip (`Diarsipkan`) tetap terbaca sesuai izin; hapus lunak menyembunyikan objek, tanpa menghapus histori/database.
6. Contributor mengelola milik/ditugaskan. Approver membaca draft internal, tetapi perlu role Contributor/Editor untuk mengedit. Admin tanpa role operasional hanya membaca final. Izin ditentukan kembali di server pada mutasi.
7. Pencarian kata utuh meliputi judul/ringkasan/background/kata kunci/sumber dan isi perkembangan; filter kategori/status/pemilik/tanggal pertama dicatat. Maksimal 100 hasil; persempit pencarian bila diperlukan. Reader tidak mendapat judul/cuplikan/kata draft.
8. Bila dua tab menyimpan versi yang sama, simpan kedua ditolak. Input tetap berada di formulir; buka versi terbaru di tab lain dan gabungkan secara manual. Tidak ada overwrite otomatis.

### Memperbarui instalasi lokal yang sudah ada

Setelah perubahan Sprint 1 tersedia pada branch yang Anda gunakan, hentikan server dengan Control+C. Pertahankan `.env` dan volume database, lalu jalankan dari folder EISH:

```bash
npm ci
npm run db:generate
docker compose up -d db --wait
npm run db:migrate
npm run db:seed
npm run dev
```

Seed tidak mereset akun/password lama. Jangan memakai `docker compose down -v` atau reset migrasi. Pada Mac, bila koneksi Node ke `localhost:5432` gagal tetapi PostgreSQL sehat, gunakan `127.0.0.1` pada `DATABASE_URL`; `APP_URL` tetap origin browser `http://localhost:3000`.

Tes browser memakai akun sintetis tambahan dan menyimpan dokumen/histori uji untuk audit. Trace Playwright dimatikan agar input password/session tidak disimpan. Untuk menguji build lokal tanpa hot reload, hentikan dev server, jalankan `npm run build`, lalu `EISH_E2E_PRODUCTION=1 npm run test:e2e`. Ini bukan deployment produksi. Hindari menjalankan build/typecheck bersamaan dengan dev karena file tipe dihasilkan otomatis.

Server development memakai `next dev --webpack` setelah pengujian menemukan loop hot reload Turbopack pada environment cloud ini. Build tetap memakai compiler bawaan Next.js.
