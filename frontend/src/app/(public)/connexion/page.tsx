"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { Role } from "@/types";
import { sanitize } from "@/lib/sanitize";

export default function ConnexionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Nettoyer les anciennes sessions au chargement de la page de connexion
  useEffect(() => {
    // Supprimer les anciens tokens/données qui peuvent causer des problèmes
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    sessionStorage.removeItem("parent_logged");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.login({ email, password });

      // Stocker le token et les infos utilisateur
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("user_name", response.user.name || "");
      localStorage.setItem("user_email", response.user.email);
      sessionStorage.setItem("parent_logged", "true");

      // Vérifier si c'est la première connexion (changement de mot de passe obligatoire)
      if (response.user.premiereConnexion) {
        window.location.href = "/changer-mot-de-passe";
        return;
      }

      // Redirection selon le rôle - utiliser window.location pour forcer le rechargement complet
      if (response.user.role === Role.ADMIN) {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour pré-remplir avec les identifiants de test
  const fillTestCredentials = (type: "parent" | "admin") => {
    if (type === "parent") {
      setEmail("parent@test.fr");
      setPassword("parent1234");
    } else {
      setEmail("admin@ecole.fr");
      setPassword("admin123");
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
            <Link href="/" className="text-sm text-gray-600 hover:text-emerald-600 flex items-center gap-1">
              <ArrowLeft size={16} /> Retour à l&apos;accueil
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
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                <LogIn size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Connexion</h1>
              <p className="text-emerald-100 mt-1">Accédez à votre espace personnel</p>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div
                  className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="text-rose-500 flex-shrink-0" size={20} aria-hidden="true" />
                  <p className="text-sm text-rose-700">{sanitize(error)}</p>
                </div>
              )}

              {/* Boutons de test (dev uniquement) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800 mb-3 font-medium">Identifiants de test :</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fillTestCredentials("parent")}
                      className="flex-1 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => fillTestCredentials("admin")}
                      className="flex-1 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulaire de connexion">
                <div>
                  <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.fr"
                      aria-label="Adresse email"
                      aria-required="true"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="password-input"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-label="Mot de passe"
                      aria-required="true"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-label={isLoading ? "Connexion en cours" : "Se connecter"}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/mot-de-passe-oublie" className="text-sm text-emerald-600 hover:text-emerald-700">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </div>

          {/* Link to preinscription */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{" "}
              <Link href="/preinscription" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Préinscrire un enfant
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Mon École et Moi</p>
      </footer>
    </div>
  );
}

