CREATE TYPE "IssuePriority" AS ENUM ('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW');
ALTER TABLE "BriefingItem" ADD COLUMN "priority" "IssuePriority" NOT NULL DEFAULT 'MEDIUM';
