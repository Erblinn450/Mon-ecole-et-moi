# 📚 Journal de Bord - Mémoire L3

**Étudiant :** Erblin Potoku  
**Formation :** L3 Informatique - UHA 4.0  
**Stage :** Mon École et Moi (6 janvier - 23 juin 2026)  
**Mémoire :** 40 pages + oral

---

## 🎯 Sujet du mémoire (à définir)

**Titre provisoire :**  
*"Migration d'une application web de gestion scolaire : de Laravel à Next.js/NestJS"*

**Problématique possible :**  
Comment moderniser une application web existante tout en répondant aux nouveaux besoins métier (mobilité, performance, sécurité) ?

---

## 📖 Structure du mémoire (40 pages)

### Introduction (~3 pages)
- Contexte : école Montessori, besoin d'un outil de gestion
- Problématique
- Annonce du plan

### Partie 1 : Analyse de l'existant (~8 pages)
- Présentation de l'école et ses besoins
- L'application Laravel existante (forces/faiblesses)
- Pourquoi migrer ? (limites techniques, nouveaux besoins)

### Partie 2 : Choix technologiques (~8 pages)
- Comparaison des options (Laravel amélioré vs migration complète)
- Pourquoi Next.js pour le frontend ?
- Pourquoi NestJS pour le backend ?
- Pourquoi PostgreSQL ?
- Architecture choisie

### Partie 3 : Réalisation (~12 pages)
- Méthodologie de travail
- Les modules développés
- Difficultés rencontrées et solutions
- Sécurité mise en place

### Partie 4 : Gestion de projet (~5 pages)
- Travail en solo avec un client
- Communication (appels, démos)
- Planning et priorisation
- Adaptation aux imprévus

### Conclusion (~3 pages)
- Bilan technique
- Bilan personnel
- Perspectives (ce qui reste à faire, évolutions possibles)

### Annexes
- Captures d'écran
- Schémas d'architecture
- Extraits de code significatifs

---

## 📅 JOURNAL DE BORD

> À chaque session de travail, noter :
> - Ce qu'on a fait
> - Pourquoi on l'a fait (justification)
> - Les problèmes rencontrés
> - Les solutions trouvées
> - Ce qu'on a appris

---

### 🗓️ Lundi 5 - Mardi 6 janvier 2026

**Durée :** ~15h sur 2 jours (avec IA Cursor)

#### Ce qu'on a fait

**JOUR 1 - Lundi 5 janvier : Setup + Développement**

1. **Setup complet du nouveau projet**
   - Création projet Next.js 14 (frontend)
   - Création projet NestJS (backend API)
   - Configuration PostgreSQL avec Docker
   - Configuration Prisma (ORM)

2. **Module de préinscription**
   - Formulaire complet avec validation
   - Envoi d'email de confirmation automatique
   - Stockage en base de données

3. **Authentification sécurisée**
   - JWT (JSON Web Token)
   - Système de rôles (Parent, Admin, Éducateur)
   - Changement de mot de passe obligatoire à la première connexion

4. **Sécurité production**
   - Rate limiting (limite le nombre de requêtes par minute)
   - reCAPTCHA v3 (protection anti-bot)
   - Mots de passe aléatoires en production

5. **Intégration des tarifs réels de l'école**
   - Recherche sur le site officiel mon-école-et-moi.com
   - Création d'un fichier de configuration centralisé (`tarifs.ts`)
   - Adaptation du calendrier (semaine de 4 jours, mercredi exclu)

**JOUR 2 - Mardi 6 janvier : Organisation + Communication**

6. **Appel avec Audrey (cliente) le matin**
   - Point sur l'avancement
   - Explication de la migration Laravel → Next.js
   - Elle a beaucoup aimé l'idée du PWA (app mobile sans store)

7. **Création du planning détaillé (6 mois)**
   - Analyse des priorités avec une logique d'expert
   - Priorisation par valeur business + risque technique
   - Facturation en premier (le plus important + le plus risqué)
   - Document `PLANNING_REALISTE.md` créé

8. **Rédaction du mail pour Audrey**
   - Explication du planning
   - Justification des choix de priorités
   - Demande de feedback

9. **Documentation du projet**
   - Mise à jour de `RECAP_PROJET.md`
   - Création de `MEMOIRE_L3.md` (ce fichier)
   - Prise en compte de la contrainte mémoire + oral en juin

10. **Organisation selon le planning**
    - Désactivation du backend Repas/Périscolaire (prévu pour avril)
    - Le frontend reste visible (pour montrer l'interface à Audrey)
    - Focus sur : Inscriptions (janvier) → Facturation (février-mars)

#### Pourquoi ces choix ?

**Pourquoi Next.js plutôt que rester sur Laravel ?**
- Laravel = rendu côté serveur, moins fluide
- Next.js = moderne, rapide, permet de faire une PWA (app mobile)
- TypeScript partout = moins de bugs, code plus maintenable
- La cliente voulait une app mobile → PWA = solution sans passer par les stores

**Pourquoi NestJS pour l'API ?**
- Structure organisée (modules, services, contrôleurs)
- TypeScript natif (cohérent avec Next.js)
- Prisma s'intègre parfaitement
- Guards et décorateurs pour la sécurité

**Pourquoi PostgreSQL au lieu de MySQL ?**
- Meilleure intégration avec Prisma
- Plus performant pour les requêtes complexes
- Gratuit et robuste

#### Problèmes rencontrés

1. **Templates email non trouvés après build**
   - *Problème :* Les fichiers `.hbs` n'étaient pas copiés dans le dossier `dist/`
   - *Solution :* Configuration du `nest-cli.json` pour copier les assets

2. **Boucle infinie au changement de mot de passe**
   - *Problème :* Après avoir changé le mdp, l'utilisateur était redirigé vers la même page en boucle
   - *Solution :* Utiliser `window.location.href` au lieu de `router.push` pour forcer un rechargement complet

3. **Menu accessible pendant le changement de mdp obligatoire**
   - *Problème :* L'utilisateur pouvait contourner l'obligation en cliquant sur le menu
   - *Solution :* Masquer complètement le layout avec menu quand `premiereConnexion = true`

#### Ce que j'ai appris
- La différence entre `router.push` (navigation SPA) et `window.location.href` (rechargement complet)
- Comment configurer un guard NestJS pour valider les tokens reCAPTCHA
- L'importance de tester le flux complet, pas juste les fonctions isolées
- Comment structurer un projet avec des fichiers de configuration centralisés (tarifs.ts)

---

### 🗓️ [TEMPLATE - Copier pour nouvelle entrée]

**Durée :** Xh

#### Ce qu'on a fait
- ...

#### Pourquoi ces choix ?
- ...

#### Problèmes rencontrés
- ...

#### Ce que j'ai appris
- ...

---

## 💡 Notes en vrac (idées pour le mémoire)

### Points forts à mentionner
- Migration sans interruption de service (l'ancien Laravel peut continuer de tourner)
- Sécurité renforcée par rapport à l'existant
- Architecture modulaire (facile à maintenir et faire évoluer)
- Communication régulière avec le client

### Points techniques intéressants
- Système d'email multi-providers (MailHog en dev, SendGrid en prod)
- Rate limiting pour protéger l'API
- JWT avec refresh token
- Prisma pour la gestion type-safe de la BDD

### Difficultés à développer
- Travailler seul sur un projet complet
- Gérer les attentes du client
- Prioriser les fonctionnalités
- Documenter au fur et à mesure

---

## 📚 Ressources / Bibliographie

### Documentation officielle
- Next.js : https://nextjs.org/docs
- NestJS : https://docs.nestjs.com
- Prisma : https://www.prisma.io/docs
- PostgreSQL : https://www.postgresql.org/docs/

### Articles utiles
(à compléter au fil du stage...)

### Livres
(à compléter...)

---

## 📸 Captures d'écran à garder

> Penser à faire des captures d'écran régulièrement pour les annexes du mémoire

- [ ] Page d'accueil
- [ ] Formulaire de préinscription
- [ ] Interface admin
- [ ] Email de confirmation
- [ ] Dashboard parent
- [ ] Architecture du projet (schéma)

---

**Dernière mise à jour :** 6 janvier 2026
