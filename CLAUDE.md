# CLAUDE.md - Instructions pour Claude Code

## Projet

**Mon École et Moi** - Application de gestion scolaire pour école Montessori privée.

- **Développeur** : Erblin Potoku (L3 Informatique - UHA 4.0)
- **Client** : Mon École Montessori et Moi (Audrey Ballester)
- **Stage** : 6 janvier - 23 juin 2026
- **Objectif** : Application opérationnelle pour la rentrée septembre 2026

## Stack Technique

| Couche | Technologie | Port |
|--------|-------------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | `3000` |
| Backend | NestJS 10 + Prisma ORM | `3001` |
| BDD | PostgreSQL 16 (Docker) | `5432` |
| Emails (dev) | MailHog | `8025` (UI) / `1025` (SMTP) |
| API Docs | Swagger | `3001/api/docs` |

## Structure du Projet

```
mon-ecole-et-moi/
├── frontend/                    # Next.js 14
│   └── src/
│       ├── app/
│       │   ├── (public)/       # preinscription, connexion
│       │   ├── (parent)/       # dashboard, mes-enfants, repas...
│       │   └── admin/          # preinscriptions, eleves, comptes...
│       ├── components/
│       ├── hooks/
│       ├── lib/api.ts          # Client API centralisé
│       └── types/
├── backend/                     # NestJS
│   └── src/
│       ├── modules/
│       │   ├── auth/           # JWT + Guards
│       │   ├── users/
│       │   ├── preinscriptions/
│       │   ├── enfants/
│       │   ├── justificatifs/
│       │   ├── signatures/
│       │   ├── export/
│       │   ├── personnes-autorisees/
│       │   └── email/
│       └── prisma/
│           └── schema.prisma
└── RECAP_PROJET.md             # Historique détaillé des sessions
```

## Commandes Essentielles

```bash
# Démarrer tout (depuis la racine)
docker compose up -d              # BDD + MailHog
cd backend && npm run start:dev   # API sur :3001
cd frontend && npm run dev        # App sur :3000

# Base de données
cd backend
npx prisma studio                 # GUI de la BDD
npx prisma generate               # Après modif schema.prisma
npx prisma migrate dev --name xxx # Créer une migration

# Build
cd backend && npm run build
cd frontend && npm run build
```

## Identifiants de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@ecole.fr` | `admin123` |
| Parent | `parent@test.fr` | `parent1234` |

## Conventions de Code

### TypeScript
- Typage strict, éviter `any` sauf cas exceptionnels
- Utiliser les enums Prisma (`Role`, `StatutPreinscription`, `Classe`)
- Imports absolus avec `@/` dans le frontend

### Backend (NestJS)
- Un module = un dossier avec `*.module.ts`, `*.service.ts`, `*.controller.ts`
- DTOs avec `class-validator` pour la validation
- Guards pour l'authentification : `@UseGuards(JwtAuthGuard, RolesGuard)`
- Décorateurs pour les rôles : `@Roles(Role.ADMIN)`

### Frontend (Next.js)
- App Router (dossiers avec `page.tsx`)
- `"use client"` pour les composants interactifs
- Hooks personnalisés dans `/hooks` (useAuth, useEnfants, useDossiers)
- API calls via `/lib/api.ts`

### Git
- Commits en français avec préfixes : `feat:`, `fix:`, `docs:`, `refactor:`
- Co-authored avec Claude : `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

## Points d'Attention

### Sécurité
- JWT_SECRET obligatoire en `.env` (pas de fallback)
- Tous les endpoints sensibles protégés par `JwtAuthGuard`
- Vérification de propriété pour les données parent (email match)
- Tokens de reset expirent en 1h

### Base de Données
- Tables en snake_case (`preinscriptions`, pas `Preinscription`)
- Toujours `npx prisma generate` après modification du schema
- Relations : `parent1Id`, `parent2Id`, `enfantId`, `preinscriptionId`

### Emails
- Templates Handlebars dans `backend/src/modules/email/templates/`
- Copie automatique vers `dist/` au build (vérifier `nest-cli.json`)
- MailHog pour les tests : http://localhost:8025

## État du Projet (Janvier 2026)

### Modules Terminés
- Préinscription complète avec workflow email
- Authentification JWT + rôles (PARENT, ADMIN)
- Signature électronique du règlement
- Upload justificatifs
- Export CSV (élèves, parents, préinscriptions)
- Personnes autorisées (récupération enfants)
- Relance documents manquants

### En Cours / Prévu
- Facturation (Février - PRIORITÉ)
- Repas / Périscolaire (Avril)
- Communication parents (Mai)

## Documentation Complète

- `RECAP_PROJET.md` : Historique détaillé de chaque session de travail
- `PLANNING_REALISTE.md` : Planning jusqu'à juin 2026
- `MEMOIRE_L3.md` : Notes pour le mémoire de fin d'études
- `backend/README.md` : Documentation API
- `frontend/README.md` : Documentation frontend

## Règles Importantes

1. **Toujours lire le fichier avant de le modifier**
2. **Tester les modifications** (build backend, endpoints API)
3. **Mettre à jour RECAP_PROJET.md** après chaque session significative
4. **Ne jamais exposer de credentials en production**
5. **Utiliser les enums Prisma** (pas de strings hardcodés pour les rôles/statuts)
6. **Préférer éditer plutôt que créer** de nouveaux fichiers
