/**
 * Service d'authentification utilisant les sessions Laravel
 * Remplace progressivement l'utilisation de sessionStorage
 */

const PARENT_API_BASE = '/api/parent';
const AUTH_API_BASE = '/api/auth';

class ParentSessionService {
    /**
     * Récupère le profil du parent connecté
     */
    static async getProfile() {
        try {
            const response = await fetch(`${PARENT_API_BASE}/profile`, {
                method: 'GET',
                credentials: 'include', // Important pour les sessions
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getProfile:', error);
            throw error;
        }
    }

    /**
     * Récupère le tableau de bord du parent
     */
    static async getDashboard() {
        try {
            const response = await fetch(`${PARENT_API_BASE}/dashboard`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du tableau de bord');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getDashboard:', error);
            throw error;
        }
    }

    /**
     * Récupère la liste des enfants du parent
     */
    static async getEnfants() {
        try {
            const response = await fetch(`${PARENT_API_BASE}/enfants`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des enfants');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getEnfants:', error);
            throw error;
        }
    }

    /**
     * Récupère les détails d'un enfant spécifique
     */
    static async getEnfantDetail(enfantId) {
        try {
            const response = await fetch(`${PARENT_API_BASE}/enfants/${enfantId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Enfant non trouvé');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getEnfantDetail:', error);
            throw error;
        }
    }

    /**
     * Récupère la liste des factures du parent
     */
    static async getFactures() {
        try {
            const response = await fetch(`${PARENT_API_BASE}/factures`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des factures');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getFactures:', error);
            throw error;
        }
    }

    /**
     * Récupère la liste des commandes de repas du parent
     */
    static async getCommandesRepas() {
        try {
            const response = await fetch(`${PARENT_API_BASE}/commandes-repas`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des commandes');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getCommandesRepas:', error);
            throw error;
        }
    }

    /**
     * Récupère l'utilisateur connecté (via Sanctum)
     */
    static async getUser() {
        try {
            const response = await fetch(`${AUTH_API_BASE}/user`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Non authentifié');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur getUser:', error);
            throw error;
        }
    }

    /**
     * Vérifie si le parent est connecté (utilise les sessions)
     */
    static async isAuthenticated() {
        try {
            const user = await this.getUser();
            return !!user.user;
        } catch (error) {
            return false;
        }
    }

    /**
     * Déconnecte le parent
     */
    static async logout() {
        try {
            const response = await fetch(`${AUTH_API_BASE}/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la déconnexion');
            }

            // Nettoyer aussi le sessionStorage si nécessaire
            sessionStorage.clear();
            
            return await response.json();
        } catch (error) {
            console.error('Erreur logout:', error);
            throw error;
        }
    }

    /**
     * Récupère l'email du parent connecté (depuis la session)
     */
    static async getParentEmail() {
        try {
            const profile = await this.getProfile();
            return profile.user?.email;
        } catch (error) {
            return null;
        }
    }
}

// Export pour utilisation dans les autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParentSessionService;
}
