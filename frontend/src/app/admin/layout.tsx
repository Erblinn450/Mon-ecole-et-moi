"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // La page de login n'a pas besoin d'authentification
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Si c'est la page de login, pas besoin de vérifier l'auth
    if (isLoginPage) {
      setIsLoading(false);
      setIsAuthenticated(true); // Pour afficher la page
      return;
    }

    // Vérifier l'authentification admin
    const adminLogged = sessionStorage.getItem("admin_logged");
    const adminToken = localStorage.getItem("admin_token");

    if (!adminLogged && !adminToken) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router, isLoginPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Pour la page de login, ne pas utiliser le AdminLayout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

