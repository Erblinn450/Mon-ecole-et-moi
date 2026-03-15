-- DropForeignKey
ALTER TABLE "reinscriptions" DROP CONSTRAINT "reinscriptions_enfant_id_fkey";

-- DropForeignKey
ALTER TABLE "reinscriptions" DROP CONSTRAINT "reinscriptions_parent_id_fkey";

-- CreateIndex
CREATE INDEX "enfants_id_parent2_idx" ON "enfants"("id_parent2");

-- AddForeignKey
ALTER TABLE "reinscriptions" ADD CONSTRAINT "reinscriptions_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinscriptions" ADD CONSTRAINT "reinscriptions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
