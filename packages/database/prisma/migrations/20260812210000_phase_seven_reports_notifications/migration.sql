CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "NotificationJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');
ALTER TABLE "budgets" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "expenses" ALTER COLUMN "updated_at" DROP DEFAULT;
CREATE TABLE "notification_jobs" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationJobStatus" NOT NULL DEFAULT 'QUEUED',
    "dedupe_key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "scheduled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "last_error" TEXT,
    "provider_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notification_jobs_status_scheduled_at_idx" ON "notification_jobs"("status", "scheduled_at");
CREATE INDEX "notification_jobs_school_id_created_at_idx" ON "notification_jobs"("school_id", "created_at");
CREATE UNIQUE INDEX "notification_jobs_school_id_dedupe_key_key" ON "notification_jobs"("school_id", "dedupe_key");
ALTER TABLE "notification_jobs" ADD CONSTRAINT "notification_jobs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
