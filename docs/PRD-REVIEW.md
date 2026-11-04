# Tinjauan PRD EISH v1.0

> Edisi analisis berdasarkan permintaan terbaru. Seluruh rekomendasi memerlukan peninjauan; review terdahulu tidak dianggap sebagai keputusan atau persetujuan.

> Status: Analisis diperbarui 4 November 2026 dengan keputusan PO; desain keseluruhan belum disetujui untuk implementasi.
> Sumber resmi: [EISH_PRD_v1.0.md](EISH_PRD_v1.0.md), PRD v1.0 bagian 1–17; berkas telah dibaca seluruhnya dari GitHub `main` pada commit `8e6804679cc3d2fa5fed56b888f82749b70f2711`. Verifikasi 4 November 2026: 345 blok teks identik dengan DOCX yang digunakan pada analisis awal setelah normalisasi penanda Markdown, spasi, dan penomoran daftar. SHA-256 Markdown: `3568d07503468ad366dc9b7d5809d98681baf7657f10aa932c06b47a012c3904`. PRD asli tidak diubah; tidak diperlukan pengulangan analisis karena tidak ditemukan perbedaan teks kebutuhan.
> Bahasa dokumentasi dan antarmuka: Bahasa Indonesia. Nama teknologi, identifier, dan kode status dapat tetap memakai istilah teknis; label pengguna diterjemahkan. Pengembangan hanya memakai data sintetis. Tidak ada implementasi atau penerapan produksi pada tahap ini.

## Keputusan PO — 4 November 2026

- **Sumber:** PRD resmi adalah `docs/EISH_PRD_v1.0.md`; verifikasi kesetaraan dengan sumber analisis awal selesai (Q-01).
- **Approver:** Ketua Tim (Katim) adalah pejabat yang memegang role Approver untuk briefing dan statement. Role ini tetap diperiksa server; penulis tanpa role Approver tidak memperoleh hak persetujuan (Q-02).
- **Persetujuan:** satu tingkat untuk briefing dan statement. Penulis yang juga memegang role Approver boleh menyetujui naskah sendiri; aktor penulis dan pemberi persetujuan tetap dicatat apa adanya dalam audit (Q-02/03). Tidak ada syarat approver kedua atau larangan persetujuan karya sendiri.
- **Reader:** PO menegaskan Reader boleh melihat seluruh informasi isu yang sudah final; draft isu, update, briefing dan statement tetap tersembunyi. Akses baca tidak memberikan hak edit atau approval; tombol salin utama tetap hanya untuk statement approved yang berlaku (Q-04).
- **Login:** pengguna dapat memakai email atau username sebagai pengenal login (Q-05). Mekanisme pembuktian identitas (misalnya password), provisioning, pemulihan akun, timeout session dan kebutuhan SSO belum ditetapkan; tidak diasumsikan sudah disetujui.

Keputusan ini melengkapi analisis tanpa mengubah PRD dan tidak merupakan persetujuan keseluruhan desain atau izin menulis kode aplikasi. Status terbuka pada bagian lain hanya berlaku untuk rincian yang belum diputuskan.

## Format, kedalaman, dan kriteria keluaran

Dokumen menggunakan matriks keterlacakan, temuan berbasis bagian PRD, dan analisis dampak implementasi. Kedalaman mencakup perilaku, hak akses, integritas, kasus batas, serta cara membuktikan persyaratan; bukan sekadar ringkasan fitur. Persyaratan PRD dibedakan dari usulan teknis dan keputusan terbuka.

Kriteria keluaran: seluruh FR-01–08 dan NFR-01–12 terpetakan; kebutuhan di luar daftar FR tercatat; setiap risiko penting memiliki dampak, mitigasi usulan, dan rujukan keputusan; batas MVP eksplisit; tidak ada klaim pengujian aplikasi telah dilakukan. Rancangan terdapat di [TECHNICAL-DESIGN.md](TECHNICAL-DESIGN.md), rencana verifikasi di [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md), dan daftar keputusan di [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md).

## Standar analisis dan kriteria keluaran rinci

| Aspek | Format wajib | Kedalaman dan kondisi diterima |
|---|---|---|
| Inventaris kebutuhan | Satu baris per FR/NFR, sumber dan fase | FR-01–08 dan NFR-01–12 tercakup; kebutuhan lintas bagian 4–9 serta migrasi bagian 12 juga diidentifikasi |
| Temuan | Sumber → ketidakjelasan → dampak → mitigasi/keputusan | Menjelaskan contoh kegagalan konkret dan konsekuensinya terhadap izin, data atau penerimaan |
| Keterlacakan | ID FR/NFR/UAT dan ID pertanyaan | Pembaca dapat menelusuri kebutuhan ke rancangan, fase, bukti uji dan keputusan terbuka |
| Batas kepastian | Persyaratan / usulan / perlu konfirmasi | Tidak menambahkan fitur atau menganggap asumsi organisasi sudah disetujui |
| Hasil review | Risiko dan gerbang implementasi | Membedakan penghalang desain, dependensi fase, dan kebutuhan sebelum pilot |

Analisis bersifat berbasis dokumen. Tidak ada wawancara pengguna, verifikasi infrastruktur instansi, benchmark atau pengujian aplikasi pada tahap ini. Penilaian kecocokan teknologi adalah rekomendasi arsitektur, bukan bukti paket tertentu sudah kompatibel atau aman.

## Kesimpulan

PRD memadai untuk merancang monolit modular dan merencanakan Sprint 0. Aturan inti persetujuan telah ditetapkan PO: Katim sebagai Approver, satu tingkat, dan persetujuan karya sendiri diizinkan bila penulis juga Approver. Batas Reader sudah dikonfirmasi: seluruh informasi isu final dapat dibaca, draft tetap tersembunyi. Rincian penerbitan kolom isu dan kesiapan operasional masih perlu keputusan. Risiko terbesar adalah kebocoran draft melalui ringkasan isu, pencarian, ekspor, lampiran, atau cache; perubahan snapshot setelah terbit; serta dua persetujuan statement bersamaan. Ketiganya perlu menjadi invariant server dan database, bukan hanya perilaku tampilan.

## Inventaris kebutuhan fungsional

| ID / sumber | Kebutuhan yang harus dipenuhi | Bukti penerimaan dan fase |
|---|---|---|
| FR-01, §6 | Isu ber-ID stabil; judul, kategori, ringkasan, background, status Aktif/Dipantau/Selesai/Diarsipkan, pemilik, kata kunci, tanggal pencatatan; flag perhatian terpisah; peringatan judul duplikat; perubahan judul diaudit; hapus lunak tanpa menghapus hubungan | UAT-01; ID tetap setelah ganti judul; pengguna tak berwenang ditolak; Sprint 1 |
| FR-02 | Update manual dengan tanggal peristiwa, judul opsional, rich text, penyusun, sumber jamak, materialitas/perhatian; urutan kronologis; waktu input dan ubah terpisah; histori revisi; catatan eksplisit tidak ada perkembangan material per tanggal/sesi; lampiran opsional | UAT-02; revisi lama tetap dapat ditelusuri dan sumber terbaca; Sprint 1 |
| FR-03 | Ringkasan terkini manual bertanggal; Apa yang Baru berdasarkan titik acuan tersimpan; update, perubahan label dan statement disetujui menjadi kejadian tertaut; tidak menampilkan draft sebagai final | UAT-03; uji titik acuan dan keterlambatan publikasi; Sprint 1 dan 4 |
| FR-04 | Briefing bertanggal/sesi Pagi/Malam/Insidentil, judul/editor/status; pilih isu dan salin konten untuk disunting independen; atur urutan; pengantar, inti, tindak lanjut opsional, referensi; Draft → Dalam Review → Disetujui → Terbit; pengembalian dengan komentar; snapshot teks/urutan/link/metadata/waktu/approver immutable; revisi baru setelah terbit; ekspor minimal PDF atau DOCX | UAT-05,06,12,13; perubahan sumber tidak mengubah snapshot/ekspor; Sprint 3 |
| FR-05 | Banyak statement per isu dan banyak versi per statement; nomor versi, isi, judul, tanggal, pembuat/editor/alasan; Draft → Dalam Review → Disetujui; approval baru menggantikan versi lama menjadi Digantikan; rentang berlaku dan sensitivitas; pencabutan beralasan; histori tetap ada; salin persis versi approved yang berlaku; keadaan kosong jelas | UAT-07,08,09; approval serentak, kedaluwarsa dan pencabutan; Sprint 2 |
| FR-06 | Cari judul/ringkasan isu, body update, judul briefing, teks statement; filter kategori/status/tanggal/pemilik/tipe/approval; jenis, judul, tanggal ubah, status, tautan dalam hasil; izin berlaku sebelum cuplikan dihasilkan | UAT-10; pencarian update menuju isu; Sprint 1 lalu 4 |
| FR-07 | Portal Reader hanya final; isu perhatian, perkembangan terbit, briefing terbaru, statement approved; perangkat bergerak; statement isu diketahui tercapai 2–3 klik; cari/salin tanpa edit, termasuk larangan akses URL langsung | UAT-03,04,10; uji alur ponsel dan backend; Sprint 4 |
| FR-08 | Audit create/edit/submit/review/approve/publish/supersede/revoke/peran/login penting; actor, objek, waktu server, aksi, perubahan ringkas tanpa kredensial; admin nonaktifkan pengguna dan kelola kategori; ekspor final; backup database/lampiran dan restore staging | UAT-11,12,14; audit lintas fase; prioritas P0/P1 perlu Q-08 |
| §4–5,8 | Login; lima peran; kombinasi peran bila diizinkan; contributor terbatas milik/ditugaskan; admin tidak otomatis approver; pemeriksaan akses server; navigasi operasional dan Reader; approval briefing terpisah dari statement; reject wajib komentar | Matriks izin dan uji negatif semua fase; Q-02–05 |
| §7–9 | Relasi dokumen terjaga; soft delete; waktu UTC ditampilkan WIB; konflik edit diberi peringatan; informasi terbaru di atas, histori tersedia; status berlabel teks | Uji konflik dan zona waktu; Sprint 0–4 |
| §12 | Migrasi dokumen lama: inventaris, judul kanonis, isu aktif dahulu, background/ringkasan/3–5 update penting, tautan asal, label legacy/belum diverifikasi, bukti approval dan pemeriksaan editor sebelum portal | Prosedur migrasi manual, simulasi data sintetis; tidak membuat impor otomatis; Q-13 |

## Inventaris kebutuhan nonfungsional

| ID | Kebutuhan PRD | Konsekuensi desain dan verifikasi |
|---|---|---|
| NFR-01 | Session dan peran diperiksa semua endpoint | Tolak secara baku; pemeriksaan objek, status, penugasan dan peran di server; uji Reader terhadap URL/API/ekspor/pencarian |
| NFR-02 | HTTPS staging/produksi; rahasia tidak di repositori | Cookie aman, konfigurasi terpisah dan pengelolaan rahasia; produksi di luar tugas ini |
| NFR-03 | Integritas revisi, audit, snapshot | Transaksi atomik, constraint, proteksi mutasi snapshot; uji race dan rollback |
| NFR-04 | Uptime dan prosedur pemulihan disepakati TI | Ukuran ketersediaan, pemilik, dan prosedur insiden belum ditentukan; Q-14 |
| NFR-05 | Hipotesis halaman utama/detail ≤3 detik pada jaringan internal normal | Ukur di pilot sintetis; volume, perangkat, jaringan, persentil dan konkurensi perlu ditetapkan; bukan SLA |
| NFR-06 | Pencarian relevan dan tunduk akses | Dataset Bahasa Indonesia dan uji kebocoran judul/cuplikan/filter; bukan hanya uji SQL |
| NFR-07 | Backup otomatis dan restore berkala; RPO/RTO oleh pemilik | Backup konsisten database+lampiran, akses terbatas, pemulihan terisolasi dan bukti hasil; Q-14 |
| NFR-08 | Keyboard, label, kontras, status bukan warna saja | Uji manual keyboard/fokus/pembaca layar dan pemeriksaan otomatis; target standar perlu Q-17 |
| NFR-09 | Baca mobile/desktop, editor desktop | Uji alur Reader di ponsel, teks panjang dan orientasi; editor tidak boleh kehilangan data |
| NFR-10 | Docker; lingkungan dev/staging/produksi terpisah | Image reproducible, migrasi terkontrol dan konfigurasi eksternal; tidak menerapkan ke produksi |
| NFR-11 | Sanitasi rich text, URL, batas upload, XSS/CSRF | Validasi server, daftar elemen/atribut aman, protokol URL, otorisasi unduhan; Q-12 |
| NFR-12 | Retensi, klasifikasi, akses dan hosting disahkan TI | Tidak mengaktifkan pemusnahan permanen; dokumentasikan kebijakan sebelum data nyata/pilot |

## Temuan dan risiko implementasi

| Temuan / sumber | Dampak | Penanganan usulan / keputusan |
|---|---|---|
| Sumber Markdown telah tersedia dan dibaca seluruhnya | Perbedaan sumber telah diperiksa: 345 blok teks sama setelah normalisasi format | Q-01 selesai diverifikasi; gunakan `docs/EISH_PRD_v1.0.md`, tanpa mengubah PRD |
| Update memiliki pilihan Published (§8), tetapi model §7 tidak punya status/publisher | Draft bocor atau publikasi tidak terlacak | Tambahkan metadata publikasi dan rujukan revisi terbit; Q-04 |
| Current summary/background dan label isu bisa diedit, tanpa aturan publikasi | Reader dapat membaca perubahan belum disahkan meski update difilter | Pisahkan revisi internal dan revisi yang diterbitkan; cakupan kolom harus disahkan Q-04 |
| Keputusan persetujuan PO memperjelas §4,16 | Katim adalah Approver; satu tingkat; penulis dengan role Approver boleh menyetujui sendiri | Uji role server dan audit; rincian pemberian role/review/pencabutan yang belum dijawab tetap terbuka dalam Q-02/03 |
| Briefing status di induk, tetapi revisi published harus tetap tersedia (§7) | Draft revisi dapat menggantikan tampilan final | Status per revisi dan pointer published terpisah dari revisi kerja; Q-06 |
| Statement approved di masa depan, kedaluwarsa, dicabut atau approval bersamaan | Salah label Siap Digunakan; dua versi aktif | Validitas waktu server dan transaksi terkunci; jangan otomatis kembali ke versi lama; Q-07 |
| Apa yang Baru: terakhir dilihat atau briefing terakhir, created_at atau published_at | Update lama yang baru terbit hilang; titik acuan terhapus tanpa dibaca | Gunakan waktu publikasi untuk Reader, tentukan pembaruan titik acuan dan histori label Q-09 |
| P0/P1 FR-08 bercampur tetapi §3 memasukkan audit/backup/ekspor MVP | Fitur wajib dapat tertunda tanpa persetujuan | Tetap masukkan semua ke rencana, minta prioritas rinci Q-08 |
| Duplikat judul, pencarian Indonesia, volume dan filter tanggal tak rinci | Banyak false positive/negative, salah rentang waktu | Normalisasi deterministik dan peringatan nonblokir; evaluasi FTS konfigurasi simple dengan korpus dummy; Q-10,16 |
| Lampiran opsional tetapi backup lampiran masuk MVP | Pilihan storage dan permukaan serangan tidak jelas | Tentukan apakah aktif pada MVP, ukuran/jenis/akses/retensi; Q-12 |
| Konflik edit, versi rich text dan audit perubahan belum rinci | Kehilangan edit atau histori tak dapat direkonstruksi | Optimistic locking, snapshot konten tersanitasi, schema version; Q-15 |
| Ekspor minimal salah satu, asumsi PDF di §16 | Dependensi rendering dan pagination belum pasti | Rekomendasi PDF, tunggu Q-11; ekspor dari snapshot saja |
| Nonaktif akun bergantung kebijakan session belum ada | Session lama tetap mengubah data | Cek status akun setiap permintaan terlindungi; keputusan timeout Q-05 |
| Soft delete dan retensi belum menetapkan visibilitas snapshot/arsip | Referensi historis rusak atau informasi sensitif terungkap | Larang cascade destructive; snapshot tetap utuh dengan kebijakan akses; Q-13,14 |

## Batas ruang lingkup dan kelengkapan

MVP mencakup alur manual isu, briefing, statement, portal baca, pencarian, audit, ekspor dan pemulihan. Tidak mencakup crawling/scraping, API media sosial, sentimen, statistik volume, trend chart, alert algoritmik, AI/LLM/RAG, notifikasi WhatsApp, aplikasi native, kolaborasi real-time, microservices, vector database, Elasticsearch, atau SSO yang belum disetujui TI. Migrasi manual tidak berarti membuat integrasi Google Docs.

PRD §17 memuat contoh prompt untuk implementasi Sprint 0; instruksi pengguna saat ini membatasi keluaran pada analisis dan empat dokumen. Karena itu belum ada scaffold, migrasi database, seed, UI, layanan, atau deployment yang dibuat. Semua pengujian dalam dokumen ini merupakan rencana, bukan hasil eksekusi aplikasi.

## Prioritas temuan untuk peninjauan

| Tingkat | Temuan | Contoh kegagalan dan gerbang |
|---|---|---|
| Kritis | Batas final/draft tidak lengkap | Reader membuka isu terbit tetapi mendapat background yang baru diedit internal; Q-04 wajib sebelum schema publikasi Sprint 1 |
| Kritis | Penegakan mandat persetujuan | Hanya Katim ber-role Approver boleh menyetujui, termasuk karya sendiri; penulis biasa dan Admin tanpa role Approver tetap ditolak; Q-02/03 tersisa untuk rincian administrasi |
| Kritis | Versi final dan approval bersamaan | Dua approver memperbarui pointer atau snapshot berbeda; transaksi dan constraint harus diuji sebelum Sprint 2/3 selesai |
| Tinggi | Masa berlaku statement dan penarikan | Tombol salin memberi versi kedaluwarsa atau mengaktifkan arsip tanpa izin; Q-07 sebelum Sprint 2 |
| Tinggi | Pemulihan dan session | Akun nonaktif masih memakai sesi atau backup tidak mencakup lampiran; Q-05/14 sebelum kemampuan terkait dinyatakan lulus |
| Selesai | Verifikasi sumber PRD | Markdown resmi telah dibaca dan 345 blok teks setara DOCX setelah normalisasi; Q-01 tidak lagi menghalangi desain |
| Sedang | Relevansi pencarian, duplikat dan target kinerja | Hasil Bahasa Indonesia tidak relevan atau target 3 detik tidak dapat direproduksi; Q-10/16 sebelum verifikasi fase terkait |

Tingkat di atas adalah penilaian risiko teknis, bukan penggantian prioritas produk P0/P1. Tidak ada temuan yang memberi izin untuk memperluas fitur MVP.
