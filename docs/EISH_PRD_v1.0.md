# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Executive Issue & Statement Hub (EISH) — Versi 1.0

**Status:** Draft untuk validasi pemilik produk  
**Tanggal:** 3 November 2026  
**Pemilik produk:** Tim Monitoring Komunikasi Publik  
**Pengguna utama:** Tim Monitoring, Editor/Reviewer, Tim Menteri  
**Jenis sistem:** Aplikasi web internal, input manual, tanpa analitik statistik  
**Tujuan dokumen:** Acuan fungsional untuk perancangan teknis, implementasi melalui Codex, dan UAT.

## 1. Ringkasan eksekutif

EISH adalah aplikasi web internal untuk mengelola informasi isu secara berkelanjutan. Informasi yang saat ini tersebar pada banyak dokumen Google Docs dipusatkan ke satu **Issue Repository**. Setiap isu memiliki halaman induk, background, kronologi perkembangan, sumber, ringkasan eksekutif, dan keterkaitan dengan briefing serta standby statement. Briefing harian diterbitkan sebagai snapshot yang tidak berubah setelah publikasi. Standby statement memiliki versi dan proses persetujuan tersendiri. Tim menteri memperoleh tampilan baca-saja yang menampilkan informasi terpublikasi dan statement terakhir yang disetujui.

Sistem **tidak** melakukan crawling, scraping, API media sosial, pengukuran sentimen, dashboard statistik, atau pembuatan teks otomatis oleh AI pada v1.0. Input dan penyuntingan dilakukan manusia.

## 2. Masalah dan tujuan

### 2.1 Permasalahan
1. Informasi isu, konteks, dan pernyataan tersebar di banyak dokumen; pencarian historis lambat.
2. Background isu berulang kali disalin ke dokumen baru sehingga rawan ketidakkonsistenan.
3. Sulit mengetahui perubahan material sejak briefing terakhir.
4. Tidak selalu jelas versi standby statement mana yang terbaru dan telah disetujui.
5. Dokumen final dapat bercampur dengan draft, tanpa alur persetujuan dan jejak perubahan yang memadai.

### 2.2 Tujuan produk
- Menetapkan satu halaman induk untuk setiap isu (single source of truth internal).
- Merekam perkembangan per isu secara kronologis tanpa menghapus riwayat.
- Menghasilkan executive briefing terkurasi dari konten isu, dengan ruang penyuntingan editorial.
- Memisahkan status informasi isu, briefing, dan standby statement.
- Memastikan hanya versi statement yang disetujui ditandai 'siap digunakan'.
- Memberikan tim menteri akses cepat untuk melihat isu terkini, perubahan terbaru, briefing final, dan naskah statement terakhir.

### 2.3 Indikator keberhasilan nonstatistik
- Pengguna dapat menemukan isu dan standby statement terakhir tanpa membuka folder dokumen terpisah.
- Setiap briefing final dapat dibuka ulang dengan isi sama persis saat diterbitkan.
- Semua perubahan penting mempunyai waktu dan identitas editor.
- Tim menteri tidak dapat mengakses draft yang belum dipublikasikan dari portal baca-saja.
- Petugas dapat mengaitkan satu isu dengan berbagai briefing dan versi statement.

## 3. Cakupan dan batasan

### 3.1 Termasuk v1.0 / MVP
1. Login dan peran pengguna.
2. Issue Repository, klasifikasi, status, pencarian, penanggung jawab.
3. Timeline perkembangan manual dan sumber referensi.
4. Ringkasan isu terkini; penandaan 'perlu perhatian' dan 'tidak ada perkembangan material'.
5. Editor executive briefing harian; memilih isu; menyimpan snapshot; review/publish.
6. Statement Library, versi, alur draft–review–approved–superseded, tombol salin.
7. Dashboard read-only tim menteri; indikator 'apa yang baru'.
8. Audit trail, filter arsip, ekspor dokumen, backup dan pemulihan.

### 3.2 Tidak termasuk v1.0
- Integrasi otomatis dengan media online/media sosial, penghitungan pemberitaan, sentimen, trend chart, statistik volume, alert berbasis algoritma, LLM/AI agents, RAG, otomasi narasi, notifikasi WhatsApp, aplikasi native, dan integrasi SSO yang belum disetujui oleh TI.
- Kolaborasi real-time gaya Google Docs secara simultan. Untuk MVP gunakan mekanisme penguncian / peringatan konflik edit.

## 4. Pengguna dan kewenangan

| Peran | Kebutuhan utama | Izin pokok |
|---|---|---|
| Monitoring Contributor | Input dan koreksi isu/perkembangan, draft briefing/statement | CRUD draft milik/ditugaskan; kirim review |
| Editor | Menjaga kualitas ringkasan, memilih isu briefing, mengelola draft | Edit semua konten operasional, review, kembalikan untuk revisi |
| Approver | Otorisasi penerbitan briefing / penggunaan statement sesuai mandat | Approve, publish, revoke dengan alasan |
| Tim Menteri (Reader) | Melihat situasi isu, briefing final, statement siap pakai | Read-only published/approved, cari dan salin |
| Admin Sistem | Mengelola pengguna, kategori, konfigurasi dan audit | Administrasi teknis; tidak otomatis berwenang menyetujui substansi |

**Aturan:** otorisasi persetujuan ditetapkan organisasi; role `Admin` tidak otomatis dapat menyetujui naskah. Satu akun dapat memiliki beberapa role bila diizinkan. Semua pengecekan akses harus dilakukan di server.

## 5. Arsitektur informasi dan navigasi

Menu utama: **Dashboard | Issue Repository | Executive Briefing | Statement Library | Search & Archive**. Untuk pengelola ditambahkan **Administration**. Menu tim menteri disederhanakan menjadi **Beranda | Isu | Briefing | Standby Statement | Arsip**.

### 5.1 Halaman
- `/dashboard`: perkembangan baru sejak terakhir dilihat / sejak briefing terakhir, isu perlu perhatian, briefing terbaru, statement baru disetujui.
- `/issues`: list isu, pencarian kata kunci, filter kategori/status/pemilik/tanggal.
- `/issues/[id]`: identitas, background, ringkasan terkini, update timeline, referensi, briefing terkait, statement terkait, histori.
- `/issues/[id]/updates/new`: form update manual.
- `/briefings`: arsip briefing berdasarkan tanggal, sesi dan status.
- `/briefings/new` dan `/briefings/[id]`: editor, pemilihan isu, pengurutan, review, snapshot final.
- `/statements`: daftar pernyataan dengan label versi, status, tanggal berlaku.
- `/statements/[id]`: isi, riwayat versi, approval, tombol salin approved.
- `/archive`: pencarian lintas isu, update, briefing, statement.
- `/admin`: pengguna, kategori, hak akses, log audit.

## 6. Functional requirements

### FR-01 — Manajemen isu (P0)
- Buat isu dengan judul, ID unik, kategori, ringkasan, background, status, pemilik, kata kunci, tanggal pertama dicatat.
- Status isu: **Active, Monitoring, Resolved, Archived**. `Needs Attention` adalah flag terpisah, bukan status pokok.
- Judul dapat diubah dengan audit; ID stabil dan tidak berubah.
- Deteksi kemungkinan judul duplikat dan tampilkan peringatan sebelum membuat isu baru.
- Soft delete; isi terkait tidak terhapus secara fisik melalui UI biasa.

**Acceptance criteria:** membuat isu menampilkan ID stabil; pencarian menemukan isu; histori perubahan tersimpan; user tanpa izin edit mendapat penolakan di server.

### FR-02 — Perkembangan dan linimasa isu (P0)
- Contributor menambah update bertanggal dengan judul opsional, isi perkembangan (rich text), sumber, penyusun, dan flag material/perlu perhatian.
- Update disusun berdasarkan tanggal peristiwa dengan metadata waktu input dan waktu ubah.
- Update tidak menimpa update terdahulu; revisi dicatat sebagai histori yang dapat ditelusuri.
- Ada pilihan **Tidak ada perkembangan material** sebagai catatan eksplisit per tanggal/sesi, bukan penghapusan update.
- Tautan sumber dapat lebih dari satu; sistem menampilkan label dan URL; lampiran opsional.

**Acceptance criteria:** setelah membuat dua update, keduanya terlihat di timeline; perubahan satu update tidak menghapus versi lama; sumber dapat dibuka; pengguna dapat membedakan waktu peristiwa dan waktu input.

### FR-03 — Ringkasan isu dan What's New (P0)
- Setiap isu mempunyai **current executive summary** yang disunting manual dan tanggal pembaruan.
- Dashboard menampilkan update baru berdasarkan `created_at`/`published_at` dibanding titik acuan yang disimpan (terakhir dilihat atau briefing terakhir).
- Perubahan label dan statement baru disetujui muncul sebagai kejadian yang dapat dipilih.
- Tidak perlu skor, sentiment, hitungan berita, maupun kalkulasi statistik.

**Acceptance criteria:** update manual baru tercantum di What's New; perubahan yang belum disetujui tidak ditampilkan sebagai informasi final; tautan menuju record yang tepat.

### FR-04 — Executive Briefing (P0)
- Buat briefing dengan `date`, `session` (Pagi, Malam, Insidentil), judul, editor, status dan daftar isu pilihan.
- Editor memilih isu, mengambil ringkasan atau perkembangan terpilih sebagai **salinan awal yang dapat disunting**; teks sumber di issue repository tidak otomatis berubah.
- Urutan isu dapat diatur; tersedia pengantar, inti perkembangan, catatan tindak lanjut (opsional), dan referensi.
- Workflow: **Draft → In Review → Approved → Published**; reviewer dapat mengembalikan ke Draft dengan komentar.
- Saat publish, simpan snapshot immutable: teks, urutan, link, metadata, waktu, serta approver. Revisi sesudah terbit menghasilkan **revision baru**, bukan overwrite snapshot.
- Ekspor PDF atau DOCX (minimal salah satunya pada MVP; diputuskan sebelum sprint implementasi).

**Acceptance criteria:** briefing yang terbit hari X tetap sama meski isu terkait diperbarui hari X+1; pembaca tidak melihat draft; user tanpa peran Approver tidak dapat publish; ekspor sesuai isi terbit.

### FR-05 — Standby Statement dan versi (P0)
- Satu isu dapat mempunyai banyak statement; setiap statement memiliki nomor versi, isi, judul, tanggal, pembuat, editor, status, serta alasan revisi.
- Workflow: **Draft → In Review → Approved**; ketika versi berikutnya disetujui, versi sebelumnya otomatis berstatus **Superseded** untuk penggunaan baru, dengan histori tetap tersedia.
- Hanya statement **Approved** yang tampil dengan label **Siap Digunakan**; statement Superseded ditandai jelas dan tidak menjadi default tombol salin.
- Statement dapat memiliki rentang berlaku, catatan sensitivitas, dan pengesahan sesuai kebijakan.
- Penarikan kembali (`Revoked`) harus mencatat alasan dan pengguna; bila tidak ada approved yang masih berlaku, UI menampilkan **Belum ada pernyataan siap digunakan**.
- Teks yang dicopy harus sama persis dengan versi approved dan mencantumkan konteks pemilihan versi di UI.

**Acceptance criteria:** approval v2 mengganti v1 sebagai versi siap pakai; v1 tetap dapat ditemukan sebagai arsip; Draft v3 tidak menimpa approved v2; revoked tidak dapat dicopy melalui tombol utama.

### FR-06 — Search & Archive (P0)
- Pencarian kata kunci meliputi judul isu, ringkasan, body update, judul briefing, dan teks statement.
- Filter kategori, status, tanggal, penanggung jawab, tipe dokumen, dan status approval.
- Hasil disertai jenis data, judul, tanggal terakhir berubah, status, dan link langsung.
- Semua hasil tunduk pada izin akses masing-masing user.

**Acceptance criteria:** pencarian kata di update menemukan induk isu; user Reader tidak menerima cuplikan draft melalui pencarian, API, atau ekspor.

### FR-07 — Portal tim menteri (P0)
- Halaman beranda mengutamakan informasi terbaru dan final: isu perhatian, perubahan terbaru yang dipublikasikan, briefing terakhir, statement approved.
- Navigasi maksimal dua-tiga klik untuk membuka statement approved pada isu yang diketahui.
- UI responsive dengan prioritas kemudahan membaca di ponsel.
- Hak read-only, tanpa affordance edit dan tetap dijaga di backend.

**Acceptance criteria:** tim menteri bisa mencari dan menyalin statement approved; tidak bisa mengubah konten atau mengakses status nonfinal dari URL langsung.

### FR-08 — Audit, pengelolaan pengguna, ekspor (P0/P1)
- Audit event untuk create, edit, submit review, approve, publish, supersede, revoke, role change dan login penting.
- Tiap event menyimpan user ID, waktu server, jenis objek, ID objek, tindakan, dan perubahan ringkas (tanpa menyimpan kredensial).
- Admin dapat nonaktifkan pengguna dan mengelola kategori.
- Backup database dan lampiran, prosedur restore yang diuji, serta ekspor dokumen final.

**Acceptance criteria:** riwayat approval dan identitas pelaku dapat ditelusuri; akun dinonaktifkan tidak dapat masuk; restore diuji di staging sebelum produksi.

## 7. Model data konseptual

| Entitas | Field inti | Hubungan |
|---|---|---|
| User | id, name, email, status | 1:N ke issue/update/approval |
| Role / UserRole | id, role_name, user_id | N:M user-role |
| Issue | id, slug, title, category_id, background, current_summary, lifecycle_status, attention_flag, owner_id, created_at, updated_at | 1:N updates, statements; N:M briefings |
| IssueUpdate | id, issue_id, event_date, title, body, materiality, creator_id, created_at, updated_at | N:1 issue |
| IssueUpdateRevision | id, update_id, revision_no, body_snapshot, edited_by, edited_at | N:1 update |
| SourceReference | id, issue_id, update_id?, title, url, source_type, attachment_id? | N:1 issue/update |
| Briefing | id, briefing_date, session, title, status, author_id, current_revision_id | 1:N revision |
| BriefingRevision | id, briefing_id, revision_no, content_snapshot, approved_by?, published_at? | N:1 briefing |
| BriefingItem | id, revision_id, issue_id, display_order, copied_snapshot | N:1 revision; N:1 issue |
| Statement | id, issue_id, title, current_approved_version_id? | 1:N versions |
| StatementVersion | id, statement_id, version_no, text, status, change_reason, created_by, approved_by?, approved_at?, valid_from?, valid_until? | N:1 statement |
| AuditEvent | id, actor_id, entity_type, entity_id, action, timestamp, metadata | N:1 user |
| Attachment | id, filename, storage_key, mime_type, uploaded_by, created_at | referenced from sources |
| Category | id, name, active | 1:N issues |

**Aturan integritas utama:** hanya satu `current_approved_version_id` per Statement; perubahan versi approved bersifat transaksional; snapshot published tidak bisa diedit in place; foreign key dan soft-delete menjaga hubungan dokumen.

## 8. Aturan workflow dan governance

1. **Issue update** merupakan catatan faktual, dapat dibuat oleh contributor; tanda final/published untuk portal harus melalui editor bila organisasi menghendaki. Pilihan awal: update internal terlihat tim monitoring; portal menteri hanya menampilkan update yang ditandai `Published` oleh editor.
2. **Briefing approval** terpisah dari **statement approval**: persetujuan briefing tidak otomatis menyetujui pernyataan.
3. Perubahan sumber data setelah briefing terbit tidak mengubah snapshot briefing.
4. Draft statement baru tidak mencabut statement lama yang masih approved; perpindahan terjadi setelah versi baru disetujui atau statement lama dicabut eksplisit.
5. Setiap pengembalian/rejection memerlukan komentar; setiap revoke memerlukan alasan.
6. Waktu tersimpan UTC di database dan ditampilkan dalam WIB (Asia/Jakarta) pada UI; zona waktu sebaiknya configurable bila diperlukan.
7. Tidak ada penghapusan permanen tanpa prosedur administrator dan kebijakan retensi yang ditetapkan.

## 9. Wireframe dan prioritas interaksi

**Dashboard tim menteri:** header tanggal/sesi; What's New; isu perlu perhatian; briefing final terakhir; daftar standby statement terbaru. Hindari metrik statistik. Status diberi label teks, bukan warna saja.

**Halaman issue:** judul + status; current summary; latest published update; timeline; background; referensi; statement approved; briefing terkait. Informasi terbaru berada di atas; histori tetap mudah dibuka.

**Form input monitoring:** pilih isu; tanggal peristiwa; ringkasan perkembangan; sumber/tautan; materialitas; simpan draft; kirim review. Hindari form panjang untuk tugas rutin.

**Editor briefing:** pilih sesi; pilih isu; masukkan salinan ringkasan; susun ulang; sunting; preview; submit review; approve/publish dengan jejak audit.

**Statement detail:** banner status persetujuan; versi aktif; teks naskah; tombol copy; metadata persetujuan; daftar versi historis.

## 10. Kebutuhan nonfungsional

| ID | Persyaratan | Kriteria uji awal |
|---|---|---|
| NFR-01 | Keamanan akses dan otorisasi | Semua endpoint memeriksa session dan role; larangan draft reader diverifikasi test |
| NFR-02 | Enkripsi transport | HTTPS wajib di staging/produksi; secret tidak disimpan di repository |
| NFR-03 | Integritas dan audit | Revisi dan publikasi terekam; data snapshot tidak dapat ditimpa |
| NFR-04 | Ketersediaan operasional | Monitoring uptime dan prosedur pemulihan disepakati TI sebelum produksi |
| NFR-05 | Kinerja | Target awal: halaman utama dan detail isu biasanya terbuka ≤3 detik pada kondisi jaringan internal normal, diverifikasi saat pilot |
| NFR-06 | Pencarian | Query kata kunci terhadap data MVP memberi hasil relevan dan menghormati access control |
| NFR-07 | Backup dan recovery | Backup otomatis sesuai kebijakan TI; uji restore berkala; RPO/RTO ditentukan oleh pemilik layanan |
| NFR-08 | Aksesibilitas | Navigasi keyboard, label formulir, kontras, status tidak hanya warna |
| NFR-09 | Responsive | Halaman baca tersedia baik di mobile dan desktop; editor diprioritaskan desktop |
| NFR-10 | Portabilitas | Dockerized; environment development/staging/production terpisah |
| NFR-11 | Sanitasi konten | Rich text disanitasi; URL divalidasi; upload dibatasi format/ukuran; proteksi XSS/CSRF |
| NFR-12 | Retensi & kepatuhan | Kebijakan arsip, klasifikasi data, hak akses, dan hosting disahkan oleh unit TI/pengelola informasi |

**Catatan:** angka target kinerja di atas adalah hipotesis awal untuk diuji, bukan janji SLA produksi.

## 11. Technology stack (usulan, bukan keputusan mutlak)

- Frontend dan backend web: **Next.js + TypeScript**.
- Komponen UI: **Tailwind CSS** dan komponen aksesibel.
- Editor dokumen: **Tiptap** (rich text, sanitasi server-side).
- Database: **PostgreSQL**, ORM: **Prisma**.
- Otentikasi: **Auth.js** untuk pengembangan; integrasi SSO organisasi dievaluasi sebelum produksi.
- Penyimpanan lampiran: object storage kompatibel S3 / volume privat sesuai kebijakan TI.
- Deployment: Docker, reverse proxy HTTPS, log dan backup.
- Pencarian MVP: PostgreSQL full-text search; tanpa Elasticsearch.
- Tidak menggunakan microservices, LLM, agent, vector database, atau integrasi sosial pada MVP.

**Pemilihan teknis akhir** ditetapkan dalam Technical Design Document (TDD) setelah review infrastruktur dan keamanan instansi.

## 12. Migrasi Google Docs

1. Inventarisasi dokumen lama dan kelompokkan menurut isu.
2. Tentukan judul isu kanonis dan identifikasi duplikat.
3. Migrasikan **isu aktif prioritas** dahulu: background, ringkasan, 3–5 perkembangan penting, statement approved terakhir jika status benar-benar dapat diverifikasi.
4. Simpan tautan ke dokumen sumber; beri label `legacy/unverified` pada naskah yang belum memiliki bukti persetujuan.
5. Jangan menetapkan dokumen lama sebagai `Approved` hanya karena berada di folder bersama.
6. Lakukan pemeriksaan editor sebelum publikasi ke portal menteri.
7. Setelah pilot, lanjutkan migrasi arsip berdasarkan kebutuhan penelusuran.

## 13. UAT — skenario penerimaan minimal

| Kode | Skenario | Hasil yang diharapkan |
|---|---|---|
| UAT-01 | Contributor membuat isu | ID stabil, muncul pada daftar dan dapat dicari |
| UAT-02 | Contributor menambah update dua hari berbeda | Timeline benar dan sumber tercatat |
| UAT-03 | Editor menandai perkembangan baru published | What's New reader menampilkan update yang disetujui |
| UAT-04 | Reader membuka URL draft langsung | Akses ditolak tanpa membocorkan isi |
| UAT-05 | Editor membuat briefing dari tiga isu | Dapat memilih, menyusun ulang, dan mengedit salinan |
| UAT-06 | Briefing diterbitkan lalu isu sumber diperbarui | Snapshot briefing tetap tidak berubah |
| UAT-07 | Statement v1 approved lalu v2 masih draft | v1 tetap versi default siap pakai |
| UAT-08 | Statement v2 approved | v2 jadi default, v1 ditandai superseded |
| UAT-09 | Statement approved dicabut | Tidak ada tombol salin utama untuk versi dicabut |
| UAT-10 | Reader mencari frasa yang hanya ada di draft | Tidak ada hasil/preview draft |
| UAT-11 | Admin menonaktifkan pengguna | Sesi tidak dapat digunakan untuk akses lanjutan sesuai kebijakan session |
| UAT-12 | Editor mengekspor briefing final | Isi ekspor identik dengan snapshot published |
| UAT-13 | Reviewer menolak draft | Status kembali untuk revisi dengan komentar dan audit |
| UAT-14 | Restore backup staging | Catatan isu, versi, dan lampiran dapat dipulihkan |

## 14. Rencana implementasi untuk Codex

**Sprint 0 — Fondasi:** repository private, README, AGENTS.md, environment variables contoh, lint/test, database lokal, seed dummy, Docker dev, desain UI dan hak akses dasar. Output: shell aplikasi berjalan.

**Sprint 1 — Issue Repository:** issue CRUD, kategori, ownership, pencarian, rich-text background, timeline update, source references, audit minimal. Output: tim monitoring dapat mengelola isu end-to-end.

**Sprint 2 — Statement Library:** statement, versi, approval/revoke, current approved, riwayat, copy, pengujian izin. Output: statement siap pakai dapat dibedakan dari draft.

**Sprint 3 — Executive Briefing:** editor, pilih isu, snapshot, review/approve/publish, ekspor. Output: briefing final tidak berubah setelah sumber isu diperbarui.

**Sprint 4 — Portal Menteri dan hardening:** what's new, read-only interface, search seluruh jenis data, UAT, audit, backup-restore, security testing. Output: pilot internal siap diuji.

**Definition of Done setiap sprint:** kode di-review, test otomatis lulus, tidak ada secret di repo, migrasi database terdokumentasi, skenario akses berhasil, dummy seed tersedia, acceptance criteria diverifikasi pemilik produk, changelog dicatat.

## 15. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Isi manual tidak konsisten | Template input singkat, editor, controlled vocabulary kategori |
| Statement salah versi | Penandaan approved eksplisit, hanya satu current approved, revoke, audit |
| Draft bocor ke reader | Authorization server-side, pengujian endpoint dan search, secure defaults |
| Arsip Google Docs tidak rapi | Migrasi bertahap, canonical issue, label legacy/unverified |
| Banyak perubahan bersamaan | Optimistic locking/version field dan konflik edit yang jelas |
| Beban pengisian terlalu tinggi | Reuse informasi isu, form pendek, auto-filled metadata, salinan ke briefing |
| Ketergantungan satu developer/AI | Repo private milik instansi, README, TDD, test, CI/CD, backup, code review manusia |

## 16. Keputusan yang perlu divalidasi sebelum implementasi

1. **Persetujuan briefing:** siapa Approver untuk masing-masing sesi (pagi/malam/insidentil)?
2. **Persetujuan statement:** apakah diperlukan satu atau dua tingkat persetujuan?
3. **Visibilitas update:** apakah portal menteri hanya melihat perkembangan yang ditandai editor sebagai Published? (usulan: ya)
4. **Frekuensi briefing:** apakah sesi default Pagi/Malam dengan Insidentil? (usulan: ya, dapat dikonfigurasi)
5. **Ekspor:** PDF, DOCX, atau keduanya pada MVP?
6. **Hosting:** server internal/on-prem atau lingkungan cloud pemerintah yang disetujui?
7. **SSO:** apakah perlu integrasi identitas internal instansi sejak pilot?
8. **Retensi dan klasifikasi:** siapa menetapkan kebijakan penyimpanan, pemusnahan, dan hak akses dokumen?
9. **Kualitas dokumen historis:** siapa berwenang memverifikasi approved untuk statement lama?
10. **Lampiran:** maksimum ukuran/file type yang disetujui TI?

**Asumsi kerja untuk memulai Codex:** gunakan data dummy; role-based approval sederhana; portal menteri hanya untuk published/approved; briefing sesi Pagi/Malam/Insidentil; ekspor minimal PDF; PostgreSQL lokal via Docker; tidak ada integrasi dengan layanan pemerintah selama development.

## 17. Petunjuk serah terima ke Codex

Simpan dokumen ini sebagai `docs/PRD-EISH-v1.0.md` di repository private. Minta Codex membaca PRD dan melakukan:
1. Gap analysis dan identifikasi keputusan terbuka (jangan mengasumsikan keputusan organisasi).
2. TDD (`docs/TDD.md`) dan ERD database.
3. Rencana implementasi per issue/task yang kecil.
4. Prototype UI menggunakan seed dummy dan skema otorisasi yang bisa dites.
5. Implementasi bertahap sesuai urutan sprint; setiap tugas harus merujuk FR, NFR, dan UAT terkait.
6. Larangan deployment produksi tanpa persetujuan.

**Prompt pembuka Codex:**

> Baca `docs/PRD-EISH-v1.0.md`. Jangan langsung membangun semua fitur. Audit kelengkapan PRD terhadap risiko, buat `docs/TDD.md`, ERD, daftar keputusan terbuka, dan rencana implementasi Sprint 0. Gunakan Next.js, TypeScript, PostgreSQL, Prisma dan Docker. Utamakan RBAC server-side, immutable briefing snapshots, serta statement approval versioning. Gunakan data dummy. Setelah rancangan selesai, implementasikan hanya Sprint 0 beserta test dan instruksi menjalankan aplikasi lokal.
