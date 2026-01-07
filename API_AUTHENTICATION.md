# API d'Authentification - Laravel Sanctum

## 🔐 Endpoints d'Authentification

### Base URL
```
http://localhost:8000/api
```

### Routes Publiques

#### Inscription
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Réponse (201) :**
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-11-19T10:00:00.000000Z",
    "updated_at": "2025-11-19T10:00:00.000000Z"
  },
  "token": "1|abc123..."
}
```

#### Connexion
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200) :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "2|def456..."
}
```

### Routes Protégées
*Nécessitent l'en-tête : `Authorization: Bearer {token}`*

#### Informations Utilisateur
```http
GET /auth/user
Authorization: Bearer {token}
```

**Réponse (200) :**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Déconnexion
```http
POST /auth/logout
Authorization: Bearer {token}
```

**Réponse (200) :**
```json
{
  "message": "Déconnexion réussie"
}
```

#### Révoquer Tous les Tokens
```http
POST /auth/revoke-all
Authorization: Bearer {token}
```

**Réponse (200) :**
```json
{
  "message": "Tous les tokens ont été révoqués"
}
```

## 🌐 Configuration CORS

L'API accepte les requêtes depuis :
- `http://localhost:3000` (Next.js dev)
- `http://127.0.0.1:3000`

## 🔧 Utilisation Frontend

### Service TypeScript
```typescript
import authService from '@/services/auth';

// Inscription
const response = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  password_confirmation: 'password123'
});

// Connexion
const response = await authService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Déconnexion
await authService.logout();
```

### Hook React
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { login, user, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    await login({
      email: 'john@example.com',
      password: 'password123'
    });
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Connecté en tant que {user?.name}</p>
      ) : (
        <button onClick={handleLogin}>Se connecter</button>
      )}
    </div>
  );
}
```

## 🛡️ Sécurité

- **Tokens** : Stockés dans localStorage côté client
- **CORS** : Configuré pour les domaines autorisés
- **Validation** : Données d'entrée validées
- **Hash** : Mots de passe hashés avec bcrypt
