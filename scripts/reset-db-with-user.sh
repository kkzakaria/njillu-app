#!/bin/bash

# Script pour reset la DB Supabase et recréer l'utilisateur de test
# Usage: ./scripts/reset-db-with-user.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Reset de la base de données avec utilisateur de test${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Étape 1: Reset de la base de données
echo -e "${YELLOW}📊 Étape 1: Reset de la base de données Supabase...${NC}"
supabase db reset

echo -e "${GREEN}✅ Base de données resetée avec succès${NC}"
echo ""

# Étape 2: Attendre que les services soient prêts
echo -e "${YELLOW}⏳ Étape 2: Attente de la disponibilité des services...${NC}"
sleep 3

# Vérifier que Supabase répond
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://127.0.0.1:54321 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase API accessible${NC}"
    break
  else
    echo -e "${YELLOW}⏳ Attente de Supabase... (tentative $((RETRY_COUNT + 1))/$MAX_RETRIES)${NC}"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}❌ Impossible de connecter à Supabase après $MAX_RETRIES tentatives${NC}"
  exit 1
fi

# Étape 3: Créer l'utilisateur de test
echo -e "${YELLOW}👤 Étape 3: Création de l'utilisateur de test...${NC}"

# Variables de l'utilisateur de test
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

# Récupérer la clé service_role depuis supabase status
SERVICE_ROLE_KEY=$(supabase status | grep "service_role key:" | awk '{print $3}')

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ Impossible de récupérer la clé service_role${NC}"
  exit 1
fi

echo -e "${BLUE}🔑 Clé service_role récupérée${NC}"

# Créer l'utilisateur via l'API Admin Supabase
echo -e "${YELLOW}📝 Création de l'utilisateur: $TEST_EMAIL${NC}"

CREATE_USER_RESPONSE=$(curl -s -w "%{http_code}" -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"email_confirm\": true,
    \"user_metadata\": {
      \"first_name\": \"$TEST_FIRST_NAME\",
      \"last_name\": \"$TEST_LAST_NAME\"
    }
  }")

# Extraire le code de statut HTTP (3 derniers caractères)
HTTP_CODE="${CREATE_USER_RESPONSE: -3}"
RESPONSE_BODY="${CREATE_USER_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ Utilisateur de test créé avec succès${NC}"
  echo -e "${BLUE}📧 Email: $TEST_EMAIL${NC}"
  echo -e "${BLUE}🔒 Mot de passe: $TEST_PASSWORD${NC}"
else
  echo -e "${RED}❌ Erreur lors de la création de l'utilisateur (HTTP $HTTP_CODE)${NC}"
  echo -e "${RED}Réponse: $RESPONSE_BODY${NC}"
  exit 1
fi

# Étape 4: Vérifier que l'utilisateur existe dans la table users
echo -e "${YELLOW}🔍 Étape 4: Vérification de la création du profil utilisateur...${NC}"
sleep 2

USER_COUNT=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM public.users WHERE email = '$TEST_EMAIL';" 2>/dev/null | xargs)

if [ "$USER_COUNT" = "1" ]; then
  echo -e "${GREEN}✅ Profil utilisateur créé automatiquement via trigger${NC}"
else
  echo -e "${YELLOW}⚠️ Profil utilisateur non créé automatiquement, création manuelle...${NC}"
  
  # Récupérer l'ID utilisateur depuis auth.users
  USER_ID=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT id FROM auth.users WHERE email = '$TEST_EMAIL';" 2>/dev/null | xargs)
  
  if [ -n "$USER_ID" ]; then
    docker exec supabase_db_njillu-app psql -U postgres -c "
      INSERT INTO public.users (id, email, first_name, last_name) 
      VALUES ('$USER_ID', '$TEST_EMAIL', '$TEST_FIRST_NAME', '$TEST_LAST_NAME')
      ON CONFLICT (id) DO NOTHING;
    " >/dev/null 2>&1
    
    echo -e "${GREEN}✅ Profil utilisateur créé manuellement${NC}"
  else
    echo -e "${RED}❌ Impossible de récupérer l'ID utilisateur${NC}"
  fi
fi

# Étape 5: Créer des données de test (compagnies, types de conteneurs, etc.)
echo -e "${YELLOW}📦 Étape 5: Création des données de référence...${NC}"

docker exec supabase_db_njillu-app psql -U postgres -c "
-- Compagnies maritimes de test
INSERT INTO shipping_companies (name, short_name, scac_code) VALUES
('CMA CGM', 'CMA', 'CMDU'),
('Maersk Line', 'MAEU', 'MAEU'),
('MSC', 'MSC', 'MSCU')
ON CONFLICT (scac_code) DO NOTHING;

-- Types de conteneurs de test
INSERT INTO container_types (iso_code, description, category, size_feet, height_type, teu_equivalent) VALUES
('20GP', 'Conteneur général 20 pieds', 'general_purpose', 20, 'standard', 1.0),
('40GP', 'Conteneur général 40 pieds', 'general_purpose', 40, 'standard', 2.0),
('40HC', 'Conteneur high cube 40 pieds', 'high_cube', 40, 'high_cube', 2.0),
('20RF', 'Conteneur réfrigéré 20 pieds', 'refrigerated', 20, 'standard', 1.0)
ON CONFLICT (iso_code) DO NOTHING;

-- Client de test
INSERT INTO clients (first_name, last_name, company_name, email) VALUES
('Jean', 'Dupont', 'Transport SA', 'jean.dupont@transport.fr')
ON CONFLICT (email) DO NOTHING;
" >/dev/null 2>&1

echo -e "${GREEN}✅ Données de référence créées${NC}"

echo ""
echo -e "${GREEN}🎉 Base de données prête pour les tests !${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Informations de test:${NC}"
echo -e "   👤 Utilisateur: $TEST_EMAIL"
echo -e "   🔒 Mot de passe: $TEST_PASSWORD"
echo -e "   🏢 Compagnies: CMA CGM, Maersk, MSC"
echo -e "   📦 Types conteneurs: 20GP, 40GP, 40HC, 20RF"
echo -e "   👥 Client: Jean Dupont (Transport SA)"
echo ""
echo -e "${YELLOW}💡 Commandes suivantes:${NC}"
echo -e "   🚀 Démarrer dev: pnpm dev"
echo -e "   🧪 Tester APIs: cd bruno-tests && bru run --env local -r"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"