"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { Role } from "@/types";
import { sanitize } from "@/lib/sanitize";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.login({ email, password });

      // Vérifier que c'est bien un admin
      if (response.user.role !== Role.ADMIN) {
        setError("Accès refusé. Ce compte n'est pas administrateur.");
        return;
      }

      // Stocker les infos de session admin
      localStorage.setItem("admin_token", response.access_token);
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      sessionStorage.setItem("admin_logged", "true");

      // Rediriger vers le dashboard admin
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  // Pré-remplir avec les identifiants admin de test
  const fillTestCredentials = () => {
    setEmail("admin@ecole.fr");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-violet-50/30">
      {/* Header avec logos */}
      <header className="bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Mon École et Moi"
                width={80}
                height={80}
                className="h-14 w-auto md:h-16"
              />
            </Link>

            <div className="flex flex-col items-center gap-1">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 text-center">
                Espace Administration
              </h1>
              <Link
                href="/"
                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Accueil
              </Link>
            </div>

            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo-montessori.png"
                alt="Logo Montessori France"
                width={80}
                height={80}
                className="h-14 w-auto md:h-16"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Card de connexion */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header violet */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                <LogIn size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Connexion Admin
              </h2>
              <p className="text-violet-100 mt-2">
                Accédez au panneau d&apos;administration
              </p>
            </div>

            <div className="p-8">
              {error && (
                <div
                  className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="text-rose-500 flex-shrink-0" size={20} aria-hidden="true" />
                  <p className="text-rose-700 text-sm">{sanitize(error)}</p>
                </div>
              )}

              {/* Bouton identifiants de test */}
              <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-200">
                <p className="text-sm text-violet-700 mb-2 font-medium">Identifiants de test :</p>
                <button
                  type="button"
                  onClick={fillTestCredentials}
                  className="w-full py-2 px-4 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg font-medium text-sm transition-colors"
                >
                  Remplir avec admin@ecole.fr
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulaire de connexion administrateur">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ecole.fr"
                      aria-label="Adresse email"
                      aria-required="true"
                      required
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-label="Mot de passe"
                      aria-required="true"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-label={isLoading ? "Connexion en cours" : "Se connecter"}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
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
            </div>
          </div>

          {/* Lien vers connexion parent */}
          <p className="text-center mt-6 text-gray-600">
            Vous êtes parent ?{" "}
            <Link href="/connexion" className="text-violet-600 hover:text-violet-700 font-medium">
              Connexion parent
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2026 Mon École et Moi – Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

