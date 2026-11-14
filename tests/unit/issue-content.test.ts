import { describe, it, expect } from "vitest";
import {
  dateValue,
  richText,
  safeUrl,
  normalizedTitle,
} from "../../src/lib/issue-content";
describe("kontrak konten isu", () => {
  it("menolak tanggal kalender tidak sah", () => {
    expect(dateValue.safeParse("2026-02-30").success).toBe(false);
    expect(dateValue.safeParse("2026-11-04").success).toBe(true);
  });
  it("menolak HTML, gambar dan tautan aktif", () => {
    for (const s of [
      "<script>alert(1)</script>",
      "[bahaya](javascript:alert)",
      "![gambar](https://example.test/a)",
    ])
      expect(richText.safeParse(s).success).toBe(false);
    expect(
      richText.safeParse(
        "**tebal** dan *miring*\n- daftar\n[aman](https://example.test)",
      ).success,
    ).toBe(true);
  });
  it("URL hanya HTTP/HTTPS tanpa kredensial", () => {
    expect(safeUrl("https://example.test")).toBe(true);
    for (const s of [
      "data:text/html,x",
      "file:///etc/passwd",
      "https://user:password@example.test",
    ])
      expect(safeUrl(s)).toBe(false);
  });
  it("judul duplikat mengabaikan kapital, spasi dan bentuk unicode", () => {
    expect(normalizedTitle("  LAYANAN   Publik ")).toBe(
      normalizedTitle("Layanan Publik"),
    );
  });
});
