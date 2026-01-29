"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, User, Server, Scale } from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" width={64} height={64} className="h-12 w-auto" />
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Mentions Legales</h1>
              <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Retour a l&apos;accueil
              </Link>
            </div>
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/logo-montessori.png" alt="Montessori" width={64} height={64} className="h-12 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 mb-8 text-white text-center">
          <Scale size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Mentions Legales</h1>
          <p className="text-slate-200">Conformement a l&apos;article 6 de la loi n°2004-575 du 21 juin 2004</p>
        </div>

        <div className="space-y-6">
          {/* Editeur */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Building2 size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Editeur du site</h2>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><strong>Raison sociale :</strong> Mon Ecole et Moi</p>
              <p><strong>Forme juridique :</strong> Association loi 1901</p>
              <p><strong>Adresse :</strong> 58 rue Damberg, 68350 Brunstatt-Didenheim</p>
              <p><strong>Telephone :</strong> 03 89 06 07 77</p>
              <p><strong>Email :</strong> <a href="mailto:monecoleetmoibrunstatt@gmail.com" className="text-emerald-600 hover:underline">monecoleetmoibrunstatt@gmail.com</a></p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Directrice de la publication</h2>
            </div>
            <p className="text-gray-600">
              Madame Audrey Ballester, en qualite de directrice de l&apos;ecole Mon Ecole et Moi.
            </p>
          </section>

          {/* Hebergement */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Server size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Hebergement</h2>
            </div>
            <div className="space-y-2 text-gray-600">
              <p><strong>Hebergeur :</strong> [A completer lors du deploiement]</p>
              <p><strong>Adresse :</strong> [A completer]</p>
              <p className="text-sm text-gray-500 mt-2">
                Les serveurs sont situes en France/Union Europeenne conformement au RGPD.
              </p>
            </div>
          </section>

          {/* Propriete intellectuelle */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Propriete intellectuelle</h2>
            <p className="text-gray-600 mb-4">
              L&apos;ensemble du contenu de ce site (textes, images, logos, icones, elements graphiques)
              est la propriete exclusive de Mon Ecole et Moi ou de ses partenaires. Toute reproduction,
              representation, modification, publication ou adaptation de tout ou partie des elements
              du site est interdite sans autorisation prealable.
            </p>
            <p className="text-gray-600">
              Le logo Montessori France est utilise avec l&apos;autorisation de l&apos;Association Montessori France.
            </p>
          </section>

          {/* Responsabilite */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation de responsabilite</h2>
            <p className="text-gray-600 mb-4">
              Mon Ecole et Moi s&apos;efforce de fournir des informations aussi exactes que possible.
              Toutefois, elle ne pourra etre tenue responsable des omissions, inexactitudes ou
              carences dans la mise a jour, qu&apos;elles soient de son fait ou du fait des tiers
              partenaires qui lui fournissent ces informations.
            </p>
            <p className="text-gray-600">
              L&apos;utilisateur reconnait utiliser ces informations sous sa responsabilite exclusive.
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600 mb-4">
              Ce site utilise des cookies strictement necessaires au fonctionnement du service
              (authentification, session utilisateur). Ces cookies ne necessitent pas de consentement
              prealable conformement a la legislation en vigueur.
            </p>
            <p className="text-gray-600">
              Aucun cookie publicitaire ou de tracking n&apos;est utilise sur ce site.
            </p>
          </section>

          {/* Droit applicable */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Droit applicable</h2>
            <p className="text-gray-600">
              Les presentes mentions legales sont soumises au droit francais.
              En cas de litige, les tribunaux francais seront seuls competents.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/politique-confidentialite"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Politique de confidentialite
          </Link>
          <Link
            href="/rgpd"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Vos droits RGPD
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mon Ecole et Moi - Tous droits reserves</p>
        </div>
      </footer>
    </div>
  );
}
