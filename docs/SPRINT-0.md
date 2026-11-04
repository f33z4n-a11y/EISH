# Laporan Sprint 0 — Fondasi EISH

Tanggal: 4 November 2026. Sumber: [PRD v1.0](EISH_PRD_v1.0.md), khususnya §4, §14 dan NFR-01/02/08/09/10/11. PO menyetujui desain dan autentikasi untuk Sprint 0 melalui percakapan. Sprint 1–4, data nyata dan deployment produksi belum diotorisasi.

## Hasil implementasi

- Next.js 16.4.5, React 19.3.1, TypeScript dan Tailwind; seluruh label UI Bahasa Indonesia, tanggal ditampilkan WIB, navigasi desktop/ponsel dan keadaan kosong.
- Prisma 7.10.1 dengan adapter PostgreSQL; dua migrasi: identitas/peran/session/audit/limiter dan timestamp UTC plus constraint normalisasi. Image PostgreSQL dan Node dipin digest; paket memakai lockfile.
- Login email atau username + password, bcrypt cost 12, batas 72 byte UTF-8, token opaque acak yang hanya disimpan sebagai hash dalam database. Email dan username dinormalisasi; username tanpa @ untuk menghindari ambiguitas lintas pengenal.
- Session idle 30 menit/absolut 8 jam, cookie HttpOnly/SameSite=Lax/Secure pada HTTPS, cek status dan role database pada setiap akses terlindungi, logout membatalkan session server.
- Mutasi memeriksa Origin terhadap APP_URL. Pembatasan percobaan login disimpan PostgreSQL, tidak hanya memori proses. Error login generik.
- Admin dapat membuat akun Reader/Contributor/Editor; tanpa pendaftaran mandiri. Role Approver/Admin tidak dapat diberikan lewat formulir ini. Lima akun sintetis disediakan seed development yang idempoten dan menolak mode produksi.
- Audit login berhasil/gagal, logout dan pembuatan akun; tanpa body password/token. Pengelolaan audit lengkap tetap Sprint 4.
- README, AGENTS.md, .env.example tanpa nilai rahasia, Docker/Compose, konfigurasi CI dan suite pengujian.

Auth.js adalah kandidat pada evaluasi desain, bukan persyaratan produk wajib. Implementasi fondasi memilih session opaque PostgreSQL agar idle, absolut, pencabutan dan status akun diperiksa server. Keputusan teknis ini dijelaskan dalam [desain](TECHNICAL-DESIGN.md); tidak menambahkan provider SSO/OAuth atau fitur produk baru.

## Bukti validasi

| Pemeriksaan | Hasil pada instance lokal |
|---|---|
| Migrasi database kosong | Kedua migrasi berhasil pada database sintetis terpisah `eish_sprint0_check` |
| Migrasi ulang | Tidak ada migrasi tertunda; tidak mengulang operasi destruktif |
| Seed berulang | Dua kali seed pada database kosong tetap menghasilkan tepat lima akun; akun lama tidak direset |
| Unit | 5 test lulus: role, batas session, normalisasi, pembatasan role/input dan Origin |
| Integrasi PostgreSQL | 8 test lulus: login dua pengenal, password salah, nonaktif akun, idle, absolut, perubahan role, pembatasan layanan Admin dan limiter persisten |
| Browser Chromium | 7 test lulus: anonim/keyboard, Reader/mobile/logout, Admin/provisioning, CSRF/API anonim, serta tiga peran operasional lainnya |
| Build Next.js | Lulus setelah pembaruan Prisma |
| Typecheck dan lint | Lulus berurutan; typecheck menjalankan `next typegen` agar dapat digunakan pada checkout baru |
| Audit dependency produksi | `npm audit --omit=dev` melaporkan 0 vulnerabilities |
| Audit seluruh dependency | Tidak ada advisory tinggi setelah upgrade Prisma; masih ada 16 temuan tingkat sedang pada rantai minimatch/tooling lint development |
| Container aplikasi final | Build dari npm ci/lockfile lulus; PostgreSQL dan aplikasi sehat; login Reader, beranda berbasis database, tampilan ponsel dan logout lulus di image standalone non-root |

Perintah terperinci tersedia di [README](../README.md). Tes integrasi tidak dilewati ketika PostgreSQL tidak tersedia. Suite juga dijalankan terhadap database kosong terpisah, selain database kerja sintetis. E2E menggunakan akun dummy dan menambahkan akun uji melalui formulir Admin; tidak mengirim pesan/email atau menghubungi layanan pemerintah.

## Temuan selama validasi

- Sandbox awal tidak dapat mengakses Docker/jaringan; jalur eksekusi yang diizinkan dipakai tanpa mengubah proxy/TLS.
- Cache Prisma awal baca-saja ditangani dengan cache yang dapat ditulis. Prisma kemudian diperbarui dari 6.19.3 ke 7.10.1 untuk menghapus advisory tinggi pada dependency tooling.
- Satu locator E2E awal cocok dengan dua elemen alert (termasuk announcer framework); diperjelas lalu seluruh suite browser lulus. Tidak menghapus assertion akses.
- Typecheck sempat bersamaan dengan server dev yang menulis tipe Next.js; pemeriksaan kemudian dijalankan berurutan. Script typecheck kini membuat tipe rute terlebih dahulu; tipe dev sementara dikecualikan dari pemeriksaan mandiri.

## Batas dan peninjauan berikutnya

Ini fondasi development, bukan aplikasi MVP lengkap. Halaman isu/briefing/statement/arsip hanya keadaan kosong dan keterangan fase; tidak ada CRUD konten, workflow approval, ekspor, pencarian atau dashboard final sesungguhnya. Aturan Katim boleh approve karya sendiri diuji sebagai kebijakan role; transaksi workflow aktual baru pada Sprint 2/3.

Nonaktif akun sudah ditegakkan oleh session server dan dibuktikan integrasi, tetapi antarmuka penonaktifan/pengelolaan peran penuh tetap Sprint 4. Pemulihan password, mandat pemberian role privileged dan SSO belum diputuskan; jangan membuka akses pengguna nyata. Data sintetis dan .env lokal tidak dikirim ke GitHub.

Aksesibilitas awal diuji melalui label semantik, keyboard/fokus dan navigasi ponsel; belum mengklaim audit pembaca layar atau kepatuhan WCAG menyeluruh. GitHub Actions disediakan, tetapi hasil CI remote baru dapat dinyatakan setelah dijalankan di GitHub. Tidak ada klaim SLA, backup-restore MVP, keamanan produksi atau kesiapan pilot.

Gerbang berikutnya: PO meninjau hasil Sprint 0 dan rincian terbuka Q-02/03/04/12/15/17 sebelum Sprint 1 terkait. Jangan melanjutkan fase berikut secara otomatis.
