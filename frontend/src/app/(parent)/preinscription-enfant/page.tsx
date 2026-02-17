"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Classe } from "@/types";
import { API_URL } from "@/lib/api";

// Classes multi-âges Montessori (cohérent avec le formulaire public)
const CLASSES = [
  {
    group: "Classes multi-âges Montessori",
    options: [
      { value: "MATERNELLE", label: "Maternelle (3-6 ans)" },
      { value: "ELEMENTAIRE", label: "Élémentaire (6-12 ans, CP au CM2)" },
    ],
  },
];

const CLASSE_MAPPING: Record<string, Classe> = {
  MATERNELLE: Classe.MATERNELLE,
  ELEMENTAIRE: Classe.ELEMENTAIRE,
};

interface ParentInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export default function PreinscriptionNouvelEnfantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);

  // Informations enfant
  const [nomEnfant, setNomEnfant] = useState("");
  const [prenomEnfant, setPrenomEnfant] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [allergies, setAllergies] = useState("");

  // Scolarité
  const [etablissementPrecedent, setEtablissementPrecedent] = useState("");
  const [classeActuelle, setClasseActuelle] = useState("");
  const [classeSouhaitee, setClasseSouhaitee] = useState("");
  const [dateIntegration, setDateIntegration] = useState("");

  // Questions (cohérentes avec le formulaire public)
  const [decouverte, setDecouverte] = useState("");
  const [attentesStructure, setAttentesStructure] = useState("");
  const [pedagogieMontessori, setPedagogieMontessori] = useState("");
  const [difficultes, setDifficultes] = useState("");

  const isMaternelleSelected = classeSouhaitee === "MATERNELLE";

  // Charger les infos du parent connecté
  useEffect(() => {
    const loadParentInfo = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const user = await response.json();
          setParentInfo({
            id: user.id,
            nom: user.nom || user.name || "",
            prenom: user.prenom || "",
            email: user.email,
            telephone: user.telephone || "",
          });
        }
      } catch {
        // Silencieux
      }
    };
    loadParentInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      const data = {
        nomEnfant,
        prenomEnfant,
        dateNaissance,
        lieuNaissance: lieuNaissance || undefined,
        nationalite: nationalite || undefined,
        allergies: allergies || undefined,
        classeSouhaitee: CLASSE_MAPPING[classeSouhaitee] || Classe.MATERNELLE,
        etablissementPrecedent: etablissementPrecedent || undefined,
        classeActuelle: classeActuelle || undefined,
        dateIntegration: dateIntegration || undefined,
        // Parent (depuis le compte connecté)
        nomParent: parentInfo?.nom || "",
        prenomParent: parentInfo?.prenom || "",
        emailParent: parentInfo?.email || "",
        telephoneParent: parentInfo?.telephone || "",
        // Questions
        decouverte: decouverte || undefined,
        attentesStructure: attentesStructure || undefined,
        pedagogieMontessori: pedagogieMontessori || undefined,
        difficultes: difficultes || undefined,
      };

      const response = await fetch(`${API_URL}/preinscriptions/enfant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur lors de l'envoi");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal de succès
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            Demande enregistrée
          </h2>
          <p className="text-gray-600 mb-2">
            Votre demande de préinscription pour <strong>{prenomEnfant}</strong> a été enregistrée avec succès.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Nous examinerons votre demande et vous contacterons rapidement.
          </p>
          <p className="text-gray-600 mb-6">
            <strong>Bien cordialement,</strong><br />
            L&apos;équipe pédagogique de Mon école Montessori et Moi
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
          <h1 className="text-2xl font-bold text-gray-900">
            Préinscription d&apos;un nouvel enfant
          </h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Retour
          </Link>
        </div>
        <p className="text-gray-500 mt-1">
          Préinscrire un nouvel enfant de votre famille
        </p>
      </div>

      {/* Alerte info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Ce formulaire permet de préinscrire un nouvel enfant de votre famille
          qui n&apos;était pas encore scolarisé dans notre établissement. Les
          informations de votre famille sont déjà enregistrées.
        </p>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'enfant */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User size={20} /> Informations du nouvel enfant
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l&apos;enfant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomEnfant}
                  onChange={(e) => setNomEnfant(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom de l&apos;enfant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prenomEnfant}
                  onChange={(e) => setPrenomEnfant(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  value={lieuNaissance}
                  onChange={(e) => setLieuNaissance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité
                </label>
                <input
                  type="text"
                  value={nationalite}
                  onChange={(e) => setNationalite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies / Problèmes de santé
              </label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Indiquez les allergies ou problèmes de santé à signaler..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Scolarité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GraduationCap size={20} /> Scolarité
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe souhaitée <span className="text-red-500">*</span>
                </label>
                <select
                  value={classeSouhaitee}
                  onChange={(e) => setClasseSouhaitee(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d&apos;intégration souhaitée
                </label>
                <input
                  type="date"
                  value={dateIntegration}
                  onChange={(e) => setDateIntegration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            {!isMaternelleSelected && classeSouhaitee && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Établissement précédent
                  </label>
                  <input
                    type="text"
                    value={etablissementPrecedent}
                    onChange={(e) => setEtablissementPrecedent(e.target.value)}
                    placeholder="Nom de l'école précédente..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe actuelle
                  </label>
                  <input
                    type="text"
                    value={classeActuelle}
                    onChange={(e) => setClasseActuelle(e.target.value)}
                    placeholder="Ex: CP, CE1..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions importantes (même questions que le formulaire public) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare size={20} /> Questions importantes
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment avez-vous découvert notre école ?
              </label>
              <textarea
                value={decouverte}
                onChange={(e) => setDecouverte(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qu&apos;attendez-vous de notre structure ?
              </label>
              <textarea
                value={attentesStructure}
                onChange={(e) => setAttentesStructure(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Que représente pour vous la pédagogie Montessori ?
              </label>
              <textarea
                value={pedagogieMontessori}
                onChange={(e) => setPedagogieMontessori(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre enfant rencontre-t-il des difficultés à porter à notre
                attention afin de l&apos;accompagner au mieux dans sa scolarité ?
                Si oui, pouvez-vous nous en dire plus ?
              </label>
              <textarea
                value={difficultes}
                onChange={(e) => setDifficultes(e.target.value)}
                rows={3}
                placeholder="Difficultés d'apprentissage, comportement, santé..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Informations familiales (pré-remplies depuis le compte) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Informations familiales
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                Les informations de votre famille sont automatiquement reprises
                de votre compte existant.
              </p>
            </div>
            {parentInfo ? (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Responsable :</strong> {parentInfo.prenom}{" "}
                  {parentInfo.nom}
                </p>
                <p>
                  <strong>Email :</strong> {parentInfo.email}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {parentInfo.telephone || "Non renseigné"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                Chargement des informations...
              </div>
            )}
          </div>
        </div>

        {/* Bouton soumettre */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            "Envoyer la demande de préinscription"
          )}
        </button>
      </form>
    </div>
  );
}
