#!/bin/bash
set -e

echo "🚀 Démarrage de Mon École et Moi en mode développement..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Lancer Docker (infrastructure uniquement)
echo -e "${BLUE}📦 Démarrage de l'infrastructure Docker (Postgres + MailHog)...${NC}"
docker compose up -d

# Attendre que Postgres soit prêt
echo -e "${BLUE}⏳ Attente de la base de données...${NC}"
until docker exec monecole-postgres-dev pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo -e "${GREEN}✅ Base de données prête${NC}"

# 2. Lancer le backend
echo -e "${BLUE}🔧 Démarrage du backend NestJS...${NC}"
cd backend
npm run build
PORT=3001 npm run start:dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo -e "${BLUE}⏳ Attente du backend...${NC}"
until curl -s http://localhost:3001/api/auth/profile > /dev/null 2>&1; do
  sleep 1
done
echo -e "${GREEN}✅ Backend prêt sur http://localhost:3001${NC}"

# 3. Lancer le frontend
echo -e "${BLUE}🎨 Démarrage du frontend Next.js...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend soit prêt
echo -e "${BLUE}⏳ Attente du frontend...${NC}"
sleep 5
echo -e "${GREEN}✅ Frontend prêt sur http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Environnement de développement prêt !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001/api"
echo "📚 Documentation API: http://localhost:3001/api/docs"
echo "📧 MailHog: http://localhost:8025"
echo ""
echo "Pour arrêter, appuyez sur Ctrl+C"
echo ""

# Attendre que l'utilisateur arrête les processus
wait $BACKEND_PID $FRONTEND_PID
