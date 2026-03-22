"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Search,
  Plus,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  TrendingUp,
  ArrowRight,
  Download,
  Send,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { facturationApi } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Facture, FactureStats, StatutFacture } from "@/types";

const statutConfig: Record<StatutFacture, { label: string; bg: string; text: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700" },
  ENVOYEE: { label: "Envoyée", bg: "bg-blue-50", text: "text-blue-700" },
  PAYEE: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700" },
  PARTIELLE: { label: "Partielle", bg: "bg-orange-50", text: "text-orange-700" },
  EN_RETARD: { label: "Impayé", bg: "bg-rose-50", text: "text-rose-700" },
  ANNULEE: { label: "Annulée", bg: "bg-gray-50", text: "text-gray-500" },
};

function getAnneeScolaire(): string {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 8
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`;
}

function getCurrentPeriode(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function FacturationPage() {
  const router = useRouter();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [stats, setStats] = useState<FactureStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("TOUS");
  const [filterMois, setFilterMois] = useState<string>("");
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [isEnvoiLoading, setIsEnvoiLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string; message: string; variant: "danger" | "warning" | "default"; onConfirm: () => void;
  } | null>(null);

  // SEPA state
  const [sepaPreview, setSepaPreview] = useState<{
    nbTransactions: number;
    totalMontant: number;
    transactions: { factureId: number; numero: string; montant: number; parent: string; rum: string }[];
  } | null>(null);
  const [sepaLoading, setSepaLoading] = useState(false);
  const [sepaFactureIds, setSepaFactureIds] = useState<number[]>([]);
  const [sepaMessage, setSepaMessage] = useState<string | null>(null);
  const [sepaStep, setSepaStep] = useState<"idle" | "preview" | "downloaded">("idle");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [facturesData, statsData] = await Promise.all([
        facturationApi.getAll(filterMois || undefined),
        facturationApi.getStats(),
      ]);
      setFactures(facturesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [filterMois]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenererBatch = async () => {
    const periode = getCurrentPeriode();
    const anneeScolaire = getAnneeScolaire();

    if (!confirm(`Générer les factures pour la période ${periode} (${anneeScolaire}) ?`)) {
      return;
    }

    setIsBatchLoading(true);
    setBatchMessage(null);
    try {
      const result = await facturationApi.genererBatch({
        periode,
        anneeScolaire,
        inclureScolarite: true,
        inclureRepas: true,
        inclurePeriscolaire: true,
      });
      setBatchMessage(
        `${result.facturesCreees} facture(s) créée(s) pour un total de ${result.totalFacture.toFixed(2)} €` +
        (result.erreurs > 0 ? ` (${result.erreurs} erreur(s))` : "")
      );
      await loadData();
    } catch (err) {
      setBatchMessage(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setIsBatchLoading(false);
    }
  };

  const nbEnAttente = factures.filter((f) => f.statut === StatutFacture.EN_ATTENTE).length;

  const handleEnvoyerBatch = async () => {
    setIsEnvoiLoading(true);
    setBatchMessage(null);
    try {
      const result = await facturationApi.envoyerBatch(filterMois || undefined);
      setBatchMessage(
        `${result.envoyees} facture(s) envoyée(s) par email` +
        (result.erreurs.length > 0 ? ` (${result.erreurs.length} erreur(s))` : "")
      );
      await loadData();
    } catch (err) {
      setBatchMessage(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setIsEnvoiLoading(false);
    }
  };

  // SEPA handlers
  const handleSepaPreview = async () => {
    const mois = filterMois || getCurrentPeriode();
    setSepaLoading(true);
    setSepaMessage(null);
    try {
      const preview = await facturationApi.previsualiserSepa(mois, true);
      setSepaPreview(preview);
      setSepaFactureIds(preview.transactions.map((t) => t.factureId));
      setSepaStep("preview");
    } catch (err) {
      setSepaMessage(err instanceof Error ? err.message : "Erreur lors de la prévisualisation SEPA");
    } finally {
      setSepaLoading(false);
    }
  };

  const handleSepaGenerate = async () => {
    const mois = filterMois || getCurrentPeriode();
    setSepaLoading(true);
    try {
      const blob = await facturationApi.genererSepaXml(mois, true);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sepa-${mois}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSepaStep("downloaded");
      setSepaMessage("Fichier SEPA téléchargé. Vous pouvez maintenant marquer les factures comme payées.");
    } catch (err) {
      setSepaMessage(err instanceof Error ? err.message : "Erreur lors de la génération SEPA");
    } finally {
      setSepaLoading(false);
    }
  };

  const handleSepaMarquerPayees = async () => {
    if (sepaFactureIds.length === 0) return;
    setSepaLoading(true);
    try {
      const result = await facturationApi.marquerFacturesPayeesSepa(sepaFactureIds);
      setSepaMessage(
        `${result.payees} facture(s) marquée(s) comme payées (${result.totalMontant.toFixed(2)} €)` +
        (result.erreurs.length > 0 ? ` — ${result.erreurs.join(", ")}` : "")
      );
      setSepaStep("idle");
      setSepaPreview(null);
      setSepaFactureIds([]);
      await loadData();
    } catch (err) {
      setSepaMessage(err instanceof Error ? err.message : "Erreur lors du marquage");
    } finally {
      setSepaLoading(false);
    }
  };

  const filteredFactures = factures.filter((f) => {
    if (filterStatut !== "TOUS" && f.statut !== filterStatut) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const parentNom = `${f.parent?.prenom ?? ""} ${f.parent?.nom ?? ""}`.toLowerCase();
      const enfantNom = `${f.enfant?.prenom ?? ""} ${f.enfant?.nom ?? ""}`.toLowerCase();
      return (
        parentNom.includes(query) ||
        enfantNom.includes(query) ||
        f.numero.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
          <p className="text-gray-500 mt-1">Gestion des factures et paiements</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/facturation/tarifs"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} />
            Tarifs
          </Link>
          {filterMois && (
            <button
              onClick={async () => {
                try {
                  const blob = await facturationApi.downloadZip(filterMois);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `factures-${filterMois}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch {
                  alert("Erreur lors du téléchargement");
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Télécharger tout
            </button>
          )}
          {nbEnAttente > 0 && (
            <button
              onClick={() => setConfirmModal({
                title: "Envoyer les factures ?",
                message: `${nbEnAttente} facture(s) en attente seront envoyées par email aux parents.`,
                variant: "warning",
                onConfirm: () => { setConfirmModal(null); handleEnvoyerBatch(); },
              })}
              disabled={isEnvoiLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isEnvoiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Envoyer les factures ({nbEnAttente})
            </button>
          )}
          <button
            onClick={handleGenererBatch}
            disabled={isBatchLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isBatchLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Générer les factures du mois
          </button>
        </div>
      </div>

      {/* Batch message */}
      {batchMessage && (
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-700">
          {batchMessage}
        </div>
      )}

      {/* SEPA Prélèvement */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prélèvement SEPA</h2>

        {sepaMessage && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-700 text-sm">
            {sepaMessage}
          </div>
        )}

        {sepaStep === "idle" && (
          <button
            onClick={handleSepaPreview}
            disabled={sepaLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {sepaLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Prévisualiser le prélèvement SEPA
          </button>
        )}

        {sepaStep === "preview" && sepaPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-sm text-violet-600 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-violet-900">{sepaPreview.nbTransactions}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-sm text-violet-600 font-medium">Montant total</p>
                <p className="text-2xl font-bold text-violet-900">{sepaPreview.totalMontant.toFixed(2)} €</p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Facture</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Parent</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sepaPreview.transactions.map((t) => (
                    <tr key={t.factureId}>
                      <td className="px-4 py-2 font-mono">{t.numero}</td>
                      <td className="px-4 py-2 text-gray-700">{t.parent}</td>
                      <td className="px-4 py-2 text-right font-semibold">{t.montant.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSepaStep("idle"); setSepaPreview(null); setSepaMessage(null); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setConfirmModal({
                  title: "Générer le fichier SEPA ?",
                  message: `${sepaPreview.nbTransactions} prélèvement(s) pour un total de ${sepaPreview.totalMontant.toFixed(2)} €. Le fichier XML sera téléchargé et les factures seront marquées comme envoyées.`,
                  variant: "warning",
                  onConfirm: () => { setConfirmModal(null); handleSepaGenerate(); },
                })}
                disabled={sepaLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {sepaLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Générer et télécharger le fichier SEPA
              </button>
            </div>
          </div>
        )}

        {sepaStep === "downloaded" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Le fichier SEPA a été téléchargé. Après avoir transmis le fichier à votre banque,
              cliquez ci-dessous pour enregistrer automatiquement les paiements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSepaStep("idle"); setSepaPreview(null); setSepaFactureIds([]); setSepaMessage(null); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setConfirmModal({
                  title: "Confirmer les paiements SEPA ?",
                  message: `${sepaFactureIds.length} facture(s) seront marquées comme payées par prélèvement SEPA. Cette action enregistre automatiquement les paiements.`,
                  variant: "warning",
                  onConfirm: () => { setConfirmModal(null); handleSepaMarquerPayees(); },
                })}
                disabled={sepaLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {sepaLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Confirmer les paiements ({sepaFactureIds.length} factures)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setFilterStatut("TOUS")}
            className={`bg-indigo-50 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filterStatut === "TOUS" ? "border-indigo-400 ring-2 ring-indigo-200" : "border-indigo-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={18} className="text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Total</span>
            </div>
            <p className="text-2xl font-bold text-indigo-900">{stats.totalFactures}</p>
            <p className="text-sm text-indigo-600">{stats.montantTotal.toFixed(2)} €</p>
          </button>
          <button
            onClick={() => setFilterStatut("EN_ATTENTE")}
            className={`bg-amber-50 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filterStatut === "EN_ATTENTE" ? "border-amber-400 ring-2 ring-amber-200" : "border-amber-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">En attente</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.enAttente.count}</p>
            <p className="text-sm text-amber-600">{stats.enAttente.montant.toFixed(2)} €</p>
          </button>
          <button
            onClick={() => setFilterStatut("PAYEE")}
            className={`bg-emerald-50 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filterStatut === "PAYEE" ? "border-emerald-400 ring-2 ring-emerald-200" : "border-emerald-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Payées</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{stats.payees.count}</p>
            <p className="text-sm text-emerald-600">{stats.payees.montant.toFixed(2)} €</p>
          </button>
          <button
            onClick={() => setFilterStatut("EN_RETARD")}
            className={`bg-rose-50 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filterStatut === "EN_RETARD" ? "border-rose-400 ring-2 ring-rose-200" : "border-rose-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-rose-600" />
              <span className="text-sm font-medium text-rose-700">Impayé</span>
            </div>
            <p className="text-2xl font-bold text-rose-900">{stats.enRetard.count}</p>
            <p className="text-sm text-rose-600">{stats.enRetard.montant.toFixed(2)} €</p>
          </button>
          <button
            onClick={() => setFilterStatut("PAYEE")}
            className={`bg-blue-50 rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filterStatut === "PAYEE" ? "border-blue-400 ring-2 ring-blue-200" : "border-blue-100"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Encaissé</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.montantPaye.toFixed(2)} €</p>
            <p className="text-sm text-blue-600">
              {stats.montantTotal > 0
                ? `${((stats.montantPaye / stats.montantTotal) * 100).toFixed(0)}%`
                : "0%"}
            </p>
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="TOUS">Tous les statuts</option>
          {Object.entries(statutConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <input
          type="month"
          value={filterMois}
          onChange={(e) => setFilterMois(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      {filteredFactures.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucune facture</h3>
          <p className="text-gray-400 mt-1">
            {factures.length > 0
              ? "Aucune facture ne correspond à vos filtres"
              : "Cliquez sur \"Générer les factures du mois\" pour commencer"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Parent</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enfant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Période</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFactures.map((facture) => {
                  const config = statutConfig[facture.statut];
                  return (
                    <tr key={facture.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {facture.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {facture.parent
                          ? `${facture.parent.prenom ?? ""} ${facture.parent.nom ?? ""}`.trim()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {facture.enfant
                          ? `${facture.enfant.prenom} ${facture.enfant.nom}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {facture.periode ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {Number(facture.montantTotal).toFixed(2)} €
                        </span>
                        {Number(facture.montantPaye) > 0 && Number(facture.montantPaye) < Number(facture.montantTotal) && (
                          <span className="block text-xs text-emerald-600">
                            Payé : {Number(facture.montantPaye).toFixed(2)} €
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/facturation/${facture.id}`)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          <Eye size={16} />
                          Voir
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title ?? ""}
        message={confirmModal?.message ?? ""}
        variant={confirmModal?.variant ?? "default"}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
