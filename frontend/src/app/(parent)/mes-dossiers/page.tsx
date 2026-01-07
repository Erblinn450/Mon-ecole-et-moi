"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderOpen, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PhoneCall,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Eye,
  FileSignature,
  Upload,
  Check,
  X
} from "lucide-react";
import { StatutPreinscription, Classe } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Dossier {
  id: number;
  numeroDossier: string;
  nomEnfant: string;
  prenomEnfant: string;
  classeSouhaitee: Classe;
  classeActuelle?: string;
  statut: StatutPreinscription;
  dateDemande: string;
  compteCree?: boolean;
  enfantId?: number | null;
  enfant?: {
    id: number;
    nom: string;
    prenom: string;
    classe: Classe;
  } | null;
}

interface SignatureStatus {
  signed: boolean;
  signature?: {
    parentAccepte: boolean;
    parentDateSignature: string;
  };
}

const statutConfig = {
  [StatutPreinscription.EN_ATTENTE]: {
    label: "En attente",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: Clock,
    message: "Votre dossier est en cours d'examen. Nous vous contacterons prochainement.",
  },
  [StatutPreinscription.DEJA_CONTACTE]: {
    label: "Contacté",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: PhoneCall,
    message: "Nous vous avons contacté. N'hésitez pas à nous rappeler.",
  },
  [StatutPreinscription.VALIDE]: {
    label: "Validé",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: CheckCircle,
    message: "Félicitations ! Votre dossier a été validé. Veuillez finaliser l'inscription.",
  },
  [StatutPreinscription.REFUSE]: {
    label: "Refusé",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    icon: XCircle,
    message: "Nous sommes désolés, votre demande n'a pas pu être acceptée.",
  },
  [StatutPreinscription.ANNULE]: {
    label: "Annulé",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-800",
    icon: XCircle,
    message: "Ce dossier a été annulé.",
  },
};

const classeLabels: Record<Classe, string> = {
  [Classe.MATERNELLE]: "Maternelle",
  [Classe.ELEMENTAIRE]: "Élémentaire",
  [Classe.COLLEGE]: "Collège",
};

export default function MesDossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // États pour les PDF ouverts et signatures
  const [pdfOuverts, setPdfOuverts] = useState<Record<number, boolean>>({});
  const [signatures, setSignatures] = useState<Record<number, boolean>>({});
  
  // Modal de signature
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [parentName, setParentName] = useState("");
  const [accepteReglement, setAccepteReglement] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  // Recherche
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/connexion";
        return;
      }

      // Charger les dossiers du parent (route spécifique parent)
      const response = await fetch(`${API_URL}/preinscriptions/mes-dossiers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des dossiers");
      }

      const data = await response.json();
      setDossiers(data);

      // Charger les statuts PDF et signatures pour chaque dossier validé avec enfant
      for (const dossier of data) {
        if (dossier.statut === StatutPreinscription.VALIDE && dossier.enfantId) {
          await loadPdfStatus(dossier.enfantId);
          await loadSignatureStatus(dossier.enfantId);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPdfStatus = async (dossierId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/documents/reglement-ouvert/${dossierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPdfOuverts(prev => ({ ...prev, [dossierId]: data.opened || false }));
      }
    } catch {
      setPdfOuverts(prev => ({ ...prev, [dossierId]: false }));
    }
  };

  const loadSignatureStatus = async (dossierId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/signatures/status/${dossierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data: SignatureStatus = await response.json();
        setSignatures(prev => ({ ...prev, [dossierId]: data.signed || false }));
      }
    } catch {
      setSignatures(prev => ({ ...prev, [dossierId]: false }));
    }
  };

  // Ouvrir le PDF et tracker (utilise enfantId)
  const ouvrirReglement = async (enfantId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // Enregistrer l'ouverture
      await fetch(`${API_URL}/documents/reglement-ouvert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enfant_id: enfantId,
          document_type: "reglement-interieur",
        }),
      });

      // Marquer comme ouvert localement
      setPdfOuverts(prev => ({ ...prev, [enfantId]: true }));

      // Ouvrir le PDF
      window.open("/documents/reglement-interieur.pdf", "_blank");
    } catch (err) {
      console.error("Erreur ouverture PDF:", err);
      // Ouvrir quand même le PDF
      window.open("/documents/reglement-interieur.pdf", "_blank");
    }
  };

  // Ouvrir le modal de signature
  const ouvrirModalSignature = (dossier: Dossier) => {
    if (!dossier.enfantId || !pdfOuverts[dossier.enfantId]) {
      alert("Veuillez d'abord consulter le règlement intérieur");
      return;
    }
    
    setSelectedDossier(dossier);
    setParentName("");
    setAccepteReglement(false);
    setSignSuccess(false);
    setModalOpen(true);
  };

  // Signer le règlement
  const signerReglement = async () => {
    if (!selectedDossier || !selectedDossier.enfantId || !parentName.trim() || !accepteReglement) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setIsSigning(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/signatures/signer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enfantId: selectedDossier.enfantId, // Utiliser enfantId, pas l'id de la préinscription
          signatureData: `Signature de ${parentName} - ${new Date().toISOString()}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la signature");
      }

      setSignSuccess(true);
      setSignatures(prev => ({ ...prev, [selectedDossier.enfantId!]: true }));

      // Fermer le modal après 2s
      setTimeout(() => {
        setModalOpen(false);
        loadDossiers();
      }, 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la signature");
    } finally {
      setIsSigning(false);
    }
  };

  // Filtrer les dossiers
  const filteredDossiers = dossiers.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.numeroDossier.toLowerCase().includes(query) ||
      d.nomEnfant.toLowerCase().includes(query) ||
      d.prenomEnfant.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FolderOpen size={20} className="text-white" />
          </div>
          Mes dossiers de préinscription
        </h1>
        <p className="text-gray-500 mt-2">
          Suivez l&apos;avancement de vos demandes et finalisez les inscriptions
        </p>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro ou nom..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={20} />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* Liste des dossiers */}
      {filteredDossiers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FolderOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun dossier
          </h3>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore de demande de préinscription.
          </p>
          <Link
            href="/preinscription-enfant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} /> Nouvelle préinscription
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDossiers.map((dossier) => {
            const statut = statutConfig[dossier.statut];
            const StatutIcon = statut.icon;
            const isValide = dossier.statut === StatutPreinscription.VALIDE;
            const enfantId = dossier.enfantId;
            const pdfOuvert = enfantId ? (pdfOuverts[enfantId] || false) : false;
            const isSigned = enfantId ? (signatures[enfantId] || false) : false;

            return (
              <div
                key={dossier.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${statut.border}`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statut.bg}`}>
                        <FolderOpen size={24} className={statut.text} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {dossier.prenomEnfant} {dossier.nomEnfant}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {classeLabels[dossier.classeSouhaitee]}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          {dossier.numeroDossier}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statut.bg} ${statut.text}`}>
                        <StatutIcon size={14} />
                        {statut.label}
                      </span>
                      <p className="text-xs text-gray-500">
                        Demande du{" "}
                        {new Date(dossier.dateDemande).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message selon statut */}
                <div className={`px-6 py-4 ${statut.bg}`}>
                  <p className={`text-sm ${statut.text}`}>
                    {statut.message}
                  </p>
                </div>

                {/* Actions pour dossier validé avec enfant créé */}
                {isValide && enfantId && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Bouton Règlement */}
                      <button
                        onClick={() => ouvrirReglement(enfantId)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors text-sm"
                      >
                        <FileText size={16} />
                        📄 Règlement
                      </button>

                      {/* Bouton Signer */}
                      {isSigned ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 font-medium rounded-xl text-sm">
                          <CheckCircle size={16} />
                          ✅ Règlement signé
                        </span>
                      ) : (
                        <button
                          onClick={() => ouvrirModalSignature(dossier)}
                          disabled={!pdfOuvert}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl transition-colors text-sm ${
                            pdfOuvert
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              : "bg-amber-500 text-white cursor-not-allowed opacity-70"
                          }`}
                          title={pdfOuvert ? "Cliquez pour signer" : "Veuillez d'abord consulter le règlement"}
                        >
                          <FileSignature size={16} />
                          ✍️ Signer le règlement
                        </button>
                      )}

                      {/* Bouton Documents */}
                      <Link
                        href={`/fournir-documents?dossierId=${dossier.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
                      >
                        <Upload size={16} />
                        📂 Fournir docs
                      </Link>
                    </div>

                    {!pdfOuvert && !isSigned && (
                      <p className="text-xs text-amber-600 mt-3">
                        ⚠️ Veuillez d&apos;abord consulter le règlement intérieur pour pouvoir le signer
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/preinscription-enfant"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl"
        >
          <Plus size={18} /> Nouvelle préinscription
        </Link>
        <Link
          href="/reinscription"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <RefreshCw size={18} /> Réinscription
        </Link>
      </div>

      {/* Modal de signature */}
      {modalOpen && selectedDossier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileSignature size={20} className="text-emerald-600" />
                Signature du Règlement Intérieur
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {signSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Signature enregistrée !
                  </h3>
                  <p className="text-gray-600">
                    Le règlement intérieur a été signé avec succès pour {selectedDossier.prenomEnfant}.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    En signant, vous confirmez avoir lu et accepté le règlement intérieur 
                    de l&apos;école pour <strong>{selectedDossier.prenomEnfant} {selectedDossier.nomEnfant}</strong>.
                  </p>

                  {/* Section Parent */}
                  <div className="bg-sky-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-sky-900 mb-4 flex items-center gap-2">
                      📋 Signature du Parent
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Votre nom complet
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Ex: Marie Dupont"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accepteReglement}
                        onChange={(e) => setAccepteReglement(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <span className="text-sm text-gray-700">
                        Je confirme avoir lu et accepté le règlement intérieur de l&apos;école Mon École et Moi.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={signerReglement}
                      disabled={!parentName.trim() || !accepteReglement || isSigning}
                      className="flex-1 py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSigning ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      {isSigning ? "Signature..." : "✅ Valider la signature"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

