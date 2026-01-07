# 📋 Récapitulatif Projet - Mon École et Moi

**Date de création :** 30 décembre 2024  
**Développeur :** Erblin Potoku  
**Client :** Mon École Montessori et Moi (Audrey Ballester)  
**Reprise du stage :** 5 janvier 2025

## 📚 Contexte du Projet

### Historique de Développement
- **6 semaines en groupe** : Travail effectué à l'UHA 4.0 en équipe
- **Stage solo** : Continuation du projet en stage individuel à partir du 5 janvier 2025
- **Base existante** : Projet Laravel déjà développé en groupe

---

## 🏫 Informations École
- **Nom :** Mon École et Moi
- **Type :** École privée Montessori hors contrat
- **Effectif :** ~50 élèves
- **Classes :** 
  - Maternelle (3-6 ans)
  - Élémentaire (6-12 ans)
  - Collège (6e en 2025, 4 élèves)

### Historique des outils
1. Excel (début)
2. Miello (logiciel développé par connaissance - fermé à cause de bugs)
3. Coccinelle'soft (non adapté)
4. École Futée (actuel - "usine à gaz")
5. **Nouveau projet :** Migration vers Next.js + NestJS

---

## 📧 Message à Envoyer à Audrey

**Objet :** Re: Démarrage lundi

Bonjour Audrey,

Merci pour ces précisions. Les horaires et disponibilités me conviennent.

**Concernant les objectifs :**
- **Semaine 1** : Je finalise les modifications de la dernière réunion.
- **Semaine 2** : Je démarre le module de facturation.

**Petit point technique :**

En travaillant sur le projet et en relisant le cahier des charges, j'ai réfléchi à une évolution pour améliorer l'outil et simplifier le quotidien.

**Pourquoi migrer de Laravel/PHP vers Next.js/NestJS ?**

Laravel fonctionne, mais pour une application mobile et des besoins croissants, une stack plus moderne apporterait :
- **Application mobile native** : Laravel est orienté web. Next.js permet une vraie PWA installable sur smartphone, avec notifications push.
- **Performance** : Next.js est plus rapide pour les interfaces, ce qui améliore l'expérience utilisateur.
- **Stack unifiée** : TypeScript partout (frontend + backend), moins de bugs et maintenance simplifiée.
- **Évolutivité** : Architecture plus adaptée si l'école grandit.
- **Coûts** : Déploiement simplifié (Vercel pour le frontend), coûts maîtrisés.

**Ce que cela apporterait concrètement :**

**Pour les parents :**
- Application mobile installable sur smartphone (comme Miello, mais plus moderne)
- Interface moderne et intuitive (design épuré, couleurs douces, animations fluides)
- Interface simple et rapide (moins de clics)
- Notifications pour les messages
- Signature de documents sur mobile
- Accès depuis l'application

**Pour l'équipe éducative :**
- Application mobile pour gérer repas et périscolaire facilement
- Interface épurée et rapide
- Envoi de messages groupés avec pièces jointes
- Réception des messages sur l'application mobile

**Pour vous (direction) :**
- Facturation automatisée (génération mensuelle, prélèvements XML)
- Dashboard moderne avec vue d'ensemble claire
- Exports comptables simplifiés
- Interface plus moderne et intuitive (design professionnel mais chaleureux)

**Plan proposé :**
- Semaines 1-2 : Finalisation des modifications + démarrage facturation (sur l'outil actuel)
- Semaines 3-12 : Migration progressive vers la nouvelle solution, avec toutes les fonctionnalités du cahier des charges + redesign complet de l'interface pour un rendu moderne et professionnel, sans interruption de service

Je pense pouvoir livrer l'ensemble des fonctionnalités en 6 mois, avec une migration progressive qui permet de continuer à utiliser l'outil actuel pendant la transition.

Je propose d'en discuter lors de notre appel du **mardi 06-01 à 9h** pour valider ensemble ce qui est prioritaire et répondre à vos questions.

Je serai également disponible **vendredi à 10h à l'école** pour un point si besoin.

Je vous souhaite de belles fêtes de fin d'année.

Bien cordialement,  
Erblin

---

## 🛠️ Stack Technique Choisie

### Frontend
- **Framework :** Next.js 14+ (App Router)
- **Language :** TypeScript
- **Styling :** Tailwind CSS
- **UI Components :** shadcn/ui
- **Animations :** Framer Motion
- **Icons :** Lucide Icons
- **PWA :** Application installable sur smartphone (iOS/Android)

### Backend
- **Framework :** NestJS (Node.js + TypeScript)
- **ORM :** Prisma
- **Base de données :** PostgreSQL
- **Auth :** NextAuth.js
- **Workers :** Tâches en arrière-plan (emails, SMS, prélèvements)
- **Scheduler :** Tâches planifiées (factures mensuelles)

### Services Externes
- **Emails :** Resend ou SendGrid
- **SMS :** Twilio
- **Hébergement Frontend :** Vercel (gratuit)
- **Hébergement Backend :** Railway ou Render (~$10-20/mois)
- **Base de données :** Supabase ou Neon (gratuit jusqu'à usage)

### Coûts Estimés
- **Total mensuel :** ~$10-30/mois

---

## 📋 Modifications à Finaliser (Semaine 1)

Liste complète des 14 modifications demandées lors de la dernière sprint review avec Audrey :

### Remarques de la Sprint Review (Liste Complète)

1. **Changer lors de la signature du règlement intérieur : l'enfant ne doit pas signer**
2. **Voir en un coup d'œil quel parent a signé le règlement intérieur**
3. **Pour la commande de repas si il n'y a qu'un enfant pas de choix, l'enfant unique est proposé**
4. **L'annulation du repas pour le parent est une semaine sinon plus possibilité d'annuler le repas**
5. **Modifier les jours de vacances, faire en sorte que la case soit grisée quand un repas est déjà commandé pour cette date**
6. **Un accès à la programmation du calendrier, la directrice modifie le calendrier pour la commande de repas et de périscolaire en fin d'année**
7. **Un enfant non affecté à une classe ne doit pas être dans la base de données**
8. **Pour le périscolaire et pour le repas, la directrice en sélectionnant la date, de voir les enfants non inscrit à cette date**
9. **Lorsqu'on met intégration à la prochaine inscription lors du formulaire, il faut que ça se mette à jour pour que la directrice le voit pour la validation**
10. **Imprimer le dossier de préinscription possible sur une page**
11. **La date de naissance disparaît quand la directrice veut modifier le dossier de préinscriptions**
12. **Créer un nouveau statut entre la validation du dossier de préinscription et la validation définitive (le statut sera "Déjà contacté")**
13. **Une fois la préinscription validé on ne voit plus l'enfant apparaître dans la liste des préinscriptions**
14. **Modifier le mail de validation et dire dans quelle section signer le règlement et envoyer les documents**

---

### ✅ Déjà Faites (8/14)

1. ✅ **Signature enfant supprimée** - Seul le parent signe le règlement intérieur
   - Fichier modifié : `app/Http/Controllers/SignatureController.php`
   - Méthode `enfantAccepte()` désactivée, `parentAccepte()` met `reglement_accepte = true` directement

2. ✅ **Voir quel parent a signé** - API retourne les infos du parent qui a signé
   - Fichier modifié : `app/Http/Controllers/SignatureController.php`
   - Méthode `getSignatureStatus()` retourne `parent_signed` avec nom, email

3. ✅ **Statut "Déjà contacté"** - Nouveau statut entre "En attente" et "Validé"
   - Fichier modifié : `app/Http/Controllers/PreinscriptionController.php`
   - Validation accepte "Déjà contacté", tri mis à jour, filtre ajouté

4. ✅ **Bug date de naissance corrigé** - Formatage correct pour l'input date
   - Fichier modifié : `public/js/dossier-detail.js`
   - Fonction `createEditableField()` formate correctement les dates

5. ✅ **Enfant reste visible après validation** - Les dossiers validés restent dans la liste
   - Fichier modifié : `app/Http/Controllers/PreinscriptionController.php`
   - Filtre "valides" n'exclut plus les comptes créés, par défaut affiche en attente + déjà contacté + validés

6. ✅ **Mail de validation modifié** - Instructions ajoutées pour signature et documents
   - Fichier modifié : `resources/views/emails/preinscription/validated.blade.php`
   - Section "Prochaines étapes" avec instructions détaillées

7. ✅ **Commande repas avec un seul enfant** - Sélection automatique et masquage du select
   - Fichier modifié : `public/js/commander-repas.js`
   - Si un seul enfant, sélection automatique et masquage de la section

8. ✅ **Annulation repas limitée à 1 semaine** - Vérification ajoutée dans destroyParent
   - Fichier modifié : `app/Http/Controllers/RepasController.php`
   - Méthode `destroyParent()` vérifie que la date est au moins 1 semaine dans le futur

### ⏳ À Faire (6/14)

9. ⏳ **Griser les dates où un repas est déjà commandé** - Modifier le calendrier JS
   - Fichier à modifier : `public/js/commander-repas.js`
   - Ajouter classe CSS "disabled" ou "grisé" sur les dates avec repas déjà commandé

10. ⏳ **Accès programmation calendrier pour directrice** - Créer interface admin
    - Nouveau fichier : `resources/views/admin-calendrier.blade.php`
    - Nouveau JS : `public/js/admin-calendrier.js`
    - Route admin : `/admin-calendrier`
    - API : Endpoints pour modifier calendrier scolaire

11. ⏳ **Enfant sans classe ne doit pas être en BDD** - Validation à ajouter
    - Fichier à modifier : `app/Models/Enfant.php` ou validation dans contrôleurs
    - Ajouter validation `required` sur le champ `classe` avant création

12. ⏳ **Voir enfants non inscrits à une date** - API + interface admin
    - Nouveau endpoint : `GET /api/admin/enfants-non-inscrits?date=YYYY-MM-DD&type=repas|periscolaire`
    - Interface admin pour afficher la liste

13. ⏳ **Date d'intégration visible pour validation** - Affichage dans l'admin
    - Fichier à modifier : `resources/views/admin-preinscription.blade.php`
    - Ajouter colonne "Date intégration" dans le tableau
    - Fichier JS : `public/js/admin-preinscriptions.js` pour afficher la date

14. ⏳ **Imprimer dossier préinscription** - Bouton d'impression CSS
    - Fichier à modifier : `resources/views/dossier-detail.blade.php` ou `public/js/dossier-detail.js`
    - Ajouter bouton "Imprimer" avec CSS `@media print` pour formatage page

---

## 🎨 Design & UX

### Style Visuel
- **Palette :** Couleurs douces (verts/bleus apaisants, tons naturels)
- **Typographie :** Inter, Poppins ou système
- **Illustrations :** Style éducatif, pas trop enfantin
- **Espacement :** Beaucoup de blanc, hiérarchie claire
- **Animations :** Transitions douces, micro-interactions

### Objectifs UX
- **Simplicité :** Maximum 3 clics pour actions courantes
- **Rapidité :** Interface réactive et fluide
- **Mobile-first :** Design pensé d'abord pour mobile
- **Accessibilité :** Respect des standards WCAG

---

## 📅 Plan d'Action 6 Mois

### Phase 1 : Fondations (Semaines 1-4)

**Semaine 1 :** Finaliser modifs Laravel + Setup Next.js/NestJS
- Finaliser les 14 modifications demandées
- Setup projet Next.js + NestJS + Prisma
- Migration schéma base de données

**Semaine 2 :** Facturation Laravel + Auth Next.js
- Module facturation Laravel (MVP)
- Authentification Next.js (NextAuth.js)
- PWA de base

**Semaine 3-4 :** Inscriptions complètes
- Portail public préinscription
- Workflow validation
- Signature règlement intérieur
- Upload justificatifs

### Phase 2 : Core Fonctionnalités (Semaines 5-8)

**Semaine 5-6 :** Facturation complète
- Module facturation Next.js
- Génération factures automatiques
- Prélèvements XML (banque)
- Suivi paiements

**Semaine 7 :** Communication
- Emails groupés (par classe/école/famille)
- SMS groupés (Twilio)
- Notifications push
- Messagerie interne

**Semaine 8 :** Gestion quotidienne
- Commandes repas/périscolaire
- Déclaration absences
- Calendrier scolaire

### Phase 3 : Fonctionnalités Avancées (Semaines 9-11)

**Semaine 9 :** RH + Comptabilité
- Planning équipes
- Alertes absences non couvertes
- Exports comptables
- Dashboard direction

**Semaine 10 :** Optimisations Mobile
- PWA complète
- Notifications push
- Interface mobile optimisée
- Tests sur différents appareils

**Semaine 11 :** Finitions
- Corrections bugs
- Optimisations performance
- Documentation utilisateur

### Phase 4 : Déploiement (Semaine 12)

**Semaine 12 :** Tests finaux + Production
- Tests complets
- Migration données
- Déploiement production
- Formation utilisateurs

---

## 🎯 Fonctionnalités du Cahier des Charges

### 1. Facturation
- ✅ Factures automatiques mensuelles
- ✅ Factures ponctuelles (activités, matériel)
- ✅ Prélèvements automatiques (XML)
- ✅ Suivi paiements en temps réel
- ✅ Relances automatiques
- ✅ Exports comptables

### 2. Inscriptions/Réinscriptions
- ✅ Formulaire public (lien site)
- ✅ Workflow : Demande → Contact → Validation → Inscription
- ✅ Signature règlement intérieur (mobile)
- ✅ Upload justificatifs
- ✅ Réinscriptions annuelles automatisées

### 3. Communication
- ✅ Emails groupés (classe, école, famille)
- ✅ SMS groupés
- ✅ Notifications push (app mobile)
- ✅ Pièces jointes
- ✅ Historique messages

### 4. Gestion Quotidienne
- ✅ Commandes repas (calendrier)
- ✅ Commandes périscolaire
- ✅ Déclaration absences (1 clic)
- ✅ Planning équipes
- ✅ Alertes absences non couvertes

### 5. Base de Données
- ✅ Enfants : nom, prénom, date/lieu naissance, groupe, classe
- ✅ Parents : nom, prénom, date naissance, enfants, adresse, situation matrimoniale, téléphone, email
- ✅ Justificatifs : CNI, livret famille, domicile, vaccination, assurance RC, acte jugement, revenu fiscal

---

## 📱 PWA - Application Mobile

### Comment ça fonctionne
- **Installation :** Les parents ouvrent le lien sur leur smartphone, un popup propose d'installer l'app
- **Résultat :** Icône sur l'écran d'accueil, s'ouvre en plein écran, notifications push possibles
- **Avantages :** Pas besoin des stores, mises à jour instantanées, gratuit
- **Inconvénients :** Moins de fonctionnalités que native sur iOS (mais suffisant)

### Installation
- **iPhone :** Safari → Partager → Sur l'écran d'accueil
- **Android :** Chrome → Popup "Ajouter à l'écran d'accueil"

---

## 🚀 Structure du Projet

```
mon-ecole-et-moi/
├── frontend/              # Next.js
│   ├── app/
│   │   ├── (public)/     # Pages publiques
│   │   ├── (parent)/     # Espace parent
│   │   ├── (educateur)/  # Espace éducateur
│   │   └── (admin)/      # Espace direction
│   ├── components/
│   └── lib/
│
├── backend/              # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── facturation/
│   │   │   ├── inscriptions/
│   │   │   ├── communication/
│   │   │   ├── prelevements/
│   │   │   └── rh/
│   │   ├── workers/      # Tâches en arrière-plan
│   │   └── scheduler/    # Tâches planifiées
│   └── prisma/
│       └── schema.prisma
│
└── shared/               # Types partagés
    └── types/
```

---

## 💡 Points Importants

### Avantages de la Migration
- ✅ Stack moderne et maintenable
- ✅ Application mobile native (PWA)
- ✅ Performance améliorée
- ✅ Type-safe (TypeScript partout)
- ✅ Coûts maîtrisés
- ✅ Scalable si l'école grandit

### Stratégie
- Migration progressive (pas d'interruption de service)
- Garder Laravel fonctionnel pendant la transition
- Réutiliser au maximum (schéma BDD, logique métier)
- MVP d'abord, perfection après

### Avec Cursor Premium
- Génération de code rapide
- Migration facilitée
- Tests automatisés
- Documentation automatique
- Productivité maximale

---

## 📞 Contacts & Disponibilités

### Audrey Ballester
- **Email :** monecoleetmoibrunstatt@gmail.com
- **Appel :** Mardi 06-01 à 9h (confirmé dans le message envoyé)
- **Point école :** Vendredi 05-01 à 10h

### Horaires de Travail
- **Lundi/Mardi/Mercredi :** Télétravail (9h-17h, 1h pause)
- **Jeudi :** Télétravail (8h30-16h30)
- **Vendredi :** À l'école (9h-17h, 1h pause)

---

## 🔧 Informations Techniques Projet Laravel Actuel

### URLs & Ports
- **Application web + API :** http://localhost:8000
- **Formulaire :** http://localhost:8000/formulaire
- **Admin :** http://localhost:8000/admin
- **API :** http://localhost:8000/api
- **MySQL (Docker) :** localhost:3307 (user: admin, mdp: password123, base: mon_ecole_db)
- **PhpMyAdmin (Docker) :** http://localhost:8081

### Commandes Utiles Laravel
```bash
# Démarrer l'application
php artisan serve

# Migrations
php artisan migrate
php artisan migrate:status

# Nettoyer le cache
php artisan config:clear
php artisan cache:clear

# Docker
docker compose up -d
docker compose exec app php artisan migrate --force
```

### Fichiers Modifiés (Modifications Semaine 1)
- `app/Http/Controllers/SignatureController.php` - Signature enfant supprimée, voir parent signé
- `app/Http/Controllers/PreinscriptionController.php` - Statut "Déjà contacté", enfant reste visible
- `app/Http/Controllers/RepasController.php` - Annulation limitée à 1 semaine
- `public/js/dossier-detail.js` - Bug date de naissance corrigé
- `public/js/commander-repas.js` - Commande avec un seul enfant
- `resources/views/emails/preinscription/validated.blade.php` - Mail modifié

### Structure Laravel Actuelle
```
app/
├── Http/Controllers/    # 15 contrôleurs
├── Models/              # 13 modèles
└── Mail/                # 4 classes mail

routes/
├── web.php              # Routes pages web
└── api.php              # Routes API

database/
├── migrations/          # 23 migrations
└── seeders/             # 6 seeders

resources/views/         # 27 vues Blade
public/
├── js/                  # 27 fichiers JS
└── css/                 # 3 fichiers CSS
```

### Authentification Actuelle
- **Laravel Sanctum** pour l'API
- Routes protégées avec `auth:sanctum`
- Tokens stockés en localStorage côté frontend

### Base de Données Actuelle
- **MySQL** (peut être migré vers PostgreSQL pour Next.js)
- Tables principales : users, enfants, preinscriptions, inscriptions, repas, factures, justificatifs, signature_reglements

---

## ✅ Checklist Démarrage 5 Janvier

- [ ] Relire ce document
- [ ] Finaliser les 6 modifications restantes (Laravel)
- [ ] Setup projet Next.js + NestJS
- [ ] Créer schéma Prisma complet
- [ ] Préparer maquettes design
- [ ] Commencer migration progressive

---

## 📝 Notes Additionnelles

### Décisions Prises
- Migration complète vers Next.js + NestJS (pas juste frontend)
- PWA au lieu d'app native (pas de stores, mises à jour instantanées)
- PostgreSQL pour la nouvelle stack (meilleure intégration avec Prisma)
- Migration progressive (garder Laravel fonctionnel pendant transition)

### Points d'Attention
- Ne pas promettre de fonctionnalités qu'on ne peut pas livrer
- Tester régulièrement avec l'IA pour éviter les bugs
- Garder une communication claire avec Audrey sur les priorités
- Documenter le code au fur et à mesure

### Ressources Utiles
- **Documentation Laravel :** https://laravel.com/docs
- **Documentation Next.js :** https://nextjs.org/docs
- **Documentation NestJS :** https://docs.nestjs.com
- **Documentation Prisma :** https://www.prisma.io/docs

---

## 🚀 MIGRATION NEXT.JS + NESTJS - RÉALISÉE LE 5-6 JANVIER 2026

### 📁 Structure du Projet Migré

```
kyw/
├── frontend/                    # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       # Pages publiques (preinscription, accueil, verification-email)
│   │   │   ├── (parent)/       # Espace parent authentifié
│   │   │   └── admin/          # Espace admin
│   │   ├── components/
│   │   │   └── layout/         # ParentLayout, Header, AdminLayout
│   │   ├── hooks/              # useRecaptcha
│   │   ├── lib/                # API client, utils
│   │   └── types/              # Types TypeScript
│   ├── public/
│   │   ├── documents/          # reglement-interieur.pdf
│   │   └── images/             # logos
│   └── package.json
│
├── backend/                     # NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Authentification JWT
│   │   │   ├── users/          # Gestion utilisateurs
│   │   │   ├── enfants/        # Gestion enfants
│   │   │   ├── preinscriptions/# Préinscriptions + vérification email
│   │   │   ├── repas/          # Commandes repas
│   │   │   ├── periscolaire/   # Activités périscolaires
│   │   │   ├── signatures/     # Signature règlement intérieur
│   │   │   ├── justificatifs/  # Upload documents (multer)
│   │   │   ├── documents/      # Règlement intérieur, PDF
│   │   │   ├── facturation/    # Factures
│   │   │   └── email/          # Service email multi-providers
│   │   ├── common/
│   │   │   ├── decorators/     # @Roles
│   │   │   └── guards/         # JwtAuthGuard, RolesGuard, RecaptchaGuard
│   │   └── prisma/             # PrismaService
│   ├── prisma/
│   │   ├── schema.prisma       # Schéma BDD complet
│   │   └── seed.ts             # Données de test
│   ├── uploads/                # Fichiers uploadés (justificatifs)
│   └── package.json
│
├── docker-compose.yml           # PostgreSQL + MailHog
└── RECAP_PROJET.md              # Ce fichier
```

---

### 🔧 Technologies Utilisées

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | Next.js | 14.2.35 |
| **Frontend** | TypeScript | 5.x |
| **Frontend** | Tailwind CSS | 3.x |
| **Frontend** | Lucide Icons | - |
| **Backend** | NestJS | 10.x |
| **Backend** | Prisma | 6.19.1 |
| **Backend** | PostgreSQL | 16 |
| **Backend** | JWT | @nestjs/jwt |
| **Backend** | Rate Limiting | @nestjs/throttler |
| **Email** | Nodemailer + Handlebars | @nestjs-modules/mailer |
| **Tests SMTP** | MailHog | localhost:8025 |

---

### 🗄️ Base de Données PostgreSQL

#### Connexion
```
Host: localhost
Port: 5432
Database: monecole
User: postgres
Password: postgres
Container: monecole-postgres
```

#### Commandes utiles
```bash
# Accès psql
docker exec -it monecole-postgres psql -U postgres -d monecole

# Prisma Studio (interface web)
cd backend && npx prisma studio  # http://localhost:5555

# Voir les tables
\dt

# Voir les préinscriptions
SELECT * FROM preinscriptions;

# Voir les utilisateurs
SELECT * FROM users;
```

#### Schéma Prisma (tables principales)
- **users** - Utilisateurs (PARENT, ADMIN, EDUCATEUR)
- **enfants** - Enfants liés aux parents
- **preinscriptions** - Demandes de préinscription
- **signature_reglements** - Signatures du règlement intérieur
- **justificatifs** - Documents uploadés
- **justificatifs_attendus** - Types de documents requis
- **repas** - Commandes de repas
- **periscolaires** - Réservations périscolaire
- **factures** / **lignes_factures** - Facturation
- **pdf_ouvertures** - Tracking ouverture du règlement

---

### 🔐 Authentification & Sécurité

#### Flux d'authentification
1. **Login** → POST `/api/auth/login` → Retourne `{ user, access_token }`
2. **Token** stocké dans `localStorage.auth_token`
3. **User** stocké dans `localStorage.user`
4. **Requêtes** authentifiées avec header `Authorization: Bearer <token>`

#### Comptes de test
| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@ecole.fr` | `admin123` | ADMIN |
| `parent@test.fr` | `parent123` | PARENT |
| Nouveaux parents | `parent1234` (dev) ou aléatoire (prod) | PARENT |

#### Changement de mot de passe obligatoire
- À la première connexion, `premiereConnexion: true`
- Redirection forcée vers `/changer-mot-de-passe`
- Menu de navigation masqué (impossible de contourner)
- Après changement, `premiereConnexion: false`

---

### 📧 Système d'Emails

#### Providers supportés (configurables via .env)
| Provider | Variable | Usage |
|----------|----------|-------|
| **MailHog** | `MAIL_PROVIDER=mailhog` | Développement (localhost:1025) |
| **SendGrid** | `MAIL_PROVIDER=sendgrid` | Production recommandé |
| **Mailgun** | `MAIL_PROVIDER=mailgun` | Production alternative |
| **SMTP** | `MAIL_PROVIDER=smtp` | OVH, Gmail, etc. |

#### Templates email (Handlebars)
- `preinscription-confirmation.hbs` - Confirmation de préinscription
- `preinscription-validated.hbs` - Validation par admin (avec identifiants)
- `preinscription-refus.hbs` - Refus de préinscription
- `email-verification.hbs` - Lien de vérification email

#### Visualiser les emails (dev)
```
http://localhost:8025  # Interface MailHog
```

---

### 📝 Flux de Préinscription Complet

```
1. Parent remplit formulaire (/preinscription)
   ↓
2. [Si REQUIRE_EMAIL_VERIFICATION=true]
   Email de vérification envoyé avec lien unique (24h)
   Parent clique sur le lien → email vérifié
   ↓
3. [Si REQUIRE_EMAIL_VERIFICATION=false]
   Email de confirmation envoyé directement
   ↓
4. Préinscription créée avec statut EN_ATTENTE
   ↓
5. Admin voit la demande dans /admin/preinscriptions
   ↓
6. Admin valide → statut VALIDE
   - Compte parent créé automatiquement
   - Enfant créé et lié au parent
   - Email de validation envoyé (avec identifiants)
   ↓
7. Parent se connecte (/connexion)
   ↓
8. Changement mot de passe obligatoire (premiereConnexion)
   ↓
9. Dashboard parent accessible
   - Voir ses dossiers (/mes-dossiers)
   - Consulter le règlement intérieur (PDF)
   - Signer le règlement
   - Uploader les justificatifs
```

---

### 🛡️ Fonctionnalités de Sécurité Production

#### 1. Rate Limiting (@nestjs/throttler)
| Route | Limite |
|-------|--------|
| POST `/api/preinscriptions` | 5/minute |
| POST `/api/auth/login` | 5/minute (anti brute-force) |
| POST `/api/auth/register` | 3/minute |
| Global | 100/minute |

#### 2. reCAPTCHA v3
- **Backend** : Guard `RecaptchaGuard` valide le token Google
- **Frontend** : Hook `useRecaptcha` charge le script
- Désactivé si `RECAPTCHA_SECRET_KEY` non configuré (dev)

#### 3. Mots de passe sécurisés
- En production (`USE_RANDOM_PASSWORD=true`) : 12 caractères aléatoires
- Majuscule + minuscule + chiffre + caractère spécial
- Utilise `crypto.randomBytes` (cryptographiquement sécurisé)

#### 4. Vérification email
- Token unique 64 caractères
- Expire après 24h
- Activé via `REQUIRE_EMAIL_VERIFICATION=true`

---

### 📁 Fichiers Importants

#### Backend

| Fichier | Description |
|---------|-------------|
| `backend/src/main.ts` | Point d'entrée, CORS, Swagger, static files |
| `backend/src/app.module.ts` | Module principal (Throttler, Prisma, etc.) |
| `backend/prisma/schema.prisma` | Schéma BDD complet |
| `backend/prisma/seed.ts` | Données de test |
| `backend/src/modules/auth/` | Authentification JWT |
| `backend/src/modules/preinscriptions/preinscriptions.service.ts` | Logique préinscription |
| `backend/src/modules/email/email.module.ts` | Config multi-providers SMTP |
| `backend/src/common/guards/recaptcha.guard.ts` | Validation reCAPTCHA |
| `backend/ENV_PRODUCTION.md` | Documentation variables d'environnement |

#### Frontend

| Fichier | Description |
|---------|-------------|
| `frontend/src/app/(public)/preinscription/page.tsx` | Formulaire préinscription |
| `frontend/src/app/(parent)/layout.tsx` | Layout parent (force changement mdp) |
| `frontend/src/app/(parent)/changer-mot-de-passe/page.tsx` | Changement mot de passe |
| `frontend/src/app/(parent)/mes-dossiers/page.tsx` | Dossiers du parent |
| `frontend/src/app/(public)/verification-email/page.tsx` | Vérification email |
| `frontend/src/app/admin/preinscriptions/page.tsx` | Admin préinscriptions |
| `frontend/src/hooks/useRecaptcha.ts` | Hook reCAPTCHA |
| `frontend/src/lib/api.ts` | Client API |
| `frontend/src/components/layout/ParentLayout.tsx` | Layout avec menu |

---

### 🖥️ Commandes de Développement

#### Démarrer le projet
```bash
# Terminal 1 - PostgreSQL + MailHog
docker compose up -d

# Terminal 2 - Backend NestJS (port 3001)
cd backend && npm run start:dev

# Terminal 3 - Frontend Next.js (port 3000)
cd frontend && npm run dev
```

#### URLs
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001/api |
| **Swagger** | http://localhost:3001/api/docs |
| **MailHog** | http://localhost:8025 |
| **Prisma Studio** | http://localhost:5555 |

#### Utilitaires
```bash
# Tuer un process sur un port
kill -9 $(lsof -ti:3001)

# Reconstruire le backend
cd backend && npm run build

# Copier les templates email
cp backend/src/modules/email/templates/*.hbs backend/dist/src/modules/email/templates/

# Mettre à jour Prisma après modif schema
cd backend && npx prisma db push

# Régénérer Prisma Client
cd backend && npx prisma generate
```

---

### ⚙️ Variables d'Environnement Production

Créer un fichier `.env` dans `backend/` avec :

```env
# Base
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@host:5432/monecole?schema=public"

# JWT
JWT_SECRET="votre_cle_secrete_minimum_32_caracteres"
JWT_EXPIRES_IN="7d"

# Email (SendGrid recommandé)
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
MAIL_FROM="Mon École et Moi <noreply@mon-ecole-et-moi.fr>"

# reCAPTCHA
RECAPTCHA_SITE_KEY=6Lxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxx
RECAPTCHA_MIN_SCORE=0.5

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# URLs
FRONTEND_URL=https://mon-ecole-et-moi.fr

# Sécurité
USE_RANDOM_PASSWORD=true
REQUIRE_EMAIL_VERIFICATION=true
```

Frontend `.env.local` :
```env
NEXT_PUBLIC_API_URL=https://api.mon-ecole-et-moi.fr/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxx
```

---

### 🐛 Problèmes Connus et Solutions

#### 1. Templates email non trouvés
```
Error: ENOENT: no such file or directory, open '.../dist/src/modules/email/templates/xxx.hbs'
```
**Solution** : Copier les templates dans dist
```bash
cp backend/src/modules/email/templates/*.hbs backend/dist/src/modules/email/templates/
```

#### 2. Port déjà utilisé (EADDRINUSE)
```bash
kill -9 $(lsof -ti:3001)  # Backend
kill -9 $(lsof -ti:3000)  # Frontend
```

#### 3. Erreur Prisma "relation does not exist"
Les tables Prisma sont en snake_case (`preinscriptions`, pas `Preinscription`)
```sql
SELECT * FROM preinscriptions;  -- OK
SELECT * FROM "Preinscription"; -- Erreur
```

#### 4. CSS ne charge pas
Redémarrer le frontend :
```bash
kill -9 $(lsof -ti:3000)
cd frontend && npm run dev
```

---

### 📋 TODO - Fonctionnalités Restantes

#### Priorité Haute
- [ ] Finir l'interface admin complète
- [ ] Module facturation (génération PDF)
- [ ] Exports comptables
- [ ] Notifications push (PWA)

#### Priorité Moyenne
- [ ] Calendrier scolaire éditable par admin
- [ ] Commandes repas complètes
- [ ] Commandes périscolaire complètes
- [ ] Messagerie interne

#### Priorité Basse
- [ ] RH - Planning équipes
- [ ] SMS (Twilio)
- [ ] Application PWA complète

---

### 🔄 Comparaison Laravel → Next.js/NestJS

| Fonctionnalité | Laravel (ancien) | NestJS (nouveau) |
|----------------|------------------|------------------|
| Préinscription | ✅ | ✅ Amélioré |
| Validation admin | ✅ | ✅ |
| Création compte auto | ✅ | ✅ Amélioré |
| Email confirmation | ✅ | ✅ Multi-providers |
| Email vérification | ❌ | ✅ Nouveau |
| Signature règlement | ✅ | ✅ |
| Upload justificatifs | ✅ | ✅ Avec multer |
| Changement mdp obligatoire | ✅ | ✅ Amélioré (impossible à bypass) |
| Rate limiting | ❌ | ✅ Nouveau |
| reCAPTCHA | ❌ | ✅ Nouveau |
| Mots de passe sécurisés | ❌ (fixe) | ✅ Aléatoires |

---

### 📝 Notes pour Reprise du Projet

Si une autre IA ou développeur reprend ce projet :

1. **Lire ce fichier en entier** pour comprendre l'architecture
2. **Vérifier que Docker tourne** (`docker ps`) pour PostgreSQL et MailHog
3. **Lancer backend puis frontend** dans cet ordre
4. **Tester avec les comptes de test** (admin@ecole.fr / admin123)
5. **Consulter Swagger** pour la doc API (http://localhost:3001/api/docs)
6. **Les templates email** doivent être copiés dans dist après chaque build

---

---

### 💰 Tarifs École (Réels - mis à jour 6 janvier 2026)

Source : https://mon-école-et-moi.com/tarifs

#### Frais d'inscription
| Type | Montant |
|------|---------|
| Première année (par élève) | **320,00 €** |
| Années suivantes (par an) | **165,00 €** |

#### Frais de scolarité
| Description | Montant |
|-------------|---------|
| Mensuel (× 12 mois) | **555,00 €/mois** |
| Annuel | **6 660,00 €/an** |
| Réduction fratrie | **-20%** dès le 2e enfant |

#### Frais de fonctionnement (annuels)
| Classe | Montant |
|--------|---------|
| Maternelle (3-6 ans) | **45,00 €/an** |
| Élémentaire (6-12 ans) | **65,00 €/an** |

#### Services optionnels
| Service | Montant | Détails |
|---------|---------|---------|
| **Repas midi** | **5,45 €/repas** | Traiteur |
| **Périscolaire** | **6,20 €/séance** | 16h00-17h30 (goûter inclus) |

---

### 📅 Organisation de l'École

#### Semaine de 4 jours
- **Lundi** ✅
- **Mardi** ✅
- **Mercredi** ❌ (fermé)
- **Jeudi** ✅
- **Vendredi** ✅
- **Samedi/Dimanche** ❌

#### Horaires
| Activité | Horaires |
|----------|----------|
| Accueil | 8h30 |
| Fin des cours | 16h00 |
| Périscolaire | 16h00 - 17h30 |

#### Classes multi-âges Montessori
| Classe | Âges | Description |
|--------|------|-------------|
| **Maternelle** | 3-6 ans | Classe multi-âges |
| **Élémentaire** | 6-12 ans | CP au CM2 |

---

### 📁 Configuration Tarifs (Frontend)

Les tarifs sont centralisés dans un fichier de configuration :

```typescript
// frontend/src/config/tarifs.ts

export const TARIFS = {
  inscription: {
    premiereAnnee: 320,      // €
    anneesSuivantes: 165,    // €/an
  },
  scolarite: {
    mensuel: 555,            // €/mois
    annuel: 6660,            // €/an
    reductionFratrie: 0.20,  // 20%
  },
  fonctionnement: {
    maternelle: 45,          // €/an
    elementaire: 65,         // €/an
  },
  repas: {
    midi: 5.45,              // €/repas
  },
  periscolaire: {
    seance: 6.20,            // €/séance
  },
};

export const ORGANISATION = {
  joursOuvrables: [1, 2, 4, 5], // Lundi, Mardi, Jeudi, Vendredi
  joursFermes: [0, 3, 6],      // Dimanche, Mercredi, Samedi
  horaires: {
    accueil: "8h30",
    finCours: "16h00",
    finPeriscolaire: "17h30",
  },
};
```

#### Fonctionnalités intégrées
- ✅ **Formulaire préinscription** : Affiche les tarifs réels
- ✅ **Calendrier repas/périscolaire** : Exclut le mercredi automatiquement
- ✅ **Récapitulatif commande** : Calcule le total avec les vrais prix
- ✅ **Info bulles** : Affiche les tarifs unitaires sur chaque page

---

### 🏫 Informations École

| | |
|---|---|
| **Nom** | Mon École et Moi |
| **Sous-titre** | École Montessori |
| **Adresse** | 58 rue Damberg, 68350 Brunstatt-Didenheim |
| **Téléphone** | 03 89 06 07 77 |
| **Email** | contact@montessorietmoi.com |
| **Site web** | https://mon-école-et-moi.com |
| **Fondation** | 2016 |
| **Fondatrices** | Audrey Ballester & Isabelle Grebent |
| **Distinction** | Première école Montessori du Haut-Rhin |

---

---

## 📜 HISTORIQUE DES AVANCÉES

### Comment utiliser cette section
À chaque session de travail significative, ajouter une entrée avec :
- 📅 Date
- ✅ Ce qui a été fait
- 🐛 Bugs corrigés
- ⏭️ Prochaines étapes

---

### 📅 Janvier 2026

#### 🗓️ Lundi 6 janvier 2026 (Journée complète)

**Durée :** ~12h de travail avec IA

**✅ Réalisé :**

1. **Setup projet complet**
   - Next.js 14 (App Router) - Frontend
   - NestJS - Backend API
   - PostgreSQL (Docker) - Base de données
   - Prisma ORM - Gestion BDD
   - MailHog - Test emails en local

2. **Module Préinscription complet**
   - Formulaire public `/preinscription`
   - Validation des champs
   - Création en BDD
   - Email de confirmation automatique

3. **Authentification**
   - JWT (JSON Web Token)
   - Login parent `/connexion`
   - Login admin `/admin/login`
   - Guards de protection des routes
   - Rôles : PARENT, ADMIN, EDUCATEUR

4. **Changement mot de passe obligatoire**
   - Flag `premiereConnexion` en BDD
   - Redirection forcée vers `/changer-mot-de-passe`
   - Impossible de contourner (menu masqué)

5. **Système d'emails multi-providers**
   - MailHog (dev), SendGrid, Mailgun, SMTP (prod)
   - Templates Handlebars
   - Emails : confirmation, validation, refus, vérification

6. **Sécurité production**
   - Rate limiting (@nestjs/throttler)
   - reCAPTCHA v3
   - Mots de passe aléatoires en production
   - Vérification email avec token

7. **Validation admin**
   - Création automatique compte parent
   - Création automatique enfant
   - Email avec identifiants

8. **Signature règlement intérieur**
   - PDF consultable
   - Endpoint de signature
   - Tracking en BDD

9. **Intégration tarifs réels école**
   - Fichier de config `frontend/src/config/tarifs.ts`
   - Tarifs officiels de mon-école-et-moi.com
   - Affichage dans formulaire préinscription

10. **Calendrier 4 jours/semaine**
    - Mercredi exclu automatiquement
    - Appliqué sur pages Repas et Périscolaire

11. **Tests complets du flux**
    - Création préinscription ✅
    - Email de confirmation ✅
    - Rate limiting (HTTP 429) ✅
    - Validation admin → compte créé ✅
    - Connexion parent ✅
    - Changement mot de passe ✅
    - Signature règlement ✅

12. **Documentation**
    - `RECAP_PROJET.md` mis à jour
    - `PLANNING_REALISTE.md` créé

**🐛 Bugs corrigés :**
- Templates email non copiés dans `dist/`
- Boucle infinie changement mot de passe (router.push → window.location.href)
- Menu accessible pendant changement mdp obligatoire
- Numéros de dossier non uniques

**📁 Fichiers créés :**
```
frontend/
├── src/app/(public)/preinscription/page.tsx
├── src/app/(public)/connexion/page.tsx
├── src/app/(public)/verification-email/page.tsx
├── src/app/(parent)/layout.tsx
├── src/app/(parent)/dashboard/page.tsx
├── src/app/(parent)/changer-mot-de-passe/page.tsx
├── src/app/(parent)/mes-dossiers/page.tsx
├── src/app/(parent)/periscolaire/page.tsx
├── src/app/(parent)/repas/page.tsx
├── src/app/admin/login/page.tsx
├── src/app/admin/preinscriptions/page.tsx
├── src/config/tarifs.ts
├── src/hooks/useRecaptcha.ts
├── src/lib/api.ts
└── src/types/index.ts

backend/
├── src/modules/auth/
├── src/modules/preinscriptions/
├── src/modules/email/
├── src/modules/signatures/
├── src/common/guards/recaptcha.guard.ts
├── prisma/schema.prisma
└── prisma/seed.ts
```

**⏭️ Prochaines étapes (Semaine 2) :**
- [ ] Dashboard parent complet
- [ ] Liste enfants du parent
- [ ] Amélioration UX mes-dossiers
- [ ] Upload justificatifs (début)

---

### 📊 État Actuel du Projet (Mise à jour 6 janvier 2026)

#### Modules terminés ✅
| Module | Frontend | Backend | Date |
|--------|----------|---------|------|
| Setup projet | ✅ | ✅ | 6 jan |
| Préinscription | ✅ | ✅ | 6 jan |
| Authentification | ✅ | ✅ | 6 jan |
| Emails | - | ✅ | 6 jan |
| Sécurité (rate limit, captcha) | - | ✅ | 6 jan |
| Signature règlement | ✅ | ✅ | 6 jan |
| Tarifs intégrés | ✅ | - | 6 jan |

#### Modules en cours 🟡
| Module | Frontend | Backend | Prévu |
|--------|----------|---------|-------|
| Dashboard parent | 🟡 50% | 🟡 | S2 janvier |
| Interface admin | 🟡 30% | 🟡 | S4 janvier |
| Upload justificatifs | 🟡 | 🟡 | S3 janvier |

#### Modules Front fait / Back désactivé ⏸️
| Module | Frontend | Backend | Prévu |
|--------|----------|---------|-------|
| Repas | ✅ Fait | ⏸️ Désactivé | **Avril** |
| Périscolaire | ✅ Fait | ⏸️ Désactivé | **Avril** |

> **Note :** Le backend Repas/Périscolaire existe mais est commenté dans `app.module.ts`.
> À réactiver en avril selon le planning.

#### Modules à faire ⬜
| Module | Frontend | Backend | Prévu |
|--------|----------|---------|-------|
| **Facturation** | ⬜ | ⬜ | **Février-Mars (PRIORITÉ)** |
| Communication | ⬜ | ⬜ | Mai |
| PWA Mobile | ⬜ | - | Juin (si temps) |

---

### 📝 Template pour nouvelles entrées

```markdown
#### 🗓️ [JOUR] [DATE] [MOIS] [ANNÉE]

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

**Dernière mise à jour :** 6 janvier 2026  
**Auteur :** Erblin Potoku + Claude (Cursor AI)  
**Fin de stage :** 23 juin 2026  
**Prochaine étape :** Dashboard parent complet

---

## ⚠️ CONTRAINTES IMPORTANTES

### Fin de licence L3 (Juin 2026)
En parallèle du stage, Erblin doit :
- 📝 **Rédiger un mémoire de 40 pages** sur le projet
- 🎤 **Préparer et passer un oral** de soutenance

**Impact sur le planning :**
- Juin = mois chargé (stage + mémoire + oral)
- Prévoir que les fonctionnalités principales soient terminées **fin mai**
- Juin = uniquement tests, déploiement, formation (moins de code)
- Le mémoire peut s'appuyer sur ce projet (migration Laravel → Next.js, architecture, etc.)

### Conseil pour le mémoire
Ce projet est parfait pour un mémoire de L3 :
- **Sujet technique** : Migration d'une application Laravel vers Next.js/NestJS
- **Problématique possible** : "Comment moderniser une application web existante tout en garantissant la continuité de service ?"
- **Points à développer** :
  - Analyse de l'existant (Laravel)
  - Choix technologiques (pourquoi Next.js, NestJS, PostgreSQL)
  - Architecture du nouveau système
  - Sécurité (JWT, rate limiting, reCAPTCHA)
  - Méthodologie de travail (planning, communication client)
  - Résultats et perspectives

