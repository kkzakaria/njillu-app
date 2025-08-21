#!/bin/bash

# Script pour tester les API avec Bruno
# Usage: ./scripts/test-api.sh [command]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start     - Démarrer le serveur de développement"
  echo "  test      - Exécuter tous les tests Bruno"
  echo "  gui       - Ouvrir l'interface graphique Bruno"
  echo "  folder    - Tester uniquement les endpoints folders"
  echo "  auth      - Tester uniquement l'authentification"
  echo "  clean     - Nettoyer les variables d'environnement"
  echo "  help      - Afficher cette aide"
  echo ""
  echo "Examples:"
  echo "  $0 start    # Démarre le serveur dev"
  echo "  $0 test     # Lance tous les tests"
  echo "  $0 folder   # Teste les API folders"
}

# Vérifier si Supabase est en cours d'exécution
check_supabase() {
  if ! curl -s -f http://127.0.0.1:54321/health >/dev/null 2>&1; then
    echo -e "${RED}❌ Supabase n'est pas démarré${NC}"
    echo -e "${YELLOW}💡 Démarrez Supabase avec: supabase start${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Supabase est en cours d'exécution${NC}"
}

# Vérifier si le serveur Next.js est en cours d'exécution
check_nextjs() {
  if ! curl -s -f http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Le serveur Next.js ne répond pas sur le port 3000${NC}"
    echo -e "${YELLOW}💡 Démarrez-le avec: pnpm dev${NC}"
    return 1
  fi
  echo -e "${GREEN}✅ Serveur Next.js accessible${NC}"
  return 0
}

# Créer un utilisateur de test si nécessaire
create_test_user() {
  echo -e "${YELLOW}🧪 Création d'un utilisateur de test...${NC}"
  
  # Vérifier si l'utilisateur existe déjà
  EXISTING_USER=$(docker exec supabase_db_njillu-app psql -U postgres -t -c "SELECT id FROM auth.users WHERE email = 'test@example.com';" 2>/dev/null || echo "")
  
  if [[ -n "${EXISTING_USER// }" ]]; then
    echo -e "${GREEN}✅ Utilisateur de test existe déjà${NC}"
  else
    # Créer l'utilisateur via l'API Supabase
    curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" \
      -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@example.com",
        "password": "password123",
        "email_confirm": true
      }' > /dev/null
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Utilisateur de test créé${NC}"
    else
      echo -e "${RED}❌ Erreur lors de la création de l'utilisateur de test${NC}"
    fi
  fi
}

case "${1:-help}" in
  "start")
    echo -e "${YELLOW}🚀 Démarrage du serveur de développement...${NC}"
    check_supabase
    create_test_user
    echo -e "${GREEN}✅ Prêt pour les tests${NC}"
    echo -e "${YELLOW}💡 Exécutez maintenant: pnpm dev${NC}"
    echo -e "${YELLOW}💡 Puis: ./scripts/test-api.sh test${NC}"
    ;;
    
  "test")
    echo -e "${YELLOW}🧪 Test 1: Vérification des services${NC}"
    check_supabase
    if ! check_nextjs; then
      exit 1
    fi
    
    echo -e "${YELLOW}🧪 Test 2: Exécution des tests Bruno${NC}"
    cd bruno-tests
    if command -v bru >/dev/null 2>&1; then
      bru run --env local
    else
      echo -e "${RED}❌ Bruno CLI non trouvé${NC}"
      echo -e "${YELLOW}💡 Installez avec: npm install -g @usebruno/cli${NC}"
      exit 1
    fi
    ;;
    
  "gui")
    echo -e "${YELLOW}🖥️ Ouverture de l'interface Bruno...${NC}"
    if command -v bruno >/dev/null 2>&1; then
      bruno bruno-tests/
    else
      echo -e "${RED}❌ Bruno GUI non trouvé${NC}"
      echo -e "${YELLOW}💡 Téléchargez depuis: https://www.usebruno.com/${NC}"
    fi
    ;;
    
  "folder"|"folders")
    echo -e "${YELLOW}📁 Test des endpoints folders...${NC}"
    check_supabase
    if ! check_nextjs; then
      exit 1
    fi
    
    cd bruno-tests
    if command -v bru >/dev/null 2>&1; then
      bru run --env local --folder Folders
    else
      echo -e "${RED}❌ Bruno CLI non trouvé${NC}"
      exit 1
    fi
    ;;
    
  "auth")
    echo -e "${YELLOW}🔐 Test de l'authentification...${NC}"
    check_supabase
    create_test_user
    
    cd bruno-tests
    if command -v bru >/dev/null 2>&1; then
      bru run --env local --folder Auth
    else
      echo -e "${RED}❌ Bruno CLI non trouvé${NC}"
      exit 1
    fi
    ;;
    
  "clean")
    echo -e "${YELLOW}🧹 Nettoyage des variables d'environnement...${NC}"
    # Reset des variables dans Bruno
    cd bruno-tests
    echo "vars {
  base_url: http://localhost:3000
  api_base: {{base_url}}/api
  supabase_url: http://127.0.0.1:54321
  supabase_anon_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
  access_token: 
  user_id: 
}" > environments/local.bru
    echo -e "${GREEN}✅ Variables nettoyées${NC}"
    ;;
    
  "help"|*)
    show_help
    ;;
esac