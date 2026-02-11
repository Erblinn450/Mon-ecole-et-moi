"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, UtensilsCrossed, Users, ArrowRight, Mail, MapPin, Heart, Sparkles } from "lucide-react";

/**
 * Composant Blob pour l'arrière-plan animé
 */
const Blob = ({ color, size, top, left, delay }: { color: string, size: string, top: string, left: string, delay: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-40 pointer-events-none z-0 ${color} ${size}`}
    animate={{
      x: [0, 30, -30, 0],
      y: [0, -50, 50, 0],
      scale: [1, 1.1, 0.9, 1],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay: delay,
      ease: "linear"
    }}
    style={{ top, left }}
  />
);

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
      <main className="min-h-screen bg-[#FDFCF8] selection:bg-emerald-100 selection:text-emerald-900">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF8]/70 backdrop-blur-md border-b border-emerald-100/30">
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
                <span className="font-semibold text-emerald-900 hidden sm:block">Mon École et Moi</span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-6">
                <Link
                  href="/connexion"
                  className="text-sm font-medium text-emerald-800 hover:text-emerald-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/preinscription"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-full transition-all shadow-sm hover:shadow-md"
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
                  className="h-10 w-auto opacity-70"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-40 pb-32 overflow-hidden min-h-[95vh] flex items-center">
          {/* Blobs animés pour la profondeur */}
          <Blob color="bg-emerald-200" size="w-96 h-96" top="10%" left="60%" delay={0} />
          <Blob color="bg-amber-100" size="w-[500px] h-[500px]" top="50%" left="-10%" delay={5} />
          <Blob color="bg-teal-100" size="w-80 h-80" top="70%" left="70%" delay={2} />

          {/* Background Image with Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="/images/hero_bg.png"
              alt="Classe Montessori"
              fill
              className="object-cover opacity-60"
              priority
            />
            {/* Horizontal gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF8] via-[#FDFCF8]/40 to-transparent" />
            {/* Vertical gradient for seamless integration with the next section */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-100" />
          </motion.div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl"
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 rounded-lg text-emerald-800 text-sm font-medium mb-10 border border-emerald-100/50 backdrop-blur-sm">
                <span className="flex items-center justify-center w-5 h-5 bg-emerald-200 rounded-full text-[10px]">✨</span>
                École Montessori à Brunstatt depuis 2016
              </motion.div>

              {/* Main Title */}
              <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
                <span className="text-emerald-900">L&apos;épanouissement</span>
                <br />
                <span className="text-amber-600 font-serif italic pr-4">naturel</span>
                <span className="text-emerald-900">de l&apos;enfant</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-emerald-950/70 mb-12 leading-relaxed max-w-2xl font-light">
                Une école qui cultive la bienveillance et l&apos;autonomie au cœur d&apos;un environnement épanouissant pour les 3-12 ans en Alsace.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 mt-8">
                <Link
                  href="/preinscription"
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-emerald-900 hover:bg-emerald-950 rounded-2xl transition-all shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Préinscrire mon enfant
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/connexion"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-emerald-900 bg-white/50 hover:bg-white border border-emerald-100 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                >
                  Espace Parents
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Sections de contenu (Ambiances & Services) */}
        <div className="bg-white">
          {/* Ambiances Section */}
          <section className="py-24 bg-white overflow-hidden relative">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-4xl md:text-6xl font-bold text-emerald-900 mb-6">Nos Ambiances Montessori</h2>
                <div className="w-32 h-2 bg-amber-400 mx-auto rounded-full mb-8 shadow-sm" />
                <p className="text-lg text-emerald-950/80 leading-relaxed font-medium">
                  Des classes multi-âges encadrées par une équipe formée AMI, respectant le rythme de chaque enfant.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {[
                  {
                    title: "Maternelle (3-6 ans)",
                    desc: "Un espace dédié à la conquête de l'autonomie, à l'éveil sensoriel et à la confiance en soi.",
                    icon: Heart,
                    color: "bg-emerald-50"
                  },
                  {
                    title: "Élémentaire (6-12 ans)",
                    desc: "Encourager la curiosité intellectuelle et la collaboration sociale à travers l'Éducation Cosmique.",
                    icon: Sparkles,
                    color: "bg-emerald-50"
                  }
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="p-12 rounded-[2.5rem] bg-[#FDFCF8] border border-emerald-100 shadow-xl shadow-emerald-900/5"
                  >
                    <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center text-emerald-700 mb-8`}>
                      <card.icon size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-900 mb-4">{card.title}</h3>
                    <p className="text-emerald-950/60 text-lg leading-relaxed">{card.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-24 bg-[#FDFCF8]">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-4xl mx-auto mb-20">
                <h2 className="text-4xl md:text-6xl font-bold text-emerald-900 mb-6">Services connectés à la vie de l&apos;école</h2>
                <div className="w-32 h-2 bg-amber-400 mx-auto rounded-full mb-8 shadow-sm" />
                <p className="text-lg text-emerald-950/80 leading-relaxed font-medium">
                  Une plateforme moderne conçue pour simplifier les échanges et le quotidien des familles.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "Dossier de préinscription", icon: FileText },
                  { title: "Repas & Activités", icon: UtensilsCrossed },
                  { title: "Communication Famille", icon: Users }
                ].map((service, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-10 rounded-[2rem] border border-emerald-100/50 shadow-lg text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto mb-8">
                      <service.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">{service.title}</h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="relative bg-[#061C16] text-white overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 opacity-30" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-900/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-6 pt-24 pb-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
              {/* Logo & Info */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/20">
                    <Image src="/images/logo.png" alt="Logo" width={56} height={56} className="h-12 w-auto" />
                  </div>
                  <div className="h-12 w-px bg-white/10 mx-2 hidden sm:block" />
                  <a href="https://www.montessori-france.asso.fr/" target="_blank" rel="noopener noreferrer">
                    <Image src="/images/logo-montessori.png" alt="Montessori" width={56} height={56} className="h-10 w-auto brightness-0 invert opacity-60 hover:opacity-100 transition-opacity" />
                  </a>
                </div>
                <p className="text-emerald-100/60 max-w-md text-lg leading-relaxed font-light">
                  Une école qui cultive la bienveillance et l&apos;autonomie au cœur d&apos;un environnement épanouissant pour les 3-12 ans à Brunstatt.
                </p>
                <div className="flex gap-5">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-emerald-400/50 rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-8">
                <h4 className="text-xl font-bold text-amber-500">Contact</h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Notre Adresse</p>
                      <p className="text-emerald-100/50 text-sm font-light leading-relaxed">
                        58 rue Damberg,<br />
                        68350 Brunstatt, Alsace
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Email</p>
                      <p className="text-emerald-100/50 text-sm font-light">contact@mon-ecole-et-moi.com</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Links */}
              <div className="space-y-8">
                <h4 className="text-xl font-bold text-amber-500">Navigation</h4>
                <ul className="space-y-4">
                  {['Accueil', 'L\'école', 'Pédagogie', 'Inscriptions', 'Espace Parents', 'Espace Admin'].map((item) => (
                    <li key={item}>
                      <Link href={item === 'Espace Admin' ? '/admin/login' : item === 'Espace Parents' ? '/connexion' : item === 'Inscriptions' ? '/preinscription' : '/'} className="text-emerald-100/50 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                        <div className="w-1 h-1 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-emerald-100/30 text-[10px] uppercase tracking-widest font-medium">
              <p>© {new Date().getFullYear()} Mon École et Moi. Tous droits réservés.</p>
              <div className="flex gap-8">
                <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
                <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
  );
}
