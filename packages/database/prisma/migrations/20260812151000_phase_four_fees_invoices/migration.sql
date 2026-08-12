CREATE TYPE "AdjustmentType" AS ENUM ('DEBIT', 'CREDIT');

DROP INDEX "invoice_batches_idempotency_key_key";

ALTER TABLE "fee_structures" ADD COLUMN "updated_at" TIMESTAMP(3);
UPDATE "fee_structures" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
ALTER TABLE "fee_structures" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "invoice_batches" ADD COLUMN "school_id" UUID;
UPDATE "invoice_batches" AS batch
SET "school_id" = structure."school_id"
FROM "fee_structures" AS structure
WHERE structure."id" = batch."fee_structure_id";
ALTER TABLE "invoice_batches" ALTER COLUMN "school_id" SET NOT NULL;

CREATE TABLE "fee_structure_assignments" (
    "id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fee_structure_assignments_pkey" PRIMARY KEY ("id")
);

INSERT INTO "fee_structure_assignments" ("id", "fee_structure_id", "class_id")
SELECT gen_random_uuid(), "id", "class_id"
FROM "fee_structures"
WHERE "class_id" IS NOT NULL;

CREATE TABLE "credit_notes" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "credit_note_number" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credit_note_items" (
    "id" UUID NOT NULL,
    "credit_note_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    CONSTRAINT "credit_note_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_adjustments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_adjustments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fee_structure_assignments_class_id_idx" ON "fee_structure_assignments"("class_id");
CREATE UNIQUE INDEX "fee_structure_assignments_fee_structure_id_class_id_key" ON "fee_structure_assignments"("fee_structure_id", "class_id");
CREATE INDEX "credit_notes_school_id_student_id_issued_at_idx" ON "credit_notes"("school_id", "student_id", "issued_at");
CREATE UNIQUE INDEX "credit_notes_school_id_credit_note_number_key" ON "credit_notes"("school_id", "credit_note_number");
CREATE INDEX "invoice_adjustments_school_id_invoice_id_created_at_idx" ON "invoice_adjustments"("school_id", "invoice_id", "created_at");
CREATE INDEX "invoice_batches_school_id_created_at_idx" ON "invoice_batches"("school_id", "created_at");
CREATE UNIQUE INDEX "invoice_batches_school_id_idempotency_key_key" ON "invoice_batches"("school_id", "idempotency_key");

ALTER TABLE "fee_structure_assignments" ADD CONSTRAINT "fee_structure_assignments_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_structure_assignments" ADD CONSTRAINT "fee_structure_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_batches" ADD CONSTRAINT "invoice_batches_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "credit_note_items" ADD CONSTRAINT "credit_note_items_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_adjustments" ADD CONSTRAINT "invoice_adjustments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoice_adjustments" ADD CONSTRAINT "invoice_adjustments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
