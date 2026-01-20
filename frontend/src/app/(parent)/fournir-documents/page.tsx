"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  File,
  Trash2,
  Eye,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface TypeJustificatif {
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
  valide: boolean | null;
  dateDepot: string;
  dateValidation?: string;
  commentaireValidation?: string;
}

interface Dossier {
  id: number;
  numeroDossier: string;
  prenomEnfant: string;
  nomEnfant: string;
  enfantId: number | null;
}

export default function FournirDocumentsPage() {
  const searchParams = useSearchParams();
  const dossierId = searchParams.get("dossierId");

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [typesJustificatifs, setTypesJustificatifs] = useState<TypeJustificatif[]>([]);
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingType, setUploadingType] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (dossierId) {
      loadData();
    }
  }, [dossierId]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/connexion";
        return;
      }

      // Charger le dossier
      const dossierResponse = await fetch(`${API_URL}/preinscriptions/${dossierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!dossierResponse.ok) {
        throw new Error("Dossier non trouvé");
      }

      const dossierData = await dossierResponse.json();
      setDossier(dossierData);

      // Charger les types de justificatifs attendus
      const typesResponse = await fetch(`${API_URL}/justificatifs/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (typesResponse.ok) {
        const types = await typesResponse.json();
        // Exclure le type "Règlement intérieur signé" (géré via signature électronique)
        setTypesJustificatifs(types.filter((t: TypeJustificatif) =>
          t.id !== 5 && !t.nom.toLowerCase().includes('règlement')
        ));
      }

      // Charger les justificatifs déjà déposés
      if (dossierData.enfantId) {
        const justifsResponse = await fetch(`${API_URL}/justificatifs/enfant/${dossierData.enfantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (justifsResponse.ok) {
          setJustificatifs(await justifsResponse.json());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (typeId: number, file: File) => {
    if (!dossier?.enfantId) {
      alert("Erreur : enfant non associé au dossier");
      return;
    }

    setUploadingType(typeId);

    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("enfantId", dossier.enfantId.toString());
      formData.append("typeId", typeId.toString());

      const response = await fetch(`${API_URL}/justificatifs/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de l'upload");
      }

      // Recharger les justificatifs
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (justificatifId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/justificatifs/${justificatifId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Recharger les justificatifs
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  // Obtenir le justificatif déposé pour un type donné
  const getJustificatifForType = (typeId: number) => {
    return justificatifs.find((j) => j.typeId === typeId);
  };

  // Vérifier si tous les documents obligatoires sont validés
  const allDocumentsValidated = typesJustificatifs
    .filter((t) => t.obligatoire)
    .every((t) => {
      const justif = getJustificatifForType(t.id);
      return justif && justif.valide === true;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200">
        <p className="text-rose-700">{error || "Dossier non trouvé"}</p>
        <Link href="/mes-dossiers" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Retour à mes dossiers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mes-dossiers" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Upload size={20} className="text-white" />
            </div>
            Fournir les documents
          </h1>
          <p className="text-gray-500 mt-1">
            Dossier de <strong>{dossier.prenomEnfant} {dossier.nomEnfant}</strong> - {dossier.numeroDossier}
          </p>
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800">
          <strong>📋 Documents requis</strong><br />
          Pour finaliser l&apos;inscription, veuillez fournir tous les documents obligatoires ci-dessous.
          L&apos;administration validera chaque document.
        </p>
      </div>

      {/* Statut global */}
      {allDocumentsValidated ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-600" size={24} />
          <div>
            <p className="font-semibold text-emerald-800">Tous les documents sont validés !</p>
            <p className="text-sm text-emerald-700">L&apos;inscription est en cours de finalisation.</p>
          </div>
        </div>
      ) : null}

      {/* Liste des documents */}
      <div className="space-y-4">
        {typesJustificatifs.map((type) => {
          const justif = getJustificatifForType(type.id);
          const isUploading = uploadingType === type.id;

          return (
            <div
              key={type.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Info du document */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} className="text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">
                        {type.nom}
                        {type.obligatoire && <span className="text-rose-500 ml-1">*</span>}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{type.description}</p>

                    {/* Statut du justificatif */}
                    {justif ? (
                      <div className="space-y-2">
                        {/* Fichier déposé */}
                        <div className="flex items-center gap-2 text-sm">
                          <File size={16} className="text-gray-400" />
                          <span className="text-gray-700">Document déposé le {new Date(justif.dateDepot).toLocaleDateString("fr-FR")}</span>
                        </div>

                        {/* Statut de validation */}
                        {justif.valide === true ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle size={14} /> Validé
                            </span>
                            {justif.dateValidation && (
                              <span className="text-xs text-gray-500">
                                le {new Date(justif.dateValidation).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        ) : justif.valide === false ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
                                <XCircle size={14} /> Refusé
                              </span>
                            </div>
                            {justif.commentaireValidation && (
                              <p className="mt-2 text-sm text-rose-600 bg-rose-50 p-2 rounded-lg">
                                Motif : {justif.commentaireValidation}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                              <Clock size={14} /> En attente de validation
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Aucun document déposé</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {justif && (
                      <>
                        <a
                          href={`${API_URL}/storage/${justif.fichierUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                          title="Voir le document"
                        >
                          <Eye size={18} />
                        </a>
                        {justif.valide !== true && (
                          <button
                            onClick={() => handleDelete(justif.id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </>
                    )}

                    {/* Bouton upload (si pas de justif ou refusé) */}
                    {(!justif || justif.valide === false) && (
                      <>
                        <input
                          type="file"
                          ref={(el) => { fileInputRefs.current[type.id] = el; }}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(type.id, file);
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[type.id]?.click()}
                          disabled={isUploading}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Upload size={18} />
                          )}
                          {justif?.valide === false ? "Renvoyer" : "Déposer"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/mes-dossiers"
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Retour à mes dossiers
        </Link>

        {allDocumentsValidated && (
          <span className="text-emerald-600 font-medium flex items-center gap-2">
            <CheckCircle size={18} />
            Dossier complet !
          </span>
        )}
      </div>
    </div>
  );
}

