-- Migration: fix_search_path_only
-- Description: Correction des search_path uniquement sans modification des signatures
-- Date: 2025-08-05

-- ============================================================================
-- CORRECTION DU SEARCH_PATH POUR TOUTES LES FONCTIONS SECURITY DEFINER
-- ============================================================================

-- Fonctions d'authentification
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.user_can_perform_action(uuid, public.user_role) SET search_path = '';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = '';
ALTER FUNCTION public.user_is_admin(uuid) SET search_path = '';
ALTER FUNCTION public.user_is_super_admin(uuid) SET search_path = '';

-- Fonctions BL
ALTER FUNCTION public.can_access_bl(uuid) SET search_path = '';
ALTER FUNCTION public.can_access_deleted_bl_data(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_user_accessible_bls() SET search_path = '';
ALTER FUNCTION public.get_user_deleted_bls(uuid) SET search_path = '';

-- Fonctions containers
ALTER FUNCTION public.can_access_container(uuid) SET search_path = '';
ALTER FUNCTION public.get_bl_container_count(uuid) SET search_path = '';
ALTER FUNCTION public.get_container_delay_days(uuid) SET search_path = '';
ALTER FUNCTION public.get_container_auto_status(date, date, public.container_arrival_status) SET search_path = '';

-- Fonctions charges
ALTER FUNCTION public.get_bl_charges_total(uuid, public.charge_type) SET search_path = '';
ALTER FUNCTION public.get_bl_charges_by_currency(uuid) SET search_path = '';
ALTER FUNCTION public.get_bl_unpaid_charges(uuid) SET search_path = '';
ALTER FUNCTION public.get_bl_total_weight(uuid) SET search_path = '';
ALTER FUNCTION public.add_standard_charges(uuid, character varying) SET search_path = '';

-- Fonctions soft delete
ALTER FUNCTION public.soft_delete_bl(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.soft_delete_container(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.soft_delete_cargo_detail(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.soft_delete_freight_charge(uuid, uuid) SET search_path = '';

-- Fonctions restore
ALTER FUNCTION public.restore_bl(uuid, uuid) SET search_path = '';

-- Fonctions audit
ALTER FUNCTION public.get_deletion_stats(uuid) SET search_path = '';
ALTER FUNCTION public.cleanup_old_deleted_records(integer, uuid) SET search_path = '';
ALTER FUNCTION public.check_soft_delete_integrity() SET search_path = '';

-- Fonctions folders
ALTER FUNCTION public.get_deleted_folders(integer, integer) SET search_path = '';
ALTER FUNCTION public.restore_folder(uuid) SET search_path = '';
ALTER FUNCTION public.soft_delete_folder(uuid) SET search_path = '';

-- Fonctions utilitaires
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.generate_folder_number(public.transport_type_enum, date) SET search_path = '';
ALTER FUNCTION public.preview_next_folder_number(public.transport_type_enum, date) SET search_path = '';
ALTER FUNCTION public.set_folder_number() SET search_path = '';
ALTER FUNCTION public.reset_folder_counter(integer, integer) SET search_path = '';

-- Fonctions extraction
ALTER FUNCTION public.extract_date_from_folder_number(character varying) SET search_path = '';
ALTER FUNCTION public.extract_transport_type_from_number(character varying) SET search_path = '';
ALTER FUNCTION public.extract_counter_from_folder_number(character varying) SET search_path = '';
ALTER FUNCTION public.validate_folder_number(character varying) SET search_path = '';

-- Fonctions relations folder-BL
ALTER FUNCTION public.link_folder_to_bl(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.unlink_folder_from_bl(uuid) SET search_path = '';
ALTER FUNCTION public.reassign_folder_to_bl(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_folder_with_bl(uuid) SET search_path = '';

-- Fonctions bulk operations
ALTER FUNCTION public.bulk_reassign_folder_bl_links(jsonb) SET search_path = '';
ALTER FUNCTION public.swap_folder_bl_links(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.validate_folder_bl_relationship() SET search_path = '';

-- Fonctions protection
ALTER FUNCTION public.protect_soft_delete_columns() SET search_path = '';
ALTER FUNCTION public.can_restore_record(text, uuid, uuid) SET search_path = '';

-- Fonctions nettoyage
ALTER FUNCTION public.cleanup_old_deleted_folders(integer) SET search_path = '';
ALTER FUNCTION public.hard_delete_folder(uuid) SET search_path = '';

-- Fonctions statistiques
ALTER FUNCTION public.get_period_statistics(date, date) SET search_path = '';
ALTER FUNCTION public.get_user_alert_count(uuid) SET search_path = '';

-- Fonctions triggers
ALTER FUNCTION public.update_container_arrival_status() SET search_path = '';
ALTER FUNCTION public.log_folder_changes() SET search_path = '';

-- ============================================================================
-- COMMENTAIRE FINAL
-- ============================================================================

COMMENT ON SCHEMA public IS 'Toutes les fonctions SECURITY DEFINER ont été sécurisées avec search_path vide - Phase 1 complète';