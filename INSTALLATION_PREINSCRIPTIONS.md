# Installation et Configuration - Préinscriptions Admin

## ✅ BACKEND - Déjà fait

### Fichiers créés :

- ✅ Modèle : `app/Models/Preinscription.php`
- ✅ Migration : `database/migrations/2025_11_21_084954_create_preinscriptions_table.php`
- ✅ Contrôleur : `app/Http/Controllers/PreinscriptionController.php`
- ✅ Routes : Ajoutées dans `routes/api.php`

### Configuration :

- ✅ Fichier `.env` créé avec MySQL
- ✅ Clé d'application générée

---

## 🔧 ÉTAPE 1 : Installer MySQL

```bash
# Installer MySQL Server
sudo apt update
sudo apt install mysql-server -y

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser MySQL (optionnel)
sudo mysql_secure_installation
```

---

## 🔧 ÉTAPE 2 : Créer la base de données

```bash
# Se connecter à MySQL
sudo mysql -u root

# Dans MySQL, exécuter :
CREATE DATABASE mon_ecole_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## 🔧 ÉTAPE 3 : Exécuter les migrations

```bash
cd /home/adel/Documents/PROJET/mon-ecole-et-moi/backend
php artisan migrate
```

---

## 🔧 ÉTAPE 4 : Ajouter des données de test

```bash
# Lancer Tinker
php artisan tinker
```

Puis copier-coller ce code :

```php
// Données de test
Preinscription::create([
    'numero_dossier' => 'DOSS-2025-001',
    'nom_enfant' => 'Dupont',
    'prenom_enfant' => 'Marie',
    'date_naissance' => '2018-05-15',
    'classe_souhaitee' => 'CP',
    'nom_parent' => 'Dupont',
    'prenom_parent' => 'Jean',
    'email_parent' => 'jean.dupont@email.com',
    'telephone_parent' => '0601020304',
    'date_integration' => '2025-09-01',
    'date_demande' => now(),
    'statut' => 'En attente'
]);

Preinscription::create([
    'numero_dossier' => 'DOSS-2025-002',
    'nom_enfant' => 'Martin',
    'prenom_enfant' => 'Lucas',
    'date_naissance' => '2017-08-20',
    'classe_souhaitee' => 'CE1',
    'nom_parent' => 'Martin',
    'prenom_parent' => 'Sophie',
    'email_parent' => 'sophie.martin@email.com',
    'telephone_parent' => '0612345678',
    'date_integration' => '2025-09-01',
    'date_demande' => now(),
    'statut' => 'Validé',
    'compte_cree' => true
]);

Preinscription::create([
    'numero_dossier' => 'DOSS-2025-003',
    'nom_enfant' => 'Bernard',
    'prenom_enfant' => 'Emma',
    'date_naissance' => '2019-03-10',
    'classe_souhaitee' => 'PS',
    'nom_parent' => 'Bernard',
    'prenom_parent' => 'Pierre',
    'email_parent' => 'pierre.bernard@email.com',
    'telephone_parent' => '0623456789',
    'date_integration' => '2025-09-01',
    'date_demande' => now(),
    'statut' => 'Refusé',
    'commentaire_refus' => 'Places complètes pour cette classe'
]);

Preinscription::create([
    'numero_dossier' => 'DOSS-2025-004',
    'nom_enfant' => 'Petit',
    'prenom_enfant' => 'Hugo',
    'date_naissance' => '2015-11-05',
    'classe_souhaitee' => '6ème',
    'nom_parent' => 'Petit',
    'prenom_parent' => 'Claire',
    'email_parent' => 'claire.petit@email.com',
    'telephone_parent' => '0634567890',
    'date_integration' => '2025-09-01',
    'date_demande' => now(),
    'statut' => 'En attente'
]);

Preinscription::create([
    'numero_dossier' => 'DOSS-2025-005',
    'nom_enfant' => 'Durand',
    'prenom_enfant' => 'Léa',
    'date_naissance' => '2016-07-22',
    'classe_souhaitee' => 'CM1',
    'nom_parent' => 'Durand',
    'prenom_parent' => 'Marc',
    'email_parent' => 'marc.durand@email.com',
    'telephone_parent' => '0645678901',
    'date_integration' => '2025-09-01',
    'date_demande' => now(),
    'statut' => 'Validé',
    'compte_cree' => true
]);

echo "✅ 5 préinscriptions créées avec succès!";
```

Taper `exit` pour quitter Tinker.

---

## 🚀 ÉTAPE 5 : Démarrer les serveurs

### Terminal 1 - Backend Laravel

```bash
cd /home/adel/Documents/PROJET/mon-ecole-et-moi/backend
php artisan serve
```

### Terminal 2 - Frontend Next.js

```bash
cd /home/adel/Documents/PROJET/mon-ecole-et-moi/frontend
npm run dev
```

---

## 🧪 ÉTAPE 6 : Tester l'API

### Test sans authentification (va échouer normalement)

```bash
curl http://localhost:8000/api/preinscriptions
```

### Pour tester avec un token (après connexion)

```bash
# D'abord se connecter pour obtenir un token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecole.com","password":"admin123"}'

# Utiliser le token retourné
curl http://localhost:8000/api/preinscriptions \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 🌐 ÉTAPE 7 : Accéder à la page

Ouvrir dans le navigateur :

```
http://localhost:3000/admin/preinscriptions.html
```

**Note** : Tu devras d'abord te connecter avec un compte admin pour obtenir un token.

---

## 📊 Filtres disponibles

La page permet de filtrer par :

- **Tous** : Tous les dossiers
- **En attente** : Dossiers non traités (par défaut)
- **Validés** : Dossiers acceptés
- **Refusés** : Dossiers rejetés
- **Comptes créés** : Dossiers avec compte parent actif

---

## 🎯 Endpoints API créés

| Méthode | URL                                         | Description                      |
| ------- | ------------------------------------------- | -------------------------------- |
| GET     | `/api/preinscriptions`                      | Liste toutes les préinscriptions |
| GET     | `/api/preinscriptions?filtre=en_attente`    | Filtre : En attente              |
| GET     | `/api/preinscriptions?filtre=valides`       | Filtre : Validés                 |
| GET     | `/api/preinscriptions?filtre=refuses`       | Filtre : Refusés                 |
| GET     | `/api/preinscriptions?filtre=comptes_crees` | Filtre : Comptes créés           |
| GET     | `/api/preinscriptions/{id}`                 | Détail d'une préinscription      |

---

## ✅ RÉSUMÉ

**Backend (Laravel) :**

- Modèle Preinscription avec 13 champs
- Contrôleur avec filtres (5 options)
- Routes API protégées par Sanctum
- Migration prête

**Frontend (HTML/CSS/JS) :**

- Page responsive avec tableau
- 5 filtres fonctionnels
- Statistiques en temps réel
- Design moderne

**Prochaine étape :**

- Créer la page de détail (`dossier-detail.html`)
- Ajouter les actions Valider/Refuser
