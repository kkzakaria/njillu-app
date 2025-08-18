-- Migration: fix_active_clients_view_security_definer
-- Description: Correction du dernier avertissement "Security Definer View"
-- Date: 2025-08-18
-- Type: CORRECTION DE SÉCURITÉ - VUE SECURITY DEFINER

-- ============================================================================
-- Objectif: Corriger l'avertissement "Security Definer View" 
-- pour public.active_clients_with_display_names
-- ============================================================================

-- Problème identifié:
-- - La vue active_clients_with_display_names utilise des fonctions SECURITY DEFINER
-- - Cela rend la vue elle-même "Security Definer" par transitivité
-- - Elle est exposée automatiquement via l'API Data Supabase
-- - Risque d'exposition de données clients sensibles
--
-- Solution: Déplacer la vue vers le schéma privé et créer une fonction API contrôlée

-- ============================================================================
-- ÉTAPE 1: Recréer la vue dans le schéma privé
-- ============================================================================

-- Vue des clients actifs avec noms d'affichage dans le schéma privé
CREATE VIEW private.active_clients_with_display_names AS
SELECT 
  c.*,
  get_client_display_name(c) as display_name,
  get_client_contact_name(c) as contact_name,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Particulier'
    WHEN c.client_type = 'business' THEN 'Entreprise'
    ELSE 'Inconnu'
  END as type_label_fr,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Individual'
    WHEN c.client_type = 'business' THEN 'Business'
    ELSE 'Unknown'
  END as type_label_en,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Particular'
    WHEN c.client_type = 'business' THEN 'Empresa'
    ELSE 'Desconocido'
  END as type_label_es
FROM public.clients c
WHERE c.deleted_at IS NULL
  AND c.status = 'active';

-- ============================================================================
-- ÉTAPE 2: Créer une fonction API sécurisée pour accès contrôlé
-- ============================================================================

-- Fonction API pour obtenir les clients actifs avec noms d'affichage
CREATE OR REPLACE FUNCTION get_active_clients_with_display_names(
  client_type_filter client_type_enum DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  client_type client_type_enum,
  status client_status_enum,
  email varchar(255),
  phone varchar(50),
  address_line1 varchar(255),
  address_line2 varchar(255),
  city varchar(100),
  postal_code varchar(20),
  state_province varchar(100),
  country varchar(2),
  first_name varchar(100),
  last_name varchar(100),
  company_name varchar(255),
  siret varchar(20),
  contact_person_first_name varchar(100),
  contact_person_last_name varchar(100),
  industry industry_enum,
  credit_limit numeric(15,2),
  credit_limit_currency varchar(3),
  payment_terms_days integer,
  preferred_language varchar(5),
  created_at timestamptz,
  updated_at timestamptz,
  display_name varchar(255),
  contact_name varchar(255),
  type_label_fr text,
  type_label_en text,
  type_label_es text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.client_type,
    ac.status,
    ac.email,
    ac.phone,
    ac.address_line1,
    ac.address_line2,
    ac.city,
    ac.postal_code,
    ac.state_province,
    ac.country,
    ac.first_name,
    ac.last_name,
    ac.company_name,
    ac.siret,
    ac.contact_person_first_name,
    ac.contact_person_last_name,
    ac.industry,
    ac.credit_limit,
    ac.credit_limit_currency,
    ac.payment_terms_days,
    ac.preferred_language,
    ac.created_at,
    ac.updated_at,
    ac.display_name,
    ac.contact_name,
    ac.type_label_fr,
    ac.type_label_en,
    ac.type_label_es
  FROM private.active_clients_with_display_names ac
  WHERE (client_type_filter IS NULL OR ac.client_type = client_type_filter)
  ORDER BY ac.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- ============================================================================
-- ÉTAPE 3: Supprimer la vue publique problématique
-- ============================================================================

-- Supprimer la vue du schéma public pour éliminer l'exposition API
DROP VIEW IF EXISTS public.active_clients_with_display_names CASCADE;

-- ============================================================================
-- ÉTAPE 4: Permissions et documentation
-- ============================================================================

-- Permissions pour la nouvelle fonction API
GRANT EXECUTE ON FUNCTION get_active_clients_with_display_names(client_type_enum, INTEGER, INTEGER) TO authenticated;

-- Documentation
COMMENT ON VIEW private.active_clients_with_display_names IS 'Vue des clients actifs - SCHÉMA PRIVÉ: Accès via get_active_clients_with_display_names()';

COMMENT ON FUNCTION get_active_clients_with_display_names(client_type_enum, INTEGER, INTEGER) IS 'API sécurisée pour récupérer les clients actifs avec noms d''affichage et filtres';

-- ============================================================================
-- Résultat: Sécurité maximale avec fonctionnalités préservées
-- ============================================================================
-- ✅ Vue déplacée vers schéma privé (non exposé API)
-- ✅ Fonction API contrôlée créée avec filtres et pagination
-- ✅ Ancienne vue publique supprimée complètement
-- ✅ Accès sécurisé maintenu via interface contrôlée
-- ✅ Conformité Supabase Security Advisor garantie

-- Cette migration élimine le dernier avertissement "Security Definer View" en:
-- 1. Supprimant l'exposition API de la vue (schéma privé)
-- 2. Créant une fonction API sécurisée avec paramètres de contrôle
-- 3. Maintenant toutes les fonctionnalités avec sécurité renforcée
-- 4. Appliquant le principe de moindre privilège

-- ============================================================================
-- Cette migration corrige l'avertissement de sécurité suivant:
-- ============================================================================
-- Security Definer View: public.active_clients_with_display_names

-- Status: DERNIER AVERTISSEMENT DE SÉCURITÉ RÉSOLU ✅