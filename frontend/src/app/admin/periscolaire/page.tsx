"use client";

import { useState } from "react";

interface CommandePeriscolaire {
  id: number;
  date: string;
  enfantNom: string;
  enfantPrenom: string;
  classe: string;
  parent: string;
}

// Données mock
const MOCK_COMMANDES: CommandePeriscolaire[] = [
  { id: 1, date: "2025-01-06", enfantNom: "Dupont", enfantPrenom: "Lucas", classe: "MS", parent: "Jean Dupont" },
  { id: 2, date: "2025-01-06", enfantNom: "Martin", enfantPrenom: "Léa", classe: "GS", parent: "Marie Martin" },
  { id: 3, date: "2025-01-07", enfantNom: "Dupont", enfantPrenom: "Emma", classe: "CP", parent: "Jean Dupont" },
  { id: 4, date: "2025-01-08", enfantNom: "Bernard", enfantPrenom: "Hugo", classe: "CE1", parent: "Sophie Bernard" },
  { id: 5, date: "2025-01-08", enfantNom: "Petit", enfantPrenom: "Chloé", classe: "PS", parent: "Paul Petit" },
];

const MOCK_ENFANTS = [
  { id: 1, nom: "Dupont Lucas", classe: "MS" },
  { id: 2, nom: "Dupont Emma", classe: "CP" },
  { id: 3, nom: "Martin Léa", classe: "GS" },
  { id: 4, nom: "Bernard Hugo", classe: "CE1" },
  { id: 5, nom: "Petit Chloé", classe: "PS" },
];

export default function AdminPeriscolairePage() {
  const [commandes, setCommandes] = useState<CommandePeriscolaire[]>(MOCK_COMMANDES);
  const [filterDateDebut, setFilterDateDebut] = useState<string>("");
  const [filterDateFin, setFilterDateFin] = useState<string>("");
  const [filterClasse, setFilterClasse] = useState<string>("");
  
  // Modal ajout
  const [showModal, setShowModal] = useState(false);
  const [ajoutEnfant, setAjoutEnfant] = useState<string>("");
  const [ajoutDate, setAjoutDate] = useState<string>("");

  // Stats par jour
  const getStatsByDate = () => {
    const stats: { [key: string]: number } = {};
    commandes.forEach(c => {
      stats[c.date] = (stats[c.date] || 0) + 1;
    });
    return stats;
  };

  // Filtrer les commandes
  const filteredCommandes = commandes.filter(c => {
    if (filterDateDebut && c.date < filterDateDebut) return false;
    if (filterDateFin && c.date > filterDateFin) return false;
    if (filterClasse && c.classe !== filterClasse) return false;
    return true;
  });

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterDateDebut("");
    setFilterDateFin("");
    setFilterClasse("");
  };

  // Ajouter une commande
  const handleAjout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ajoutEnfant || !ajoutDate) return;

    const enfant = MOCK_ENFANTS.find(e => e.id === parseInt(ajoutEnfant));
    if (!enfant) return;

    const [prenom, nom] = enfant.nom.split(" ");
    const newCommande: CommandePeriscolaire = {
      id: commandes.length + 1,
      date: ajoutDate,
      enfantNom: nom || prenom,
      enfantPrenom: prenom,
      classe: enfant.classe,
      parent: "Parent",
    };

    setCommandes([...commandes, newCommande]);
    setShowModal(false);
    setAjoutEnfant("");
    setAjoutDate("");
  };

  // Supprimer une commande
  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      setCommandes(commandes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎨 Gestion du Périscolaire</h1>
          <p className="text-gray-500 mt-1">Gérez les commandes d&apos;activités périscolaires</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Ajouter une commande
          </button>
          <button
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            📥 Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-gray-800">{commandes.length}</p>
          <p className="text-sm text-gray-500">Total commandes</p>
        </div>
        <div className="bg-cyan-50 rounded-xl p-4 shadow-sm border border-cyan-200 text-center">
          <p className="text-2xl font-bold text-cyan-600">{Object.keys(getStatsByDate()).length}</p>
          <p className="text-sm text-cyan-500">Jours avec commandes</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-200 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {commandes.filter(c => c.classe.match(/PS|MS|GS/)).length}
          </p>
          <p className="text-sm text-purple-500">Maternelle</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {commandes.filter(c => c.classe.match(/CP|CE|CM/)).length}
          </p>
          <p className="text-sm text-blue-500">Primaire</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={filterDateDebut}
              onChange={(e) => setFilterDateDebut(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={filterDateFin}
              onChange={(e) => setFilterDateFin(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
            <select
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Toutes</option>
              <option value="PS">PS</option>
              <option value="MS">MS</option>
              <option value="GS">GS</option>
              <option value="CP">CP</option>
              <option value="CE1">CE1</option>
              <option value="CE2">CE2</option>
              <option value="CM1">CM1</option>
              <option value="CM2">CM2</option>
            </select>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Enfant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Classe</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Parent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommandes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredCommandes.map((commande) => (
                  <tr key={commande.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(commande.date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short"
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium">{commande.enfantPrenom} {commande.enfantNom}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                        {commande.classe}
                      </span>
                    </td>
                    <td className="py-3 px-4">{commande.parent}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(commande.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Ajouter une commande</h2>
            
            <form onSubmit={handleAjout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfant <span className="text-red-500">*</span>
                </label>
                <select
                  value={ajoutEnfant}
                  onChange={(e) => setAjoutEnfant(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Sélectionner un enfant --</option>
                  {MOCK_ENFANTS.map((e) => (
                    <option key={e.id} value={e.id}>{e.nom} ({e.classe})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={ajoutDate}
                  onChange={(e) => setAjoutDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

