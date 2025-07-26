#!/bin/bash

# Script pour générer des noms de migration avec timestamp correct
# Usage: ./scripts/generate-migration.sh "nom_de_la_migration" [--update migration_base]

show_usage() {
    echo "Usage: $0 <nom_de_la_migration> [--update migration_base]"
    echo ""
    echo "Exemples:"
    echo "  $0 create_documents_table"
    echo "  $0 users_roles_schema_v2 --update users_roles_initial_schema"
    echo ""
    echo "Options:"
    echo "  --update migration_base  Créer une mise à jour de la migration existante"
    echo "                          Ajoute automatiquement le commentaire de base"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

MIGRATION_NAME=$1
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILENAME="${TIMESTAMP}_${MIGRATION_NAME}.sql"
IS_UPDATE=false
BASE_MIGRATION=""

# Vérifier les arguments
if [ "$2" = "--update" ] && [ ! -z "$3" ]; then
    IS_UPDATE=true
    BASE_MIGRATION=$3
    
    # Vérifier si la migration de base existe
    BASE_FILE=$(find supabase/migrations/ -name "*${BASE_MIGRATION}.sql" | head -1)
    if [ -z "$BASE_FILE" ]; then
        echo "❌ Erreur: Migration de base '$BASE_MIGRATION' non trouvée"
        echo "Fichiers disponibles:"
        ls supabase/migrations/*.sql | sed 's/.*\//  /'
        exit 1
    fi
fi

echo "Génération du fichier de migration: $FILENAME"

# Créer le fichier de migration avec un template approprié
if [ "$IS_UPDATE" = true ]; then
    cat > "supabase/migrations/$FILENAME" << EOF
-- Migration: $MIGRATION_NAME
-- Description: [Décrire les modifications apportées]
-- Date: $(date +%Y-%m-%d)
-- Base: $(basename "$BASE_FILE")
-- Type: MISE À JOUR

-- ⚠️  IMPORTANTE: Cette migration modifie une migration existante
-- Assurez-vous que la migration de base a été appliquée avant celle-ci

-- Vos modifications SQL ici
-- Exemples:
-- ALTER TABLE public.users ADD COLUMN new_field varchar(100);
-- ALTER TABLE public.users ADD CONSTRAINT new_constraint CHECK (...);

EOF
else
    cat > "supabase/migrations/$FILENAME" << EOF
-- Migration: $MIGRATION_NAME
-- Description: [Décrire le but de cette migration]
-- Date: $(date +%Y-%m-%d)
-- Type: NOUVELLE MIGRATION

-- Votre code SQL ici

EOF
fi

echo "✅ Fichier créé: supabase/migrations/$FILENAME"

if [ "$IS_UPDATE" = true ]; then
    echo "📋 Migration de mise à jour basée sur: $(basename "$BASE_FILE")"
    echo ""
    echo "⚠️  RÈGLES IMPORTANTES:"
    echo "   1. Ne modifiez JAMAIS la migration de base si elle a été appliquée"
    echo "   2. Cette nouvelle migration doit être autonome et complète"
    echo "   3. Testez avec: supabase db reset"
    echo ""
fi

echo "📝 N'oubliez pas de:"
echo "   1. Ajouter une description dans le fichier"
echo "   2. Écrire votre code SQL"
echo "   3. Tester avec: supabase db reset"
echo "   4. Vérifier avec: supabase migration list"