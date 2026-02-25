"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Receipt,
  User,
  GraduationCap,
  FileX,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  Send,
  Download,
  XCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
} from "lucide-react";
import { facturationApi } from "@/lib/api";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Facture,
  StatutFacture,
  TypeFacture,
  ModePaiement,
  TypeLigne,
} from "@/types";

const typeLigneLabels: Record<TypeLigne, string> = {
  [TypeLigne.SCOLARITE]: "Scolarité",
  [TypeLigne.REPAS]: "Repas",
  [TypeLigne.PERISCOLAIRE]: "Périscolaire",
  [TypeLigne.DEPASSEMENT]: "Dépassement",
  [TypeLigne.INSCRIPTION]: "Inscription",
  [TypeLigne.MATERIEL]: "Matériel",
  [TypeLigne.REDUCTION]: "Réduction",
  [TypeLigne.PERSONNALISE]: "Personnalisé",
};

// Étapes du cycle de vie d'une facture (pour le fil d'Ariane visuel)
const etapes = [
  { statut: StatutFacture.EN_ATTENTE, label: "À vérifier" },
  { statut: StatutFacture.ENVOYEE, label: "Envoyée" },
  { statut: StatutFacture.PARTIELLE, label: "En cours" },
  { statut: StatutFacture.PAYEE, label: "Payée" },
];

// Transitions autorisées (miroir du backend)
const TRANSITIONS_VALIDES: Record<StatutFacture, StatutFacture[]> = {
  EN_ATTENTE: [StatutFacture.ENVOYEE, StatutFacture.ANNULEE],
  ENVOYEE: [StatutFacture.PAYEE, StatutFacture.PARTIELLE, StatutFacture.EN_RETARD, StatutFacture.ANNULEE],
  PARTIELLE: [StatutFacture.PAYEE, StatutFacture.EN_RETARD, StatutFacture.ANNULEE],
  PAYEE: [],
  EN_RETARD: [StatutFacture.PAYEE, StatutFacture.PARTIELLE, StatutFacture.ANNULEE],
  ANNULEE: [],
};

function getEtapeIndex(statut: StatutFacture): number {
  if (statut === StatutFacture.ANNULEE) return -1;
  // EN_RETARD est visuellement au même niveau que PARTIELLE (étape "En cours")
  if (statut === StatutFacture.EN_RETARD) return 2;
  return etapes.findIndex((e) => e.statut === statut);
}

function canTransitionTo(from: StatutFacture, to: StatutFacture): boolean {
  return TRANSITIONS_VALIDES[from]?.includes(to) ?? false;
}

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const factureId = Number(params.id);

  const [facture, setFacture] = useState<Facture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formulaire ajout ligne
  const [showAjoutLigne, setShowAjoutLigne] = useState(false);
  const [nouvelleLigne, setNouvelleLigne] = useState({
    description: "",
    quantite: 1,
    prixUnit: 0,
    type: TypeLigne.PERSONNALISE,
    commentaire: "",
  });

  // Formulaire paiement
  const [showPaiement, setShowPaiement] = useState(false);
  const [nouveauPaiement, setNouveauPaiement] = useState({
    montant: 0,
    datePaiement: new Date().toISOString().split("T")[0],
    modePaiement: ModePaiement.VIREMENT,
    reference: "",
    commentaire: "",
  });

  // Édition ligne
  const [editingLigneId, setEditingLigneId] = useState<number | null>(null);
  const [editLigne, setEditLigne] = useState({ description: "", quantite: 1, prixUnit: 0, commentaire: "" });

  // Modal de confirmation
  const [confirmModal, setConfirmModal] = useState<{
    title: string; message: string; variant: "danger" | "warning" | "default"; onConfirm: () => void;
  } | null>(null);

  // Édition IBAN
  const [editingIban, setEditingIban] = useState(false);
  const [ibanForm, setIbanForm] = useState({ ibanParent: "", mandatSepaRef: "" });

  // Options secondaires
  const [showOptions, setShowOptions] = useState(false);

  const loadFacture = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await facturationApi.getById(factureId);
      setFacture(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [factureId]);

  useEffect(() => {
    loadFacture();
  }, [loadFacture]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleChangeStatut = async (statut: StatutFacture) => {
    setActionLoading(true);
    try {
      await facturationApi.updateStatut(factureId, statut);
      await loadFacture();
      const labels: Record<string, string> = {
        ENVOYEE: "Facture marquée comme envoyée",
        PAYEE: "Facture marquée comme payée",
        EN_RETARD: "Facture marquée comme impayée",
        EN_ATTENTE: "Facture à corriger",
        ANNULEE: "Facture annulée",
      };
      showSuccess(labels[statut] || "Statut mis à jour");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAjouterLigne = async () => {
    setActionLoading(true);
    try {
      await facturationApi.ajouterLigne(factureId, {
        description: nouvelleLigne.description,
        quantite: nouvelleLigne.quantite,
        prixUnit: nouvelleLigne.prixUnit,
        type: nouvelleLigne.type,
        commentaire: nouvelleLigne.commentaire || undefined,
      });
      setShowAjoutLigne(false);
      setNouvelleLigne({ description: "", quantite: 1, prixUnit: 0, type: TypeLigne.PERSONNALISE, commentaire: "" });
      await loadFacture();
      showSuccess("Ligne ajoutée");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditLigne = (ligne: { id: number; description: string; quantite: number; prixUnit: number | string; commentaire?: string | null }) => {
    setEditingLigneId(ligne.id);
    setEditLigne({
      description: ligne.description,
      quantite: ligne.quantite,
      prixUnit: Number(ligne.prixUnit),
      commentaire: ligne.commentaire ?? "",
    });
  };

  const handleModifierLigne = async () => {
    if (!editingLigneId) return;
    setActionLoading(true);
    try {
      await facturationApi.modifierLigne(factureId, editingLigneId, {
        description: editLigne.description,
        quantite: editLigne.quantite,
        prixUnit: editLigne.prixUnit,
        commentaire: editLigne.commentaire || undefined,
      });
      setEditingLigneId(null);
      await loadFacture();
      showSuccess("Ligne modifiée");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSupprimerLigne = (ligneId: number) => {
    setConfirmModal({
      title: "Supprimer cette ligne ?",
      message: "Cette action est irréversible.",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await facturationApi.supprimerLigne(factureId, ligneId);
          await loadFacture();
          showSuccess("Ligne supprimée");
        } catch (err) {
          alert(err instanceof Error ? err.message : "Erreur");
        }
      },
    });
  };

  const handleEnregistrerPaiement = async () => {
    setActionLoading(true);
    try {
      await facturationApi.enregistrerPaiement(factureId, {
        montant: nouveauPaiement.montant,
        datePaiement: nouveauPaiement.datePaiement,
        modePaiement: nouveauPaiement.modePaiement,
        reference: nouveauPaiement.reference || undefined,
        commentaire: nouveauPaiement.commentaire || undefined,
      });
      setShowPaiement(false);
      setNouveauPaiement({ montant: 0, datePaiement: new Date().toISOString().split("T")[0], modePaiement: ModePaiement.VIREMENT, reference: "", commentaire: "" });
      await loadFacture();
      showSuccess("Paiement enregistré");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await facturationApi.downloadPdf(factureId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${facture?.numero || factureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    }
  };

  const handleSaveIban = async () => {
    if (!facture?.parent) return;
    setActionLoading(true);
    try {
      await facturationApi.updateParentSepa(facture.parent.id, {
        ibanParent: ibanForm.ibanParent || undefined,
        mandatSepaRef: ibanForm.mandatSepaRef || undefined,
      });
      setEditingIban(false);
      await loadFacture();
      showSuccess("IBAN mis à jour");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreerAvoir = async () => {
    setActionLoading(true);
    try {
      const avoir = await facturationApi.creerAvoir(factureId);
      router.push(`/admin/facturation/${avoir.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-rose-50 rounded-xl border border-rose-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-rose-500" size={24} />
          <p className="text-rose-700">{error ?? "Facture non trouvée"}</p>
        </div>
      </div>
    );
  }

  const resteAPayer = Number(facture.montantTotal) - Number(facture.montantPaye);
  const etapeActuelle = getEtapeIndex(facture.statut);
  const isAnnulee = facture.statut === StatutFacture.ANNULEE;

  return (
    <div className="space-y-6">
      {/* Message de succès */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={18} className="text-emerald-600" />
          <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/facturation")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Facture {facture.numero}
          </h1>
          <p className="text-gray-500 mt-1">
            {facture.enfant
              ? `${facture.enfant.prenom} ${facture.enfant.nom}`
              : "Famille"}{" "}
            — {facture.periode ?? "-"}
          </p>
        </div>
        {/* Télécharger PDF — toujours visible */}
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          <Download size={16} />
          Télécharger PDF
        </button>
      </div>

      {/* Fil d'Ariane visuel — responsive (horizontal desktop, vertical mobile) */}
      {!isAnnulee ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Desktop : horizontal */}
          <div className="hidden md:flex items-center justify-between">
            {etapes.map((etape, i) => {
              const isActive = i === etapeActuelle;
              const isDone = i < etapeActuelle;
              const blockedByPayment = etape.statut === StatutFacture.PAYEE && resteAPayer > 0.01;
              const clickable = !isActive && !blockedByPayment && canTransitionTo(facture.statut, etape.statut);
              return (
                <div key={etape.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      disabled={!clickable || actionLoading}
                      onClick={() => {
                        if (!clickable) return;
                        const msgs: Record<string, { title: string; message: string }> = {
                          ENVOYEE: { title: "Envoyer la facture ?", message: "Cette facture sera marquée comme envoyée au parent." },
                          PAYEE: { title: "Marquer comme payée ?", message: "Cette facture sera marquée comme entièrement payée." },
                        };
                        const m = msgs[etape.statut];
                        if (m) {
                          setConfirmModal({ ...m, variant: "default", onConfirm: () => { setConfirmModal(null); handleChangeStatut(etape.statut); } });
                        } else {
                          handleChangeStatut(etape.statut);
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isDone ? "bg-emerald-100 text-emerald-700"
                          : isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                            : "bg-gray-100 text-gray-400"
                      } ${clickable ? "cursor-pointer hover:ring-4 hover:ring-indigo-100 hover:scale-110" : "cursor-default"} ${!clickable && !isActive ? "opacity-60" : ""}`}
                      title={blockedByPayment ? `Enregistrez d'abord le paiement (reste ${resteAPayer.toFixed(2)} €)` : clickable ? `Passer à "${etape.label}"` : undefined}
                    >
                      {isDone ? "✓" : i + 1}
                    </button>
                    <span className={`mt-2 text-xs font-medium ${isActive ? "text-indigo-700" : isDone ? "text-emerald-600" : "text-gray-400"} ${clickable ? "underline decoration-dotted cursor-pointer" : ""}`}>
                      {etape.label}
                    </span>
                  </div>
                  {i < etapes.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${i < etapeActuelle ? "bg-emerald-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile : vertical */}
          <div className="flex flex-col gap-2 md:hidden">
            {etapes.map((etape, i) => {
              const isActive = i === etapeActuelle;
              const isDone = i < etapeActuelle;
              const blockedByPayment = etape.statut === StatutFacture.PAYEE && resteAPayer > 0.01;
              const clickable = !isActive && !blockedByPayment && canTransitionTo(facture.statut, etape.statut);
              return (
                <button
                  key={etape.label}
                  disabled={!clickable || actionLoading}
                  onClick={() => {
                    if (!clickable) return;
                    const msgs: Record<string, { title: string; message: string }> = {
                      ENVOYEE: { title: "Envoyer la facture ?", message: "Cette facture sera marquée comme envoyée au parent." },
                      PAYEE: { title: "Marquer comme payée ?", message: "Cette facture sera marquée comme entièrement payée." },
                    };
                    const m = msgs[etape.statut];
                    if (m) {
                      setConfirmModal({ ...m, variant: "default", onConfirm: () => { setConfirmModal(null); handleChangeStatut(etape.statut); } });
                    } else {
                      handleChangeStatut(etape.statut);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? "bg-indigo-50 border-2 border-indigo-300"
                      : isDone ? "bg-emerald-50 border border-emerald-200"
                        : "bg-gray-50 border border-gray-200"
                  } ${clickable ? "hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer" : "cursor-default"} ${!clickable && !isActive && !isDone ? "opacity-50" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isDone ? "bg-emerald-100 text-emerald-700"
                      : isActive ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-indigo-700" : isDone ? "text-emerald-600" : "text-gray-400"}`}>
                    {etape.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-gray-500 font-medium">Cette facture a été annulée</p>
        </div>
      )}

      {/* Bandeau avoir */}
      {facture.type === TypeFacture.AVOIR && facture.factureSource && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <FileX size={20} className="text-purple-600" />
          <p className="text-sm text-purple-800">
            Cet avoir annule la facture{" "}
            <button
              onClick={() => router.push(`/admin/facturation/${facture.factureSource!.id}`)}
              className="font-semibold underline hover:text-purple-900"
            >
              {facture.factureSource.numero}
            </button>
          </p>
        </div>
      )}

      {/* Lien vers avoir(s) associé(s) */}
      {facture.avoirs && facture.avoirs.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <FileX size={20} className="text-purple-600" />
          <p className="text-sm text-purple-800">
            Avoir(s) associé(s) :{" "}
            {facture.avoirs.map((av, i) => (
              <span key={av.id}>
                {i > 0 && ", "}
                <button
                  onClick={() => router.push(`/admin/facturation/${av.id}`)}
                  className="font-semibold underline hover:text-purple-900"
                >
                  {av.numero}
                </button>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Infos parent + enfant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Parent</h3>
          </div>
          {facture.parent ? (
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {facture.parent.prenom ?? ""} {facture.parent.nom ?? ""}
              </p>
              <p>{facture.parent.email}</p>
              {/* IBAN / Mandat SEPA */}
              {!editingIban ? (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase font-semibold">IBAN / SEPA</span>
                    <button
                      onClick={() => {
                        setIbanForm({
                          ibanParent: facture.parent?.ibanParent ?? "",
                          mandatSepaRef: facture.parent?.mandatSepaRef ?? "",
                        });
                        setEditingIban(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Modifier
                    </button>
                  </div>
                  {facture.parent.ibanParent ? (
                    <>
                      <p className="font-mono text-xs mt-1">{facture.parent.ibanParent}</p>
                      {facture.parent.mandatSepaRef && (
                        <p className="text-xs text-gray-400">Mandat : {facture.parent.mandatSepaRef}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Non renseigné</p>
                  )}
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">IBAN</label>
                    <input
                      type="text"
                      value={ibanForm.ibanParent}
                      onChange={(e) => setIbanForm({ ...ibanForm, ibanParent: e.target.value.toUpperCase() })}
                      placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Réf. mandat SEPA</label>
                    <input
                      type="text"
                      value={ibanForm.mandatSepaRef}
                      onChange={(e) => setIbanForm({ ...ibanForm, mandatSepaRef: e.target.value })}
                      placeholder="MNDT-2026-001"
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveIban}
                      disabled={actionLoading}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingIban(false)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Non renseigné</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Enfant</h3>
          </div>
          {facture.enfant ? (
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {facture.enfant.prenom} {facture.enfant.nom}
              </p>
              <p>Classe : {facture.enfant.classe ?? "-"}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Famille entière</p>
          )}
        </div>
      </div>

      {/* Montants */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500">Total facturé</p>
            <p className="text-2xl font-bold text-gray-900">{Number(facture.montantTotal).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Déjà payé</p>
            <p className="text-2xl font-bold text-emerald-600">{Number(facture.montantPaye).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reste à payer</p>
            <p className={`text-2xl font-bold ${resteAPayer > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {resteAPayer.toFixed(2)} €
            </p>
          </div>
        </div>
      </div>

      {/* === ACTION PRINCIPALE — guidée selon le statut === */}
      {!isAnnulee && (
        <div className="space-y-3">
          {/* BROUILLON → Prochaine étape : envoyer */}
          {facture.statut === StatutFacture.EN_ATTENTE && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-amber-800 text-sm mb-3">
                Cette facture est prête à être vérifiée. Vérifiez les lignes ci-dessous puis envoyez-la au parent.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleChangeStatut(StatutFacture.ENVOYEE)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Send size={18} />
                  Envoyer la facture
                </button>
                <button
                  onClick={() => setShowAjoutLigne(!showAjoutLigne)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-300 text-amber-800 rounded-xl hover:bg-amber-100 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Ajouter une ligne
                </button>
              </div>
            </div>
          )}

          {/* ENVOYÉE → En attente de paiement */}
          {facture.statut === StatutFacture.ENVOYEE && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-800 text-sm mb-3">
                    Facture envoyée au parent. Quand vous recevez le paiement :
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPaiement(!showPaiement)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      Enregistrer un paiement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PARTIELLE → Il reste un montant à payer */}
          {facture.statut === StatutFacture.PARTIELLE && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-800 text-sm mb-3">
                    {Number(facture.montantPaye) > 0
                      ? <>Paiement partiel reçu ({Number(facture.montantPaye).toFixed(2)} €). Il reste <strong>{resteAPayer.toFixed(2)} €</strong> à percevoir.</>
                      : <>Il reste <strong>{resteAPayer.toFixed(2)} €</strong> à percevoir.</>
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPaiement(!showPaiement)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      Enregistrer le solde
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EN RETARD → Relancer ou enregistrer */}
          {facture.statut === StatutFacture.EN_RETARD && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-rose-800 text-sm mb-3">
                    Cette facture est <strong>impayée</strong>. Reste dû : <strong>{resteAPayer.toFixed(2)} €</strong>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPaiement(!showPaiement)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      Enregistrer un paiement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAYÉE → Tout est bon */}
          {facture.statut === StatutFacture.PAYEE && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-600" />
                <p className="text-emerald-800 font-medium">
                  Cette facture est entièrement payée.
                </p>
              </div>
            </div>
          )}

          {/* Options secondaires (repliables) */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Autres actions
            {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showOptions && (
            <div className="flex flex-wrap gap-2 pl-1">
              {/* Marquer en retard */}
              {(facture.statut === StatutFacture.ENVOYEE || facture.statut === StatutFacture.PARTIELLE) && (
                <button
                  onClick={() => handleChangeStatut(StatutFacture.EN_RETARD)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <AlertCircle size={14} />
                  Marquer impayé
                </button>
              )}
              {/* Marquer payée — uniquement si tout est payé */}
              {resteAPayer <= 0.01 &&
                (facture.statut === StatutFacture.ENVOYEE ||
                  facture.statut === StatutFacture.PARTIELLE ||
                  facture.statut === StatutFacture.EN_RETARD) && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      title: "Marquer comme payée ?",
                      message: "Cette facture sera marquée comme entièrement payée.",
                      variant: "default",
                      onConfirm: () => { setConfirmModal(null); handleChangeStatut(StatutFacture.PAYEE); },
                    });
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <CheckCircle size={14} />
                  Marquer payée
                </button>
              )}
              {/* Créer un avoir */}
              {(facture.statut === StatutFacture.ENVOYEE ||
                facture.statut === StatutFacture.PARTIELLE ||
                facture.statut === StatutFacture.EN_RETARD) && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      title: "Créer un avoir ?",
                      message: `Un avoir va être créé pour annuler la facture ${facture.numero}. La facture sera annulée et un avoir (montant négatif) sera émis.`,
                      variant: "danger",
                      onConfirm: () => { setConfirmModal(null); handleCreerAvoir(); },
                    });
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FileX size={14} />
                  Créer un avoir
                </button>
              )}
              {/* Annuler — toujours en dernier, en rouge discret */}
              {facture.statut !== StatutFacture.PAYEE && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      title: "Annuler cette facture ?",
                      message: "Cette action est irréversible. La facture ne pourra plus être modifiée.",
                      variant: "danger",
                      onConfirm: () => { setConfirmModal(null); handleChangeStatut(StatutFacture.ANNULEE); },
                    });
                  }}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <XCircle size={14} />
                  Annuler la facture
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulaire paiement */}
      {showPaiement && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 space-y-4">
          <h3 className="font-semibold text-emerald-900">Enregistrer un paiement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                value={nouveauPaiement.montant || ""}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, montant: parseFloat(e.target.value) || 0 })}
                placeholder={resteAPayer.toFixed(2)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">Reste dû : {resteAPayer.toFixed(2)} €</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du paiement</label>
              <input
                type="date"
                value={nouveauPaiement.datePaiement}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, datePaiement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select
                value={nouveauPaiement.modePaiement}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, modePaiement: e.target.value as ModePaiement })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="VIREMENT">Virement</option>
                <option value="PRELEVEMENT">Prélèvement</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence (optionnel)</label>
              <input
                type="text"
                value={nouveauPaiement.reference}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, reference: e.target.value })}
                placeholder="Ex: VIR-20260205"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
              <input
                type="text"
                value={nouveauPaiement.commentaire}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEnregistrerPaiement}
              disabled={nouveauPaiement.montant <= 0 || actionLoading}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading ? "En cours..." : "Valider le paiement"}
            </button>
            <button
              onClick={() => setShowPaiement(false)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Formulaire ajout ligne */}
      {showAjoutLigne && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Ajouter une ligne à la facture</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={nouvelleLigne.description}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, description: e.target.value })}
                placeholder="Ex: Repas cantine octobre"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input
                type="number"
                min="1"
                value={nouvelleLigne.quantite}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, quantite: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
              <input
                type="number"
                step="0.01"
                value={nouvelleLigne.prixUnit || ""}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, prixUnit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={nouvelleLigne.type}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, type: e.target.value as TypeLigne })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(typeLigneLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
              <input
                type="text"
                value={nouvelleLigne.commentaire}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, commentaire: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAjouterLigne}
              disabled={!nouvelleLigne.description || nouvelleLigne.prixUnit === 0 || actionLoading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoading ? "En cours..." : "Ajouter"}
            </button>
            <button
              onClick={() => setShowAjoutLigne(false)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Lignes de facture */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Receipt size={18} className="text-indigo-600" />
            Détail de la facture ({facture.lignes.length} ligne{facture.lignes.length > 1 ? "s" : ""})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qté</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                {facture.statut === StatutFacture.EN_ATTENTE && (
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facture.lignes.map((ligne) => (
                editingLigneId === ligne.id ? (
                  <tr key={ligne.id} className="bg-indigo-50/50">
                    <td className="px-4 py-2">
                      <input
                        value={editLigne.description}
                        onChange={(e) => setEditLigne({ ...editLigne, description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        value={editLigne.commentaire}
                        onChange={(e) => setEditLigne({ ...editLigne, commentaire: e.target.value })}
                        placeholder="Note (optionnel)"
                        className="w-full px-2 py-1 mt-1 border border-gray-200 rounded text-xs text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={1}
                        value={editLigne.quantite}
                        onChange={(e) => setEditLigne({ ...editLigne, quantite: Number(e.target.value) })}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={editLigne.prixUnit}
                        onChange={(e) => setEditLigne({ ...editLigne, prixUnit: Number(e.target.value) })}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                      {(editLigne.quantite * editLigne.prixUnit).toFixed(2)} €
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={handleModifierLigne}
                          disabled={actionLoading || !editLigne.description}
                          className="text-indigo-600 hover:text-indigo-800 p-1 transition-colors disabled:opacity-50"
                          title="Valider"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => setEditingLigneId(null)}
                          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={ligne.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {ligne.type ? typeLigneLabels[ligne.type] ?? ligne.type : "-"}
                        </span>
                        {ligne.description}
                      </span>
                      {ligne.commentaire && (
                        <span className="block text-xs text-gray-400 mt-0.5 ml-0">{ligne.commentaire}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-600">{ligne.quantite}</td>
                    <td className="px-6 py-3 text-right text-sm text-gray-600">
                      {Number(ligne.prixUnit).toFixed(2)} €
                    </td>
                    <td className={`px-6 py-3 text-right text-sm font-medium ${Number(ligne.montant) < 0 ? "text-emerald-600" : "text-gray-900"}`}>
                      {Number(ligne.montant).toFixed(2)} €
                    </td>
                    {facture.statut === StatutFacture.EN_ATTENTE && (
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditLigne(ligne)}
                            className="text-gray-300 hover:text-indigo-500 p-1 transition-colors"
                            title="Modifier cette ligne"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleSupprimerLigne(ligne.id)}
                            className="text-gray-300 hover:text-rose-500 p-1 transition-colors"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-semibold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {Number(facture.montantTotal).toFixed(2)} €
                </td>
                {facture.statut === StatutFacture.EN_ATTENTE && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Historique des paiements */}
      {facture.paiements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" />
              Historique des paiements ({facture.paiements.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mode</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Référence</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {facture.paiements.map((paiement) => (
                  <tr key={paiement.id}>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {new Date(paiement.datePaiement).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {paiement.modePaiement === "PRELEVEMENT" ? "Prélèvement" : paiement.modePaiement === "CHEQUE" ? "Chèque" : "Virement"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {paiement.reference ?? "-"}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-emerald-600">
                      +{Number(paiement.montant).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal de confirmation */}
      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title ?? ""}
        message={confirmModal?.message ?? ""}
        variant={confirmModal?.variant ?? "default"}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
