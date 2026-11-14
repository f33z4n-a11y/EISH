ALTER TABLE "Category" ADD COLUMN "code" TEXT;
UPDATE "Category" SET "code" = CASE "id"
  WHEN 'layanan-publik' THEN 'OLD-LAYANAN'
  WHEN 'kebijakan' THEN 'OLD-KEBIJAKAN'
  WHEN 'operasional' THEN 'OLD-OPERASIONAL'
  ELSE 'LEGACY-' || "id"
END;
ALTER TABLE "Category" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");
UPDATE "Category" SET "active" = false WHERE "code" LIKE 'OLD-%';
INSERT INTO "Category" ("id", "code", "name", "active") VALUES
  ('k01-moderasi-konten', 'K01', 'Pengawasan dan Moderasi Konten Digital', true),
  ('k02-judi-online', 'K02', 'Judi Online dan Aktivitas Ilegal Digital', true),
  ('k03-perlindungan-anak', 'K03', 'Perlindungan Anak di Ruang Digital', true),
  ('k04-data-siber', 'K04', 'Pelindungan Data Pribadi dan Keamanan Siber', true),
  ('k05-telekomunikasi', 'K05', 'Telekomunikasi, Internet dan Hak Konsumen', true),
  ('k06-disinformasi', 'K06', 'Disinformasi, Hoaks dan Kualitas Ruang Informasi', true),
  ('k07-platform-digital', 'K07', 'Platform Digital dan Ekonomi Digital', true),
  ('k08-ai', 'K08', 'Kecerdasan Artifisial dan Teknologi Baru', true),
  ('k09-komunikasi-publik', 'K09', 'Komunikasi Publik dan Informasi Pemerintah', true),
  ('k10-tata-kelola', 'K10', 'Tata Kelola, Regulasi dan Integritas Kelembagaan', true),
  ('k11-infrastruktur', 'K11', 'Infrastruktur Strategis dan Kedaulatan Digital', true),
  ('k12-program-lintas-sektor', 'K12', 'Program Nasional dan Isu Lintas Sektor', true)
ON CONFLICT ("id") DO UPDATE SET "code" = EXCLUDED."code", "name" = EXCLUDED."name", "active" = true;
