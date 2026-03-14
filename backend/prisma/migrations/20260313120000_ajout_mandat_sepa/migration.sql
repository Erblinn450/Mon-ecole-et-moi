-- CreateTable
CREATE TABLE "mandats_sepa" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "rum" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "titulaire" TEXT NOT NULL,
    "signature_data" TEXT,
    "date_signature" TIMESTAMP(3),
    "ip_adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_revocation" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandats_sepa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mandats_sepa_rum_key" ON "mandats_sepa"("rum");

-- CreateIndex
CREATE INDEX "mandats_sepa_parent_id_idx" ON "mandats_sepa"("parent_id");

-- CreateIndex
CREATE INDEX "mandats_sepa_actif_idx" ON "mandats_sepa"("actif");

-- AddForeignKey
ALTER TABLE "mandats_sepa" ADD CONSTRAINT "mandats_sepa_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
