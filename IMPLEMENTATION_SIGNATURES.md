# ✍️ Système de Signature du Réglement Intérieur

## 📋 Récapitulatif des modifications

### 1. **Base de données**

**Migration** : `/database/migrations/2025_12_10_000000_create_signature_reglements_table.php`

Nouvelle table `signature_reglements` avec :
- `enfant_id` : Référence à l'enfant
- `parent_id` : Référence au parent (User)
- `parent_accepte` : Boolean - Parent a signé
- `enfant_accepte` : Boolean - Enfant a signé
- `parent_date_signature` : DateTime
- `enfant_date_signature` : DateTime
- `parent_ip_adresse` : Adresse IP du parent
- `enfant_ip_adresse` : Adresse IP (enregistrement depuis)
- Et autres métadonnées

### 2. **Backend - Modèle**

**Fichier** : `/app/Models/SignatureReglement.php`

```php
class SignatureReglement extends Model {
    public function isFullySigned(): bool
    public function getStatus(): string
}
```

### 3. **Backend - Contrôleur**

**Fichier** : `/app/Http/Controllers/SignatureController.php`

Endpoints :
- `POST /api/signatures/parent-accepte` - Parent signe
- `POST /api/signatures/enfant-accepte` - Enfant signe
- `GET /api/signatures/enfant/{enfantId}` - Vérifier le statut
- `GET /api/signatures/mes-signatures` - Lister les signatures
- `DELETE /api/signatures/{id}` - Supprimer une signature

### 4. **Backend - Routes**

**Fichier** : `/routes/api.php`

```php
Route::prefix('signatures')->group(function () {
    Route::post('/parent-accepte', [SignatureController::class, 'parentAccepte']);
    Route::post('/enfant-accepte', [SignatureController::class, 'enfantAccepte']);
    Route::get('/enfant/{enfantId}', [SignatureController::class, 'getSignatureStatus']);
    Route::get('/mes-signatures', [SignatureController::class, 'mesSignatures']);
    Route::delete('/{id}', [SignatureController::class, 'destroy']);
});
```

### 5. **Frontend - Service**

**Fichier** : `/public/js/signature-service.js`

Classe `SignatureService` avec méthodes :
- `getSignatureStatus(enfantId, token)`
- `parentAccepte(enfantId, token, notes)`
- `enfantAccepte(enfantId, token, enfantAge, notes)`
- `mesSignatures(token)`

### 6. **Frontend - Vue**

**Fichier** : `/resources/views/mes-dossiers.blade.php`

Modal avec :
- Section parent avec checkbox
- Section enfant avec checkbox et champ âge
- Styles CSS intégrés
- Import du service JavaScript

### 7. **Frontend - JavaScript**

**Fichier** : `/public/js/mes-dossiers.js`

Ajout des fonctions :
- `ouvrirModalSignature(enfantId, enfantName)`
- `fermerModalSignature()`
- `signerParent()`
- `signerEnfant()`

Bouton visible quand dossier est "Validé"

---

## 🎯 Flux utilisateur

```
Parent connecté
    ↓
Page "Mes dossiers"
    ↓
Dossier Validé
    ↓
Voir le bouton "✍️ Signer le réglement"
    ↓
Clic → Modal s'ouvre
    ↓
Parent remplit son nom + checkbox ✓
    ↓
Clic "Valider signature parent"
    ↓
API POST /api/signatures/parent-accepte
    ↓
Base de données enregistre la signature
    ↓
Enfant remplit son age + checkbox ✓
    ↓
Clic "Valider signature enfant"
    ↓
API POST /api/signatures/enfant-accepte
    ↓
Base de données enregistre
    ↓
✅ Signatures complètes!
```

---

## 📊 Structure de données

### Table `signature_reglements`

| Colonne | Type | Description |
|---------|------|-------------|
| id | id | Clé primaire |
| enfant_id | FK | Enfant concerné |
| parent_id | FK | Parent signant |
| parent_name | string | Nom du parent |
| parent_email | string | Email du parent |
| enfant_name | string | Nom de l'enfant |
| parent_accepte | boolean | Parent a signé |
| enfant_accepte | boolean | Enfant a signé |
| parent_date_signature | datetime | Quand parent a signé |
| enfant_date_signature | datetime | Quand enfant a signé |
| parent_ip_adresse | string | IP du parent |
| enfant_ip_adresse | string | IP lors signature |
| notes | text | Commentaires |
| created_at | timestamp | Date création |
| updated_at | timestamp | Dernière modification |

---

## 🚀 Utilisation

### 1. Exécuter la migration

```bash
docker compose exec app php artisan migrate --force
```

### 2. Tester

1. Allez sur `/mes-dossiers`
2. Cliquez sur "✍️ Signer le réglement" pour un dossier validé
3. Remplissez le formulaire
4. Valider

### 3. Vérifier en base

```bash
docker compose exec app php artisan tinker
```

```php
>>> \App\Models\SignatureReglement::all();
>>> \App\Models\SignatureReglement::where('enfant_id', 1)->first();
```

---

## 🔐 Sécurité

✅ **Authentification** : Toutes les routes nécessitent un token
✅ **Validation** : Vérification que le parent accède uniquement à ses enfants
✅ **Enregistrement** : IP et timestamp de chaque action
✅ **Immuabilité** : Les dates de signature ne changent pas

---

## 📱 Points importants

- Parent et enfant doivent signer séparément
- Signature parent possible d'abord
- Signature enfant suppose que parent a accepté (ou non)
- Age de l'enfant enregistré lors de sa signature
- Statut mixte possible (parent signé, enfant non, etc.)

---

## ✨ Évolutions futures

- [ ] Signature électronique avec canvas (dessin)
- [ ] Envoi d'email de confirmation
- [ ] Attestation PDF téléchargeable
- [ ] Historique des signatures
- [ ] Rappels d'signature non faites
- [ ] Intégration avec les justificatifs attendus

---

**Date** : 10 décembre 2025
**Statut** : ✅ Implémenté
