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

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('EN_ATTENTE', 'ENVOYEE', 'PAYEE', 'PARTIELLE', 'EN_RETARD', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeFacture" AS ENUM ('MENSUELLE', 'PONCTUELLE', 'AVOIR');

-- CreateEnum
CREATE TYPE "TypeEvenementCalendrier" AS ENUM ('VACANCES', 'FERIE', 'PONT', 'JOURNEE_SPECIALE');

-- CreateEnum
CREATE TYPE "StatutReinscription" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "FrequencePaiement" AS ENUM ('MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('PRELEVEMENT', 'VIREMENT', 'CHEQUE');

-- CreateEnum
CREATE TYPE "DestinataireFacture" AS ENUM ('LES_DEUX', 'PARENT1', 'PARENT2');

-- CreateEnum
CREATE TYPE "TypeLigne" AS ENUM ('SCOLARITE', 'REPAS', 'PERISCOLAIRE', 'DEPASSEMENT', 'INSCRIPTION', 'MATERIEL', 'REDUCTION', 'PERSONNALISE');

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
    "reset_token_selector" TEXT,
    "reset_token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "frequence_paiement" "FrequencePaiement",
    "mode_paiement_pref" "ModePaiement",
    "destinataire_facture" "DestinataireFacture",
    "reduction_rfr" BOOLEAN NOT NULL DEFAULT false,
    "taux_reduction_rfr" DECIMAL(5,2),
    "iban_parent" TEXT,
    "mandat_sepa_ref" TEXT,

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
    "attentes_structure" TEXT,
    "pedagogie_montessori" TEXT,
    "difficultes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "token_expires_at" TIMESTAMP(3),
    "token_verification" TEXT,

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
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enfants_pkey" PRIMARY KEY ("id_enfant")
);

-- CreateTable
CREATE TABLE "personnes_autorisees" (
    "id" SERIAL NOT NULL,
    "enfant_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "lien_parente" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnes_autorisees_pkey" PRIMARY KEY ("id")
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
    "periode" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'EN_ATTENTE',
    "type" "TypeFacture" NOT NULL,
    "enfant_id" INTEGER,
    "destinataire" "DestinataireFacture",
    "mode_paiement" "ModePaiement",
    "date_prelevement" TIMESTAMP(3),
    "commentaire" TEXT,
    "annee_scolaire" TEXT,

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
    "commentaire" TEXT,
    "type" "TypeLigne",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lignes_factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendrier_scolaire" (
    "id" SERIAL NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "annee_scolaire" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "TypeEvenementCalendrier" NOT NULL,

    CONSTRAINT "calendrier_scolaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reinscriptions" (
    "id" SERIAL NOT NULL,
    "enfant_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "annee_scolaire" TEXT NOT NULL,
    "classe_actuelle" TEXT,
    "classe_souhaitee" TEXT,
    "statut" "StatutReinscription" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaire" TEXT,
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_traitement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reinscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_tarifs" (
    "id" SERIAL NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "annee_scolaire" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_tarifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles_personnalises" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix_defaut" DECIMAL(10,2) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_personnalises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" SERIAL NOT NULL,
    "facture_id" INTEGER NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "date_paiement" TIMESTAMP(3) NOT NULL,
    "mode_paiement" "ModePaiement" NOT NULL,
    "reference" TEXT,
    "commentaire" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_actif_idx" ON "users"("actif");

-- CreateIndex
CREATE INDEX "users_role_actif_idx" ON "users"("role", "actif");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "preinscriptions_numero_dossier_key" ON "preinscriptions"("numero_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "preinscriptions_token_verification_key" ON "preinscriptions"("token_verification");

-- CreateIndex
CREATE INDEX "preinscriptions_statut_idx" ON "preinscriptions"("statut");

-- CreateIndex
CREATE INDEX "preinscriptions_email_parent_idx" ON "preinscriptions"("email_parent");

-- CreateIndex
CREATE INDEX "preinscriptions_date_demande_idx" ON "preinscriptions"("date_demande");

-- CreateIndex
CREATE INDEX "enfants_classe_idx" ON "enfants"("classe");

-- CreateIndex
CREATE INDEX "enfants_id_parent1_idx" ON "enfants"("id_parent1");

-- CreateIndex
CREATE INDEX "enfants_preinscription_id_idx" ON "enfants"("preinscription_id");

-- CreateIndex
CREATE INDEX "enfants_deleted_at_idx" ON "enfants"("deleted_at");

-- CreateIndex
CREATE INDEX "personnes_autorisees_enfant_id_idx" ON "personnes_autorisees"("enfant_id");

-- CreateIndex
CREATE INDEX "inscriptions_id_enfant_idx" ON "inscriptions"("id_enfant");

-- CreateIndex
CREATE INDEX "inscriptions_id_parent_idx" ON "inscriptions"("id_parent");

-- CreateIndex
CREATE INDEX "inscriptions_annee_scolaire_idx" ON "inscriptions"("annee_scolaire");

-- CreateIndex
CREATE INDEX "inscriptions_statut_idx" ON "inscriptions"("statut");

-- CreateIndex
CREATE INDEX "repas_date_repas_idx" ON "repas"("date_repas");

-- CreateIndex
CREATE INDEX "repas_id_enfant_date_repas_idx" ON "repas"("id_enfant", "date_repas");

-- CreateIndex
CREATE UNIQUE INDEX "repas_id_enfant_date_repas_type_key" ON "repas"("id_enfant", "date_repas", "type");

-- CreateIndex
CREATE INDEX "periscolaires_date_periscolaire_idx" ON "periscolaires"("date_periscolaire");

-- CreateIndex
CREATE INDEX "periscolaires_id_enfant_date_periscolaire_idx" ON "periscolaires"("id_enfant", "date_periscolaire");

-- CreateIndex
CREATE UNIQUE INDEX "periscolaires_id_enfant_date_periscolaire_key" ON "periscolaires"("id_enfant", "date_periscolaire");

-- CreateIndex
CREATE INDEX "justificatifs_id_enfant_idx" ON "justificatifs"("id_enfant");

-- CreateIndex
CREATE INDEX "justificatifs_valide_idx" ON "justificatifs"("valide");

-- CreateIndex
CREATE INDEX "justificatifs_id_enfant_id_type_idx" ON "justificatifs"("id_enfant", "id_type");

-- CreateIndex
CREATE UNIQUE INDEX "signature_reglements_enfant_id_key" ON "signature_reglements"("enfant_id");

-- CreateIndex
CREATE INDEX "signature_reglements_parent_id_idx" ON "signature_reglements"("parent_id");

-- CreateIndex
CREATE INDEX "signature_reglements_parent_accepte_idx" ON "signature_reglements"("parent_accepte");

-- CreateIndex
CREATE INDEX "pdf_ouvertures_enfant_id_idx" ON "pdf_ouvertures"("enfant_id");

-- CreateIndex
CREATE INDEX "pdf_ouvertures_parent_id_idx" ON "pdf_ouvertures"("parent_id");

-- CreateIndex
CREATE INDEX "pdf_ouvertures_opened_at_idx" ON "pdf_ouvertures"("opened_at");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE INDEX "factures_parent_id_idx" ON "factures"("parent_id");

-- CreateIndex
CREATE INDEX "factures_statut_idx" ON "factures"("statut");

-- CreateIndex
CREATE INDEX "factures_date_echeance_idx" ON "factures"("date_echeance");

-- CreateIndex
CREATE INDEX "factures_statut_date_echeance_idx" ON "factures"("statut", "date_echeance");

-- CreateIndex
CREATE INDEX "factures_periode_idx" ON "factures"("periode");

-- CreateIndex
CREATE INDEX "factures_enfant_id_idx" ON "factures"("enfant_id");

-- CreateIndex
CREATE INDEX "factures_annee_scolaire_idx" ON "factures"("annee_scolaire");

-- CreateIndex
CREATE INDEX "lignes_factures_facture_id_idx" ON "lignes_factures"("facture_id");

-- CreateIndex
CREATE INDEX "lignes_factures_type_idx" ON "lignes_factures"("type");

-- CreateIndex
CREATE INDEX "calendrier_scolaire_annee_scolaire_idx" ON "calendrier_scolaire"("annee_scolaire");

-- CreateIndex
CREATE INDEX "calendrier_scolaire_date_debut_date_fin_idx" ON "calendrier_scolaire"("date_debut", "date_fin");

-- CreateIndex
CREATE INDEX "calendrier_scolaire_type_idx" ON "calendrier_scolaire"("type");

-- CreateIndex
CREATE INDEX "reinscriptions_parent_id_idx" ON "reinscriptions"("parent_id");

-- CreateIndex
CREATE INDEX "reinscriptions_annee_scolaire_idx" ON "reinscriptions"("annee_scolaire");

-- CreateIndex
CREATE INDEX "reinscriptions_statut_idx" ON "reinscriptions"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "reinscriptions_enfant_id_annee_scolaire_key" ON "reinscriptions"("enfant_id", "annee_scolaire");

-- CreateIndex
CREATE INDEX "config_tarifs_annee_scolaire_idx" ON "config_tarifs"("annee_scolaire");

-- CreateIndex
CREATE INDEX "config_tarifs_categorie_idx" ON "config_tarifs"("categorie");

-- CreateIndex
CREATE INDEX "config_tarifs_actif_idx" ON "config_tarifs"("actif");

-- CreateIndex
CREATE UNIQUE INDEX "config_tarifs_cle_annee_scolaire_key" ON "config_tarifs"("cle", "annee_scolaire");

-- CreateIndex
CREATE INDEX "articles_personnalises_actif_idx" ON "articles_personnalises"("actif");

-- CreateIndex
CREATE INDEX "paiements_facture_id_idx" ON "paiements"("facture_id");

-- CreateIndex
CREATE INDEX "paiements_date_paiement_idx" ON "paiements"("date_paiement");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_id_parent1_fkey" FOREIGN KEY ("id_parent1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_id_parent2_fkey" FOREIGN KEY ("id_parent2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfants" ADD CONSTRAINT "enfants_preinscription_id_fkey" FOREIGN KEY ("preinscription_id") REFERENCES "preinscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnes_autorisees" ADD CONSTRAINT "personnes_autorisees_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_enfant_fkey" FOREIGN KEY ("id_enfant") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_parent_fkey" FOREIGN KEY ("id_parent") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "pdf_ouvertures" ADD CONSTRAINT "pdf_ouvertures_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_ouvertures" ADD CONSTRAINT "pdf_ouvertures_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_factures" ADD CONSTRAINT "lignes_factures_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id_facture") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinscriptions" ADD CONSTRAINT "reinscriptions_enfant_id_fkey" FOREIGN KEY ("enfant_id") REFERENCES "enfants"("id_enfant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reinscriptions" ADD CONSTRAINT "reinscriptions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id_facture") ON DELETE CASCADE ON UPDATE CASCADE;
