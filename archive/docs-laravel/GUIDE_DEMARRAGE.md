# 🚀 Guide de Démarrage Rapide - Mon École et Moi

## Pour les Nouveaux Développeurs

### ⚡ Démarrage Express (3 minutes)

```bash
# 1. Cloner le projet
git clone https://git.uha4point0.fr/UHA40/mon-ecole-et-moi.git
cd mon-ecole-et-moi

# 2. Installation Laravel
composer install

# 3. Configuration base de données
cp .env.example .env
# Éditer .env avec vos paramètres MySQL

# 4. Générer la clé et migrer
php artisan key:generate
php artisan migrate

# 5. Lancer l'application
php artisan serve
```

**🎉 C'est prêt !**
- **Application complète** : http://localhost:8000 (Frontend + Backend Laravel)
- **Formulaire** : http://localhost:8000/formulaire
- **Admin** : http://localhost:8000/admin
- **API** : http://localhost:8000/api
- **Base de données** : http://localhost/phpmyadmin/ (admin/password123)

---

## 🔧 Configuration Détaillée

### Prérequis Système

#### Si `composer install` échoue :
```bash
# Installer PHP et extensions
sudo apt install php8.3 php8.3-mysql php8.3-xml php8.3-dom composer

# Puis relancer
composer install
```

#### Configuration Base de Données :

**Créer votre base MySQL :**
1. **Démarrer MySQL** : `sudo systemctl start mysql`
2. **Se connecter** : `mysql -u root -p`
3. **Créer la base** : `CREATE DATABASE mon_ecole_et_moi;`
4. **Configurer .env** avec vos paramètres :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mon_ecole_et_moi
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### Architecture Laravel Complète

**Structure du projet :**
```
mon-ecole-et-moi/
├── app/
│   ├── Http/Controllers/    # Contrôleurs API et Web
│   └── Models/             # Modèles Eloquent
├── resources/views/        # Templates Blade (19 pages)
├── public/                 # Assets CSS, JS, Images
├── routes/
│   ├── web.php            # Routes pages web
│   └── api.php            # Routes API
└── database/migrations/   # Migrations BDD
```

---

## 🎯 Rôles par Équipe

### 👨‍💻 Développeur Backend
**Votre mission :**
- Configurer votre base de données MySQL
- Créer les migrations et modèles
- Développer les API dans `app/Http/Controllers/`
- Créer les vues Blade dans `resources/views/`

**Commandes utiles :**
```bash
php artisan make:migration create_nom_table
php artisan make:model NomModel
php artisan make:controller NomController
php artisan migrate
```

### 🎨 Développeurs Frontend
**Votre mission :**
- Modifier les vues Blade dans `resources/views/`
- Améliorer le CSS dans `public/css/`
- Développer le JavaScript dans `public/js/`
- Intégrer avec l'API Laravel

**Structure Frontend :**
```
resources/views/           # Templates Blade
public/css/               # Styles CSS
public/js/                # Scripts JavaScript
public/images/            # Images et assets
```

### 🧪 QA
**Votre mission :**
- Tester les fonctionnalités sur http://localhost:8000
- Vérifier la cohérence UI/UX
- Reporter les bugs dans Jira

---

## 🚨 Problèmes Courants

### ❌ "Port 8000 already in use"
```bash
# Trouver le processus
sudo lsof -i :8000
# Tuer le processus
sudo kill -9 [PID]
# Ou utiliser un autre port
php artisan serve --port=8001
```

### ❌ "Application Laravel ne démarre pas"
```bash
# Vérifier les dépendances
composer install

# Nettoyer le cache
php artisan config:clear
php artisan cache:clear

# Vérifier les permissions
chmod -R 775 storage bootstrap/cache
```

### ❌ "SQLSTATE[HY000] [2002] Connection refused"
```bash
# Démarrer MySQL
sudo systemctl start mysql
# Vérifier la connexion
mysql -u root -p
```

### Base de données
```bash
# Démarrer MySQL
sudo systemctl start mysql

# Vérifier la connexion
mysql -u root -p
```

### 🌐 Interface Web phpMyAdmin
**URL** : http://localhost/phpmyadmin/

**⚠️ PRÉREQUIS** : Apache + phpMyAdmin doivent être installés !

**Installation phpMyAdmin :**
```bash
# 1. Installer Apache + phpMyAdmin
sudo apt install apache2 php8.3 libapache2-mod-php8.3 phpmyadmin -y
sudo ln -s /etc/phpmyadmin/apache.conf /etc/apache2/conf-available/phpmyadmin.conf
sudo a2enconf phpmyadmin
sudo systemctl reload apache2

# 2. Configurer MySQL (OBLIGATOIRE)
./setup-mysql.sh
# Le script vous demandera de saisir un mot de passe sécurisé
```

**Ou manuellement :**
```bash
sudo mysql -e "CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"
```

**Identifiants phpMyAdmin :**
- **Utilisateur** : `admin` / **Mot de passe** : `password123`
- **Ou utilisateur** : `root` / **Mot de passe** : (vide)

### ❌ "Class 'Laravel\Sanctum\...' not found"
```bash
# Installer Sanctum (sera fait plus tard)
composer require laravel/sanctum
```

---

## 📞 Aide et Support

### 🆘 En cas de problème :
1. **Vérifier les prérequis** (PHP, Composer, MySQL)
2. **Consulter ce guide**
3. **Demander au Tech Lead**
4. **Créer un ticket Jira** si c'est un bug

### 📚 Documentation :
- **Laravel** : https://laravel.com/docs
- **Blade Templates** : https://laravel.com/docs/blade
- **Eloquent ORM** : https://laravel.com/docs/eloquent

### 🔗 URLs Importantes :
- **Application** : http://localhost:8000
- **Formulaire** : http://localhost:8000/formulaire
- **Admin** : http://localhost:8000/admin
- **API Test** : http://localhost:8000/api/test
- **GitLab** : https://git.uha4point0.fr/UHA40/mon-ecole-et-moi

---

## ✅ Checklist Premier Lancement

- [ ] Projet cloné
- [ ] Laravel : `composer install` ✓
- [ ] Configuration : `.env` configuré ✓
- [ ] Base de données : `php artisan migrate` ✓
- [ ] Serveur : `php artisan serve` ✓
- [ ] Page http://localhost:8000 s'affiche ✓
- [ ] Formulaire http://localhost:8000/formulaire fonctionne ✓
- [ ] API http://localhost:8000/api/test répond ✓

**🎉 Vous êtes prêts à développer !**
