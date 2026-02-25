"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Key,
  Mail,
} from "lucide-react";
import { usersApi } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Role } from "@/types";

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

  const loadParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allUsers = await usersApi.getAll() as ParentCompte[];
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
    </div>
  );
}
