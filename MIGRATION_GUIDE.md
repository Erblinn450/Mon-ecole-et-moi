# Guide de Migration - Laravel vers Next.js/NestJS

## 📋 Vue d'ensemble

Ce document décrit la migration progressive de l'application Laravel existante vers la nouvelle stack Next.js + NestJS.

## 🏗️ Architecture

```
mon-ecole-et-moi/
├── [Laravel existant]     # Application actuelle (maintenue pendant transition)
├── frontend/              # Next.js 14 (nouvelle interface)
├── backend/               # NestJS (nouvelle API)
└── shared/                # Types TypeScript partagés
```

## ✅ État de la migration

### Frontend (Next.js)
- [x] Structure projet créée
- [x] Configuration Tailwind + shadcn/ui style
- [x] Page d'accueil
- [x] Page connexion
- [x] Formulaire préinscription multi-étapes
- [x] Composants UI de base
- [ ] Dashboard parent
- [ ] Dashboard admin
- [ ] Gestion repas/périscolaire
- [ ] Signature règlement
- [ ] PWA complète

### Backend (NestJS)
- [x] Structure projet créée
- [x] Schéma Prisma complet
- [x] Module Auth (JWT)
- [x] Module Users
- [x] Module Preinscriptions
- [x] Module Enfants
- [x] Module Repas
- [x] Module Periscolaire
- [x] Module Signatures
- [x] Module Facturation (structure)
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] Emails transactionnels
- [ ] Tâches planifiées (factures)

## 🚀 Démarrage rapide

### 1. Base de données PostgreSQL

```bash
# Avec Docker
docker run --name postgres-ecole -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mon_ecole_db -p 5432:5432 -d postgres:15

# Ou utiliser Supabase/Neon (gratuit)
```

### 2. Backend

```bash
cd backend
npm install

# Créer .env (voir backend/README.md)

# Générer Prisma et migrer
npm run prisma:generate
npm run prisma:migrate

# Démarrer
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install

# Créer .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

# Démarrer
npm run dev
```

## 🔄 Stratégie de migration des données

### Phase 1 : Coexistence
- Laravel continue de fonctionner sur MySQL
- NestJS utilise PostgreSQL
- Migration progressive des utilisateurs

### Phase 2 : Migration BDD
```sql
-- Script de migration MySQL -> PostgreSQL
-- À créer selon les données existantes
```

### Phase 3 : Basculement
- Rediriger le trafic vers la nouvelle stack
- Garder Laravel en backup
- Validation complète

## 📝 Correspondance des routes

| Laravel (actuel)         | NestJS (nouveau)              |
|-------------------------|------------------------------|
| POST /api/auth/login    | POST /api/auth/login         |
| GET /api/auth/user      | GET /api/auth/profile        |
| POST /api/preinscription| POST /api/preinscriptions    |
| GET /api/admin/preinscriptions | GET /api/preinscriptions |
| POST /api/repas         | POST /api/repas/commander    |
| DELETE /api/repas/{id}  | DELETE /api/repas/{id}       |

## 🎯 Prochaines étapes

1. **Installer les dépendances** : `npm install` dans frontend/ et backend/
2. **Configurer PostgreSQL** : Créer la base de données
3. **Migrer le schéma** : `npm run prisma:migrate`
4. **Tester les endpoints** : http://localhost:4000/api/docs
5. **Développer les pages** : Dashboard, repas, périscolaire...

## 💡 Notes importantes

- Le schéma Prisma correspond au schéma Laravel existant
- Les noms de tables utilisent des conventions PostgreSQL (snake_case)
- La logique métier (annulation 1 semaine, etc.) est préservée
- L'authentification reste compatible (mais JWT au lieu de Sanctum)

