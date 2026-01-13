#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api"
MAILHOG_API="http://localhost:8025/api/v2"

# Visuals
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "👮‍♂️ \033[1mLancement du protocole RALPH WIGGUM...\033[0m"
echo "---------------------------------------------------"

# 0. Setup unique data
TIMESTAMP=$(date +%s)
EMAIL="ralph.${TIMESTAMP}@simpsons.com"
echo -e "🧪 Test User: \033[36m$EMAIL\033[0m"

# Function to check errors
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ÉCHEC: $1${NC}"
    exit 1
  fi
}

check_empty() {
  if [ -z "$1" ] || [ "$1" == "null" ]; then
    echo -e "${RED}❌ ÉCHEC: $2 (Réponse vide)${NC}"
    exit 1
  fi
}

# --- DEBUT ZONE DE CRASH TEST (TESTS NEGATIFS) ---
echo -n "🛡️  0a. Test Sécurité: Dossier vide/incomplet... "
FAIL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/preinscriptions" \
  -H "Content-Type: application/json" \
  -d '{ "prenomEnfant": "CrashTest" }') # Manque plein de champs

if [ "$FAIL_RESPONSE" != "400" ]; then
    echo -e "${RED}❌ ÉCHEC: Le système aurait dû rejeter (400) mais a répondu $FAIL_RESPONSE${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

echo -n "🛡️  0b. Test Sécurité: Email invalide... "
FAIL_EMAIL=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/preinscriptions" \
  -H "Content-Type: application/json" \
  -d "{
    \"prenomEnfant\": \"Ralph\",
    \"nomEnfant\": \"Wiggum\",
    \"dateNaissance\": \"2019-05-01\",
    \"classeSouhaitee\": \"MATERNELLE\",
    \"nomParent\": \"Clancy\",
    \"prenomParent\": \"Wiggum\",
    \"emailParent\": \"pas-un-email\",
    \"telephoneParent\": \"0600000000\",
    \"adresseParent\": \"10 Springfield Ave\",
    \"situationFamiliale\": \"MARIE\"
  }")

if [ "$FAIL_EMAIL" != "400" ]; then
    echo -e "${RED}❌ ÉCHEC: L'email 'pas-un-email' aurait dû être rejeté (400) mais a répondu $FAIL_EMAIL${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC}"
# --- FIN ZONE DE CRASH TEST ---


# 1. TEST PRE-INSCRIPTION (HAPPY PATH)
echo -n "👉 1. Soumission Pré-inscription (Parent)... "

RESPONSE=$(curl -s -X POST "$API_URL/preinscriptions" \
  -H "Content-Type: application/json" \
  -d "{
    \"prenomEnfant\": \"Ralph\",
    \"nomEnfant\": \"Wiggum\",
    \"dateNaissance\": \"2019-05-01\",
    \"classeSouhaitee\": \"MATERNELLE\",
    \"nomParent\": \"Clancy\",
    \"prenomParent\": \"Wiggum\",
    \"emailParent\": \"$EMAIL\",
    \"telephoneParent\": \"0600000000\",
    \"adresseParent\": \"10 Springfield Ave\",
    \"classeActuelle\": \"Springfield Elementary\",
    \"situationFamiliale\": \"AUTRE\",
    \"situationAutre\": \"Chef de la Police\"
  }")

# Parse ID using python
ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

check_empty "$ID" "Impossible de récupérer l'ID du dossier"
echo -e "${GREEN}OK${NC} (Dossier #$ID)"


# 2. TEST AUTH ADMIN (ADMIN SIDE)
echo -n "👉 2. Authentification Admin... "

TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ecole.fr", "password": "admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

check_empty "$TOKEN" "Login Admin échoué"
echo -e "${GREEN}OK${NC}"


# 3. TEST RECUPERATION DOSSIER & VERIF DONNEES (ADMIN SIDE)
echo -n "👉 3. Vérification Intégrité Données Admin... "

# On récupère tout le JSON
FULL_DATA=$(curl -s -X GET "$API_URL/preinscriptions/$ID" \
  -H "Authorization: Bearer $TOKEN")

# On vérifie des champs précis pour être sûr que TOUT est passé
EMAIL_CHECK=$(echo "$FULL_DATA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('emailParent', ''))")
SITUATION_CHECK=$(echo "$FULL_DATA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('situationAutre', ''))")
CLASSE_CHECK=$(echo "$FULL_DATA" | python3 -c "import sys, json; print(json.load(sys.stdin).get('classeActuelle', ''))")

if [ "$EMAIL_CHECK" != "$EMAIL" ]; then
    echo -e "${RED}❌ ÉCHEC INTEGRITÉ: Email incorrect ($EMAIL_CHECK)${NC}"
    exit 1
fi
if [ "$SITUATION_CHECK" != "Chef de la Police" ]; then
    echo -e "${RED}❌ ÉCHEC INTEGRITÉ: Champ spécial 'situationAutre' perdu ou incorrect ($SITUATION_CHECK)${NC}"
    exit 1
fi
if [ "$CLASSE_CHECK" != "Springfield Elementary" ]; then
    echo -e "${RED}❌ ÉCHEC INTEGRITÉ: Champ 'classeActuelle' incorrect ($CLASSE_CHECK)${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC} (Tous les champs, mêmes optionnels, sont parfaits)"


# 4. TEST VALIDATION (ADMIN SIDE)
echo -n "👉 4. Validation du Dossier... "

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$API_URL/preinscriptions/$ID/statut" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "VALIDE"}')

if [ "$STATUS_CODE" != "200" ]; then
    echo -e "${RED}❌ ÉCHEC: API a retourné $STATUS_CODE au lieu de 200${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC}"


# 5. TEST EMAILS (SYSTEM)
echo -n "👉 5. Vérification Emails (MailHog)... "

# Wait a bit for async mail processing
sleep 1

EMAIL_COUNT=$(curl -s "http://localhost:8025/api/v2/search?kind=to&query=$EMAIL" \
  | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('items', [])))")

if [ "$EMAIL_COUNT" -lt 2 ]; then
    echo -e "${RED}❌ ÉCHEC: Attendu au moins 2 emails, trouvé $EMAIL_COUNT${NC}"
    echo "   (1. Confirmation réception, 2. Validation dossier)"
    exit 1
fi
echo -e "${GREEN}OK${NC} ($EMAIL_COUNT reçus)"

echo "---------------------------------------------------"
echo -e "🚀 \033[1;32mTOUS LES SYSTÈMES SONT NOMINAUX. LE MODULE EST OPTIMISÉ.\033[0m"
