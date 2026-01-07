"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
  const [message, setMessage] = useState("");
  const [numeroDossier, setNumeroDossier] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/preinscriptions/verify-email/${token}`);
        const data = await response.json();

        if (data.success) {
          if (data.alreadyVerified) {
            setStatus("already");
          } else {
            setStatus("success");
          }
          setNumeroDossier(data.numeroDossier || "");
        } else {
          setStatus("error");
        }
        setMessage(data.message);
      } catch {
        setStatus("error");
        setMessage("Une erreur est survenue lors de la vérification");
      }
    };

    verifyEmail();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Loader2 size={40} className="text-emerald-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Vérification en cours...
          </h1>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous vérifions votre adresse email.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success" || status === "already") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {status === "already" ? "Email déjà vérifié" : "Email vérifié !"}
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {numeroDossier && (
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-700 mb-1">Numéro de dossier</p>
              <p className="text-xl font-bold text-emerald-800">{numeroDossier}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Votre demande de préinscription a été enregistrée. Notre équipe l&apos;examinera dans les plus brefs délais.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Retour à l&apos;accueil
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
          <XCircle size={40} className="text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Vérification échouée
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-amber-800">
            <strong>💡 Que faire ?</strong><br />
            Si votre lien a expiré, vous pouvez soumettre une nouvelle demande de préinscription.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/preinscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Mail size={18} />
            Nouvelle préinscription
          </Link>
          <br />
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificationEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Loader2 size={40} className="text-emerald-600 animate-spin" />
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
