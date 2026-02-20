"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Receipt,
  User,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  Clock,
} from "lucide-react";
import { facturationApi } from "@/lib/api";
import {
  Facture,
  StatutFacture,
  ModePaiement,
  TypeLigne,
} from "@/types";

const statutConfig: Record<StatutFacture, { label: string; bg: string; text: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700" },
  ENVOYEE: { label: "Envoyée", bg: "bg-blue-50", text: "text-blue-700" },
  PAYEE: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700" },
  PARTIELLE: { label: "Partielle", bg: "bg-orange-50", text: "text-orange-700" },
  EN_RETARD: { label: "En retard", bg: "bg-rose-50", text: "text-rose-700" },
  ANNULEE: { label: "Annulée", bg: "bg-gray-50", text: "text-gray-500" },
};

const typeLigneLabels: Record<TypeLigne, string> = {
  [TypeLigne.SCOLARITE]: "Scolarité",
  [TypeLigne.REPAS]: "Repas",
  [TypeLigne.PERISCOLAIRE]: "Périscolaire",
  [TypeLigne.DEPASSEMENT]: "Dépassement",
  [TypeLigne.INSCRIPTION]: "Inscription",
  [TypeLigne.MATERIEL]: "Matériel",
  [TypeLigne.REDUCTION]: "Réduction",
  [TypeLigne.PERSONNALISE]: "Personnalisé",
};

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const factureId = Number(params.id);

  const [facture, setFacture] = useState<Facture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire ajout ligne
  const [showAjoutLigne, setShowAjoutLigne] = useState(false);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    description: "",
    quantite: 1,
    prixUnit: 0,
    type: TypeLigne.PERSONNALISE,
    commentaire: "",
  });

  // Formulaire paiement
  const [showPaiement, setShowPaiement] = useState(false);
  const [nouveauPaiement, setNouveauPaiement] = useState({
    montant: 0,
    datePaiement: new Date().toISOString().split("T")[0],
    modePaiement: ModePaiement.VIREMENT,
    reference: "",
    commentaire: "",
  });

  const loadFacture = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await facturationApi.getById(factureId);
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

  const handleChangeStatut = async (statut: StatutFacture) => {
    try {
      await facturationApi.updateStatut(factureId, statut);
      await loadFacture();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleAjouterLigne = async () => {
    try {
      await facturationApi.ajouterLigne(factureId, {
        description: nouvelleLigne.description,
        quantite: nouvelleLigne.quantite,
        prixUnit: nouvelleLigne.prixUnit,
        type: nouvelleLigne.type,
        commentaire: nouvelleLigne.commentaire || undefined,
      });
      setShowAjoutLigne(false);
      setNouvelleLigne({ description: "", quantite: 1, prixUnit: 0, type: TypeLigne.PERSONNALISE, commentaire: "" });
      await loadFacture();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleSupprimerLigne = async (ligneId: number) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    try {
      await facturationApi.supprimerLigne(factureId, ligneId);
      await loadFacture();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleEnregistrerPaiement = async () => {
    try {
      await facturationApi.enregistrerPaiement(factureId, {
        montant: nouveauPaiement.montant,
        datePaiement: nouveauPaiement.datePaiement,
        modePaiement: nouveauPaiement.modePaiement,
        reference: nouveauPaiement.reference || undefined,
        commentaire: nouveauPaiement.commentaire || undefined,
      });
      setShowPaiement(false);
      setNouveauPaiement({ montant: 0, datePaiement: new Date().toISOString().split("T")[0], modePaiement: ModePaiement.VIREMENT, reference: "", commentaire: "" });
      await loadFacture();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
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
          onClick={() => router.push("/admin/facturation")}
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
          {config.label}
        </span>
      </div>

      {/* Infos parent + enfant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Parent</h3>
          </div>
          {facture.parent ? (
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {facture.parent.prenom ?? ""} {facture.parent.nom ?? ""}
              </p>
              <p>{facture.parent.email}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Non renseigné</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Enfant</h3>
          </div>
          {facture.enfant ? (
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {facture.enfant.prenom} {facture.enfant.nom}
              </p>
              <p>Classe : {facture.enfant.classe ?? "-"}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Famille entière</p>
          )}
        </div>
      </div>

      {/* Montants */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500">Total facturé</p>
            <p className="text-2xl font-bold text-gray-900">{Number(facture.montantTotal).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Montant payé</p>
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

      {/* Actions rapides */}
      {facture.statut !== StatutFacture.ANNULEE && (
        <div className="flex flex-wrap gap-3">
          {facture.statut !== StatutFacture.PAYEE && (
            <button
              onClick={() => handleChangeStatut(StatutFacture.PAYEE)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm"
            >
              <CheckCircle size={16} />
              Marquer payée
            </button>
          )}
          {facture.statut !== StatutFacture.EN_RETARD && facture.statut !== StatutFacture.PAYEE && (
            <button
              onClick={() => handleChangeStatut(StatutFacture.EN_RETARD)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm"
            >
              <AlertCircle size={16} />
              Marquer en retard
            </button>
          )}
          {(facture.statut === StatutFacture.PAYEE || facture.statut === StatutFacture.EN_RETARD) && (
            <button
              onClick={() => handleChangeStatut(StatutFacture.EN_ATTENTE)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm"
            >
              <Clock size={16} />
              Remettre en attente
            </button>
          )}
          <button
            onClick={() => setShowPaiement(!showPaiement)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            <CreditCard size={16} />
            Enregistrer un paiement
          </button>
          <button
            onClick={() => setShowAjoutLigne(!showAjoutLigne)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>
      )}

      {/* Formulaire paiement */}
      {showPaiement && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 space-y-4">
          <h3 className="font-semibold text-blue-900">Enregistrer un paiement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={nouveauPaiement.montant || ""}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, montant: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={nouveauPaiement.datePaiement}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, datePaiement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={nouveauPaiement.modePaiement}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, modePaiement: e.target.value as ModePaiement })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIREMENT">Virement</option>
                <option value="PRELEVEMENT">Prélèvement</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                value={nouveauPaiement.reference}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, reference: e.target.value })}
                placeholder="Ex: VIR-20260205"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
              <input
                type="text"
                value={nouveauPaiement.commentaire}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEnregistrerPaiement}
              disabled={nouveauPaiement.montant <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setShowPaiement(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Formulaire ajout ligne */}
      {showAjoutLigne && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Ajouter une ligne</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={nouvelleLigne.description}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, description: e.target.value })}
                placeholder="Ex: Dépassement périscolaire"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input
                type="number"
                min="1"
                value={nouvelleLigne.quantite}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, quantite: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
              <input
                type="number"
                step="0.01"
                value={nouvelleLigne.prixUnit || ""}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, prixUnit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={nouvelleLigne.type}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, type: e.target.value as TypeLigne })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(typeLigneLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
              <input
                type="text"
                value={nouvelleLigne.commentaire}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAjouterLigne}
              disabled={!nouvelleLigne.description || nouvelleLigne.prixUnit === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAjoutLigne(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Lignes de facture */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Receipt size={18} className="text-indigo-600" />
            Lignes de facture ({facture.lignes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qté</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facture.lignes.map((ligne) => (
                <tr key={ligne.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {ligne.type ? typeLigneLabels[ligne.type] ?? ligne.type : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {ligne.description}
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
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleSupprimerLigne(ligne.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right font-semibold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {Number(facture.montantTotal).toFixed(2)} €
                </td>
                <td></td>
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
              Paiements ({facture.paiements.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mode</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Référence</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {facture.paiements.map((paiement) => (
                  <tr key={paiement.id}>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {paiement.modePaiement === "PRELEVEMENT" ? "Prélèvement" : "Virement"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {paiement.reference ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-emerald-600">
                      {Number(paiement.montant).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
