"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Lock, AlertTriangle } from "lucide-react";

export default function ParentRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem("auth_token");
    const parentLogged = sessionStorage.getItem("parent_logged");

    if (!token && !parentLogged) {
      router.push("/connexion");
      setIsLoading(false);
      return;
    }

    // Vérifier si première connexion (changement de mot de passe obligatoire)
    const userStr = localStorage.getItem("user");
    let needsPasswordChange = false;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Vérification stricte du flag premiereConnexion
        if (user.premiereConnexion === true || user.premiere_connexion === true) {
          needsPasswordChange = true;
          setMustChangePassword(true);
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    // Si doit changer le mdp et n'est PAS sur la page de changement, rediriger
    const isOnChangePasswordPage = pathname === "/changer-mot-de-passe";
    if (needsPasswordChange && !isOnChangePasswordPage) {
      router.push("/changer-mot-de-passe");
      // Ne pas mettre isLoading à false ici pour bloquer le rendu
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, pathname]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return null;
  }

  // ==========================================
  // CHANGEMENT DE MOT DE PASSE OBLIGATOIRE
  // ==========================================
  // Si l'utilisateur doit changer son mot de passe, on affiche UNIQUEMENT
  // le contenu de la page SANS le menu de navigation (ParentLayout)
  
  if (mustChangePassword) {
    const isOnChangePasswordPage = pathname === "/changer-mot-de-passe";
    
    // Si sur la page de changement de mot de passe, afficher le formulaire SEUL
    if (isOnChangePasswordPage) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
          {/* Header minimal sans navigation */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-semibold text-gray-900">Mon École</span>
                  <span className="text-sm text-emerald-600 block -mt-1">Montessori et Moi</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Bannière d'avertissement */}
          <div className="bg-amber-500 text-white py-3 px-4">
            <div className="max-w-2xl mx-auto flex items-center justify-center gap-3 text-sm font-medium">
              <Lock size={18} />
              <span>Changement de mot de passe obligatoire avant d'accéder à votre espace</span>
            </div>
          </div>
          
          {/* Contenu */}
          <main className="flex-1 p-6 lg:p-10">
            <div className="max-w-md mx-auto pt-8">
              {children}
            </div>
          </main>
        </div>
      );
    }
    
    // Si essaie d'accéder à une autre page → bloquer et rediriger
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <AlertTriangle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Action requise
          </h2>
          <p className="text-gray-600 mb-6">
            Pour des raisons de sécurité, vous devez changer votre mot de passe avant d'accéder à votre espace parent.
          </p>
          <button
            onClick={() => router.push("/changer-mot-de-passe")}
            className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30"
          >
            Changer mon mot de passe
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // AFFICHAGE NORMAL AVEC NAVIGATION
  // ==========================================
  return <ParentLayout>{children}</ParentLayout>;
}
