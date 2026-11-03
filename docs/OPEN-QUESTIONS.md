# Keputusan dan Pertanyaan Terbuka EISH

> Edisi analisis berdasarkan permintaan terbaru. Seluruh rekomendasi memerlukan peninjauan; review terdahulu tidak dianggap sebagai keputusan atau persetujuan.

> Status: Usulan untuk ditinjau Product Owner (PO), 3 November 2026. Belum merupakan persetujuan implementasi.
> Sumber: seluruh PRD v1.0 bagian 1–17 dalam `../EISH_PRD_v1.0.docx`. Berkas `PRD-EISH-v1.0.md` belum tersedia; kesetaraan sumber menunggu Q-01. PRD tidak diubah.
> Seluruh dokumentasi dan label UI memakai Bahasa Indonesia; data hanya sintetis. Tidak ada kode aplikasi atau deployment produksi pada tahap ini.

## Format, kedalaman, dan kriteria keluaran

Daftar keputusan memakai ID stabil, sumber PRD, pertanyaan operasional, rekomendasi, pemilik dan batas waktu dependensi. Semua keputusan berstatus **Belum dikonfirmasi**. Rekomendasi adalah usulan untuk memudahkan review, bukan persetujuan tersirat.

Kriteria keluaran: seluruh keputusan §16 tercakup bersama gap keamanan/integritas yang ditemukan; setiap pertanyaan menjelaskan hal yang perlu diputuskan dan kapan ia menghalangi pekerjaan; tidak meminta rahasia atau keputusan organisasi ditebak oleh pengembang. PO dapat mencatat jawaban dengan format `ID — keputusan — pemberi persetujuan — tanggal — alasan/dampak`. Keputusan yang mengubah kebutuhan dikembalikan ke proses persetujuan produk tanpa mengubah PRD dalam tugas ini.

## Standar keluaran keputusan

Kedalaman setiap butir mencakup pertanyaan yang dapat dijawab pemilik kewenangan, rujukan sumber, rekomendasi yang belum disahkan dan fase yang terpengaruh. Jawaban seperti “aman” atau “sesuai kebutuhan” belum cukup; keputusan harus menentukan aktor, aksi, kondisi, hasil dan batas waktunya bila relevan.

Kriteria kelengkapan: semua keputusan pada PRD §16 terwakili, termasuk sesi briefing; pertanyaan tambahan menjelaskan gap penerapan persyaratan yang sudah ada; tidak meminta secret di chat; tidak menyimpulkan persetujuan dari diamnya PO. Setelah jawaban diterima, lakukan pemeriksaan konsistensi lintas empat dokumen sebelum implementasi.

## Daftar keputusan

### Q-01 — Sumber PRD

- **Sumber:** §17; berkas Markdown belum ada.
- **Pertanyaan:** Apakah DOCX yang tersedia merupakan sumber yang sama dengan PRD Markdown yang dimaksud? Jika berbeda, versi mana yang berlaku?
- **Rekomendasi sementara:** Gunakan DOCX sebagai sumber analisis sementara; jangan mengubah PRD.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum persetujuan desain.
- **Status:** Belum dikonfirmasi.

### Q-02 — Mandat dan pemisahan tugas

- **Sumber:** §4,8,16.
- **Pertanyaan:** Siapa Approver briefing tiap sesi dan statement? Bolehkah menyetujui karya sendiri? Siapa boleh memberikan role Approver? Bagaimana gabungan peran, lingkup baca Contributor/Admin dan review Approver?
- **Rekomendasi sementara:** Matriks eksplisit per aksi dan objek; Admin tidak otomatis approve; self-approval ditolak sampai kebijakan disahkan.
- **Pemilik keputusan:** PO dan pemilik mandat.
- **Gerbang:** Sebelum fondasi izin; final sebelum Sprint 2–3.
- **Status:** Belum dikonfirmasi.

### Q-03 — Tingkat approval

- **Sumber:** §16.
- **Pertanyaan:** Statement memerlukan satu atau dua tingkat? Apakah briefing sama? Siapa dapat mengembalikan, menolak dan mencabut, serta bagaimana revisi setelah penolakan?
- **Rekomendasi sementara:** Satu tingkat sesuai asumsi awal PRD hanya bila PO menyetujui; jangan membangun mesin workflow generik.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum schema workflow/Sprint 2.
- **Status:** Belum dikonfirmasi.

### Q-04 — Visibilitas isu dan publikasi

- **Sumber:** FR-03,07; §8.
- **Pertanyaan:** Apakah hanya update Published yang tampil ke Reader? Bagaimana judul, background, summary, flag perhatian, label, sumber dan lampiran disahkan? Apa yang terjadi saat final diedit/ditarik atau isu dihapus lunak?
- **Rekomendasi sementara:** Reader membaca revisi terbit; edit membuat revisi kerja; Editor menerbitkan. Kebijakan field dan penarikan harus eksplisit.
- **Pemilik keputusan:** PO.
- **Gerbang:** Sebelum Sprint 1.
- **Status:** Belum dikonfirmasi.

### Q-05 — Login, session dan SSO

- **Sumber:** §4,11,16; NFR-01.
- **Pertanyaan:** Provider login development/pilot apa? Siapa membuat akun? Berapa timeout idle/absolut? Apakah SSO wajib saat pilot dan sudah disetujui TI?
- **Rekomendasi sementara:** Auth.js kandidat; session dapat dicabut; cek status akun/peran setiap permintaan; akun dummy hanya lokal; jangan mengasumsikan email atau SSO tersedia.
- **Pemilik keputusan:** PO dan TI.
- **Gerbang:** Sebelum Sprint 0; identitas pilot sebelum pilot.
- **Status:** Belum dikonfirmasi.

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

Pertama konfirmasi Q-01 dan persetujuan desain; selanjutnya tetapkan Q-02–05 agar pondasi izin dan publikasi tidak perlu dibangun ulang. Putuskan Q-07 sebelum versi statement, Q-06/Q-11 sebelum briefing, dan kebijakan TI Q-12–14 sebelum fasilitas terkait atau pilot. Pertanyaan lainnya dapat diputuskan bersama backlog fase yang bergantung padanya.

Pekerjaan tahap ini berhenti pada empat dokumen. Tidak ada keputusan yang dianggap disetujui karena tidak dijawab, dan persetujuan desain tidak berarti persetujuan deployment produksi.

## Ringkasan keputusan yang perlu dijawab terlebih dahulu

| Urutan | ID | Jawaban minimum yang diperlukan | Dampak bila belum dijawab |
|---|---|---|---|
| 1 | Q-01 | DOCX dikonfirmasi setara atau sumber PRD yang benar disediakan | Analisis belum dapat dianggap terhadap sumber Markdown yang diminta |
| 2 | Persetujuan desain | Setuju / revisi beserta bagian yang perlu diubah | Seluruh penulisan kode aplikasi tetap ditunda |
| 3 | Q-02, Q-03 | Matriks mandat, kombinasi peran, self-approval dan jumlah tingkat | Kebijakan persetujuan dan model keputusan belum final |
| 4 | Q-04 | Daftar informasi final untuk Reader dan siapa menerbitkannya | Schema revisi/publikasi isu belum final |
| 5 | Q-05 | Provider login development dan aturan pencabutan/masa session | Fondasi identitas belum dapat diimplementasikan lengkap |

Persetujuan teknis tidak menggantikan keputusan substantif PO atau persetujuan infrastruktur/keamanan TI. Jika sebagian desain disetujui, catat batas bagian yang disetujui; jangan menafsirkan itu sebagai izin membangun semua sprint.
