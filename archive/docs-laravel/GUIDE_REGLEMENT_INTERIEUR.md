# 📄 Guide : Réglement Intérieur PDF

## Comment ça marche ?

Les parents peuvent maintenant voir et télécharger le réglement intérieur depuis la page **"Mes dossiers"** lorsqu'un dossier est validé.

## 📍 Où placer votre PDF ?

Le fichier PDF doit être placé à cet emplacement :
```
/public/documents/reglement-interieur.pdf
```

## 🔄 Remplacer le PDF d'exemple

1. **Créez votre PDF** (ou exportez-le depuis Word/Google Docs)
2. **Nommez-le** : `reglement-interieur.pdf`
3. **Placez-le** dans le dossier `/public/documents/`

Actuellement, le fichier `/public/documents/reglement-interieur.pdf` est un PDF d'exemple. Remplacez-le avec votre document officiel.

## 🔗 URL pour accéder au PDF

- **Directement** : `http://localhost:8000/documents/reglement-interieur.pdf`
- **Via API** : `http://localhost:8000/api/documents/reglement-interieur` (authentifiée)

## 📱 Fonctionnalités

### Parent connecté
- ✅ Voit le bouton "📄 Réglement intérieur" sur ses dossiers validés
- ✅ Peut télécharger le PDF en cliquant le bouton
- ✅ Peut l'ouvrir dans un nouvel onglet

### Code modifié

**Fichier** : `/public/js/mes-dossiers.js`
- Ajout d'un lien vers `/documents/reglement-interieur.pdf`
- Affichage du lien quand le dossier est "Validé"

**Fichier** : `/routes/web.php`
- Route publique pour servir le PDF : `/documents/reglement-interieur.pdf`

**Fichier** : `/routes/api.php`
- Route API authentifiée : `GET /api/documents/reglement-interieur`

**Dossier** : `/public/documents/`
- Contient les fichiers PDF à télécharger

## 🎨 Personnalisation

Si vous voulez ajouter d'autres documents (ex: charte parentale, code de vie), vous pouvez :

1. Créer un dossier `/public/documents/`
2. Y ajouter vos fichiers PDF
3. Modifier `/public/js/mes-dossiers.js` pour ajouter de nouveaux liens

Exemple pour ajouter une charte :
```html
<a href="/documents/charte-parentale.pdf" target="_blank" class="btn-secondary">
    📄 Charte parentale
</a>
```

## 📋 Checklist

- [ ] Créer votre PDF du réglement intérieur
- [ ] Remplacer `/public/documents/reglement-interieur.pdf` avec votre PDF
- [ ] Tester l'accès depuis la page "Mes dossiers"
- [ ] Vérifier que le PDF s'ouvre correctement

C'est prêt ! 🎉
