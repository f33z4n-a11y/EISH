import { currentUser } from "@/lib/auth";
import { canManageUsers } from "@/lib/policy";
import { createAccount } from "@/lib/users";
import { redirectResponse, validOrigin } from "@/lib/security";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
export async function POST(request: Request) {
  if (!validOrigin(request))
    return new Response("Permintaan ditolak.", { status: 403 });
  const actor = await currentUser();
  if (!actor) return new Response("Silakan masuk.", { status: 401 });
  if (!canManageUsers(actor.roles))
    return new Response("Akses ditolak.", { status: 403 });
  try {
    await createAccount(actor, Object.fromEntries(await request.formData()));
    return redirectResponse("/admin?hasil=berhasil");
  } catch (error) {
    if (
      error instanceof ZodError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    )
      return redirectResponse("/admin?hasil=gagal");
    throw error;
  }
}
