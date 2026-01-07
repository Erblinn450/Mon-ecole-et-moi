# 🎯 User Story : Voir les Préinscriptions (Admin)

**Développeur** : Adel Abkar  
**Date** : 21 novembre 2025  
**Story** : En tant qu'admin, je souhaite voir toutes les demandes de pré-inscription

---

## 📋 Ce qui a été fait

### ✅ Backend Laravel

**1. Modèle de données**
- Fichier : `backend/app/Models/Preinscription.php`
- 13 champs : numéro dossier, infos enfant, infos parent, dates, statut
- Relations et casts configurés

**2. Migration base de données**
- Fichier : `backend/database/migrations/2025_11_21_084954_create_preinscriptions_table.php`
- Table `preinscriptions` avec tous les champs requis
- Index sur `numero_dossier` (unique)

**3. Contrôleur API**
- Fichier : `backend/app/Http/Controllers/PreinscriptionController.php`
- Méthode `index()` : Liste avec 5 filtres
- Méthode `show()` : Détail d'une préinscription
- Tri intelligent par statut + date

**4. Routes API**
- Fichier : `backend/routes/api.php`
- `GET /api/preinscriptions` : Liste
- `GET /api/preinscriptions/{id}` : Détail
- Protection par Sanctum (auth:sanctum)

---

### ✅ Frontend HTML/CSS/JavaScript

**1. Page d'administration**
- Fichier : `frontend/public/admin/preinscriptions.html`
- Interface responsive et moderne
- Tableau avec 9 colonnes d'information

**2. JavaScript**
- Fichier : `frontend/public/scripts/admin-preinscriptions.js`
- Appels API avec fetch
- Gestion authentification (token)
- Filtrage dynamique
- Statistiques en temps réel

**3. Styles CSS**
- Fichier : `frontend/public/styles/admin.css`
- Design moderne avec gradient
- Badges colorés par statut
- Responsive mobile/tablet/desktop
- Animations smooth

---

## 🎨 Fonctionnalités

### Filtres (5 options)
1. **Tous** : Affiche tous les dossiers
2. **En attente** : Dossiers non traités (par défaut)
3. **Validés** : Dossiers acceptés
4. **Refusés** : Dossiers rejetés
5. **Comptes créés** : Dossiers avec compte parent actif

### Statistiques
- Total de dossiers
- Nombre par statut (En attente, Validés, Refusés)
- Nombre de comptes créés
- Mise à jour automatique

### Tableau
- Numéro de dossier
- Nom parent complet
- Nom enfant complet
- Classe souhaitée
- Date d'intégration prévue
- Date de la demande
- Statut avec badge coloré
- Compte créé (Oui/Non)
- Bouton "Voir" pour les détails

---

## 🔧 Installation

### Option 1 : Script automatique
```bash
cd /home/adel/Documents/PROJET/mon-ecole-et-moi
./install-preinscriptions.sh
```

### Option 2 : Manuelle
Voir le fichier `INSTALLATION_PREINSCRIPTIONS.md` pour les étapes détaillées.

---

## 🧪 Tests

### Test API (avec curl)
```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecole.com","password":"admin123"}'

# Lister toutes les préinscriptions
curl http://localhost:8000/api/preinscriptions \
  -H "Authorization: Bearer VOTRE_TOKEN"

# Filtrer par "En attente"
curl "http://localhost:8000/api/preinscriptions?filtre=en_attente" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Test Frontend
1. Démarrer backend : `cd backend && php artisan serve`
2. Démarrer frontend : `cd frontend && npm run dev`
3. Ouvrir : http://localhost:3000/admin/preinscriptions.html

---

## 📊 Structure des données

### Champs de la table `preinscriptions`
```
id (auto)
numero_dossier (unique) - Ex: "DOSS-2025-001"
nom_enfant - Ex: "Dupont"
prenom_enfant - Ex: "Marie"
date_naissance - Ex: "2018-05-15"
classe_souhaitee - Ex: "CP"
nom_parent - Ex: "Dupont"
prenom_parent - Ex: "Jean"
email_parent - Ex: "jean.dupont@email.com"
telephone_parent - Ex: "0601020304"
date_integration - Ex: "2025-09-01"
date_demande (timestamp) - Ex: "2025-11-21 08:30:00"
statut (enum) - "En attente" | "Validé" | "Refusé"
compte_cree (boolean) - true | false
commentaire_refus (nullable) - Ex: "Places complètes"
created_at (auto)
updated_at (auto)
```

---

## 🎯 Endpoints API

| Méthode | Route | Paramètres | Description |
|---------|-------|------------|-------------|
| GET | `/api/preinscriptions` | `filtre` (optionnel) | Liste toutes les préinscriptions |
| GET | `/api/preinscriptions/{id}` | - | Détail d'une préinscription |

### Paramètre `filtre`
- `tous` : Tous les dossiers
- `en_attente` : Statut = "En attente"
- `valides` : Statut = "Validé"
- `refuses` : Statut = "Refusé"
- `comptes_crees` : compte_cree = true

---

## 🎨 Design

### Couleurs par statut
- 🟡 **En attente** : Jaune (#fff3cd)
- 🟢 **Validé** : Vert (#d4edda)
- 🔴 **Refusé** : Rouge (#f8d7da)
- 🔵 **Compte créé** : Bleu (#d4edda)

### Responsive
- Mobile : Tableau scrollable horizontal
- Tablet : Affichage optimisé
- Desktop : Vue complète

---

## 📁 Fichiers créés

```
backend/
├── app/
│   ├── Models/
│   │   └── Preinscription.php (nouveau)
│   └── Http/
│       └── Controllers/
│           └── PreinscriptionController.php (nouveau)
├── database/
│   └── migrations/
│       └── 2025_11_21_084954_create_preinscriptions_table.php (nouveau)
├── routes/
│   └── api.php (modifié)
└── .env (modifié)

frontend/
└── public/
    ├── admin/
    │   └── preinscriptions.html (nouveau)
    ├── scripts/
    │   └── admin-preinscriptions.js (nouveau)
    └── styles/
        └── admin.css (nouveau)

Racine/
├── INSTALLATION_PREINSCRIPTIONS.md (nouveau)
└── install-preinscriptions.sh (nouveau)
```

---

## 🚀 Prochaines étapes

Pour compléter la user story, il faudrait ajouter :
1. Page de détail d'un dossier
2. Actions Valider/Refuser
3. Création automatique de compte parent
4. Notifications email

---

## 📝 Notes techniques

- **Authentification** : Laravel Sanctum (token Bearer)
- **Tri** : Par statut (En attente → Validé → Refusé) puis par date décroissante
- **Sécurité** : Routes protégées, validation côté serveur
- **Performance** : Requêtes optimisées, pas de N+1
- **UX** : Feedback visuel, animations douces, responsive

---

## ✅ Critères d'acceptation

- [x] L'admin peut voir la liste des préinscriptions
- [x] Filtrage par statut (5 options)
- [x] Statistiques globales affichées
- [x] Tri automatique par priorité
- [x] Interface responsive
- [x] Sécurité : authentification requise
- [x] Performance : chargement rapide
- [x] Code maintenable et documenté

---

**Développé par Adel Abkar** - Projet Mon École et Moi
