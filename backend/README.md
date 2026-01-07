# Mon École et Moi - Backend

API NestJS pour la gestion scolaire Montessori.

## 🚀 Technologies

- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Auth**: JWT + Passport
- **Documentation**: Swagger

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
# Créer un fichier .env avec les variables nécessaires
```

## 🔧 Configuration

Créer un fichier `.env` avec :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mon_ecole_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Application
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## 🗄️ Base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer/mettre à jour les tables
npm run prisma:migrate

# Visualiser la BDD
npm run prisma:studio
```

## 🏃 Démarrage

```bash
# Mode développement
npm run start:dev

# Build production
npm run build

# Démarrer en production
npm run start:prod
```

L'API sera disponible sur http://localhost:4000

## 📚 Documentation API

Swagger UI disponible sur http://localhost:4000/api/docs

## 📁 Structure

```
src/
├── main.ts                 # Point d'entrée
├── app.module.ts           # Module principal
├── prisma/                 # Service Prisma
└── modules/
    ├── auth/              # Authentification JWT
    ├── users/             # Gestion utilisateurs
    ├── enfants/           # Gestion enfants
    ├── preinscriptions/   # Préinscriptions
    ├── repas/             # Commande repas
    ├── periscolaire/      # Périscolaire
    ├── justificatifs/     # Documents
    ├── signatures/        # Signature règlement
    └── facturation/       # Facturation (à compléter)
```

## 🔐 Endpoints principaux

### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil connecté

### Préinscriptions
- `POST /api/preinscriptions` - Nouvelle préinscription (public)
- `GET /api/preinscriptions` - Liste (admin)
- `PATCH /api/preinscriptions/:id/statut` - Changer statut

### Repas
- `POST /api/repas/commander` - Commander un repas
- `GET /api/repas/date/:date` - Repas d'une date
- `DELETE /api/repas/:id` - Annuler (1 semaine avant)

### Signatures
- `POST /api/signatures/signer` - Signer règlement
- `GET /api/signatures/non-signees` - Enfants sans signature

