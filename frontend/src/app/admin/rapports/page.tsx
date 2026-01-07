"use client";

import { useState } from "react";

// Données mock pour les statistiques
const MOCK_STATS = {
  repas: {
    total: 245,
    normal: 180,
    vegetarien: 65,
    parSemaine: [
      { semaine: "S1", total: 48 },
      { semaine: "S2", total: 52 },
      { semaine: "S3", total: 45 },
      { semaine: "S4", total: 50 },
      { semaine: "S5", total: 50 },
    ],
  },
  periscolaire: {
    total: 156,
    parSemaine: [
      { semaine: "S1", total: 32 },
      { semaine: "S2", total: 28 },
      { semaine: "S3", total: 35 },
      { semaine: "S4", total: 30 },
      { semaine: "S5", total: 31 },
    ],
  },
  preinscriptions: {
    total: 24,
    enAttente: 8,
    valides: 12,
    refuses: 2,
    annules: 2,
  },
  eleves: {
    total: 85,
    maternelle: 35,
    primaire: 40,
    college: 10,
  },
};

export default function AdminRapportsPage() {
  const [periode, setPeriode] = useState<"semaine" | "mois" | "annee">("mois");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");

  // Export CSV
  const exportCSV = (type: string) => {
    alert(`📥 Export ${type} en cours... (simulation)`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Rapports et Statistiques</h1>
          <p className="text-gray-500 mt-1">Vue d&apos;ensemble de l&apos;activité de l&apos;école</p>
        </div>
        <div className="flex gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as "semaine" | "mois" | "annee")}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      {/* Filtres par date */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-4xl font-bold">{MOCK_STATS.eleves.total}</p>
          <p className="text-sky-100 mt-1">Élèves inscrits</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-4xl font-bold">{MOCK_STATS.repas.total}</p>
          <p className="text-amber-100 mt-1">Repas commandés</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-4xl font-bold">{MOCK_STATS.periscolaire.total}</p>
          <p className="text-purple-100 mt-1">Périscolaires</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-4xl font-bold">{MOCK_STATS.preinscriptions.total}</p>
          <p className="text-emerald-100 mt-1">Préinscriptions</p>
        </div>
      </div>

      {/* Section Repas */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">🍽️ Statistiques Repas</h2>
          <button
            onClick={() => exportCSV("repas")}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📥 Exporter CSV
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{MOCK_STATS.repas.total}</p>
            <p className="text-sm text-gray-500">Total repas</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{MOCK_STATS.repas.normal}</p>
            <p className="text-sm text-amber-500">Repas normaux</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{MOCK_STATS.repas.vegetarien}</p>
            <p className="text-sm text-green-500">🌱 Végétariens</p>
          </div>
        </div>

        {/* Graphique simplifié */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Repas par semaine</h3>
          <div className="flex items-end gap-2 h-32">
            {MOCK_STATS.repas.parSemaine.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-amber-400 rounded-t"
                  style={{ height: `${(s.total / 60) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{s.semaine}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Périscolaire */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">🎨 Statistiques Périscolaire</h2>
          <button
            onClick={() => exportCSV("periscolaire")}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📥 Exporter CSV
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{MOCK_STATS.periscolaire.total}</p>
            <p className="text-sm text-purple-500">Total périscolaires</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {Math.round(MOCK_STATS.periscolaire.total / 5)}
            </p>
            <p className="text-sm text-gray-500">Moyenne / semaine</p>
          </div>
        </div>

        {/* Graphique simplifié */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Périscolaire par semaine</h3>
          <div className="flex items-end gap-2 h-32">
            {MOCK_STATS.periscolaire.parSemaine.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-400 rounded-t"
                  style={{ height: `${(s.total / 40) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{s.semaine}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Préinscriptions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">📝 Statistiques Préinscriptions</h2>
          <button
            onClick={() => exportCSV("preinscriptions")}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📥 Exporter CSV
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{MOCK_STATS.preinscriptions.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{MOCK_STATS.preinscriptions.enAttente}</p>
            <p className="text-sm text-yellow-500">⏳ En attente</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{MOCK_STATS.preinscriptions.valides}</p>
            <p className="text-sm text-green-500">✅ Validés</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{MOCK_STATS.preinscriptions.refuses}</p>
            <p className="text-sm text-red-500">❌ Refusés</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{MOCK_STATS.preinscriptions.annules}</p>
            <p className="text-sm text-gray-400">🚫 Annulés</p>
          </div>
        </div>
      </div>

      {/* Section Effectifs */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">🎓 Effectifs par niveau</h2>
          <button
            onClick={() => exportCSV("eleves")}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📥 Exporter CSV
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-sky-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-sky-600">{MOCK_STATS.eleves.total}</p>
            <p className="text-sm text-sky-500">Total élèves</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-pink-600">{MOCK_STATS.eleves.maternelle}</p>
            <p className="text-sm text-pink-500">🎨 Maternelle</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{MOCK_STATS.eleves.primaire}</p>
            <p className="text-sm text-blue-500">📖 Primaire</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{MOCK_STATS.eleves.college}</p>
            <p className="text-sm text-violet-500">📚 Collège</p>
          </div>
        </div>
      </div>
    </div>
  );
}

