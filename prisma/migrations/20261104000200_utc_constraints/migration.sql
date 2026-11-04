-- Semua waktu server disimpan sebagai timestamp berzona waktu UTC.
ALTER TABLE "User" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "User" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Session" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Session" ALTER COLUMN "lastSeenAt" TYPE TIMESTAMPTZ(3) USING "lastSeenAt" AT TIME ZONE 'UTC';
ALTER TABLE "Session" ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC';
ALTER TABLE "LoginThrottle" ALTER COLUMN "windowStart" TYPE TIMESTAMPTZ(3) USING "windowStart" AT TIME ZONE 'UTC';
ALTER TABLE "AuditEvent" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "User" ADD CONSTRAINT "User_email_normalized" CHECK ("email" = lower(btrim("email")));
ALTER TABLE "User" ADD CONSTRAINT "User_username_normalized" CHECK ("username" = lower("username") AND "username" ~ '^[a-z0-9_.-]{3,40}$');
ALTER TABLE "LoginThrottle" ADD CONSTRAINT "LoginThrottle_attempts_positive" CHECK ("attempts" >= 0);
