#!/bin/bash
set -e

# ==============================================
# Script de Backup PostgreSQL - Mon École et Moi
# ==============================================
# Usage: ./scripts/backup-db.sh
# Crée un backup de la base de données PostgreSQL dans le dossier backups/

# Configuration
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="monecole-postgres-dev"
DB_NAME="monecole"
DB_USER="postgres"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Backup de la base de données PostgreSQL...${NC}"

# Vérifier que Docker est lancé
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: Docker n'est pas lancé${NC}"
    exit 1
fi

# Vérifier que le conteneur existe et est actif
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ Erreur: Le conteneur $CONTAINER_NAME n'est pas actif${NC}"
    echo "Démarrez-le avec: docker compose up -d"
    exit 1
fi

# Créer le dossier de backups s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Effectuer le backup
BACKUP_FILE="$BACKUP_DIR/backup_${DATE}.sql"
echo -e "${BLUE}📦 Création du backup dans: $BACKUP_FILE${NC}"

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Vérification du résultat
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup réussi !${NC}"
    echo -e "${GREEN}   Fichier: $BACKUP_FILE${NC}"
    echo -e "${GREEN}   Taille: $BACKUP_SIZE${NC}"
    
    # Garder seulement les 7 derniers backups
    echo -e "${BLUE}🧹 Nettoyage des anciens backups...${NC}"
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.sql 2>/dev/null | wc -l)
    
    if [ "$BACKUP_COUNT" -gt 7 ]; then
        ls -t "$BACKUP_DIR"/backup_*.sql | tail -n +8 | xargs rm -f
        DELETED=$((BACKUP_COUNT - 7))
        echo -e "${GREEN}   Supprimé: $DELETED ancien(s) backup(s)${NC}"
    fi
    
    echo -e "${GREEN}   Backups conservés: $(ls -1 "$BACKUP_DIR"/backup_*.sql 2>/dev/null | wc -l)${NC}"
else
    echo -e "${RED}❌ Erreur lors du backup${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Backup terminé avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"
