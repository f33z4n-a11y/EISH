import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { canManageUsers, roleLabels } from "@/lib/policy";
const links = [["/dashboard", "Beranda"], ["/issues", "Isu"], ["/briefings", "Briefing"], ["/statements", "Standby Statement"], ["/archive", "Arsip"]];
export async function Workspace({
  current: _current,
  children,
}: {
  current: string;
  children: React.ReactNode;
}) {
  void _current;
  const user = await requireUser();
  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/dashboard" className="brand-block">
            <span className="brand">SIGAP</span>
            <span className="brand-subtitle">Sistem Intelijen dan Gerak Analisis Publik</span>
          </Link>
          <div className="header-user">
            <p className="text-sm">{user.name}</p>
            {user.roles.map((r) => (
              <span key={r} className="badge">
                {roleLabels[r]}
              </span>
            ))}
          </div>
          <div className="header-actions">
            {(user.roles.includes("EDITOR") || user.roles.includes("CONTRIBUTOR")) && <Link className="button header-new-issue" href="/issues/new">+ Isu Baru</Link>}
            <details className="top-menu"><summary>Menu</summary><nav aria-label="Navigasi utama">{links.map(([href, text]) => <Link key={href} href={href} aria-current={_current === href ? "page" : undefined}>{text}</Link>)}{canManageUsers(user.roles) && <Link href="/admin" aria-current={_current === "/admin" ? "page" : undefined}>Administrasi</Link>}</nav></details>
            <form action="/api/auth/logout" method="post">
            <button type="submit">Keluar</button>
            </form>
          </div>
        </div>
      </header>
      <div className="shell"><main id="konten">{children}</main></div>
      <footer>
        SIGAP · Pengembangan dengan data sintetis · Waktu ditampilkan dalam WIB
      </footer>
    </>
  );
}
