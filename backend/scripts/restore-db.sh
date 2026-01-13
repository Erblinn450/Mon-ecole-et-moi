#!/bin/bash
set -e

# ==============================================
# Script de Restauration PostgreSQL - Mon École et Moi
# ==============================================
# Usage: ./scripts/restore-db.sh [fichier_backup.sql]
# Restaure la base de données à partir d'un fichier de backup

# Configuration
CONTAINER_NAME="monecole-postgres-dev"
DB_NAME="monecole"
DB_USER="postgres"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <fichier_backup.sql>${NC}"
    echo ""
    echo "Backups disponibles dans backups/:"
    ls -lht backups/backup_*.sql 2>/dev/null | head -10 || echo "Aucun backup trouvé"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Erreur: Le fichier $BACKUP_FILE n'existe pas${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle !${NC}"
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non): " -r
if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
    echo "Restauration annulée."
    exit 0
fi

echo -e "${BLUE}🔄 Restauration de la base de données...${NC}"

# Vérifier que Docker est lancé
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: Docker n'est pas lancé${NC}"
    exit 1
fi

# Vérifier que le conteneur existe
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ Erreur: Le conteneur $CONTAINER_NAME n'est pas actif${NC}"
    exit 1
fi

# Restaurer la base de données
echo -e "${BLUE}📦 Restauration depuis: $BACKUP_FILE${NC}"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Restauration réussie !${NC}"
else
    echo -e "${RED}❌ Erreur lors de la restauration${NC}"
    exit 1
fi
