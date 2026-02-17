"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  UtensilsCrossed,
  Palette,
  BarChart3,
  Users,
  Loader2,
  AlertCircle,
  Download,
  ChevronDown
} from "lucide-react";
import { preinscriptionsApi, enfantsApi, API_URL } from "@/lib/api";
import { PreinscriptionStats, EnfantStats, Classe } from "@/types";

export default function AdminDashboardPage() {
  const [preinscriptionStats, setPreinscriptionStats] = useState<PreinscriptionStats | null>(null);
  const [enfantStats, setEnfantStats] = useState<EnfantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'eleves' | 'preinscriptions' | 'parents' | 'factures' | 'complet') => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur lors de l'export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert("Erreur lors de l'export : " + (err instanceof Error ? err.message : "Erreur inconnue"));
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [preStats, enfStats] = await Promise.all([
          preinscriptionsApi.getStats(),
          enfantsApi.getStats(),
        ]);
        setPreinscriptionStats(preStats);
        setEnfantStats(enfStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-violet-600" />
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">
            Vue d&apos;ensemble de l&apos;activité de l&apos;école
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Bouton Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Exporter
              <ChevronDown size={16} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={() => handleExport('complet')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 font-medium text-emerald-700"
                >
                  <Download size={16} />
                  Export complet (tout)
                </button>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={() => handleExport('eleves')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <GraduationCap size={16} className="text-gray-400" />
                  Liste des élèves
                </button>
                <button
                  onClick={() => handleExport('preinscriptions')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-gray-400" />
                  Préinscriptions
                </button>
                <button
                  onClick={() => handleExport('parents')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Users size={16} className="text-gray-400" />
                  Parents / Comptes
                </button>
                <button
                  onClick={() => handleExport('factures')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart3 size={16} className="text-gray-400" />
                  Factures
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Élèves */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <GraduationCap size={22} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total élèves</p>
              <p className="text-2xl font-bold text-gray-900">{enfantStats?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Préinscriptions en attente */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <FileText size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-amber-600">
                {preinscriptionStats?.enAttente || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Maternelle */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              <Users size={22} className="text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Maternelle</p>
              <p className="text-2xl font-bold text-gray-900">
                {enfantStats?.parClasse?.MATERNELLE || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Élémentaire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
              <Users size={22} className="text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Élémentaire</p>
              <p className="text-2xl font-bold text-gray-900">
                {enfantStats?.parClasse?.ELEMENTAIRE || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Répartition élèves */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-gray-400" />
            Répartition des élèves
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <span className="text-sm text-gray-600">Maternelle</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    style={{
                      width: `${((enfantStats?.parClasse?.MATERNELLE || 0) / (enfantStats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{enfantStats?.parClasse?.MATERNELLE || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="text-sm text-gray-600">Élémentaire</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                    style={{
                      width: `${((enfantStats?.parClasse?.ELEMENTAIRE || 0) / (enfantStats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{enfantStats?.parClasse?.ELEMENTAIRE || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-600">Collège</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    style={{
                      width: `${((enfantStats?.parClasse?.COLLEGE || 0) / (enfantStats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{enfantStats?.parClasse?.COLLEGE || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Préinscriptions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-gray-400" />
              Préinscriptions
            </h2>
            <Link
              href="/admin/preinscriptions"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-600">
                {preinscriptionStats?.enAttente || 0}
              </p>
              <p className="text-xs text-amber-700 mt-1">En attente</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-600">
                {preinscriptionStats?.valide || 0}
              </p>
              <p className="text-xs text-emerald-700 mt-1">Validés</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <p className="text-2xl font-bold text-violet-600">
                {preinscriptionStats?.total || 0}
              </p>
              <p className="text-xs text-violet-700 mt-1">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-gray-400" />
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/preinscriptions"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <FileText size={24} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Préinscriptions</span>
          </Link>
          <Link
            href="/admin/repas"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <UtensilsCrossed size={24} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Gérer repas</span>
          </Link>
          <Link
            href="/admin/eleves"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <GraduationCap size={24} className="text-rose-600" />
            <span className="text-sm font-medium text-rose-800">Élèves</span>
          </Link>
          <Link
            href="/admin/rapports"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-300 hover:shadow-md transition-all"
          >
            <BarChart3 size={24} className="text-sky-600" />
            <span className="text-sm font-medium text-sky-800">Rapports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

