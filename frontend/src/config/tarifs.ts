/**
 * Configuration des tarifs de l'école Montessori "Mon École et Moi"
 * Brunstatt-Didenheim
 * 
 * Source: https://mon-école-et-moi.com/tarifs
 */

export const TARIFS = {
  // Frais d'inscription
  inscription: {
    premiereAnnee: 320,      // € - Première année par élève
    anneesSuivantes: 165,    // € - Par élève et par an
  },

  // Frais de scolarité
  scolarite: {
    mensuel: 555,            // € - Par élève et par mois (sur 12 mois)
    annuel: 6660,            // € - Total annuel (555 × 12)
    reductionFratrie: 0.20,  // 20% de réduction à partir du 2e enfant
  },

  // Frais de fonctionnement annuels
  fonctionnement: {
    maternelle: 45,          // € - Par enfant et par an
    elementaire: 65,         // € - Par enfant et par an
  },

  // Restauration
  repas: {
    midi: 5.45,              // € - Par repas (traiteur)
  },

  // Périscolaire (garderie)
  periscolaire: {
    seance: 6.20,            // € - Par séance (16h00 - 17h30, goûter inclus)
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
    nom: "Maternelle",
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
};

// Formatter le prix
export const formatPrix = (prix: number, suffix: string = ""): string => {
  return `${prix.toFixed(2).replace(".", ",")} €${suffix}`;
};

// Calculer le tarif annuel avec réduction fratrie
export const calculerTarifAnnuel = (
  nombreEnfants: number,
  classe: "maternelle" | "elementaire",
  premiereAnnee: boolean = false
): { total: number; details: string[] } => {
  const details: string[] = [];
  let total = 0;

  for (let i = 0; i < nombreEnfants; i++) {
    // Frais d'inscription
    const fraisInscription = premiereAnnee 
      ? TARIFS.inscription.premiereAnnee 
      : TARIFS.inscription.anneesSuivantes;
    
    // Scolarité (avec réduction fratrie à partir du 2e enfant)
    const scolarite = i === 0 
      ? TARIFS.scolarite.annuel 
      : TARIFS.scolarite.annuel * (1 - TARIFS.scolarite.reductionFratrie);
    
    // Frais de fonctionnement
    const fonctionnement = classe === "maternelle" 
      ? TARIFS.fonctionnement.maternelle 
      : TARIFS.fonctionnement.elementaire;

    const totalEnfant = fraisInscription + scolarite + fonctionnement;
    total += totalEnfant;

    details.push(
      `Enfant ${i + 1}: ${formatPrix(fraisInscription)} (inscription) + ${formatPrix(scolarite)} (scolarité${i > 0 ? " -20%" : ""}) + ${formatPrix(fonctionnement)} (fonctionnement) = ${formatPrix(totalEnfant)}`
    );
  }

  return { total, details };
};
