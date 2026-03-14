"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Settings,
  X,
  Check,
} from "lucide-react";
import { usersApi } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Role, FrequencePaiement, ModePaiement, DestinataireFacture } from "@/types";

interface ParentCompte {
  id: number;
  email: string;
  name: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  role: Role;
  actif: boolean;
  createdAt: string;
  enfantsParent1?: { id: number; nom: string; prenom: string; classe?: string }[];
  frequencePaiement?: FrequencePaiement;
  modePaiementPref?: ModePaiement;
  reductionRFR?: boolean;
  tauxReductionRFR?: number | string;
  destinataireFacture?: DestinataireFacture;
}

export default function AdminComptesPage() {
  const [parents, setParents] = useState<ParentCompte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string; message: string; variant: "danger" | "warning" | "default"; onConfirm: () => void;
  } | null>(null);

  // Modal édition facturation
  const [editModal, setEditModal] = useState(false);
  const [editParent, setEditParent] = useState<ParentCompte | null>(null);
  const [editFrequence, setEditFrequence] = useState<FrequencePaiement | "">("");
  const [editModePaiement, setEditModePaiement] = useState<ModePaiement | "">("");
  const [editRFR, setEditRFR] = useState(false);
  const [editTauxRFR, setEditTauxRFR] = useState("");
  const [editDestinataire, setEditDestinataire] = useState<DestinataireFacture | "">("");
  const [isSaving, setIsSaving] = useState(false);

  const loadParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allUsers = await usersApi.getAll() as unknown as ParentCompte[];
      setParents(allUsers.filter((u) => u.role === Role.PARENT));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleToggleActif = async (parent: ParentCompte) => {
    setActionLoading(true);
    try {
      await usersApi.update(parent.id, { actif: !parent.actif } as Partial<ParentCompte>);
      await loadParents();
      showSuccess(parent.actif ? "Compte désactivé" : "Compte réactivé");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (parent: ParentCompte) => {
    setEditParent(parent);
    setEditFrequence(parent.frequencePaiement || "");
    setEditModePaiement(parent.modePaiementPref || "");
    setEditRFR(parent.reductionRFR || false);
    setEditTauxRFR(parent.tauxReductionRFR != null ? String(parent.tauxReductionRFR) : "");
    setEditDestinataire(parent.destinataireFacture || "");
    setEditModal(true);
  };

  const handleSaveFacturation = async () => {
    if (!editParent) return;
    setIsSaving(true);
    try {
      await usersApi.update(editParent.id, {
        frequencePaiement: editFrequence || null,
        modePaiementPref: editModePaiement || null,
        reductionRFR: editRFR,
        tauxReductionRFR: editRFR && editTauxRFR.trim() !== "" ? parseFloat(editTauxRFR) : null,
        destinataireFacture: editDestinataire || null,
      } as Partial<ParentCompte>);
      await loadParents();
      setEditModal(false);
      showSuccess("Paramètres de facturation mis à jour");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    total: parents.length,
    actifs: parents.filter((p) => p.actif).length,
    inactifs: parents.filter((p) => !p.actif).length,
  };

  const filteredParents = parents.filter((p) => {
    if (filterStatut === "actif" && !p.actif) return false;
    if (filterStatut === "inactif" && p.actif) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nom = `${p.prenom ?? ""} ${p.nom ?? ""}`.toLowerCase();
      const enfants = (p.enfantsParent1 ?? []).map((e) => `${e.prenom} ${e.nom}`.toLowerCase()).join(" ");
      return nom.includes(query) || p.email.toLowerCase().includes(query) || enfants.includes(query);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comptes Parents</h1>
        <p className="text-gray-500 mt-1">
          Gérez les comptes parents créés suite aux préinscriptions validées
        </p>
      </div>

      {/* Message succès */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 flex items-center gap-2">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Total</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Actifs</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{stats.actifs}</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Inactifs</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{stats.inactifs}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, enfant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>
      </div>

      {/* Tableau */}
      {filteredParents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucun compte</h3>
          <p className="text-gray-400 mt-1">
            {parents.length > 0 ? "Aucun résultat pour vos filtres" : "Aucun parent inscrit"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Parent</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enfant(s)</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Inscription</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {parent.prenom ?? ""} {parent.nom ?? parent.name}
                      </p>
                      {parent.telephone && (
                        <p className="text-xs text-gray-400">{parent.telephone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        {parent.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(parent.enfantsParent1 ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parent.enfantsParent1!.map((e) => (
                            <span key={e.id} className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                              {e.prenom} {e.nom}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(parent.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        parent.actif
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {parent.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(parent)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Paramètres facturation"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({
                            title: parent.actif ? "Désactiver ce compte ?" : "Réactiver ce compte ?",
                            message: parent.actif
                              ? `Le parent ${parent.prenom ?? ""} ${parent.nom ?? ""} ne pourra plus se connecter.`
                              : `Le parent ${parent.prenom ?? ""} ${parent.nom ?? ""} pourra à nouveau se connecter.`,
                            variant: parent.actif ? "warning" : "default",
                            onConfirm: () => { setConfirmModal(null); handleToggleActif(parent); },
                          })}
                          disabled={actionLoading}
                          className={`p-1.5 rounded-lg transition-colors ${
                            parent.actif
                              ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={parent.actif ? "Désactiver" : "Réactiver"}
                        >
                          {parent.actif ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal édition facturation */}
      {editModal && editParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Paramètres facturation</h2>
                <p className="text-sm text-gray-500">{editParent.prenom ?? ""} {editParent.nom ?? editParent.name}</p>
              </div>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de paiement
                </label>
                <select
                  value={editFrequence}
                  onChange={(e) => setEditFrequence(e.target.value as FrequencePaiement | "")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Non défini</option>
                  <option value={FrequencePaiement.MENSUEL}>Mensuel</option>
                  <option value={FrequencePaiement.TRIMESTRIEL}>Trimestriel</option>
                  <option value={FrequencePaiement.SEMESTRIEL}>Semestriel</option>
                  <option value={FrequencePaiement.ANNUEL}>Annuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement préféré
                </label>
                <select
                  value={editModePaiement}
                  onChange={(e) => setEditModePaiement(e.target.value as ModePaiement | "")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Non défini</option>
                  <option value={ModePaiement.PRELEVEMENT}>Prélèvement</option>
                  <option value={ModePaiement.VIREMENT}>Virement</option>
                  <option value={ModePaiement.CHEQUE}>Chèque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire des factures
                </label>
                <select
                  value={editDestinataire}
                  onChange={(e) => setEditDestinataire(e.target.value as DestinataireFacture | "")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Non défini</option>
                  <option value={DestinataireFacture.LES_DEUX}>Les deux parents</option>
                  <option value={DestinataireFacture.PARENT1}>Parent 1 uniquement</option>
                  <option value={DestinataireFacture.PARENT2}>Parent 2 uniquement</option>
                </select>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Réduction RFR (Revenu Fiscal)
                  </label>
                  <button
                    onClick={() => setEditRFR(!editRFR)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editRFR ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editRFR ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                {editRFR && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Taux de réduction (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Ex: 10"
                      value={editTauxRFR}
                      onChange={(e) => setEditTauxRFR(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Ce pourcentage sera déduit de la scolarité sur chaque facture
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveFacturation}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
