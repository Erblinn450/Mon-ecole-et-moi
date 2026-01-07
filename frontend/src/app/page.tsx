import Link from "next/link";
import Image from "next/image";
import { FileText, UtensilsCrossed, Users, ArrowRight, Mail, MapPin, Phone } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="h-10 w-auto"
              />
              <span className="font-semibold text-gray-900 hidden sm:block">Mon École et Moi</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                href="/connexion"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/preinscription"
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                Préinscription
              </Link>
            </nav>

            {/* Logo Montessori */}
            <Link href="/" className="hidden md:block">
              <Image
                src="/images/logo-montessori.png"
                alt="Montessori"
                width={48}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100 rounded-full blur-3xl opacity-30" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Inscriptions ouvertes 2025-2026
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              L&apos;épanouissement de votre enfant,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                notre priorité
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
              Une école Montessori où chaque enfant développe son potentiel unique dans un environnement bienveillant et stimulant.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/preinscription"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
              >
                Préinscrire mon enfant
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-full transition-all"
              >
                Accéder à mon espace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vos services en ligne
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simplifiez votre quotidien avec notre plateforme de gestion scolaire
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <FileText size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Préinscription
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Inscrivez votre enfant en ligne et suivez l&apos;avancement de votre dossier en temps réel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <UtensilsCrossed size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Repas & Périscolaire
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Réservez les repas et activités périscolaires de vos enfants en quelques clics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Espace Famille
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Consultez les informations de vos enfants et gérez leurs inscriptions facilement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-12 md:p-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
            
            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à rejoindre notre école ?
              </h2>
              <p className="text-emerald-100 text-lg mb-8">
                Commencez dès maintenant la préinscription de votre enfant pour la rentrée prochaine.
              </p>
              <Link
                href="/preinscription"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-full transition-all shadow-lg"
              >
                Commencer la préinscription
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="h-10 w-auto brightness-0 invert opacity-90"
                />
                <Image
                  src="/images/logo-montessori.png"
                  alt="Montessori"
                  width={48}
                  height={48}
                  className="h-10 w-auto brightness-0 invert opacity-90"
                />
              </div>
              <p className="text-gray-400 max-w-md">
                Mon École et Moi - École Montessori à Brunstatt. 
                Un environnement bienveillant pour l&apos;épanouissement de chaque enfant.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contact@mon-ecole-et-moi.fr" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Mail size={16} />
                    <span>contact@mon-ecole-et-moi.fr</span>
                  </a>
                </li>
                <li>
                  <span className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span>Brunstatt, France</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Liens */}
            <div>
              <h4 className="font-semibold text-white mb-4">Accès rapide</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/preinscription" className="text-gray-400 hover:text-white transition-colors">
                    Préinscription
                  </Link>
                </li>
                <li>
                  <Link href="/connexion" className="text-gray-400 hover:text-white transition-colors">
                    Espace parent
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                    Administration
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Mon École et Moi. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

