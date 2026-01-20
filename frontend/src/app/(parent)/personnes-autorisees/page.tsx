"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Trash2,
  Edit2,
  Phone,
  Loader2,
  AlertCircle,
  Check,
  X,
  Plus,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PersonneAutorisee {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  lienParente?: string;
}

interface EnfantPersonnes {
  enfantId: number;
  enfantNom: string;
  personnesAutorisees: PersonneAutorisee[];
}

export default function PersonnesAutoriseesPage() {
  const [data, setData] = useState<EnfantPersonnes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPersonne, setEditingPersonne] = useState<PersonneAutorisee | null>(null);
  const [selectedEnfantId, setSelectedEnfantId] = useState<number | null>(null);

  // Form state
  const [formNom, setFormNom] = useState("");
  const [formPrenom, setFormPrenom] = useState("");
  const [formTelephone, setFormTelephone] = useState("");
  const [formLienParente, setFormLienParente] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/personnes-autorisees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur de chargement");

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = (enfantId: number) => {
    setSelectedEnfantId(enfantId);
    setEditingPersonne(null);
    setFormNom("");
    setFormPrenom("");
    setFormTelephone("");
    setFormLienParente("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (enfantId: number, personne: PersonneAutorisee) => {
    setSelectedEnfantId(enfantId);
    setEditingPersonne(personne);
    setFormNom(personne.nom);
    setFormPrenom(personne.prenom);
    setFormTelephone(personne.telephone);
    setFormLienParente(personne.lienParente || "");
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");

    try {
      const token = localStorage.getItem("auth_token");
      const url = editingPersonne
        ? `${API_URL}/personnes-autorisees/${editingPersonne.id}`
        : `${API_URL}/personnes-autorisees`;

      const response = await fetch(url, {
        method: editingPersonne ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enfantId: selectedEnfantId,
          nom: formNom,
          prenom: formPrenom,
          telephone: formTelephone,
          lienParente: formLienParente || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur lors de l'enregistrement");
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette personne autorisée ?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/personnes-autorisees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
        <AlertCircle className="text-rose-500" size={24} />
        <p className="text-rose-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Users size={20} className="text-white" />
          </div>
          Personnes autorisées
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez les personnes autorisées à venir récupérer vos enfants
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Les personnes listées ici sont autorisées à venir chercher votre enfant à l&apos;école
          en dehors des parents. Pensez à mettre à jour cette liste régulièrement.
        </p>
      </div>

      {/* Liste par enfant */}
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun enfant inscrit pour le moment.
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((enfant) => (
            <div
              key={enfant.enfantId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Header enfant */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{enfant.enfantNom}</h2>
                <button
                  onClick={() => openAddModal(enfant.enfantId)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>

              {/* Liste des personnes */}
              <div className="p-6">
                {enfant.personnesAutorisees.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">
                    Aucune personne autorisée pour le moment
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enfant.personnesAutorisees.map((personne) => (
                      <div
                        key={personne.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                            <UserPlus size={18} className="text-violet-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {personne.prenom} {personne.nom}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone size={14} />
                                {personne.telephone}
                              </span>
                              {personne.lienParente && (
                                <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                                  {personne.lienParente}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(enfant.enfantId, personne)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(personne.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {editingPersonne ? "Modifier" : "Ajouter"} une personne autorisée
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formPrenom}
                  onChange={(e) => setFormPrenom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0612345678"
                  value={formTelephone}
                  onChange={(e) => setFormTelephone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lien de parenté
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grand-mère, Oncle, Nounou..."
                  value={formLienParente}
                  onChange={(e) => setFormLienParente(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {editingPersonne ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
