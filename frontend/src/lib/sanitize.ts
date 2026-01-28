import DOMPurify from 'dompurify';

/**
 * Nettoie les entrées utilisateur pour prévenir les attaques XSS
 * @param dirty - Le texte potentiellement dangereux
 * @returns Le texte nettoyé et sécurisé
 */
export function sanitize(dirty: string): string {
    // En environnement serveur (SSR), on retourne directement
    if (typeof window === 'undefined') {
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [], // Pas de HTML, seulement du texte
        KEEP_CONTENT: true, // Garde le contenu texte
    });
}

/**
 * Nettoie du HTML en autorisant certaines balises sûres
 * @param dirty - Le HTML potentiellement dangereux
 * @returns Le HTML nettoyé
 */
export function sanitizeHTML(dirty: string): string {
    if (typeof window === 'undefined') {
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target'],
    });
}
