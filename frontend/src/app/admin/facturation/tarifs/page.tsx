"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { facturationApi } from "@/lib/api";
import { ConfigTarif } from "@/types";

const categorieLabels: Record<string, string> = {
  SCOLARITE: "Scolarité",
  INSCRIPTION: "Inscription",
  FONCTIONNEMENT: "Matériel pédagogique",
  FRATRIE: "Réductions fratrie",
  REPAS: "Repas",
  PERISCOLAIRE: "Périscolaire",
};

const categorieOrder = ["SCOLARITE", "INSCRIPTION", "FONCTIONNEMENT", "FRATRIE", "REPAS", "PERISCOLAIRE"];

const cleLabels: Record<string, string> = {
  SCOLARITE_MENSUEL: "Scolarité mensuelle (maternelle/élémentaire)",
  SCOLARITE_FRATRIE_MENSUEL: "Scolarité mensuelle fratrie",
  SCOLARITE_COLLEGE_MENSUEL: "Scolarité mensuelle collège",
  SCOLARITE_COLLEGE_FRATRIE_MENSUEL: "Scolarité mensuelle collège fratrie",
  SCOLARITE_TRIMESTRIEL: "Scolarité trimestrielle",
  SCOLARITE_FRATRIE_TRIMESTRIEL: "Scolarité trimestrielle fratrie",
  SCOLARITE_COLLEGE_TRIMESTRIEL: "Scolarité trimestrielle collège",
  SCOLARITE_COLLEGE_FRATRIE_TRIMESTRIEL: "Scolarité trimestrielle collège fratrie",
  SCOLARITE_SEMESTRIEL: "Scolarité semestrielle",
  SCOLARITE_FRATRIE_SEMESTRIEL: "Scolarité semestrielle fratrie",
  SCOLARITE_COLLEGE_SEMESTRIEL: "Scolarité semestrielle collège",
  SCOLARITE_COLLEGE_FRATRIE_SEMESTRIEL: "Scolarité semestrielle collège fratrie",
  SCOLARITE_ANNUEL: "Scolarité annuelle",
  SCOLARITE_FRATRIE_ANNUEL: "Scolarité annuelle fratrie",
  SCOLARITE_COLLEGE_ANNUEL: "Scolarité annuelle collège",
  SCOLARITE_COLLEGE_FRATRIE_ANNUEL: "Scolarité annuelle collège fratrie",
  INSCRIPTION_PREMIERE_ANNEE: "Inscription 1ère année",
  INSCRIPTION_FRATRIE_PREMIERE: "Inscription 1ère année fratrie",
  INSCRIPTION_ANNEES_SUIVANTES: "Réinscription",
  INSCRIPTION_FRATRIE_SUIVANTES: "Réinscription fratrie",
  FONCTIONNEMENT_MATERNELLE: "Matériel maternelle",
  FONCTIONNEMENT_ELEMENTAIRE: "Matériel élémentaire",
  FONCTIONNEMENT_COLLEGE: "Matériel collège",
  REPAS_MIDI: "Repas midi (unitaire)",
  PERISCOLAIRE_SEANCE: "Périscolaire (unitaire)",
  REDUCTION_FRATRIE_POURCENTAGE: "Réduction fratrie (maternelle/élémentaire)",
  REDUCTION_FRATRIE_COLLEGE_POURCENTAGE: "Réduction fratrie (collège)",
};

function getAnneeScolaireOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Si on est en septembre ou après, l'année scolaire courante est year-year+1
  const currentYear = month >= 8 ? year : year - 1;
  return [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];
}

export default function AdminTarifsPage() {
  const [tarifs, setTarifs] = useState<ConfigTarif[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anneeScolaire, setAnneeScolaire] = useState(() => {
    const options = getAnneeScolaireOptions();
    return options[1]; // Année courante
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadTarifs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await facturationApi.getConfigTarifs(anneeScolaire);
      setTarifs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, [anneeScolaire]);

  useEffect(() => {
    loadTarifs();
  }, [loadTarifs]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (tarif: ConfigTarif) => {
    setEditingId(tarif.id);
    setEditValue(String(tarif.valeur));
  };

  const handleSave = async (tarif: ConfigTarif) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      alert("Valeur invalide");
      return;
    }
    setIsSaving(true);
    try {
      await facturationApi.updateConfigTarif(tarif.id, { valeur: newValue });
      setEditingId(null);
      await loadTarifs();
      showSuccess(`${cleLabels[tarif.cle] || tarif.cle} mis à jour`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm(`Initialiser les tarifs par défaut pour ${anneeScolaire} ?\n\nAttention : les tarifs existants seront réinitialisés à leurs valeurs par défaut.`)) return;
    setIsSeeding(true);
    try {
      const result = await facturationApi.seedDefaultTarifs(anneeScolaire);
      await loadTarifs();
      showSuccess(`${result.created} tarifs initialisés pour ${anneeScolaire}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsSeeding(false);
    }
  };

  // Grouper par catégorie
  const tarifsByCategorie = tarifs.reduce<Record<string, ConfigTarif[]>>((acc, t) => {
    const cat = t.categorie || "AUTRE";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const sortedCategories = Object.keys(tarifsByCategorie).sort((a, b) => {
    const ia = categorieOrder.indexOf(a);
    const ib = categorieOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/facturation"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft size={14} />
            Retour à la facturation
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Settings size={20} className="text-white" />
            </div>
            Configuration des tarifs
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={anneeScolaire}
            onChange={(e) => setAnneeScolaire(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
          >
            {getAnneeScolaireOptions().map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Initialiser tarifs par défaut
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 flex items-center gap-2">
          <Check size={18} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {tarifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Settings size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Aucun tarif configuré</h3>
          <p className="text-gray-400 mt-1">
            Cliquez sur &quot;Initialiser tarifs par défaut&quot; pour créer les tarifs de l&apos;année {anneeScolaire}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((categorie) => (
            <div key={categorie} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {categorieLabels[categorie] || categorie}
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {tarifsByCategorie[categorie].map((tarif) => (
                  <div key={tarif.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {cleLabels[tarif.cle] || tarif.cle}
                      </p>
                      {tarif.description && (
                        <p className="text-sm text-gray-400">{tarif.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {editingId === tarif.id ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSave(tarif); if (e.key === "Escape") setEditingId(null); }}
                            className="w-32 px-3 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-right font-mono"
                            autoFocus
                          />
                          <span className="text-gray-400">{tarif.categorie === "FRATRIE" ? "%" : "€"}</span>
                          <button
                            onClick={() => handleSave(tarif)}
                            disabled={isSaving}
                            className="p-2 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(tarif)}
                          className="px-4 py-2 rounded-lg text-right font-mono font-semibold text-gray-900 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        >
                          {Number(tarif.valeur).toFixed(2)} {tarif.categorie === "FRATRIE" ? "%" : "€"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
