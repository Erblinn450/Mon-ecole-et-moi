# Mon École et Moi

Application de gestion scolaire pour école Montessori (Laravel + Blade + MySQL).

## 🔌 Ports & URLs par défaut
- Application web + API : http://localhost:8000
- Formulaire : http://localhost:8000/formulaire
- Admin : http://localhost:8000/admin
- API : http://localhost:8000/api
- MySQL (Docker) : `localhost:3307` (int. 3306) — utilisateur `admin` / mdp `password123` / base `mon_ecole_db`
- PhpMyAdmin (Docker) : http://localhost:8081 (host `db`, user `admin`, mdp `password123`)

## 🐳 Démarrage avec Docker (recommandé)
**Prérequis :** Docker + Docker Compose.

1) (Optionnel) Adapter `.env.docker` si vous changez la BDD ou l’URL.
2) Construire les images :
```bash
docker compose build
```
3) Démarrer les services :
```bash
docker compose up -d
```
4) Lancer les migrations une fois MySQL healthy (inclut la table `sessions` utilisée par le formulaire) :
```bash
docker compose exec app php artisan migrate --force
```
5) Vérifier :
   - App : http://localhost:8000
   - PhpMyAdmin : http://localhost:8081 (host `db`)
   - MySQL depuis l’hôte : `mysql -h 127.0.0.1 -P 3307 -u admin -p password123 mon_ecole_db`
6) Arrêter :
```bash
docker compose down
```
Notes :
- Les volumes `storage` et `bootstrap/cache` sont persistés.
- Si 8000/8081/3307 sont pris, modifiez les ports dans `docker-compose.yml` puis relancez `build` + `up -d`.

## 💻 Démarrage local (sans Docker)
**Prérequis :** PHP 8.3+, Composer, MySQL (ou MariaDB).

1) Cloner le dépôt :
```bash
git clone https://git.uha4point0.fr/UHA40/mon-ecole-et-moi.git
cd mon-ecole-et-moi
```
2) Installer les dépendances PHP :
```bash
composer install
```
3) Copier et éditer l’environnement :
```bash
cp .env.example .env
```
   - Par défaut, `.env` est en SQLite : créez le fichier si besoin :
     ```bash
     touch database/database.sqlite
     ```
   - Si vous préférez MySQL, remplacez `DB_CONNECTION` et renseignez `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=mon_ecole_et_moi`, `DB_USERNAME=root`, `DB_PASSWORD=...`.
4) Générer la clé :
```bash
php artisan key:generate
```
5) Créer la base (si besoin) et migrer :
```bash
# Si MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mon_ecole_et_moi;"

# Migrations (crée aussi la table sessions pour le formulaire)
php artisan migrate
```
6) Lancer l’app :
```bash
php artisan serve --port=8000
```
7) Vérifier : http://localhost:8000 (formulaire, admin, API sur le même port).

> Les assets sont déjà servis depuis `public/` (pas de build front nécessaire dans l’état actuel).

## 🔐 Authentification

L'application utilise **Laravel Sanctum** pour l'authentification API.

**Endpoints disponibles :**
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/user` - Infos utilisateur (protégé)
- `POST /api/auth/logout` - Déconnexion (protégé)

📖 **Documentation complète :** [API_AUTHENTICATION.md](./API_AUTHENTICATION.md)

## Architecture

- **Backend + Frontend** : Laravel avec Blade Templates + MySQL
- **Assets** : CSS, JavaScript, Images dans public/
- **Authentification** : Laravel Sanctum
- **Pages** : 19 vues Blade disponibles (/formulaire, /admin, /connexion, etc.)

## 🚨 Problèmes Courants

### Backend ne démarre pas
```bash
# Vérifier PHP et extensions
php --version
php -m | grep mysql

# Réinstaller si nécessaire
sudo apt install php8.3 php8.3-mysql php8.3-xml composer
```

### Application Laravel ne démarre pas
```bash
# Vérifier les dépendances
composer install

# Vérifier la configuration
php artisan config:clear
php artisan cache:clear

# Vérifier les permissions
chmod -R 775 storage bootstrap/cache
```

### Base de données
```bash
# Local : démarrer MySQL
sudo systemctl start mysql

# Docker : vérifier l'état du conteneur
docker compose ps db
# Tester la connexion depuis l'hôte (ports docker)
mysql -h 127.0.0.1 -P 3307 -u admin -p password123 mon_ecole_db
```

## 📚 Documentation Complète

➡️ **Voir [API_AUTHENTICATION.md](./API_AUTHENTICATION.md) pour l'authentification**
➡️ **Voir [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) pour les instructions détaillées**

## Conventions Git

- Branches : `feature/MON-XX-description`
- Commits : `[MON-XX] type: description`

## Équipe

- Tech Lead : Erblin
- Backend : Laravel + Sanctum
- Frontend : Blade Templates + CSS/JS
- QA : Tests manuels + Feature tests
