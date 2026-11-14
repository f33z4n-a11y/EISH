CREATE TABLE "ReaderCheckpoint" (
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "ReaderCheckpoint_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "ReaderCheckpoint" ADD CONSTRAINT "ReaderCheckpoint_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
