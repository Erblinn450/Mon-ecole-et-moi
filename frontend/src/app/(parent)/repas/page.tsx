"use client";

import { useState, useMemo } from "react";
import { 
  UtensilsCrossed, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Leaf,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Euro
} from "lucide-react";
import { useEnfants } from "@/hooks/useEnfants";
import { useRepas } from "@/hooks/useRepas";
import { TypeRepas } from "@/types";
import { TARIFS, ORGANISATION, formatPrix } from "@/config/tarifs";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
// Jours fermés : Dimanche (0), Mercredi (3), Samedi (6)
const JOURS_FERMES = ORGANISATION.joursFermes;
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function CommanderRepasPage() {
  const [selectedEnfantId, setSelectedEnfantId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [typeRepas, setTypeRepas] = useState<TypeRepas>(TypeRepas.MIDI);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Hooks
  const { enfants, isLoading: enfantsLoading, error: enfantsError } = useEnfants();
  const mois = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const { repas, isLoading: repasLoading, commanderRepas, annulerRepas } = useRepas(selectedEnfantId, mois);

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
    return repas.some((r) => r.dateRepas.split("T")[0] === dateStr);
  };

  const getRepasForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return repas.find((r) => r.dateRepas.split("T")[0] === dateStr);
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
      await commanderRepas(selectedDates, typeRepas);
      setSuccessMessage(`${selectedDates.length} repas commandé(s) avec succès !`);
      setSelectedDates([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnuler = async (repasId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce repas ?")) return;

    try {
      await annulerRepas(repasId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedEnfant = enfants.find((e) => e.id === selectedEnfantId);

  if (enfantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
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
        <p className="text-gray-500">Vous devez avoir au moins un enfant inscrit pour commander des repas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <UtensilsCrossed size={20} className="text-white" />
          </div>
          Commander repas
        </h1>
        <p className="text-gray-500 mt-2">
          Sélectionnez les jours pour commander les repas de vos enfants
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
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div className="text-sm text-amber-800">
            <p className="mb-1">
              <strong>Date limite :</strong> Les commandes doivent être passées
              avant <strong>jeudi 23h59</strong> de la semaine précédente.
            </p>
            <p className="flex items-center gap-1">
              <Euro size={14} />
              <strong>Tarif repas midi :</strong> {formatPrix(TARIFS.repas.midi, "/repas")} (traiteur)
            </p>
            <p className="text-xs text-amber-600 mt-1">
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
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
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
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                        : isBooked
                        ? "bg-amber-100 text-amber-700 cursor-not-allowed"
                        : isSelectable
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {day.getDate()}
                    {isBooked && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {repasLoading && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              </div>
            )}

            {/* Légende */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
                <span className="text-gray-600">Disponible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-teal-500" />
                <span className="text-gray-600">Sélectionné</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200" />
                <span className="text-gray-600">Déjà commandé</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                <span className="text-gray-600">Indisponible</span>
              </div>
            </div>
          </div>

          {/* Type de repas */}
          {selectedDates.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-gray-400" />
                Type de repas
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setTypeRepas(TypeRepas.MIDI)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    typeRepas === TypeRepas.MIDI
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    typeRepas === TypeRepas.MIDI ? "bg-emerald-100" : "bg-gray-100"
                  }`}>
                    <UtensilsCrossed size={20} className={typeRepas === TypeRepas.MIDI ? "text-emerald-600" : "text-gray-500"} />
                  </div>
                  <span className="font-medium">Repas midi</span>
                </button>
                <button
                  onClick={() => setTypeRepas(TypeRepas.GOUTER)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    typeRepas === TypeRepas.GOUTER
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    typeRepas === TypeRepas.GOUTER ? "bg-emerald-100" : "bg-gray-100"
                  }`}>
                    <Leaf size={20} className={typeRepas === TypeRepas.GOUTER ? "text-emerald-600" : "text-gray-500"} />
                  </div>
                  <span className="font-medium">Goûter</span>
                </button>
              </div>
            </div>
          )}
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
                Cliquez sur les dates pour sélectionner les repas
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Enfant</span>
                    <span className="font-medium">{selectedEnfant?.prenom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Repas sélectionnés</span>
                    <span className="font-medium">{selectedDates.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">
                      {typeRepas === TypeRepas.MIDI ? "Midi" : "Goûter"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix unitaire</span>
                    <span className="font-medium">{formatPrix(TARIFS.repas.midi)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Total estimé</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {formatPrix(selectedDates.length * TARIFS.repas.midi)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <p className="text-sm text-gray-500 mb-2">Dates sélectionnées :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.sort().map((date) => (
                      <span
                        key={date}
                        className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg font-medium"
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
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {isSubmitting ? "Envoi..." : "Valider la commande"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Commandes existantes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-gray-400" />
          Mes commandes de repas
        </h2>

        {repas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune commande pour ce mois
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Enfant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {repas.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-4">
                      {new Date(r.dateRepas).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {selectedEnfant?.prenom} {selectedEnfant?.nom}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        r.type === TypeRepas.MIDI
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {r.type === TypeRepas.GOUTER && <Leaf size={12} />}
                        {r.type === TypeRepas.MIDI ? "Midi" : "Goûter"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAnnuler(r.id)}
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

