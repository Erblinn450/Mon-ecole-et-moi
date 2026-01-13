# 🚀 Démarrage Rapide du Projet

## Prérequis
- Docker Desktop installé et lancé
- Node.js 18+ installé
- npm installé

## Lancer TOUT le projet en UNE commande

```bash
./start-dev.sh
```

Ce script va :
1. ✅ Lancer PostgreSQL et MailHog avec Docker
2. ✅ Builder et lancer le backend NestJS (port 3001)
3. ✅ Lancer le frontend Next.js (port 3000)
4. ✅ Attendre que tout soit prêt

## URLs
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **Documentation API** : http://localhost:3001/api/docs
- **MailHog (emails)** : http://localhost:8025

## Arrêter tout
Appuyez sur `Ctrl + C` dans le terminal

## Alternative : Lancer manuellement

### 1. Infrastructure Docker uniquement
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
npm run build
PORT=3001 npm run start:dev
```

### 3. Frontend (dans un autre terminal)
```bash
cd frontend
npm run dev
```

## Test rapide de l'API

```bash
curl -X POST http://localhost:3001/api/preinscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "nomEnfant": "Test",
    "prenomEnfant": "Alice",
    "dateNaissance": "2020-03-15",
    "nomParent": "Durand",
    "prenomParent": "Pierre",
    "emailParent": "test@example.com",
    "telephoneParent": "0601020304",
    "classeSouhaitee": "MATERNELLE",
    "dateIntegration": "2025-09-01"
  }'
```

## Problèmes connus résolus

✅ **Templates emails** : Maintenant copiés automatiquement lors du build grâce à la correction de `nest-cli.json`
✅ **Port 3001** : Configuration propre du backend
✅ **Base de données** : PostgreSQL via Docker avec healthcheck
