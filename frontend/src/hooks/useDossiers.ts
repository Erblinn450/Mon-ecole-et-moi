"use client";

import { useState, useEffect, useCallback } from "react";
import { preinscriptionsApi, API_URL } from "@/lib/api";
import { Preinscription } from "@/types";

// Hook pour récupérer les dossiers du parent connecté
export function useDossiers() {
  const [dossiers, setDossiers] = useState<Preinscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setDossiers([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/preinscriptions/mes-dossiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDossiers(data);
      } else {
        setDossiers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setDossiers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

