"use client";

import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

interface DashboardCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "emerald" | "amber" | "violet" | "teal" | "sky" | "rose" | "indigo";
}

const colorStyles = {
  emerald: {
    bg: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/30",
    hover: "hover:shadow-emerald-500/40",
    light: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  amber: {
    bg: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/30",
    hover: "hover:shadow-amber-500/40",
    light: "bg-amber-50 text-amber-600 border-amber-100",
  },
  violet: {
    bg: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/30",
    hover: "hover:shadow-violet-500/40",
    light: "bg-violet-50 text-violet-600 border-violet-100",
  },
  teal: {
    bg: "from-teal-500 to-cyan-500",
    shadow: "shadow-teal-500/30",
    hover: "hover:shadow-teal-500/40",
    light: "bg-teal-50 text-teal-600 border-teal-100",
  },
  sky: {
    bg: "from-sky-500 to-blue-500",
    shadow: "shadow-sky-500/30",
    hover: "hover:shadow-sky-500/40",
    light: "bg-sky-50 text-sky-600 border-sky-100",
  },
  rose: {
    bg: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/30",
    hover: "hover:shadow-rose-500/40",
    light: "bg-rose-50 text-rose-600 border-rose-100",
  },
  indigo: {
    bg: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/30",
    hover: "hover:shadow-indigo-500/40",
    light: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
};

export function DashboardCard({ href, icon: Icon, title, description, color }: DashboardCardProps) {
  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles.bg} flex items-center justify-center mb-4 shadow-lg ${styles.shadow} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1.5 group-hover:text-gray-700 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {/* Arrow */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </Link>
  );
}

