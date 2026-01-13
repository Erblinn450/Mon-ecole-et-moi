#!/bin/bash

# Configuration
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="monecole-postgres-dev"
DB_NAME="monecole"
DB_USER="postgres"

# Créer le dossier de backups
mkdir -p $BACKUP_DIR

# Backup
echo "🔄 Backup de la base de données..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/backup_${DATE}.sql"

# Vérification
if [ $? -eq 0 ]; then
    echo "✅ Backup réussi : $BACKUP_DIR/backup_${DATE}.sql"
    
    # Garder seulement les 7 derniers backups
    ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs rm -f 2>/dev/null
    echo "🧹 Anciens backups nettoyés (gardé les 7 derniers)"
else
    echo "❌ Erreur lors du backup"
    exit 1
fi
