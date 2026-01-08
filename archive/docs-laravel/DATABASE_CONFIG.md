# Configuration Base de Données - Mon École et Moi

## Variables d'Environnement (.env)

Le fichier `.env` est configuré pour MySQL avec les paramètres par défaut :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

## Pour le Collègue BDD

### À Faire :
1. **Créer votre base de données** avec le nom souhaité
2. **Modifier le .env** avec vos paramètres :
   - `DB_DATABASE=votre_nom_de_bdd`
   - `DB_USERNAME=votre_utilisateur`
   - `DB_PASSWORD=votre_mot_de_passe`

### Commandes Laravel Disponibles :
```bash
# Créer une migration
php artisan make:migration create_nom_table

# Exécuter les migrations
php artisan migrate

# Créer un modèle avec migration
php artisan make:model NomModel -m

# Rollback migrations
php artisan migrate:rollback
```

### Structure Actuelle :
- ✅ Laravel configuré pour MySQL
- ✅ Drivers MySQL installés
- ✅ Modèles de base créés (User, Inscription, Facture, etc.)
- ⏳ Schéma BDD à définir par vous

## Test de Connexion

Pour tester la connexion une fois votre BDD créée :
```bash
php artisan migrate:status
```
