"use client";

import { useState, useEffect, useCallback } from "react";
import { mandatSepaApi } from "@/lib/api";
import { MandatSepa } from "@/types";
import { FileText, Download, Search, CheckCircle, XCircle } from "lucide-react";

export default function AdminMandatsSepaPage() {
  const [mandats, setMandats] = useState<MandatSepa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterActif, setFilterActif] = useState<"all" | "actif" | "revoque">("all");

  const loadMandats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mandatSepaApi.getAll();
      setMandats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMandats();
  }, [loadMandats]);

  const handleDownloadPdf = async (mandat: MandatSepa) => {
    try {
      const blob = await mandatSepaApi.downloadPdf(mandat.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mandat-sepa-${mandat.rum}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement du PDF");
    }
  };

  const filteredMandats = mandats.filter((m) => {
    // Filtre actif/révoqué
    if (filterActif === "actif" && !m.actif) return false;
    if (filterActif === "revoque" && m.actif) return false;

    // Filtre recherche
    if (search) {
      const s = search.toLowerCase();
      const parentNom = `${m.parent?.prenom || ""} ${m.parent?.nom || ""}`.toLowerCase();
      return (
        m.rum.toLowerCase().includes(s) ||
        parentNom.includes(s) ||
        m.titulaire.toLowerCase().includes(s) ||
        (m.parent?.email || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const mandatsActifs = mandats.filter((m) => m.actif).length;
  const mandatsRevoques = mandats.filter((m) => !m.actif).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-emerald-600" />
        Mandats SEPA
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Total mandats</div>
          <div className="text-2xl font-bold text-gray-800">{mandats.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Actifs</div>
          <div className="text-2xl font-bold text-green-600">{mandatsActifs}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">Révoqués</div>
          <div className="text-2xl font-bold text-red-600">{mandatsRevoques}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, RUM, email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterActif}
          onChange={(e) => setFilterActif(e.target.value as "all" | "actif" | "revoque")}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tous</option>
          <option value="actif">Actifs</option>
          <option value="revoque">Révoqués</option>
        </select>
      </div>

      {/* Tableau */}
      {filteredMandats.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          {mandats.length === 0
            ? "Aucun mandat SEPA signé pour le moment."
            : "Aucun résultat pour cette recherche."}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">RUM</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Titulaire</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date signature</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMandats.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{m.rum}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {m.parent?.prenom} {m.parent?.nom}
                      </div>
                      <div className="text-xs text-gray-500">{m.parent?.email}</div>
                    </td>
                    <td className="px-4 py-3">{m.titulaire}</td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(m.dateSignature).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {m.actif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Révoqué
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadPdf(m)}
                        className="text-emerald-600 hover:text-emerald-800 transition"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
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
