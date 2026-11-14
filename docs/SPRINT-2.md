# Laporan Sprint 2 — Statement Library

Sprint 2 mengimplementasikan statement per isu dengan versi dan workflow server-side:

- Contributor/Editor membuat draft dan mengirim versi ke review.
- Approver menyetujui satu tingkat, termasuk karya sendiri bila memiliki role Approver.
- Approval baru menandai approval lama sebagai `SUPERSEDED`.
- Approver dapat mencabut versi approved dengan alasan; Reader kemudian tidak melihatnya.
- `validFrom` dan `validUntil` membatasi versi yang terlihat dan dapat disalin Reader.
- Reader hanya menerima versi approved yang sedang berlaku; draft dan histori internal tidak dikirim.
- Salin teks approved tersedia pada detail versi approved.
- Audit create, submit, approve, revoke dan delete disimpan dalam transaksi.

## Validasi aktual

- Migrasi `20261113023209_statements` diterapkan pada PostgreSQL native lokal.
- `npm run typecheck` lulus.
- `npm run lint` lulus.
- `npm test` lulus: 33 test.
- `npx vitest run tests/integration/statements.test.ts` lulus: 2 test workflow dan izin.
- `npm run build` lulus.
- `git diff --check` lulus.

## Batas

Ekspor, briefing dan dashboard terpadu tetap menunggu Sprint 3/4. Data yang digunakan untuk validasi tetap sintetis; belum ada deployment produksi.
