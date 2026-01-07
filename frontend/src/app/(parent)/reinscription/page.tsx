"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Enfant {
  id: number;
  nom: string;
  prenom: string;
  classe: string;
  dateNaissance: string;
}

interface EnfantReinscription {
  enfantId: number;
  classeProchaine: string;
}

// Données mock
const MOCK_ENFANTS: Enfant[] = [
  { id: 1, nom: "Dupont", prenom: "Lucas", classe: "MS", dateNaissance: "2020-05-15" },
  { id: 2, nom: "Dupont", prenom: "Emma", classe: "CP", dateNaissance: "2018-09-22" },
];

const CLASSES = [
  { group: "🎨 Maternelle", options: [
    { value: "PS", label: "Petite Section (PS)" },
    { value: "MS", label: "Moyenne Section (MS)" },
    { value: "GS", label: "Grande Section (GS)" },
  ]},
  { group: "📖 Primaire", options: [
    { value: "CP", label: "CP" },
    { value: "CE1", label: "CE1" },
    { value: "CE2", label: "CE2" },
    { value: "CM1", label: "CM1" },
    { value: "CM2", label: "CM2" },
  ]},
  { group: "📚 Collège", options: [
    { value: "6eme", label: "6ème" },
    { value: "5eme", label: "5ème" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
  ]},
];

// Fonction pour déterminer la classe suivante
function getClasseSuivante(classeActuelle: string): string {
  const progression: { [key: string]: string } = {
    "PS": "MS",
    "MS": "GS",
    "GS": "CP",
    "CP": "CE1",
    "CE1": "CE2",
    "CE2": "CM1",
    "CM1": "CM2",
    "CM2": "6eme",
    "6eme": "5eme",
    "5eme": "4eme",
    "4eme": "3eme",
    "3eme": "3eme", // Fin du collège
  };
  return progression[classeActuelle] || classeActuelle;
}

export default function ReinscriptionPage() {
  const [enfants] = useState<Enfant[]>(MOCK_ENFANTS);
  const [selectedEnfants, setSelectedEnfants] = useState<EnfantReinscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialiser avec les classes suivantes par défaut
  useEffect(() => {
    const initialSelection = enfants.map(e => ({
      enfantId: e.id,
      classeProchaine: getClasseSuivante(e.classe)
    }));
    setSelectedEnfants(initialSelection);
  }, [enfants]);

  const toggleEnfant = (enfantId: number, checked: boolean) => {
    if (checked) {
      const enfant = enfants.find(e => e.id === enfantId);
      if (enfant) {
        setSelectedEnfants([...selectedEnfants, {
          enfantId,
          classeProchaine: getClasseSuivante(enfant.classe)
        }]);
      }
    } else {
      setSelectedEnfants(selectedEnfants.filter(e => e.enfantId !== enfantId));
    }
  };

  const updateClasseProchaine = (enfantId: number, classe: string) => {
    setSelectedEnfants(selectedEnfants.map(e => 
      e.enfantId === enfantId ? { ...e, classeProchaine: classe } : e
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEnfants.length === 0) {
      alert("Veuillez sélectionner au moins un enfant à réinscrire.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal de succès
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            Demande envoyée !
          </h2>
          <p className="text-gray-600 mb-2">
            Votre demande de réinscription a été enregistrée.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            L&apos;administration va examiner votre demande et vous contactera prochainement.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🔄 Réinscription</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Retour
          </Link>
        </div>
        <p className="text-gray-500 mt-1">
          Réinscrire vos enfants pour l&apos;année scolaire prochaine
        </p>
      </div>

      {/* Alerte info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          ℹ️ <strong>Information :</strong> Utilisez ce formulaire pour réinscrire vos enfants 
          déjà scolarisés dans notre école pour l&apos;année scolaire prochaine.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🧒 Enfant(s) à réinscrire
          </h2>

          {enfants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun enfant inscrit dans votre compte.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enfants.map((enfant) => {
                const isSelected = selectedEnfants.some(e => e.enfantId === enfant.id);
                const selection = selectedEnfants.find(e => e.enfantId === enfant.id);
                
                return (
                  <div
                    key={enfant.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected ? "border-emerald-500 bg-emerald-50/50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id={`enfant-${enfant.id}`}
                        checked={isSelected}
                        onChange={(e) => toggleEnfant(enfant.id, e.target.checked)}
                        className="mt-1 w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`enfant-${enfant.id}`}
                          className="font-semibold text-gray-800 cursor-pointer"
                        >
                          {enfant.prenom} {enfant.nom}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          Classe actuelle : <strong>{enfant.classe}</strong> | 
                          Date de naissance : {new Date(enfant.dateNaissance).toLocaleDateString("fr-FR")}
                        </p>

                        {isSelected && (
                          <div className="mt-4 bg-white rounded-lg p-3 border">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Classe souhaitée pour l&apos;année prochaine <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selection?.classeProchaine || ""}
                              onChange={(e) => updateClasseProchaine(enfant.id, e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="">-- Sélectionnez --</option>
                              {CLASSES.map((group) => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              💡 Classe suggérée : {getClasseSuivante(enfant.classe)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        {selectedEnfants.length > 0 && (
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-2">📋 Récapitulatif</h3>
            <ul className="space-y-1">
              {selectedEnfants.map((sel) => {
                const enfant = enfants.find(e => e.id === sel.enfantId);
                return (
                  <li key={sel.enfantId} className="text-emerald-700 text-sm">
                    • <strong>{enfant?.prenom} {enfant?.nom}</strong> : {enfant?.classe} → {sel.classeProchaine}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Bouton soumettre */}
        <button
          type="submit"
          disabled={isLoading || selectedEnfants.length === 0}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Envoi en cours...
            </span>
          ) : (
            "📤 Envoyer la demande de réinscription"
          )}
        </button>
      </form>
    </div>
  );
}

