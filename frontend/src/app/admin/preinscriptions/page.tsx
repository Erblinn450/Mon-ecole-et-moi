"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  Eye,
  Loader2,
  AlertCircle,
  Users,
  GraduationCap,
  FileCheck,
  FileText,
  Shield
} from "lucide-react";
import { StatutPreinscription, Classe } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Preinscription {
  id: number;
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  classeSouhaitee: Classe;
  statut: StatutPreinscription;
  dateDemande: string;
  emailParent: string;
  telephoneParent: string;
  compteCree: boolean;
  // Relations complètes (injectées par le backend update)
  enfants?: {
    id: number;
    justificatifs: { id: number; typeId: number; valide: boolean | null }[];
    signatureReglements: { id: number; parentAccepte: boolean }[];
  }[];
}

interface Stats {
  total: number;
  enAttente: number;
  piecesAValider: number;
  valide: number;
  refuse: number;
}

const statutConfig = {
  [StatutPreinscription.EN_ATTENTE]: {
    label: "En attente",
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: Clock,
  },
  [StatutPreinscription.DEJA_CONTACTE]: {
    label: "Contacté",
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: PhoneCall,
  },
  [StatutPreinscription.VALIDE]: {
    label: "Validé",
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    icon: Users,
  },
  [StatutPreinscription.REFUSE]: {
    label: "Refusé",
    bg: "bg-rose-100",
    text: "text-rose-800",
    icon: XCircle,
  },
  [StatutPreinscription.ANNULE]: {
    label: "Annulé",
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: XCircle,
  },
};

const classeLabels: Record<Classe, string> = {
  [Classe.MATERNELLE]: "Maternelle",
  [Classe.ELEMENTAIRE]: "Élémentaire",
  [Classe.COLLEGE]: "Collège",
};

export default function PreinscriptionsAdminPage() {
  const [preinscriptions, setPreinscriptions] = useState<Preinscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState<StatutPreinscription | "">("");

  useEffect(() => {
    loadData();
  }, [filterStatut]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      // Charger les préinscriptions
      let url = `${API_URL}/preinscriptions`;
      if (filterStatut) {
        url += `?statut=${filterStatut}`;
      }

      const [preinsResponse, statsResponse] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/preinscriptions/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!preinsResponse.ok) {
        throw new Error("Erreur lors du chargement");
      }

      setPreinscriptions(await preinsResponse.json());

      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer par recherche
  const filteredPreinscriptions = preinscriptions.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.numeroDossier.toLowerCase().includes(query) ||
      p.nomEnfant.toLowerCase().includes(query) ||
      p.prenomEnfant.toLowerCase().includes(query) ||
      p.emailParent.toLowerCase().includes(query)
    );
  });

  // Calculer l'état d'avancement (Progression)
  const getProgressionStatus = (p: Preinscription) => {
    if (p.statut !== StatutPreinscription.VALIDE) return null;

    const enfant = p.enfants?.[0];
    // S'il n'y a pas encore d'enfant créé (cas rare car créé à la validation), c'est forcément à valider
    if (!enfant) {
      return { label: "Pièces à valider", color: "text-orange-700", bg: "bg-orange-100", icon: FileText };
    }

    // Vérifier signature
    const isSigned = enfant.signatureReglements.length > 0 && enfant.signatureReglements[0].parentAccepte;

    // Vérifier documents
    const hasDocs = enfant.justificatifs.some(j => j.valide === true);
    const hasPendingDocs = enfant.justificatifs.some(j => j.valide === null);

    if (isSigned && hasDocs && !hasPendingDocs) {
      return { label: "Dossier Complet", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle };
    }

    // Tout le reste est à valider
    return { label: "Pièces à valider", color: "text-orange-700", bg: "bg-orange-100", icon: FileText };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FolderOpen size={20} className="text-white" />
            </div>
            Préinscriptions
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les demandes de préinscription
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm text-amber-700">En attente</p>
            <p className="text-2xl font-bold text-amber-800">{stats.enAttente}</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
            <p className="text-sm text-orange-700">Pièces à valider</p>
            <p className="text-2xl font-bold text-orange-800">{stats.piecesAValider}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
            <p className="text-sm text-indigo-700">Comptes Validés</p>
            <p className="text-2xl font-bold text-indigo-800">{stats.valide}</p>
          </div>
          <div className="bg-rose-50 rounded-xl border border-rose-100 p-4">
            <p className="text-sm text-rose-700">Refusés</p>
            <p className="text-2xl font-bold text-rose-800">{stats.refuse}</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, numéro ou email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filtre statut */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as StatutPreinscription | "")}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value={StatutPreinscription.EN_ATTENTE}>En attente</option>
              <option value={StatutPreinscription.VALIDE}>Validé</option>
              <option value={StatutPreinscription.REFUSE}>Refusé</option>
            </select>
          </div>
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
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      ) : filteredPreinscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FolderOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune préinscription
          </h3>
          <p className="text-gray-500">
            {filterStatut
              ? "Aucun dossier ne correspond aux critères."
              : "Aucune demande de préinscription pour le moment."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Enfant</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Classe</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Avancement</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPreinscriptions.map((preinscription) => {
                  const statut = statutConfig[preinscription.statut];
                  const StatutIcon = statut.icon;
                  const progression = getProgressionStatus(preinscription);
                  const ProgressionIcon = progression?.icon;

                  return (
                    <tr key={preinscription.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                            {preinscription.prenomEnfant.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {preinscription.prenomEnfant} {preinscription.nomEnfant}
                            </p>
                            <p className="font-mono text-xs text-gray-400">{preinscription.numeroDossier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-sm">
                          <GraduationCap size={14} />
                          {classeLabels[preinscription.classeSouhaitee]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{preinscription.emailParent}</p>
                        <p className="text-xs text-gray-500">{preinscription.telephoneParent}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statut.bg} ${statut.text}`}>
                          <StatutIcon size={14} />
                          {statut.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {preinscription.statut === StatutPreinscription.VALIDE ? (
                          progression ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${progression.bg} ${progression.color}`}>
                              {ProgressionIcon && <ProgressionIcon size={14} />}
                              {progression.label}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )
                        ) : (
                          <span className="text-gray-300 text-sm italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/preinscriptions/${preinscription.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium"
                        >
                          <Eye size={14} />
                          Voir
                        </Link>
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
