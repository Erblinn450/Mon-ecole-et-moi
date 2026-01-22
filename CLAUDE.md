# CLAUDE.md - Instructions pour Claude Code

## Projet

**Mon École et Moi** - Application de gestion scolaire pour école Montessori privée.

- **Développeur** : Erblin Potoku (L3 Informatique - UHA 4.0)
- **Client** : Mon École Montessori et Moi (Audrey Ballester)
- **Stage** : 6 janvier - 23 juin 2026
- **Objectif** : Application opérationnelle pour la rentrée septembre 2026
- **Contrainte** : Mémoire L3 de 40 pages + oral en juin 2026

## Stack Technique

| Couche | Technologie | Port |
|--------|-------------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | `3000` |
| Backend | NestJS 10 + Prisma ORM | `3001` |
| BDD | PostgreSQL 16 (Docker) | `5432` |
| Emails (dev) | MailHog | `8025` (UI) / `1025` (SMTP) |
| API Docs | Swagger | `3001/api/docs` |
| Prisma Studio | GUI BDD | `5555` |

### Librairies Clés
- **Frontend** : Tailwind, Lucide React (icônes), Framer Motion, React Hook Form, Zod
- **Backend** : Passport JWT, class-validator, bcrypt, Handlebars (emails), PDFKit

## Structure du Projet

```
mon-ecole-et-moi/
├── frontend/                    # Next.js 14
│   └── src/
│       ├── app/
│       │   ├── (public)/       # preinscription, connexion, verification-email
│       │   ├── (parent)/       # dashboard, mes-enfants, repas, periscolaire, personnes-autorisees
│       │   └── admin/          # dashboard, preinscriptions, eleves, comptes, login
│       ├── components/
│       │   ├── layout/         # ParentLayout, AdminLayout
│       │   ├── ui/             # Boutons, inputs réutilisables
│       │   └── justificatifs/  # Upload components
│       ├── hooks/              # useAuth, useEnfants, useDossiers, useRecaptcha
│       ├── lib/api.ts          # Client API centralisé
│       ├── config/tarifs.ts    # Tarifs cantine, périscolaire
│       └── types/index.ts      # Types TypeScript partagés
├── backend/                     # NestJS
│   └── src/
│       ├── modules/
│       │   ├── auth/           # JWT strategy, guards, login/register
│       │   ├── users/          # CRUD utilisateurs
│       │   ├── preinscriptions/# Workflow complet + PDF + relance
│       │   ├── enfants/        # Gestion enfants
│       │   ├── justificatifs/  # Upload/validation documents
│       │   ├── signatures/     # Signature électronique règlement
│       │   ├── export/         # Export CSV
│       │   ├── personnes-autorisees/
│       │   ├── rappels/        # Cron jobs (rappel annuel RC)
│       │   ├── email/          # Service email multi-providers
│       │   ├── repas/          # (désactivé - prévu avril)
│       │   └── periscolaire/   # (désactivé - prévu avril)
│       ├── common/
│       │   ├── guards/         # JwtAuthGuard, RolesGuard, RecaptchaGuard
│       │   └── decorators/     # @Roles()
│       └── prisma/
│           ├── schema.prisma   # Schéma BDD complet
│           └── seed.ts         # Données de test
├── RECAP_PROJET.md             # IMPORTANT: Historique détaillé des sessions
├── PLANNING_REALISTE.md        # Planning jusqu'à juin 2026
└── MEMOIRE_L3.md               # Notes pour le mémoire
```

## Commandes Essentielles

```bash
# === DÉMARRAGE ===
docker compose up -d              # BDD + MailHog
cd backend && npm run start:dev   # API sur :3001
cd frontend && npm run dev        # App sur :3000

# === BASE DE DONNÉES ===
cd backend
npx prisma studio                 # GUI de la BDD (port 5555)
npx prisma generate               # OBLIGATOIRE après modif schema.prisma
npx prisma migrate dev --name xxx # Créer une migration (dev)
npx prisma migrate deploy         # Appliquer migrations (prod)
npx prisma db seed                # Insérer données de test

# === BUILD & TEST ===
cd backend && npm run build       # Compiler TypeScript
cd frontend && npm run build      # Build Next.js

# === DOCKER ===
docker compose down               # Arrêter conteneurs
docker compose logs -f            # Voir les logs

# === UTILITAIRES ===
kill -9 $(lsof -ti:3001)          # Libérer port 3001
kill -9 $(lsof -ti:3000)          # Libérer port 3000
```

## Connexion BDD PostgreSQL

```
Host: localhost
Port: 5432
Database: monecole
User: postgres
Password: postgres
```

Conteneur Docker : `monecole-postgres-dev`

## Identifiants de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@ecole.fr` | `admin123` |
| Parent | `parent@test.fr` | `parent1234` |

## Enums Prisma (TOUJOURS utiliser ces valeurs)

```typescript
// Rôles utilisateurs
enum Role { PARENT, ADMIN }

// Statuts préinscription
enum StatutPreinscription { EN_ATTENTE, EN_COURS, VALIDE, REFUSE, LISTE_ATTENTE }

// Classes
enum Classe { MATERNELLE, ELEMENTAIRE }

// Situation familiale
enum SituationFamiliale { MARIES, PACSES, CONCUBINAGE, SEPARES, DIVORCES, AUTRE }
```

## Conventions de Code

### TypeScript
- Typage strict, éviter `any` sauf cas exceptionnels
- Utiliser les enums Prisma (pas de strings hardcodés)
- Imports absolus avec `@/` dans le frontend

### Backend (NestJS)
```typescript
// Structure d'un module
@Module({
  imports: [PrismaModule],
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService],
})
export class XxxModule {}

// Protection des routes
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)

// Validation DTO
@IsEmail()
@IsNotEmpty()
@MinLength(8)
```

### Frontend (Next.js)
```typescript
// Composant client
"use client";

// Appels API via lib/api.ts
import { authApi, preinscriptionsApi } from "@/lib/api";

// Token JWT
const token = localStorage.getItem("auth_token");
```

### Git
- Commits en français avec préfixes : `feat:`, `fix:`, `docs:`, `refactor:`
- Co-authored : `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
- Ne JAMAIS `git push --force` sur main

## Points d'Attention Critiques

### Sécurité
- `JWT_SECRET` obligatoire en `.env` (erreur si absent)
- Tous les endpoints sensibles : `@UseGuards(JwtAuthGuard)`
- Endpoints admin : ajouter `@Roles(Role.ADMIN)`
- Vérifier propriété des données (email du parent match)
- Tokens reset password expirent en 1h
- Credentials test masqués en production (`NODE_ENV`)

### Base de Données
- Tables en **snake_case** : `preinscriptions`, `justificatifs_attendus`
- `npx prisma generate` OBLIGATOIRE après chaque modif schema
- Relations : `parent1Id`, `parent2Id`, `enfantId`, `preinscriptionId`
- Soft delete avec `deletedAt` sur certaines tables

### Emails
- Templates : `backend/src/modules/email/templates/*.hbs`
- Vérifier copie dans `dist/` (config dans `nest-cli.json`)
- Test emails : http://localhost:8025 (MailHog)
- Providers : MailHog (dev), SendGrid (prod)

### Frontend
- Routes parent : `(parent)/` avec ParentLayout
- Routes admin : `admin/` avec AdminLayout
- Routes publiques : `(public)/`
- localStorage : `auth_token`, `user`, `user_name`, `user_email`

## Flux Métier Important

### Préinscription → Inscription
1. Parent remplit formulaire préinscription (public)
2. Email de confirmation envoyé
3. Admin valide → compte parent créé automatiquement + enfant créé
4. Email avec identifiants temporaires envoyé au parent
5. Parent se connecte → changement mot de passe obligatoire
6. Parent signe règlement intérieur (signature électronique)
7. Parent upload justificatifs (pièce identité, vaccins, RC...)
8. Admin valide les documents
9. Inscription finalisée

### Justificatifs Obligatoires
- Pièce d'identité parent(s)
- Acte de naissance / Livret de famille
- Justificatif de domicile
- Carnet de vaccination
- Attestation de responsabilité civile (à renouveler chaque année)
- ~~Règlement intérieur signé~~ (géré via signature électronique, exclu de la liste)

## État du Projet (Janvier 2026)

### ✅ Modules Terminés
- Préinscription complète avec workflow email
- Authentification JWT + rôles (PARENT, ADMIN)
- Signature électronique du règlement
- Upload et validation justificatifs
- Export CSV (élèves, parents, préinscriptions, factures)
- Personnes autorisées (récupération enfants)
- Relance documents manquants par email
- Génération PDF des dossiers

### 🚧 En Cours / Prévu
- **Facturation** (Février - PRIORITÉ)
- Repas / Périscolaire (Avril)
- Communication parents (Mai)
- PWA Mobile (Juin si temps)

## Problèmes Connus et Solutions

| Problème | Solution |
|----------|----------|
| Templates email non trouvés | Vérifier `nest-cli.json` assets, rebuild |
| Port déjà utilisé | `kill -9 $(lsof -ti:3001)` |
| Prisma "relation does not exist" | Tables en snake_case |
| CSS ne charge pas | Redémarrer frontend |
| Token invalide après modif | Vider localStorage, reconnecter |
| Build frontend échoue | Certaines pages ont des erreurs préexistantes |

## Documentation Complète

- `RECAP_PROJET.md` : **IMPORTANT** - Historique détaillé de chaque session
- `PLANNING_REALISTE.md` : Planning semaine par semaine
- `MEMOIRE_L3.md` : Notes pour le mémoire de fin d'études
- `backend/README.md` : Documentation API détaillée
- `frontend/README.md` : Documentation frontend
- Swagger : http://localhost:3001/api/docs

## Règles pour Claude

1. **Toujours lire le fichier avant de le modifier**
2. **Tester les modifications** (build backend, endpoints API)
3. **Mettre à jour RECAP_PROJET.md** après chaque session significative
4. **Ne jamais exposer de credentials en production**
5. **Utiliser les enums Prisma** (pas de strings hardcodés)
6. **Préférer éditer plutôt que créer** de nouveaux fichiers
7. **Vérifier la sécurité** des endpoints (guards, vérification propriété)
8. **Committer régulièrement** avec messages descriptifs en français
