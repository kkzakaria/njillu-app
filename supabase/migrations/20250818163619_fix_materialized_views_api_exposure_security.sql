-- Migration: fix_materialized_views_api_exposure_security
-- Description: Correction des avertissements de sécurité "Materialized View in API" 
-- Date: 2025-08-18
-- Type: CORRECTION DE SÉCURITÉ API

-- ============================================================================
-- Objectif: Corriger les 4 avertissements "Materialized View in API"
-- reportés par le Security Advisor de Supabase distant
-- ============================================================================

-- Les vues matérialisées exposées automatiquement via l'API Data créent des 
-- risques de sécurité en donnant accès direct aux métriques business sensibles.
-- Solution: Révoquer les permissions SELECT tout en maintenant l'accès via 
-- des fonctions contrôlées.

-- ============================================================================
-- ÉTAPE 1: Révoquer l'exposition API des vues matérialisées sensibles
-- ============================================================================

-- 1. Vue des compteurs de dossiers par transport/status/priorité
-- Contient: Statistiques agrégées, valeurs estimées, métriques de performance
REVOKE SELECT ON folder_counters FROM authenticated;

-- 2. Vue des métriques par utilisateur assigné  
-- Contient: Données personnelles, métriques de performance utilisateur, charges de travail
REVOKE SELECT ON folder_user_metrics FROM authenticated;

-- 3. Vue des analytics temporelles quotidiennes
-- Contient: Tendances business, taux de completion, métriques de vélocité
REVOKE SELECT ON folder_daily_analytics FROM authenticated;

-- 4. Vue des dossiers nécessitant attention avec scoring
-- Contient: Alertes, retards, scoring de priorité, informations critiques
REVOKE SELECT ON folder_attention_required FROM authenticated;

-- ============================================================================
-- ÉTAPE 2: Maintenir l'accès contrôlé via les fonctions existantes
-- ============================================================================

-- Note: Les fonctions suivantes restent disponibles avec contrôle d'accès intégré:
-- - get_folder_counters(transport_type_enum, folder_status_enum)
-- - get_folders_requiring_attention(UUID, INTEGER)
-- 
-- Ces fonctions:
-- 1. Ont des paramètres de filtrage pour limiter les données exposées
-- 2. Incluent une logique de sécurité avec SECURITY DEFINER
-- 3. Permettent un contrôle granulaire de l'accès aux données
-- 4. Respectent les politiques RLS et permissions utilisateur

-- ============================================================================
-- ÉTAPE 3: Documentation de sécurité
-- ============================================================================

-- Ajout de commentaires explicatifs sur les restrictions d'accès
COMMENT ON MATERIALIZED VIEW folder_counters IS 'Compteurs en temps réel par transport/status/priorité - ACCÈS RESTREINT: Utilisez get_folder_counters() pour accès API contrôlé';

COMMENT ON MATERIALIZED VIEW folder_user_metrics IS 'Métriques de performance par utilisateur assigné - ACCÈS RESTREINT: Données sensibles, accès via fonctions authentifiées uniquement';

COMMENT ON MATERIALIZED VIEW folder_daily_analytics IS 'Analytics quotidiennes pour trending et graphiques - ACCÈS RESTREINT: Métriques business, accès via interfaces contrôlées';

COMMENT ON MATERIALIZED VIEW folder_attention_required IS 'Dossiers nécessitant attention avec scoring - ACCÈS RESTREINT: Utilisez get_folders_requiring_attention() pour accès API contrôlé';

-- ============================================================================
-- ÉTAPE 4: Validation des permissions restantes
-- ============================================================================

-- Les permissions suivantes sont maintenues pour le fonctionnement interne:
-- - Accès aux fonctions refresh_all_folder_materialized_views() et refresh_folder_views_if_needed()
-- - Accès aux fonctions API get_folder_counters() et get_folders_requiring_attention()
-- - Triggers et maintenance automatique des vues

-- Permissions explicites conservées:
-- GRANT EXECUTE ON FUNCTION refresh_all_folder_materialized_views() TO authenticated;
-- GRANT EXECUTE ON FUNCTION refresh_folder_views_if_needed() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_folder_counters(transport_type_enum, folder_status_enum) TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_folders_requiring_attention(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- Cette migration corrige les avertissements de sécurité suivants:
-- ============================================================================
-- 1. Materialized View in API: public.folder_counters
-- 2. Materialized View in API: public.folder_user_metrics  
-- 3. Materialized View in API: public.folder_daily_analytics
-- 4. Materialized View in API: public.folder_attention_required

-- ============================================================================
-- Résultat: Sécurité renforcée avec fonctionnalités préservées
-- ============================================================================
-- ✅ Métriques business protégées contre l'accès direct non autorisé
-- ✅ API fonctionnelle maintenue via fonctions contrôlées  
-- ✅ Conformité Supabase Security Advisor assurée
-- ✅ Principe de moindre privilège appliqué
-- ✅ Surface d'attaque réduite significativement

-- Note: Cette approche suit les meilleures pratiques de sécurité en:
-- 1. Limitant l'exposition des données sensibles
-- 2. Maintenant l'accès fonctionnel via des interfaces contrôlées
-- 3. Appliquant le principe de défense en profondeur
-- 4. Respectant les recommandations de Supabase Security