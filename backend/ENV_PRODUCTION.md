# Configuration Production - Variables d'environnement

## Base de données PostgreSQL
```
DATABASE_URL="postgresql://user:password@host:5432/monecole?schema=public"
```

## JWT
```
JWT_SECRET="CHANGEZ_CETTE_CLE_SECRETE_EN_PRODUCTION_MINIMUM_32_CARACTERES"
JWT_EXPIRES_IN="7d"
```

## Application
```
NODE_ENV=production
PORT=3001
```

## Configuration Email

### Option 1: SendGrid (recommandé)
```
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
MAIL_FROM="Mon École et Moi <noreply@mon-ecole-et-moi.fr>"
```

### Option 2: Mailgun
```
MAIL_PROVIDER=mailgun
MAILGUN_HOST=smtp.mailgun.org
MAILGUN_USER=postmaster@votre-domaine.mailgun.org
MAILGUN_PASSWORD=votre_mot_de_passe_mailgun
MAIL_FROM="Mon École et Moi <noreply@mon-ecole-et-moi.fr>"
```

### Option 3: SMTP Générique (OVH, Gmail, etc.)
```
MAIL_PROVIDER=smtp
MAIL_HOST=ssl0.ovh.net
MAIL_PORT=587
MAIL_USER=contact@mon-ecole-et-moi.fr
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM="Mon École et Moi <contact@mon-ecole-et-moi.fr>"
MAIL_TLS_REJECT_UNAUTHORIZED=true
```

### Option 4: MailHog (développement)
```
MAIL_PROVIDER=mailhog
MAIL_HOST=localhost
MAIL_PORT=1025
```

## reCAPTCHA (Google reCAPTCHA v3)
Obtenez vos clés sur: https://www.google.com/recaptcha/admin
```
RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Rate Limiting
```
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

## URL Frontend (pour les liens dans les emails)
```
FRONTEND_URL=https://mon-ecole-et-moi.fr
```

## Sécurité
```
# Activer les mots de passe aléatoires en production
USE_RANDOM_PASSWORD=true

# Activer la vérification d'email avant finalisation de la préinscription
REQUIRE_EMAIL_VERIFICATION=true
```

## Variables complètes pour .env (Production)

```env
# Base
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@host:5432/monecole?schema=public"

# JWT
JWT_SECRET="votre_cle_secrete_minimum_32_caracteres"
JWT_EXPIRES_IN="7d"

# Email (SendGrid)
MAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
MAIL_FROM="Mon École et Moi <noreply@mon-ecole-et-moi.fr>"

# reCAPTCHA
RECAPTCHA_SITE_KEY=6Lxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxx
RECAPTCHA_MIN_SCORE=0.5

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# URLs
FRONTEND_URL=https://mon-ecole-et-moi.fr

# Sécurité
USE_RANDOM_PASSWORD=true
REQUIRE_EMAIL_VERIFICATION=true
```
