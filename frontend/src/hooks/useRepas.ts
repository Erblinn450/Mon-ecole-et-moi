"use client";

import { useState, useEffect, useCallback } from "react";
import { repasApi } from "@/lib/api";
import { Repas, TypeRepas } from "@/types";

export function useRepas(enfantId: number | null, mois?: string) {
  const [repas, setRepas] = useState<Repas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepas = useCallback(async () => {
    if (!enfantId) {
      setRepas([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await repasApi.getByEnfant(enfantId, mois);
      setRepas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setRepas([]);
    } finally {
      setIsLoading(false);
    }
  }, [enfantId, mois]);

  useEffect(() => {
    fetchRepas();
  }, [fetchRepas]);

  const commanderRepas = async (dates: string[], type: TypeRepas = TypeRepas.MIDI) => {
    if (!enfantId) throw new Error("Aucun enfant sélectionné");

    if (dates.length === 1) {
      await repasApi.commander({ enfantId, date: dates[0], type });
    } else {
      await repasApi.commanderMultiple({ enfantId, dates, type });
    }
    await fetchRepas();
  };

  const annulerRepas = async (repasId: number) => {
    await repasApi.annuler(repasId);
    await fetchRepas();
  };

  return {
    repas,
    isLoading,
    error,
    refetch: fetchRepas,
    commanderRepas,
    annulerRepas,
  };
}

