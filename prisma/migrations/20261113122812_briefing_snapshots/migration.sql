-- CreateEnum
CREATE TYPE "BriefingStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "BriefingSession" AS ENUM ('PAGI', 'MALAM', 'INSIDENTIL');

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "session" "BriefingSession" NOT NULL,
    "authorId" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedVersion" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingRevision" (
    "briefingId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "BriefingStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "followUp" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reviewComment" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMPTZ(3),
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefingRevision_pkey" PRIMARY KEY ("briefingId","version")
);

-- CreateTable
CREATE TABLE "BriefingItem" (
    "briefingId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "issueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "references" JSONB NOT NULL,

    CONSTRAINT "BriefingItem_pkey" PRIMARY KEY ("briefingId","version","position")
);

-- CreateIndex
CREATE INDEX "Briefing_date_session_idx" ON "Briefing"("date", "session");

-- AddForeignKey
ALTER TABLE "Briefing" ADD CONSTRAINT "Briefing_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingRevision" ADD CONSTRAINT "BriefingRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingRevision" ADD CONSTRAINT "BriefingRevision_briefingId_fkey" FOREIGN KEY ("briefingId") REFERENCES "Briefing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingItem" ADD CONSTRAINT "BriefingItem_briefingId_version_fkey" FOREIGN KEY ("briefingId", "version") REFERENCES "BriefingRevision"("briefingId", "version") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefingItem" ADD CONSTRAINT "BriefingItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "IssueRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
