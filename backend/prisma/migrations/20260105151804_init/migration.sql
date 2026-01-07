-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'ADMIN', 'EDUCATEUR');

-- CreateEnum
CREATE TYPE "StatutPreinscription" AS ENUM ('EN_ATTENTE', 'DEJA_CONTACTE', 'VALIDE', 'REFUSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('EN_COURS', 'ACTIVE', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "Classe" AS ENUM ('MATERNELLE', 'ELEMENTAIRE', 'COLLEGE');

-- CreateEnum
CREATE TYPE "SituationFamiliale" AS ENUM ('MARIES', 'PACSES', 'UNION_LIBRE', 'SEPARES', 'DIVORCES', 'FAMILLE_MONOPARENTALE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeRepas" AS ENUM ('MIDI', 'GOUTER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "date_naissance" TIMESTAMP(3),
    "adresse" TEXT,
    "telephone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "premiere_connexion" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMP(3),
    "remember_token" TEXT,
    "preinscription_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preinscriptions" (
    "id" SERIAL NOT NULL,
    "numero_dossier" TEXT NOT NULL,
    "nom_enfant" TEXT NOT NULL,
    "prenom_enfant" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "lieu_naissance" TEXT,
    "nationalite" TEXT,
    "allergies" TEXT,
    "classe_souhaitee" "Classe" NOT NULL,
    "etablissement_precedent" TEXT,
    "classe_actuelle" TEXT,
    "civilite_parent" TEXT,
    "nom_parent" TEXT NOT NULL,
    "prenom_parent" TEXT NOT NULL,
    "email_parent" TEXT NOT NULL,
    "telephone_parent" TEXT NOT NULL,
    "lien_parente" TEXT,
    "adresse_parent" TEXT,
    "profession_parent" TEXT,
    "civilite_parent2" TEXT,
    "nom_parent2" TEXT,
    "prenom_parent2" TEXT,
    "email_parent2" TEXT,
    "telephone_parent2" TEXT,
    "lien_parente2" TEXT,
    "adresse_parent2" TEXT,
    "profession_parent2" TEXT,
    "date_integration" TIMESTAMP(3),
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutPreinscription" NOT NULL DEFAULT 'EN_ATTENTE',
    "compte_cree" BOOLEAN NOT NULL DEFAULT false,
    "commentaire_refus" TEXT,
    "situation_familiale" "SituationFamiliale",
    "situation_autre" TEXT,
    "decouverte" TEXT,
    "pedagogie_montessori" TEXT,
    "difficultes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preinscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfants" (
    "id_enfant" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3),
    "lieu_naissance" TEXT,
    "classe" "Classe",
    "id_parent1" INTEGER NOT NULL,
    "id_parent2" INTEGER,
    "preinscription_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enfants_pkey" PRIMARY KEY ("id_enfant")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id_inscription" SERIAL NOT NULL,
    "id_enfant" INTEGER NOT NULL,
    "id_parent" INTEGER,
    "date_inscription" TIMESTAMP(3) NOT NULL,
    "statut" "StatutInscription" NOT NULL,
    "commentaires" TEXT,
    "annee_scolaire" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id_inscription")
);

-- CreateTable
CREATE TABLE "repas" (
    "id_repas" SERIAL NOT NULL,
    "id_enfant" INTEGER NOT NULL,
    "date_repas" TIMESTAMP(3) NOT NULL,
    "type" "TypeRepas" NOT NULL,
    "valide" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repas_pkey" PRIMARY KEY ("id_repas")
);

-- CreateTable
CREATE TABLE "periscolaires" (
    "id_periscolaire" SERIAL NOT NULL,
    "id_enfant" INTEGER NOT NULL,
    "date_periscolaire" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periscolaires_pkey" PRIMARY KEY ("id_periscolaire")
);

-- CreateTable
CREATE TABLE "justificatifs_attendus" (
    "id_type" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "obligatoire" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "justificatifs_attendus_pkey" PRIMARY KEY ("id_type")
);

-- CreateTable
CREATE TABLE "justificatifs" (
    "id_justificatif" SERIAL NOT NULL,
    "id_enfant" INTEGER NOT NULL,
    "id_type" INTEGER NOT NULL,
    "fichier_url" TEXT NOT NULL,
    "valide" BOOLEAN,
    "date_depot" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "justificatifs_pkey" PRIMARY KEY ("id_justificatif")
);

-- CreateTable
CREATE TABLE "signature_reglements" (
    "id" SERIAL NOT NULL,
    "enfant_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "parent_name" TEXT NOT NULL,
    "parent_email" TEXT NOT NULL,
    "enfant_name" TEXT NOT NULL,
    "parent_date_signature" TIMESTAMP(3),
    "enfant_date_signature" TIMESTAMP(3),
    "parent_accepte" BOOLEAN NOT NULL DEFAULT false,
    "enfant_accepte" BOOLEAN NOT NULL DEFAULT false,
    "parent_signature_electronique" TEXT,
    "enfant_signature_electronique" TEXT,
    "parent_ip_adresse" TEXT,
    "enfant_ip_adresse" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signature_reglements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_ouvertures" (
    "id" SERIAL NOT NULL,
    "enfant_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "pdf_type" TEXT NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_ouvertures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id_facture" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "montant_paye" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "date_emission" TIMESTAMP(3) NOT NULL,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "type" TEXT NOT NULL,
    "periode" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id_facture")
);

-- CreateTable
CREATE TABLE "lignes_factures" (
    "id" SERIAL NOT NULL,
    "facture_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prix_unit" DECIMAL(10,2) NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lignes_factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendrier_scolaire" (
    "id" SERIAL NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "annee_scolaire" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendrier_scolaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "cache_locks" (
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "preinscriptions_numero_dossier_key" ON "preinscriptions"("numero_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "repas_id_enfant_date_repas_type_key" ON "repas"("id_enfant", "date_repas", "type");

-- CreateIndex
CREATE UNIQUE INDEX "periscolaires_id_enfant_date_periscolaire_key" ON "periscolaires"("id_enfant", "date_periscolaire");

-- CreateIndex
CREATE INDEX "signature_reglements_enfant_id_idx" ON "signature_reglements"("enfant_id");

-- CreateIndex
CREATE INDEX "signature_reglements_parent_id_idx" ON "signature_reglements"("parent_id");

-- CreateIndex
CREATE INDEX "signature_reglements_parent_accepte_idx" ON "signature_reglements"("parent_accepte");

-- CreateIndex
CREATE INDEX "signature_reglements_enfant_accepte_idx" ON "signature_reglements"("enfant_accepte");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE INDEX "jobs_queue_idx" ON "jobs"("queue");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_key" ON "failed_jobs"("uuid");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_id_parent1_fkey" FOREIGN KEY ("id_parent1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_id_parent2_fkey" FOREIGN KEY ("id_parent2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_preinscription_id_fkey" FOREIGN KEY ("preinscription_id") REFERENCES "preinscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_enfant_fkey" FOREIGN KEY ("id_enfant") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repas" ADD CONSTRAINT "repas_id_enfant_fkey" FOREIGN KEY ("id_enfant") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periscolaires" ADD CONSTRAINT "periscolaires_id_enfant_fkey" FOREIGN KEY ("id_enfant") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "justificatifs" ADD CONSTRAINT "justificatifs_id_enfant_fkey" FOREIGN KEY ("id_enfant") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "justificatifs" ADD CONSTRAINT "justificatifs_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "justificatifs_attendus"("id_type") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_reglements" ADD CONSTRAINT "signature_reglements_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_reglements" ADD CONSTRAINT "signature_reglements_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_factures" ADD CONSTRAINT "lignes_factures_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id_facture") ON DELETE CASCADE ON UPDATE CASCADE;
