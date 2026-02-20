"use client";

import { Header } from "./Header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Palette,
  Users,
  FolderOpen,
  Mail,
  ChevronRight,
  UserPlus,
  Receipt,
} from "lucide-react";

// Menu parent
// Note: Repas et Périscolaire = Frontend fait, Backend en cours (prévu avril)

const menuItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    href: "/repas",
    label: "Repas",
    icon: UtensilsCrossed,
    description: "Commander les repas",
  },
  {
    href: "/periscolaire",
    label: "Périscolaire",
    icon: Palette,
    description: "Activités & garderie",
  },
  {
    href: "/mes-enfants",
    label: "Mes enfants",
    icon: Users,
    description: "Informations enfants",
  },
  {
    href: "/personnes-autorisees",
    label: "Personnes autorisées",
    icon: UserPlus,
    description: "Récupérer les enfants",
  },
  {
    href: "/mes-factures",
    label: "Mes factures",
    icon: Receipt,
    description: "Factures & paiements",
  },
  {
    href: "/mes-dossiers",
    label: "Dossiers",
    icon: FolderOpen,
    description: "Inscriptions en cours",
  },
];

interface ParentLayoutProps {
  children: React.ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <Header variant="parent" />

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-gray-100 bg-white/60 backdrop-blur-sm min-h-[calc(100vh-5rem)] sticky top-20">
          <nav className="flex-1 p-5 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href === "/mes-dossiers" && (pathname === "/reinscription" || pathname === "/preinscription-enfant"));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                    isActive 
                      ? "bg-white/20" 
                      : "bg-gray-100 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    <p className={`text-xs truncate ${
                      isActive ? "text-emerald-100" : "text-gray-400"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-5 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Besoin d&apos;aide ?</p>
                  <a
                    href="mailto:contact@montessorietmoi.com"
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    contact@montessorietmoi.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 safe-area-bottom">
          <div className="flex justify-around py-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px] ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 pb-28 lg:pb-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

