import pdfmake from "pdfmake";
import Roboto from "pdfmake/fonts/Roboto";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { AlignmentType, Document, ExternalHyperlink, Footer, HeadingLevel, Packer, PageNumber, Paragraph, TextRun } from "docx";
import type { RoleCode } from "@prisma/client";
import { getBriefing } from "./briefings";

type Actor = { id: string; roles: RoleCode[] };
type Source = { title?: string; url?: string };
function clean(text: string) { return text.replace(/\*\*|__/g, "").replace(/(^|\s)\*([^*]+)\*/g, "$1$2").replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)"); }

export async function publishedBriefing(actor: Actor, id: string) {
  const briefing = await getBriefing(actor, id); if (!briefing?.publishedVersion) return null;
  const revision = briefing.revisions.find((item) => item.version === briefing.publishedVersion && item.status === "PUBLISHED");
  return revision ? { briefing, revision } : null;
}

export async function briefingPdf(actor: Actor, id: string) {
  const data = await publishedBriefing(actor, id); if (!data) return null; const allowedFonts = new Set(Object.values(Roboto.Roboto)); pdfmake.setUrlAccessPolicy(() => false); pdfmake.setLocalAccessPolicy((path) => allowedFonts.has(path)); pdfmake.addFonts(Roboto);
  const { briefing, revision } = data; const content: Content[] = [
    { text: revision.title, style: "title" },
    { text: `${briefing.date.toISOString().slice(0, 10)} | ${briefing.session} | Versi ${revision.version}`, style: "meta" },
    { text: "Pengantar", style: "heading" }, { text: clean(revision.introduction) || "-", style: "body" },
  ];
  for (const item of revision.items) {
    content.push({ text: `${item.position}. ${item.title}`, style: "heading" }, { text: clean(item.body), style: "body" });
    const sources = Array.isArray(item.references) ? item.references as Source[] : [];
    if (sources.length) content.push({ text: "Referensi", style: "subheading" }, { ul: sources.map((source, index) => ({ text: `${source.title || `Referensi ${index + 1}`}: ${source.url || ""}`, link: source.url })) });
  }
  content.push({ text: "Langkah tindak lanjut", style: "heading" }, { text: clean(revision.followUp) || "Tidak ada langkah tindak lanjut.", style: "body" });
  const definition: TDocumentDefinitions = { pageSize: "LETTER", pageMargins: [54, 54, 54, 58], defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.35, color: "#162f3c" }, header: { text: "EISH | Briefing final", alignment: "right", margin: [54, 24, 54, 0], fontSize: 8, color: "#526571" }, footer: (page, pages) => ({ text: `EISH | Halaman ${page} dari ${pages}`, alignment: "center", margin: [0, 18, 0, 0], fontSize: 8, color: "#526571" }), content, styles: { title: { fontSize: 22, bold: true, color: "#000000", margin: [0, 0, 0, 8] }, meta: { fontSize: 9, color: "#526571", margin: [0, 0, 0, 18] }, heading: { fontSize: 14, bold: true, color: "#000000", margin: [0, 16, 0, 6] }, subheading: { fontSize: 11, bold: true, color: "#000000", margin: [0, 8, 0, 4] }, body: { margin: [0, 0, 0, 6] } } };
  return { buffer: await pdfmake.createPdf(definition).getBuffer(), title: revision.title, version: revision.version };
}

export async function briefingDocx(actor: Actor, id: string) {
  const data = await publishedBriefing(actor, id); if (!data) return null; const { briefing, revision } = data; const children: Paragraph[] = [];
  children.push(new Paragraph({ text: revision.title, style: "Title" }), new Paragraph({ children: [new TextRun({ text: `${briefing.date.toISOString().slice(0, 10)} | ${briefing.session} | Versi ${revision.version}`, color: "526571", size: 20 })], spacing: { after: 300 } }), new Paragraph({ text: "Pengantar", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: clean(revision.introduction) || "-", spacing: { after: 160 } }));
  for (const item of revision.items) {
    children.push(new Paragraph({ text: `${item.position}. ${item.title}`, heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: clean(item.body), spacing: { after: 120 } }));
    const sources = Array.isArray(item.references) ? item.references as Source[] : [];
    if (sources.length) { children.push(new Paragraph({ text: "Referensi", heading: HeadingLevel.HEADING_2 })); for (const [index, source] of sources.entries()) children.push(new Paragraph({ bullet: { level: 0 }, children: [new ExternalHyperlink({ link: source.url || "", children: [new TextRun({ text: source.title || `Referensi ${index + 1}`, style: "Hyperlink" })] })] })); }
  }
  children.push(new Paragraph({ text: "Langkah tindak lanjut", heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: clean(revision.followUp) || "Tidak ada langkah tindak lanjut." }));
  const document = new Document({ styles: { default: { document: { run: { font: "Arial", size: 22, color: "162F3C" }, paragraph: { spacing: { line: 300, after: 120 } } }, title: { run: { font: "Arial", size: 44, bold: true, color: "000000" }, paragraph: { spacing: { after: 160 } } }, heading1: { run: { font: "Arial", size: 28, bold: true, color: "000000" }, paragraph: { spacing: { before: 260, after: 100 }, keepNext: true } }, heading2: { run: { font: "Arial", size: 23, bold: true, color: "000000" }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true } } } }, sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("EISH | Halaman "), new TextRun({ children: [PageNumber.CURRENT] })] })] }) }, children }] });
  return { buffer: await Packer.toBuffer(document), title: revision.title, version: revision.version };
}
