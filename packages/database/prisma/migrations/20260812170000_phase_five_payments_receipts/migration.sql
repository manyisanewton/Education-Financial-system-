CREATE TYPE "ReconciliationStatus" AS ENUM ('MATCHED', 'DISCREPANCY');
CREATE TYPE "ReconciliationItemStatus" AS ENUM ('MATCHED', 'MISSING_PAYMENT', 'AMOUNT_MISMATCH');

ALTER TABLE "payments" ADD COLUMN "idempotency_key" TEXT,
ADD COLUMN "reversal_reason" TEXT,
ADD COLUMN "reversed_at" TIMESTAMP(3);

CREATE TABLE "receipt_sequences" (
    "school_id" UUID NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "receipt_sequences_pkey" PRIMARY KEY ("school_id")
);

CREATE TABLE "payment_reconciliations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "ReconciliationStatus" NOT NULL,
    "statement_total" DECIMAL(14,2) NOT NULL,
    "matched_total" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_reconciliations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reconciliation_items" (
    "id" UUID NOT NULL,
    "reconciliation_id" UUID NOT NULL,
    "payment_id" UUID,
    "external_reference" TEXT NOT NULL,
    "external_amount" DECIMAL(14,2) NOT NULL,
    "status" "ReconciliationItemStatus" NOT NULL,
    CONSTRAINT "reconciliation_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_reconciliations_school_id_created_at_idx" ON "payment_reconciliations"("school_id", "created_at");
CREATE INDEX "reconciliation_items_payment_id_idx" ON "reconciliation_items"("payment_id");
CREATE UNIQUE INDEX "reconciliation_items_reconciliation_id_external_reference_key" ON "reconciliation_items"("reconciliation_id", "external_reference");
CREATE UNIQUE INDEX "payments_school_id_idempotency_key_key" ON "payments"("school_id", "idempotency_key");

ALTER TABLE "receipt_sequences" ADD CONSTRAINT "receipt_sequences_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_reconciliations" ADD CONSTRAINT "payment_reconciliations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "payment_reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
