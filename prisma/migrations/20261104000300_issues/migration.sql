CREATE TYPE "IssueKind" AS ENUM ('ISSUE', 'UPDATE');
ALTER TABLE "AuditEvent" ADD COLUMN "entityType" TEXT, ADD COLUMN "metadata" JSONB;
CREATE TABLE "Category" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "active" BOOLEAN NOT NULL DEFAULT true);
CREATE TABLE "IssueRecord" (
 "id" TEXT PRIMARY KEY, "kind" "IssueKind" NOT NULL,
 "parentId" TEXT REFERENCES "IssueRecord"("id") ON DELETE RESTRICT,
 "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
 "assigneeId" TEXT REFERENCES "User"("id") ON DELETE RESTRICT,
 "currentVersion" INTEGER NOT NULL CHECK ("currentVersion" > 0),
 "publishedVersion" INTEGER,
 "deletedAt" TIMESTAMPTZ(3), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMPTZ(3) NOT NULL,
 CHECK (("kind" = 'ISSUE' AND "parentId" IS NULL) OR ("kind" = 'UPDATE' AND "parentId" IS NOT NULL)),
 CHECK ("publishedVersion" IS NULL OR "publishedVersion" <= "currentVersion")
);
CREATE TABLE "IssueRevision" (
 "recordId" TEXT NOT NULL REFERENCES "IssueRecord"("id") ON DELETE RESTRICT,
 "version" INTEGER NOT NULL CHECK ("version" > 0), "content" JSONB NOT NULL,
 "searchText" TEXT NOT NULL, "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("recordId", "version")
);
ALTER TABLE "IssueRecord" ADD CONSTRAINT "issue_current_revision" FOREIGN KEY ("id", "currentVersion") REFERENCES "IssueRevision"("recordId", "version") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "IssueRecord" ADD CONSTRAINT "issue_published_revision" FOREIGN KEY ("id", "publishedVersion") REFERENCES "IssueRevision"("recordId", "version") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "IssueRecord_parentId_idx" ON "IssueRecord"("parentId");
CREATE INDEX "IssueRecord_ownerId_idx" ON "IssueRecord"("ownerId");
CREATE INDEX "IssueRecord_assigneeId_idx" ON "IssueRecord"("assigneeId");
CREATE INDEX "issue_revision_search" ON "IssueRevision" USING GIN (to_tsvector('simple', "searchText"));
CREATE FUNCTION protect_issue_revision() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Revisi bersifat immutable'; END $$;
CREATE TRIGGER issue_revision_immutable BEFORE UPDATE OR DELETE ON "IssueRevision" FOR EACH ROW EXECUTE FUNCTION protect_issue_revision();
CREATE FUNCTION validate_issue_parent() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'UPDATE' AND (NEW."parentId" IS DISTINCT FROM OLD."parentId" OR NEW."kind" <> OLD."kind") THEN RAISE EXCEPTION 'Induk dan jenis tidak dapat diubah'; END IF;
 IF NEW."parentId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "IssueRecord" WHERE id=NEW."parentId" AND kind='ISSUE') THEN RAISE EXCEPTION 'Induk harus isu'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER issue_parent BEFORE INSERT OR UPDATE ON "IssueRecord" FOR EACH ROW EXECUTE FUNCTION validate_issue_parent();
INSERT INTO "Category" (id,name) VALUES ('layanan-publik','Layanan Publik'),('kebijakan','Kebijakan'),('operasional','Operasional') ON CONFLICT DO NOTHING;
