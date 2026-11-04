import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Workspace current="/issues">
      <p className="eyebrow">Ruang kerja EISH</p>
      <h1>Isu</h1>
      <section className="card">
        <h2>Belum ada konten</h2>
        <p>
          Informasi akan tersedia setelah diterbitkan. Pengelolaan konten belum
          diaktifkan pada lingkungan pengembangan ini.
        </p>
      </section>
    </Workspace>
  );
}
