import { IssueError } from "./issues";
import { ZodError } from "zod";
export function issueResponse(e: unknown) {
  if (e instanceof IssueError)
    return Response.json(
      { error: e.message, code: e.code },
      { status: e.status },
    );
  if (e instanceof ZodError)
    return Response.json(
      {
        error:
          "Isian tidak valid. Periksa tanggal, panjang teks dan tautan sumber.",
      },
      { status: 400 },
    );
  if (e instanceof SyntaxError)
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  console.error("Operasi isu gagal.");
  return Response.json(
    { error: "Operasi gagal. Coba kembali." },
    { status: 500 },
  );
}
