"use client";

import { useState, useEffect, useCallback } from "react";
import { enfantsApi } from "@/lib/api";
import { Enfant, Classe } from "@/types";

export function useEnfants() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnfants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enfantsApi.getMesEnfants();
      setEnfants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setEnfants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnfants();
  }, [fetchEnfants]);

  return {
    enfants,
    isLoading,
    error,
    refetch: fetchEnfants,
  };
}

export function useAdminEnfants(classe?: Classe) {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnfants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enfantsApi.getAll(classe);
      setEnfants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      setEnfants([]);
    } finally {
      setIsLoading(false);
    }
  }, [classe]);

  useEffect(() => {
    fetchEnfants();
  }, [fetchEnfants]);

  const updateEnfant = async (id: number, data: Partial<Enfant>) => {
    await enfantsApi.update(id, data);
    await fetchEnfants();
  };

  const deleteEnfant = async (id: number) => {
    await enfantsApi.delete(id);
    await fetchEnfants();
  };

  return {
    enfants,
    isLoading,
    error,
    refetch: fetchEnfants,
    updateEnfant,
    deleteEnfant,
  };
}

