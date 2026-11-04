# EISH — Pusat Isu dan Pernyataan

Aplikasi internal komunikasi publik. Implementasi saat ini **Sprint 0**: login, session PostgreSQL, kebijakan peran, penyediaan akun dasar oleh Admin dan navigasi kosong berbahasa Indonesia. Modul isu, briefing, statement, pencarian serta ekspor belum diimplementasikan. Jangan gunakan data nyata atau menerapkan ke produksi.

Sumber kebutuhan: [PRD v1.0](docs/EISH_PRD_v1.0.md). Lihat [desain](docs/TECHNICAL-DESIGN.md), [rencana](docs/IMPLEMENTATION-PLAN.md), [keputusan](docs/OPEN-QUESTIONS.md), dan [laporan Sprint 0](docs/SPRINT-0.md).

## UAT oleh Product Owner

Ikuti [panduan UAT Sprint 0](docs/UAT-SPRINT-0.md) untuk pilihan browser cloud, persiapan komputer pribadi tanpa membagikan rahasia, checklist login/akses, serta hasil pengujian dan CI yang diverifikasi.

## Prasyarat

Node.js 24 (versi pengembangan tercatat di `.nvmrc`), npm, Docker dengan Compose. PostgreSQL 17 berjalan lokal melalui Compose; tidak diekspos selain loopback. Paket JavaScript dipin di package-lock.json. Perintah dijalankan dari root repositori.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan isi nilai lokal. Buat `POSTGRES_PASSWORD` acak tanpa karakter URL khusus (misalnya hasil `openssl rand -hex 24`); samakan dengan password pada `DATABASE_URL`. Isi `AUTH_SECRET` acak minimal 32 karakter dan `SEED_PASSWORD` sintetis minimal 12 karakter (maksimal 72 byte UTF-8). Jangan menyalin nilai rahasia ke chat atau Git.
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
```

`npm test` menjalankan unit dan integrasi PostgreSQL; kegagalan database membuat integrasi gagal, bukan dilewati. E2E menjalankan server dev secara otomatis bila belum ada. `SEED_PASSWORD` harus cocok dengan akun seed, dan APP_URL harus menggunakan port 3000 sesuai konfigurasi pengujian. Build produksi lokal dapat dijalankan dengan `npm run build` dan `npm start`; ini bukan penerapan produksi.

## Docker aplikasi

```bash
docker compose --profile aplikasi build app
docker compose --profile aplikasi up -d app
```

Migrasi tetap dijalankan dari host dengan `npm run db:migrate` sebelum memulai app. Image standalone berjalan sebagai user non-root dan tidak memuat `.env`. Hentikan server host pada port 3000 sebelum menjalankan app container. Compose BuildKit memasang CA publik sesi sebagai secret `proxy_ca`; di cloud memakai `CODEX_PROXY_CERT`, di luar cloud memakai CA sistem. Proxy bawaan tetap dipertahankan dan TLS tetap diverifikasi. Sesuaikan path CA sistem jika memakai OS non-Linux.

`docker compose down` menghentikan layanan tanpa menghapus volume database. Jangan memakai `down -v` kecuali sengaja menghapus seluruh data dummy lokal. Backup/restore lengkap dijadwalkan Sprint 4.
