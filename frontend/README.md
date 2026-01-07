# Mon École et Moi - Frontend

Application Next.js 14 pour la gestion scolaire Montessori.

## 🚀 Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui style
- **Auth**: NextAuth.js (prévu)
- **Animations**: Framer Motion

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement dans .env.local
```

## 🔧 Configuration

Créer un fichier `.env.local` avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

L'application sera disponible sur http://localhost:3000

## 📁 Structure

```
src/
├── app/                    # App Router
│   ├── (public)/          # Pages publiques (préinscription, connexion)
│   ├── (parent)/          # Espace parent (dashboard, enfants, repas)
│   ├── (admin)/           # Espace admin (gestion complète)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/
│   └── ui/                # Composants UI réutilisables
└── lib/
    └── utils.ts           # Utilitaires
```

## 🎨 Design

- Palette de couleurs douces (verts Montessori, bleus apaisants)
- Interface mobile-first
- Animations fluides
- Accessibilité WCAG

## 📱 PWA

L'application est configurée pour être installable comme PWA sur mobile.

