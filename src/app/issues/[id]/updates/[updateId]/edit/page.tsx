import { IssueFormPage } from "@/components/issue-form-page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; updateId: string }>;
}) {
  const p = await params;
  return <IssueFormPage id={p.id} updateId={p.updateId} />;
}
