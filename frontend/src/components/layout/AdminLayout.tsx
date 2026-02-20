"use client";

import { Header } from "./Header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  UtensilsCrossed,
  Palette,
  Users,
  BarChart3,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Receipt,
} from "lucide-react";

// Menu admin
// Note: Repas, Périscolaire, Rapports = Frontend fait, Backend en cours (prévu avril)

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    href: "/admin/preinscriptions",
    label: "Préinscriptions",
    icon: FileText,
    description: "Demandes en cours",
  },
  {
    href: "/admin/reinscriptions",
    label: "Réinscriptions",
    icon: RefreshCw,
    description: "Année prochaine",
  },
  {
    href: "/admin/facturation",
    label: "Facturation",
    icon: Receipt,
    description: "Factures & paiements",
  },
  {
    href: "/admin/eleves",
    label: "Élèves",
    icon: GraduationCap,
    description: "Gestion des élèves",
  },
  {
    href: "/admin/repas",
    label: "Repas",
    icon: UtensilsCrossed,
    description: "Commandes repas",
  },
  {
    href: "/admin/periscolaire",
    label: "Périscolaire",
    icon: Palette,
    description: "Activités & garderie",
  },
  {
    href: "/admin/comptes",
    label: "Comptes",
    icon: Users,
    description: "Comptes parents",
  },
  {
    href: "/admin/rapports",
    label: "Rapports",
    icon: BarChart3,
    description: "Statistiques",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <Header variant="admin" />

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-gray-100 bg-white/60 backdrop-blur-sm min-h-[calc(100vh-5rem)] sticky top-20">
          {/* Admin Badge */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">Administration</p>
                <p className="text-xs text-violet-200">Gestion de l&apos;école</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-5 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                    : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                    }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${isActive
                    ? "bg-white/20"
                    : "bg-gray-100 group-hover:bg-violet-100 group-hover:text-violet-600"
                    }`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    <p className={`text-xs truncate ${isActive ? "text-violet-200" : "text-gray-400"
                      }`}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight size={14} className={`transition-transform ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`} />
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-5 border-t border-gray-100">
            <Link
              href="/preinscription"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ExternalLink size={18} />
              <span className="text-sm font-medium">Voir formulaire public</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 safe-area-bottom">
          <div className="flex justify-around py-2 px-2 overflow-x-auto">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] ${isActive
                    ? "text-violet-600 bg-violet-50"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium truncate">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 pb-28 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

