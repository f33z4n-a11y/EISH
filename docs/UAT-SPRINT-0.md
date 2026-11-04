# Panduan UAT Sprint 0 untuk Product Owner

Tanggal pemeriksaan: 4 November 2026 (WIB). Versi aplikasi yang diuji: `85dfa44bbc0b178589c2e0c02f14a001362a40f6`, sudah masuk `main` melalui merge commit `47aa32b`. Tujuan: PO dapat masuk melalui browser, memeriksa navigasi dan pembatasan akses, lalu menerima hasil Sprint 0 atau meminta perbaikan.

Hanya data sintetis. Sprint 1 tidak dimulai. Tidak ada deployment produksi, pembukaan database publik, atau merge PR oleh pemeriksa pada tugas UAT ini.

## 1. Pilih cara membuka aplikasi

### Desktop/browser bersama di Codex — bersyarat, belum terverifikasi dari sisi PO

Runtime melaporkan `remote_desktop.enabled=true`, tetapi statusnya `unknown`. Chat ini tidak menyediakan alat NodeREPL desktop, pembuka panel desktop, atau pembuat URL preview/port forwarding. Karena itu belum ada URL preview publik atau bukti bahwa PO dapat membuka browser cloud dari antarmukanya. Screenshot dan browser otomatis bukan pengganti akses interaktif PO.

Jika antarmuka Codex Anda menawarkan tombol/panel **Desktop** atau **Browser** untuk environment ini:

1. Buka viewer resmi tersebut dengan akun Anda yang berwenang. Menurut deskripsi kemampuan runtime, koneksi viewer dapat memulai desktop on demand.
2. Di browser dalam desktop environment yang sama, masukkan `http://localhost:3000/login` ke bilah alamat. Ini alamat di environment cloud, bukan browser komputer pribadi Anda.
3. Pastikan halaman login EISH muncul. Bila gagal, laporkan tahap gagal tanpa menyertakan rahasia; jangan membuka port database atau memakai tunnel pihak ketiga untuk mengatasinya.
4. Login menggunakan akun sintetis dan kredensial lokal yang hanya dapat Anda akses secara privat di environment berwenang. Jika tidak tersedia akses privat tersebut, gunakan jalur lokal agar kredensial dibuat di komputer Anda sendiri.

Langkah desktop di atas adalah petunjuk bersyarat, belum dinyatakan berhasil. Jangan menganggap alamat localhost di browser komputer pribadi menunjuk ke mesin Codex Cloud. `APP_URL` saat ini cocok dengan origin localhost; URL proxy preview yang berbeda belum dikonfigurasi atau diuji dan dapat ditolak perlindungan Origin/CSRF. Jangan menonaktifkan perlindungan ini.

### Komputer sendiri — jalur yang dapat disiapkan tanpa preview cloud

Aplikasi berjalan di komputer Anda dan dibuka di browser biasa. Docker hanya menjalankan PostgreSQL; database tetap terikat `127.0.0.1:5432`. Tidak perlu hosting, domain, layanan pemerintah atau publikasi cloud.

Untuk persiapan satu kali, minta rekan TI membantu memasang **Git, Node.js 24, dan Docker Desktop dengan Compose**, lalu jalankan langkah bagian 2. Setelah itu, tugas PO cukup membuka browser dan mengikuti tabel UAT bagian 4.

## 2. Persiapan lokal satu kali — untuk PO dengan bantuan TI

Buka Terminal/PowerShell di folder kerja pribadi. Gunakan folder baru agar tidak mengubah pekerjaan lain:

```bash
git clone https://github.com/f33z4n-a11y/EISH.git EISH-UAT
cd EISH-UAT
git switch --detach 85dfa44bbc0b178589c2e0c02f14a001362a40f6
```

Login GitHub melalui mekanisme resmi bila repositori privat. Perintah checkout mengunci versi Sprint 0 yang diuji; jangan menyalin token GitHub ke chat. Jika folder EISH-UAT sudah ada, jangan menimpanya; gunakan folder baru atau minta TI memeriksa checkout yang sudah ada.

### Buat konfigurasi privat tanpa menampilkan nilainya

Perintah Node berikut dapat ditempel sebagai satu perintah di Terminal atau PowerShell. Ia menghasilkan nilai acak di `.env` dan **menolak menimpa `.env` yang sudah ada**:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; import { writeFileSync } from 'node:fs'; const db = randomBytes(24).toString('hex'); const lines = ['POSTGRES_USER=eish', 'POSTGRES_DB=eish', 'POSTGRES_PASSWORD=' + db, 'DATABASE_URL=postgresql://eish:' + db + '@localhost:5432/eish?schema=public', 'APP_URL=http://localhost:3000', 'AUTH_SECRET=' + randomBytes(48).toString('hex'), 'SEED_PASSWORD=' + randomBytes(18).toString('hex')]; writeFileSync('.env', lines.join('\n') + '\n', { flag: 'wx', mode: 0o600 }); console.log('Konfigurasi privat dibuat; nilainya tidak ditampilkan.');"
```

`.env` diabaikan Git. Simpan di komputer pribadi dengan akses terbatas; jangan unggah ke GitHub, kirim ke chat, atau sertakan dalam tangkapan layar. Jika muncul `EEXIST`, berkas sudah ada: periksa bersama TI, jangan hapus atau buat ulang tanpa memahami database yang memakainya. Mengganti SEED_PASSWORD tidak mereset password akun seed yang sudah dibuat.

### Siapkan database dan jalankan aplikasi

Pastikan Docker Desktop sudah aktif. Jalankan satu per satu dari folder EISH-UAT:

```bash
npm ci
npm run db:generate
docker compose up -d db --wait
npm run db:migrate
npm run db:seed
npx next dev --hostname 127.0.0.1 --port 3000
```

Biarkan terminal terakhir tetap terbuka. Sekarang buka **`http://localhost:3000/login`** di browser komputer yang sama. Jangan mengganti hostname menjadi alamat lain: origin harus cocok dengan APP_URL. App dan database tetap lokal; jangan mengubah binding database menjadi `0.0.0.0`.

Jika port 3000/5432 sudah dipakai atau koneksi database gagal, minta TI memeriksa layanan yang berjalan. Jangan menghentikan atau menghapus database lain secara sembarang. Untuk cache Prisma baca-saja di cloud, lihat README; workaround cloud itu biasanya tidak diperlukan pada komputer pribadi.

### Menghentikan dan membuka kembali

Tekan Ctrl+C pada terminal aplikasi untuk menghentikannya. `docker compose stop db` menghentikan database tanpa menghapus data. Untuk melanjutkan UAT, jalankan kembali `docker compose up -d db --wait` lalu `npx next dev --hostname 127.0.0.1 --port 3000`.

Jangan memakai `docker compose down -v` untuk UAT karena dapat menghapus seluruh data dummy. Tidak perlu mengulang clone, membuat .env, atau seed setiap membuka browser.

## 3. Akun pengujian

| Username sintetis | Alternatif email | Tujuan |
|---|---|---|
| reader | reader@example.test | Pembaca, tanpa akses Administrasi |
| contributor | contributor@example.test | Kontributor Monitoring |
| editor | editor@example.test | Editor |
| approver | approver@example.test | Katim/Approver |
| admin | admin@example.test | Admin Sistem; membuat akun dasar |

Sandi tidak dicantumkan dalam panduan ini. Pada komputer sendiri, lihat nilai `SEED_PASSWORD` di `.env` menggunakan editor lokal secara privat; nilai itu digunakan untuk lima akun baru hasil seed. Jangan mengirim atau menampilkan nilainya dalam laporan UAT. Tidak ada email yang dikirim ke alamat example.test.

Gunakan Keluar sebelum berganti akun, atau gunakan jendela privat terpisah. Saat menguji login salah, cukup satu percobaan; pembatasan lima percobaan per pengenal per 15 menit tetap aktif. Jika dibatasi, tunggu jendela berakhir dan jangan menonaktifkan limiter.

## 4. Checklist UAT untuk PO

Isi hasil dengan **Lulus / Gagal / Belum diuji**. Tidak memerlukan Developer Tools atau perintah database.

| ID | Langkah sederhana | Hasil yang diharapkan | Hasil PO |
|---|---|---|---|
| U0-01 | Sebelum login, ketik `/dashboard` atau `/issues` setelah alamat aplikasi | Diarahkan ke halaman login; tidak ada konten terlindungi | Belum diuji |
| U0-02 | Masuk menggunakan username reader dan sandi lokal | Beranda terbuka, label Pembaca tampil | Belum diuji |
| U0-03 | Keluar, lalu masuk dengan email reader@example.test | Akun Pembaca yang sama terbuka | Belum diuji |
| U0-04 | Keluar dan coba sekali dengan sandi yang sengaja salah | Login ditolak dengan pesan umum, tidak masuk beranda | Belum diuji |
| U0-05 | Login Reader; coba Beranda, Isu, Briefing, Pernyataan dan Arsip | Navigasi berfungsi; halaman kosong menjelaskan belum ada konten; menu Administrasi tidak tampil | Belum diuji |
| U0-06 | Saat masih Reader, ketik `/admin` pada bilah alamat | Kembali ke beranda dengan pesan tidak memiliki izin; formulir Admin tidak terlihat | Belum diuji |
| U0-07 | Klik Keluar, lalu ketik `/dashboard` dan muat ulang | Login diminta kembali | Belum diuji |
| U0-08 | Login sebagai contributor, editor, dan approver bergantian | Label peran sesuai; ketiganya tidak memiliki menu/akses Administrasi | Belum diuji |
| U0-09 | Login Admin dan buka Administrasi | Formulir penyediaan akun terlihat; role yang ditawarkan hanya Reader/Contributor/Editor, bukan Approver/Admin | Belum diuji |
| U0-10 | Buat satu akun sintetis dengan nama/email example.test/username unik dan sandi privat minimal 12 karakter ASCII; pilih Reader. Keluar lalu login dengan akun baru | Pesan akun berhasil dibuat, akun baru dapat masuk sebagai Pembaca; tidak menerima akses Admin | Belum diuji |
| U0-11 | Persempit jendela browser atau gunakan mode tampilan ponsel; coba navigasi dan Keluar | Teks/form tetap terbaca, tombol dapat dipakai; navigasi dapat digeser bila perlu | Belum diuji |
| U0-12 | Di halaman login tekan Tab berulang; gunakan Enter untuk tombol | Fokus terlihat, label/form dapat dijangkau, tautan lewati navigasi tersedia | Belum diuji |

Batas sandi: maksimal 72 byte UTF-8; untuk UAT gunakan sandi sintetis ASCII agar tidak membingungkan batas byte/karakter. Pilih sendiri, jangan menyalin nilai sandi ke formulir laporan.

### Pemeriksaan session tambahan

Opsional manual: setelah login, tutup tab aplikasi tanpa logout, tunggu lebih dari 30 menit tanpa mengakses aplikasi, kemudian buka lagi `/dashboard`; login harus diminta. Batas absolut 8 jam, akun nonaktif, dan perubahan role sudah diuji otomatis; PO tidak perlu menunggu delapan jam atau mengubah database. Jangan menyatakan pengujian waktu nyata delapan jam telah dilakukan hanya berdasarkan tes batas waktu otomatis.

## 5. Hal yang belum termasuk Sprint 0

Halaman isu/briefing/pernyataan/arsip memang belum memiliki CRUD, pencarian, persetujuan, salin statement approved, ekspor atau data terbit. Itu bukan kegagalan Sprint 0. Katim belum memiliki tombol approval karena workflow baru dibangun Sprint 2/3. Admin belum memiliki UI nonaktif akun atau pemberian role privileged; validasi nonaktif akun sudah diuji di server. Pemulihan password belum tersedia. Jangan memakai data pemerintah nyata untuk mengisi kekosongan ini.

## 6. Melaporkan hasil dan persetujuan

Untuk masalah: tulis ID UAT, peran yang dipakai, langkah singkat, hasil yang diharapkan, hasil sebenarnya, dan screenshot yang tidak menampilkan sandi/rahasia. Jangan lampirkan `.env`, cookie, token, body login atau log mentah yang belum disaring.

Format keputusan PO:

- Versi/commit yang diuji:
- Tanggal dan browser/perangkat:
- ID lulus:
- ID gagal dan catatan:
- ID belum diuji:
- Keputusan: Diterima / Perlu perbaikan / Belum dapat diputuskan.

Merge teknis bukan pengganti penerimaan PO. Persetujuan UAT Sprint 0 juga tidak otomatis memberi izin membangun Sprint 1; fase berikut dimulai setelah instruksi eksplisit.

## 7. Hasil verifikasi ulang oleh asisten

Dijalankan pada 4 November 2026, versi aplikasi `85dfa44`, tanpa menampilkan sandi/token:

| Pemeriksaan | Hasil |
|---|---|
| App dan PostgreSQL Docker | Sehat; port host hanya 127.0.0.1:3000 dan 127.0.0.1:5432 |
| Server development lokal | Login Reader, beranda terlindungi dan logout lulus; proses sementara bind loopback port 3001 dihentikan setelah tes, tanpa mengubah APP_URL tersimpan |
| Lima akun seed | Aktif, role sesuai, sandi lokal cocok dengan hash; tidak dicetak |
| `npm run lint` | Lulus |
| `npm run typecheck` | Lulus |
| `npm test` | 13 lulus: 5 unit + 8 integrasi PostgreSQL; tidak ada yang dilewati |
| `npm run build` | Lulus |
| `npm run test:e2e` | 7 lulus di Chromium; menggunakan aplikasi Docker yang sudah berjalan dan database sintetis |
| CI PR #3 | Dua check `periksa` selesai SUCCESS |
| Status PR #3 | MERGED menurut GitHub, bukan tindakan merge pada tugas ini |
| Preview cloud interaktif PO | Kemampuan desktop dinyatakan tersedia oleh runtime; status unknown, alat pembuka tidak tersedia; belum terverifikasi dari sisi PO |

Tautan CI yang diverifikasi:

- [CI push berhasil](https://github.com/f33z4n-a11y/EISH/actions/runs/41798178291/job/126467183990)
- [CI pull request berhasil](https://github.com/f33z4n-a11y/EISH/actions/runs/41798269791/job/126467479040)
- [Pull Request #3](https://github.com/f33z4n-a11y/EISH/pull/3)

Hasil otomatis adalah bukti teknis; kolom penerimaan manual PO tetap belum diuji sampai Anda menjalankannya. Panduan ini tidak mengklaim preview sudah dibuka PO, deployment publik, atau penerimaan produk.
