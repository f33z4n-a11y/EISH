import { IssueFormPage } from "@/components/issue-form-page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <IssueFormPage id={(await params).id} />;
}
