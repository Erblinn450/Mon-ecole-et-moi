# Scripts d'Administration - Mon École et Moi

Ce dossier contient des scripts utilitaires pour la gestion de la base de données.

## 📦 Backup de la Base de Données

### Usage
```bash
./scripts/backup-db.sh
```

### Fonctionnement
- Crée un backup SQL de la base PostgreSQL
- Stocke le backup dans le dossier `backups/`
- Nom du fichier : `backup_YYYYMMDD_HHMMSS.sql`
- Garde automatiquement les 7 derniers backups
- Supprime les backups plus anciens

### Prérequis
- Docker doit être lancé
- Le conteneur `monecole-postgres-dev` doit être actif

---

## 🔄 Restauration de la Base de Données

### Usage
```bash
./scripts/restore-db.sh backups/backup_YYYYMMDD_HHMMSS.sql
```

### Fonctionnement
- Restaure la base de données à partir d'un fichier de backup
- ⚠️ **ATTENTION** : Cette opération écrase la base actuelle !
- Demande une confirmation avant de procéder

### Prérequis
- Docker doit être lancé
- Le conteneur `monecole-postgres-dev` doit être actif
- Le fichier de backup doit exister

---

## 🕐 Automatiser les Backups (Optionnel)

### Sur macOS/Linux avec cron

Ouvrir l'éditeur cron :
```bash
crontab -e
```

Ajouter cette ligne pour un backup quotidien à 3h du matin :
```cron
0 3 * * * cd /chemin/vers/Mon-ecole-et-moi && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

### Vérifier les cron jobs actifs
```bash
crontab -l
```

---

## 📁 Structure des Backups

```
Mon-ecole-et-moi/
├── backups/                    # Backups de la BDD
│   ├── backup_20260113_030000.sql
│   ├── backup_20260112_030000.sql
│   └── ...                     # (max 7 fichiers conservés)
└── scripts/
    ├── backup-db.sh            # Script de backup
    ├── restore-db.sh           # Script de restauration
    └── README.md               # Ce fichier
```

---

## ⚠️ Sécurité

- Les fichiers `.sql` sont automatiquement ignorés par Git (voir `.gitignore`)
- Ne partagez JAMAIS vos backups publiquement (contiennent des données sensibles)
- En production, stockez les backups sur un serveur distant sécurisé
