/**
 * Configuration des tarifs de l'école Montessori "Mon École et Moi"
 * Brunstatt-Didenheim
 * Année scolaire 2025-2026
 *
 * Note : les tarifs réels de facturation sont gérés côté backend
 * via la table ConfigTarif (modifiables par l'admin).
 * Ce fichier sert uniquement à l'affichage informatif frontend.
 */

export const TARIFS = {
  // Frais d'inscription (2025-2026)
  inscription: {
    premiereAnnee: 350,          // € - Première année par élève
    premiereAnneeFratrie: 150,   // € - Première année fratrie
    anneesSuivantes: 165,        // € - Par élève et par an
    anneesSuivantesFratrie: 150, // € - Fratrie
  },

  // Frais de scolarité (2025-2026)
  scolarite: {
    mensuel: 575,                // € - Maison des enfants/Élémentaire
    mensuelFratrie: 540,         // € - Fratrie maternelle/élémentaire
    mensuelCollege: 710,         // € - Collège
    mensuelCollegeFratrie: 640,  // € - Fratrie collège
    annuel: 6900,                // € - Total annuel (575 × 12)
    reductionFratrie: 0.06,      // 6% réduction fratrie
  },

  // Frais de fonctionnement annuels (matériel pédagogique)
  fonctionnement: {
    maternelle: 65,              // € - Maison des enfants (3-6 ans)
    elementaire: 85,             // € - 6-12 ans
    college: 95,                 // € - Collège
  },

  // Restauration
  repas: {
    midi: 5.45,                  // € - Par repas (traiteur)
  },

  // Périscolaire (garderie)
  periscolaire: {
    seance: 6.20,                // € - Par séance (16h00 - 17h30, goûter inclus)
  },
};

// Informations de l'école
export const ECOLE_INFO = {
  nom: "Mon École et Moi",
  sousTitre: "École Montessori",
  adresse: {
    rue: "58 rue Damberg",
    codePostal: "68350",
    ville: "Brunstatt-Didenheim",
  },
  contact: {
    telephone: "03 89 06 07 77",
    email: "contact@montessorietmoi.com",
  },
  fondation: 2016,
};

// Organisation de la semaine
export const ORGANISATION = {
  // Jours d'école (4 jours)
  joursOuvrables: [1, 2, 4, 5], // Lundi=1, Mardi=2, Jeudi=4, Vendredi=5
  joursFermes: [0, 3, 6],      // Dimanche=0, Mercredi=3, Samedi=6

  // Horaires
  horaires: {
    accueil: "8h30",
    finCours: "16h00",
    finPeriscolaire: "17h30",
  },

  // Détails périscolaire
  periscolaire: {
    debut: "16h00",
    fin: "17h30",
    description: "Garderie + goûter inclus",
  },
};

// Classes disponibles
export const CLASSES_DISPONIBLES = {
  maternelle: {
    nom: "Maison des enfants",
    ageMin: 3,
    ageMax: 6,
    description: "Classe multi-âges 3-6 ans",
  },
  elementaire: {
    nom: "Élémentaire",
    ageMin: 6,
    ageMax: 12,
    description: "Classe multi-âges 6-12 ans (CP au CM2)",
  },
  college: {
    nom: "Collège",
    ageMin: 12,
    ageMax: 15,
    description: "Classe multi-âges 12-15 ans",
  },
};

// Formatter le prix
export const formatPrix = (prix: number, suffix: string = ""): string => {
  return `${prix.toFixed(2).replace(".", ",")} €${suffix}`;
};

// Calculer le tarif annuel avec réduction fratrie
export const calculerTarifAnnuel = (
  nombreEnfants: number,
  classe: "maternelle" | "elementaire" | "college",
  premiereAnnee: boolean = false
): { total: number; details: string[] } => {
  const details: string[] = [];
  let total = 0;

  for (let i = 0; i < nombreEnfants; i++) {
    // Frais d'inscription
    const fraisInscription = premiereAnnee
      ? (i === 0 ? TARIFS.inscription.premiereAnnee : TARIFS.inscription.premiereAnneeFratrie)
      : (i === 0 ? TARIFS.inscription.anneesSuivantes : TARIFS.inscription.anneesSuivantesFratrie);

    // Scolarité mensuelle selon classe et fratrie
    let mensuel: number;
    if (classe === "college") {
      mensuel = i === 0 ? TARIFS.scolarite.mensuelCollege : TARIFS.scolarite.mensuelCollegeFratrie;
    } else {
      mensuel = i === 0 ? TARIFS.scolarite.mensuel : TARIFS.scolarite.mensuelFratrie;
    }
    const scolarite = mensuel * 12;

    // Frais de fonctionnement
    const fonctionnement = TARIFS.fonctionnement[classe] || TARIFS.fonctionnement.elementaire;

    const totalEnfant = fraisInscription + scolarite + fonctionnement;
    total += totalEnfant;

    details.push(
      `Enfant ${i + 1}: ${formatPrix(fraisInscription)} (inscription) + ${formatPrix(scolarite)} (scolarité${i > 0 ? " fratrie" : ""}) + ${formatPrix(fonctionnement)} (fonctionnement) = ${formatPrix(totalEnfant)}`
    );
  }

  return { total, details };
};
