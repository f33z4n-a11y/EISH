ALTER TABLE "IssueRecord" ADD COLUMN "categoryId" TEXT REFERENCES "Category"("id") ON DELETE RESTRICT;
UPDATE "IssueRecord" i SET "categoryId"=r.content->>'categoryId' FROM "IssueRevision" r WHERE i.kind='ISSUE' AND r."recordId"=i.id AND r.version=i."currentVersion";
