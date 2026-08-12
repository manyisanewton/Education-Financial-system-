-- A guardian phone identifies one guardian within a school. This enables
-- idempotent student imports while allowing the same phone in another school.
DROP INDEX "guardians_school_id_phone_idx";

CREATE UNIQUE INDEX "guardians_school_id_phone_key"
ON "guardians"("school_id", "phone");
