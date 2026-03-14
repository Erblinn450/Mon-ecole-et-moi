-- AlterTable
ALTER TABLE "factures" ADD COLUMN     "facture_source_id" INTEGER;

-- CreateIndex
CREATE INDEX "factures_facture_source_id_idx" ON "factures"("facture_source_id");

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_facture_source_id_fkey" FOREIGN KEY ("facture_source_id") REFERENCES "factures"("id_facture") ON DELETE SET NULL ON UPDATE CASCADE;
