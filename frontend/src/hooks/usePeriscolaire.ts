"use client";

import { useState, useEffect, useCallback } from "react";
import { periscolaireApi } from "@/lib/api";
import { Periscolaire } from "@/types";

export function usePeriscolaire(enfantId: number | null, mois?: string) {
  const [periscolaires, setPeriscolaires] = useState<Periscolaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriscolaires = useCallback(async () => {
    if (!enfantId) {
      setPeriscolaires([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await periscolaireApi.getByEnfant(enfantId, mois);
      setPeriscolaires(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setPeriscolaires([]);
    } finally {
      setIsLoading(false);
    }
  }, [enfantId, mois]);

  useEffect(() => {
    fetchPeriscolaires();
  }, [fetchPeriscolaires]);

  const commanderPeriscolaire = async (dates: string[]) => {
    if (!enfantId) throw new Error("Aucun enfant sélectionné");

    try {
      if (dates.length === 1) {
        await periscolaireApi.commander({ enfantId, date: dates[0] });
      } else {
        await periscolaireApi.commanderMultiple({ enfantId, dates });
      }
      await fetchPeriscolaires();
    } catch (err) {
      throw err;
    }
  };

  const annulerPeriscolaire = async (periscolaireId: number) => {
    try {
      await periscolaireApi.annuler(periscolaireId);
      await fetchPeriscolaires();
    } catch (err) {
      throw err;
    }
  };

  return {
    periscolaires,
    isLoading,
    error,
    refetch: fetchPeriscolaires,
    commanderPeriscolaire,
    annulerPeriscolaire,
  };
}

