"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Receipt,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { facturationApi } from "@/lib/api";
import { Facture, StatutFacture, TypeLigne } from "@/types";

const statutConfig: Record<StatutFacture, { label: string; bg: string; text: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700" },
  ENVOYEE: { label: "Envoyée", bg: "bg-blue-50", text: "text-blue-700" },
  PAYEE: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700" },
  PARTIELLE: { label: "Paiement partiel", bg: "bg-orange-50", text: "text-orange-700" },
  EN_RETARD: { label: "En retard", bg: "bg-rose-50", text: "text-rose-700" },
  ANNULEE: { label: "Annulée", bg: "bg-gray-50", text: "text-gray-500" },
};

const typeLigneLabels: Record<TypeLigne, string> = {
  SCOLARITE: "Scolarité",
  REPAS: "Repas",
  PERISCOLAIRE: "Périscolaire",
  DEPASSEMENT: "Dépassement",
  INSCRIPTION: "Inscription",
  MATERIEL: "Matériel",
  REDUCTION: "Réduction",
  PERSONNALISE: "Autre",
};

export default function MaFactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const factureId = Number(params.id);

  const [facture, setFacture] = useState<Facture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacture = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await facturationApi.getMaFacture(factureId);
      setFacture(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [factureId]);

  useEffect(() => {
    loadFacture();
  }, [loadFacture]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-rose-50 rounded-xl border border-rose-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={24} />
          <p className="text-rose-700">{error ?? "Facture non trouvée"}</p>
        </div>
      </div>
    );
  }

  const config = statutConfig[facture.statut];
  const resteAPayer = Number(facture.montantTotal) - Number(facture.montantPaye);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/mes-factures")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Facture {facture.numero}
          </h1>
          <p className="text-gray-500 mt-1">
            Période : {facture.periode ?? "-"} | Émise le{" "}
            {new Date(facture.dateEmission).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
          {facture.statut === "PAYEE" && <CheckCircle size={16} />}
          {facture.statut === "EN_ATTENTE" && <Clock size={16} />}
          {facture.statut === "EN_RETARD" && <AlertCircle size={16} />}
          {config.label}
        </span>
      </div>

      {/* Enfant */}
      {facture.enfant && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
          <p className="text-sm text-emerald-700">
            Facture pour <span className="font-semibold">{facture.enfant.prenom} {facture.enfant.nom}</span>
            {facture.enfant.classe && ` - ${facture.enfant.classe}`}
          </p>
        </div>
      )}

      {/* Montants */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{Number(facture.montantTotal).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payé</p>
            <p className="text-2xl font-bold text-emerald-600">{Number(facture.montantPaye).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reste à payer</p>
            <p className={`text-2xl font-bold ${resteAPayer > 0 ? "text-rose-600" : "text-gray-400"}`}>
              {resteAPayer.toFixed(2)} €
            </p>
          </div>
        </div>
      </div>

      {/* Échéance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Date d&apos;échéance</p>
            <p className="font-medium text-gray-900">
              {new Date(facture.dateEcheance).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {facture.modePaiement && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Mode de paiement</p>
              <p className="font-medium text-gray-900">
                {facture.modePaiement === "PRELEVEMENT" ? "Prélèvement SEPA" : "Virement"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Détail des lignes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Receipt size={18} className="text-emerald-600" />
            Détail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qté</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facture.lignes.map((ligne) => (
                <tr key={ligne.id}>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    <span className="font-medium">{ligne.description}</span>
                    {ligne.type && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({typeLigneLabels[ligne.type] ?? ligne.type})
                      </span>
                    )}
                    {ligne.commentaire && (
                      <span className="block text-xs text-gray-400 mt-0.5">{ligne.commentaire}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">{ligne.quantite}</td>
                  <td className="px-6 py-3 text-right text-sm text-gray-600">
                    {Number(ligne.prixUnit).toFixed(2)} €
                  </td>
                  <td className={`px-6 py-3 text-right text-sm font-medium ${Number(ligne.montant) < 0 ? "text-emerald-600" : "text-gray-900"}`}>
                    {Number(ligne.montant).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-semibold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {Number(facture.montantTotal).toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Paiements */}
      {facture.paiements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" />
              Paiements reçus
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {facture.paiements.map((paiement) => (
              <div key={paiement.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {paiement.modePaiement === "PRELEVEMENT" ? "Prélèvement" : "Virement"}
                    {paiement.reference && ` - ${paiement.reference}`}
                  </p>
                </div>
                <p className="font-medium text-emerald-600">
                  {Number(paiement.montant).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coordonnées école */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
        <p className="font-medium text-gray-700">Mon École Montessori et Moi</p>
        <p>58 rue Damberg, 68350 Brunstatt-Didenheim</p>
        <p>SIRET : 813 743 978 00021</p>
        <p>IBAN : FR76 3008 7332 2800 0204 5700 129</p>
      </div>
    </div>
  );
}
