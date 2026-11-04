# Panduan kerja EISH

- Baca `docs/EISH_PRD_v1.0.md`, desain teknis, rencana implementasi dan keputusan PO sebelum mengubah aplikasi.
- Bahasa UI dan dokumentasi adalah Bahasa Indonesia. Gunakan data sintetis saja; jangan menyimpan password/session/rahasia di Git, output perintah, tangkapan layar atau log.
- Setiap tugas cloud sudah terisolasi. Gunakan checkout yang ada; jangan membuat worktree kecuali diminta pengguna.
- Saat ini hanya Sprint 0 disetujui. Jangan membangun CRUD isu, approval, ekspor, portal final lengkap atau deployment produksi tanpa instruksi berikutnya.
- Katim ber-role Approver menyetujui satu tingkat dan boleh menyetujui karya sendiri. Admin/penulis biasa tidak otomatis Approver. Reader hanya menerima informasi final; draft tetap tersembunyi.
- Login email/username + password; akun dibuat Admin, tanpa pendaftaran mandiri. Session idle 30 menit, absolut 8 jam; status/peran diperiksa di server.
- Gunakan `npm ci`, `npm run db:generate`, `npm run db:migrate`, seed lokal, lalu lint/typecheck/build, unit/integrasi PostgreSQL dan E2E yang relevan. Jangan reset database yang berisi data pengguna.
- Pertahankan proxy dan verifikasi TLS. Perintah jaringan/akses Docker mungkin memerlukan jalur eksekusi di luar sandbox dengan izin yang tersedia.
- PRD asli tidak diubah pada implementasi Sprint 0. Catat batas fase dan hasil pengujian sebenarnya.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
