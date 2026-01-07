"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Edit, 
  Loader2,
  AlertCircle,
  Users,
  ChevronDown,
  X,
  Check
} from "lucide-react";
import { useAdminEnfants } from "@/hooks/useEnfants";
import { Enfant, Classe } from "@/types";

const classeLabels: Record<Classe, string> = {
  [Classe.MATERNELLE]: "Maternelle",
  [Classe.ELEMENTAIRE]: "Élémentaire",
  [Classe.COLLEGE]: "Collège",
};

const classeColors: Record<Classe, { bg: string; text: string }> = {
  [Classe.MATERNELLE]: { bg: "bg-pink-100", text: "text-pink-700" },
  [Classe.ELEMENTAIRE]: { bg: "bg-sky-100", text: "text-sky-700" },
  [Classe.COLLEGE]: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

export default function AdminElevesPage() {
  const [filterClasse, setFilterClasse] = useState<Classe | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnfant, setSelectedEnfant] = useState<Enfant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editClasse, setEditClasse] = useState<Classe | "">("");

  const { enfants, isLoading, error, updateEnfant, refetch } = useAdminEnfants(
    filterClasse || undefined
  );

  // Filtrer par recherche
  const filteredEnfants = enfants.filter((e) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.nom.toLowerCase().includes(query) ||
      e.prenom.toLowerCase().includes(query)
    );
  });

  // Stats
  const stats = {
    total: enfants.length,
    maternelle: enfants.filter((e) => e.classe === Classe.MATERNELLE).length,
    elementaire: enfants.filter((e) => e.classe === Classe.ELEMENTAIRE).length,
    college: enfants.filter((e) => e.classe === Classe.COLLEGE).length,
    nonAssigne: enfants.filter((e) => !e.classe).length,
  };

  const openEditModal = (enfant: Enfant) => {
    setSelectedEnfant(enfant);
    setEditClasse(enfant.classe || "");
    setIsModalOpen(true);
  };

  const handleUpdateClasse = async () => {
    if (!selectedEnfant) return;

    setIsUpdating(true);
    try {
      await updateEnfant(selectedEnfant.id, { classe: editClasse || undefined });
      setIsModalOpen(false);
      setSelectedEnfant(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
        <AlertCircle className="text-rose-500" size={24} />
        <div>
          <p className="font-medium text-rose-800">Erreur de chargement</p>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          Gestion des élèves
        </h1>
        <p className="text-gray-500 mt-1">Gérez les élèves et leurs affectations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 p-4">
          <p className="text-sm text-pink-700">Maternelle</p>
          <p className="text-2xl font-bold text-pink-800">{stats.maternelle}</p>
        </div>
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
          <p className="text-sm text-sky-700">Élémentaire</p>
          <p className="text-2xl font-bold text-sky-800">{stats.elementaire}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <p className="text-sm text-emerald-700">Collège</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.college}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-700">Non assigné</p>
          <p className="text-2xl font-bold text-amber-800">{stats.nonAssigne}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou prénom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value as Classe | "")}
            className="pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors appearance-none bg-white"
          >
            <option value="">Toutes les classes</option>
            <option value={Classe.MATERNELLE}>Maternelle</option>
            <option value={Classe.ELEMENTAIRE}>Élémentaire</option>
            <option value={Classe.COLLEGE}>Collège</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredEnfants.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun élève trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Élève</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date de naissance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Classe</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnfants.map((enfant) => (
                  <tr key={enfant.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 font-semibold">
                          {enfant.prenom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enfant.prenom} {enfant.nom}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {enfant.dateNaissance 
                        ? new Date(enfant.dateNaissance).toLocaleDateString("fr-FR")
                        : "Non renseignée"
                      }
                    </td>
                    <td className="py-3 px-4">
                      {enfant.classe ? (
                        <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${classeColors[enfant.classe].bg} ${classeColors[enfant.classe].text}`}>
                          {classeLabels[enfant.classe]}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditModal(enfant)}
                        className="p-2 rounded-lg hover:bg-violet-100 text-violet-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal édition */}
      {isModalOpen && selectedEnfant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Modifier l&apos;élève</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Élève</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedEnfant.prenom} {selectedEnfant.nom}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe
                </label>
                <select
                  value={editClasse}
                  onChange={(e) => setEditClasse(e.target.value as Classe | "")}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                >
                  <option value="">Non assigné</option>
                  <option value={Classe.MATERNELLE}>Maternelle</option>
                  <option value={Classe.ELEMENTAIRE}>Élémentaire</option>
                  <option value={Classe.COLLEGE}>Collège</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateClasse}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

