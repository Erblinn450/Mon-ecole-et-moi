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
enum Role { PARENT, ADMIN, EDUCATEUR }

// Statuts préinscription
enum StatutPreinscription { EN_ATTENTE, DEJA_CONTACTE, VALIDE, REFUSE, ANNULE }

// Statuts inscription
enum StatutInscription { EN_COURS, ACTIVE, TERMINEE, ANNULEE }

// Statuts réinscription
enum StatutReinscription { EN_ATTENTE, VALIDEE, REFUSEE }

// Classes
enum Classe { MATERNELLE, ELEMENTAIRE, COLLEGE }

// Situation familiale
enum SituationFamiliale { MARIES, PACSES, UNION_LIBRE, SEPARES, DIVORCES, FAMILLE_MONOPARENTALE, AUTRE }

// Facturation
enum FrequencePaiement { MENSUEL, TRIMESTRIEL, SEMESTRIEL, ANNUEL }
enum ModePaiement { PRELEVEMENT, VIREMENT }
enum StatutFacture { EN_ATTENTE, ENVOYEE, PAYEE, PARTIELLE, EN_RETARD, ANNULEE }
enum TypeFacture { MENSUELLE, PONCTUELLE, AVOIR }
enum TypeLigne { SCOLARITE, REPAS, PERISCOLAIRE, DEPASSEMENT, INSCRIPTION, MATERIEL, REDUCTION, PERSONNALISE }
enum DestinataireFacture { LES_DEUX, PARENT1, PARENT2 }
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

## État du Projet (Février 2026)

### ✅ Modules Terminés
- Préinscription complète avec workflow email
- Authentification JWT + rôles (PARENT, ADMIN)
- Signature électronique du règlement
- Upload et validation justificatifs
- Export CSV (élèves, parents, préinscriptions, factures)
- Personnes autorisées (récupération enfants)
- Relance documents manquants par email
- Génération PDF des dossiers
- Réinscription (backend : module + endpoint)

### 🚧 En Cours / Prévu
- **Facturation** (Février-Mars - PRIORITÉ) → voir `PLAN_FACTURATION.md` pour le plan détaillé
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
- `PLAN_FACTURATION.md` : **IMPORTANT** - Plan détaillé module facturation (cahier des charges, tarifs, planning, décisions techniques)
- `PLANNING_REALISTE.md` : Planning semaine par semaine
- `MEMOIRE_L3.md` : Notes pour le mémoire de fin d'études
- `backend/README.md` : Documentation API détaillée
- `frontend/README.md` : Documentation frontend
- Swagger : http://localhost:3001/api/docs

## Règles pour Claude

### Niveau d'Exigence
**Coder comme un développeur senior avec 15 ans d'expérience.** Chaque ligne de code doit être réfléchie, sécurisée et maintenable. Pas de raccourcis, pas de "ça marchera pour l'instant".

### Règles Obligatoires

1. **Toujours lire le fichier avant de le modifier** - Comprendre le contexte existant
2. **Tester les modifications** - Build backend, test endpoints avec curl, vérifier les erreurs TypeScript
3. **Mettre à jour RECAP_PROJET.md** après chaque session significative
4. **Ne jamais exposer de credentials** - Pas de secrets en dur, utiliser `.env`
5. **Utiliser les enums Prisma** - Pas de strings hardcodés pour rôles/statuts
6. **Préférer éditer plutôt que créer** de nouveaux fichiers
7. **Committer régulièrement** avec messages descriptifs en français

### Bonnes Pratiques de Code

#### Sécurité (CRITIQUE)
- **Authentification** : Tout endpoint sensible doit avoir `@UseGuards(JwtAuthGuard)`
- **Autorisation** : Endpoints admin → `@Roles(Role.ADMIN)`
- **Propriété des données** : Toujours vérifier que l'utilisateur a le droit d'accéder à la ressource (ex: parent ne voit que SES enfants)
- **Validation** : Utiliser DTOs avec `class-validator` côté backend, Zod côté frontend
- **Injection SQL** : Toujours utiliser Prisma (jamais de raw SQL sans échappement)
- **XSS** : React échappe par défaut, mais attention aux `dangerouslySetInnerHTML`
- **Tokens** : Expiration obligatoire, pas de fallback insécurisé

#### Performance
- **Requêtes N+1** : Utiliser `include` Prisma pour les relations
- **Pagination** : Limiter les résultats pour les grandes listes
- **Indexes** : Vérifier que les champs fréquemment requêtés sont indexés

#### Maintenabilité
- **Typage strict** : Éviter `any`, définir des interfaces/types
- **Nommage clair** : Variables et fonctions explicites (pas de `x`, `data`, `temp`)
- **Commentaires** : Seulement pour expliquer le "pourquoi", pas le "quoi"
- **DRY** : Factoriser le code répétitif (mais pas trop tôt)
- **Séparation des responsabilités** : Controller → routing, Service → logique métier

#### Gestion d'Erreurs
- **Toujours catcher les erreurs** avec try/catch
- **Messages d'erreur explicites** pour l'utilisateur
- **Logs** pour le debug (mais pas d'infos sensibles)
- **Codes HTTP appropriés** : 400 (bad request), 401 (non auth), 403 (forbidden), 404 (not found), 500 (server error)

#### Avant Chaque Commit
- [ ] Build backend sans erreurs (`npm run build`)
- [ ] Pas d'erreurs TypeScript dans l'IDE
- [ ] Endpoints testés avec curl ou Postman
- [ ] Pas de `console.log` de debug oublié
- [ ] Pas de credentials/secrets en dur
- [ ] Code formaté correctement

### Règles Issues de l'Audit de Sécurité (Février 2026)

Ces règles ont été établies suite à un audit complet du code (sécurité, transactions, logique métier). Elles complètent les bonnes pratiques ci-dessus avec des cas concrets tirés du projet.

#### 1. Vérification de parenté sur les ressources enfant

**Tout endpoint qui prend un `enfantId` et qui n'est pas restreint aux admins DOIT vérifier que l'utilisateur authentifié est bien parent de cet enfant.**

Pattern à utiliser : méthode privée `verifierParente()` dans le service, appelée en tout premier.

```typescript
// ✅ CORRECT — repas.service.ts
private async verifierParente(enfantId: number, userId: number, isAdmin: boolean) {
  if (isAdmin) return;
  const enfant = await this.prisma.enfant.findUnique({ where: { id: enfantId } });
  if (!enfant || (enfant.parent1Id !== userId && enfant.parent2Id !== userId)) {
    throw new ForbiddenException('Vous n\'êtes pas autorisé à agir sur cet enfant');
  }
}

async commander(enfantId: number, date: string, userId: number, isAdmin: boolean, type: TypeRepas = 'MIDI') {
  await this.verifierParente(enfantId, userId, isAdmin); // ← Toujours en premier
  // ... logique métier
}
```

```typescript
// ❌ INTERDIT — ancien periscolaire.service.ts (pas de vérification)
async inscrire(enfantId: number, date: string) {
  // N'importe quel parent authentifié peut inscrire N'IMPORTE QUEL enfant
  return this.prisma.periscolaire.create({ data: { enfantId, ... } });
}
```

**Le controller doit passer `req.user.id` et `req.user.role === Role.ADMIN` au service :**

```typescript
// ✅ CORRECT — repas.controller.ts
@Post('commander')
commander(
  @Body() body: { enfantId: number; date: string },
  @Request() req: AuthenticatedRequest,
) {
  const isAdmin = req.user.role === Role.ADMIN;
  return this.repasService.commander(body.enfantId, body.date, req.user.id, isAdmin);
}
```

**Fichiers concernés** : `repas`, `periscolaire`, et tout futur module qui manipule des données enfant.

#### 2. Transactions Prisma (`$transaction`)

**Règle absolue : toute lecture qui conditionne une écriture DOIT être DANS la même transaction.**

Si tu lis une valeur, calcules quelque chose, puis écris le résultat → la lecture et l'écriture doivent être dans le même `$transaction`. Sinon, une requête concurrente peut modifier la donnée entre ta lecture et ton écriture (race condition).

```typescript
// ✅ CORRECT — facturation.service.ts (enregistrerPaiement)
async enregistrerPaiement(factureId: number, dto: EnregistrerPaiementDto) {
  return this.prisma.$transaction(async (tx) => {
    // Lecture DANS la transaction
    const facture = await tx.facture.findUnique({ where: { id: factureId } });
    if (!facture) throw new NotFoundException(...);

    const resteAPayer = Number(facture.montantTotal) - Number(facture.montantPaye);
    if (dto.montant > resteAPayer) throw new BadRequestException(...);

    await tx.paiement.create({ data: { factureId, montant: dto.montant, ... } });

    const totalPaye = Number(facture.montantPaye) + dto.montant;
    return tx.facture.update({
      where: { id: factureId },
      data: { montantPaye: Math.round(totalPaye * 100) / 100, statut: ... },
    });
  });
}
```

```typescript
// ❌ INTERDIT — ancienne version (lecture hors transaction)
async enregistrerPaiement(factureId: number, dto: EnregistrerPaiementDto) {
  const facture = await this.prisma.facture.findUnique({ where: { id: factureId } });
  // ↑ Lecture HORS transaction : la facture peut être modifiée entre cette ligne et le update
  return this.prisma.$transaction(async (tx) => {
    const totalPaye = Number(facture.montantPaye) + dto.montant; // ← donnée stale !
    // ...
  });
}
```

**Cas d'usage obligatoires pour `$transaction` :**
- Création multi-tables : `creerCompteParentEtEnfant` (user + enfant + update préinscription)
- Opérations financières : paiement, ajout/modification/suppression de ligne facture
- Génération de numéros séquentiels : `generateNumeroFacture` (avec `pg_advisory_xact_lock`)
- Toute opération read-then-write sur des données partagées

#### 3. Arithmétique monétaire

**Ne jamais faire confiance à l'arithmétique flottante de JavaScript pour les montants financiers.**

```javascript
// Problème fondamental de JavaScript :
0.1 + 0.2 === 0.3  // false ! → 0.30000000000000004
5.45 * 3            // 16.349999999999998
```

**Règle actuelle** (Math.round comme garde-fou) :
```typescript
// Toujours arrondir après chaque opération
const montant = Math.round(quantite * prixUnitaire * 100) / 100;
const total = Math.round((montantBase - reductionRFR) * 100) / 100;
```

**Règle cible** (migration vers Decimal.js prévue) :
```typescript
import { Decimal } from 'decimal.js';
const montant = new Decimal(quantite).times(prixUnitaire).toDecimalPlaces(2).toNumber();
```

**Ne jamais accumuler des additions flottantes en série** sans arrondir chaque étape. Prisma stocke les montants en `Decimal` côté BDD — le risque est uniquement côté JavaScript lors des calculs intermédiaires.

#### 4. Validation des montants financiers et logique métier

**`@Min(0)` obligatoire** sur tout champ prix ou montant dans les DTOs :
```typescript
// ✅ ajouter-ligne.dto.ts
@IsNumber({})
@Min(0, { message: 'Le prix unitaire ne peut pas être négatif' })
prixUnit: number;
```

**Valider côté serveur que le paiement ne dépasse pas le reste à payer :**
```typescript
const resteAPayer = Number(facture.montantTotal) - Number(facture.montantPaye);
if (dto.montant > resteAPayer) {
  throw new BadRequestException(
    `Le montant (${dto.montant}€) dépasse le reste à payer (${resteAPayer.toFixed(2)}€)`,
  );
}
```

**Machine à états sur `StatutFacture`** — transitions autorisées :
```
EN_ATTENTE  → ENVOYEE, ANNULEE
ENVOYEE     → EN_ATTENTE, PAYEE, PARTIELLE, EN_RETARD, ANNULEE
PARTIELLE   → PAYEE, EN_RETARD, ANNULEE
PAYEE       → EN_ATTENTE (correction d'erreur uniquement)
EN_RETARD   → EN_ATTENTE, PAYEE, PARTIELLE, ANNULEE
ANNULEE     → (aucune — état terminal)
```
Implémenté dans `FacturationService.TRANSITIONS_VALIDES`. Toute transition non listée lève une `BadRequestException`.

**Ne jamais skipper silencieusement une entrée en erreur dans un batch :**
```typescript
// ❌ INTERDIT — ancien getEnfantsActifs
if (!enfant.classe) {
  this.logger.warn(`Enfant sans classe`);
  continue; // ← L'admin ne sait pas qu'un enfant est ignoré
}

// ✅ CORRECT — lever une erreur explicite
if (!enfant.classe) {
  throw new BadRequestException(
    `Enfant #${enfant.id} (${enfant.prenom} ${enfant.nom}) n'a pas de classe définie. Veuillez lui attribuer une classe avant de facturer.`,
  );
}
```

**Ne jamais utiliser `include: { parent1: true }` sans `select`** — cela charge le password hash en mémoire :
```typescript
// ❌ INTERDIT
include: { parent1: true } // ← charge password, rememberToken, etc.

// ✅ CORRECT
include: {
  parent1: {
    select: { id: true, nom: true, prenom: true, email: true, telephone: true },
  },
}
```

### Anti-Patterns à Éviter

❌ **NE JAMAIS FAIRE :**
- Fallback de sécurité par défaut (`|| 'default-secret'`)
- Endpoint public qui devrait être protégé
- `any` partout sans raison valable
- Ignorer les erreurs avec catch vide
- Hardcoder des IDs (`id === 5` au lieu de recherche par nom)
- Laisser des TODO sans les traiter
- Stocker des mots de passe en clair
- Faire confiance aux données du frontend sans validation backend
- Lire une donnée hors `$transaction` si elle conditionne une écriture dans cette même transaction
- Utiliser `Number()` pour des calculs monétaires sans `Math.round` (ou mieux, `Decimal.js`)
- Skipper silencieusement une entrée en erreur dans un batch sans alerter l'utilisateur
- Utiliser `include: { parent1: true }` au lieu de `select` (expose le password hash)

✅ **TOUJOURS FAIRE :**
- Lever une erreur si config manquante
- Valider les entrées utilisateur
- Vérifier les permissions avant d'agir
- Utiliser des transactions pour les opérations multiples
- Logger les erreurs importantes
- Tester les cas limites (liste vide, données manquantes)
- Vérifier la parenté (`verifierParente`) avant toute opération sur un enfant
- `grep 'parent1: true'` et `grep 'parent2: true'` avant chaque commit pour détecter les fuites de password
