# 🔧 Guide de résolution des problèmes de migrations

## Symptômes

- ❌ Erreur 500 lors de la soumission du formulaire de préinscription
- ❌ Erreur "Failed to open the referenced table 'utilisateurs'"
- ❌ Erreur "Can't DROP 'enfants_id_parent1_foreign'"
- ❌ Migrations qui échouent

## Cause

Suite à la migration de la table `utilisateurs` vers `users`, certaines migrations ont des dépendances incorrectes ou dans le mauvais ordre.

## Solution complète (à faire UNE SEULE FOIS)

### Étape 1 : Pull les dernières modifications

```bash
git pull origin develop
```

### Étape 2 : Reset complet de la base de données

**⚠️ ATTENTION : Cette opération supprime TOUTES les données de la base de données !**

```bash
docker compose exec app php artisan tinker --execute="
DB::statement('SET FOREIGN_KEY_CHECKS=0');
DB::statement('DROP TABLE IF EXISTS enfants, repas, preinscriptions, sessions, users, inscriptions, justificatifs, justificatifs_attendus, migrations, cache, cache_locks, jobs, job_batches, failed_jobs, personal_access_tokens');
DB::statement('SET FOREIGN_KEY_CHECKS=1');
echo 'Toutes les tables supprimées';
"
```

### Étape 3 : Relancer les migrations

```bash
docker compose exec app php artisan migrate
```

### Étape 4 : Vérifier que tout fonctionne

```bash
docker compose exec app php artisan migrate:status
```

Toutes les migrations doivent avoir le statut "Ran".

### Étape 5 : Recréer le compte admin

```bash
docker compose exec app php artisan tinker --execute="
App\Models\User::create([
    'name' => 'Admin',
    'email' => 'directrice',
    'password' => bcrypt('directrice'),
    'role' => 'admin',
    'actif' => true,
]);
echo 'Compte admin créé';
"
```

**Identifiants admin :**
- Email : `directrice`
- Mot de passe : `directrice`

---

## Vérifications post-migration

### 1. Tester le formulaire de préinscription

Aller sur http://localhost:8000/formulaire et soumettre un dossier.

✅ Le formulaire devrait se soumettre sans erreur 500.

### 2. Tester la connexion admin

Aller sur http://localhost:8000/login-admin et se connecter avec les identifiants ci-dessus.

---

## Fichier .env correct pour Docker

Vérifiez que votre `.env` contient bien :

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=mon_ecole_db
DB_USERNAME=admin
DB_PASSWORD=password123

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

**❌ Si vous avez `DB_HOST=127.0.0.1`**, c'est incorrect pour Docker ! Changez pour `DB_HOST=db`.

---

## En cas de problème persistant

1. **Arrêter et redémarrer Docker complètement :**
   ```bash
   docker compose down
   docker compose up -d
   ```

2. **Vider les caches Laravel :**
   ```bash
   docker compose exec app php artisan config:clear
   docker compose exec app php artisan cache:clear
   docker compose exec app php artisan route:clear
   ```

3. **Consulter les logs Laravel :**
   ```bash
   docker compose exec app cat storage/logs/laravel.log | tail -50
   ```

---

## Modifications apportées aux migrations

**Fichiers modifiés :**
- `0001_01_01_000004_create_enfants_table.php` : Renommé en `2025_12_06_000000_create_enfants_table.php` et corrigé les FK vers `users`
- `2025_12_05_000001_migrate_enfants_fk_to_users.php` : Supprimé (obsolète)

**Pourquoi ces changements :**
- La table `enfants` doit être créée APRÈS la table `users` (d'où le renommage)
- Les clés étrangères doivent pointer vers `users.id` et non `utilisateurs.id_utilisateur`
