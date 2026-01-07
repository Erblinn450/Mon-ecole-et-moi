"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Calendar
} from "lucide-react";
import { useEnfants } from "@/hooks/useEnfants";

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

export default function FinaliserInscriptionPage() {
  const searchParams = useSearchParams();
  const enfantIdParam = searchParams.get("enfantId");
  
  const { enfants, isLoading: enfantsLoading } = useEnfants();
  const [selectedEnfantId, setSelectedEnfantId] = useState<number | null>(
    enfantIdParam ? parseInt(enfantIdParam) : null
  );
  
  const [pdfOuvert, setPdfOuvert] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
  const [accepteReglement, setAccepteReglement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedEnfant = enfants.find(e => e.id === selectedEnfantId);

  // Auto-sélectionner si un seul enfant
  useEffect(() => {
    if (enfants.length === 1 && !selectedEnfantId) {
      setSelectedEnfantId(enfants[0].id);
    }
  }, [enfants, selectedEnfantId]);

  // Charger le statut de signature quand l'enfant change
  useEffect(() => {
    if (selectedEnfantId) {
      loadSignatureStatus(selectedEnfantId);
    }
  }, [selectedEnfantId]);

  const loadSignatureStatus = async (enfantId: number) => {
    setIsLoadingStatus(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/signatures/status/${enfantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSignatureStatus(data);
      }
    } catch (err) {
      console.error("Erreur chargement statut:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleOuvrirPdf = () => {
    // Ouvrir le PDF dans un nouvel onglet
    window.open("/documents/reglement-interieur.pdf", "_blank");
    setPdfOuvert(true);
  };

  const handleSigner = async () => {
    if (!selectedEnfantId || !accepteReglement) return;
    
    setIsLoading(true);
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
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la signature");
      }

      setSuccess(true);
      await loadSignatureStatus(selectedEnfantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la signature");
    } finally {
      setIsLoading(false);
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
      </div>
    );
  }

  // Si déjà signé
  if (signatureStatus?.signed && selectedEnfant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle size={20} className="text-white" />
            </div>
            Inscription finalisée
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tout est en ordre !
          </h2>
          <p className="text-gray-600 mb-6">
            L&apos;inscription de <strong>{selectedEnfant.prenom} {selectedEnfant.nom}</strong> est complète.
            Le règlement intérieur a été signé.
          </p>

          <div className="bg-emerald-50 rounded-xl p-4 inline-block mb-6">
            <div className="flex items-center gap-3 text-emerald-800">
              <Shield size={20} />
              <div className="text-left">
                <p className="text-sm font-medium">Signé par {signatureStatus.signature?.parentName}</p>
                <p className="text-xs text-emerald-600">
                  Le {new Date(signatureStatus.signature?.parentDateSignature || "").toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

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
          Consultez et signez le règlement intérieur pour finaliser l&apos;inscription
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

      {selectedEnfantId && (
        <>
          {/* Étapes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Étapes de finalisation
            </h2>

            {/* Étape 1: Consulter le règlement */}
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${pdfOuvert ? "border-emerald-500 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${pdfOuvert ? "bg-emerald-500" : "bg-amber-500"}`}>
                    {pdfOuvert ? (
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
                      Veuillez lire attentivement le règlement intérieur de l&apos;école avant de signer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleOuvrirPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors text-sm"
                      >
                        <Eye size={16} />
                        Consulter le règlement
                      </button>
                      <a
                        href="/documents/reglement-interieur.pdf"
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Download size={16} />
                        Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Étape 2: Signer */}
              <div className={`p-4 rounded-xl border-2 ${signatureStatus?.signed ? "border-emerald-500 bg-emerald-50" : pdfOuvert ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${signatureStatus?.signed ? "bg-emerald-500" : pdfOuvert ? "bg-violet-500" : "bg-gray-300"}`}>
                    {signatureStatus?.signed ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <span className="text-white font-bold">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Signer électroniquement
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      En signant, vous acceptez les termes du règlement intérieur de l&apos;école.
                    </p>

                    {!signatureStatus?.signed && pdfOuvert && (
                      <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={accepteReglement}
                            onChange={(e) => setAccepteReglement(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-0.5"
                          />
                          <span className="text-sm text-gray-700">
                            J&apos;ai lu et j&apos;accepte le règlement intérieur de l&apos;école Mon École et Moi.
                            Je m&apos;engage à respecter les règles établies.
                          </span>
                        </label>

                        {error && (
                          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2">
                            <AlertCircle size={18} className="text-rose-500" />
                            <p className="text-sm text-rose-700">{error}</p>
                          </div>
                        )}

                        <button
                          onClick={handleSigner}
                          disabled={!accepteReglement || isLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Shield size={18} />
                          )}
                          {isLoading ? "Signature en cours..." : "Signer le règlement"}
                        </button>
                      </div>
                    )}

                    {!pdfOuvert && (
                      <p className="text-sm text-gray-400 italic">
                        Veuillez d&apos;abord consulter le règlement intérieur
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-violet-900 mb-1">
                  Signature électronique
                </h3>
                <p className="text-sm text-violet-800">
                  Votre signature électronique a valeur légale. Elle sera horodatée et associée
                  à votre adresse IP pour garantir son authenticité.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isLoadingStatus && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-violet-600" />
        </div>
      )}

      {success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Signature enregistrée !
            </h2>
            <p className="text-gray-600 mb-6">
              Le règlement intérieur a été signé avec succès.
              L&apos;inscription de votre enfant est maintenant complète.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

