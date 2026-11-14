import { z } from "zod";
export const statuses = {
  ACTIVE: "Aktif",
  MONITORING: "Dipantau",
  RESOLVED: "Selesai",
  ARCHIVED: "Diarsipkan",
} as const;
export const priorities = { VERY_HIGH: "Sangat tinggi", HIGH: "Tinggi", MEDIUM: "Sedang", LOW: "Rendah" } as const;
export const dateValue = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
    "Tanggal tidak valid.",
  );
export function safeUrl(s: string) {
  try {
    const u = new URL(s);
    return (
      ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
// HTML tidak didukung. Markdown dibatasi; tidak pernah dirender sebagai HTML mentah.
export const richText = z
  .string()
  .max(20000)
  .refine(
    (s) =>
      !/<[^>]*>/.test(s) &&
      !/!\[/.test(s) &&
      [...s.matchAll(/\[[^\]]*\]\(([^)]*)\)/g)].every((m) => safeUrl(m[1])),
    "Gunakan teks dan tautan HTTP/HTTPS yang aman; HTML/gambar tidak didukung.",
  );
export const sourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  url: z.string().max(2000).refine(safeUrl, "URL sumber harus HTTP/HTTPS."),
});
export const contentSchema = z.object({
  title: z.string().trim().max(200),
  summary: richText,
  background: richText,
  body: richText,
  categoryId: z.string().max(100),
  categoryName: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "MONITORING", "RESOLVED", "ARCHIVED"]),
  priority: z.enum(["VERY_HIGH", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  attention: z.boolean(),
  keywords: z.string().trim().max(500),
  date: dateValue,
  session: z.enum(["PAGI", "MALAM", "INSIDENTIL"]),
  material: z.boolean(),
  sources: z.array(sourceSchema).max(20),
  ownerId: z.string().min(1).max(100),
  assigneeId: z.string().max(100),
  ownerName: z.string().optional(),
  assigneeName: z.string().optional(),
});
export type IssueContent = z.infer<typeof contentSchema>;
export const normalizedTitle = (s: string) =>
  s.normalize("NFKC").toLocaleLowerCase("id").replace(/\s+/g, " ").trim();
export function searchText(c: IssueContent) {
  return [
    c.title,
    c.summary,
    c.background,
    c.body,
    c.keywords,
    ...c.sources.map((s) => s.title),
  ].join(" ");
}
export function validateKind(c: IssueContent, kind: "ISSUE" | "UPDATE") {
  if (kind === "ISSUE" && (!c.title || !c.categoryId || !c.summary.trim()))
    throw new Error("Judul, kategori dan ringkasan wajib diisi.");
  if (kind === "UPDATE" && c.material && !c.body.trim())
    throw new Error("Isi perkembangan wajib diisi.");
}
export function defaultContent(ownerId: string): IssueContent {
  return {
    title: "",
    summary: "",
    background: "",
    body: "",
    categoryId: "",
    status: "ACTIVE",
    priority: "MEDIUM",
    attention: false,
    keywords: "",
    date: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
    session: "PAGI",
    material: true,
    sources: [],
    ownerId,
    assigneeId: "",
  };
}
