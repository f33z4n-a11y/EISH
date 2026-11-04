import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "EISH — Pusat Isu dan Pernyataan",
  description: "Ruang kerja internal komunikasi publik",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#konten">
          Lewati navigasi
        </a>
        {children}
      </body>
    </html>
  );
}
