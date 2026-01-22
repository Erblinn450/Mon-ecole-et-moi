# 📋 Récapitulatif Projet - Mon École et Moi

**Développeur :** Erblin Potoku (L3 Informatique - UHA 4.0)  
**Client :** Mon École Montessori et Moi (Audrey Ballester)  
**Stage :** 6 janvier - 23 juin 2026 (24 semaines)  
**Objectif :** Application opérationnelle pour la rentrée septembre 2026

---

## 📚 Contexte du Projet

### Historique
- **6 semaines en groupe** (UHA 4.0) : Développement initial en Laravel
- **Stage solo** : Migration vers Next.js + NestJS depuis janvier 2026
- **Contrainte** : Mémoire L3 de 40 pages + oral en juin 2026

### L'École
| | |
|---|---|
| **Nom** | Mon École et Moi |
| **Type** | École privée Montessori hors contrat |
| **Adresse** | 58 rue Damberg, 68350 Brunstatt-Didenheim |
| **Effectif** | ~50 élèves |
| **Classes** | Maternelle (3-6 ans), Élémentaire (6-12 ans), Collège |
| **Contact** | monecoleetmoibrunstatt@gmail.com / 03 89 06 07 77 |

### Horaires de Travail
- **Lundi/Mardi/Mercredi** : Télétravail (9h-17h)
- **Jeudi** : Télétravail (8h30-16h30)
- **Vendredi** : À l'école (9h-17h)

---

## 🛠️ Stack Technique

### Architecture Actuelle (Next.js + NestJS)

| Couche | Technologie | Port |
|--------|-------------|------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind | `localhost:3000` |
| **Backend** | NestJS 10 + Prisma | `localhost:3001/api` |
| **BDD** | PostgreSQL (Docker) | `localhost:5432` |
| **Emails (dev)** | MailHog | `localhost:8025` |
| **Swagger** | API Docs | `localhost:3001/api/docs` |
| **Prisma Studio** | BDD GUI | `localhost:5555` |

### Structure du Projet

```
mon-ecole-et-moi/
├── frontend/                    # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       # preinscription, connexion, verification-email
│   │   │   ├── (parent)/       # dashboard, mes-enfants, repas, periscolaire...
│   │   │   └── admin/          # preinscriptions, eleves, comptes...
│   │   ├── components/         # UI réutilisables
│   │   ├── config/             # tarifs.ts
│   │   ├── hooks/              # useRecaptcha...
│   │   ├── lib/                # api.ts, utils
│   │   └── types/              # Types TypeScript
│   └── public/                 # images, documents
│
├── backend/                     # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT + Login/Register
│   │   │   ├── users/          # CRUD utilisateurs
│   │   │   ├── enfants/        # Gestion enfants
│   │   │   ├── preinscriptions/# + vérification email
│   │   │   ├── justificatifs/  # Upload documents
│   │   │   ├── signatures/     # Signature règlement
│   │   │   ├── facturation/    # À développer (prioritaire)
│   │   │   ├── repas/          # Désactivé (prévu avril)
│   │   │   ├── periscolaire/   # Désactivé (prévu avril)
│   │   │   ├── documents/      # Règlement PDF
│   │   │   ├── export/         # Export CSV complet
│   │   │   ├── personnes-autorisees/ # Récupération enfants
│   │   │   ├── rappels/        # Rappels automatiques
│   │   │   └── email/          # Multi-providers
│   │   ├── common/guards/      # JWT, Roles, Recaptcha
│   │   └── prisma/             # PrismaService
│   └── prisma/
│       ├── schema.prisma       # Schéma BDD complet
│       └── seed.ts             # Données de test
│
└── shared/                      # Types partagés
```

---

## 🗄️ Base de Données PostgreSQL

### Connexion
```
Host: localhost | Port: 5432 | Database: monecole | User: postgres | Password: postgres
```

### Tables Principales (Prisma)

| Table | Fonction |
|-------|----------|
| `users` | Parents, admin, éducateurs (rôles) |
| `enfants` | Liés à 1 ou 2 parents |
| `preinscriptions` | Demandes avec workflow de validation |
| `inscriptions` | Inscriptions validées par année scolaire |
| `repas` | Commandes repas (unique par enfant/date/type) |
| `periscolaires` | Réservations (unique par enfant/date) |
| `justificatifs` | Documents uploadés |
| `signature_reglements` | Signatures (unique par enfant) |
| `factures` + `lignes_factures` | Facturation |
| `calendrier_scolaire` | Vacances, fériés |
| `personnes_autorisees` | Personnes autorisées récupération enfants |

### Commandes Utiles
```bash
# Accès psql
docker exec -it monecole-postgres psql -U postgres -d monecole

# Prisma Studio
cd backend && npx prisma studio  # http://localhost:5555

# Créer une migration après modif schema (dev)
cd backend && npx prisma migrate dev --name nom_migration

# Ou appliquer les migrations existantes (prod)
cd backend && npx prisma migrate deploy
```

---

## 🔐 Authentification & Sécurité

### Flux d'authentification
1. **Login** → `POST /api/auth/login` → Retourne `{ user, access_token }`
2. **Token** stocké dans `localStorage.auth_token`
3. **Requêtes** avec header `Authorization: Bearer <token>`

### Comptes de test
| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@ecole.fr` | `admin123` | ADMIN |
| `parent@test.fr` | `parent123` | PARENT |

### Sécurité Production
| Protection | Description |
|------------|-------------|
| **Rate Limiting** | 5 req/min sur login, 100 req/min global |
| **reCAPTCHA v3** | Anti-bot sur préinscription |
| **Mots de passe** | 12 caractères aléatoires en production |
| **Vérification email** | Token 24h optionnel |

---

## 💰 Tarifs École (Centralisés dans `frontend/src/config/tarifs.ts`)

| Service | Montant |
|---------|---------|
| Scolarité | **555€/mois** (12 mois) |
| Réduction fratrie | **-20%** dès le 2e enfant |
| Inscription 1ère année | **320€** |
| Inscription réinscription | **165€/an** |
| Repas midi | **5,45€** |
| Périscolaire (16h-17h30) | **6,20€/séance** |

**Organisation** : Semaine de 4 jours (lundi, mardi, jeudi, vendredi)

---

## 🖥️ Commandes de Développement

### Démarrer le projet
```bash
# Terminal 1 - PostgreSQL + MailHog
docker compose up -d

# Terminal 2 - Backend NestJS (port 3001)
cd backend && npm run start:dev

# Terminal 3 - Frontend Next.js (port 3000)
cd frontend && npm run dev
```

### Utilitaires
```bash
# Tuer un process sur un port
kill -9 $(lsof -ti:3001)

# Reconstruire le backend
cd backend && npm run build

# Copier les templates email (après build)
cp backend/src/modules/email/templates/*.hbs backend/dist/src/modules/email/templates/
```

---

## ⚙️ Variables d'Environnement

### Backend `.env`
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/monecole?schema=public"
JWT_SECRET="votre_cle_secrete_minimum_32_caracteres"
JWT_EXPIRES_IN="7d"
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
MAIL_FROM="Mon École et Moi <noreply@mon-ecole-et-moi.fr>"
RECAPTCHA_SECRET_KEY=6Lxxxxx
FRONTEND_URL=https://mon-ecole-et-moi.fr
USE_RANDOM_PASSWORD=true
REQUIRE_EMAIL_VERIFICATION=true
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=https://api.mon-ecole-et-moi.fr/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxx
```

---

## 🐛 Problèmes Connus et Solutions

| Problème | Solution |
|----------|----------|
| Templates email non trouvés | `cp backend/src/modules/email/templates/*.hbs backend/dist/src/modules/email/templates/` |
| Port déjà utilisé | `kill -9 $(lsof -ti:3001)` |
| Prisma "relation does not exist" | Tables en snake_case : `preinscriptions` (pas `Preinscription`) |
| CSS ne charge pas | Redémarrer frontend : `kill -9 $(lsof -ti:3000)` |

---

## 📊 État du Projet (Janvier 2026)

### ✅ Modules terminés
| Module | Frontend | Backend |
|--------|----------|---------|
| Setup projet | ✅ | ✅ |
| Préinscription | ✅ | ✅ |
| Authentification JWT | ✅ | ✅ |
| Emails multi-providers | - | ✅ |
| Sécurité (rate limit, captcha) | - | ✅ |
| Signature règlement | ✅ | ✅ |
| Tarifs intégrés | ✅ | - |

### 🟡 En cours
| Module | État | Prévu |
|--------|------|-------|
| Dashboard parent | 50% | S2 janvier |
| Interface admin | 60% | S4 janvier |
| Upload justificatifs | En cours | S3 janvier |

### ⏸️ Désactivés (frontend fait, backend commenté)
| Module | Prévu |
|--------|-------|
| Repas | Avril |
| Périscolaire | Avril |

### ⬜ À faire
| Module | Prévu |
|--------|-------|
| **FACTURATION** | **Février-Mars (PRIORITÉ)** |
| Communication | Mai |
| PWA Mobile | Juin (si temps) |

---

## 📜 HISTORIQUE DES AVANCÉES

> À chaque session de travail, ajouter une entrée avec :
> - 📅 Date
> - ✅ Ce qui a été fait
> - 📁 Fichiers modifiés
> - 🐛 Bugs corrigés
> - ⏭️ Prochaines étapes

---

### 🗓️ Lundi 6 janvier 2026

**Durée :** ~12h de travail avec IA

**✅ Réalisé :**
1. Setup projet complet (Next.js 14 + NestJS + PostgreSQL + Prisma + MailHog)
2. Module Préinscription complet avec emails
3. Authentification JWT avec rôles
4. Changement mot de passe obligatoire (impossible à bypass)
5. Système d'emails multi-providers
6. Sécurité production (rate limiting, reCAPTCHA, mots de passe aléatoires)
7. Validation admin → création auto compte parent + enfant
8. Signature règlement intérieur
9. Intégration tarifs réels école
10. Calendrier 4 jours/semaine

**🐛 Bugs corrigés :**
- Templates email non copiés dans `dist/`
- Boucle infinie changement mot de passe (router.push → window.location.href)
- Menu accessible pendant changement mdp obligatoire
- Numéros de dossier non uniques

**⏭️ Prochaines étapes :**
- [ ] Dashboard parent complet
- [ ] Liste enfants du parent
- [ ] Upload justificatifs

---

### 🗓️ Mercredi 8 janvier 2026

**Durée :** 3h

**✅ Réalisé :**
1. **Audit Complet du Projet** (Score final : 8.2/10)
2. **Optimisations & Fixes :**
   - Correction bug changement mot de passe (premiereConnexion)
   - Optimisation schéma Prisma (Index composite user/facture)
   - Suppression dépendances front inutiles (next-auth, @prisma/client)
   - Calcul dynamique année scolaire (plus hardcodé)
3. **Documentation & Nettoyage :**
   - Mise à jour totale des README (root, backend, frontend) pour NestJS/Next.js
   - Archivage des anciennes docs Laravel dans `archive/`
   - Création d'un `docker-compose.yml` unifié (PostgreSQL + MailHog)
   - Nettoyage des fichiers racines (scripts shell, configs PHP)
   - Création des `.env.example` corrects pour la nouvelle stack
   - Ajout `.eslintrc` pour backend et frontend (Linting)
   - Configuration `nest-cli.json` corrigée pour le build (assets)

**📁 Fichiers modifiés :**
- `README.md` (x3)
- `backend/prisma/schema.prisma`
- `backend/nest-cli.json` (fix build)
- `backend/.eslintrc.js`, `frontend/.eslintrc.json` (new)
- `.gitignore`, `package.json` (nettoyage)

**🐛 Bugs corrigés :**
- Les templates emails n'étaient pas copiés au bon endroit dans `dist/` (fix assets outDir)
- Le flag `premiereConnexion` ne passait pas à `false`
- Dépendances lourdes inutiles dans le frontend
- Documentation obsolète qui induisait en erreur
- **Validation Backend** : Correction de l'erreur `property classeActuelle should not exist`. Synchronisation du DTO et du Service backend avec les nouveaux champs du formulaire.
- **Build TypeScript** : Correction d'erreurs dans `SignaturesService` et `PreinscriptionsService` qui empêchaient la compilation (relations 1-to-1 traitées à tort comme des tableaux).
- **Dashboard Admin** : Correction d'un crash frontend (`TypeError: null is not an object`) causé par une incohérence de type sur `signatureReglements` (objet vs tableau).

**⏭️ Prochaines étapes :**
- [ ] 📂 Upload des justificatifs (Carnet de santé, Assurance)
- [ ] 👶 Page "Mes Enfants" détaillée
- [ ] 🍽️ Gestion Cantine (Février)

---

### 🗓️ Jeudi 8 janvier 2026

**Durée :** ~10h (Session IA Intensive)

**✅ Réalisé :**
1. **Restauration Design "Nature" Premium** : 
   - Réintégration totale de la landing page (version haute fidélité).
   - Utilisation de l'image réelle de la classe avec les enfants.
   - Design organique avec blobs animés (Framer Motion).
2. **Optimisation Visuelle (Pixel Perfect)** :
   - Ajustement de l'opacité de l'image de fond (60%) pour plus de visibilité.
   - Ajout d'un dégradé vertical bas d'image pour une transition invisible vers le blanc.
   - Refonte totale du Footer : Thème "Dark Emerald" (#061C16) avec navigation complète.
   - Animation d'entrée progressive (Zoom + Fade) pour le Hero.
3. **Stabilisation Base de Données & Infra** :
   - Restauration du seed complet (utilisateurs, enfants, préinscriptions de test).
   - Fix des identifiants admin : `admin@ecole.fr` / `admin123`.
   - Script `start-dev.sh` optimisé avec gestion des conflits de ports (3001).
4. **Optimisation Formulaire Préinscription** :
   - Ajout du champ `classeActuelle` et gestion de la situation familiale "Autre".
   - Synchronisation totale avec le schéma Prisma.
5. **SEO & Peaufinage** :
   - Métadonnées enrichies dans `layout.tsx`.
   - Liens de navigation du footer fonctionnels vers les espaces Admin/Parent.

**📁 Fichiers modifiés :**
- `frontend/src/app/page.tsx` (Major redesign)
- `frontend/src/app/layout.tsx` (SEO)
- `frontend/src/app/(public)/preinscription/page.tsx` (Fields)
- `frontend/src/app/admin/login/page.tsx` (Credentials fix)
- `backend/prisma/schema.prisma` (Audit)
- `start-dev.sh` (Optimisation)

**🐛 Bugs corrigés :**
- Accès admin impossible (mot de passe non haché / seed manquant).
- Conflit de port 3001 bloquant le démarrage.
- Coupure nette (ligne blanche) en bas de l'image hero.
- Liens "mort" dans le footer.

**⏭️ Prochaines étapes :**
- [ ] Finaliser l'UI du Dashboard Admin (Dossiers en attente).
- [ ] Implémenter le module Facturation (Priorité Février).
- [ ] Tester le flux complet d'inscription en conditions réelles.

---

### 🗓️ Lundi 13 - Mardi 14 janvier 2026

**Durée :** ~3h (Session IA)

**✅ Réalisé :**
1. **Analyse Complète du Projet**
   - Revue ligne par ligne du code frontend (Next.js 14) et backend (NestJS 10).
   - Vérification du schéma Prisma et de la cohérence des données.
   - Documentation de l'état d'avancement dans `RECAP_PROJET.md`.
2. **Correction Bug Critique : Boucle "Changement Mot de Passe"**
   - Problème : Après le changement de mot de passe, l'utilisateur était redirigé en boucle vers la page de changement.
   - Cause : Le `ParentLayout` lisait le flag `premiereConnexion` depuis le `localStorage` au lieu du contexte d'authentification.
   - Solution : Refactoring du `ParentLayout` pour utiliser le hook `useAuth()`, permettant une mise à jour réactive de l'état utilisateur.
3. **Vérification des APIs via Terminal**
   - Login API : ✅ Fonctionnel (`premiereConnexion: false` confirmé)
   - Justificatifs API : ✅ Les 5 types de documents sont bien retournés.
   - Preinscriptions API : ✅ Protection auth fonctionnelle (401 sans token).
4. **Confirmation : Module Upload Justificatifs déjà implémenté**
   - Backend : `JustificatifsController` avec Multer (PDF, JPEG, PNG, max 5Mo).
   - Frontend : Page `fournir-documents/page.tsx` opérationnelle.

**📁 Fichiers modifiés :**
- `frontend/src/app/(parent)/layout.tsx` (fix boucle auth)
- `frontend/src/app/admin/preinscriptions/[id]/page.tsx` (fix validation inscription)
- `RECAP_PROJET.md` (mise à jour)

**🐛 Bugs corrigés :**
- Boucle infinie "Changement de mot de passe" après première connexion.
- **Validation prématurée de l'inscription** : Le système affichait "Inscription complète" même si tous les documents obligatoires n'étaient pas uploadés. Maintenant, chaque type de document obligatoire doit être présent ET validé.

**⏭️ Prochaines étapes :**
- [ ] Tester manuellement l'upload de justificatifs.
- [ ] Vérifier le Dashboard Parent (vue d'ensemble).
- [ ] Commencer le module Facturation (Février).

---

### 🗓️ Mardi 14 janvier 2026 (Session 2)

**Durée :** ~5h (Session IA)

**✅ Réalisé :**
1. **Justificatifs : Attestation Responsabilité Civile**
   - Ajout d'un nouveau type de justificatif obligatoire : "Attestation de responsabilité civile".
   - Note automatique dans la description : "à renouveler chaque année en septembre".
   - Seed mis à jour pour créer ce type en base de données.
2. **Justificatifs : Champ "Autre" (Optionnel)**
   - Ajout d'un type de justificatif optionnel "Autre" pour permettre aux parents d'uploader des documents supplémentaires non prévus.
3. **Génération PDF des Dossiers de Préinscription**
   - Installation de `pdfmake` et `@types/pdfmake` pour la génération de PDF côté backend.
   - Création d'une méthode `generatePdf(id)` dans `PreinscriptionsService` qui génère un PDF professionnel avec :
     - En-tête avec logo et titre
     - Numéro de dossier et statut
     - 5 sections formatées : Enfant, Scolarité, Parents 1 & 2, Infos complémentaires
     - Footer avec date de génération
   - Nouvel endpoint `GET /api/preinscriptions/:id/pdf` (admin uniquement, protégé par JWT + Role Guard).
   - Bouton "Télécharger PDF" ajouté dans la page admin de détail d'une préinscription (`/admin/preinscriptions/[id]`).
   - Téléchargement automatique du fichier avec nom formaté : `dossier-{numeroDossier}.pdf`.
4. **Système de Rappels Automatiques Annuels**
   - Création d'un nouveau module `RappelsModule` avec service dédié.
   - Cron job quotidien (tous les jours à 9h, fuseau Europe/Paris) qui vérifie si on est le 1er septembre.
   - Logique métier :
     - Récupère tous les enfants avec une inscription ACTIVE.
     - Vérifie si chaque enfant a une attestation RC à jour pour l'année en cours.
     - Si manquante ou expirée, envoie un email de rappel aux deux parents avec un lien direct vers la page de téléchargement.
   - Email HTML stylisé avec bouton CTA "Télécharger le document".
   - Méthode de test `testEnvoiRappels()` disponible pour les tests manuels.
5. **Documentation & Git**
   - Mise à jour du `PLANNING_REALISTE.md` avec les avancées de la session 2 du 14/01/2026.
   - Commits GitHub :
     - `de27f78` : Features (justificatifs RC, PDF, rappels annuels)
     - `38d6c9a` : Documentation du planning

**📁 Fichiers modifiés/créés :**
- `backend/package.json` (ajout pdfmake + @types/pdfmake)
- `backend/prisma/seed.ts` (2 nouveaux types de justificatifs)
- `backend/src/modules/preinscriptions/preinscriptions.controller.ts` (nouvel endpoint PDF)
- `backend/src/modules/preinscriptions/preinscriptions.service.ts` (méthode generatePdf)
- `backend/src/modules/rappels/rappels.service.ts` (nouveau module - cron job)
- `backend/src/modules/rappels/rappels.module.ts` (nouveau module)
- `backend/src/app.module.ts` (import RappelsModule)
- `frontend/src/app/admin/preinscriptions/[id]/page.tsx` (bouton télécharger PDF)
- `PLANNING_REALISTE.md` (documentation session 2)

**🐛 Bugs corrigés :**
- Aucun bug identifié. Toutes les nouvelles fonctionnalités compilent et fonctionnent correctement.

**⏭️ Prochaines étapes :**
- [ ] Tester manuellement la génération PDF (vérifier le rendu).
- [ ] Tester le cron job de rappels (ou attendre septembre pour le test réel).
- [ ] Finaliser les 4 améliorations critiques du modal (CGU, validation tel, XSS, ARIA) prévu semaine prochaine.
- [ ] Commencer le module Facturation (Février).

---

### 🗓️ Lundi 20 janvier 2026

**Durée :** ~4h (Session IA)

**✅ Réalisé :**
1. **Export BDD Complet (CSV)**
   - Création du module `ExportModule` complet (service, controller, module).
   - Endpoints admin : `/api/export/eleves`, `/api/export/preinscriptions`, `/api/export/parents`, `/api/export/factures`, `/api/export/complet`.
   - Export CSV avec encodage UTF-8 BOM pour compatibilité Excel.
   - Bouton dropdown "Exporter" ajouté dans le dashboard admin avec toutes les options.

2. **Module Personnes Autorisées (Récupération Enfants)**
   - Nouveau modèle Prisma `PersonneAutorisee` avec relation vers `Enfant`.
   - Module backend complet : CRUD avec vérification des droits parent.
   - Validation DTO (téléphone format français, champs requis).
   - Page parent `/personnes-autorisees` avec interface complète :
     - Liste des personnes par enfant
     - Modal d'ajout/modification
     - Suppression avec confirmation
   - Ajout dans le menu latéral parent et dans les actions rapides du dashboard.

3. **Bouton Relancer Documents Manquants**
   - Nouvel endpoint `POST /api/preinscriptions/:id/relancer-documents`.
   - Email HTML stylisé avec liste des documents manquants + lien vers espace parent.
   - Bouton "Relancer par email" dans la page admin de détail préinscription.
   - Apparaît uniquement si des documents sont manquants ou non validés.

4. **Exclusion Règlement Intérieur des Justificatifs**
   - Le règlement intérieur est géré via signature électronique (étape 2).
   - Exclusion côté backend dans `getTypesAttendus()` par recherche sur le nom.
   - Exclusion renforcée côté frontend dans `finaliser-inscription` et `fournir-documents`.
   - Évite la duplication : le règlement n'apparaît plus 2 fois.

5. **Réorganisation Dashboard Parent**
   - Suppression de "Nouvelle inscription" (accessible via Dossiers).
   - Ajout de "Personnes autorisées" dans les actions rapides.
   - Réorganisation ergonomique :
     - Ligne 1 (actions fréquentes) : Commander repas, Périscolaire, Personnes autorisées
     - Ligne 2 (gestion admin) : Mes dossiers, Mes enfants, Réinscription

**📁 Fichiers créés :**
- `backend/src/modules/export/export.service.ts`
- `backend/src/modules/export/export.controller.ts`
- `backend/src/modules/export/export.module.ts`
- `backend/src/modules/personnes-autorisees/personnes-autorisees.service.ts`
- `backend/src/modules/personnes-autorisees/personnes-autorisees.controller.ts`
- `backend/src/modules/personnes-autorisees/personnes-autorisees.module.ts`
- `backend/src/modules/personnes-autorisees/dto/create-personne-autorisee.dto.ts`
- `backend/src/modules/personnes-autorisees/dto/update-personne-autorisee.dto.ts`
- `frontend/src/app/(parent)/personnes-autorisees/page.tsx`

**📁 Fichiers modifiés :**
- `backend/prisma/schema.prisma` (ajout modèle PersonneAutorisee)
- `backend/src/app.module.ts` (imports ExportModule, PersonnesAutoriseesModule)
- `backend/src/modules/preinscriptions/preinscriptions.service.ts` (méthode relancerDocumentsManquants)
- `backend/src/modules/preinscriptions/preinscriptions.controller.ts` (endpoint relancer-documents)
- `backend/src/modules/justificatifs/justificatifs.service.ts` (exclusion règlement par nom)
- `frontend/src/app/admin/dashboard/page.tsx` (bouton export dropdown)
- `frontend/src/app/admin/preinscriptions/[id]/page.tsx` (bouton relancer email)
- `frontend/src/app/(parent)/dashboard/page.tsx` (réorganisation actions rapides)
- `frontend/src/app/(parent)/finaliser-inscription/page.tsx` (filtre règlement)
- `frontend/src/app/(parent)/fournir-documents/page.tsx` (filtre règlement)
- `frontend/src/components/layout/ParentLayout.tsx` (menu personnes autorisées)

**🐛 Bugs corrigés :**
- Règlement intérieur signé apparaissait 2 fois (dans signature ET justificatifs).
- ID du règlement intérieur différent en BDD (ID 6 au lieu de 5) → filtre par nom maintenant.

**⏭️ Prochaines étapes :**
- [ ] Tester l'envoi réel d'email de relance documents.
- [ ] Ajouter la pagination sur l'export si volume important.
- [ ] Commencer le module Facturation (Février).

---

### 🗓️ Mercredi 22 janvier 2026

**Durée :** ~3h (Session IA)

**✅ Réalisé :**
1. **Audit de Sécurité Approfondi**
   - Analyse complète des modules connexion, préinscription et inscription.
   - Identification de 15 problèmes (4 critiques, 7 hauts, 4 moyens).
   - Corrections appliquées pour les problèmes critiques et hauts.

2. **Corrections de Sécurité Critiques**
   - **JWT Secret** : Suppression du fallback insécurisé. Erreur levée si `JWT_SECRET` non défini.
   - **Endpoint dossier public** : Protection de `GET /preinscriptions/dossier/:numeroDossier` avec auth JWT + vérification propriété.
   - **Token reset password** : Ajout d'expiration 1h sur les tokens de réinitialisation.
   - **Credentials test** : Masquage automatique en production (`NODE_ENV !== 'development'`).

3. **Corrections Fonctionnelles**
   - **Enum PS/MATERNELLE** : Remplacement de "PS" par "MATERNELLE" dans le frontend (cohérence avec backend).
   - **Création parent 2** : Le second parent est maintenant créé automatiquement lors de la validation si `emailParent2` existe.
   - **Nettoyage cache connexion** : Suppression automatique des anciens tokens au chargement de la page connexion.

4. **Modifications Base de Données**
   - Ajout colonne `reset_token_expires_at` dans la table `users`.

**📁 Fichiers modifiés :**
- `backend/src/modules/auth/strategies/jwt.strategy.ts` (suppression fallback)
- `backend/src/modules/preinscriptions/preinscriptions.controller.ts` (protection endpoint)
- `backend/src/modules/preinscriptions/preinscriptions.service.ts` (méthode findByNumeroDossierForUser, création parent 2)
- `backend/src/modules/users/users.service.ts` (expiration token reset)
- `backend/prisma/schema.prisma` (champ resetTokenExpiresAt)
- `frontend/src/app/(public)/connexion/page.tsx` (masquage credentials, nettoyage cache)
- `frontend/src/app/(public)/preinscription/page.tsx` (enum MATERNELLE)

**🐛 Bugs corrigés :**
- Faille de sécurité : endpoint `/preinscriptions/dossier/:numeroDossier` accessible sans authentification.
- Faille de sécurité : JWT secret fallback permettant de forger des tokens.
- Faille de sécurité : tokens de réinitialisation sans expiration.
- Bug fonctionnel : "PS" non reconnu par le backend (enum inexistant).
- Bug fonctionnel : parent 2 jamais créé lors de la validation de la préinscription.

**⏭️ Prochaines étapes :**
- [ ] Implémenter logout avec blacklist de tokens (optionnel).
- [ ] Ajouter validation d'âge enfant selon la classe.
- [ ] Commencer le module Facturation (Février).

---

### 🗓️ Mercredi 22 janvier 2026 (suite)

**Durée :** 3h (session avec Antigravity)

**✅ Réalisé :**
- Analyse et validation de l'audit sécurité de Claude Code (7 corrections critiques)
- Désactivation du rate limiting en développement (10000 req/min)
- Fix redirection après login (router.push → window.location.href)
- **Conformité RGPD** : case à cocher obligatoire pour CGU/RGPD sur préinscription
- **Validation téléphone** : validation en temps réel du format français
  - Formats acceptés : `06 12 34 56 78`, `0612345678`, `+33612345678`
  - Message d'erreur en temps réel si format invalide
  - Bouton "Envoyer" désactivé si téléphone invalide ou CGU non cochée

**📁 Fichiers modifiés :**
- `backend/src/app.module.ts` (rate limiting conditionnel)
- `frontend/src/app/(public)/connexion/page.tsx` (fix redirection)
- `frontend/src/app/(public)/preinscription/page.tsx` (CGU + validation téléphone)

**🐛 Bugs corrigés :**
- Redirection non fonctionnelle après login parent (Next.js router.push)
- Blocage par rate limiting en développement (ThrottlerException)
- Mot de passe parent test incohérent (parent123 vs parent1234)

**⏭️ Prochaines étapes :**
- [ ] Créer pages /politique-confidentialite et /rgpd
- [ ] Commencer le module Facturation (Février)
- [ ] Validation de l'âge de l'enfant selon la classe sélectionnée

---

### 📝 Template pour nouvelles entrées

```markdown
### 🗓️ [JOUR] [DATE] [MOIS] [ANNÉE]

**Durée :** Xh

**✅ Réalisé :**
- Point 1
- Point 2

**📁 Fichiers modifiés :**
- fichier1.ts
- fichier2.tsx

**🐛 Bugs corrigés :**
- Bug 1

**⏭️ Prochaines étapes :**
- [ ] Tâche 1
- [ ] Tâche 2
```

---

## ⚠️ CONTRAINTES IMPORTANTES

### Fin de licence L3 (Juin 2026)
- 📝 **Mémoire de 40 pages** à rédiger
- 🎤 **Oral de soutenance** à préparer
- **Impact** : Fonctionnalités principales terminées **fin mai**, juin = tests + déploiement

### Sujet mémoire (suggestion)
*"Migration d'une application web de gestion scolaire : de Laravel à Next.js/NestJS"*

---

**Dernière mise à jour :** 22 janvier 2026
**Planning détaillé :** Voir [PLANNING_REALISTE.md](./PLANNING_REALISTE.md)
**Journal mémoire :** Voir [MEMOIRE_L3.md](./MEMOIRE_L3.md)