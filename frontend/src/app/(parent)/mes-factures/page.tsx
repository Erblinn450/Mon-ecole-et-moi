"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Receipt,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { facturationApi } from "@/lib/api";
import { Facture, StatutFacture } from "@/types";

const statutConfig: Record<StatutFacture, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  ENVOYEE: { label: "Envoyée", bg: "bg-blue-50", text: "text-blue-700", icon: Receipt },
  PAYEE: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  PARTIELLE: { label: "Paiement partiel", bg: "bg-orange-50", text: "text-orange-700", icon: Clock },
  EN_RETARD: { label: "En retard", bg: "bg-rose-50", text: "text-rose-700", icon: AlertCircle },
  ANNULEE: { label: "Annulée", bg: "bg-gray-50", text: "text-gray-500", icon: Receipt },
};

export default function MesFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFactures = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await facturationApi.getMesFactures();
      setFactures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFactures();
  }, [loadFactures]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-rose-50 rounded-xl border border-rose-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={24} />
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
        <p className="text-gray-500 mt-1">Consultez vos factures et suivez vos paiements</p>
      </div>

      {factures.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucune facture</h3>
          <p className="text-gray-400 mt-1">Vous n&apos;avez pas encore de facture</p>
        </div>
      ) : (
        <div className="space-y-3">
          {factures.map((facture) => {
            const config = statutConfig[facture.statut];
            const Icon = config.icon;
            return (
              <Link
                key={facture.id}
                href={`/mes-factures/${facture.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${config.bg}`}>
                      <Icon size={20} className={config.text} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{facture.numero}</p>
                      <p className="text-sm text-gray-500">
                        {facture.periode ?? "-"} |{" "}
                        {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
                      </p>
                      {facture.enfant && (
                        <p className="text-sm text-gray-400">
                          {facture.enfant.prenom} {facture.enfant.nom}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{Number(facture.montantTotal).toFixed(2)} €</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                    <ArrowRight size={18} className="text-gray-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
