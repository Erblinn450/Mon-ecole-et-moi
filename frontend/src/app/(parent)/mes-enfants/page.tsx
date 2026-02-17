"use client";

import { 
  Users, 
  Calendar, 
  GraduationCap,
  FileCheck,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Mail
} from "lucide-react";
import { useEnfants } from "@/hooks/useEnfants";
import { classeLabels } from "@/lib/labels";


export default function MesEnfantsPage() {
  const { enfants, isLoading, error } = useEnfants();

  const calculateAge = (dateNaissance?: string) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birth = new Date(dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
        <AlertCircle className="text-rose-500" size={24} />
        <div>
          <p className="font-medium text-rose-800">Erreur de chargement</p>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Users size={20} className="text-white" />
          </div>
          Mes enfants inscrits
        </h1>
        <p className="text-gray-500 mt-2">
          Consultez les informations et gérez les inscriptions de vos enfants
        </p>
      </div>

      {/* Liste des enfants */}
      {enfants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun enfant inscrit
          </h3>
          <p className="text-gray-500">
            Vous n&apos;avez pas encore d&apos;enfant inscrit dans notre école.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enfants.map((enfant) => {
            const age = calculateAge(enfant.dateNaissance);
            return (
              <div
                key={enfant.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                      {enfant.prenom[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {enfant.prenom} {enfant.nom}
                      </h3>
                      <p className="text-sky-100">
                        {enfant.classe ? classeLabels[enfant.classe] : "Classe non assignée"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                        <Calendar size={18} className="text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date de naissance</p>
                        <p className="font-medium text-gray-900">
                          {enfant.dateNaissance 
                            ? new Date(enfant.dateNaissance).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Non renseignée"
                          }
                        </p>
                      </div>
                    </div>
                    {age !== null && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                          <GraduationCap size={18} className="text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Âge</p>
                          <p className="font-medium text-gray-900">{age} ans</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statut règlement - simulation */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <FileCheck size={20} className="text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          Inscription active
                        </p>
                        <p className="text-sm text-emerald-600">
                          Année scolaire {new Date().getMonth() >= 8 ? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-sm">
                      Voir les documents
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Mail size={20} className="text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sky-900 mb-1">
              Besoin de modifier des informations ?
            </h3>
            <p className="text-sm text-sky-800">
              Pour toute modification d&apos;informations personnelles ou demande de
              désinscription, veuillez contacter l&apos;administration à{" "}
              <a href="mailto:contact@montessorietmoi.com" className="underline">
                contact@montessorietmoi.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

