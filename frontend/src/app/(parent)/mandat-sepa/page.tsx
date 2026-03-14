"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { mandatSepaApi } from "@/lib/api";
import { MandatSepa } from "@/types";
import { FileText, Download, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function MandatSepaPage() {
  const [mandat, setMandat] = useState<MandatSepa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulaire
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [titulaire, setTitulaire] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const loadMandat = useCallback(async () => {
    try {
      setLoading(true);
      const result = await mandatSepaApi.getMonMandat();
      setMandat(result.mandat);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMandat();
  }, [loadMandat]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mandat) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hi-DPI support
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [mandat, loading]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const formatIbanInput = (value: string) => {
    // Supprimer tout sauf lettres et chiffres
    const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    // Ajouter un espace tous les 4 caractères
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!hasSigned) {
      setError("Veuillez signer le mandat");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");

    // Nettoyer l'IBAN pour l'envoi
    const ibanClean = iban.replace(/\s/g, "");
    if (ibanClean.length < 15 || ibanClean.length > 34) {
      setError("L'IBAN doit contenir entre 15 et 34 caractères");
      return;
    }

    try {
      setSubmitting(true);
      const result = await mandatSepaApi.signer({
        iban: ibanClean,
        bic: bic.toUpperCase(),
        titulaire,
        signatureData,
      });
      setSuccess(result.message);
      setMandat(result.mandat);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la signature");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoquer = async () => {
    if (!mandat) return;
    if (!confirm("Êtes-vous sûr de vouloir révoquer ce mandat SEPA ? Vous devrez en signer un nouveau pour les prélèvements.")) {
      return;
    }

    try {
      setError("");
      await mandatSepaApi.revoquer(mandat.id);
      setMandat(null);
      setSuccess("Mandat révoqué avec succès");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la révocation");
    }
  };

  const handleDownloadPdf = async () => {
    if (!mandat) return;
    try {
      const blob = await mandatSepaApi.downloadPdf(mandat.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mandat-sepa-${mandat.rum}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-emerald-600" />
        Mandat de prélèvement SEPA
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Mandat actif */}
      {mandat ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Mandat actif</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              Actif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Référence (RUM)</span>
              <p className="font-mono font-medium">{mandat.rum}</p>
            </div>
            <div>
              <span className="text-gray-500">Date de signature</span>
              <p className="font-medium">
                {new Date(mandat.dateSignature).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-gray-500">IBAN</span>
              <p className="font-mono">{mandat.iban}</p>
            </div>
            <div>
              <span className="text-gray-500">BIC</span>
              <p className="font-mono">{mandat.bic}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500">Titulaire</span>
              <p className="font-medium">{mandat.titulaire}</p>
            </div>
          </div>

          <div className="border-t pt-4 flex gap-3">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              Télécharger le mandat PDF
            </button>
            <button
              onClick={handleRevoquer}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
            >
              <Trash2 className="h-4 w-4" />
              Révoquer
            </button>
          </div>
        </div>
      ) : (
        /* Formulaire de signature */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations créancier */}
          <div className="bg-gray-50 rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Créancier</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nom :</strong> Mon Ecole et Moi</p>
              <p><strong>ICS :</strong> FR40ZZZ81563B</p>
              <p><strong>Adresse :</strong> 58 rue Damberg, 68350 Brunstatt-Didenheim</p>
            </div>
          </div>

          {/* Coordonnées bancaires */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Vos coordonnées bancaires</h2>

            <div>
              <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
                IBAN <span className="text-red-500">*</span>
              </label>
              <input
                id="iban"
                type="text"
                value={iban}
                onChange={(e) => setIban(formatIbanInput(e.target.value))}
                placeholder="FR76 3000 6000 0112 3456 7890 189"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Disponible sur votre RIB</p>
            </div>

            <div>
              <label htmlFor="bic" className="block text-sm font-medium text-gray-700 mb-1">
                BIC / SWIFT <span className="text-red-500">*</span>
              </label>
              <input
                id="bic"
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="BNPAFRPP"
                maxLength={11}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                required
              />
              <p className="mt-1 text-xs text-gray-500">8 ou 11 caractères, disponible sur votre RIB</p>
            </div>

            <div>
              <label htmlFor="titulaire" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du titulaire du compte <span className="text-red-500">*</span>
              </label>
              <input
                id="titulaire"
                type="text"
                value={titulaire}
                onChange={(e) => setTitulaire(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                minLength={2}
                maxLength={200}
              />
            </div>
          </div>

          {/* Texte légal */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900">
            <h3 className="font-semibold mb-2">Autorisation de prélèvement</h3>
            <p className="mb-2">
              En signant ce mandat, vous autorisez <strong>Mon Ecole et Moi</strong> à envoyer
              des instructions à votre banque pour débiter votre compte, et votre banque à débiter
              votre compte conformément à ces instructions.
            </p>
            <p>
              Vous bénéficiez du droit d&apos;être remboursé par votre banque selon les conditions
              décrites dans la convention que vous avez passée avec elle. Toute demande de
              remboursement doit être présentée dans les 8 semaines suivant la date de débit
              pour un prélèvement autorisé.
            </p>
          </div>

          {/* Signature */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Signature</h2>
            <p className="text-sm text-gray-500 mb-3">
              Signez dans le cadre ci-dessous avec votre souris ou votre doigt.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair touch-none"
                style={{ height: "150px" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Effacer la signature
              </button>
              {hasSigned && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Signature tracée
                </span>
              )}
            </div>
          </div>

          {/* Soumettre */}
          <button
            type="submit"
            disabled={submitting || !hasSigned || !iban || !bic || !titulaire}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Signature en cours...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Signer le mandat SEPA
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
