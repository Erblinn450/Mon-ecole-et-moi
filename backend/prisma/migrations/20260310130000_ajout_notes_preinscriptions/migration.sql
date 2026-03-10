-- CreateTable
CREATE TABLE "notes_preinscriptions" (
    "id" SERIAL NOT NULL,
    "preinscription_id" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "auteur" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_preinscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_preinscriptions_preinscription_id_idx" ON "notes_preinscriptions"("preinscription_id");

-- AddForeignKey
ALTER TABLE "notes_preinscriptions" ADD CONSTRAINT "notes_preinscriptions_preinscription_id_fkey" FOREIGN KEY ("preinscription_id") REFERENCES "preinscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
