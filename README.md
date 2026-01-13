# Mon École et Moi

Application de gestion scolaire pour école Montessori, développée avec une stack moderne **Next.js + NestJS**.

> **Note**: Ce projet a migré de Laravel vers l'architecture actuelle en janvier 2026. L'ancienne documentation Laravel est archivée dans `archive/docs-laravel/`.

---

## 🏗️ Architecture Technique

| Couche | Technologie | Port par défaut |
|--------|-------------|-----------------|
| **Frontend** | Next.js 14 (App Router) + Tailwind | `3000` |
| **Backend** | NestJS 10 + Prisma ORM | `3001` |
| **Base de données** | PostgreSQL 16 (via Docker) | `5432` |
| **Emails** | MailHog (via Docker) | `8025` (UI) / `1025` (SMTP) |

---

## 🚀 Guide de Démarrage Rapide

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Démarrer l'infrastructure (BDD + Mail)
```bash
# Lance PostgreSQL et MailHog en arrière-plan
docker compose up -d
```

### 2. Démarrer le Backend
```bash
cd backend
npm install
cp .env.example .env    # Vérifiez la config DB (monecole/postgres/postgres)
npx prisma generate     # Génère le client Prisma
npx prisma migrate deploy  # Applique les migrations en production
# OU en développement: npx prisma migrate dev
npm run start:dev
```
> API disponible sur : http://localhost:3001/api

### 3. Démarrer le Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
> Application disponible sur : http://localhost:3000

---

## 🔐 Identifiants de Test

Des comptes par défaut sont créés via le seed (si exécuté) ou peuvent être créés manuellement :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@ecole.fr` | `admin123` |
| **Parent** | `parent@test.fr` | `parent1234` |

---

## 📚 Documentation Détaillée

- **Frontend** : Voir [frontend/README.md](./frontend/README.md)
- **Backend** : Voir [backend/README.md](./backend/README.md)
- **État du projet** : Voir [RECAP_PROJET.md](./RECAP_PROJET.md)
- **Suivi Mémoire** : Voir [MEMOIRE_L3.md](./MEMOIRE_L3.md)

---

## 🛠️ Commandes Utiles

### Base de données
```bash
# Ouvrir Prisma Studio (interface graphique BDD)
cd backend && npx prisma studio

# Réinitialiser la BDD avec les données de test
cd backend && npx prisma migrate reset
```

### Docker
```bash
# Arrêter les conteneurs
docker compose down

# Voir les logs
docker compose logs -f
```
