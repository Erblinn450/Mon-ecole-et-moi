"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileSignature
} from "lucide-react";
import { StatutPreinscription, Classe } from "@/types";
import { classeLabels } from "@/lib/labels";
import { API_URL } from "@/lib/api";

interface Dossier {
  id: number;
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  classeSouhaitee: Classe;
  classeActuelle?: string;
  statut: StatutPreinscription;
  dateDemande: string;
  compteCree?: boolean;
  enfantId?: number | null;
  enfant?: {
    id: number;
    nom: string;
    prenom: string;
    classe: Classe;
  } | null;
}

const statutConfig = {
  [StatutPreinscription.EN_ATTENTE]: {
    label: "En attente",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: Clock,
    message: "Votre dossier est en cours d'examen. Nous vous contacterons prochainement.",
  },
  [StatutPreinscription.DEJA_CONTACTE]: {
    label: "Contacté",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: PhoneCall,
    message: "Nous vous avons contacté. N'hésitez pas à nous rappeler.",
  },
  [StatutPreinscription.VALIDE]: {
    label: "Validé",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: CheckCircle,
    message: "Félicitations ! Votre dossier a été validé. Veuillez finaliser l'inscription.",
  },
  [StatutPreinscription.REFUSE]: {
    label: "Refusé",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    icon: XCircle,
    message: "Nous sommes désolés, votre demande n'a pas pu être acceptée.",
  },
  [StatutPreinscription.ANNULE]: {
    label: "Annulé",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-800",
    icon: XCircle,
    message: "Ce dossier a été annulé.",
  },
};


export default function MesDossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/connexion";
        return;
      }

      const response = await fetch(`${API_URL}/preinscriptions/mes-dossiers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des dossiers");
      }

      const data = await response.json();
      setDossiers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDossiers = dossiers.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.numeroDossier.toLowerCase().includes(query) ||
      d.nomEnfant.toLowerCase().includes(query) ||
      d.prenomEnfant.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FolderOpen size={20} className="text-white" />
          </div>
          Mes dossiers de préinscription
        </h1>
        <p className="text-gray-500 mt-2">
          Suivez l&apos;avancement de vos demandes et finalisez les inscriptions.
        </p>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro ou nom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={20} />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* Liste des dossiers */}
      {filteredDossiers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FolderOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun dossier
          </h3>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore de demande de préinscription.
          </p>
          <Link
            href="/preinscription-enfant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} /> Nouvelle préinscription
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDossiers.map((dossier) => {
            const statut = statutConfig[dossier.statut];
            const StatutIcon = statut.icon;
            const isValide = dossier.statut === StatutPreinscription.VALIDE;
            const enfantId = dossier.enfantId;

            return (
              <div
                key={dossier.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${statut.border}`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statut.bg}`}>
                        <FolderOpen size={24} className={statut.text} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dossier.prenomEnfant} {dossier.nomEnfant}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {classeLabels[dossier.classeSouhaitee]}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          {dossier.numeroDossier}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statut.bg} ${statut.text}`}>
                        <StatutIcon size={14} />
                        {statut.label}
                      </span>
                      <p className="text-xs text-gray-500">
                        Demande du{" "}
                        {new Date(dossier.dateDemande).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message selon statut */}
                <div className={`px-6 py-4 ${statut.bg} flex items-center justify-between`}>
                  <p className={`text-sm ${statut.text}`}>
                    {statut.message}
                  </p>

                  {/* Action Button for Validated Folders */}
                  {isValide && enfantId && (
                    <Link
                      href={`/finaliser-inscription?enfantId=${enfantId}`}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm shadow-sm"
                    >
                      <FileSignature size={18} />
                      Poursuivre l&apos;inscription
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/preinscription-enfant"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl"
        >
          <Plus size={18} /> Nouvelle préinscription
        </Link>
        <Link
          href="/reinscription"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <RefreshCw size={18} /> Réinscription
        </Link>
      </div>
    </div>
  );
}
