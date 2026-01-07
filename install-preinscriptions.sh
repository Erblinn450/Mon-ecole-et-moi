#!/bin/bash

echo "================================================"
echo "   Installation MySQL pour Mon École et Moi"
echo "================================================"
echo ""

# Vérifier si MySQL est déjà installé
if command -v mysql &> /dev/null; then
    echo "✅ MySQL est déjà installé"
    mysql --version
else
    echo "📦 Installation de MySQL Server..."
    sudo apt update
    sudo apt install mysql-server -y
    
    echo "🚀 Démarrage du service MySQL..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    echo "✅ MySQL installé et démarré avec succès!"
fi

echo ""
echo "📊 Création de la base de données..."

# Créer la base de données
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mon_ecole_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Base de données 'mon_ecole_db' créée avec succès!"
else
    echo "⚠️  Base de données existe déjà ou erreur de création"
fi

echo ""
echo "🔄 Exécution des migrations Laravel..."
cd /home/adel/Documents/PROJET/mon-ecole-et-moi/backend
php artisan migrate --force

echo ""
echo "================================================"
echo "   ✅ Installation terminée!"
echo "================================================"
echo ""
echo "Prochaines étapes :"
echo "1. Ajouter des données de test : php artisan tinker"
echo "2. Démarrer le backend : php artisan serve"
echo "3. Démarrer le frontend : cd ../frontend && npm run dev"
echo "4. Accéder à : http://localhost:3000/admin/preinscriptions.html"
echo ""
