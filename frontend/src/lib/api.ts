import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  CreatePreinscriptionRequest,
  Preinscription,
  PreinscriptionStats,
  StatutPreinscription,
  Enfant,
  EnfantStats,
  Repas,
  CommanderRepasRequest,
  CommanderRepasMultipleRequest,
  RepasStats,
  Periscolaire,
  Classe,
  ApiError,
  Facture,
  FactureStats,
  BatchResult,
  StatutFacture,
  ModePaiement,
  TypeLigne,
} from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: "Une erreur est survenue",
      statusCode: response.status,
    }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
  },

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },
};

// ============================================
// PREINSCRIPTIONS API
// ============================================

export const preinscriptionsApi = {
  // Public - Créer une préinscription
  async create(data: CreatePreinscriptionRequest): Promise<Preinscription> {
    const response = await fetch(`${API_URL}/preinscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Preinscription>(response);
  },

  // Public - Récupérer par numéro de dossier
  async getByNumeroDossier(numeroDossier: string): Promise<Preinscription> {
    const response = await fetch(`${API_URL}/preinscriptions/dossier/${numeroDossier}`);
    return handleResponse<Preinscription>(response);
  },

  // Admin - Liste toutes les préinscriptions
  async getAll(statut?: StatutPreinscription): Promise<Preinscription[]> {
    const url = new URL(`${API_URL}/preinscriptions`);
    if (statut) url.searchParams.append("statut", statut);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Preinscription[]>(response);
  },

  // Admin - Statistiques
  async getStats(): Promise<PreinscriptionStats> {
    const response = await fetch(`${API_URL}/preinscriptions/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PreinscriptionStats>(response);
  },

  // Admin - Récupérer une préinscription par ID
  async getById(id: number): Promise<Preinscription> {
    const response = await fetch(`${API_URL}/preinscriptions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Preinscription>(response);
  },

  // Admin - Modifier le statut
  async updateStatut(
    id: number,
    statut: StatutPreinscription,
    commentaire?: string
  ): Promise<Preinscription> {
    const response = await fetch(`${API_URL}/preinscriptions/${id}/statut`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut, commentaire }),
    });
    return handleResponse<Preinscription>(response);
  },

  // Admin - Supprimer
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/preinscriptions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }
  },
};

// ============================================
// ENFANTS API
// ============================================

export const enfantsApi = {
  // Parent - Mes enfants
  async getMesEnfants(): Promise<Enfant[]> {
    const response = await fetch(`${API_URL}/enfants/mes-enfants`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Tous les enfants
  async getAll(classe?: Classe): Promise<Enfant[]> {
    const url = new URL(`${API_URL}/enfants`);
    if (classe) url.searchParams.append("classe", classe);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Statistiques
  async getStats(): Promise<EnfantStats> {
    const response = await fetch(`${API_URL}/enfants/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<EnfantStats>(response);
  },

  // Admin - Par classe
  async getByClasse(classe: Classe): Promise<Enfant[]> {
    const response = await fetch(`${API_URL}/enfants/classe/${classe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Récupérer un enfant par ID
  async getById(id: number): Promise<Enfant> {
    const response = await fetch(`${API_URL}/enfants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Créer
  async create(data: Partial<Enfant>): Promise<Enfant> {
    const response = await fetch(`${API_URL}/enfants`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Modifier
  async update(id: number, data: Partial<Enfant>): Promise<Enfant> {
    const response = await fetch(`${API_URL}/enfants/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Supprimer
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/enfants/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }
  },
};

// ============================================
// REPAS API
// ============================================

export const repasApi = {
  // Commander un repas
  async commander(data: CommanderRepasRequest): Promise<Repas> {
    const response = await fetch(`${API_URL}/repas/commander`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Repas>(response);
  },

  // Commander plusieurs repas
  async commanderMultiple(data: CommanderRepasMultipleRequest): Promise<Repas[]> {
    const response = await fetch(`${API_URL}/repas/commander-multiple`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Repas[]>(response);
  },

  // Annuler un repas
  async annuler(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/repas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'annulation");
    }
  },

  // Repas d'un enfant
  async getByEnfant(enfantId: number, mois?: string): Promise<Repas[]> {
    const url = new URL(`${API_URL}/repas/enfant/${enfantId}`);
    if (mois) url.searchParams.append("mois", mois);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Repas[]>(response);
  },

  // Admin - Repas par date
  async getByDate(date: string): Promise<Repas[]> {
    const response = await fetch(`${API_URL}/repas/date/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Repas[]>(response);
  },

  // Admin - Enfants non inscrits pour une date
  async getEnfantsNonInscrits(date: string): Promise<Enfant[]> {
    const response = await fetch(`${API_URL}/repas/non-inscrits/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Statistiques
  async getStats(mois: string): Promise<RepasStats> {
    const response = await fetch(`${API_URL}/repas/stats?mois=${mois}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RepasStats>(response);
  },
};

// ============================================
// PERISCOLAIRE API
// ============================================

export const periscolaireApi = {
  // Commander
  async commander(data: { enfantId: number; date: string }): Promise<Periscolaire> {
    const response = await fetch(`${API_URL}/periscolaire/commander`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Periscolaire>(response);
  },

  // Commander plusieurs dates
  async commanderMultiple(data: { enfantId: number; dates: string[] }): Promise<Periscolaire[]> {
    const response = await fetch(`${API_URL}/periscolaire/commander-multiple`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Periscolaire[]>(response);
  },

  // Annuler
  async annuler(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/periscolaire/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'annulation");
    }
  },

  // Par enfant
  async getByEnfant(enfantId: number, mois?: string): Promise<Periscolaire[]> {
    const url = new URL(`${API_URL}/periscolaire/enfant/${enfantId}`);
    if (mois) url.searchParams.append("mois", mois);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Periscolaire[]>(response);
  },

  // Admin - Par date
  async getByDate(date: string): Promise<Periscolaire[]> {
    const response = await fetch(`${API_URL}/periscolaire/date/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Periscolaire[]>(response);
  },
};

// ============================================
// USERS API (Admin)
// ============================================

export const usersApi = {
  // Liste tous les utilisateurs
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(response);
  },

  // Récupérer un utilisateur
  async getById(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  // Mettre à jour
  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  // Réinitialiser mot de passe
  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await fetch(`${API_URL}/users/${id}/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ temporaryPassword: string }>(response);
  },

  // Activer/Désactiver
  async toggleActive(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}/toggle-active`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },
};

// ============================================
// PERSONNES AUTORISEES API
// ============================================

export interface PersonneAutorisee {
  id: number;
  enfantId: number;
  nom: string;
  prenom: string;
  telephone: string;
  lienParente: string;
  createdAt: string;
}

export interface ParentInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
}

export interface EnfantPersonnesAutorisees {
  enfantId: number;
  enfantNom: string;
  enfantPrenom: string;
  classe: string | null;
  parent1: ParentInfo | null;
  parent2: ParentInfo | null;
  personnesAutorisees: PersonneAutorisee[];
}

export const personnesAutoriseesApi = {
  // Parent - Mes personnes autorisées
  async getAll(): Promise<{ enfantId: number; enfantNom: string; personnesAutorisees: PersonneAutorisee[] }[]> {
    const response = await fetch(`${API_URL}/personnes-autorisees`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Parent - Par enfant
  async getByEnfant(enfantId: number): Promise<PersonneAutorisee[]> {
    const response = await fetch(`${API_URL}/personnes-autorisees/enfant/${enfantId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Parent - Créer
  async create(data: { enfantId: number; nom: string; prenom: string; telephone: string; lienParente: string }): Promise<PersonneAutorisee> {
    const response = await fetch(`${API_URL}/personnes-autorisees`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Parent - Modifier
  async update(id: number, data: Partial<{ nom: string; prenom: string; telephone: string; lienParente: string }>): Promise<PersonneAutorisee> {
    const response = await fetch(`${API_URL}/personnes-autorisees/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Parent - Supprimer
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/personnes-autorisees/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }
  },

  // Admin - Toutes les personnes autorisées
  async getAllAdmin(): Promise<EnfantPersonnesAutorisees[]> {
    const response = await fetch(`${API_URL}/personnes-autorisees/admin/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// REINSCRIPTIONS API
// ============================================

export interface EnfantReinscription {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  classe: string | null;
  inscriptionActive: boolean;
  reinscriptionStatut: string | null;
  reinscriptionId: number | null;
}

export interface ReinscriptionData {
  anneeScolaire: string;
  enfants: EnfantReinscription[];
}

export interface CreateReinscriptionRequest {
  enfantId: number;
  classeSouhaitee?: string;
}

export const reinscriptionsApi = {
  // Récupère les enfants éligibles à la réinscription
  async getMesEnfants(): Promise<ReinscriptionData> {
    const response = await fetch(`${API_URL}/reinscriptions/mes-enfants`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ReinscriptionData>(response);
  },

  // Crée une demande de réinscription
  async create(data: CreateReinscriptionRequest): Promise<unknown> {
    const response = await fetch(`${API_URL}/reinscriptions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<unknown>(response);
  },

  // Crée plusieurs réinscriptions en une fois
  async createBulk(reinscriptions: CreateReinscriptionRequest[]): Promise<unknown> {
    const response = await fetch(`${API_URL}/reinscriptions/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reinscriptions }),
    });
    return handleResponse<unknown>(response);
  },

  // Récupère les réinscriptions du parent
  async getMesReinscriptions(): Promise<unknown[]> {
    const response = await fetch(`${API_URL}/reinscriptions/mes-reinscriptions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<unknown[]>(response);
  },
};

// ============================================
// FACTURATION API
// ============================================

export const facturationApi = {
  // Parent - Mes factures
  async getMesFactures(): Promise<Facture[]> {
    const response = await fetch(`${API_URL}/facturation/mes-factures`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture[]>(response);
  },

  // Parent - Détail facture
  async getMaFacture(id: number): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/mes-factures/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Toutes les factures
  async getAll(mois?: string): Promise<Facture[]> {
    const url = new URL(`${API_URL}/facturation`);
    if (mois) url.searchParams.append("mois", mois);
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture[]>(response);
  },

  // Admin - Détail facture
  async getById(id: number): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Stats
  async getStats(): Promise<FactureStats> {
    const response = await fetch(`${API_URL}/facturation/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<FactureStats>(response);
  },

  // Admin - Générer une facture individuelle
  async generer(data: {
    parentId: number;
    periode: string;
    anneeScolaire: string;
    inclureScolarite?: boolean;
    inclureRepas?: boolean;
    inclurePeriscolaire?: boolean;
    inclureInscription?: boolean;
    inclureFonctionnement?: boolean;
  }): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/generer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Générer batch
  async genererBatch(data: {
    periode: string;
    anneeScolaire: string;
    inclureScolarite?: boolean;
    inclureRepas?: boolean;
    inclurePeriscolaire?: boolean;
    inclureInscription?: boolean;
    inclureFonctionnement?: boolean;
  }): Promise<BatchResult> {
    const response = await fetch(`${API_URL}/facturation/generer-batch`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<BatchResult>(response);
  },

  // Admin - Prévisualiser
  async previsualiser(data: {
    parentId: number;
    periode: string;
    anneeScolaire: string;
  }): Promise<unknown> {
    const response = await fetch(`${API_URL}/facturation/previsualiser`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<unknown>(response);
  },

  // Admin - Modifier statut
  async updateStatut(id: number, statut: StatutFacture, commentaire?: string): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${id}/statut`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut, commentaire }),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Enregistrer paiement
  async enregistrerPaiement(factureId: number, data: {
    montant: number;
    datePaiement: string;
    modePaiement: ModePaiement;
    reference?: string;
    commentaire?: string;
  }): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/paiement`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Ajouter ligne
  async ajouterLigne(factureId: number, data: {
    description: string;
    quantite: number;
    prixUnit: number;
    type: TypeLigne;
    commentaire?: string;
  }): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/lignes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Modifier ligne
  async modifierLigne(factureId: number, ligneId: number, data: {
    description?: string;
    quantite?: number;
    prixUnit?: number;
    commentaire?: string;
  }): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/lignes/${ligneId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Supprimer ligne
  async supprimerLigne(factureId: number, ligneId: number): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/lignes/${ligneId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Télécharger ZIP de toutes les factures du mois
  async downloadZip(mois: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/facturation/export-pdf-zip?mois=${mois}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement du ZIP");
    }
    return response.blob();
  },

  // Admin - Télécharger PDF
  async downloadPdf(factureId: number): Promise<Blob> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/pdf`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement du PDF");
    }
    return response.blob();
  },

  // Parent - Télécharger PDF
  async downloadMaPdf(factureId: number): Promise<Blob> {
    const response = await fetch(`${API_URL}/facturation/mes-factures/${factureId}/pdf`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement du PDF");
    }
    return response.blob();
  },

  // Admin - Envoyer batch (emails)
  async envoyerBatch(mois?: string): Promise<{ envoyees: number; erreurs: string[] }> {
    const response = await fetch(`${API_URL}/facturation/envoyer-batch`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ mois }),
    });
    return handleResponse<{ envoyees: number; erreurs: string[] }>(response);
  },

  // Admin - Créer un avoir
  async creerAvoir(factureId: number): Promise<Facture> {
    const response = await fetch(`${API_URL}/facturation/${factureId}/avoir`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<Facture>(response);
  },

  // Admin - Modifier IBAN parent
  async updateParentSepa(parentId: number, data: { ibanParent?: string; mandatSepaRef?: string }): Promise<unknown> {
    const response = await fetch(`${API_URL}/users/${parentId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<unknown>(response);
  },
};

