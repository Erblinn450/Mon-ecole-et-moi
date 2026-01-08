#!/bin/bash

# Script de migration GitLab → GitHub
# Remplace TON_USERNAME par ton username GitHub

echo "🚀 Migration du projet vers GitHub"
echo ""

# Étape 1: Changer l'origine
echo "📝 Étape 1: Configuration de l'origine GitHub"
echo "Remplace TON_USERNAME par ton username GitHub réel :"
echo "git remote set-url origin https://github.com/TON_USERNAME/mon-ecole-et-moi.git"
echo ""

# Étape 2: Vérifier
echo "📋 Étape 2: Vérification de l'origine"
echo "git remote -v"
echo ""

# Étape 3: Push
echo "🚀 Étape 3: Push vers GitHub"
echo "git push -u origin main"
echo ""

echo "✅ Après ça, ton projet sera sur GitHub avec un historique propre !"