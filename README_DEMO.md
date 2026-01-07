# 🔑 Identifiants de Démonstration

## Pour la Présentation Client

### 👨‍👩‍👧‍👦 Compte Parent

- **Page** : `connexion.html`
- **Email** : `parent@test.com`
- **Mot de passe** : `test123`
- **Enfants** :
  - Lucas Martin (PS)
  - Emma Martin (CP)
  - Tom Martin (6ème)

### 👩‍💼 Compte Admin

- **Page** : `login.html`
- **Email** : `directrice@test.fr`
- **Mot de passe** : `directrice`

---

## 📊 Générer les Données de Démonstration

1. **Ouvrir** : `generer-demo.html`
2. **Cliquer** : "🚀 Générer les données de démonstration"
3. **Résultat** :
   - 12 préinscriptions
   - 11 comptes parents
   - 23 enfants (3 pour parent@test.com + 20 autres)
   - ~200-300 commandes de repas/périscolaire

---

## 🎯 Workflow de Test

### Scénario Parent

1. Se connecter avec `parent@test.com` / `test123`
2. Aller dans "Commander repas & périscolaire"
3. Sélectionner un enfant
4. Commander des repas et/ou périscolaire
5. Voir ses commandes
6. Tester l'annulation (repas seul, périscolaire seul, ou tout)

### Scénario Admin

1. Se connecter avec `directrice@test.fr` / `directrice`
2. Voir les préinscriptions (12 dossiers)
3. Gérer les comptes parents (11 comptes)
4. Voir les repas commandés avec filtres
5. Voir le périscolaire avec filtres
6. Générer un rapport hebdomadaire

---

## ⚠️ Important

Ces identifiants sont **uniquement pour la démonstration client**.  
Ne pas les utiliser en production !
