import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { appUrl, tokenHash, validOrigin } from "@/lib/security";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  if (!validOrigin(request))
    return new Response("Permintaan ditolak.", { status: 403 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token)
    await db.$transaction(async (tx) => {
      const session = await tx.session.findUnique({
        where: { tokenHash: tokenHash(token) },
      });
      if (session) {
        await tx.session.delete({ where: { id: session.id } });
        await tx.auditEvent.create({
          data: {
            actorId: session.userId,
            action: "LOGOUT",
            entityId: session.userId,
          },
        });
      }
    });
  const response = NextResponse.redirect(new URL("/login", appUrl()), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
