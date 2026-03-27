# Concepts techniques — Guide pour la review

## ARCHITECTURE

### Pourquoi NestJS ?

**Ce que c'est :**
NestJS c'est un framework backend qui t'oblige à organiser ton code en "modules". Chaque module (facturation, auth, justificatifs...) est une boîte indépendante avec son controller (qui reçoit les requêtes), son service (qui contient la logique métier), et ses DTOs (qui valident les données entrantes). C'est inspiré d'Angular.

**Pourquoi dans ce projet :**
Avec ~15 modules, si on avait fait ça en Express brut, on aurait eu un fichier `app.js` de 3000 lignes ou des dizaines de fichiers sans structure claire. NestJS force à séparer les responsabilités. Et surtout, il a un système de "guards" — des filtres qui vérifient automatiquement si l'utilisateur est connecté et s'il a le bon rôle avant d'exécuter la requête. Ça évite d'oublier un `if (!user)` dans un endpoint.

**Ce que tu peux dire :**
"J'ai choisi NestJS pour sa structure modulaire. Chaque fonctionnalité est isolée dans son module, et le système de guards me permet de sécuriser les routes de manière déclarative — je mets `@UseGuards(JwtAuthGuard)` et c'est géré. Avec Express brut, j'aurais dû câbler tout ça manuellement sur chaque route."

---

### Pourquoi Prisma ?

**Ce que c'est :**
Prisma c'est un ORM (outil pour communiquer avec la base de données) qui génère des types TypeScript à partir du schéma de la BDD. Quand tu écris une requête, ton IDE te dit exactement quels champs existent, quel est leur type, et te signale les erreurs avant même de lancer le code.

**Pourquoi dans ce projet :**
Le schéma Prisma (`schema.prisma`) est la source de vérité unique. Quand je modifie un champ, Prisma génère la migration SQL ET met à jour les types TypeScript. Avec TypeORM par exemple, le schéma et les types peuvent se désynchroniser sans qu'on s'en rende compte — on découvre le bug en production.

**Ce que tu peux dire :**
"Prisma me donne la garantie que mes requêtes correspondent au schéma réel de la base. Si je fais une faute de frappe sur un nom de champ, TypeScript me le dit immédiatement. Et les migrations sont générées automatiquement à partir du schéma, donc il n'y a qu'une seule source de vérité."

---

### Pourquoi PostgreSQL et pas MySQL ou MongoDB ?

**Ce que c'est :**
PostgreSQL c'est une base de données relationnelle (comme MySQL) mais avec des fonctionnalités avancées. MongoDB c'est une base NoSQL (pas de tables, pas de relations strictes).

**Pourquoi dans ce projet :**
Les données de l'école sont très relationnelles : un parent a des enfants, un enfant a des factures, une facture a des lignes, des paiements... MongoDB serait un mauvais choix car il faudrait gérer ces relations manuellement. PostgreSQL plutôt que MySQL parce que PostgreSQL a des fonctionnalités qu'on utilise : le type `Decimal` natif pour les montants financiers, les `advisory locks` pour les numéros de facture, et des transactions plus robustes.

**Ce que tu peux dire :**
"Les données sont fortement relationnelles (parent → enfant → facture → lignes → paiements), donc une base relationnelle s'imposait. PostgreSQL plutôt que MySQL pour le type Decimal natif (précision financière) et les advisory locks qu'on utilise pour la numérotation séquentielle des factures."

---

## SECURITE

### JWT et tokenVersion

**Ce que c'est :**
Un JWT (JSON Web Token) c'est un "badge" que le serveur donne à l'utilisateur quand il se connecte. Ce badge contient son ID, son rôle et une date d'expiration. À chaque requête, l'utilisateur montre son badge, et le serveur vérifie qu'il est valide sans avoir besoin d'aller chercher en base de données.

Le problème c'est que ce badge reste valide jusqu'à expiration. Si un utilisateur change son mot de passe (parce qu'il a été compromis par exemple), les anciens badges marchent encore. C'est là qu'intervient `tokenVersion` : c'est un compteur dans la BDD. Quand le mot de passe change, on incrémente le compteur. À chaque requête, on vérifie que le compteur dans le badge correspond à celui en BDD. Si ça ne correspond pas, le badge est rejeté.

**Pourquoi dans ce projet :**
On gère des données d'enfants et de l'argent. Si un parent se fait voler son mot de passe et le change, il faut que les anciens tokens soient immédiatement invalides, pas dans 24h.

**Ce que tu peux dire :**
"Le JWT classique a un problème : il reste valide même après un changement de mot de passe. J'ai ajouté un champ `tokenVersion` en base. Chaque changement de mot de passe incrémente ce compteur, et la stratégie JWT vérifie que la version dans le token correspond à celle en base. Si un parent change son mot de passe, tous ses anciens tokens sont instantanément invalidés."

---

### Le pattern selector/verifier

**Ce que c'est :**
Quand un utilisateur demande à réinitialiser son mot de passe, on lui envoie un lien avec un token. Ce token est coupé en deux morceaux :
- Le **selector** (première moitié) : stocké en clair en BDD, sert à retrouver l'entrée
- Le **verifier** (deuxième moitié) : hashé avec bcrypt avant d'être stocké

Quand l'utilisateur clique sur le lien, on utilise le selector pour trouver la bonne ligne en BDD, puis on compare le verifier avec le hash stocké.

**Pourquoi pas stocker le token en entier ?**
Si on stocke le token en clair, un attaquant qui accède à la BDD peut réinitialiser le mot de passe de n'importe qui. Si on hashe le token entier, on ne peut plus le retrouver en BDD (on ne peut pas faire `WHERE hash = ?` car le hash est différent à chaque fois avec bcrypt). Le selector/verifier résout les deux problèmes.

**Ce que tu peux dire :**
"C'est le pattern recommandé par l'OWASP. Le selector me permet de retrouver l'entrée en base de données, et le verifier est hashé avec bcrypt pour résister à une fuite de la base. Même si quelqu'un accède à la table des tokens, il ne peut pas les utiliser car il ne connaît que le hash du verifier, pas la valeur originale."

---

### La vérification de parenté (IDOR)

**Ce que c'est :**
IDOR (Insecure Direct Object Reference) c'est quand un utilisateur peut accéder aux données d'un autre utilisateur juste en changeant un numéro dans l'URL. Par exemple, si le parent A va sur `/api/enfants/5/factures` et voit les factures de son enfant, est-ce qu'il peut taper `/api/enfants/6/factures` et voir les factures de l'enfant d'un autre parent ?

La vérification de parenté, c'est un check qui dit : "Cet enfant appartient-il bien à ce parent ?" On vérifie que `enfant.parent1Id === userId || enfant.parent2Id === userId` avant de renvoyer quoi que ce soit.

**Pourquoi c'est critique :**
On gère des données de mineurs. Un parent ne doit jamais pouvoir voir les documents, factures ou informations d'un enfant qui n'est pas le sien.

**Ce que tu peux dire :**
"Chaque endpoint qui manipule des données d'un enfant vérifie d'abord que l'utilisateur authentifié est bien le parent de cet enfant. C'est implémenté via une méthode `verifierParente()` appelée en tout premier dans le service. Les admins ont un bypass car ils doivent pouvoir accéder à tous les dossiers. C'est la protection contre les attaques IDOR — un parent ne peut jamais voir les données d'un enfant qui n'est pas le sien, même en forgeant une requête."

---

### Rate limiting

**Ce que c'est :**
C'est une limite sur le nombre de requêtes qu'un utilisateur peut faire dans un laps de temps. Par exemple : max 5 tentatives de login par minute.

**Pourquoi c'est nécessaire :**
Sans rate limiting, un attaquant peut tester des milliers de mots de passe par seconde (attaque brute force). Avec une limite de 5 par minute, ça prendrait des années pour trouver un mot de passe.

**Ce que tu peux dire :**
"Le login est limité à 5 tentatives par minute, la demande de reset à 3 par minute. C'est un ThrottlerGuard global qui fait aussi du rate limiting général en production (100 req/min). En développement, les limites sont très hautes pour ne pas gêner les tests."

---

### Helmet.js et les HTTP headers

**Ce que c'est :**
Helmet c'est un middleware qui ajoute automatiquement des headers de sécurité aux réponses HTTP. Ces headers disent au navigateur comment se comporter :
- `X-Frame-Options` : empêche quelqu'un d'embarquer ton site dans une iframe (clickjacking)
- `X-Content-Type-Options: nosniff` : empêche le navigateur de deviner le type d'un fichier (qui pourrait exécuter du code malveillant)
- `Strict-Transport-Security` : force le HTTPS

**Pourquoi dans ce projet :**
Ce sont des protections de base qui coûtent zéro effort et bloquent des classes entières d'attaques. Ne pas les mettre serait une négligence.

**Ce que tu peux dire :**
"Helmet est configuré dans main.ts et ajoute automatiquement les headers de sécurité standards. Le CSP est désactivé côté backend parce que c'est une API JSON — le CSP est géré côté Next.js qui sert le HTML."

---

## TRANSACTIONS & CONCURRENCE

### Transactions ACID

**Ce que c'est :**
Imagine que tu fais un virement bancaire : tu débites un compte et tu crédites l'autre. Si le système plante entre les deux, il y a un problème — l'argent a disparu. Une transaction ACID garantit que soit les deux opérations réussissent, soit aucune ne se fait. C'est le "tout ou rien".

ACID c'est un acronyme :
- **A**tomicité : tout ou rien
- **C**ohérence : la BDD reste dans un état valide
- **I**solation : les transactions en cours ne se voient pas entre elles
- **D**urabilité : une fois committé, c'est permanent même si le serveur plante

**Pourquoi dans ce projet :**
Quand on crée une facture, on crée aussi ses lignes, on génère un numéro séquentiel, et on met à jour les totaux. Si ça plante au milieu, on ne veut pas d'une facture sans lignes ou avec un numéro en double.

**Ce que tu peux dire :**
"Toutes les opérations financières sont dans des transactions Prisma. Si le serveur plante au milieu de la création d'une facture, PostgreSQL annule tout automatiquement — pas de données partielles. C'est le comportement ACID standard."

---

### Prisma $transaction

**Ce que c'est :**
`$transaction` c'est la façon de dire à Prisma : "Toutes ces opérations doivent réussir ensemble ou échouer ensemble." On lui passe une fonction avec toutes les requêtes, et si n'importe laquelle échoue, tout est annulé (rollback).

**Point crucial : les lectures DANS la transaction.**
Si tu lis le solde d'une facture AVANT la transaction, puis tu enregistres un paiement DANS la transaction, un autre utilisateur peut modifier le solde entre ta lecture et ton écriture. C'est pour ça que la règle est : toute lecture qui conditionne une écriture doit être DANS la transaction.

**Ce que tu peux dire :**
"J'utilise des transactions interactives Prisma (`$transaction(async (tx) => { ... })`). La règle stricte qu'on suit : toute lecture qui conditionne une écriture est à l'intérieur de la transaction. Par exemple pour un paiement, on lit le solde ET on met à jour le montant payé dans la même transaction. Si la BDD plante, PostgreSQL fait un rollback automatique."

---

### Race condition et pg_advisory_xact_lock

**Ce que c'est :**
Une race condition, c'est quand deux opérations simultanées produisent un résultat incorrect parce qu'elles se marchent dessus. Exemple concret :

1. L'admin génère les factures de janvier pour le parent A → le système cherche le dernier numéro → FA-202601-003 → il va créer FA-202601-004
2. En même temps, l'admin génère pour le parent B → même recherche → FA-202601-003 → il va AUSSI créer FA-202601-004
3. Résultat : deux factures avec le même numéro.

`pg_advisory_xact_lock` c'est un verrou PostgreSQL. Quand la requête 1 pose le verrou, la requête 2 attend que la requête 1 soit terminée avant de chercher le dernier numéro. Comme ça, elle voit FA-202601-004 et crée FA-202601-005.

**Ce que tu peux dire :**
"Les numéros de facture doivent être séquentiels sans trous — c'est une obligation comptable. Un simple `MAX + 1` a une race condition en cas de requêtes concurrentes. J'utilise `pg_advisory_xact_lock` qui est un verrou au niveau PostgreSQL : il bloque les autres opérations de numérotation le temps de générer le numéro. C'est plus léger qu'un verrouillage de table entière car ça ne bloque que les opérations de numérotation, pas les lectures."

---

## QUALITE DU CODE

### Decimal.js

**Ce que c'est :**
JavaScript a un bug célèbre : `0.1 + 0.2` ne donne pas `0.3` mais `0.30000000000000004`. C'est parce que les nombres sont stockés en binaire (IEEE 754) et certains nombres décimaux ne peuvent pas être représentés exactement.

Decimal.js est une librairie qui fait les calculs en décimal (comme une calculatrice), pas en binaire. `new Decimal('0.1').plus('0.2')` donne exactement `0.3`.

**Pourquoi dans ce projet :**
On fait des factures avec des centimes. Un écart d'1 centime par mois, sur 50 familles, pendant un an, ça fait des dizaines d'euros d'écart en comptabilité. Et c'est un cauchemar à débugger parce que les montants "ont l'air corrects" à l'affichage.

**Ce que tu peux dire :**
"JavaScript utilise le standard IEEE 754 pour les nombres flottants, ce qui crée des erreurs de précision sur les décimales. Sur des factures, ça peut accumuler des centimes d'écart. J'utilise Decimal.js pour tous les calculs financiers — l'arithmétique est exacte en base 10. Le résultat est converti en nombre natif avec `toDecimalPlaces(2)` uniquement au moment de stocker en base."

---

### Machine à états

**Ce que c'est :**
Une machine à états, c'est une liste de "dans quel état je suis" et "vers quels états je peux aller". Par exemple pour une facture :
- EN_ATTENTE → peut aller vers ENVOYEE ou ANNULEE
- ENVOYEE → peut aller vers PAYEE, PARTIELLE ou EN_RETARD
- PAYEE → ne peut aller nulle part (état final)
- ANNULEE → ne peut aller nulle part (état final)

Toute transition qui n'est pas dans la liste est interdite et lève une erreur.

**Pourquoi dans ce projet :**
Sans machine à états, un bug dans le frontend pourrait envoyer une requête qui passe une facture annulée en payée. En comptabilité, c'est une catastrophe — ça fausserait les comptes. La machine à états garantit que seules les transitions logiques sont possibles.

**Ce que tu peux dire :**
"J'ai défini une table de transitions autorisées (`TRANSITIONS_VALIDES`). Avant chaque changement de statut, le service vérifie que la transition est autorisée. Si quelqu'un essaie de passer une facture annulée en payée, le serveur renvoie une erreur 400 avec un message explicite. C'est une protection contre les bugs frontend et les manipulations."

---

### ValidationPipe et whitelist

**Ce que c'est :**
Le `ValidationPipe` de NestJS vérifie automatiquement que les données envoyées par le client correspondent à ce qu'on attend (les bons champs, les bons types, les bonnes contraintes).

`whitelist: true` veut dire : "supprime silencieusement tout champ que je n'ai pas déclaré dans mon DTO". Par exemple, si quelqu'un envoie `{ email: "...", role: "ADMIN" }` pour une inscription, le champ `role` est supprimé car il n'est pas dans le DTO.

`forbidNonWhitelisted: true` va plus loin : au lieu de supprimer silencieusement, ça renvoie une erreur 400. Comme ça, le développeur frontend sait qu'il envoie un champ en trop.

**Pourquoi dans ce projet :**
Sans ça, un attaquant pourrait injecter des champs dans une requête pour se donner des droits admin ou modifier des champs qu'il ne devrait pas pouvoir toucher.

**Ce que tu peux dire :**
"Le ValidationPipe est configuré globalement avec `whitelist` et `forbidNonWhitelisted`. Ça signifie que toute propriété non déclarée dans le DTO provoque une erreur 400. C'est une protection contre l'injection de champs — personne ne peut s'auto-promouvoir admin en ajoutant `role: ADMIN` dans une requête."

---

## POINTS FAIBLES CONNUS

### JWT en localStorage vs cookie httpOnly

**La différence :**
`localStorage` c'est un espace de stockage dans le navigateur accessible par JavaScript. N'importe quel script qui tourne sur la page peut lire ce qui est dedans.

Un cookie `httpOnly` c'est un cookie que le navigateur envoie automatiquement avec chaque requête, mais que JavaScript ne peut PAS lire. Même si un script malveillant s'exécute sur la page (XSS), il ne peut pas voler le cookie.

**Pourquoi on a fait ce choix :**
Avec Next.js sur le port 3000 et NestJS sur le port 3001, ce sont deux "origines" différentes. Les cookies cross-origin nécessitent `SameSite=None` + `Secure` + un proxy en production. C'est faisable mais complexe, et ça aurait ajouté plusieurs jours de travail pour un risque qui est mitigé par le fait que React échappe tout le HTML par défaut (pas de `dangerouslySetInnerHTML` dans le code).

**Ce que tu peux dire :**
"C'est un compromis identifié. Le risque est une attaque XSS qui volerait le token. Mais React échappe automatiquement tout le contenu affiché, et on n'a aucun `dangerouslySetInnerHTML` dans le code — j'ai vérifié. Le vecteur XSS est donc très limité. La migration vers des cookies httpOnly est prévue mais c'est un refactoring non trivial vu l'architecture cross-origin."

---

### Pas de refresh token

**Ce que c'est :**
Normalement, quand un JWT expire, l'utilisateur doit se reconnecter. Un refresh token c'est un deuxième token, avec une durée de vie plus longue, qui permet d'obtenir un nouveau JWT sans se reconnecter. Ça permet de mettre un JWT très court (15 min) tout en gardant l'utilisateur connecté pendant des jours.

**Pourquoi c'est pas critique ici :**
L'application a ~30 utilisateurs (les parents de l'école + l'admin). Le JWT expire en 24h. Les parents n'utilisent pas l'application en continu — ils se connectent pour vérifier une facture ou signer un document, et ils repartent. Se reconnecter une fois par jour n'est pas un problème d'expérience utilisateur dans ce contexte.

**Ce que tu peux dire :**
"Le refresh token n'est pas implémenté. Le JWT expire en 24h, ce qui est un bon compromis pour une application de gestion scolaire avec peu d'utilisateurs. L'invalidation est gérée via `tokenVersion` — si un mot de passe change, les tokens existants sont rejetés immédiatement, même avant leur expiration naturelle."

---

### CVE npm

**Ce que c'est :**
CVE (Common Vulnerabilities and Exposures) c'est un identifiant unique pour une faille de sécurité connue. `npm audit` scanne les dépendances du projet et signale celles qui ont des CVE publiés.

**Ce qu'on a trouvé :**
- **bcrypt** : 56 vulnérabilités, mais elles sont dans `tar` (un outil d'archive) utilisé par `@mapbox/node-pre-gyp` qui sert à compiler bcrypt à l'installation. Ces vulnérabilités ne sont pas exploitables en runtime — `tar` n'est jamais appelé quand l'application tourne.
- **Next.js 14** : 4 CVE de type DoS (déni de service). Corrigé dans Next.js 16 mais c'est un changement majeur qui casserait des choses.

**Ce que tu peux dire :**
"Les CVE bcrypt sont dans les dépendances de build (tar), pas dans le code qui s'exécute en production. Les CVE Next.js sont des attaques DoS, pas des fuites de données. On prévoit la montée de version Next.js quand une version LTS stable sera disponible, mais ce n'est pas un risque de sécurité des données."
