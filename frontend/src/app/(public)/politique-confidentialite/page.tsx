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
              <h1 className="text-lg font-semibold text-gray-900">Politique de Confidentialite</h1>
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 mb-8 text-white text-center">
          <Shield size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Politique de Confidentialite</h1>
          <p className="text-emerald-100">Protection de vos donnees personnelles</p>
          <p className="text-sm text-emerald-200 mt-4">Derniere mise a jour : Janvier 2026</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              L&apos;ecole <strong>Mon Ecole et Moi</strong> (ci-apres &quot;l&apos;Ecole&quot;), situee au 58 rue Damberg,
              68350 Brunstatt-Didenheim, s&apos;engage a proteger la vie privee des utilisateurs de son site internet
              et de son application de gestion scolaire. Cette politique de confidentialite vous informe sur
              la maniere dont nous collectons, utilisons et protegeons vos donnees personnelles.
            </p>
          </section>

          {/* Donnees collectees */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Donnees collectees</h2>
            </div>
            <p className="text-gray-600 mb-4">Nous collectons les donnees suivantes :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees de l&apos;enfant :</strong> nom, prenom, date et lieu de naissance, nationalite, allergies, informations medicales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees des parents :</strong> nom, prenom, adresse email, telephone, adresse postale, profession</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Documents :</strong> pieces d&apos;identite, carnet de vaccination, justificatifs de domicile, attestation d&apos;assurance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees de connexion :</strong> adresse IP, date et heure de connexion (a des fins de securite)</span>
              </li>
            </ul>
          </section>

          {/* Finalites */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Finalites du traitement</h2>
            </div>
            <p className="text-gray-600 mb-4">Vos donnees sont utilisees pour :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Gerer les demandes de preinscription et d&apos;inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Assurer le suivi administratif de la scolarite de votre enfant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Communiquer avec vous concernant la vie scolaire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Gerer la facturation et les paiements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Assurer la securite des enfants (personnes autorisees a recuperer l&apos;enfant)</span>
              </li>
            </ul>
          </section>

          {/* Duree de conservation */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Duree de conservation</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees de scolarite :</strong> 10 ans apres la fin de la scolarite de l&apos;enfant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees de facturation :</strong> 10 ans (obligation legale comptable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Demandes de preinscription refusees :</strong> 1 an</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><strong>Donnees de connexion :</strong> 1 an</span>
              </li>
            </ul>
          </section>

          {/* Securite */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Lock size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Securite des donnees</h2>
            </div>
            <p className="text-gray-600 mb-4">Nous mettons en oeuvre des mesures techniques et organisationnelles pour proteger vos donnees :</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Chiffrement des donnees en transit (HTTPS/TLS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Mots de passe haches avec algorithme securise (bcrypt)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Acces restreint aux donnees selon les roles (parents, administration)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Sauvegardes regulieres et securisees</span>
              </li>
            </ul>
          </section>

          {/* Partage */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Partage des donnees</h2>
            <p className="text-gray-600 mb-4">
              Vos donnees personnelles ne sont <strong>jamais vendues</strong> a des tiers.
              Elles peuvent etre partagees uniquement avec :
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>L&apos;equipe pedagogique et administrative de l&apos;ecole</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Les autorites competentes si la loi l&apos;exige</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Notre hebergeur de donnees (serveurs situes en France/UE)</span>
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
              <p><strong>Mon Ecole et Moi</strong></p>
              <p>58 rue Damberg, 68350 Brunstatt-Didenheim</p>
              <p>Email : <a href="mailto:monecoleetmoibrunstatt@gmail.com" className="text-emerald-600 hover:underline">monecoleetmoibrunstatt@gmail.com</a></p>
              <p>Telephone : 03 89 06 07 77</p>
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
          <p>&copy; {new Date().getFullYear()} Mon Ecole et Moi - Tous droits reserves</p>
        </div>
      </footer>
    </div>
  );
}
