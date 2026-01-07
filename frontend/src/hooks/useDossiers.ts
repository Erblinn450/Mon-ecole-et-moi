"use client";

import { useState, useEffect, useCallback } from "react";
import { preinscriptionsApi } from "@/lib/api";
import { Preinscription } from "@/types";

// Hook pour récupérer les dossiers d'un parent par email
export function useDossiers(email?: string) {
  const [dossiers, setDossiers] = useState<Preinscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = useCallback(async () => {
    if (!email) {
      setDossiers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Pour l'instant, on utilise une recherche par numéro de dossier
      // TODO: Ajouter un endpoint backend pour récupérer les dossiers par email parent
      setDossiers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setDossiers([]);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  const searchByNumeroDossier = async (numeroDossier: string): Promise<Preinscription | null> => {
    try {
      const dossier = await preinscriptionsApi.getByNumeroDossier(numeroDossier);
      return dossier;
    } catch {
      return null;
    }
  };

  return {
    dossiers,
    isLoading,
    error,
    refetch: fetchDossiers,
    searchByNumeroDossier,
  };
}

