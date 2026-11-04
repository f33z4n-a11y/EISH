import { createHash, createHmac } from "node:crypto";
export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
export function throttleKey(identifier: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith("GANTI"))
    throw new Error("AUTH_SECRET harus diisi minimal 32 karakter acak.");
  return createHmac("sha256", secret).update(identifier).digest("hex");
}
export function appUrl(): URL {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL belum diisi.");
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("APP_URL tidak valid.");
  return url;
}
export function validOrigin(request: Request): boolean {
  return request.headers.get("origin") === appUrl().origin;
}
export function redirectResponse(path: string): Response {
  return Response.redirect(new URL(path, appUrl()), 303);
}
