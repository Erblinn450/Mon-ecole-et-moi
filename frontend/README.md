# Mon École et Moi - Frontend

Application web moderne construite avec **Next.js 14**, **Tailwind CSS** et **TypeScript**.

## 🚀 Stack

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styles**: Tailwind CSS + Shadcn UI
- **Icônes**: Lucide React
- **Formulaires**: React Hook Form + Zod
- **Animations**: Framer Motion

## 🛠️ Installation

```bash
# Installation des dépendances
npm install

# Configuration
cp .env.example .env.local
```

### Variables d'environnement (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre_cle_publique_recaptcha
```

## 🏃‍♂️ Démarrage

```bash
# Serveur de développement
npm run dev
```
L'application sera accessible sur : **http://localhost:3000**

## 📂 Structure du projet

```
src/
├── app/                  # Pages (App Router)
│   ├── (auth)/          # Routes authentification
│   ├── (parent)/        # Espace Parent (protégé)
│   ├── (admin)/         # Espace Admin (protégé)
│   └── (public)/        # Pages publiques
├── components/           # Composants Réutilisables
│   ├── ui/              # Composants de base (boutons, inputs...)
│   └── ...
├── hooks/                # Custom Hooks (useAuth, useEnfants...)
├── lib/                  # Utilitaires (API client, dates...)
└── types/                # Définitions TypeScript partagées
```

## ✨ Fonctionnalités Clés

- **Espace Parent** : Dashboard, gestion enfants, inscriptions
- **Espace Admin** : Valiation dossiers, gestion utilisateurs
- **Sécurité** : Protection des routes, gestion automatique des tokens JWT, reCAPTCHA v3
