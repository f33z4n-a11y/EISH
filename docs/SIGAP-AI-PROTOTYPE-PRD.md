# PRD Prototipe Asisten Analisis Laporan untuk SIGAP

**Versi:** 0.2 — rancangan untuk tinjauan pemilik produk
**Tanggal:** 14 November 2026
**Nama produk:** SIGAP — Sistem Intelijen dan Gerak Analisis Publik
**Pemilik keputusan produk:** Pemilik produk SIGAP
**Cakupan pelaksanaan:** Modul terpisah dalam SIGAP; analisis awal memakai PDF yang disediakan pengguna secara lokal, sedangkan integrasi aplikasi dan database tetap memakai data sintetis sampai tata kelola data nyata disahkan

## 1. Ringkasan

Prototipe membantu tim monitoring mengubah laporan monitoring harian berbentuk PDF menjadi **usulan** isu baru, perkembangan isu yang sudah ada, kategori, prioritas, serta draf Standby Statement. Manusia memeriksa setiap usulan sebelum menjadi konten SIGAP. Penerbitan isu/perkembangan tetap mengikuti izin Editor yang berlaku; Standby Statement tetap memerlukan persetujuan Katim ber-role Approver. Reader hanya melihat informasi final yang memang boleh dibaca.

Dokumen ini melengkapi [PRD EISH v1.0](EISH_PRD_v1.0.md), yang mengecualikan AI dari cakupan awal. Keputusan dan implementasi SIGAP yang lebih baru tetap menjadi acuan untuk status penanganan, prioritas, taksonomi kategori, dan alur publikasi. PDF laporan yang sudah diberikan pengguna menjadi acuan bentuk dan analisis lokal; tidak ada kewajiban membuat PDF sintetis baru. Dokumen ini tidak mengubah PRD historis dan belum mengizinkan penyimpanan isi laporan nyata ke database aplikasi, pengiriman dokumen ke penyedia AI eksternal, pilot, atau produksi.

## 2. Masalah, tujuan, dan ukuran keberhasilan

Petugas saat ini perlu membaca laporan, menentukan apakah topik merupakan isu baru atau perkembangan, menyalin fakta dan sumber, menilai prioritas, lalu menyusun pernyataan. Pekerjaan berulang ini memakan waktu dan berisiko menghasilkan duplikasi atau kehilangan jejak asal informasi.

**Tujuan prototipe:**

1. Menghasilkan usulan yang bisa ditinjau dari format PDF laporan yang sudah dimiliki pengguna, dengan bukti asal yang jelas.
2. Mempercepat penyiapan draf tanpa mengalihkan keputusan editorial dan persetujuan kepada AI.
3. Mengukur kesalahan ekstraksi, klasifikasi, duplikasi, dan narasi sebelum mempertimbangkan pilot.

**Ukuran keberhasilan awal (target evaluasi prototipe, bukan janji produksi):** seluruh usulan yang diterima memiliki rujukan halaman; tidak ada usulan AI yang otomatis terbit; tidak ada draf statement yang muncul sebagai “Siap digunakan” sebelum approval; ketepatan pemilihan kategori dan keputusan isu baru/perkembangan masing-masing minimal 80% terhadap penilaian Editor pada topik yang telah diberi kunci jawaban; 100% klaim faktual dalam sampel draf yang diterima dapat dilacak ke bukti atau ditandai perlu verifikasi. Jumlah laporan dan topik evaluasi ditetapkan setelah meninjau bahan yang tersedia; tidak ada kewajiban membuat PDF sintetis baru. Catat pula waktu review dan alasan koreksi sebagai dasar keputusan tahap berikutnya.

## 3. Pengguna dan kewenangan

| Peran | Tindakan pada prototipe |
|---|---|
| Contributor | Memulai analisis bila diberi akses; membaca dan menyunting usulan dalam lingkup isu milik/ditugaskan; mengajukan review. |
| Editor | Meninjau seluruh usulan operasional, memilih isu baru atau perkembangan, memperbaiki kategori/prioritas/teks, menolak usulan, dan menerbitkan konten isu sesuai kebijakan SIGAP. |
| Approver | Meninjau dan menyetujui versi Standby Statement dengan aturan satu tingkat yang sudah berlaku; dapat menyetujui karya sendiri bila memang memegang role ini. |
| Reader | Hanya melihat isu/perkembangan yang telah terbit dan statement approved yang berlaku; tidak melihat laporan, hasil ekstraksi, usulan, atau draf AI. |
| Admin | Mengelola akses dan audit teknis; tidak otomatis berwenang menyetujui substansi. |

Semua izin diperiksa pada server. Identitas pemulai analisis, editor yang menerima/mengubah usulan, penerbit, dan approver disimpan terpisah dalam audit.

## 4. Cakupan prototipe

### Termasuk

- Menu baru **Usulan AI** untuk unggah satu PDF monitoring per proses, memeriksa format, ukuran, dan identitas dokumen, serta meninjau hasil. Menu hanya tampil bagi peran operasional yang diizinkan saat fitur aktif.
- Ekstraksi teks dan tabel serta pembacaan halaman yang berupa gambar/OCR bila diperlukan; tiap temuan menunjuk nomor halaman dan cuplikan sumber.
- Pembedaan tanggal laporan, rentang waktu data, waktu peristiwa yang disebut laporan, dan waktu pemrosesan.
- Pengelompokan topik yang berulang antarbagian laporan, serta saran mengaitkan ke isu yang sudah ada sebelum membuat isu baru.
- Usulan kategori dari taksonomi aktif SIGAP, prioritas `Sangat tinggi/Tinggi/Sedang/Rendah`, status penanganan `Aktif/Dipantau/Selesai`, beserta alasan dan ketidakpastian.
- Usulan ringkasan, latar belakang, perkembangan, dan draf Standby Statement dalam Bahasa Indonesia.
- Antrean review dengan aksi terima, edit, gabung/tautkan ke isu, tolak, dan simpan keputusan; setiap aksi dapat ditelusuri.
- Agen verifikasi web **opsional** yang dapat dinyalakan atau dimatikan. Bila aktif, agen mencari sumber publik yang relevan, mencatat URL dan waktu penelusuran, membedakan informasi pada tanggal laporan dari perkembangan sesudahnya, dan menampilkan hasil sebagai bahan review manusia. Bila mati atau gagal, analisis PDF dan review tetap dapat berjalan.
- Integrasi hasil yang diterima ke alur draf/publikasi isu dan versi statement yang sudah berlaku, tanpa melewati persetujuan manusia.
- Sakelar fitur utama yang dapat menonaktifkan menu, API, pemrosesan baru, dan konversi usulan AI ke draf SIGAP. Saat nonaktif, alur isu, perkembangan, briefing, statement, pencarian, dan Reader tetap berfungsi seperti biasa.
- Analisis lokal secara baca saja atas PDF yang telah diberikan pengguna; pengujian penyimpanan dan integrasi memakai akun serta database sintetis terisolasi sampai penggunaan data nyata disahkan.

### Di luar cakupan

- Crawling web massal, API media sosial, penetapan kebenaran otomatis dari hasil web, analitik sentimen baru, peringatan otomatis, dan pemrosesan massal tanpa tinjauan. Agen verifikasi web terbatas pada pencarian sumber publik sebagai bahan review.
- Keputusan prioritas final, penerbitan isu/perkembangan, atau persetujuan statement oleh agen.
- Pembuatan briefing otomatis, pengiriman ke pihak luar, dan pemrosesan dokumen internal nyata pada tahap prototipe.

## 5. Alur pengguna

1. Saat fitur utama aktif dan pengguna berizin, petugas membuka menu **Usulan AI**, memilih laporan, dan memulai analisis. Sistem menampilkan status proses serta kesalahan yang dapat diperbaiki.
2. Sistem mengekstrak isi, mendeteksi tanggal dan topik, lalu menghasilkan daftar usulan. Satu topik dapat menghasilkan satu usulan perkembangan pada isu lama, bukan selalu isu baru.
3. Bila opsi verifikasi web aktif, sistem menambahkan sumber publik yang ditemukan, tanggal pencarian, kecocokan atau pertentangan yang perlu ditinjau. Kegagalan verifikasi web tidak menghapus usulan berbasis PDF.
4. Editor membuka usulan beserta bukti halaman, kandidat isu yang mirip, alasan kategori dan prioritas, serta draf pernyataan. Editor dapat menerima sebagian dan menolak bagian lain.
5. Usulan yang diterima menjadi draf isu/perkembangan dan draf versi Standby Statement. Editor memeriksa lagi konteks dan menerbitkan isu/perkembangan sesuai izin yang berlaku.
6. Approver meninjau versi statement yang diajukan. Hanya versi approved dan masih berlaku dapat ditampilkan kepada Reader sebagai “Siap digunakan”.
7. Audit menampilkan asal usulan, perubahan manusia, keputusan publikasi, dan persetujuan tanpa menyimpan rahasia atau isi sensitif dalam log teknis.

## 6. Kebutuhan fungsional

| ID | Kebutuhan | Kriteria penerimaan |
|---|---|---|
| AI-01 | Penerimaan dokumen | PDF nonvalid ditolak; laporan yang sama dapat dikenali dengan hash; pemrosesan ulang tidak menggandakan usulan tanpa keputusan eksplisit. |
| AI-02 | Ekstraksi dan provenance | Setiap fakta/angka yang diajukan memiliki halaman dan cuplikan; bagian gambar atau tabel yang gagal dibaca ditandai untuk pemeriksaan manual. |
| AI-03 | Normalisasi waktu | Tanggal laporan dan periode data tersimpan terpisah; tanggal peristiwa tidak ditebak dari tanggal unggah. |
| AI-04 | Pengelompokan dan duplikat | Topik berulang dalam satu laporan digabung sebagai kandidat; isu SIGAP yang mirip ditampilkan; penggabungan ke isu lama memerlukan keputusan manusia. |
| AI-05 | Klasifikasi | Kategori dipilih hanya dari taksonomi aktif dan menampilkan kode; bila tidak yakin, sistem menandai “Perlu penentuan Editor”. |
| AI-06 | Prioritas dan status | Sistem menyarankan nilai beserta alasan yang mengacu pada dampak, urgensi, jangkauan, perkembangan, dan kepastian bukti. Volume percakapan/sentimen saja tidak menentukan prioritas. Editor dapat mengubah nilai dan alasannya tercatat. |
| AI-07 | Draf isi | Ringkasan, latar belakang, perkembangan, dan statement memisahkan fakta, dugaan, serta hal yang perlu diverifikasi; tidak menciptakan kutipan, angka, tautan, atau sikap resmi yang tidak ada di sumber. |
| AI-08 | Review dan publikasi | Hasil AI selalu berstatus usulan/draf; Reader tidak dapat mengaksesnya lewat UI, API, pencarian, atau ekspor. Publikasi hanya melalui tindakan pengguna berizin. |
| AI-09 | Persetujuan statement | Statement AI mengikuti versi dan alur review yang berlaku; approval Approver diperlukan; versi approved lama tetap berlaku selama versi baru masih draf. |
| AI-10 | Jejak keputusan | Simpan identitas dokumen, waktu, versi konfigurasi/model, versi prompt, usulan, keputusan manusia, dan perubahan inti; jangan menulis PDF lengkap atau data rahasia ke log. |
| AI-11 | Kegagalan proses | Kegagalan ekstraksi/model tidak menghasilkan isu atau statement parsial yang terbit; pengguna melihat status gagal dan dapat mengulang dengan aman. |
| AI-12 | Verifikasi web opsional | Sakelar terpisah mengendalikan pencarian web; hasil menampilkan URL, waktu pencarian, dan hubungan dengan klaim PDF; hasil web tidak otomatis mengubah prioritas, isi, atau status verifikasi final. Saat nonaktif/gagal, analisis PDF tetap selesai. |
| AI-13 | Penonaktifan fitur | Sakelar utama dapat mematikan menu dan seluruh endpoint/proses AI di server tanpa mengubah endpoint serta alur SIGAP yang sudah ada. Proses berjalan dihentikan aman atau ditandai batal; usulan lama tidak otomatis diterbitkan. Mengaktifkan kembali fitur tidak menjalankan ulang laporan tanpa tindakan pengguna. |

## 7. Rancangan pengalaman review

Menu **Usulan AI** berdiri terpisah dari menu **Isu** dan **Standby Statement** yang ada. Antrean usulan menampilkan judul topik, kode kategori, jenis usulan (isu baru/perkembangan), prioritas, tingkat keyakinan, serta status review. Detail usulan menampilkan dua kolom pada desktop: draf SIGAP dan bukti dari laporan; pada ponsel keduanya disusun vertikal. Setiap klaim penting dapat dibuka ke halaman sumber. Hasil verifikasi web, bila diaktifkan, tampil sebagai panel terpisah dengan URL dan tanggal pencarian; labelnya membedakan sumber pada periode laporan dari berita susulan. Tindakan `Terima sebagai draf`, `Tautkan ke isu`, `Edit`, dan `Tolak` memiliki label jelas. Penolakan atau perubahan kategori/prioritas meminta alasan singkat agar evaluasi kualitas model dapat dilakukan. Antarmuka tidak menggunakan warna sebagai satu-satunya penanda status.

## 8. Data, keamanan, dan batas kepercayaan

- PDF yang sudah disediakan dapat dianalisis secara lokal dan baca saja sebagai acuan format serta contoh penilaian manual; jangan menyalin isinya ke repo, log, atau database aplikasi sebelum izin penggunaan data nyata ditetapkan. Pengujian penyimpanan, antrean, dan konversi ke SIGAP menggunakan akun/database sintetis terpisah dari database development utama. Tidak perlu membuat PDF sintetis baru sebagai prasyarat pekerjaan.
- Isi PDF diperlakukan sebagai **data tidak tepercaya**, termasuk kalimat yang tampak seperti instruksi untuk agen. Instruksi di dalam dokumen tidak boleh mengubah kebijakan, hak akses, atau tindakan sistem.
- Pilihan model lokal atau penyedia eksternal belum ditetapkan. Sebelum memakai data nyata, PO dan Tim TI harus menetapkan klasifikasi data, lokasi pemrosesan, pengiriman ke penyedia, retensi, akses, enkripsi, dan prosedur penghapusan. Persetujuan penggunaan prototipe sintetis tidak otomatis mencakup data nyata.
- Pencarian web opsional hanya mengirim istilah pencarian minimum yang disetujui; jangan mengirim seluruh PDF atau cuplikan internal ke mesin pencari. Akses jaringan dan sumber yang boleh ditelusuri tunduk keputusan Tim TI. Konten halaman web juga diperlakukan sebagai data tidak tepercaya, bukan instruksi agen.
- Akses berkas asli dan hasil ekstraksi hanya untuk peran operasional berizin; Reader tidak memperoleh akses. Batasi ukuran dan jenis berkas, cegah pembacaan path/URL arbitrer, dan sanitasi keluaran sebelum ditampilkan.
- Sumber yang hanya berupa klaim dalam laporan diberi label “berdasarkan laporan”; tautan artikel/unggahan hanya disimpan bila benar-benar tersedia dan diverifikasi. Nomor halaman bukan pengganti tautan sumber primer.

## 9. Evaluasi dan UAT

Gunakan PDF yang sudah dimiliki pengguna untuk memahami bentuk laporan dan menyiapkan kunci penilaian manusia secara lokal. Kasus uji penyimpanan/integrasi dapat dibuat sebagai data terstruktur sintetis tanpa menyusun PDF sintetis baru. Evaluasi mencakup topik berulang, isu lama yang mendapat perkembangan, tabel dengan angka, halaman gambar, tanggal laporan yang berbeda dari periode data, sumber tanpa URL, klaim yang saling bertentangan, serta teks tidak tepercaya yang mencoba memberi instruksi kepada agen.

UAT minimum:

1. Satu topik yang disebut di ringkasan dan tabel menghasilkan satu usulan yang memuat bukti keduanya.
2. Topik lanjutan ditawarkan sebagai perkembangan pada isu yang benar; Editor dapat tetap memilih isu baru.
3. Kategori/prioritas/status dapat dikoreksi tanpa mengubah fakta atau menghilangkan alasan awal.
4. Draf statement yang memuat dugaan tidak menyatakannya sebagai fakta atau sikap resmi.
5. Reader tidak dapat melihat usulan, ekstraksi, atau draf; statement approved lama tidak tergantikan oleh draf baru.
6. Kegagalan OCR/model, unggahan ganda, dan analisis ulang tidak menghasilkan publikasi atau duplikasi diam-diam.
7. Audit menunjukkan seluruh keputusan manusia dan rujukan usulan asal.
8. Dengan verifikasi web dimatikan dan saat layanan web gagal, usulan berbasis PDF tetap dapat ditinjau. Dengan verifikasi aktif, sumber dan tanggalnya terlihat serta klaim yang belum terkonfirmasi tidak otomatis disahkan.
9. Dengan sakelar utama dimatikan, menu dan endpoint AI tidak dapat dipakai oleh peran mana pun, sedangkan alur manual isu hingga Reader tetap lulus pengujian.

Laporan hasil prototipe mencatat nilai metrik pada §2, contoh kesalahan, waktu proses/review, hasil uji keamanan dan akses, serta keputusan lanjut/perbaiki/hentikan. Tidak menyebut target tercapai sebelum pengukuran dilakukan.

## 10. Tahap pelaksanaan dan gerbang keputusan

| Tahap | Keluaran | Gerbang lanjut |
|---|---|---|
| 1. Persiapan | Tinjauan lokal PDF yang sudah tersedia, kunci penilaian, skema usulan, rubrik prioritas, keputusan lokasi model dan batas pencarian web | PO menyetujui rubrik dan contoh keluaran; Tim TI menilai arsitektur pemrosesan serta kebijakan jaringan. |
| 2. Analisis terisolasi | Ekstraksi, pengelompokan, klasifikasi dan draf tanpa menulis ke isu SIGAP | Bukti halaman dan metrik dasar dapat diperiksa Editor. |
| 3. Verifikasi web opsional | Pencarian sumber publik dengan sakelar terpisah, rujukan URL/waktu, dan penanganan kegagalan | Mode aktif, nonaktif, serta gagal diuji tanpa memengaruhi analisis PDF. |
| 4. Review terintegrasi | Menu dan antrean usulan, konversi terpilih menjadi draf SIGAP, serta sakelar utama | Tes role, duplikat, audit, kebocoran Reader, dan alur manual saat fitur nonaktif lulus. |
| 5. Uji penerimaan | UAT pada data yang diizinkan dan laporan evaluasi | PO menilai hasil; keputusan terpisah diperlukan untuk penyimpanan/pemrosesan data nyata dalam aplikasi dan pilot. |

## 11. Keputusan terbuka

| ID | Pertanyaan untuk PO/Tim TI | Rekomendasi awal |
|---|---|---|
| D-01 | Siapa yang boleh mengunggah laporan dan memulai analisis? | Contributor dan Editor yang ditugaskan. |
| D-02 | Apakah review usulan harus selalu oleh Editor sebelum masuk sebagai draf isu? | Ya; Contributor dapat mengoreksi usulan, Editor memutuskan konversi. |
| D-03 | Rubrik prioritas apa yang disahkan, terutama untuk isu berisiko tinggi tetapi volume rendah? | Dampak dan urgensi lebih penting daripada volume; tetapkan contoh per tingkat. |
| D-04 | Model dijalankan lokal atau memakai penyedia eksternal? | Putuskan bersama Tim TI sebelum menghubungkan dokumen apa pun yang bukan sintetis. |
| D-05 | Kapan laporan nyata, bila ada, boleh dipakai dan siapa pemilik izin? | Keputusan terpisah setelah evaluasi prototipe dan tata kelola data disahkan. |
| D-06 | Berapa lama PDF, hasil ekstraksi, hasil web, dan usulan ditahan? | Tetapkan retensi dan penghapusan eksplisit sebelum implementasi storage. |
| D-07 | Apakah satu PDF dapat dianalisis ulang setelah koreksi model/prompt? | Ya, sebagai run baru dengan riwayat dan pencegahan duplikat. |
| D-08 | Sumber web apa yang boleh dicari, dan apakah istilah pencarian boleh keluar dari lingkungan internal? | Mulai dari sumber publik yang diizinkan Tim TI dan kirim istilah minimum; opsi web default nonaktif. |
| D-09 | Siapa yang boleh mengubah sakelar fitur utama dan opsi verifikasi web? | Operator/Admin sesuai mandat, dengan audit; sakelar utama dapat dimatikan tanpa migrasi atau perubahan alur manual. |

**Status:** PRD ini siap ditinjau; target dan rekomendasi di atas belum menjadi hasil pengujian atau izin pemrosesan data nyata.
