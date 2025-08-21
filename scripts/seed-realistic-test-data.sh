#!/bin/bash

# Script pour ajouter des données de test réalistes basées sur l'analyse des vrais BL
# Usage: ./scripts/seed-realistic-test-data.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Création de données de test réalistes basées sur les vrais BL${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Vérifier que Supabase est démarré
if ! curl -s http://127.0.0.1:54321 >/dev/null 2>&1; then
    echo -e "${RED}❌ Supabase n'est pas démarré. Lancez 'supabase start' d'abord.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase détecté et accessible${NC}"

# Étape 1: Exécuter le script SQL de seeding
echo -e "${YELLOW}📊 Étape 1: Injection des données réalistes...${NC}"

docker exec supabase_db_njillu-app psql -U postgres -f /tmp/seed-realistic-data.sql 2>/dev/null || {
    # Si le fichier n'est pas dans le container, on l'exécute depuis l'hôte
    echo -e "${YELLOW}📥 Copie du script SQL dans le container...${NC}"
    docker cp scripts/seed-realistic-data.sql supabase_db_njillu-app:/tmp/seed-realistic-data.sql
    docker exec supabase_db_njillu-app psql -U postgres -f /tmp/seed-realistic-data.sql
}

echo -e "${GREEN}✅ Données réalistes créées avec succès${NC}"

# Étape 2: Vérification des données créées
echo -e "${YELLOW}🔍 Étape 2: Vérification des données créées...${NC}"

# Compter les nouvelles données
SHIPPING_COMPANIES=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM shipping_companies;" | xargs)
CONTAINER_TYPES=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM container_types;" | xargs)
CLIENTS=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM clients;" | xargs)
BILLS_OF_LADING=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bills_of_lading;" | xargs)
CONTAINERS=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bl_containers;" | xargs)
FOLDERS=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM folders;" | xargs)

echo -e "${BLUE}📈 Statistiques de la base de données :${NC}"
echo -e "   📢 Compagnies maritimes: $SHIPPING_COMPANIES"
echo -e "   📦 Types de conteneurs: $CONTAINER_TYPES"
echo -e "   👥 Clients: $CLIENTS"
echo -e "   📋 Bills of lading: $BILLS_OF_LADING"
echo -e "   🚢 Conteneurs: $CONTAINERS"
echo -e "   📁 Dossiers: $FOLDERS"

# Étape 3: Vérifier les champs essentiels
echo -e "${YELLOW}🔬 Étape 3: Vérification des champs essentiels des BL...${NC}"

BL_WITH_PORTS=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bills_of_lading WHERE port_of_loading IS NOT NULL AND port_of_discharge IS NOT NULL;" | xargs)
BL_WITH_DATES=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bills_of_lading WHERE shipped_on_board_date IS NOT NULL;" | xargs)
BL_WITH_TYPES=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bills_of_lading WHERE bl_type IS NOT NULL;" | xargs)
CONTAINERS_WITH_SEALS=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bl_containers WHERE seal_number IS NOT NULL;" | xargs)
CONTAINERS_WITH_TARE=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT COUNT(*) FROM bl_containers WHERE tare_weight_kg IS NOT NULL;" | xargs)

echo -e "${BLUE}✨ Vérification des 5 champs essentiels identifiés :${NC}"
echo -e "   🌍 BL avec ports chargement/déchargement: $BL_WITH_PORTS/$BILLS_OF_LADING"
echo -e "   📅 BL avec dates d'expédition: $BL_WITH_DATES/$BILLS_OF_LADING"
echo -e "   📋 BL avec types définis: $BL_WITH_TYPES/$BILLS_OF_LADING"
echo -e "   🔒 Conteneurs avec numéros de sceau: $CONTAINERS_WITH_SEALS/$CONTAINERS"
echo -e "   ⚖️ Conteneurs avec poids à vide: $CONTAINERS_WITH_TARE/$CONTAINERS"

# Étape 4: Test rapide des endpoints
echo -e "${YELLOW}🧪 Étape 4: Test rapide des endpoints améliorés...${NC}"

echo -e "${BLUE}   📡 Test de l'endpoint GET /api/folders...${NC}"
if curl -s "http://localhost:3000/api/folders?limit=1" >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Endpoint folders accessible${NC}"
else
    echo -e "${YELLOW}   ⚠️ Endpoint folders non accessible (l'app n'est peut-être pas démarrée)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuration terminée avec succès !${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Données de test créées basées sur l'analyse de 6 vrais BL :${NC}"
echo -e "   🏢 MSC: MEDUGZ075755 (Shanghai → Le Havre)"
echo -e "   🏢 COSCO: COSU6412294940 (Ningbo → Hamburg)"
echo -e "   🏢 Hapag-Lloyd: HLCUBA240815001 (Qingdao → Rotterdam)"
echo -e "   🏢 ONE: ONEYSHA240820055 (Guangzhou → Antwerp)"
echo -e "   🏢 PIL: PILSIN240821789 (Singapore → Marseille)"
echo ""
echo -e "${YELLOW}💡 Prochaines étapes :${NC}"
echo -e "   🚀 Tester les APIs: cd bruno-tests && bru run --env local"
echo -e "   🔍 Vérifier les nouveaux filtres de recherche"
echo -e "   📊 Valider l'affichage des champs essentiels"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"