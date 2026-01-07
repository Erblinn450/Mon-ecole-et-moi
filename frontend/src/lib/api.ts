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
} from "@/types";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
  },

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
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
    const response = await fetch(`${API_BASE_URL}/preinscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Preinscription>(response);
  },

  // Public - Récupérer par numéro de dossier
  async getByNumeroDossier(numeroDossier: string): Promise<Preinscription> {
    const response = await fetch(`${API_BASE_URL}/preinscriptions/dossier/${numeroDossier}`);
    return handleResponse<Preinscription>(response);
  },

  // Admin - Liste toutes les préinscriptions
  async getAll(statut?: StatutPreinscription): Promise<Preinscription[]> {
    const url = new URL(`${API_BASE_URL}/preinscriptions`);
    if (statut) url.searchParams.append("statut", statut);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Preinscription[]>(response);
  },

  // Admin - Statistiques
  async getStats(): Promise<PreinscriptionStats> {
    const response = await fetch(`${API_BASE_URL}/preinscriptions/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PreinscriptionStats>(response);
  },

  // Admin - Récupérer une préinscription par ID
  async getById(id: number): Promise<Preinscription> {
    const response = await fetch(`${API_BASE_URL}/preinscriptions/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/preinscriptions/${id}/statut`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut, commentaire }),
    });
    return handleResponse<Preinscription>(response);
  },

  // Admin - Supprimer
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/preinscriptions/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/enfants/mes-enfants`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Tous les enfants
  async getAll(classe?: Classe): Promise<Enfant[]> {
    const url = new URL(`${API_BASE_URL}/enfants`);
    if (classe) url.searchParams.append("classe", classe);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Statistiques
  async getStats(): Promise<EnfantStats> {
    const response = await fetch(`${API_BASE_URL}/enfants/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<EnfantStats>(response);
  },

  // Admin - Par classe
  async getByClasse(classe: Classe): Promise<Enfant[]> {
    const response = await fetch(`${API_BASE_URL}/enfants/classe/${classe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Récupérer un enfant par ID
  async getById(id: number): Promise<Enfant> {
    const response = await fetch(`${API_BASE_URL}/enfants/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Créer
  async create(data: Partial<Enfant>): Promise<Enfant> {
    const response = await fetch(`${API_BASE_URL}/enfants`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Modifier
  async update(id: number, data: Partial<Enfant>): Promise<Enfant> {
    const response = await fetch(`${API_BASE_URL}/enfants/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Enfant>(response);
  },

  // Admin - Supprimer
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/enfants/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/repas/commander`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Repas>(response);
  },

  // Commander plusieurs repas
  async commanderMultiple(data: CommanderRepasMultipleRequest): Promise<Repas[]> {
    const response = await fetch(`${API_BASE_URL}/repas/commander-multiple`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Repas[]>(response);
  },

  // Annuler un repas
  async annuler(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/repas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'annulation");
    }
  },

  // Repas d'un enfant
  async getByEnfant(enfantId: number, mois?: string): Promise<Repas[]> {
    const url = new URL(`${API_BASE_URL}/repas/enfant/${enfantId}`);
    if (mois) url.searchParams.append("mois", mois);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Repas[]>(response);
  },

  // Admin - Repas par date
  async getByDate(date: string): Promise<Repas[]> {
    const response = await fetch(`${API_BASE_URL}/repas/date/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Repas[]>(response);
  },

  // Admin - Enfants non inscrits pour une date
  async getEnfantsNonInscrits(date: string): Promise<Enfant[]> {
    const response = await fetch(`${API_BASE_URL}/repas/non-inscrits/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Enfant[]>(response);
  },

  // Admin - Statistiques
  async getStats(mois: string): Promise<RepasStats> {
    const response = await fetch(`${API_BASE_URL}/repas/stats?mois=${mois}`, {
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
    const response = await fetch(`${API_BASE_URL}/periscolaire/commander`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Periscolaire>(response);
  },

  // Commander plusieurs dates
  async commanderMultiple(data: { enfantId: number; dates: string[] }): Promise<Periscolaire[]> {
    const response = await fetch(`${API_BASE_URL}/periscolaire/commander-multiple`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Periscolaire[]>(response);
  },

  // Annuler
  async annuler(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/periscolaire/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'annulation");
    }
  },

  // Par enfant
  async getByEnfant(enfantId: number, mois?: string): Promise<Periscolaire[]> {
    const url = new URL(`${API_BASE_URL}/periscolaire/enfant/${enfantId}`);
    if (mois) url.searchParams.append("mois", mois);
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<Periscolaire[]>(response);
  },

  // Admin - Par date
  async getByDate(date: string): Promise<Periscolaire[]> {
    const response = await fetch(`${API_BASE_URL}/periscolaire/date/${date}`, {
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
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(response);
  },

  // Récupérer un utilisateur
  async getById(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  // Mettre à jour
  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  // Réinitialiser mot de passe
  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ temporaryPassword: string }>(response);
  },

  // Activer/Désactiver
  async toggleActive(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-active`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },
};

