"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  User,
  Users,
  GraduationCap,
  MessageSquare,
  Check,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield
} from "lucide-react";
import { preinscriptionsApi } from "@/lib/api";
import { CreatePreinscriptionRequest, Classe, SituationFamiliale } from "@/types";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { sanitize } from "@/lib/sanitize";

// Mapping des classes vers l'enum backend
// L'école propose 2 classes multi-âges: Maternelle (3-6 ans) et Élémentaire (6-12 ans)
const CLASSE_MAPPING: Record<string, Classe> = {
  MATERNELLE: Classe.MATERNELLE,
  ELEMENTAIRE: Classe.ELEMENTAIRE,
};

// Classes disponibles à l'école (multi-âges Montessori)
const CLASSES = [
  {
    group: "Classes multi-âges Montessori", options: [
      { value: "MATERNELLE", label: "Maternelle (3-6 ans)" },
      { value: "ELEMENTAIRE", label: "Élémentaire (6-12 ans, CP au CM2)" },
    ]
  },
];

const SITUATIONS_FAMILIALES = [
  { value: "", label: "-- Sélectionnez --" },
  { value: SituationFamiliale.MARIES, label: "Marié(e)" },
  { value: SituationFamiliale.PACSES, label: "Pacsé(e)" },
  { value: SituationFamiliale.UNION_LIBRE, label: "Union libre" },
  { value: SituationFamiliale.SEPARES, label: "Séparé(e)" },
  { value: SituationFamiliale.DIVORCES, label: "Divorcé(e)" },
  { value: SituationFamiliale.FAMILLE_MONOPARENTALE, label: "Famille monoparentale" },
  { value: SituationFamiliale.AUTRE, label: "Autre" },
];

interface Responsable {
  civilite: string;
  nom: string;
  prenom: string;
  lienParente: string;
  email: string;
  telephone: string;
  adresse: string;
  profession: string;
}

export default function PreinscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [numeroDossier, setNumeroDossier] = useState("");
  const [error, setError] = useState("");

  // reCAPTCHA v3 (désactivé si pas de clé configurée)
  const { executeRecaptcha, isLoaded: recaptchaLoaded } = useRecaptcha('preinscription');

  // Informations enfant
  const [nomEnfant, setNomEnfant] = useState("");
  const [prenomEnfant, setPrenomEnfant] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [allergies, setAllergies] = useState("");

  // Scolarité
  const [classeSouhaitee, setClasseSouhaitee] = useState("");
  const [etablissementPrecedent, setEtablissementPrecedent] = useState("");
  const [dateIntegration, setDateIntegration] = useState("");

  // Responsables
  const [responsables, setResponsables] = useState<Responsable[]>([
    { civilite: "", nom: "", prenom: "", lienParente: "", email: "", telephone: "", adresse: "", profession: "" }
  ]);

  // Informations complémentaires
  const [situationFamiliale, setSituationFamiliale] = useState<SituationFamiliale | "">("");
  const [situationAutre, setSituationAutre] = useState("");
  const [classeActuelle, setClasseActuelle] = useState("");

  // Questions importantes
  const [decouverte, setDecouverte] = useState("");
  const [pedagogieMontessori, setPedagogieMontessori] = useState("");

  // Acceptation CGU/RGPD (obligatoire légalement)
  const [acceptCGU, setAcceptCGU] = useState(false);

  // Validation téléphone
  const [phoneErrors, setPhoneErrors] = useState<Record<number, string>>({});

  // Fonction de validation du numéro de téléphone français
  const validatePhoneNumber = (phone: string): { isValid: boolean; formatted: string; error: string } => {
    // Supprimer tous les caractères non numériques sauf +
    const cleaned = phone.replace(/[^0-9+]/g, "");

    // Formats acceptés: 0612345678, 06 12 34 56 78, +33612345678
    const frenchMobileRegex = /^(?:(?:\+33|0033)|0)[1-9](?:[0-9]{8})$/;
    const isValid = frenchMobileRegex.test(cleaned);

    if (!phone) {
      return { isValid: true, formatted: "", error: "" }; // Vide = pas d'erreur
    }

    if (!isValid) {
      return {
        isValid: false,
        formatted: phone,
        error: "Format invalide. Ex: 06 12 34 56 78 ou 0612345678"
      };
    }

    // Formater le numéro en XX XX XX XX XX
    let formatted = cleaned;
    if (cleaned.startsWith("+33")) {
      formatted = "0" + cleaned.slice(3);
    } else if (cleaned.startsWith("0033")) {
      formatted = "0" + cleaned.slice(4);
    }

    // Ajouter les espaces
    if (formatted.length === 10) {
      formatted = formatted.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
    }

    return { isValid: true, formatted, error: "" };
  };
  const [difficultes, setDifficultes] = useState("");

  // Maternelle = première inscription (pas d'établissement précédent nécessaire)
  const isMaternelleSelected = classeSouhaitee === "MATERNELLE";

  const addResponsable = () => {
    if (responsables.length < 2) {
      setResponsables([...responsables, { civilite: "", nom: "", prenom: "", lienParente: "", email: "", telephone: "", adresse: "", profession: "" }]);
    }
  };

  const removeResponsable = (index: number) => {
    if (responsables.length > 1) {
      setResponsables(responsables.filter((_, i) => i !== index));
    }
  };

  const updateResponsable = (index: number, field: keyof Responsable, value: string) => {
    const updated = [...responsables];
    updated[index] = { ...updated[index], [field]: value };
    setResponsables(updated);

    // Validation en temps réel du téléphone
    if (field === "telephone") {
      const validation = validatePhoneNumber(value);
      setPhoneErrors(prev => ({
        ...prev,
        [index]: validation.error
      }));
    }
  };

  const autoFillForm = () => {
    setNomEnfant("Dupont");
    setPrenomEnfant("Lucas");
    setDateNaissance("2020-03-15");
    setLieuNaissance("Mulhouse");
    setNationalite("Française");
    setAllergies("");
    setClasseSouhaitee("MATERNELLE");
    setEtablissementPrecedent("");
    setDateIntegration("2025-09-01");
    setResponsables([{
      civilite: "M.",
      nom: "Dupont",
      prenom: "Jean",
      lienParente: "pere",
      email: "jean.dupont@email.fr",
      telephone: "0612345678",
      adresse: "123 rue de la Paix, 68100 Mulhouse",
      profession: "Ingénieur"
    }]);
    setSituationFamiliale(SituationFamiliale.MARIES);
    setSituationAutre("");
    setClasseActuelle("Grande Section");
    setDecouverte("Recommandation d'amis");
    setPedagogieMontessori("Nous apprécions l'autonomie et le respect du rythme de l'enfant.");
    setDifficultes("Aucune difficulté particulière à signaler.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Obtenir le token reCAPTCHA (null si désactivé)
      const recaptchaToken = await executeRecaptcha();

      const data: CreatePreinscriptionRequest & { recaptchaToken?: string } = {
        // Enfant
        nomEnfant,
        prenomEnfant,
        dateNaissance,
        lieuNaissance: lieuNaissance || undefined,
        nationalite: nationalite || undefined,
        allergies: allergies || undefined,
        classeSouhaitee: CLASSE_MAPPING[classeSouhaitee] || Classe.MATERNELLE,
        etablissementPrecedent: etablissementPrecedent || undefined,
        dateIntegration: dateIntegration || undefined,

        // Parent 1
        civiliteParent: responsables[0]?.civilite || undefined,
        nomParent: responsables[0]?.nom || "",
        prenomParent: responsables[0]?.prenom || "",
        emailParent: responsables[0]?.email || "",
        telephoneParent: responsables[0]?.telephone || "",
        lienParente: responsables[0]?.lienParente || undefined,
        adresseParent: responsables[0]?.adresse || undefined,
        professionParent: responsables[0]?.profession || undefined,

        // Parent 2 (si présent)
        ...(responsables[1] ? {
          civiliteParent2: responsables[1].civilite || undefined,
          nomParent2: responsables[1].nom || undefined,
          prenomParent2: responsables[1].prenom || undefined,
          emailParent2: responsables[1].email || undefined,
          telephoneParent2: responsables[1].telephone || undefined,
          lienParente2: responsables[1].lienParente || undefined,
          adresseParent2: responsables[1].adresse || undefined,
          professionParent2: responsables[1].profession || undefined,
        } : {}),

        // Informations complémentaires
        situationFamiliale: situationFamiliale || undefined,
        situationAutre: situationFamiliale === SituationFamiliale.AUTRE ? situationAutre : undefined,
        classeActuelle: classeActuelle || undefined,
        decouverte: decouverte || undefined,
        pedagogieMontessori: pedagogieMontessori || undefined,
        difficultes: difficultes || undefined,

        // Token reCAPTCHA (null si désactivé en dev)
        ...(recaptchaToken && { recaptchaToken }),
      };

      const result = await preinscriptionsApi.create(data);
      setNumeroDossier(result.numeroDossier);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Préinscription envoyée !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre demande a été enregistrée avec succès.
            Nous vous contacterons prochainement.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700 mb-1">Numéro de dossier</p>
            <p className="text-xl font-bold text-emerald-800">{numeroDossier}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Conservez ce numéro pour suivre l&apos;avancement de votre demande.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" width={64} height={64} className="h-12 w-auto" />
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Formulaire de Préinscription</h1>
              <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Retour à l&apos;accueil
              </Link>
            </div>
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo-montessori.png" alt="Montessori" width={64} height={64} className="h-12 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Bouton pré-remplir (dev) */}
        <div className="mb-6 text-right">
          <button
            type="button"
            onClick={autoFillForm}
            className="text-sm text-gray-500 hover:text-emerald-600 underline"
          >
            Pré-remplir (test)
          </button>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="text-rose-500 flex-shrink-0" size={20} aria-hidden="true" />
            <p className="text-rose-700">{sanitize(error)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" aria-label="Formulaire de préinscription">
          {/* Section 1: Informations de l'enfant */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={20} /> Informations de l&apos;enfant
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom-enfant" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    id="nom-enfant"
                    type="text"
                    required
                    value={nomEnfant}
                    onChange={(e) => setNomEnfant(e.target.value)}
                    aria-label="Nom de l'enfant"
                    aria-required="true"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="prenom-enfant" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    id="prenom-enfant"
                    type="text"
                    required
                    value={prenomEnfant}
                    onChange={(e) => setPrenomEnfant(e.target.value)}
                    aria-label="Prénom de l'enfant"
                    aria-required="true"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date-naissance" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <input
                    id="date-naissance"
                    type="date"
                    required
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    aria-label="Date de naissance de l'enfant"
                    aria-required="true"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lieu-naissance" className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                  <input
                    id="lieu-naissance"
                    type="text"
                    value={lieuNaissance}
                    onChange={(e) => setLieuNaissance(e.target.value)}
                    aria-label="Lieu de naissance de l'enfant"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                  <input
                    id="nationalite"
                    type="text"
                    value={nationalite}
                    onChange={(e) => setNationalite(e.target.value)}
                    aria-label="Nationalité de l'enfant"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Allergies / Problèmes de santé</label>
                <textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  rows={2}
                  aria-label="Allergies ou problèmes de santé de l'enfant"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Indiquez les allergies ou problèmes de santé à signaler..."
                />
              </div>
            </div>
          </section>

          {/* Section 2: Scolarité */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <GraduationCap size={20} /> Scolarité
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="classe-souhaitee" className="block text-sm font-medium text-gray-700 mb-1">Classe souhaitée *</label>
                  <select
                    id="classe-souhaitee"
                    required
                    value={classeSouhaitee}
                    onChange={(e) => setClasseSouhaitee(e.target.value)}
                    aria-label="Classe souhaitée pour l'enfant"
                    aria-required="true"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">-- Sélectionnez --</option>
                    {CLASSES.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="date-integration" className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;intégration souhaitée</label>
                  <input
                    id="date-integration"
                    type="date"
                    value={dateIntegration}
                    onChange={(e) => setDateIntegration(e.target.value)}
                    aria-label="Date d'intégration souhaitée"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              {!isMaternelleSelected && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="etablissement-precedent" className="block text-sm font-medium text-gray-700 mb-1">Établissement précédent</label>
                    <input
                      id="etablissement-precedent"
                      type="text"
                      value={etablissementPrecedent}
                      onChange={(e) => setEtablissementPrecedent(e.target.value)}
                      aria-label="Établissement scolaire précédent"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Nom de l'école précédente..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classe actuelle</label>
                    <input
                      type="text"
                      value={classeActuelle}
                      onChange={(e) => setClasseActuelle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Ex: Grande Section, CP..."
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Responsables légaux */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={20} /> Responsables légaux
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {responsables.map((resp, index) => (
                <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Responsable {index + 1} {index === 0 && "*"}</h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeResponsable(index)}
                        className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                      <select
                        value={resp.civilite}
                        onChange={(e) => updateResponsable(index, "civilite", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="">--</option>
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom {index === 0 && "*"}</label>
                      <input
                        type="text"
                        required={index === 0}
                        value={resp.nom}
                        onChange={(e) => updateResponsable(index, "nom", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom {index === 0 && "*"}</label>
                      <input
                        type="text"
                        required={index === 0}
                        value={resp.prenom}
                        onChange={(e) => updateResponsable(index, "prenom", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lien de parenté</label>
                      <select
                        value={resp.lienParente}
                        onChange={(e) => updateResponsable(index, "lienParente", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="">--</option>
                        <option value="pere">Père</option>
                        <option value="mere">Mère</option>
                        <option value="tuteur">Tuteur</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email {index === 0 && "*"}</label>
                      <input
                        type="email"
                        required={index === 0}
                        value={resp.email}
                        onChange={(e) => updateResponsable(index, "email", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone {index === 0 && "*"}</label>
                      <input
                        type="tel"
                        required={index === 0}
                        value={resp.telephone}
                        onChange={(e) => updateResponsable(index, "telephone", e.target.value)}
                        placeholder="06 12 34 56 78"
                        className={`w-full px-4 py-2.5 rounded-xl border transition-colors ${phoneErrors[index]
                          ? "border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          : "border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                      />
                      {phoneErrors[index] && (
                        <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {phoneErrors[index]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <input
                        type="text"
                        value={resp.adresse}
                        onChange={(e) => updateResponsable(index, "adresse", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <input
                        type="text"
                        value={resp.profession}
                        onChange={(e) => updateResponsable(index, "profession", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {responsables.length < 2 && (
                <button
                  type="button"
                  onClick={addResponsable}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Plus size={18} /> Ajouter un second responsable
                </button>
              )}
            </div>
          </section>

          {/* Section 4: Situation familiale */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={20} /> Situation familiale
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Situation</label>
                  <select
                    value={situationFamiliale}
                    onChange={(e) => setSituationFamiliale(e.target.value as SituationFamiliale)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    {SITUATIONS_FAMILIALES.map(sit => (
                      <option key={sit.value} value={sit.value}>{sit.label}</option>
                    ))}
                  </select>
                </div>
                {situationFamiliale === SituationFamiliale.AUTRE && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Précisez la situation</label>
                    <input
                      type="text"
                      required
                      value={situationAutre}
                      onChange={(e) => setSituationAutre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Votre situation..."
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Questions importantes */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare size={20} /> Questions importantes
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment avez-vous découvert notre école ?</label>
                <textarea
                  value={decouverte}
                  onChange={(e) => setDecouverte(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qu&apos;est-ce qui vous attire dans la pédagogie Montessori ?</label>
                <textarea
                  value={pedagogieMontessori}
                  onChange={(e) => setPedagogieMontessori(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y a-t-il des difficultés particulières à signaler ?</label>
                <textarea
                  value={difficultes}
                  onChange={(e) => setDifficultes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Difficultés d'apprentissage, comportement, santé..."
                />
              </div>
            </div>
          </section>

          {/* Section 6: Acceptation CGU et RGPD */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield size={20} /> Consentement obligatoire
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={acceptCGU}
                    onChange={(e) => setAcceptCGU(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    <strong className="text-gray-900">J&apos;accepte les conditions générales d&apos;utilisation</strong> et je consens au traitement de mes données personnelles et de celles de mon enfant conformément à notre{" "}
                    <a href="/politique-confidentialite" target="_blank" className="text-emerald-600 hover:underline">politique de confidentialité</a>{" "}
                    et au{" "}
                    <a href="/rgpd" target="_blank" className="text-emerald-600 hover:underline">Règlement Général sur la Protection des Données (RGPD)</a>.
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-8">
                  Vos données sont utilisées uniquement pour le traitement de cette demande de préinscription et la gestion de la scolarité de votre enfant. Elles ne seront jamais transmises à des tiers sans votre consentement.
                </p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={isLoading || !recaptchaLoaded || !acceptCGU || Object.values(phoneErrors).some(err => err !== "")}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : !recaptchaLoaded ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Envoyer la préinscription
                </>
              )}
            </button>

            {/* Indicateur reCAPTCHA */}
            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield size={14} />
                <span>Ce formulaire est protégé par reCAPTCHA</span>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

