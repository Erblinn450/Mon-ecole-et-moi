"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Loader2, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" width={64} height={64} className="h-12 w-auto" />
            </Link>
            <Link href="/connexion" className="text-sm text-gray-600 hover:text-emerald-600 flex items-center gap-1">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo-montessori.png" alt="Montessori" width={64} height={64} className="h-12 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                <KeyRound size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
              <p className="text-emerald-100 mt-1">Recevez un lien de réinitialisation par email</p>
            </div>

            <div className="p-8">
              {isSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Email envoyé</h2>
                  <p className="text-gray-600 text-sm">
                    Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Le lien expire dans 1 heure. Pensez à vérifier vos spams.
                  </p>
                  <Link
                    href="/connexion"
                    className="inline-block mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200" role="alert">
                      <p className="text-sm text-rose-700">{error}</p>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-6">
                    Saisissez l&apos;adresse email associée à votre compte. Nous vous enverrons un lien pour créer un nouveau mot de passe.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Adresse email
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          id="email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre@email.fr"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Mail size={20} />
                          Envoyer le lien
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link href="/connexion" className="text-sm text-emerald-600 hover:text-emerald-700">
                      Retour à la connexion
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Mon &Eacute;cole et Moi</p>
      </footer>
    </div>
  );
}
