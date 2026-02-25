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
  EN_RETARD: { label: "Impayé", bg: "bg-rose-50", text: "text-rose-700", icon: AlertCircle },
  ANNULEE: { label: "Annulée", bg: "bg-gray-50", text: "text-gray-500", icon: Receipt },
};

export default function MesFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtreEnfant, setFiltreEnfant] = useState<string>("tous");

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

      {/* Résumé */}
      {factures.length > 0 && (() => {
        const totalDu = factures
          .filter((f) => f.statut !== "ANNULEE" && f.statut !== "PAYEE")
          .reduce((sum, f) => sum + Number(f.montantTotal) - Number(f.montantPaye), 0);
        const nbEnRetard = factures.filter((f) => f.statut === "EN_RETARD").length;
        return totalDu > 0 ? (
          <div className={`rounded-2xl border p-4 flex items-center justify-between ${nbEnRetard > 0 ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
            <div>
              <p className={`text-sm font-medium ${nbEnRetard > 0 ? "text-rose-700" : "text-amber-700"}`}>
                Total restant à payer
                {nbEnRetard > 0 && ` (dont ${nbEnRetard} en retard)`}
              </p>
            </div>
            <p className={`text-xl font-bold ${nbEnRetard > 0 ? "text-rose-700" : "text-amber-700"}`}>
              {totalDu.toFixed(2)} €
            </p>
          </div>
        ) : null;
      })()}

      {/* Filtre enfant */}
      {(() => {
        const enfants = [...new Map(
          factures
            .filter((f) => f.enfant)
            .map((f) => [f.enfant!.id, `${f.enfant!.prenom} ${f.enfant!.nom}`])
        ).entries()];
        return enfants.length > 1 ? (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltreEnfant("tous")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtreEnfant === "tous" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Tous
            </button>
            {enfants.map(([id, nom]) => (
              <button
                key={id}
                onClick={() => setFiltreEnfant(String(id))}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtreEnfant === String(id) ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {nom}
              </button>
            ))}
          </div>
        ) : null;
      })()}

      {factures.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucune facture</h3>
          <p className="text-gray-400 mt-1">Vous n&apos;avez pas encore de facture</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...factures]
            .filter((f) => filtreEnfant === "tous" || String(f.enfant?.id) === filtreEnfant)
            .sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime())
            .map((facture) => {
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
