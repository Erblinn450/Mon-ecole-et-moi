"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function PreinscriptionNouvelEnfantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
  
  // Questions
  const [pedagogieMontessori, setPedagogieMontessori] = useState("");
  const [difficultes, setDifficultes] = useState("");

  // Infos famille (pré-remplies car connecté)
  const familyInfo = {
    responsable1: "Jean Dupont (Père)",
    email: "jean.dupont@example.com",
    telephone: "0612345678",
    adresse: "123 Rue de la Paix, 75001 Paris"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            Demande enregistrée
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>Bonjour,</strong>
          </p>
          <p className="text-gray-600 mb-2">
            Votre demande de préinscription pour votre nouvel enfant a été enregistrée avec succès.
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
          <h1 className="text-2xl font-bold text-gray-900">➕ Préinscription d&apos;un nouvel enfant</h1>
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
          ℹ️ <strong>Information :</strong> Ce formulaire permet de préinscrire un nouvel enfant 
          de votre famille qui n&apos;était pas encore scolarisé dans notre établissement. 
          Les informations de votre famille sont déjà enregistrées.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'enfant */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Informations du nouvel enfant
          </h2>

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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationalité <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nationalite}
                onChange={(e) => setNationalite(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies / Problèmes de santé
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Précisez les allergies alimentaires, médicaments, asthme, etc."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Scolarité antérieure */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📚 Scolarité antérieure
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Établissement précédent
              </label>
              <input
                type="text"
                value={etablissementPrecedent}
                onChange={(e) => setEtablissementPrecedent(e.target.value)}
                placeholder="Nom de l'établissement (si déjà scolarisé)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe actuelle
              </label>
              <select
                value={classeActuelle}
                onChange={(e) => setClasseActuelle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">-- Pas encore scolarisé --</option>
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
                Année scolaire souhaitée <span className="text-red-500">*</span>
              </label>
              <select
                value={classeSouhaitee}
                onChange={(e) => setClasseSouhaitee(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                Date souhaitée pour l&apos;intégration <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateIntegration}
                onChange={(e) => setDateIntegration(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Questions importantes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💬 Questions importantes
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                En quoi la pédagogie Montessori répond-elle à vos attentes ? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={pedagogieMontessori}
                onChange={(e) => setPedagogieMontessori(e.target.value)}
                placeholder="Exprimez vos motivations et attentes vis-à-vis de la pédagogie Montessori..."
                rows={3}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cet enfant rencontre-t-il des difficultés particulières ? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={difficultes}
                onChange={(e) => setDifficultes(e.target.value)}
                placeholder="Ex: timidité, troubles de l'attention, difficultés relationnelles... Ou indiquez 'Aucune'"
                rows={3}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Informations familiales */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            👨‍👩‍👧‍👦 Informations familiales
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              ℹ️ Les informations de votre famille sont automatiquement reprises de votre compte existant.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Responsable :</strong> {familyInfo.responsable1}</p>
            <p><strong>Email :</strong> {familyInfo.email}</p>
            <p><strong>Téléphone :</strong> {familyInfo.telephone}</p>
            <p><strong>Adresse :</strong> {familyInfo.adresse}</p>
          </div>
        </div>

        {/* Bouton soumettre */}
        <button
          type="submit"
          disabled={isLoading}
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
            "📤 Envoyer la demande de préinscription"
          )}
        </button>
      </form>
    </div>
  );
}

