# Rencana Implementasi Bertahap EISH

> Edisi analisis berdasarkan permintaan terbaru. Seluruh rekomendasi memerlukan peninjauan; review terdahulu tidak dianggap sebagai keputusan atau persetujuan.

> Status: Analisis diperbarui 4 November 2026 dengan keputusan PO; desain keseluruhan belum disetujui untuk implementasi.
> Sumber resmi: [EISH_PRD_v1.0.md](EISH_PRD_v1.0.md), PRD v1.0 bagian 1–17; berkas telah dibaca seluruhnya dari GitHub `main` pada commit `8e6804679cc3d2fa5fed56b888f82749b70f2711`. Verifikasi 4 November 2026: 345 blok teks identik dengan DOCX yang digunakan pada analisis awal setelah normalisasi penanda Markdown, spasi, dan penomoran daftar. SHA-256 Markdown: `3568d07503468ad366dc9b7d5809d98681baf7657f10aa932c06b47a012c3904`. PRD asli tidak diubah; tidak diperlukan pengulangan analisis karena tidak ditemukan perbedaan teks kebutuhan.
> Seluruh dokumentasi dan label UI memakai Bahasa Indonesia; data hanya sintetis. Tidak ada kode aplikasi atau deployment produksi pada tahap ini.

## Keputusan PO — 4 November 2026

- **Sumber:** PRD resmi adalah `docs/EISH_PRD_v1.0.md`; verifikasi kesetaraan dengan sumber analisis awal selesai (Q-01).
- **Approver:** Ketua Tim (Katim) adalah pejabat yang memegang role Approver untuk briefing dan statement. Role ini tetap diperiksa server; penulis tanpa role Approver tidak memperoleh hak persetujuan (Q-02).
- **Persetujuan:** satu tingkat untuk briefing dan statement. Penulis yang juga memegang role Approver boleh menyetujui naskah sendiri; aktor penulis dan pemberi persetujuan tetap dicatat apa adanya dalam audit (Q-02/03). Tidak ada syarat approver kedua atau larangan persetujuan karya sendiri.
- **Reader:** PO menegaskan Reader boleh melihat seluruh informasi isu yang sudah final; draft isu, update, briefing dan statement tetap tersembunyi. Akses baca tidak memberikan hak edit atau approval; tombol salin utama tetap hanya untuk statement approved yang berlaku (Q-04).
- **Login:** pengguna dapat memakai email atau username sebagai pengenal login (Q-05). Mekanisme pembuktian identitas (misalnya password), provisioning, pemulihan akun, timeout session dan kebutuhan SSO belum ditetapkan; tidak diasumsikan sudah disetujui.

Keputusan ini melengkapi analisis tanpa mengubah PRD dan tidak merupakan persetujuan keseluruhan desain atau izin menulis kode aplikasi. Status terbuka pada bagian lain hanya berlaku untuk rincian yang belum diputuskan.

## Format, kedalaman, dan kriteria keluaran

Setiap fase memuat tujuan, dependensi keputusan, paket pekerjaan kecil, keluaran, kriteria penerimaan terukur dan strategi pengujian. Kedalaman sampai skenario positif/negatif, kasus konkurensi dan bukti gerbang kelulusan; bukan estimasi tanggal yang belum memiliki kapasitas tim.

Kriteria keluaran: Sprint 0–4 selaras PRD §14; seluruh FR/NFR dan UAT-01–14 terpetakan; fitur P0 tidak ditunda tanpa persetujuan; pengujian dibedakan unit/integrasi/end-to-end/manual; setiap fase memiliki gerbang berhenti. Semua pemeriksaan berikut masih **direncanakan, belum dijalankan**.

## Standar keluaran rencana

Setiap paket pekerjaan harus cukup kecil untuk ditinjau sendiri dan merujuk kebutuhan PRD. Penerimaan dinyatakan sebagai perilaku yang dapat diamati, termasuk penolakan akses dan kegagalan transaksi. Bukti fase mencatat target, perintah, dataset sintetis, hasil sebenarnya dan isu tersisa; rencana tidak boleh dinyatakan sebagai hasil uji.

| Unsur per fase | Kondisi keluaran diterima |
|---|---|
| Tujuan dan cakupan | Kebutuhan FR/NFR disebut, fitur di luar MVP tidak disisipkan |
| Dependensi | Sprint dan keputusan PO/TI yang menghalangi pekerjaan disebut dengan ID |
| Paket pekerjaan | Urutan implementasi dan artefak review jelas tanpa membangun seluruh aplikasi sekaligus |
| Penerimaan | Ada alur sukses, penolakan akses, kasus batas dan hasil yang diharapkan |
| Pengujian | Jenis pengujian, sasaran dan bukti jelas; otomatis dan manual dibedakan |
| Gerbang selesai | Tidak lulus bila keamanan/integritas kritis gagal atau keputusan wajib belum selesai |

## Gerbang sebelum implementasi

Fase analisis saat ini menghasilkan empat dokumen saja. PO meninjau [desain teknis](TECHNICAL-DESIGN.md) dan [keputusan terbuka](OPEN-QUESTIONS.md). Tidak membuat scaffold, schema, migrasi, seed atau UI sebelum desain disetujui. Setelah disetujui, implementasikan satu sprint dan tinjau hasil sebelum memperluas cakupan. Perubahan kebijakan yang memengaruhi database atau izin harus diselesaikan sebelum bagian terkait dibangun.

## Sprint 0 — Fondasi

**Tujuan:** kerangka aplikasi lokal yang dapat dijalankan, identitas dan kebijakan dasar, tanpa membangun seluruh fitur domain. Sumber: §4,14; NFR-01,02,08,09,10,11.

**Dependensi:** Verifikasi sumber Q-01 telah selesai. Katim/satu tingkat/izin persetujuan karya sendiri telah ditetapkan; rincian administrasi role Q-02/03, mekanisme verifikasi login/session Q-05, serta persetujuan desain tetap diperlukan. Q-17 menentukan target aksesibilitas; Q-04 menghalangi finalisasi schema publikasi di Sprint 1.

**Paket pekerjaan:**

1. S0.1: README/AGENTS, pin runtime/paket, lockfile, konfigurasi contoh tanpa secret, lint/typecheck/test dan CI.
2. S0.2: Docker dev, PostgreSQL lokal, migrasi awal identitas/peran dan seed sintetis; dokumentasikan instalasi dan reset khusus data dummy.
3. S0.3: login dengan pengenal email atau username (mekanisme verifikasi masih Q-05), session dapat dicabut, cek akun aktif, kebijakan akses server dan matriks izin.
4. S0.4: kerangka navigasi Bahasa Indonesia untuk operasional/Reader, keadaan kosong, error dan komponen aksesibel; belum membuat fitur penuh.

**Kriteria penerimaan:** checkout bersih dapat dipasang dari lockfile dan menjalankan aplikasi serta database mengikuti README; migrasi di database kosong sukses; seed dapat diulang tanpa menggandakan akun; lima peran sintetis dapat diuji; anonim dan peran salah ditolak di server; admin tanpa role tambahan tidak dapat approve; session akun nonaktif ditolak pada permintaan berikutnya. Tidak ada secret/data nyata dalam repo.

**Pengujian/bukti:** build, lint, typecheck; unit kebijakan; integrasi session/nonaktif/peran dengan PostgreSQL; end-to-end login dan navigasi; keyboard/fokus dasar. Catat versi, perintah, jumlah test benar-benar dijalankan dan hasil. Keluar fase bila layanan lokal dan semua cek wajib lulus; tidak mengklaim produk siap pilot.

## Sprint 1 — Isu dan timeline

**Tujuan:** pengelolaan isu end-to-end, sumber, ringkasan manual, revisi dan publikasi yang aman. FR-01,02, bagian FR-03,06,08; NFR-01,03,06,08,09,11.

**Dependensi:** Sprint 0 lulus; Q-04 (visibilitas semua kolom), Q-10 (pencarian/duplikat), Q-12 (lampiran), Q-15 (tanggal, rich text, konflik). Bila lampiran ditetapkan di luar MVP, jangan membuat upload; keputusan penundaan dicatat PO.

**Paket pekerjaan:** S1.1 model isu/kategori/pemilik/status/kata kunci dan soft delete; S1.2 form/list/detail dan peringatan duplikat; S1.3 update, sumber jamak, rich text tersanitasi, histori revisi dan catatan tidak ada perkembangan material; S1.4 publikasi revisi terpisah dan audit; S1.5 pencarian isu/update, filter awal dan konflik edit. Jika lampiran aktif, sertakan akses unduhan dan backup kontraknya sejak fase ini.

**Kriteria penerimaan:** UAT-01,02 lulus; ID tetap setelah judul berubah; dua update tampil berurutan berdasarkan tanggal peristiwa dengan waktu input berbeda; revisi lama tetap dapat dibaca oleh pihak berwenang; edit serentak tidak menghilangkan data; ringkasan/sumber draft tidak memengaruhi revisi terbit; contributor hanya mengubah milik/ditugaskan; soft delete tidak merusak histori/relasi; URL berbahaya dan rich text XSS ditolak/disanitasi; pencarian update menemukan isu yang tepat.

**Pengujian/bukti:** unit validasi/status/normalisasi/tanggal; integrasi FK, revisi, transaksi audit dan optimistic locking; end-to-end UAT-01,02; uji negatif Reader pada draft termasuk sumber/lampiran. Korpus Bahasa Indonesia dummy untuk pencarian. Keluar fase setelah operasi isu dan akses server terbukti; dashboard penuh menunggu Sprint 4.

## Sprint 2 — Statement dan persetujuan versi

**Tujuan:** membedakan naskah siap digunakan dari draft, arsip dan pencabutan. FR-05, bagian FR-08; NFR-01,03,11.

**Dependensi:** Sprint 1 lulus; mandat Katim, satu tingkat dan persetujuan karya sendiri telah disahkan. Selesaikan rincian tersisa Q-02/03 dan Q-07 (masa berlaku/penyalinan).

**Paket pekerjaan:** S2.1 statement dan versi per isu, alasan revisi dan histori; S2.2 submit/review/return dengan komentar; S2.3 approve atomik, supersede, revoke beralasan dan pointer approved; S2.4 tampilan detail, status teks, masa berlaku dan salin kanonis dengan audit relevan.

**Kriteria penerimaan:** UAT-07,08,09 dan UAT-13 untuk statement lulus; v1 tetap default saat v2 draft; approval v2 menggantikan v1 tanpa menghapus histori; draft v3 tidak mengganti v2; revoke menghasilkan keadaan “Belum ada pernyataan siap digunakan” bila tidak ada yang sah; dua approval serentak menghasilkan keadaan valid tunggal; tidak ada copy utama untuk revoked/superseded/belum berlaku/kedaluwarsa. Teks salin sama karakter demi karakter dengan teks kanonis approved. Admin bukan approver otomatis. Katim ber-role Approver dapat menyetujui karya sendiri dalam satu tingkat; penulis tanpa role Approver tetap ditolak.

**Pengujian/bukti:** unit transisi dan rentang waktu termasuk batas WIB/UTC; integrasi PostgreSQL dengan transaksi paralel, rollback saat audit gagal dan constraint pointer; end-to-end seluruh peran untuk UAT-07–09,13; bypass UI dan percobaan SQL mengubah isi final ditolak. Keluar fase setelah invariant versi dan izin lulus.

## Sprint 3 — Briefing, snapshot dan ekspor

**Tujuan:** briefing terkurasi yang tetap sama setelah isu berubah. FR-04, ekspor FR-08; NFR-01,03,08,11.

**Dependensi:** Sprint 2 lulus; mandat Katim, satu tingkat dan persetujuan karya sendiri telah ditetapkan; rincian role Q-02, Q-06 (revisi/status), Q-11 (format ekspor). PDF rekomendasi, bukan keputusan final.

**Paket pekerjaan:** S3.1 pilih tiga atau lebih isu sintetis, salin ringkasan/update terpilih, susun urutan dan sunting independen; S3.2 review/return/approve/publish dengan metadata; S3.3 snapshot lengkap immutable, pointer final terpisah dan revisi lanjutan; S3.4 ekspor format MVP dari snapshot dengan layout Bahasa Indonesia.

**Kriteria penerimaan:** UAT-05,06,12 dan UAT-13 untuk briefing lulus; sumber tidak berubah ketika salinan disunting; judul, teks, urutan, referensi dan metadata final tidak berubah setelah sumber berubah atau draft baru dibuat; Reader tetap membuka versi terbit selama revisi baru masih draft; edit setelah approval mengikuti kebijakan pembatalan approval; hanya Katim dengan role Approver dapat menyetujui/terbitkan; persetujuan karya sendiri diizinkan dan diuji dalam satu tingkat. Ekspor sesuai snapshot termasuk karakter Indonesia, paragraf, tabel bila diizinkan editor, halaman panjang dan referensi. Tidak mengekspor draft kepada Reader.

**Pengujian/bukti:** unit transisi/serialisasi; integrasi publikasi atomik dan larangan UPDATE/DELETE final; end-to-end UAT-05,06,12,13; perbandingan isi ekspor dengan snapshot dan pemeriksaan visual pagination. Pengujian snapshot membandingkan konten, bukan hanya hash berkas PDF yang dapat berbeda metadatanya. Keluar fase setelah integritas dan ekspor terverifikasi.

## Sprint 4 — Portal, pencarian terpadu dan penguatan

**Tujuan:** alur Reader aman dan mudah dipakai, seluruh UAT, backup/restore serta kesiapan uji pilot internal. FR-03,06,07,08; NFR-01–12.

**Dependensi:** Sprint 3 lulus; Q-08/09 (cakupan audit/Apa yang Baru), Q-13 (arsip/migrasi), Q-14 (kebijakan operasional), Q-16/17 (profil ukur/aksesibilitas). Penggunaan data nyata tetap memerlukan keputusan terpisah; tugas ini tidak menerapkan produksi.

**Paket pekerjaan:** S4.1 dashboard final dan titik acuan; S4.2 pencarian seluruh tipe, filter, arsip serta otorisasi sebelum cuplikan; S4.3 administrasi akun/peran/kategori dan audit lengkap; S4.4 backup database+lampiran, restore staging terisolasi dengan dummy; S4.5 aksesibilitas/mobile/performa/keamanan dan simulasi migrasi manual historis; S4.6 UAT PO dan dokumentasi operasional.

**Kriteria penerimaan:** UAT-03,04,10,11,14 dan regresi UAT-01–14 lulus; kata unik dalam draft tidak muncul dalam judul/cuplikan/hasil Reader, API atau ekspor; akun nonaktif tidak memakai session lama; statement approved isu diketahui dapat dibuka dalam 2–3 klik; perubahan yang baru diterbitkan muncul menurut titik acuan disepakati; restore memulihkan relasi, snapshot dan checksum lampiran sintetis. Halaman baca dapat dipakai di ponsel dan keyboard; status bukan warna saja. Pengukuran ≤3 detik dilaporkan menurut profil disepakati, bukan klaim SLA universal.

**Pengujian/bukti:** integrasi query izin dan cache/revoke; end-to-end per peran; pemeriksaan aksesibilitas otomatis ditambah keyboard/pembaca layar manual; uji beban sintetis sesuai Q-16; uji XSS/CSRF/akses objek/upload, audit tanpa rahasia; latihan restore terukur. PO memverifikasi penerimaan, TI meninjau kebijakan; kegagalan keamanan/integritas memblokir pilot. Tidak menyebut siap produksi.

## Matriks keterlacakan penerimaan

| Skenario PRD | Fase utama | Bukti minimal |
|---|---|---|
| UAT-01,02 | 1 | ID, pencarian, timeline dan histori |
| UAT-03 | 4 (dasar publikasi di 1) | Dashboard hanya update diterbitkan |
| UAT-04 | 4, regresi sejak 0 | URL/API draft ditolak tanpa isi |
| UAT-05,06 | 3 | Pilih/sunting salinan; snapshot stabil |
| UAT-07,08,09 | 2 | Versi aktif, supersede dan revoke |
| UAT-10 | 4, regresi sejak 1 | Pencarian tidak membocorkan draft |
| UAT-11 | 0 dan 4 | Session lama akun nonaktif ditolak |
| UAT-12 | 3 | Ekspor identik isi final |
| UAT-13 | 2 dan 3 | Return dengan komentar dan audit |
| UAT-14 | 4 | Restore database, versi dan lampiran |

## Definisi selesai setiap sprint

Review kode, lint/typecheck/build yang relevan, test otomatis bermakna lulus, matriks izin diuji, tidak ada rahasia/data nyata, migrasi dan cara menjalankan terdokumentasi, seed sintetis tersedia, penerimaan diverifikasi PO dan changelog dicatat. Laporan membedakan lulus, gagal, dilewati, dan belum dijalankan; nol test bukan keberhasilan validasi. Jika keputusan tertunda, selesaikan pekerjaan independen tetapi jangan menandai fase selesai atau menetapkan kebijakan organisasi secara sepihak.

Urutan mengikuti PRD; perkiraan durasi baru dibuat setelah kapasitas tim, format ekspor, identitas dan keputusan workflow jelas. Tidak menambahkan fitur agar memenuhi checklist teknis. Produksi, integrasi pemerintah, SSO belum disetujui, dan migrasi data nyata tidak dijalankan pada tahap analisis ini.

## Contoh kontrak penerimaan yang harus diturunkan menjadi pengujian

| Fase | Diberikan | Ketika | Maka |
|---|---|---|---|
| 0 | Pengguna sudah login dan kemudian dinonaktifkan Admin | Session lama mengakses rute terlindungi | Server menolak akses berikutnya; tidak mengandalkan logout di browser |
| 1 | Dua editor memegang lock_version yang sama | Editor kedua menyimpan setelah editor pertama berhasil | Simpan kedua ditolak sebagai konflik; isi pertama dan input kedua tidak hilang diam-diam |
| 2 | Dua versi statement menunggu persetujuan | Dua transaksi approval terjadi bersamaan | Hasil mengikuti kebijakan terkonfirmasi, hanya satu pointer approved sah, perubahan status dan audit konsisten |
| 3 | Briefing telah terbit | Isu sumber berubah dan revisi briefing baru masih draft | Reader dan ekspor tetap memakai snapshot terbit yang sama |
| 4 | Frasa unik hanya terdapat dalam draft | Reader mencari frasa itu dan mencoba URL langsung | Tidak ada hasil/cuplikan/isi draft, termasuk melalui endpoint ekspor/lampiran |

Korpus sintetis minimal mencakup kelima peran, pengguna nonaktif, peran gabungan sesuai keputusan, isu di semua status, update dengan tanggal input berbeda dari tanggal peristiwa, sumber jamak, draft dan final yang mengandung kata unik berbeda, versi statement digantikan/dicabut/kedaluwarsa, serta briefing terbit dengan revisi baru. Jumlah record beban tidak dikarang; ditentukan Q-16. Tidak memakai materi komunikasi pemerintah nyata atau kredensial produksi.

## Pembaruan penerimaan setelah keputusan PO

- Sprint 0: pengenal email dan username sama-sama menuju akun yang benar; kasus benturan dan normalisasi diuji. Pembuktian identitas dan pemulihan akun ditentukan sebelum implementasi autentikasi.
- Sprint 2 dan 3: Katim yang juga penulis berhasil approve karya sendiri setelah melalui status sah; tidak ada kebutuhan approver kedua. Penulis tanpa role Approver ditolak. Audit mencatat penulis dan approver walaupun orang yang sama.
- Sprint 1 dan 4: Reader dapat membaca semua informasi isu yang final, termasuk ringkasan, background, timeline dan sumber final sesuai akses; draft pada semua jalur tetap tidak tampil. Pengujian final-only dalam rencana kini dikonfirmasi PO; rincian penerbitan kolom isu masih dalam Q-04.
