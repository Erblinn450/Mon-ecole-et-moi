"use client";

import { useState, useMemo } from "react";
import { 
  Palette, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Check,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Sun,
  Euro
} from "lucide-react";
import { useEnfants } from "@/hooks/useEnfants";
import { usePeriscolaire } from "@/hooks/usePeriscolaire";
import { TARIFS, ORGANISATION, formatPrix } from "@/config/tarifs";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
// Jours fermés : Dimanche (0), Mercredi (3), Samedi (6)
const JOURS_FERMES = ORGANISATION.joursFermes;
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function PeriscolairePage() {
  const [selectedEnfantId, setSelectedEnfantId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Hooks
  const { enfants, isLoading: enfantsLoading, error: enfantsError } = useEnfants();
  const mois = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const { periscolaires, isLoading: periscolaireLoading, commanderPeriscolaire, annulerPeriscolaire } = usePeriscolaire(selectedEnfantId, mois);

  // Auto-sélectionner le premier enfant
  useMemo(() => {
    if (enfants.length > 0 && !selectedEnfantId) {
      setSelectedEnfantId(enfants[0].id);
    }
  }, [enfants, selectedEnfantId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    const startDay = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Jours fermés : Dimanche (0), Mercredi (3), Samedi (6)
    // L'école fonctionne sur 4 jours : Lundi, Mardi, Jeudi, Vendredi
    if (JOURS_FERMES.includes(date.getDay())) return false;
    return date >= nextWeek;
  };

  const isDateAlreadyBooked = (date: Date) => {
    const dateStr = formatDate(date);
    return periscolaires.some((p) => p.datePeriscolaire.split("T")[0] === dateStr);
  };

  const getPeriscolaireForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return periscolaires.find((p) => p.datePeriscolaire.split("T")[0] === dateStr);
  };

  const toggleDate = (date: Date) => {
    const dateStr = formatDate(date);
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEnfantId || selectedDates.length === 0) return;

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      await commanderPeriscolaire(selectedDates);
      setSuccessMessage(`${selectedDates.length} jour(s) réservé(s) avec succès !`);
      setSelectedDates([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnuler = async (periscolaireId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    try {
      await annulerPeriscolaire(periscolaireId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedEnfant = enfants.find((e) => e.id === selectedEnfantId);

  if (enfantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (enfantsError) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
        <AlertCircle className="text-rose-500" size={24} />
        <div>
          <p className="font-medium text-rose-800">Erreur de chargement</p>
          <p className="text-sm text-rose-600">{enfantsError}</p>
        </div>
      </div>
    );
  }

  if (enfants.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun enfant inscrit</h2>
        <p className="text-gray-500">Vous devez avoir au moins un enfant inscrit pour réserver le périscolaire.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Palette size={20} className="text-white" />
          </div>
          Périscolaire
        </h1>
        <p className="text-gray-500 mt-2">
          Réservez les jours de garderie et activités périscolaires
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <Check className="text-emerald-500" size={20} />
          <p className="text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* Info Alert */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sun size={18} className="text-violet-600" />
          </div>
          <div className="text-sm text-violet-800">
            <p className="mb-1">
              <strong>Horaires :</strong> Le périscolaire est disponible de {ORGANISATION.periscolaire.debut} à {ORGANISATION.periscolaire.fin} (garderie + goûter inclus).
            </p>
            <p className="flex items-center gap-1">
              <Euro size={14} />
              <strong>Tarif :</strong> {formatPrix(TARIFS.periscolaire.seance, "/séance")}
            </p>
            <p className="text-xs text-violet-600 mt-1">
              📅 École ouverte : Lundi, Mardi, Jeudi, Vendredi (fermée le mercredi)
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sélection enfant */}
          {enfants.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                Sélectionner l&apos;enfant
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {enfants.map((enfant) => (
                  <button
                    key={enfant.id}
                    onClick={() => {
                      setSelectedEnfantId(enfant.id);
                      setSelectedDates([]);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedEnfantId === enfant.id
                        ? "border-violet-500 bg-violet-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {enfant.prenom} {enfant.nom}
                    </p>
                    <p className="text-sm text-gray-500">{enfant.classe || "Non assigné"}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendrier */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                  )
                }
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MOIS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                  )
                }
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* En-têtes jours */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {JOURS.map((jour) => (
                <div
                  key={jour}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {jour}
                </div>
              ))}
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={idx} className="aspect-square" />;
                }

                const dateStr = formatDate(day);
                const isSelected = selectedDates.includes(dateStr);
                const isBooked = isDateAlreadyBooked(day);
                const isSelectable = isDateSelectable(day) && selectedEnfantId;

                return (
                  <button
                    key={idx}
                    onClick={() => isSelectable && !isBooked && toggleDate(day)}
                    disabled={!isSelectable || isBooked}
                    className={`aspect-square rounded-xl text-sm font-medium transition-all relative ${
                      isSelected
                        ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg scale-105"
                        : isBooked
                        ? "bg-violet-100 text-violet-700 cursor-not-allowed"
                        : isSelectable
                        ? "bg-violet-50 text-violet-700 hover:bg-violet-100 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {day.getDate()}
                    {isBooked && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {periscolaireLoading && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-violet-600" />
              </div>
            )}

            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-violet-50 border border-violet-200" />
                <span className="text-gray-600">Disponible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-purple-500" />
                <span className="text-gray-600">Sélectionné</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-violet-100 border border-violet-200" />
                <span className="text-gray-600">Déjà réservé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-gray-400" />
              Récapitulatif
            </h2>

            {!selectedEnfantId ? (
              <p className="text-gray-500 text-sm">
                Sélectionnez un enfant pour commencer
              </p>
            ) : selectedDates.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Cliquez sur les dates pour réserver le périscolaire
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Enfant</span>
                    <span className="font-medium">{selectedEnfant?.prenom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jours sélectionnés</span>
                    <span className="font-medium">{selectedDates.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix unitaire</span>
                    <span className="font-medium">{formatPrix(TARIFS.periscolaire.seance)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-violet-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-violet-700 font-medium">Total estimé</span>
                    <span className="text-xl font-bold text-violet-700">
                      {formatPrix(selectedDates.length * TARIFS.periscolaire.seance)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <p className="text-sm text-gray-500 mb-2">Dates sélectionnées :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.sort().map((date) => (
                      <span
                        key={date}
                        className="px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded-lg font-medium"
                      >
                        {new Date(date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {isSubmitting ? "Envoi..." : "Valider la réservation"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Réservations existantes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-gray-400" />
          Mes réservations périscolaire
        </h2>

        {periscolaires.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune réservation pour ce mois
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Enfant</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periscolaires.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-4">
                      {new Date(p.datePeriscolaire).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {selectedEnfant?.prenom} {selectedEnfant?.nom}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAnnuler(p.id)}
                        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-sm font-medium"
                      >
                        <X size={14} />
                        Annuler
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

