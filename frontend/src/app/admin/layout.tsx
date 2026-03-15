"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { authApi } from "@/lib/api";
import { Role } from "@/types";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    const verifyAdmin = async () => {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
      if (!token) {
        router.push("/admin/login");
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        if (profile.role === Role.ADMIN) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        localStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_logged");
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
