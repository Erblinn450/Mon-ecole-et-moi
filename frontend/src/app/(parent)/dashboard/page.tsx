"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useAuth } from "@/hooks/useAuth";
import { useEnfants } from "@/hooks/useEnfants";
import {
  UtensilsCrossed,
  Palette,
  UserCheck,
  RefreshCw,
  FolderOpen,
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  AlertTriangle,
  FileSignature,
  ArrowRight
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface EnfantSignature {
  enfantId: number;
  enfantNom: string;
  signed: boolean;
}

export default function DashboardParentPage() {
  const { user } = useAuth();
  const { enfants, isLoading } = useEnfants();
  const [userName, setUserName] = useState("");
  const [inscriptionsNonFinalisees, setInscriptionsNonFinalisees] = useState<EnfantSignature[]>([]);

  useEffect(() => {
    // Utiliser le nom de l'utilisateur connecté ou du localStorage
    if (user?.name) {
      setUserName(user.name);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserName(parsed.name || parsed.prenom || "Parent");
        } catch {
          setUserName("Parent");
        }
      }
    }
  }, [user]);

  // Vérifier les signatures pour chaque enfant
  useEffect(() => {
    const checkSignatures = async () => {
      if (enfants.length === 0) return;

      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const nonSignes: EnfantSignature[] = [];

      for (const enfant of enfants) {
        try {
          const response = await fetch(`${API_URL}/signatures/status/${enfant.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.signed) {
              nonSignes.push({
                enfantId: enfant.id,
                enfantNom: `${enfant.prenom} ${enfant.nom}`,
                signed: false,
              });
            }
          }
        } catch (err) {
          // Si erreur, considérer comme non signé
          nonSignes.push({
            enfantId: enfant.id,
            enfantNom: `${enfant.prenom} ${enfant.nom}`,
            signed: false,
          });
        }
      }

      setInscriptionsNonFinalisees(nonSignes);
    };

    checkSignatures();
  }, [enfants]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots)" />
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium mb-2">Bienvenue</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Bonjour {userName}
          </h1>
          <p className="text-emerald-100 text-lg max-w-xl">
            Gérez les inscriptions, repas et activités de vos enfants depuis votre espace personnel.
          </p>
        </div>
      </div>

      {/* Alerte inscription non finalisée */}
      {inscriptionsNonFinalisees.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg shadow-amber-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">
                Action requise : Finaliser l&apos;inscription
              </h3>
              <p className="text-amber-100 mb-4">
                {inscriptionsNonFinalisees.length === 1
                  ? `L'inscription de ${inscriptionsNonFinalisees[0].enfantNom} n'est pas encore finalisée.`
                  : `${inscriptionsNonFinalisees.length} inscriptions ne sont pas encore finalisées.`
                }
                {" "}Veuillez signer le règlement intérieur pour compléter l&apos;inscription.
              </p>
              <Link
                href={inscriptionsNonFinalisees.length === 1
                  ? `/finaliser-inscription?enfantId=${inscriptionsNonFinalisees[0].enfantId}`
                  : "/finaliser-inscription"
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors"
              >
                <FileSignature size={18} />
                Finaliser maintenant
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
              <Users size={22} className="text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Enfants inscrits</p>
              <p className="text-2xl font-bold text-gray-900">{enfants.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <TrendingUp size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Année scolaire</p>
              <p className="text-lg font-semibold text-gray-900">
                {(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth();
                  // Si après août (rentrée), nouvelle année scolaire
                  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Calendar size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Ligne 1: Actions fréquentes */}
          <DashboardCard
            href="/repas"
            icon={UtensilsCrossed}
            title="Commander repas"
            description="Réservez les repas pour les prochaines semaines"
            color="amber"
          />

          <DashboardCard
            href="/periscolaire"
            icon={Palette}
            title="Périscolaire"
            description="Inscrivez aux activités et à la garderie"
            color="violet"
          />

          <DashboardCard
            href="/personnes-autorisees"
            icon={UserCheck}
            title="Personnes autorisées"
            description="Gérer qui peut récupérer vos enfants"
            color="sky"
          />

          {/* Ligne 2: Gestion administrative */}
          <DashboardCard
            href="/mes-dossiers"
            icon={FolderOpen}
            title="Mes dossiers"
            description="Suivre les demandes en cours"
            color="indigo"
          />

          <DashboardCard
            href="/mes-enfants"
            icon={Users}
            title="Mes enfants"
            description="Consulter les informations"
            color="rose"
          />

          <DashboardCard
            href="/reinscription"
            icon={RefreshCw}
            title="Réinscription"
            description="Réinscrire pour l'année prochaine"
            color="teal"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Rappel important
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Les commandes de repas doivent être passées avant{" "}
              <strong>jeudi 23h59</strong> de la semaine précédente.
              Les annulations sont possibles jusqu&apos;à une semaine avant la date du repas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

