import { Classe, FrequencePaiement, TypeLigne } from '@prisma/client';

/**
 * Options pour le calcul des lignes de facture
 */
export interface CalculLignesOptions {
  /** Inclure les frais de scolarité */
  inclureScolarite?: boolean;
  /** Inclure les repas */
  inclureRepas?: boolean;
  /** Inclure le périscolaire */
  inclurePeriscolaire?: boolean;
  /** Inclure les frais d'inscription (généralement septembre) */
  inclureInscription?: boolean;
  /** Inclure les frais de fonctionnement/matériel (généralement septembre) */
  inclureFonctionnement?: boolean;
  /** Surcharger la fréquence de paiement du parent */
  frequence?: FrequencePaiement;
  /** Année scolaire (ex: "2025-2026") - OBLIGATOIRE */
  anneeScolaire: string;
}

/**
 * Une ligne de facture calculée
 */
export interface LigneFactureCalculee {
  /** Type de ligne (SCOLARITE, REPAS, etc.) */
  type: TypeLigne;
  /** Description affichée sur la facture */
  description: string;
  /** Quantité (1 pour scolarité, N pour repas/péri) */
  quantite: number;
  /** Prix unitaire en euros */
  prixUnit: number;
  /** Montant total = quantité × prix unitaire */
  montant: number;
  /** Commentaire optionnel (ex: "Réduction RFR 6%") */
  commentaire?: string;
}

/**
 * Résultat du calcul pour un enfant
 */
export interface ResultatCalculEnfant {
  enfantId: number;
  enfantNom: string;
  enfantPrenom: string;
  classe: Classe;
  /** Rang dans la fratrie (1 = aîné, 2+ = cadet) */
  rangFratrie: number;
  /** Liste des lignes de facture */
  lignes: LigneFactureCalculee[];
  /** Total avant réductions */
  totalAvantReduction: number;
  /** Montant total des réductions */
  totalReductions: number;
  /** Total net à payer */
  totalNet: number;
}

/**
 * Résultat du calcul pour une famille entière
 */
export interface ResultatCalculFamille {
  parentId: number;
  parentNom: string;
  parentEmail: string;
  frequencePaiement: FrequencePaiement;
  /** Calculs par enfant */
  enfants: ResultatCalculEnfant[];
  /** Total famille */
  totalFamille: number;
  /** Période concernée (ex: "2026-02" ou "2026-T1") */
  periode: string;
}

/**
 * Enfant avec contexte de facturation
 */
export interface EnfantFacturable {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: Date | null;
  classe: Classe;
  /** Rang dans la fratrie (1 = premier inscrit/aîné) */
  rangFratrie: number;
  /** Est-ce la première année d'inscription ? */
  estPremiereAnnee: boolean;
}

/**
 * Détail du calcul de scolarité avec breakdown
 */
export interface DetailCalculScolarite {
  /** Montant de base avant réductions */
  montantBase: number;
  /** Est-ce un tarif fratrie ? */
  estFratrie: boolean;
  /** Montant de la réduction fratrie (informatif) */
  reductionFratrie: number;
  /** Montant de la réduction RFR */
  reductionRFR: number;
  /** Montant final après réductions */
  montantFinal: number;
}

/**
 * Résultat du comptage repas/périscolaire
 */
export interface ResultatComptage {
  /** Nombre d'occurrences */
  count: number;
  /** Montant total */
  montant: number;
}
