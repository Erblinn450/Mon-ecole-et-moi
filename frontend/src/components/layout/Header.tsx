"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, LogOut, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  variant?: "parent" | "admin" | "public";
}

export function Header({ variant = "public" }: HeaderProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_token");
    sessionStorage.clear();
    window.location.href = variant === "admin" ? "/admin/login" : "/connexion";
  };

  const getTitle = () => {
    switch (variant) {
      case "parent":
        return "Espace Parents";
      case "admin":
        return "Administration";
      default:
        return "Mon École et Moi";
    }
  };

  const getAccentColor = () => {
    switch (variant) {
      case "parent":
        return "emerald";
      case "admin":
        return "violet";
      default:
        return "emerald";
    }
  };

  const accent = getAccentColor();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-6 mx-auto">
        {/* Logo Mon École et Moi */}
        <Link href="/" className="flex-shrink-0 group">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/logo.png"
              alt="Logo Mon École et Moi"
              width={64}
              height={64}
              className="h-12 w-auto md:h-14 transition-transform group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Centre - Titre + Nav */}
        <div className="flex flex-col items-center">
          <h1 className={`text-lg md:text-xl font-semibold tracking-tight ${
            variant === "admin" ? "text-violet-900" : "text-gray-900"
          }`}>
            {getTitle()}
          </h1>
          <nav className="flex items-center gap-1 mt-1">
            {variant === "parent" && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === "/dashboard"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Home size={14} />
                  <span>Accueil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut size={14} />
                  <span>Quitter</span>
                </button>
              </>
            )}

            {variant === "admin" && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === "/admin/dashboard"
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut size={14} />
                  <span>Quitter</span>
                </button>
              </>
            )}

            {variant === "public" && (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  <Home size={14} />
                  <span>Accueil</span>
                </Link>
                <Link
                  href="/connexion"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                >
                  Connexion
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Logo Montessori */}
        <a href="https://www.montessori-france.asso.fr/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src="/images/logo-montessori.png"
              alt="Logo Montessori France"
              width={64}
              height={64}
              className="h-12 w-auto md:h-14 transition-transform group-hover:scale-105"
            />
          </div>
        </a>
      </div>
    </header>
  );
}

