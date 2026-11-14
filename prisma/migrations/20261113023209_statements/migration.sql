-- CreateEnum
CREATE TYPE "StatementVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SUPERSEDED', 'REVOKED');

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "IssueRecord_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "IssueRecord_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "IssueRecord_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "IssueRecord_parentId_fkey";

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "issue_current_revision";

-- DropForeignKey
ALTER TABLE "IssueRecord" DROP CONSTRAINT "issue_published_revision";

-- DropForeignKey
ALTER TABLE "IssueRevision" DROP CONSTRAINT "IssueRevision_actorId_fkey";

-- DropForeignKey
ALTER TABLE "IssueRevision" DROP CONSTRAINT "IssueRevision_recordId_fkey";

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "approvedVersion" INTEGER,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementVersion" (
    "statementId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "StatementVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "changeReason" TEXT,
    "validFrom" TIMESTAMPTZ(3),
    "validUntil" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "revokeReason" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "StatementVersion_pkey" PRIMARY KEY ("statementId","version")
);

-- CreateIndex
CREATE INDEX "Statement_issueId_idx" ON "Statement"("issueId");

-- CreateIndex
CREATE INDEX "StatementVersion_status_idx" ON "StatementVersion"("status");

-- AddForeignKey
ALTER TABLE "IssueRecord" ADD CONSTRAINT "IssueRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueRecord" ADD CONSTRAINT "IssueRecord_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "IssueRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueRecord" ADD CONSTRAINT "IssueRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueRecord" ADD CONSTRAINT "IssueRecord_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "IssueRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementVersion" ADD CONSTRAINT "StatementVersion_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "Statement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementVersion" ADD CONSTRAINT "StatementVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueRevision" ADD CONSTRAINT "IssueRevision_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "IssueRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueRevision" ADD CONSTRAINT "IssueRevision_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
