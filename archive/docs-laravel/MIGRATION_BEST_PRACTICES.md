# Bonnes pratiques pour les migrations

## ✅ À FAIRE

### 1. Nommer les migrations avec des dates

```bash
# ✅ BON
2025_12_05_create_users_table.php
2025_12_06_create_enfants_table.php  # Créé APRÈS users

# ❌ MAUVAIS  
0001_create_users_table.php
0002_create_enfants_table.php  # Risque de conflit d'ordre
```

### 2. Toujours définir `down()` pour permettre le rollback

```php
public function down(): void
{
    Schema::dropIfExists('ma_table');
}
```

### 3. Utiliser des contraintes de clés étrangères cohérentes

```php
// ✅ BON - Référence la bonne table
$table->foreignId('user_id')
    ->constrained('users', 'id')
    ->onDelete('cascade');

// ❌ MAUVAIS - Référence une table obsolète
$table->foreignId('user_id')
    ->constrained('utilisateurs', 'id_utilisateur');
```

### 4. Ordre des migrations important !

Les tables avec clés étrangères doivent être créées APRÈS les tables qu'elles référencent :

```
1. users (aucune dépendance)
2. preinscriptions (aucune dépendance)
3. enfants (dépend de users) ← Doit venir APRÈS
4. repas (dépend de enfants)
```

### 5. Tester les migrations avant de commit

```bash
# Reset et test
./reset-db.sh

# Ou manuellement
docker compose exec app php artisan migrate:fresh --seed
```

## ❌ À ÉVITER

1. ❌ Ne jamais modifier une migration déjà pushée et exécutée par l'équipe
2. ❌ Ne pas utiliser `migrate:fresh` en production
3. ❌ Ne pas oublier d'ajouter les nouveaux champs dans `$fillable`

## 🛠️ Commandes utiles

```bash
# Voir l'état des migrations
docker compose exec app php artisan migrate:status

# Créer une nouvelle migration
docker compose exec app php artisan make:migration create_ma_table

# Rollback la dernière batch
docker compose exec app php artisan migrate:rollback

# Reset complet (utiliser le script)
./reset-db.sh
```

## 🚨 En cas de problème

1. **Ne pas paniquer** 
2. Consulter `MIGRATION_FIX.md`
3. Exécuter `./reset-db.sh` (demande confirmation)
4. Si le problème persiste, prévenir l'équipe

## 📝 Workflow recommandé

1. Créer la migration
2. Tester localement avec `migrate:fresh`
3. Vérifier que le rollback fonctionne
4. Commit et push
5. L'équipe exécute `./reset-db.sh` pour synchroniser
