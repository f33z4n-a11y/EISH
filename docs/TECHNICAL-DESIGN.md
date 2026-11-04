# Usulan Desain Teknis EISH

> Edisi analisis berdasarkan permintaan terbaru. Seluruh rekomendasi memerlukan peninjauan; review terdahulu tidak dianggap sebagai keputusan atau persetujuan.

> Status: Usulan untuk ditinjau Product Owner (PO), 3 November 2026. Belum merupakan persetujuan implementasi.
> Sumber yang dibaca seluruhnya: `../EISH_PRD_v1.0.docx`, PRD v1.0, bagian 1–17. Berkas `PRD-EISH-v1.0.md` yang disebut dalam permintaan belum tersedia. PRD asli tidak diubah; kesetaraan dengan berkas Markdown perlu dikonfirmasi (Q-01).
> Bahasa dokumentasi dan antarmuka: Bahasa Indonesia. Nama teknologi, identifier, dan kode status dapat tetap memakai istilah teknis; label pengguna diterjemahkan. Pengembangan hanya memakai data sintetis. Tidak ada implementasi atau penerapan produksi pada tahap ini.

## Format, kedalaman, dan kriteria keluaran

Desain menggunakan tabel komponen, evaluasi teknologi, matriks izin, kontrak transisi, serta kamus entitas dengan kardinalitas dan constraint. Kedalaman sampai batas transaksi, aturan akses, konsistensi snapshot, dan strategi pengujian; belum berupa kode aplikasi, DDL, atau schema Prisma final.

Kriteria keluaran: setiap FR memiliki pemilik modul; seluruh teknologi yang diminta dievaluasi beserta keterbatasannya; model mencakup seluruh entitas PRD dan tambahan teknis yang dijelaskan alasannya; aturan publikasi/approval aman pada race; operasi pencarian, cache, ekspor dan lampiran tunduk izin; keputusan produk tidak disamarkan sebagai keputusan teknis. Rancangan baru boleh diimplementasikan setelah persetujuan PO.

## Standar keluaran desain

| Bagian | Format dan kedalaman yang diperlukan | Kriteria diterima |
|---|---|---|
| Teknologi | Kesesuaian, batasan, konsekuensi dan rekomendasi per teknologi | Ketujuh kelompok teknologi dievaluasi tanpa mengunci versi yang belum diverifikasi |
| Arsitektur | Komponen, tanggung jawab, jalur permintaan dan batas kepercayaan | Setiap FR mempunyai modul; browser tidak memutuskan izin atau mengakses database langsung |
| Model konseptual | Entitas, atribut inti, kardinalitas, FK, unique/check dan siklus hidup | Seluruh entitas PRD tercakup; tambahan teknis diberi alasan dan keputusan terkait |
| Perilaku kritis | Prasyarat, transisi, transaksi dan kegagalan | Snapshot tidak berubah; approval atomik; konflik edit tidak menimpa; audit ikut transaksi |
| Keamanan/operasi | Session, visibilitas, sanitasi, ekspor, lampiran dan pemulihan | Jalur kebocoran di luar halaman utama diperhitungkan; dependensi PO/TI jelas |

Dokumen ini adalah desain konseptual yang dapat ditinjau. Detail indeks, SQL migrasi, schema ORM, kontrak endpoint dan versi paket diturunkan setelah persetujuan; implementasinya tidak termasuk keluaran tahap ini.

## Pilihan arsitektur

Usulan: satu monolit modular Next.js/TypeScript, satu PostgreSQL dan penyimpanan lampiran privat bila lampiran disetujui. Browser mengakses Next.js melalui HTTPS di staging; server menangani autentikasi, kebijakan, layanan domain dan Prisma. PostgreSQL tidak diakses langsung browser. Tidak diperlukan microservices, message broker atau pencarian eksternal untuk MVP.

| Lapisan/modul | Tanggung jawab dan hubungan FR |
|---|---|
| Presentasi operasional dan portal Reader | Halaman sesuai §5, formulir ringkas, label Bahasa Indonesia, status berbasis teks, baca ponsel; FR-01–07 |
| Identitas dan kebijakan akses | Session, pengguna aktif, kombinasi peran, kepemilikan/penugasan, status objek; FR-07,08 dan §4 |
| Isu | Identitas, kategori, pemilik, revisi, duplikat, ringkasan, timeline, sumber dan publikasi update; FR-01–03 |
| Statement | Versi, submit/review/approve/supersede/revoke, validitas, pemilihan naskah salin; FR-05 |
| Briefing | Salinan dari isu, urutan, revisi, persetujuan, publikasi snapshot dan ekspor; FR-04 |
| Pencarian dan arsip | Query lintas modul menggunakan proyeksi yang telah dibatasi hak akses; FR-06 |
| Portal | Komposisi read model final dan titik acuan Apa yang Baru, tanpa mutasi konten; FR-03,07 |
| Administrasi dan audit | Akun, kategori, peran, kejadian audit dan pembacaan log terbatas; FR-08 |
| Infrastruktur | Database, storage, sanitasi, renderer ekspor, backup dan pemulihan; NFR-02,03,07,10,11 |

Struktur usulan: rute Next.js sebagai adaptor tipis; modul domain berisi layanan, validasi dan kebijakan; akses database melalui fungsi repository per modul; komponen UI tidak memutuskan izin. Server Actions maupun Route Handlers memanggil kebijakan yang sama. Hindari lapisan abstraksi generik yang tidak dibutuhkan. Unit test tidak memerlukan server web; uji integrasi memakai PostgreSQL sebenarnya.

## Evaluasi teknologi

| Teknologi | Kesesuaian | Batasan dan rekomendasi |
|---|---|---|
| Next.js + TypeScript | Satu aplikasi full-stack memudahkan operasional, SSR untuk baca dan tipe konsisten | Tipe bukan validasi runtime/izin. Pahami pemisahan server/client; cegah secret masuk bundle; jangan cache lintas pengguna untuk konten sensitif. Pilih rilis stabil yang masih didukung dan pin saat Sprint 0 |
| Tailwind CSS | Styling konsisten dan responsive | Tidak menyediakan aksesibilitas otomatis; komponen semantik, fokus dan kontras diuji. Hindari kelas yang tersebar tanpa komponen bersama |
| PostgreSQL | Cocok untuk relasi, transaksi, audit, JSONB snapshot dan full-text search | FTS Bahasa Indonesia perlu uji relevansi; mulai konfigurasi simple, jangan mengasumsikan stemming Indonesia tersedia. Indeks sesuai filter; migrasi dan backup wajib |
| Prisma ORM | Model relasi bertipe, migrasi dan transaksi mudah dirawat | Constraint parsial, proteksi snapshot dan FTS dapat membutuhkan SQL migrasi terulas. Hindari pola read-then-write tanpa locking; jangan memakai SQLite sebagai pengganti uji integrasi PostgreSQL |
| Tiptap | Rich text terstruktur dan extension terbatas cocok editor manual | Output tetap tidak terpercaya; sanitasi server. Tetapkan fitur format minimal dan versi schema JSON; pastikan extension/lisensi yang dipilih tersedia. Tidak mengaktifkan kolaborasi real-time |
| Auth.js + RBAC | Kandidat pengelolaan session; aturan domain tetap milik aplikasi | Provider login, masa sesi dan provisioning belum diputuskan. Auth.js bukan mesin RBAC. Rekomendasi session yang dapat dicabut dan cek akun aktif; jangan membuat akun bawaan untuk produksi |
| Docker | Lingkungan dev konsisten, dapat dipindah sesuai NFR-10 | Image/version dipin, proses non-root, health check, volume privat; migrasi dijalankan terkontrol. Container bukan backup atau pemisahan akses data secara otomatis |

Tidak menetapkan nomor versi tanpa pemeriksaan kompatibilitas paket, runtime, lisensi dan dukungan keamanan saat Sprint 0. PostgreSQL lokal via Docker mengikuti asumsi §16; volume lampiran privat atau S3-compatible ditentukan TI, bukan integrasi wajib baru. Ekspor PDF direkomendasikan sesuai asumsi PRD, masih menunggu Q-11.

## Otorisasi dan session

Semua akses: autentikasi → cek akun aktif/session → cek aksi/peran → cek penugasan dan objek → cek status/visibilitas → query/proyeksi → keluaran. ID yang diketahui tidak memberikan izin. Validasi dilakukan kembali saat transaksi mutasi untuk menghindari perubahan status di antara cek dan tulis. UI menyembunyikan aksi yang tidak boleh dilakukan, tetapi backend tetap menolak.

| Aksi | Contributor | Editor | Approver | Reader | Admin |
|---|---|---|---|---|---|
| Baca internal nonfinal | Sesuai lingkup tugas* | Konten operasional | Sesuai mandat* | Tidak | Tidak otomatis* |
| Buat/edit draft | Milik/ditugaskan | Semua konten operasional | Jika punya peran editor/contributor | Tidak | Tidak otomatis |
| Kirim review | Milik/ditugaskan | Ya | Jika peran relevan | Tidak | Tidak otomatis |
| Review/kembalikan | Tidak | Ya, komentar wajib | Sesuai mandat* | Tidak | Tidak otomatis |
| Publikasi update/revisi isu | Tidak | Usulan, Q-04 | Jika punya peran relevan | Tidak | Tidak otomatis |
| Setujui/terbitkan briefing | Tidak | Tidak otomatis | Sesuai mandat/sesi* | Tidak | Tidak otomatis |
| Setujui/cabut statement | Tidak | Tidak otomatis | Sesuai mandat* | Tidak | Tidak otomatis |
| Baca final dan salin approved berlaku | Sesuai akses | Ya | Ya | Ya | Sesuai akses* |
| Kelola pengguna/peran/kategori/audit | Tidak | Tidak | Tidak otomatis | Tidak | Ya |

Tanda * memerlukan Q-02–05; tabel adalah usulan konservatif, bukan aturan organisasi yang sudah disahkan. Peran gabungan tidak boleh melewati larangan self-approval bila larangan itu disepakati. Pemberian peran harus diaudit; otoritas admin memberi peran Approver perlu diputuskan. Pembacaan audit tidak memberi akses otomatis ke seluruh naskah sensitif.

Session: cookie HttpOnly, SameSite dan Secure di HTTPS; proteksi CSRF/origin sesuai mekanisme framework; tidak menyimpan session di URL. Nonaktif akun/ubah peran berlaku pada permintaan terlindungi berikutnya melalui pemeriksaan server. Login dibatasi percobaan dan kesalahan tidak mengungkap keberadaan akun; durasi dan provider menunggu PO/TI. Semua rahasia lewat konfigurasi lingkungan aman, tidak dicatat di audit.

## Model data konseptual

Semua ID stabil dan tidak bergantung judul/slug. Waktu kejadian server memakai timestamp berzona waktu dan disimpan UTC; tanggal briefing dan tanggal peristiwa bisnis memakai date bila memang tidak memerlukan jam (Q-15). Tampilkan WIB; jangan mengubah date menjadi tanggal lain karena konversi zona waktu. Kolom audit aktor/waktu wajib pada mutasi penting.

| Entitas | Atribut utama | Relasi dan constraint |
|---|---|---|
| User | id, nama, email, status, waktu dibuat/diubah | Email unik ternormalisasi; 1:N isu, update, revisi, approval dan audit; nonaktif tanpa menghapus jejak |
| Role, UserRole | id/kode peran; user_id, role_id | User N:M Role; pasangan unik; mandat tambahan hanya setelah Q-02,03 |
| Session (teknis) | id/token hash, user_id, expires_at | User 1:N Session; implementasi mengikuti provider yang disetujui |
| Category | id, nama, active | 1:N Issue; nonaktif tidak menghapus kategori historis |
| Issue | id, slug, judul, kategori, owner_id, keywords, first_recorded_date, lifecycle_status, attention_flag, deleted_at, lock_version | Category/User 1:N Issue; Issue 1:N Update, Statement, Revision, Source; status perhatian terpisah; slug boleh berubah tetapi tautan ID tetap |
| IssueRevision (usulan teknis Q-04) | issue_id, revision_no, judul/background/summary/label_snapshot, edited_by, edited_at, published_by/at | Issue 1:N; nomor unik per isu; pointer revisi kerja dan revisi terbit terpisah; perubahan internal tidak menimpa proyeksi Reader |
| IssueUpdate | id, issue_id, event_date, sesi?, judul?, materiality, attention_flag, creator_id, created_at, updated_at, deleted_at, lock_version, published_revision_id? | Issue 1:N Update; waktu input terpisah tanggal peristiwa; sumber/publikasi terikat revisi yang benar |
| IssueUpdateRevision | id, update_id, revision_no, body_snapshot, metadata/source_snapshot, edited_by/at, publication_status, published_by/at | Update 1:N Revision; unique(update_id,revision_no); revisi terbit immutable; perubahan setelah terbit menjadi revisi kerja baru |
| SourceReference | id, issue_id, update_id?, title, url?, source_type, attachment_id? | Issue 1:N Source; Update 0..1:N Source; jika update diisi harus milik issue yang sama; nilai sumber disalin saat publikasi |
| Briefing | id, tanggal, sesi, title, author_id, current_revision_id, published_revision_id? | 1:N BriefingRevision; pointer wajib merujuk revisi briefing sendiri; tanggal/sesi tidak diasumsikan unik sebelum Q-06 |
| BriefingRevision | id, briefing_id, revision_no, status, pengantar, content_snapshot, schema_version, approved_by/at?, published_by/at?, lock_version | Unique(briefing_id,revision_no); status di tingkat revisi; versi published immutable; pointer induk tidak menentukan isi snapshot |
| BriefingItem | id, revision_id, issue_id, display_order, copied_snapshot, selected_update_revision_ids | BriefingRevision 1:N Item; Issue 1:N Item sehingga Issue N:M Briefing; unique(revision_id,display_order); snapshot teks/judul/sumber, bukan sekadar ID hidup |
| Statement | id, issue_id, title, current_approved_version_id?, deleted_at | Issue 1:N Statement; pointer hanya ke versi statement sendiri; satu pointer per statement |
| StatementVersion | id, statement_id, version_no, title_snapshot, rich_text/text, canonical_copy_text, status, change_reason, created_by, edited_by, approved_by/at?, valid_from/until?, sensitivity, revoked_by/at/reason?, lock_version | Unique(statement_id,version_no); valid_until > valid_from bila keduanya ada; isi approved/superseded/revoked tidak dapat diedit; nomor versi tidak dipakai ulang |
| ReviewDecision (usulan teknis) | id, jenis_objek, revision/version_id, actor_id, aksi, komentar, waktu | Riwayat submit/reject/approve per versi; gunakan FK bertipe atau constraint tepat satu target, hindari referensi polimorfik tanpa validasi; dua tingkat approval baru setelah Q-03 |
| AuditEvent | id, actor_id, entity_type/id, aksi, server_timestamp, metadata ringkas | User 1:N Audit; append-only, akses terbatas, tanpa password/token; mencatat perubahan dan rujukan revisi |
| Attachment | id, nama_asli, storage_key, mime_type, size, checksum, uploaded_by/at, deleted_at? | Direferensikan Source; key privat unik; akses mengikuti objek induk; backup bersama database; hanya jika lampiran diaktifkan |
| ReaderCheckpoint (usulan teknis Q-09) | user_id, konteks, last_seen_at atau briefing_revision_id | Menyimpan titik acuan sesuai FR-03; unique(user_id,konteks); bukan pelacakan analitik |

IssueRevision, Session, ReviewDecision, dan ReaderCheckpoint mendukung persyaratan yang sudah ada; bukan fitur produk tambahan. Bentuk final dan kolom bersyarat menunggu keputusan terkait. Audit ringkas tidak menggantikan histori isi; sumber, label dan metadata yang memengaruhi final perlu masuk snapshot. Relasi penting memakai FK dan restrict; hapus lunak tidak melakukan cascade fisik ke histori. Indeks awal: FK, status+published_at, issue_id+event_date, tanggal+sesi briefing, statement_id+version_no, actor+timestamp audit, serta GIN FTS pada proyeksi yang sesuai hak akses. Indeks final ditentukan dengan query dan volume sintetis.

## Transisi dan batas transaksi

1. **Edit**: permintaan membawa lock_version yang dibaca; update bersyarat menaikkan versi. Versi berbeda menghasilkan konflik yang jelas tanpa menimpa edit lain. Simpan revisi dan audit dalam transaksi yang sama; UI mempertahankan input untuk disalin atau dimuat ulang. Tidak ada kolaborasi real-time.
2. **Update/isu terbit**: usulan revisi internal → diterbitkan Editor; simpan konten tersanitasi dan referensi sumber saat itu; Reader hanya mendapat revisi terbit. Perubahan draft berikutnya tidak memengaruhi final. Detail penarikan/visibilitas menunggu Q-04.
3. **Briefing**: Draft → Dalam Review → Disetujui → Terbit; pengembalian → Draft dengan komentar. Edit isi yang telah disetujui membatalkan approval dan kembali Draft (usulan Q-06). Publish mengunci revisi, memeriksa mandat, menyimpan snapshot lengkap dan audit, lalu mengubah pointer published secara atomik. Setelah terbit, buat revisi baru; revisi terbit lama tetap tersedia sesuai izin.
4. **Statement**: Draft → Dalam Review → Disetujui; approval baru mengubah approved sebelumnya menjadi Digantikan. Kunci baris Statement dan periksa ulang versi/status/mandat; update status lama, status baru, pointer dan audit dalam satu transaksi. Constraint unik parsial untuk status approved per statement menjadi pertahanan tambahan; migrasi SQL bila ORM tidak mendukung. Konflik approval harus dilaporkan, bukan membuat dua versi approved.
5. **Pencabutan**: Disetujui → Dicabut dengan alasan wajib, bersihkan pointer yang cocok dan audit dalam transaksi. Tidak mengaktifkan versi Digantikan secara otomatis. Versi dapat disalin melalui tombol utama hanya bila approved, pointer cocok, waktu server dalam rentang berlaku dan pengguna boleh membaca. Semantik approval masa depan perlu Q-07 sebelum finalisasi invariant satu approved.
6. **Immutabilitas**: layanan melarang edit/hapus isi final, database membatasi UPDATE/DELETE kolom snapshot melalui peran aplikasi/trigger terulas. Perubahan lifecycle statement hanya pada metadata status yang diizinkan dan diaudit. Migrasi memakai kredensial terpisah; pengujian juga mencoba bypass ORM dengan SQL. Hash konten dapat membantu pemeriksaan integritas, tetapi tidak menggantikan larangan mutasi.

## Pencarian, cache, ekspor, dan konten

Query Reader membatasi sumber final sebelum ranking, pagination, cuplikan maupun filter dihitung. Tidak mengambil semua draft lalu menyaring di browser. Gunakan FTS PostgreSQL untuk isi teks yang diekstrak dari rich text, dengan korpus Bahasa Indonesia sintetis; filter tanggal harus menyebut makna tanggal. Peringatan duplikat dimulai dari normalisasi judul, bukan AI dan bukan penggabungan otomatis. Soft-deleted tidak muncul di daftar biasa; akses arsip harus mengikuti Q-13.

Mulai tanpa cache bersama untuk data terlindungi. Jika caching ditambahkan kelak untuk target PRD, kunci harus mencakup visibilitas dan invalidasi saat publish/revoke/nonaktif akun; cek izin tetap pada setiap akses. Respons error, nama berkas, metadata dan tautan unduhan tidak boleh membocorkan draft.

Tiptap menyimpan JSON tervalidasi dengan schema_version; renderer server hanya menerima node/atribut yang diizinkan. Sanitasi berlaku pada simpan, render dan ekspor; tolak URL javascript/data dan protokol tak disetujui. Jangan mengambil URL referensi secara otomatis. Renderer PDF memakai snapshot, aset lokal yang disetujui dan tanpa akses jaringan arbitrer. Teks salin statement memiliki representasi kanonis dari versi approved dan diuji karakter demi karakter; keputusan format perlu Q-07,11,15.

Upload bila diaktifkan: batas ukuran/jenis di server, verifikasi isi/MIME, nama storage acak, di luar direktori publik, unduh lewat pemeriksaan akses objek; jangan menjalankan/merender konten aktif. Pemindaian malware dan format yang aman perlu kesepakatan TI, tidak diasumsikan layanan eksternal baru. Simpan checksum dan metadata tanpa rahasia.

## Operasional dan batas kesiapan

Development: Next.js dan PostgreSQL lokal, data dummy berlabel jelas, seed lima peran, tanpa koneksi layanan pemerintah. Docker Compose dapat digunakan setelah desain disetujui. Staging terisolasi diperlukan untuk uji HTTPS dan restore sintetis; tidak ada penerapan produksi dalam rencana tugas ini.

Backup harus mencakup database, lampiran dan versi schema secara konsisten, dengan akses terbatas dan enkripsi sesuai kebijakan TI. Prosedur restore mencatat waktu, jumlah/relasi record, checksum lampiran, keberadaan snapshot serta akses Reader; RPO/RTO dan jadwal belum disepakati. Log aplikasi merangkum kegagalan operasional tanpa body dokumen atau kredensial; audit domain tersimpan atomik. Kegagalan audit pada mutasi penting menggagalkan transaksi.

Usability: label Indonesia, ringkasan terbaru di atas, status teks, tanggal WIB, keadaan kosong jelas, peringatan konflik dan hasil simpan yang dapat dipahami. Uji keyboard, fokus, kontras dan alur salin 2–3 klik. Target ≤3 detik baru dapat dinilai setelah profil beban/perangkat/jaringan disepakati. Belum ada klaim desain lolos uji keamanan, performa atau aksesibilitas.

## Pemetaan halaman dan kontrak respons

| Rute sesuai PRD §5 | Modul dan isi | Aturan server |
|---|---|---|
| `/dashboard` | Portal: Apa yang Baru, isu perhatian, briefing dan statement final | Gunakan titik acuan pengguna serta proyeksi final; bukan dashboard statistik |
| `/issues`, `/issues/[id]` | Isu: daftar/filter, ringkasan, background, timeline, sumber, dokumen terkait | Reader memakai revisi terbit; ID stabil; halaman internal mengikuti peran/penugasan |
| `/issues/[id]/updates/new` | Isu: input manual dan sumber | Tolak pengguna tanpa izin sebelum menulis; validasi tanggal/konten dan lock_version |
| `/briefings`, `/briefings/new`, `/briefings/[id]` | Briefing: daftar, editor dan snapshot | Reader hanya revisi terbit; publish membutuhkan mandat Approver |
| `/statements`, `/statements/[id]` | Statement: isi, status, versi dan salin | Default versi approved berlaku; riwayat mengikuti keputusan akses Q-07 |
| `/archive` | Pencarian/arsip lintas tipe | Batasi query sebelum ranking/cuplik/filter; jangan mengungkap keberadaan draft |
| `/admin` | Pengguna, peran, kategori dan audit | Hak administrasi tidak memberikan hak approval substansi |

Kode URL mengikuti PRD, sedangkan judul menu dan pesan pengguna memakai Bahasa Indonesia. Kontrak minimum mutasi memuat identitas objek, versi yang dibaca dan payload tervalidasi; identitas aktor diambil dari session server, bukan input browser. Tanggapan membedakan belum masuk, izin ditolak, validasi gagal dan konflik edit tanpa menampilkan isi sensitif. Kebijakan 403/404 untuk objek tersembunyi harus konsisten agar tidak membocorkan keberadaan draft.

## Keterbatasan dan alternatif yang ditolak untuk MVP

Monolit dipilih karena alur manual dan transaksi lintas status lebih sederhana dirawat dalam satu aplikasi. Memisahkan backend menjadi layanan terpisah menambah autentikasi antarservice dan deployment tanpa kebutuhan PRD. PostgreSQL dipilih karena snapshot, versi dan relasi membutuhkan konsistensi transaksional; penyimpanan dokumen bebas skema tidak menghilangkan kebutuhan invariant relasional. Redis, message broker, mesin workflow umum dan layanan pencarian eksternal tidak dimasukkan. Bila uji profil nyata kelak menunjukkan batas, perubahan arsitektur diajukan melalui review tersendiri.

Risiko operasional satu aplikasi ditangani melalui pembatasan akses database/storage, transaksi singkat, observabilitas operasional dasar sesuai NFR-04, backup dan prosedur pemulihan. Rancangan ini tidak mengklaim high availability atau kepatuhan organisasi sebelum TI menetapkan dan menguji kriterianya.
