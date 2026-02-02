"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale, Eye, Edit, Trash2, Download, Ban, AlertTriangle, Mail } from "lucide-react";

export default function RGPDPage() {
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
              <h1 className="text-lg font-semibold text-gray-900">Vos Droits RGPD</h1>
              <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Retour à l&apos;accueil
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
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-8 mb-8 text-white text-center">
          <Scale size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Vos Droits RGPD</h1>
          <p className="text-violet-100">Règlement Général sur la Protection des Données</p>
          <p className="text-sm text-violet-200 mt-4">Règlement (UE) 2016/679 du 27 avril 2016</p>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Qu&apos;est-ce que le RGPD ?</h2>
          <p className="text-gray-600 leading-relaxed">
            Le Règlement Général sur la Protection des Données (RGPD) est une législation européenne qui protège
            vos données personnelles. Il vous accorde des droits spécifiques concernant la collecte, le traitement
            et le stockage de vos informations. L&apos;école <strong>Mon École et Moi</strong> s&apos;engage à respecter
            ces droits et à traiter vos données de manière transparente et sécurisée.
          </p>
        </section>

        {/* Droits */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Vos droits en détail</h2>

          {/* Droit d'acces */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Eye size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit d&apos;accès</h3>
                <p className="text-gray-600 mb-3">
                  Vous avez le droit de savoir si nous traitons vos données personnelles et, le cas échéant,
                  d&apos;obtenir une copie de ces données ainsi que des informations sur leur traitement.
                </p>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                  <strong>Comment exercer ce droit :</strong> Envoyez-nous un email en précisant votre demande.
                  Nous vous répondrons dans un délai de 30 jours.
                </div>
              </div>
            </div>
          </section>

          {/* Droit de rectification */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Edit size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit de rectification</h3>
                <p className="text-gray-600 mb-3">
                  Vous pouvez demander la correction de données inexactes ou incomplètes vous concernant
                  ou concernant votre enfant.
                </p>
                <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800">
                  <strong>Comment exercer ce droit :</strong> Vous pouvez modifier certaines informations directement
                  depuis votre espace parent, ou nous contacter pour les autres modifications.
                </div>
              </div>
            </div>
          </section>

          {/* Droit a l'effacement */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit à l&apos;effacement (&quot;droit à l&apos;oubli&quot;)</h3>
                <p className="text-gray-600 mb-3">
                  Vous pouvez demander la suppression de vos données personnelles dans certains cas
                  (données plus nécessaires, retrait du consentement, etc.).
                </p>
                <div className="bg-rose-50 rounded-lg p-3 text-sm text-rose-800">
                  <strong>Limites :</strong> Certaines données doivent être conservées pour des obligations légales
                  (comptabilité, archives scolaires). Nous vous informerons des données qui ne peuvent pas être supprimées.
                </div>
              </div>
            </div>
          </section>

          {/* Droit a la portabilite */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Download size={24} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit à la portabilité</h3>
                <p className="text-gray-600 mb-3">
                  Vous pouvez recevoir vos données dans un format structuré, couramment utilisé et lisible
                  par machine (ex: CSV, JSON), et les transmettre à un autre organisme.
                </p>
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                  <strong>Format disponible :</strong> Nous pouvons vous fournir vos données au format CSV ou PDF
                  sur simple demande.
                </div>
              </div>
            </div>
          </section>

          {/* Droit d'opposition */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Ban size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit d&apos;opposition</h3>
                <p className="text-gray-600 mb-3">
                  Vous pouvez vous opposer à certains traitements de vos données, notamment à des fins
                  de prospection commerciale (que nous ne pratiquons pas).
                </p>
                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-800">
                  <strong>À noter :</strong> Ce droit ne s&apos;applique pas aux traitements nécessaires à l&apos;exécution
                  du contrat de scolarité ou à nos obligations légales.
                </div>
              </div>
            </div>
          </section>

          {/* Droit de limitation */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Droit à la limitation du traitement</h3>
                <p className="text-gray-600 mb-3">
                  Vous pouvez demander la limitation du traitement de vos données dans certains cas
                  (contestation de l&apos;exactitude, traitement illicite, etc.). Vos données seront alors
                  conservées mais plus utilisées.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Comment exercer vos droits */}
        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Mail size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Comment exercer vos droits ?</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Pour exercer l&apos;un de ces droits, envoyez-nous votre demande par email ou courrier :
          </p>
          <div className="bg-white rounded-lg p-4 space-y-2 text-gray-700">
            <p><strong>Mon École et Moi</strong></p>
            <p>58 rue Damberg, 68350 Brunstatt-Didenheim</p>
            <p>Email : <a href="mailto:contact@montessorietmoi.com" className="text-emerald-600 hover:underline">contact@montessorietmoi.com</a></p>
            <p>Téléphone : 03 89 06 07 77</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Nous vous répondrons dans un délai maximum de <strong>30 jours</strong>.
            Une pièce d&apos;identité pourra vous être demandée pour vérifier votre identité.
          </p>
        </section>

        {/* Reclamation CNIL */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Réclamation auprès de la CNIL</h2>
          <p className="text-gray-600 mb-4">
            Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD,
            vous avez le droit d&apos;introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) :
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
            <p><strong>CNIL</strong></p>
            <p>3 Place de Fontenoy, TSA 80715</p>
            <p>75334 PARIS CEDEX 07</p>
            <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">www.cnil.fr</a></p>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/politique-confidentialite"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
          >
            Voir la politique de confidentialité
          </Link>
          <Link
            href="/preinscription"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour au formulaire
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mon École et Moi - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
