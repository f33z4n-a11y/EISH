# Keputusan dan Pertanyaan Terbuka EISH

> Edisi desain dengan keputusan PO terbaru. Bagian yang sudah disahkan dicatat eksplisit; keputusan lain yang masih terbuka tidak dianggap disetujui.

> Status: Desain dan autentikasi disetujui PO pada 4 November 2026 untuk implementasi Sprint 0 saja; Sprint 1–4 dan produksi belum diotorisasi.
> Sumber resmi: [EISH_PRD_v1.0.md](EISH_PRD_v1.0.md), PRD v1.0 bagian 1–17; berkas telah dibaca seluruhnya dari GitHub `main` pada commit `8e6804679cc3d2fa5fed56b888f82749b70f2711`. Verifikasi 4 November 2026: 345 blok teks identik dengan DOCX yang digunakan pada analisis awal setelah normalisasi penanda Markdown, spasi, dan penomoran daftar. SHA-256 Markdown: `3568d07503468ad366dc9b7d5809d98681baf7657f10aa932c06b47a012c3904`. PRD asli tidak diubah; tidak diperlukan pengulangan analisis karena tidak ditemukan perbedaan teks kebutuhan.
> Seluruh dokumentasi dan label UI memakai Bahasa Indonesia; data hanya sintetis. Implementasi dibatasi Sprint 0, tanpa deployment produksi.

## Keputusan PO — 4 November 2026

- **Sumber:** PRD resmi adalah `docs/EISH_PRD_v1.0.md`; verifikasi kesetaraan dengan sumber analisis awal selesai (Q-01).
- **Approver:** Ketua Tim (Katim) adalah pejabat yang memegang role Approver untuk briefing dan statement. Role ini tetap diperiksa server; penulis tanpa role Approver tidak memperoleh hak persetujuan (Q-02).
- **Persetujuan:** satu tingkat untuk briefing dan statement. Penulis yang juga memegang role Approver boleh menyetujui naskah sendiri; aktor penulis dan pemberi persetujuan tetap dicatat apa adanya dalam audit (Q-02/03). Tidak ada syarat approver kedua atau larangan persetujuan karya sendiri.
- **Reader:** PO menegaskan Reader boleh melihat seluruh informasi isu yang sudah final; draft isu, update, briefing dan statement tetap tersembunyi. Akses baca tidak memberikan hak edit atau approval; tombol salin utama tetap hanya untuk statement approved yang berlaku (Q-04).
- **Login:** email atau username + password. Akun dibuat Admin, tanpa pendaftaran mandiri. Session habis setelah idle 30 menit atau maksimal 8 jam; akun nonaktif ditolak pada permintaan berikutnya. PO menyetujui usulan ini dan desain untuk Sprint 0 pada 4 November 2026. Pemulihan password serta SSO/pilot belum diputuskan (Q-05).

Keputusan ini melengkapi analisis tanpa mengubah PRD. PO telah menyetujui desain dan autentikasi untuk Sprint 0 saja. Status terbuka pada bagian lain hanya berlaku untuk rincian yang belum diputuskan; tidak ada izin implementasi Sprint 1–4 atau produksi.

## Format, kedalaman, dan kriteria keluaran

Daftar keputusan memakai ID stabil, sumber PRD, pertanyaan operasional, rekomendasi, pemilik dan batas waktu dependensi. Status setiap butir diperbarui sesuai keputusan PO; rincian yang belum dijawab tetap terbuka. Rekomendasi adalah usulan untuk memudahkan review, bukan persetujuan tersirat.

Kriteria keluaran: seluruh keputusan §16 tercakup bersama gap keamanan/integritas yang ditemukan; setiap pertanyaan menjelaskan hal yang perlu diputuskan dan kapan ia menghalangi pekerjaan; tidak meminta rahasia atau keputusan organisasi ditebak oleh pengembang. PO dapat mencatat jawaban dengan format `ID — keputusan — pemberi persetujuan — tanggal — alasan/dampak`. Keputusan yang mengubah kebutuhan dikembalikan ke proses persetujuan produk tanpa mengubah PRD dalam tugas ini.

## Standar keluaran keputusan

Kedalaman setiap butir mencakup pertanyaan yang dapat dijawab pemilik kewenangan, rujukan sumber, rekomendasi yang belum disahkan dan fase yang terpengaruh. Jawaban seperti “aman” atau “sesuai kebutuhan” belum cukup; keputusan harus menentukan aktor, aksi, kondisi, hasil dan batas waktunya bila relevan.

Kriteria kelengkapan: semua keputusan pada PRD §16 terwakili, termasuk sesi briefing; pertanyaan tambahan menjelaskan gap penerapan persyaratan yang sudah ada; tidak meminta secret di chat; tidak menyimpulkan persetujuan dari diamnya PO. Setelah jawaban diterima, lakukan pemeriksaan konsistensi lintas empat dokumen sebelum implementasi.

## Daftar keputusan

### Q-01 — Sumber PRD

- **Sumber resmi:** `docs/EISH_PRD_v1.0.md` di GitHub `main`, commit sumber `8e6804679cc3d2fa5fed56b888f82749b70f2711`.
- **Hasil:** Markdown dibaca seluruhnya; 345 blok teks identik dengan DOCX analisis awal setelah normalisasi format. SHA-256 dicatat pada awal dokumen.
- **Keputusan:** gunakan Markdown sebagai sumber resmi; tidak perlu mengulang analisis atas teks yang sama. PRD tidak diubah.
- **Status:** Selesai diverifikasi, 4 November 2026; tidak lagi menghalangi desain.

### Q-02 — Mandat dan pemisahan tugas

- **Sumber:** §4,8,16; keputusan PO dalam percakapan, 4 November 2026.
- **Keputusan disahkan:** Approver briefing dan statement adalah Ketua Tim (Katim). Penulis boleh menyetujui karya sendiri bila akun penulis juga memiliki role Approver; penulis biasa tidak otomatis menjadi Approver. Admin tidak otomatis boleh menyetujui substansi.
- **Masih perlu keputusan:** siapa berwenang memberikan/mencabut role Approver, lingkup baca internal Contributor/Admin, dan rincian kombinasi peran operasional.
- **Pemilik keputusan:** PO dan pemilik mandat.
- **Gerbang:** rincian izin yang tersisa sebelum implementasi bagian terkait.
- **Status:** Diputuskan sebagian; mandat dan izin persetujuan karya sendiri sudah final, rincian administrasi role terbuka.

### Q-03 — Tingkat approval

- **Sumber:** §16; keputusan PO, 4 November 2026.
- **Keputusan disahkan:** persetujuan briefing dan statement hanya satu tingkat, dilakukan Katim ber-role Approver; tidak memerlukan pemberi persetujuan kedua.
- **Masih perlu keputusan:** mandat rinci mengembalikan/menolak/mencabut dan aturan revisi setelah penolakan. Komentar pengembalian dan alasan pencabutan tetap wajib sesuai PRD.
- **Pemilik keputusan:** PO.
- **Gerbang:** rincian transisi sebelum Sprint 2/3; jumlah tingkat tidak lagi menjadi penghalang.
- **Status:** Jumlah tingkat diputuskan; rincian transisi tersisa terbuka.

### Q-04 — Visibilitas isu dan publikasi

- **Sumber:** FR-03,07; §8; pernyataan PO, 4 November 2026.
- **Keputusan disahkan:** Reader boleh melihat seluruh informasi isu yang sudah final. Draft isu, update, briefing dan statement tetap tersembunyi; Reader tidak diberi hak edit/persetujuan.
- **Masih perlu keputusan:** siapa menerbitkan judul, background, summary, flag, sumber dan lampiran; bagaimana final ditarik atau dihapus lunak. Batas final/draft tidak lagi terbuka.
- **Dampak desain/pengujian:** proyeksi Reader memakai revisi terbit; pencarian, URL langsung, ekspor dan lampiran tidak boleh membocorkan draft. Selaras dengan batas final-only PRD; statement siap salin tetap harus approved dan berlaku.
- **Pemilik keputusan:** PO.
- **Gerbang:** sebelum finalisasi visibilitas Sprint 1 dan portal Sprint 4.
- **Status:** Cakupan final-only diputuskan PO, 4 November 2026; rincian publikasi/penarikan masih terbuka.

### Q-05 — Login, session dan SSO

- **Sumber:** §4,11,16; NFR-01; keputusan PO, 4 November 2026.
- **Keputusan disahkan:** email atau username + password; akun dibuat Admin tanpa pendaftaran mandiri; session idle 30 menit, absolut 8 jam; akun nonaktif ditolak pada permintaan berikutnya. Desain disetujui untuk Sprint 0 pada 4 November 2026.
- **Masih perlu keputusan:** proses pemulihan password, kewenangan provisioning role privileged (Q-02), dan kebutuhan SSO pilot yang disetujui TI. Ini tidak menghalangi fondasi login lokal yang sudah disetujui.
- **Rekomendasi teknis:** email/username unik ternormalisasi tanpa benturan antar-akun; Auth.js adalah kandidat awal; implementasi session opaque dijelaskan di desain teknis, session dapat dicabut, cek akun aktif/peran pada setiap permintaan. Akun development hanya sintetis.
- **Pemilik keputusan:** PO dan TI.
- **Gerbang:** fondasi autentikasi Sprint 0 sudah disetujui; pemulihan/identitas pilot sebelum fase penggunaannya.
- **Status:** Autentikasi/password, provisioning oleh Admin dan durasi session diputuskan; pemulihan/SSO serta role privileged tersisa terbuka.

### Q-06 — Revisi briefing

- **Sumber:** FR-04; §7.
- **Pertanyaan:** Apakah sesi baku Pagi/Malam/Insidentil disetujui, dan apakah sesi harus dapat dikonfigurasi? Bolehkah beberapa briefing per tanggal/sesi? Apakah edit setelah approved harus mengulang review? Versi terbit mana menjadi default ketika ada draft baru? Apakah briefing bisa dicabut dan siapa boleh melihat revisi lama?
- **Rekomendasi sementara:** Status per revisi; pisahkan pointer kerja/final; perubahan isi membatalkan approval; final lama tetap default sampai revisi baru terbit. Pencabutan briefing belum didefinisikan PRD.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 3.
- **Status:** Belum dikonfirmasi.

### Q-07 — Validitas dan salin statement

- **Sumber:** FR-05.
- **Pertanyaan:** Apa perilaku approval versi yang mulai berlaku nanti? Kapan versi lama superseded? Apakah rentang waktu inklusif? Bolehkah Reader membuka arsip superseded/revoked? Format salin plain text atau rich text?
- **Rekomendasi sementara:** Jangan otomatis mengaktifkan kembali versi lama; tombol utama hanya approved dan berlaku saat ini; plain text kanonis direkomendasikan. Hindari menyamakan pointer approved dengan validitas waktu.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 2.
- **Status:** Belum dikonfirmasi.

### Q-08 — Prioritas FR-08 dan audit

- **Sumber:** §3; FR-08 P0/P1.
- **Pertanyaan:** Komponen FR-08 mana P0/P1? Login penting mencakup kejadian apa? Siapa membaca audit dan berapa lama disimpan?
- **Rekomendasi sementara:** Pertahankan audit kritis, nonaktif akun, ekspor final dan restore dalam MVP sesuai §3; penundaan harus disetujui.
- **Pemilik keputusan:** PO dan TI.
- **Gerbang:** Sebelum backlog disahkan; rincian sebelum Sprint 4.
- **Status:** Belum dikonfirmasi.

### Q-09 — Titik acuan Apa yang Baru

- **Sumber:** FR-03; §8.
- **Pertanyaan:** Pakai terakhir dilihat atau briefing terakhir? Kapan dianggap dilihat? Kejadian label apa yang ditampilkan, dan bagaimana kunjungan pertama serta publikasi terlambat?
- **Rekomendasi sementara:** Reader memakai published_at; simpan checkpoint eksplisit, jangan pakai created_at untuk publikasi lama; tanpa statistik analitik.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 4.
- **Status:** Belum dikonfirmasi.

### Q-10 — Pencarian dan duplikat

- **Sumber:** FR-01,06; NFR-06.
- **Pertanyaan:** Apakah pencarian frasa/kata parsial diperlukan? Filter tanggal merujuk waktu apa? Apa standar judul duplikat dan apakah boleh lanjut?
- **Rekomendasi sementara:** Peringatan nonblokir untuk judul ternormalisasi; FTS PostgreSQL diuji korpus Indonesia; putuskan semantik sebelum menjanjikan pencarian parsial.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 1; lintas dokumen Sprint 4.
- **Status:** Belum dikonfirmasi.

### Q-11 — Format ekspor

- **Sumber:** FR-04; §16.
- **Pertanyaan:** Apakah PDF cukup untuk MVP, atau DOCX juga wajib? Bagaimana template, metadata, referensi, nomor halaman dan klasifikasi dokumen?
- **Rekomendasi sementara:** PDF saja sesuai asumsi PRD; sumber selalu snapshot terbit. Format kedua memerlukan persetujuan cakupan.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 3.
- **Status:** Belum dikonfirmasi.

### Q-12 — Lampiran

- **Sumber:** FR-02; NFR-11; §16.
- **Pertanyaan:** Lampiran aktif pada MVP? Format, ukuran, kuota, kebijakan pemindaian dan unduhan apa yang diizinkan? Volume privat atau S3-compatible yang tersedia?
- **Rekomendasi sementara:** Simpan privat dan cek akses induk; tidak ada public URL permanen; tetapkan batas sebelum upload dibuat.
- **Pemilik keputusan:** PO dan TI.
- **Gerbang:** Sebelum Sprint 1 bila diaktifkan.
- **Status:** Belum dikonfirmasi.

### Q-13 — Arsip, retensi dan migrasi

- **Sumber:** §12,16; NFR-12.
- **Pertanyaan:** Siapa memverifikasi approved dokumen lama? Siapa menentukan klasifikasi, akses arsip dan retensi/pemusnahan? Bagaimana visibilitas final dari isu yang diarsipkan/dihapus lunak?
- **Rekomendasi sementara:** Migrasi manual bertahap; legacy/belum diverifikasi bukan approved; jangan melakukan hapus permanen atau memakai data nyata saat development.
- **Pemilik keputusan:** PO, pengelola informasi dan TI.
- **Gerbang:** Kebijakan arsip sebelum Sprint 1; migrasi/retensi sebelum pilot.
- **Status:** Belum dikonfirmasi.

### Q-14 — Hosting dan pemulihan

- **Sumber:** NFR-02,04,07,10,12; §16.
- **Pertanyaan:** Hosting/staging yang disetujui di mana? Siapa operator/penanggung jawab insiden? Berapa RPO/RTO, jadwal backup/restore, retensi backup dan target uptime?
- **Rekomendasi sementara:** Docker dev lokal, staging terpisah untuk restore dummy; backup database+lampiran konsisten; tidak menetapkan angka SLA atau melakukan produksi.
- **Pemilik keputusan:** TI dan pemilik layanan, dengan PO.
- **Gerbang:** Sebelum uji operasional Sprint 4/pilot.
- **Status:** Belum dikonfirmasi.

### Q-15 — Kontrak konten, waktu dan konflik

- **Sumber:** FR-02; §8,9; NFR-11.
- **Pertanyaan:** Format rich text apa yang diperlukan? Tanggal peristiwa date atau timestamp? Sesi untuk catatan tidak ada perkembangan material? Bagaimana histori revisi dapat dibaca dan konflik diselesaikan?
- **Rekomendasi sementara:** Format minimal yang dapat disanitasi; simpan UTC untuk timestamp dan date untuk tanggal bisnis; optimistic locking dengan peringatan tanpa overwrite.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 1.
- **Status:** Belum dikonfirmasi.

### Q-16 — Profil kinerja

- **Sumber:** NFR-05.
- **Pertanyaan:** Berapa isu/update/versi/lampiran dan pengguna bersamaan pada pilot? Perangkat/jaringan apa; bagaimana mengukur target 3 detik dan persentilnya?
- **Rekomendasi sementara:** Data beban sintetis representatif dan laporan profil ukur; 3 detik tetap hipotesis, bukan SLA produksi.
- **Pemilik keputusan:** PO dan TI.
- **Gerbang:** Sebelum pengukuran Sprint 4.
- **Status:** Belum dikonfirmasi.

### Q-17 — Aksesibilitas dan perangkat

- **Sumber:** NFR-08,09; FR-07.
- **Pertanyaan:** Standar aksesibilitas penerimaan apa dan perangkat/browser mana yang didukung? Siapa mewakili pengguna untuk uji alur Reader?
- **Rekomendasi sementara:** Usulan WCAG 2.2 AA sebagai target verifikasi untuk disetujui, keyboard/fokus/kontras dan ponsel wajib sesuai PRD; uji statement 2–3 klik.
- **Pemilik keputusan:** PO dan perwakilan pengguna.
- **Gerbang:** Sebelum kriteria UI disahkan; uji Sprint 4.
- **Status:** Belum dikonfirmasi.

## Urutan review yang disarankan

Q-01 sudah selesai. Berikutnya tinjau desain dan selesaikan rincian tersisa Q-02–05 agar pondasi izin dan publikasi tidak perlu dibangun ulang. Putuskan Q-07 sebelum versi statement, Q-06/Q-11 sebelum briefing, dan kebijakan TI Q-12–14 sebelum fasilitas terkait atau pilot. Pertanyaan lainnya dapat diputuskan bersama backlog fase yang bergantung padanya.

Tahap analisis selesai; PO mengizinkan implementasi Sprint 0 saja. Tidak ada keputusan yang dianggap disetujui karena tidak dijawab, dan persetujuan desain tidak berarti persetujuan deployment produksi.

## Ringkasan keputusan yang perlu dijawab terlebih dahulu

| Urutan | ID | Jawaban minimum yang diperlukan | Dampak bila belum dijawab |
|---|---|---|---|
| Selesai | Q-01 | Markdown resmi sudah dibaca dan kesetaraan 345 blok teks diverifikasi | Tidak lagi menghalangi desain |
| Selesai | Persetujuan desain | PO menyetujui desain dan autentikasi untuk Sprint 0 | Sprint 0 diizinkan; Sprint 1–4/produksi tidak otomatis diizinkan |
| 3 | Q-02, Q-03 | Katim, satu tingkat dan persetujuan karya sendiri sudah ditetapkan; lengkapi pemberian role dan mandat transisi | Hanya rincian izin/transisi tersisa yang belum final |
| 4 | Q-04 | Reader final-only sudah ditetapkan; lengkapi pelaku publikasi kolom isu dan aturan penarikan | Hanya rincian publikasi/penarikan yang belum final |
| Diputuskan untuk Sprint 0 | Q-05 | Email/username + password, akun dibuat Admin, idle 30 menit dan absolut 8 jam | Pemulihan/SSO masih terbuka, bukan syarat tambahan fondasi lokal |

Persetujuan teknis tidak menggantikan keputusan substantif PO atau persetujuan infrastruktur/keamanan TI. Jika sebagian desain disetujui, catat batas bagian yang disetujui; jangan menafsirkan itu sebagai izin membangun semua sprint.
