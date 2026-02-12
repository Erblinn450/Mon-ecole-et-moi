"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  GraduationCap,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Classe } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Reinscription {
  id: number;
  enfantId: number;
  anneeScolaire: string;
  classeActuelle: Classe;
  classeSouhaitee: Classe;
  statut: string;
  commentaire: string | null;
  createdAt: string;
  enfant: {
    nom: string;
    prenom: string;
    parent1: {
      email: string;
      telephone: string | null;
    };
  };
}

interface Stats {
  total: number;
  enAttente: number;
  validees: number;
  refusees: number;
}

const classeLabels: Record<Classe, string> = {
  [Classe.MATERNELLE]: "Maternelle",
  [Classe.ELEMENTAIRE]: "Élémentaire",
  [Classe.COLLEGE]: "Collège",
};

const statutConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  EN_ATTENTE: {
    label: "En attente",
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: Clock,
  },
  VALIDEE: {
    label: "Validée",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: CheckCircle,
  },
  REFUSEE: {
    label: "Refusée",
    bg: "bg-rose-100",
    text: "text-rose-800",
    icon: XCircle,
  },
};

export default function ReinscriptionsAdminPage() {
  const [reinscriptions, setReinscriptions] = useState<Reinscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      const [reinsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/reinscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reinscriptions/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!reinsResponse.ok) {
        throw new Error("Erreur lors du chargement");
      }

      setReinscriptions(await reinsResponse.json());

      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatut = async (id: number, newStatut: string) => {
    try {
      // Confirmation pour annulation
      if (newStatut === "EN_ATTENTE") {
        const confirmer = confirm(
          "Êtes-vous sûr de vouloir annuler cette validation et remettre la demande en attente ?"
        );
        if (!confirmer) return;
      }

      // Demander un commentaire pour le refus
      let commentaire: string | null = null;
      if (newStatut === "REFUSEE") {
        commentaire = prompt(
          "Pourquoi refusez-vous cette réinscription ? (optionnel)\nCe commentaire sera visible dans l'historique."
        );
        // Si l'utilisateur annule le prompt, on arrête
        if (commentaire === null) return;
      }

      const token = localStorage.getItem("auth_token");
      const body: { statut: string; commentaire?: string } = { statut: newStatut };
      if (commentaire) {
        body.commentaire = commentaire;
      }

      const response = await fetch(`${API_URL}/reinscriptions/${id}/statut`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Recharger les données
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  // Filtrer par recherche
  const filteredReinscriptions = reinscriptions.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.enfant.nom.toLowerCase().includes(query) ||
      r.enfant.prenom.toLowerCase().includes(query) ||
      r.enfant.parent1.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <RefreshCw size={20} className="text-white" />
            </div>
            Réinscriptions
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les demandes de réinscription pour l&apos;année prochaine
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm text-amber-700">En attente</p>
            <p className="text-2xl font-bold text-amber-800">{stats.enAttente}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
            <p className="text-sm text-emerald-700">Validées</p>
            <p className="text-2xl font-bold text-emerald-800">{stats.validees}</p>
          </div>
          <div className="bg-rose-50 rounded-xl border border-rose-100 p-4">
            <p className="text-sm text-rose-700">Refusées</p>
            <p className="text-2xl font-bold text-rose-800">{stats.refusees}</p>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={20} />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
        </div>
      ) : filteredReinscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <RefreshCw size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune réinscription
          </h3>
          <p className="text-gray-500">
            Aucune demande de réinscription pour le moment.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Enfant</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Classe</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Dossier</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReinscriptions.map((reinscription) => {
                  const statut = statutConfig[reinscription.statut] || statutConfig.EN_ATTENTE;
                  const StatutIcon = statut.icon;

                  return (
                    <tr key={reinscription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xs flex-shrink-0">
                            {reinscription.enfant.prenom.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {reinscription.enfant.prenom} {reinscription.enfant.nom}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{reinscription.enfant.parent1.email}</p>
                        <p className="text-xs text-gray-500">{reinscription.enfant.parent1.telephone || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                            {classeLabels[reinscription.classeActuelle]}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                            {classeLabels[reinscription.classeSouhaitee]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{reinscription.anneeScolaire}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                            <StatutIcon size={12} />
                            {statut.label}
                          </span>
                          {reinscription.commentaire && (
                            <span
                              className="text-gray-400 cursor-help"
                              title={`Commentaire: ${reinscription.commentaire}`}
                            >
                              <MessageSquare size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={`/admin/eleves?search=${encodeURIComponent(reinscription.enfant.prenom + ' ' + reinscription.enfant.nom)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-medium"
                          title="Voir la fiche de l'enfant"
                        >
                          <Eye size={13} />
                          Voir
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {reinscription.statut === "EN_ATTENTE" ? (
                            <>
                              <button
                                onClick={() => handleChangeStatut(reinscription.id, "VALIDEE")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                <CheckCircle size={14} />
                                Accepter
                              </button>
                              <button
                                onClick={() => handleChangeStatut(reinscription.id, "REFUSEE")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                <XCircle size={14} />
                                Refuser
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleChangeStatut(reinscription.id, "EN_ATTENTE")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                              title="Remettre en attente"
                            >
                              <RefreshCw size={14} />
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
