import { NextResponse } from "next/server";
import { authenticate, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { appUrl, validOrigin } from "@/lib/security";
import { loginSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!validOrigin(request))
    return new Response("Permintaan ditolak.", { status: 403 });
  const form = await request.formData();
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  const token = parsed.success
    ? await authenticate(parsed.data.identifier, parsed.data.password)
    : null;
  const response = NextResponse.redirect(
    new URL(token ? "/dashboard" : "/login?gagal=1", appUrl()),
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  if (token)
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
