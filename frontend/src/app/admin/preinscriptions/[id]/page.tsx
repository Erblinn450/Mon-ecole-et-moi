"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  X,
  FileCheck,
  Download,
  Mail,
} from "lucide-react";
import { Classe, StatutPreinscription, SituationFamiliale } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Preinscription {
  id: number;
  numeroDossier: string;
  // Enfant
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  allergies?: string;
  classeSouhaitee: Classe;
  etablissementPrecedent?: string;
  classeActuelle?: string;
  dateIntegration?: string;
  // Parent 1
  civiliteParent?: string;
  nomParent: string;
  prenomParent: string;
  emailParent: string;
  telephoneParent: string;
  lienParente?: string;
  adresseParent?: string;
  professionParent?: string;
  // Parent 2
  civiliteParent2?: string;
  nomParent2?: string;
  prenomParent2?: string;
  emailParent2?: string;
  telephoneParent2?: string;
  lienParente2?: string;
  adresseParent2?: string;
  professionParent2?: string;
  // Infos
  situationFamiliale?: SituationFamiliale;
  situationAutre?: string;
  decouverte?: string;
  pedagogieMontessori?: string;
  difficultes?: string;
  // Statut
  statut: StatutPreinscription;
  compteCree: boolean;
  commentaireRefus?: string;
  dateDemande: string;
  // Lien enfant
  enfantId?: number;
}

interface Justificatif {
  id: number;
  typeId: number;
  nomType: string;
  fichierUrl: string;
  valide: boolean | null;
  dateDepot: string;
  dateValidation?: string;
  commentaireValidation?: string;
}

interface SignatureStatus {
  signed: boolean;
  signature?: {
    parentAccepte: boolean;
    parentDateSignature: string;
    parentName: string;
  };
}

interface TypeJustificatif {
  id: number;
  nom: string;
  description: string;
  obligatoire: boolean;
}

const classeLabels: Record<Classe, string> = {
  [Classe.MATERNELLE]: "Maternelle",
  [Classe.ELEMENTAIRE]: "Élémentaire",
  [Classe.COLLEGE]: "Collège",
};

const statutConfig: Record<StatutPreinscription, { label: string; bg: string; text: string }> = {
  [StatutPreinscription.EN_ATTENTE]: { label: "En attente", bg: "bg-amber-100", text: "text-amber-800" },
  [StatutPreinscription.DEJA_CONTACTE]: { label: "Contacté", bg: "bg-blue-100", text: "text-blue-800" },
  [StatutPreinscription.VALIDE]: { label: "Validé", bg: "bg-indigo-100", text: "text-indigo-800" },
  [StatutPreinscription.REFUSE]: { label: "Refusé", bg: "bg-rose-100", text: "text-rose-800" },
  [StatutPreinscription.ANNULE]: { label: "Annulé", bg: "bg-gray-100", text: "text-gray-800" },
};

export default function PreinscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [preinscription, setPreinscription] = useState<Preinscription | null>(null);
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [typesJustificatifs, setTypesJustificatifs] = useState<TypeJustificatif[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Preinscription>>({});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  useEffect(() => {
    if (preinscription) {
      setFormData(preinscription);
    }
  }, [preinscription]);


  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      // Charger la préinscription
      const response = await fetch(`${API_URL}/preinscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Préinscription non trouvée");
      }

      const data = await response.json();
      setPreinscription(data);

      // Charger les types de justificatifs obligatoires
      const typesResponse = await fetch(`${API_URL}/justificatifs/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typesResponse.ok) {
        setTypesJustificatifs(await typesResponse.json());
      }

      // Si validée, charger les justificatifs et la signature
      if (data.statut === StatutPreinscription.VALIDE && data.enfantId) {
        // Justificatifs
        const justifsResponse = await fetch(`${API_URL}/justificatifs/enfant/${data.enfantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (justifsResponse.ok) {
          setJustificatifs(await justifsResponse.json());
        }

        // Signature
        const sigResponse = await fetch(`${API_URL}/signatures/status/${data.enfantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sigResponse.ok) {
          setSignatureStatus(await sigResponse.json());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatut = async (newStatut: StatutPreinscription, commentaire?: string) => {
    if (!preinscription) return;

    setIsUpdating(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/preinscriptions/${id}/statut`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatut, commentaire }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      await loadData();
      alert(
        newStatut === StatutPreinscription.VALIDE
          ? "✅ Dossier validé ! Le compte parent a été créé et l'email envoyé."
          : "Statut mis à jour."
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsUpdating(false);
    }
  };

  const validerJustificatif = async (justifId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/justificatifs/${justifId}/valider`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur lors de la validation");

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const refuserJustificatif = async (justifId: number) => {
    const motif = prompt("Motif du refus :");
    if (motif === null) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/justificatifs/${justifId}/valider`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valide: false, commentaire: motif }),
      });

      if (!response.ok) throw new Error("Erreur lors du refus");

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleSave = async () => {
    if (!preinscription) return;
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("auth_token");

      // Ne garder que les champs éditables (correspondant au DTO backend)
      const editableFields = {
        nomEnfant: formData.nomEnfant,
        prenomEnfant: formData.prenomEnfant,
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        nationalite: formData.nationalite,
        allergies: formData.allergies,
        classeSouhaitee: formData.classeSouhaitee,
        etablissementPrecedent: formData.etablissementPrecedent,
        classeActuelle: formData.classeActuelle,
        civiliteParent: formData.civiliteParent,
        nomParent: formData.nomParent,
        prenomParent: formData.prenomParent,
        emailParent: formData.emailParent,
        telephoneParent: formData.telephoneParent,
        lienParente: formData.lienParente,
        adresseParent: formData.adresseParent,
        professionParent: formData.professionParent,
        civiliteParent2: formData.civiliteParent2,
        nomParent2: formData.nomParent2,
        prenomParent2: formData.prenomParent2,
        emailParent2: formData.emailParent2,
        telephoneParent2: formData.telephoneParent2,
        lienParente2: formData.lienParente2,
        adresseParent2: formData.adresseParent2,
        professionParent2: formData.professionParent2,
        dateIntegration: formData.dateIntegration,
        situationFamiliale: formData.situationFamiliale,
        situationAutre: formData.situationAutre,
        decouverte: formData.decouverte,
        pedagogieMontessori: formData.pedagogieMontessori,
        difficultes: formData.difficultes,
      };

      const response = await fetch(`${API_URL}/preinscriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editableFields),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la sauvegarde");
      }

      await loadData();
      setIsEditing(false);
      alert("Modifications enregistrées !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!preinscription) return;
    setIsDownloadingPdf(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/preinscriptions/${id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la génération du PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dossier-${preinscription.numeroDossier}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendReminder = async (docsManquants: { id: number; nom: string }[]) => {
    if (!preinscription || docsManquants.length === 0) return;

    if (!confirm(`Envoyer un email de relance à ${preinscription.emailParent} pour les documents manquants ?`)) {
      return;
    }

    setIsSendingReminder(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/preinscriptions/${id}/relancer-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentsManquants: docsManquants.map(doc => doc.nom),
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi de l'email");

      alert("Email de relance envoyé avec succès !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !preinscription) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200">
        <AlertCircle className="text-rose-500 mb-2" size={24} />
        <p className="text-rose-700">{error || "Dossier non trouvé"}</p>
        <Link href="/admin/preinscriptions" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const statut = statutConfig[preinscription.statut];
  const isValide = preinscription.statut === StatutPreinscription.VALIDE;

  // Récupérer les types obligatoires (exclure le règlement intérieur qui est géré par signature)
  const requiredTypes = typesJustificatifs.filter(t =>
    t.obligatoire && !t.nom.toLowerCase().includes('règlement')
  );

  // Vérifier que TOUS les types obligatoires ont un justificatif validé
  const allRequiredDocumentsValidated = requiredTypes.length > 0 && requiredTypes.every(type => {
    const justif = justificatifs.find(j => j.typeId === type.id);
    return justif && justif.valide === true;
  });

  // Compter les documents manquants pour affichage
  const missingDocuments = requiredTypes.filter(type => {
    const justif = justificatifs.find(j => j.typeId === type.id);
    return !justif || justif.valide !== true;
  });

  const isFullyCompleted = isValide && allRequiredDocumentsValidated && signatureStatus?.signed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/preinscriptions" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dossier {preinscription.numeroDossier}
            </h1>
            <p className="text-gray-500">
              {preinscription.prenomEnfant} {preinscription.nomEnfant}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download size={16} />
                Télécharger PDF
              </>
            )}
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Modifier le dossier
            </button>
          )}
          <span className={`px-4 py-2 rounded-full font-medium ${statut.bg} ${statut.text}`}>
            {statut.label}
          </span>
        </div>
      </div>

      {/* Statut inscription complète */}
      {isFullyCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-600" size={24} />
          <div>
            <p className="font-semibold text-emerald-800">✅ Inscription complète !</p>
            <p className="text-sm text-emerald-700">
              Tous les documents sont validés et le règlement est signé.
            </p>
          </div>
        </div>
      )}

      {/* Avertissement documents manquants */}
      {isValide && !isFullyCompleted && (missingDocuments.length > 0 || !signatureStatus?.signed) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-amber-800">Inscription incomplète</p>
                <p className="text-sm text-amber-700 mt-1">
                  Documents manquants ou non validés :
                </p>
                <ul className="list-disc list-inside text-sm text-amber-700 mt-2">
                  {missingDocuments.map(doc => (
                    <li key={doc.id}>{doc.nom}</li>
                  ))}
                  {!signatureStatus?.signed && <li>Signature du règlement intérieur</li>}
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleSendReminder(missingDocuments)}
              disabled={isSendingReminder}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSendingReminder ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Relancer par email
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Section Enfant */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User size={20} /> Informations de l&apos;enfant
          </h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.nomEnfant || ''}
                onChange={e => setFormData({ ...formData, nomEnfant: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.nomEnfant}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Prénom</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.prenomEnfant || ''}
                onChange={e => setFormData({ ...formData, prenomEnfant: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.prenomEnfant}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de naissance</p>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateNaissance ? new Date(formData.dateNaissance).toISOString().split('T')[0] : ''}
                onChange={e => setFormData({ ...formData, dateNaissance: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{new Date(preinscription.dateNaissance).toLocaleDateString("fr-FR")}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Lieu de naissance</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.lieuNaissance || ''}
                onChange={e => setFormData({ ...formData, lieuNaissance: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.lieuNaissance || "Non renseigné"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Nationalité</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.nationalite || ''}
                onChange={e => setFormData({ ...formData, nationalite: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.nationalite || "Non renseigné"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Allergies</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.allergies || ''}
                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.allergies || "Aucune"}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section Scolarité */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <GraduationCap size={20} /> Scolarité
          </h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Classe souhaitée</p>
            {isEditing ? (
              <select
                value={formData.classeSouhaitee || Classe.MATERNELLE}
                onChange={(e) => setFormData({ ...formData, classeSouhaitee: e.target.value as Classe })}
                className="w-full p-2 border rounded-lg"
              >
                <option value={Classe.MATERNELLE}>Maternelle</option>
                <option value={Classe.ELEMENTAIRE}>Élémentaire</option>
                <option value={Classe.COLLEGE}>Collège</option>
              </select>
            ) : (
              <p className="font-medium">{classeLabels[preinscription.classeSouhaitee]}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Date d&apos;intégration</p>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateIntegration ? new Date(formData.dateIntegration).toISOString().split('T')[0] : ''}
                onChange={e => setFormData({ ...formData, dateIntegration: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">
                {preinscription.dateIntegration
                  ? new Date(preinscription.dateIntegration).toLocaleDateString("fr-FR")
                  : "Rentrée scolaire"}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Établissement précédent</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.etablissementPrecedent || ''}
                onChange={e => setFormData({ ...formData, etablissementPrecedent: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.etablissementPrecedent || "Non renseigné"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Classe actuelle</p>
            {isEditing ? (
              <input
                type="text"
                value={formData.classeActuelle || ''}
                onChange={e => setFormData({ ...formData, classeActuelle: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="font-medium">{preinscription.classeActuelle || "Non scolarisé"}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section Parents */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} /> Responsables légaux
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Parent 1 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Parent 1 - {preinscription.lienParente || "Parent"}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{preinscription.civiliteParent} {preinscription.nomParent}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{preinscription.prenomParent}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${preinscription.emailParent}`} className="font-medium text-indigo-600 hover:underline">
                  {preinscription.emailParent}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <a href={`tel:${preinscription.telephoneParent}`} className="font-medium text-indigo-600 hover:underline">
                  {preinscription.telephoneParent}
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">{preinscription.adresseParent || "Non renseigné"}</p>
              </div>
            </div>
          </div>

          {/* Parent 2 */}
          {preinscription.nomParent2 && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-3">Parent 2 - {preinscription.lienParente2 || "Parent"}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{preinscription.civiliteParent2} {preinscription.nomParent2}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prénom</p>
                  <p className="font-medium">{preinscription.prenomParent2}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {preinscription.emailParent2 && (
                    <a href={`mailto:${preinscription.emailParent2}`} className="font-medium text-indigo-600 hover:underline">
                      {preinscription.emailParent2}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section Questions */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare size={20} /> Questions importantes
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Comment avez-vous découvert notre école ?</p>
            <p className="text-gray-700">{preinscription.decouverte || "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pourquoi la pédagogie Montessori ?</p>
            <p className="text-gray-700">{preinscription.pedagogieMontessori || "Non renseigné"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Difficultés particulières ?</p>
            <p className="text-gray-700">{preinscription.difficultes || "Non renseigné"}</p>
          </div>
        </div>
      </section>

      {/* Section Validation des documents (si validé) */}
      {isValide && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileCheck size={20} /> Validation des documents
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Règlement intérieur */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Règlement intérieur</p>
                  <p className="text-sm text-gray-500">Signature électronique du parent</p>
                </div>
              </div>
              {signatureStatus?.signed ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle size={14} /> Signé
                  </span>
                  {signatureStatus.signature?.parentDateSignature && (
                    <span className="text-xs text-gray-500">
                      le {new Date(signatureStatus.signature.parentDateSignature).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  <Clock size={14} /> En attente
                </span>
              )}
            </div>

            {/* Liste des justificatifs */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Documents déposés</h3>
              {justificatifs.length === 0 ? (
                <p className="text-gray-500">Aucun document déposé pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {justificatifs.map((justif) => (
                    <div key={justif.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{justif.nomType}</p>
                          <p className="text-xs text-gray-500">
                            Déposé le {new Date(justif.dateDepot).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`${API_URL}/storage/${justif.fichierUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </a>

                        {justif.valide === true ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle size={14} /> Validé
                          </span>
                        ) : justif.valide === false ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
                            <XCircle size={14} /> Refusé
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => validerJustificatif(justif.id)}
                              className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                              title="Valider"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => refuserJustificatif(justif.id)}
                              className="p-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600"
                              title="Refuser"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Enregistrer les modifications
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <X size={18} />
              Annuler les modifications
            </button>
          </>
        ) : (
          preinscription.statut === StatutPreinscription.EN_ATTENTE && (
            <>
              <button
                onClick={() => updateStatut(StatutPreinscription.VALIDE)}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Valider le dossier
              </button>
              <button
                onClick={() => {
                  const motif = prompt("Motif du refus :");
                  if (motif) updateStatut(StatutPreinscription.REFUSE, motif);
                }}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                <XCircle size={18} />
                Refuser le dossier
              </button>
            </>
          )
        )}

        {/* Bouton Annuler (visible si actif et pas en édition) */}
        {!isEditing && preinscription.statut !== StatutPreinscription.ANNULE && preinscription.statut !== StatutPreinscription.REFUSE && (
          <button
            onClick={() => {
              if (confirm("Êtes-vous sûr de vouloir annuler ce dossier ?")) {
                updateStatut(StatutPreinscription.ANNULE);
              }
            }}
            disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ml-auto"
          >
            <XCircle size={18} />
            Annuler le dossier
          </button>
        )}
      </div>
    </div>
  );
}

