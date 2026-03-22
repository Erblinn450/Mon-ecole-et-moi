"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reinscriptionsApi, EnfantReinscription } from "@/lib/api";

interface EnfantSelection {
  enfantId: number;
  classeSouhaitee: string;
}

// Classes multi-âges Montessori (cohérent avec le reste de l'application)
const CLASSES = [
  { group: "Classes multi-âges Montessori", options: [
    { value: "MATERNELLE", label: "Maison des enfants (3-6 ans)" },
    { value: "ELEMENTAIRE", label: "Élémentaire (6-12 ans, CP au CM2)" },
  ]},
];

const CLASSE_LABELS: Record<string, string> = {
  MATERNELLE: "Maison des enfants (3-6 ans)",
  ELEMENTAIRE: "Élémentaire (6-12 ans)",
  COLLEGE: "Collège",
};

// Fonction pour déterminer la classe suivante dans la progression Montessori
function getClasseSuivante(classeActuelle: string | null): string {
  if (!classeActuelle) return "";
  const progression: Record<string, string> = {
    MATERNELLE: "ELEMENTAIRE",
    ELEMENTAIRE: "ELEMENTAIRE", // Reste en élémentaire par défaut
  };
  return progression[classeActuelle] || classeActuelle;
}

export default function ReinscriptionPage() {
  const [enfants, setEnfants] = useState<EnfantReinscription[]>([]);
  const [anneeScolaire, setAnneeScolaire] = useState<string>("");
  const [selectedEnfants, setSelectedEnfants] = useState<EnfantSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnfants();
  }, []);

  const loadEnfants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reinscriptionsApi.getMesEnfants();
      setEnfants(data.enfants);
      setAnneeScolaire(data.anneeScolaire);

      // Pré-sélectionner les enfants éligibles (sans réinscription existante)
      const eligibles = data.enfants
        .filter(e => e.inscriptionActive && !e.reinscriptionStatut)
        .map(e => ({
          enfantId: e.id,
          classeSouhaitee: getClasseSuivante(e.classe)
        }));
      setSelectedEnfants(eligibles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEnfant = (enfantId: number, checked: boolean) => {
    if (checked) {
      const enfant = enfants.find(e => e.id === enfantId);
      if (enfant) {
        setSelectedEnfants([...selectedEnfants, {
          enfantId,
          classeSouhaitee: getClasseSuivante(enfant.classe)
        }]);
      }
    } else {
      setSelectedEnfants(selectedEnfants.filter(e => e.enfantId !== enfantId));
    }
  };

  const updateClasseSouhaitee = (enfantId: number, classe: string) => {
    setSelectedEnfants(selectedEnfants.map(e =>
      e.enfantId === enfantId ? { ...e, classeSouhaitee: classe } : e
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEnfants.length === 0) {
      setError("Veuillez sélectionner au moins un enfant à réinscrire.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reinscriptionsApi.createBulk(selectedEnfants);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

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
            Votre demande de réinscription a été enregistrée pour l&apos;année {anneeScolaire}.
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

  // Filtrer les enfants éligibles (avec inscription active et sans réinscription déjà faite)
  const enfantsEligibles = enfants.filter(e => e.inscriptionActive && !e.reinscriptionStatut);
  const enfantsDejaReinscrits = enfants.filter(e => e.reinscriptionStatut);

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🔄 Réinscription {anneeScolaire}</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Retour
          </Link>
        </div>
        <p className="text-gray-500 mt-1">
          Réinscrire vos enfants pour l&apos;année scolaire {anneeScolaire}
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Alerte info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          ℹ️ <strong>Réinscription rapide :</strong> Sélectionnez les enfants à réinscrire et validez en 3 clics !
          Si vous ne souhaitez pas réinscrire un enfant, ne le sélectionnez pas et appelez-nous.
        </p>
      </div>

      {/* Enfants déjà réinscrits */}
      {enfantsDejaReinscrits.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-emerald-800 mb-2">✅ Déjà réinscrit(s)</h3>
          <ul className="space-y-1">
            {enfantsDejaReinscrits.map(enfant => (
              <li key={enfant.id} className="text-emerald-700 text-sm">
                • {enfant.prenom} {enfant.nom} - Statut: <span className="font-medium">{enfant.reinscriptionStatut}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulaire */}
      {enfantsEligibles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Aucun enfant à réinscrire</h2>
          <p className="text-gray-500">
            {enfants.length === 0
              ? "Vous n'avez pas encore d'enfant inscrit dans notre établissement."
              : "Tous vos enfants ont déjà une demande de réinscription en cours."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🧒 Enfant(s) à réinscrire
            </h2>

            <div className="space-y-4">
              {enfantsEligibles.map((enfant) => {
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
                          Classe actuelle : <strong>{CLASSE_LABELS[enfant.classe || ""] || enfant.classe || "Non définie"}</strong>
                          {enfant.dateNaissance && (
                            <> | Date de naissance : {new Date(enfant.dateNaissance).toLocaleDateString("fr-FR")}</>
                          )}
                        </p>

                        {isSelected && (
                          <div className="mt-4 bg-white rounded-lg p-3 border">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Classe souhaitée pour {anneeScolaire} <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selection?.classeSouhaitee || ""}
                              onChange={(e) => updateClasseSouhaitee(enfant.id, e.target.value)}
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
                              Classe suggérée : {CLASSE_LABELS[getClasseSuivante(enfant.classe)] || getClasseSuivante(enfant.classe) || "À définir"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                      • <strong>{enfant?.prenom} {enfant?.nom}</strong> : {CLASSE_LABELS[enfant?.classe || ""] || enfant?.classe || "?"} → {CLASSE_LABELS[sel.classeSouhaitee] || sel.classeSouhaitee}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Bouton soumettre */}
          <button
            type="submit"
            disabled={isSubmitting || selectedEnfants.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? (
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
      )}
    </div>
  );
}
