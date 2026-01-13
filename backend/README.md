# Mon École et Moi - Backend

API RESTful construite avec **NestJS**, **Prisma** et **PostgreSQL**.

## 🚀 Stack

- **Framework**: NestJS 10
- **Base de données**: PostgreSQL 16
- **ORM**: Prisma
- **Authentification**: JWT (Passport) + Rôles (Guard)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger OpenAPI

## 🛠️ Installation

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
```

### Variables d'environnement (.env)
```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monecole?schema=public"
JWT_SECRET="votre_secret_tres_long_et_securise"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"

# Email (MailHog en dev)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_IGNORE_TLS=true
```

## 🗄️ Base de Données

```bash
# Générer le client Prisma (après modif schema.prisma)
npx prisma generate

# === MIGRATIONS ===
# Créer une nouvelle migration (développement)
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations (production)
npx prisma migrate deploy

# Réinitialiser la BDD (⚠️ supprime toutes les données)
npx prisma migrate reset

# Explorer la base de données
npx prisma studio
```

### Scripts npm disponibles

```bash
npm run prisma:generate    # Génère le client Prisma
npm run prisma:migrate     # Crée et applique une migration (dev)
npm run prisma:deploy      # Applique les migrations (production)
npm run prisma:reset       # Réinitialise la BDD avec seed
npm run prisma:studio      # Ouvre Prisma Studio
npm run db:seed            # Exécute le seed uniquement
```

## 🏃‍♂️ Démarrage

```bash
# Développement (avec hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📖 Documentation API

Une fois le serveur lancé, la documentation Swagger est accessible sur :
👉 **http://localhost:3001/api/docs**

## ✨ Modules Principaux

| Module | Description | Statut |
|--------|-------------|--------|
| `Auth` | Login, Register, Changement MDP | ✅ Complet |
| `Users` | Gestion des utilisateurs | ✅ Complet |
| `Preinscriptions` | Workflow d'inscription + Email | ✅ Complet |
| `Enfants` | Gestion des enfants | ✅ Complet |
| `Signatures` | Signature électronique règlement | ✅ Complet |
| `Justificatifs` | Upload documents | 🚧 En cours |
| `Facturation` | Gestion factures | 📅 Prévu Février |
