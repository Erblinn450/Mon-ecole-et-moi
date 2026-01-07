"use client";

import { useState, useEffect } from "react";
import { 
  UtensilsCrossed, 
  Calendar, 
  Search, 
  Loader2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Leaf
} from "lucide-react";
import { repasApi } from "@/lib/api";
import { Repas, TypeRepas } from "@/types";

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function AdminRepasPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [repas, setRepas] = useState<Repas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les repas pour la date sélectionnée
  useEffect(() => {
    const fetchRepas = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await repasApi.getByDate(selectedDate);
        setRepas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setRepas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepas();
  }, [selectedDate]);

  // Stats
  const stats = {
    total: repas.length,
    midi: repas.filter((r) => r.type === TypeRepas.MIDI).length,
    gouter: repas.filter((r) => r.type === TypeRepas.GOUTER).length,
  };

  // Générer les jours du mois
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

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <UtensilsCrossed size={20} className="text-white" />
          </div>
          Gestion des repas
        </h1>
        <p className="text-gray-500 mt-1">Consultez les commandes de repas par jour</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-sm font-semibold text-gray-900">
                {MOIS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                  )
                }
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["L", "M", "M", "J", "V", "S", "D"].map((jour, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                  {jour}
                </div>
              ))}
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={idx} className="aspect-square" />;
                }

                const dateStr = formatDate(day);
                const isSelected = dateStr === selectedDate;
                const isWeekendDay = isWeekend(day);
                const isToday = dateStr === new Date().toISOString().split("T")[0];

                return (
                  <button
                    key={idx}
                    onClick={() => !isWeekendDay && setSelectedDate(dateStr)}
                    disabled={isWeekendDay}
                    className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-500 text-white"
                        : isToday
                        ? "bg-amber-100 text-amber-700"
                        : isWeekendDay
                        ? "text-gray-300 cursor-not-allowed"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste des repas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats du jour */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <p className="text-sm text-amber-700">Repas midi</p>
              <p className="text-2xl font-bold text-amber-800">{stats.midi}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <p className="text-sm text-emerald-700">Goûters</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.gouter}</p>
            </div>
          </div>

          {/* Date sélectionnée */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <Calendar size={20} className="text-amber-600" />
            <p className="font-medium text-amber-800">
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 size={32} className="animate-spin text-amber-600" />
              </div>
            ) : error ? (
              <div className="p-6 flex items-center gap-3 text-rose-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            ) : repas.length === 0 ? (
              <div className="p-12 text-center">
                <UtensilsCrossed size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun repas commandé pour cette date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Enfant</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repas.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 font-semibold text-sm">
                              {r.enfant?.prenom?.[0] || "?"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {r.enfant?.prenom} {r.enfant?.nom}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            r.type === TypeRepas.MIDI
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {r.type === TypeRepas.GOUTER && <Leaf size={12} />}
                            {r.type === TypeRepas.MIDI ? "Midi" : "Goûter"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

