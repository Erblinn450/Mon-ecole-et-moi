/**
 * Service pour gérer les signatures du réglement
 */
class SignatureService {
    /**
     * Obtenir le statut de signature pour un enfant ou une préinscription
     * Accepte soit un ID d'enfant soit un ID de préinscription
     */
    static async getSignatureStatus(enfantIdOrPreinscriptionId, token) {
        try {
            const response = await fetch(`/api/signatures/enfant/${enfantIdOrPreinscriptionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn(`Statut 404 ou erreur pour ID ${enfantIdOrPreinscriptionId}, retourner valeurs par défaut`);
                // Retourner des valeurs par défaut si pas trouvé (normal pour une préinscription)
                return {
                    signed: false,
                    reglement_accepte: false,
                    parent_accepte: false,
                    enfant_accepte: false
                };
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur getSignatureStatus:', error);
            return {
                signed: false,
                reglement_accepte: false,
                parent_accepte: false,
                enfant_accepte: false
            };
        }
    }

    /**
     * Enregistrer l'acceptation du parent
     * Accepte enfant_id OU preinscription_id
     */
    static async parentAccepte(enfantIdOrPreinscriptionId, token, notes = '') {
        try {
            const response = await fetch('/api/signatures/parent-accepte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    enfant_id: null,
                    preinscription_id: enfantIdOrPreinscriptionId,
                    notes: notes
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur signature parent');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur parentAccepte:', error);
            throw error;
        }
    }

    /**
     * Enregistrer l'acceptation de l'enfant
     * Accepte enfant_id OU preinscription_id
     */
    static async enfantAccepte(enfantIdOrPreinscriptionId, token, notes = '') {
        try {
            const response = await fetch('/api/signatures/enfant-accepte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    enfant_id: null,
                    preinscription_id: enfantIdOrPreinscriptionId,
                    notes: notes
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur signature enfant');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur enfantAccepte:', error);
            throw error;
        }
    }

    /**
     * Récupérer toutes les signatures du parent
     */
    static async mesSignatures(token) {
        try {
            const response = await fetch('/api/signatures/mes-signatures', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur chargement signatures');
            return await response.json();
        } catch (error) {
            console.error('Erreur mesSignatures:', error);
            return { count: 0, signatures: [] };
        }
    }
}

/**
 * Service pour tracker l'ouverture des PDFs
 */
class PdfService {
    /**
     * Enregistrer l'ouverture du reglement
     */
    static async reglementOuvert(enfantId, token) {
        try {
            const payload = {
                enfant_id: parseInt(enfantId),
                document_type: 'reglement-interieur'
            };
            
            console.log('📤 Envoi du tracking PDF:', payload);
            
            const response = await fetch('/api/documents/reglement-ouvert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            console.log('📥 Réponse du serveur:', responseData, 'Status:', response.status);

            if (!response.ok) {
                console.error('❌ Erreur HTTP:', response.status, responseData);
                throw new Error(responseData.message || 'Erreur lors de l\'enregistrement');
            }

            console.log('✅ PDF tracking enregistré avec succès');
            return responseData;
        } catch (error) {
            console.error('❌ Erreur reglementOuvert:', error.message);
            throw error;
        }
    }

    /**
     * Verifier si le reglement a ete ouvert
     */
    static async reglementOuvertStatus(enfantId, token) {
        try {
            console.log('📥 Vérification du statut d\'ouverture pour enfant:', enfantId);
            
            const response = await fetch(`/api/documents/reglement-ouvert/${enfantId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json'
                }
            });

            const responseData = await response.json();
            console.log('📥 Réponse du statut:', responseData, 'Status:', response.status);

            if (!response.ok) {
                console.error('❌ Erreur HTTP lors de la vérification:', response.status, responseData);
                return { opened: false };
            }

            return responseData;
        } catch (error) {
            console.error('❌ Erreur reglementOuvertStatus:', error.message);
            return { opened: false };
        }
    }
}
