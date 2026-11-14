import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canCreateIssue, canEditIssue, issueDetail } from "@/lib/issues";
import { defaultContent } from "@/lib/issue-content";
import { Workspace } from "./workspace";
import { IssueEditor } from "./issue-editor";
import Link from "next/link";
export async function IssueFormPage({
  id,
  updateId,
  addUpdate = false,
}: {
  id?: string;
  updateId?: string;
  addUpdate?: boolean;
}) {
  const actor = await requireUser();
  const detail = id ? await issueDetail(actor, id) : null;
  if (id && !detail) notFound();
  if (detail ? !canEditIssue(actor, detail.record) : !canCreateIssue(actor))
    redirect("/dashboard?akses=ditolak");
  const update = updateId
    ? detail?.updates.find((u) => u.id === updateId)
    : null;
  if (updateId && !update) notFound();
  const kind = update || addUpdate ? "UPDATE" : "ISSUE";
  const initial =
    update?.content ??
    (addUpdate
      ? {
          ...defaultContent(detail!.record.ownerId),
          assigneeId: detail!.record.assigneeId ?? "",
        }
      : (detail?.issue.content ?? defaultContent(actor.id)));
  // Update mengikuti penugasan induk terbaru.
  if (kind === "UPDATE" && detail) {
    initial.ownerId = detail.record.ownerId;
    initial.assigneeId = detail.record.assigneeId ?? "";
  }
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  const users = actor.roles.includes("EDITOR")
    ? await db.user.findMany({
        where: {
          active: true,
          roles: { some: { role: { in: ["EDITOR", "CONTRIBUTOR"] } } },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];
  return (
    <Workspace current="/issues">
      <p><Link href={id ? `/issues/${id}` : "/issues"}>← Kembali ke {id ? "detail isu" : "daftar isu"}</Link></p>
      <h1>
        {addUpdate
          ? "Tambah perkembangan"
          : update
            ? "Sunting perkembangan"
            : id
              ? "Sunting isu"
              : "Buat isu"}
      </h1>
      <p className="notice">
        {actor.roles.includes("EDITOR") && kind === "ISSUE" && !id
          ? "Pilih simpan draft atau terbitkan langsung agar segera terlihat Reader. Standby Statement dapat dilengkapi setelah isu terbit."
          : "Disimpan sebagai draft. Editor menerbitkan revisi agar dapat dibaca Reader."}
      </p>
      <IssueEditor
        initial={initial}
        id={update?.id ?? (!addUpdate ? id : undefined)}
        parentId={kind === "UPDATE" ? id : undefined}
        version={update?.version ?? detail?.issue.version}
        kind={kind}
        categories={categories}
        users={users}
        assignment={actor.roles.includes("EDITOR")}
        canPublishNow={actor.roles.includes("EDITOR") && kind === "ISSUE" && !id}
      />
    </Workspace>
  );
}
