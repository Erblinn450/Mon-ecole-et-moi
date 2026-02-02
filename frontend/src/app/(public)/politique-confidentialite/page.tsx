"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Eye, Clock, Users, Lock, Mail } from "lucide-react";

export default function PolitiqueConfidentialitePage() {
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
              <h1 className="text-lg font-semibold text-gray-900">Politique de Confidentialité</h1>
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 mb-8 text-white text-center">
          <Shield size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
          <p className="text-emerald-100">Protection de vos données personnelles</p>
          <p className="text-sm text-emerald-200 mt-4">Dernière mise à jour : Janvier 2026</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              L&apos;école <strong>Mon École et Moi</strong> (ci-après &quot;l&apos;École&quot;), située au 58 rue Damberg,
              68350 Brunstatt-Didenheim, s&apos;engage à protéger la vie privée des utilisateurs de son site internet
              et de son application de gestion scolaire. Cette politique de confidentialité vous informe sur
              la manière dont nous collectons, utilisons et protégeons vos données personnelles.
            </p>
          </section>

          {/* Donnees collectees */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Données collectées</h2>
            </div>
            <p className="text-gray-600 mb-4">Nous collectons les données suivantes :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données de l&apos;enfant :</strong> nom, prénom, date et lieu de naissance, nationalité, allergies, informations médicales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données des parents :</strong> nom, prénom, adresse email, téléphone, adresse postale, profession</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Documents :</strong> pièces d&apos;identité, carnet de vaccination, justificatifs de domicile, attestation d&apos;assurance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données de connexion :</strong> adresse IP, date et heure de connexion (à des fins de sécurité)</span>
              </li>
            </ul>
          </section>

          {/* Finalites */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Finalités du traitement</h2>
            </div>
            <p className="text-gray-600 mb-4">Vos données sont utilisées pour :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Gérer les demandes de préinscription et d&apos;inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Assurer le suivi administratif de la scolarité de votre enfant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Communiquer avec vous concernant la vie scolaire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Gérer la facturation et les paiements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Assurer la sécurité des enfants (personnes autorisées à récupérer l&apos;enfant)</span>
              </li>
            </ul>
          </section>

          {/* Duree de conservation */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Durée de conservation</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données de scolarité :</strong> conservées à vie en cas d&apos;inscription effective, 2 ans en l&apos;absence d&apos;inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données de facturation :</strong> 10 ans (obligation légale comptable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Demandes de préinscription refusées :</strong> 1 an</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Données de connexion :</strong> 1 an</span>
              </li>
            </ul>
          </section>

          {/* Securite */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Lock size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sécurité des données</h2>
            </div>
            <p className="text-gray-600 mb-4">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Chiffrement des données en transit (HTTPS/TLS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Mots de passe hachés avec algorithme sécurisé (bcrypt)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Accès restreint aux données selon les rôles (parents, administration)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Sauvegardes régulières et sécurisées</span>
              </li>
            </ul>
          </section>

          {/* Partage */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Partage des données</h2>
            <p className="text-gray-600 mb-4">
              Vos données personnelles ne sont <strong>jamais vendues</strong> à des tiers.
              Elles peuvent être partagées uniquement avec :
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>L&apos;équipe pédagogique et administrative de l&apos;école</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Les autorités compétentes si la loi l&apos;exige</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Notre hébergeur de données (serveurs situés en France/UE)</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous :
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Mon École et Moi</strong></p>
              <p>58 rue Damberg, 68350 Brunstatt-Didenheim</p>
              <p>Email : <a href="mailto:contact@montessorietmoi.com" className="text-emerald-600 hover:underline">contact@montessorietmoi.com</a></p>
              <p>Téléphone : 03 89 06 07 77</p>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/rgpd"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Voir vos droits RGPD
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
