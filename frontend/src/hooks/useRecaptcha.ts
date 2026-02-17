import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Hook pour utiliser Google reCAPTCHA v3
 * 
 * @param action - L'action à valider (ex: 'preinscription', 'login')
 * @returns { executeRecaptcha, isLoaded, error }
 */
export function useRecaptcha(action: string = 'submit') {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Mode développement: reCAPTCHA complètement désactivé
  const [isLoaded, setIsLoaded] = useState(!siteKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si pas de clé configurée, ne rien faire (mode développement)
    if (!siteKey) {
      return;
    }


    // Vérifier si le script est déjà chargé
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Charger le script reCAPTCHA
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsLoaded(true);
      });
    };

    script.onerror = () => {
      setError('Erreur de chargement reCAPTCHA');
      setIsLoaded(true); // Permettre de continuer sans reCAPTCHA
    };

    document.body.appendChild(script);

    return () => {};
  }, [siteKey]);

  /**
   * Exécute reCAPTCHA et retourne le token
   * @returns Promise<string | null> - Le token ou null si désactivé/erreur
   */
  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    // Si pas de clé configurée, retourner null (mode développement)
    if (!siteKey) {
      return null;
    }

    if (!window.grecaptcha) {
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch {
      setError('Erreur de validation reCAPTCHA');
      return null;
    }
  }, [siteKey, action]);

  return { executeRecaptcha, isLoaded, error };
}
