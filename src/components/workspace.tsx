import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canManageUsers, roleLabels } from "@/lib/policy";
const links = [
  ["/dashboard", "Beranda"],
  ["/issues", "Isu"],
  ["/briefings", "Briefing"],
  ["/statements", "Pernyataan"],
  ["/archive", "Arsip"],
];
export async function Workspace({
  current,
  children,
}: {
  current: string;
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/dashboard" className="brand">
            EISH
          </Link>
          <div>
            <p className="text-sm">{user.name}</p>
            {user.roles.map((r) => (
              <span key={r} className="badge">
                {roleLabels[r]}
              </span>
            ))}
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit">Keluar</button>
          </form>
        </div>
      </header>
      <div className="shell">
        <nav aria-label="Navigasi utama">
          {links.map(([href, text]) => (
            <Link
              key={href}
              href={href}
              aria-current={current === href ? "page" : undefined}
            >
              {text}
            </Link>
          ))}
          {canManageUsers(user.roles) && (
            <Link
              href="/admin"
              aria-current={current === "/admin" ? "page" : undefined}
            >
              Administrasi
            </Link>
          )}
        </nav>
        <main id="konten">{children}</main>
      </div>
      <footer>
        EISH · Pengembangan dengan data sintetis · Waktu ditampilkan dalam WIB
      </footer>
    </>
  );
}
