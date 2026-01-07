"use client";

import { useState } from "react";

interface CompteParent {
  id: number;
  numDossier: string;
  nomParent: string;
  email: string;
  enfants: string[];
  dateCreation: string;
  statut: "actif" | "inactif" | "suspendu";
}

// Données mock
const MOCK_COMPTES: CompteParent[] = [
  { 
    id: 1, 
    numDossier: "PRE-2025-001", 
    nomParent: "Jean Dupont", 
    email: "jean.dupont@example.com", 
    enfants: ["Lucas Dupont", "Emma Dupont"],
    dateCreation: "2025-01-02",
    statut: "actif"
  },
  { 
    id: 2, 
    numDossier: "PRE-2025-002", 
    nomParent: "Marie Martin", 
    email: "marie.martin@example.com", 
    enfants: ["Léa Martin"],
    dateCreation: "2025-01-03",
    statut: "actif"
  },
  { 
    id: 3, 
    numDossier: "PRE-2025-003", 
    nomParent: "Sophie Bernard", 
    email: "sophie.bernard@example.com", 
    enfants: ["Hugo Bernard"],
    dateCreation: "2025-01-04",
    statut: "actif"
  },
  { 
    id: 4, 
    numDossier: "PRE-2024-150", 
    nomParent: "Paul Petit", 
    email: "paul.petit@example.com", 
    enfants: ["Chloé Petit"],
    dateCreation: "2024-12-15",
    statut: "inactif"
  },
];

export default function AdminComptesPage() {
  const [comptes, setComptes] = useState<CompteParent[]>(MOCK_COMPTES);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatut, setFilterStatut] = useState<string>("");

  // Stats
  const stats = {
    total: comptes.length,
    actifs: comptes.filter(c => c.statut === "actif").length,
    inactifs: comptes.filter(c => c.statut === "inactif").length,
    suspendus: comptes.filter(c => c.statut === "suspendu").length,
  };

  // Filtrer les comptes
  const filteredComptes = comptes.filter(c => {
    if (filterStatut && c.statut !== filterStatut) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        c.nomParent.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.numDossier.toLowerCase().includes(search) ||
        c.enfants.some(e => e.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Changer le statut
  const toggleStatut = (id: number, newStatut: "actif" | "inactif" | "suspendu") => {
    setComptes(comptes.map(c => 
      c.id === id ? { ...c, statut: newStatut } : c
    ));
  };

  // Réinitialiser le mot de passe
  const resetPassword = (compte: CompteParent) => {
    if (confirm(`Envoyer un email de réinitialisation de mot de passe à ${compte.email} ?`)) {
      alert(`✅ Email envoyé à ${compte.email}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👥 Comptes Parents</h1>
        <p className="text-gray-500 mt-1">
          Gérez les comptes parents créés suite aux préinscriptions validées
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total comptes</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
          <p className="text-sm text-green-500">✅ Actifs</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.inactifs}</p>
          <p className="text-sm text-gray-500">💤 Inactifs</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.suspendus}</p>
          <p className="text-sm text-red-500">🚫 Suspendus</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Rechercher</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, email, dossier, enfant..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              <option value="actif">✅ Actif</option>
              <option value="inactif">💤 Inactif</option>
              <option value="suspendu">🚫 Suspendu</option>
            </select>
          </div>
          <button
            onClick={() => { setSearchTerm(""); setFilterStatut(""); }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau des comptes */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">N° Dossier</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nom Parent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Enfant(s)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date création</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComptes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Aucun compte trouvé
                  </td>
                </tr>
              ) : (
                filteredComptes.map((compte) => (
                  <tr key={compte.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{compte.numDossier}</td>
                    <td className="py-3 px-4 font-medium">{compte.nomParent}</td>
                    <td className="py-3 px-4 text-sm">{compte.email}</td>
                    <td className="py-3 px-4">
                      {compte.enfants.map((e, i) => (
                        <span key={i} className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded mr-1 mb-1">
                          {e}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(compte.dateCreation).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        compte.statut === "actif" ? "bg-green-100 text-green-700" :
                        compte.statut === "inactif" ? "bg-gray-100 text-gray-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {compte.statut === "actif" ? "✅ Actif" :
                         compte.statut === "inactif" ? "💤 Inactif" : "🚫 Suspendu"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => resetPassword(compte)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          title="Réinitialiser mot de passe"
                        >
                          🔑
                        </button>
                        {compte.statut === "actif" ? (
                          <button
                            onClick={() => toggleStatut(compte.id, "suspendu")}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Suspendre"
                          >
                            🚫
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatut(compte.id, "actif")}
                            className="text-green-500 hover:text-green-700 text-sm"
                            title="Réactiver"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

