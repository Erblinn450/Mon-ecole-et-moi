"use client";

import { useState, useEffect, useCallback } from "react";
import { preinscriptionsApi } from "@/lib/api";
import { Preinscription, PreinscriptionStats, StatutPreinscription } from "@/types";

export function usePreinscriptions(statut?: StatutPreinscription) {
  const [preinscriptions, setPreinscriptions] = useState<Preinscription[]>([]);
  const [stats, setStats] = useState<PreinscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreinscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, statsData] = await Promise.all([
        preinscriptionsApi.getAll(statut),
        preinscriptionsApi.getStats(),
      ]);
      setPreinscriptions(data);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setPreinscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [statut]);

  useEffect(() => {
    fetchPreinscriptions();
  }, [fetchPreinscriptions]);

  const updateStatut = async (id: number, newStatut: StatutPreinscription, commentaire?: string) => {
    await preinscriptionsApi.updateStatut(id, newStatut, commentaire);
    await fetchPreinscriptions();
  };

  const deletePreinscription = async (id: number) => {
    await preinscriptionsApi.delete(id);
    await fetchPreinscriptions();
  };

  return {
    preinscriptions,
    stats,
    isLoading,
    error,
    refetch: fetchPreinscriptions,
    updateStatut,
    deletePreinscription,
  };
}

