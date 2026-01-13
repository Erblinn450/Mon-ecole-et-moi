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

**Dernière mise à jour :** 8 janvier 2026 (19h30)  
**Planning détaillé :** Voir [PLANNING_REALISTE.md](./PLANNING_REALISTE.md)  
**Journal mémoire :** Voir [MEMOIRE_L3.md](./MEMOIRE_L3.md)