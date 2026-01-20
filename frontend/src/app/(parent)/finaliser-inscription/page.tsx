"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Check,
  Loader2,
  ArrowLeft,
  Shield,
  User,
  Upload,
  ArrowRight
} from "lucide-react";
import { useEnfants } from "@/hooks/useEnfants";
import { JustificatifUploadItem } from "@/components/justificatifs/JustificatifUploadItem";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface SignatureStatus {
  signed: boolean;
  signature?: {
    parentAccepte: boolean;
    parentDateSignature: string;
    parentName: string;
    parentEmail: string;
  };
}

interface JustificatifType {
  id: number;
  nom: string;
  description: string;
  obligatoire: boolean;
}

interface Justificatif {
  id: number;
  typeId: number;
  nomType: string;
  fichierUrl: string;
  valide: boolean | null; // null = en attente
  dateDepot: string;
}

export default function FinaliserInscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enfantIdParam = searchParams.get("enfantId");

  const { enfants, isLoading: enfantsLoading } = useEnfants();
  const [selectedEnfantId, setSelectedEnfantId] = useState<number | null>(
    enfantIdParam ? parseInt(enfantIdParam) : null
  );

  // États Signature
  const [pdfOuvert, setPdfOuvert] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [accepteReglement, setAccepteReglement] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // États Justificatifs
  const [typesAttendus, setTypesAttendus] = useState<JustificatifType[]>([]);
  const [justificatifsEnfant, setJustificatifsEnfant] = useState<Justificatif[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [allDocsUploaded, setAllDocsUploaded] = useState(false);

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [error, setError] = useState("");
  const [successSignature, setSuccessSignature] = useState(false);

  const selectedEnfant = enfants.find(e => e.id === selectedEnfantId);

  // Auto-sélectionner si un seul enfant
  useEffect(() => {
    if (enfants.length === 1 && !selectedEnfantId) {
      setSelectedEnfantId(enfants[0].id);
    }
  }, [enfants, selectedEnfantId]);

  // Charger les données quand l'enfant change
  useEffect(() => {
    if (selectedEnfantId) {
      loadSignatureStatus(selectedEnfantId);
      loadJustificatifsData(selectedEnfantId);
    }
  }, [selectedEnfantId]);

  // Vérifier si tous les documents obligatoires sont fournis
  useEffect(() => {
    if (typesAttendus.length > 0) {
      // Filtrer pour exclure "Règlement intérieur signé" (ID 5) qui est géré à part
      const docsRequis = typesAttendus.filter(t => t.obligatoire && t.id !== 5);

      const isComplete = docsRequis.every(type => {
        const justif = justificatifsEnfant.find(j => j.typeId === type.id);
        // Considéré comme OK si fourni (même en attente) et non refusé
        return justif && justif.valide !== false; // false = refusé
      });

      setAllDocsUploaded(isComplete);
    }
  }, [typesAttendus, justificatifsEnfant]);

  const loadSignatureStatus = async (enfantId: number) => {
    setIsLoadingStatus(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/signatures/status/${enfantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSignatureStatus(data);
      }
    } catch (err) {
      console.error("Erreur chargement statut signature:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadJustificatifsData = async (enfantId: number) => {
    setIsLoadingDocs(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Charger les types attendus
      const resTypes = await fetch(`${API_URL}/justificatifs/types`, { headers });
      if (resTypes.ok) {
        setTypesAttendus(await resTypes.json());
      }

      // 2. Charger les justificatifs déjà fournis
      const resDocs = await fetch(`${API_URL}/justificatifs/enfant/${enfantId}`, { headers });
      if (resDocs.ok) {
        setJustificatifsEnfant(await resDocs.json());
      }
    } catch (err) {
      console.error("Erreur chargement justificatifs:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleOuvrirPdf = () => {
    window.open("/documents/reglement-interieur.pdf", "_blank");
    setPdfOuvert(true);
  };

  const handleSigner = async () => {
    if (!selectedEnfantId || !accepteReglement) return;

    setIsSigning(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/signatures/signer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enfantId: selectedEnfantId,
          signatureData: `Signature électronique - ${new Date().toISOString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la signature");
      }

      setSuccessSignature(true);
      await loadSignatureStatus(selectedEnfantId);

      // Fermer le modal de succès après 2s
      setTimeout(() => setSuccessSignature(false), 2000);

    } catch (err) {
      setError("Erreur lors de la signature");
    } finally {
      setIsSigning(false);
    }
  };

  const handleUploadSuccess = () => {
    if (selectedEnfantId) {
      loadJustificatifsData(selectedEnfantId);
    }
  };

  if (enfantsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (enfants.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun enfant inscrit</h2>
        <p className="text-gray-500">Vous n&apos;avez pas encore d&apos;enfant inscrit.</p>
        <Link href="/preinscription-enfant" className="mt-4 inline-block text-emerald-600 hover:underline">
          Préinscrire un enfant
        </Link>
      </div>
    );
  }

  // Filtrer les types de justificatifs à afficher (exclure le règlement intérieur ID 5)
  // Exclure le "Règlement intérieur signé" - géré via signature électronique (étape 2)
  const displayTypes = typesAttendus.filter(t => t.id !== 5 && !t.nom.toLowerCase().includes('règlement'));

  const isInscriptionComplete = signatureStatus?.signed && allDocsUploaded;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <FileText size={20} className="text-white" />
          </div>
          Finaliser l&apos;inscription
        </h1>
        <p className="text-gray-500 mt-2">
          Complétez le dossier pour valider définitivement l&apos;inscription.
        </p>
      </div>

      {/* Sélection enfant si plusieurs */}
      {enfants.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-gray-400" />
            Sélectionner l&apos;enfant
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {enfants.map((enfant) => (
              <button
                key={enfant.id}
                onClick={() => setSelectedEnfantId(enfant.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedEnfantId === enfant.id
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

      {selectedEnfantId && (
        <>
          {/* État Global */}
          {isInscriptionComplete ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Dossier complet !</h3>
                <p className="text-emerald-800 mt-1">
                  Merci ! L&apos;inscription de {selectedEnfant?.prenom} est finalisée.
                  Nous procéderons à la vérification de vos documents sous 48h.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Retour au tableau de bord <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Dossier incomplet</h3>
                <p className="text-amber-800 mt-1">
                  Veuillez compléter les étapes ci-dessous pour finaliser l&apos;inscription.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Étapes de finalisation
            </h2>

            <div className="space-y-6">
              {/* Étape 1: Consulter le règlement */}
              <div className={`p-4 rounded-xl border-2 transition-all ${pdfOuvert || signatureStatus?.signed ? "border-emerald-500 bg-emerald-50/50" : "border-amber-300 bg-amber-50/50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${pdfOuvert || signatureStatus?.signed ? "bg-emerald-500" : "bg-amber-500"}`}>
                    {pdfOuvert || signatureStatus?.signed ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <span className="text-white font-bold">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Consulter le règlement intérieur
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Lisez attentivement le règlement intérieur de l&apos;école.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleOuvrirPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm shadow-sm"
                      >
                        <Eye size={16} />
                        Consulter
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 2: Signer */}
              <div className={`p-4 rounded-xl border-2 transition-all ${signatureStatus?.signed ? "border-emerald-500 bg-emerald-50/50" : pdfOuvert ? "border-violet-500 bg-violet-50/30" : "border-gray-200 bg-white"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${signatureStatus?.signed ? "bg-emerald-500" : pdfOuvert ? "bg-violet-500" : "bg-gray-200"}`}>
                    {signatureStatus?.signed ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <span className={`font-bold ${pdfOuvert ? "text-white" : "text-gray-400"}`}>2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${!pdfOuvert ? "text-gray-400" : "text-gray-900"}`}>
                      Signer le règlement
                    </h3>

                    {!signatureStatus?.signed ? (
                      pdfOuvert ? (
                        <div className="mt-3 space-y-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={accepteReglement}
                              onChange={(e) => setAccepteReglement(e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                            />
                            <span className="text-sm text-gray-700">
                              J&apos;ai lu et j&apos;accepte le règlement intérieur.
                            </span>
                          </label>

                          <button
                            onClick={handleSigner}
                            disabled={!accepteReglement || isSigning}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSigning ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                            {isSigning ? "Signature..." : "Signer électroniquement"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Veuillez d&apos;abord consulter le règlement (Étape 1).
                        </p>
                      )
                    ) : (
                      <div className="mt-2 text-sm text-emerald-700 flex items-center gap-2">
                        <Shield size={16} />
                        Signé le {new Date(signatureStatus.signature?.parentDateSignature || "").toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Étape 3: Documents */}
              <div className={`p-4 rounded-xl border-2 transition-all ${allDocsUploaded ? "border-emerald-500 bg-emerald-50/50" : signatureStatus?.signed ? "border-indigo-500 bg-indigo-50/30" : "border-gray-200 bg-white"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${allDocsUploaded ? "bg-emerald-500" : signatureStatus?.signed ? "bg-indigo-500" : "bg-gray-200"}`}>
                    {allDocsUploaded ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <span className={`font-bold ${signatureStatus?.signed ? "text-white" : "text-gray-400"}`}>3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${!signatureStatus?.signed ? "text-gray-400" : "text-gray-900"}`}>
                      Téléverser les justificatifs
                    </h3>

                    {!signatureStatus?.signed ? (
                      <p className="text-sm text-gray-400">
                        Veuillez d&apos;abord signer le règlement (Étape 2).
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {isLoadingDocs ? (
                          <div className="flex justify-center py-4">
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                          </div>
                        ) : (
                          displayTypes.map(type => {
                            const justif = justificatifsEnfant.find(j => j.typeId === type.id);
                            // Calcul du statut pour le composant
                            let statutDisplay: "MANQUANT" | "EN_ATTENTE" | "VALIDE" | "REFUSE" = "MANQUANT";
                            if (justif) {
                              if (justif.valide === true) statutDisplay = "VALIDE";
                              else if (justif.valide === false) statutDisplay = "REFUSE";
                              else statutDisplay = "EN_ATTENTE";
                            }

                            return (
                              <JustificatifUploadItem
                                key={type.id}
                                enfantId={selectedEnfantId}
                                typeId={type.id}
                                nom={type.nom}
                                description={type.description}
                                statut={statutDisplay}
                                fichierUrl={justif?.fichierUrl}
                                onUploadSuccess={handleUploadSuccess}
                              />
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {successSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 text-center transform scale-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Signature enregistrée !</h3>
          </div>
        </div>
      )}
    </div>
  );
}
