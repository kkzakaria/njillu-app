-- Migration: add_soft_delete_columns
-- Description: Ajout des colonnes soft delete pour l'audit et la traçabilité des suppressions
-- Date: 2025-08-04

-- ============================================================================
-- Ajout des colonnes soft delete sur toutes les tables BL
-- ============================================================================

-- Table bills_of_lading (table principale)
ALTER TABLE public.bills_of_lading 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

-- Table bl_containers
ALTER TABLE public.bl_containers 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

-- Table bl_cargo_details  
ALTER TABLE public.bl_cargo_details 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

-- Table bl_freight_charges
ALTER TABLE public.bl_freight_charges 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

-- Tables de référence (optionnel - pour audit complet)
-- Normalement ces tables ne devraient pas être supprimées, mais pour l'audit complet
ALTER TABLE public.shipping_companies 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

ALTER TABLE public.container_types 
ADD COLUMN deleted_at timestamptz NULL,
ADD COLUMN deleted_by uuid REFERENCES public.users(id) NULL;

-- ============================================================================
-- Index pour optimiser les performances des requêtes soft delete
-- ============================================================================

-- Index pour les requêtes actives (deleted_at IS NULL)
CREATE INDEX idx_bills_of_lading_not_deleted ON public.bills_of_lading(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_containers_not_deleted ON public.bl_containers(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_cargo_details_not_deleted ON public.bl_cargo_details(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_freight_charges_not_deleted ON public.bl_freight_charges(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shipping_companies_not_deleted ON public.shipping_companies(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_container_types_not_deleted ON public.container_types(id) WHERE deleted_at IS NULL;

-- Index pour les requêtes d'audit (enregistrements supprimés)
CREATE INDEX idx_bills_of_lading_deleted_at ON public.bills_of_lading(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_containers_deleted_at ON public.bl_containers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_cargo_details_deleted_at ON public.bl_cargo_details(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_freight_charges_deleted_at ON public.bl_freight_charges(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_shipping_companies_deleted_at ON public.shipping_companies(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_container_types_deleted_at ON public.container_types(deleted_at) WHERE deleted_at IS NOT NULL;

-- Index composites pour les requêtes fréquentes avec soft delete
CREATE INDEX idx_bills_of_lading_company_not_deleted ON public.bills_of_lading(shipping_company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_containers_bl_not_deleted ON public.bl_containers(bl_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_cargo_details_container_not_deleted ON public.bl_cargo_details(container_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bl_freight_charges_bl_not_deleted ON public.bl_freight_charges(bl_id) WHERE deleted_at IS NULL;

-- Index pour qui a supprimé (audit utilisateur)
CREATE INDEX idx_bills_of_lading_deleted_by ON public.bills_of_lading(deleted_by) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_containers_deleted_by ON public.bl_containers(deleted_by) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_cargo_details_deleted_by ON public.bl_cargo_details(deleted_by) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_bl_freight_charges_deleted_by ON public.bl_freight_charges(deleted_by) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Contraintes pour garantir la cohérence des données
-- ============================================================================

-- Si deleted_at est défini, deleted_by doit l'être aussi (et vice versa)
ALTER TABLE public.bills_of_lading 
ADD CONSTRAINT bills_of_lading_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

ALTER TABLE public.bl_containers 
ADD CONSTRAINT bl_containers_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

ALTER TABLE public.bl_cargo_details 
ADD CONSTRAINT bl_cargo_details_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

ALTER TABLE public.bl_freight_charges 
ADD CONSTRAINT bl_freight_charges_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

ALTER TABLE public.shipping_companies 
ADD CONSTRAINT shipping_companies_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

ALTER TABLE public.container_types 
ADD CONSTRAINT container_types_soft_delete_consistency 
CHECK (
    (deleted_at IS NULL AND deleted_by IS NULL) OR 
    (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
);

-- deleted_at ne peut pas être dans le futur
ALTER TABLE public.bills_of_lading 
ADD CONSTRAINT bills_of_lading_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

ALTER TABLE public.bl_containers 
ADD CONSTRAINT bl_containers_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

ALTER TABLE public.bl_cargo_details 
ADD CONSTRAINT bl_cargo_details_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

ALTER TABLE public.bl_freight_charges 
ADD CONSTRAINT bl_freight_charges_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

ALTER TABLE public.shipping_companies 
ADD CONSTRAINT shipping_companies_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

ALTER TABLE public.container_types 
ADD CONSTRAINT container_types_deleted_at_not_future 
CHECK (deleted_at IS NULL OR deleted_at <= now());

-- ============================================================================
-- Vues pour simplifier les requêtes
-- ============================================================================

-- Vue pour les BL actifs (non supprimés)
CREATE VIEW public.active_bills_of_lading AS
SELECT * FROM public.bills_of_lading
WHERE deleted_at IS NULL;

-- Vue pour les conteneurs actifs
CREATE VIEW public.active_bl_containers AS
SELECT * FROM public.bl_containers
WHERE deleted_at IS NULL;

-- Vue pour les détails de cargaison actifs
CREATE VIEW public.active_bl_cargo_details AS
SELECT * FROM public.bl_cargo_details
WHERE deleted_at IS NULL;

-- Vue pour les frais actifs
CREATE VIEW public.active_bl_freight_charges AS
SELECT * FROM public.bl_freight_charges
WHERE deleted_at IS NULL;

-- Vue pour les compagnies actives
CREATE VIEW public.active_shipping_companies AS
SELECT * FROM public.shipping_companies
WHERE deleted_at IS NULL;

-- Vue pour les types de conteneurs actifs
CREATE VIEW public.active_container_types AS
SELECT * FROM public.container_types
WHERE deleted_at IS NULL;

-- ============================================================================
-- Vues d'audit pour les enregistrements supprimés
-- ============================================================================

-- Vue complète d'audit des suppressions avec informations utilisateur
CREATE VIEW public.audit_deleted_records AS
SELECT 
    'bills_of_lading' as table_name,
    bl.id,
    bl.bl_number as identifier,
    bl.deleted_at,
    bl.deleted_by,
    u.first_name || ' ' || u.last_name as deleted_by_name,
    u.email as deleted_by_email
FROM public.bills_of_lading bl
LEFT JOIN public.users u ON bl.deleted_by = u.id
WHERE bl.deleted_at IS NOT NULL

UNION ALL

SELECT 
    'bl_containers' as table_name,
    bc.id,
    bc.container_number as identifier,
    bc.deleted_at,
    bc.deleted_by,
    u.first_name || ' ' || u.last_name as deleted_by_name,
    u.email as deleted_by_email
FROM public.bl_containers bc
LEFT JOIN public.users u ON bc.deleted_by = u.id
WHERE bc.deleted_at IS NOT NULL

UNION ALL

SELECT 
    'bl_cargo_details' as table_name,
    bcd.id,
    LEFT(bcd.description, 50) as identifier,
    bcd.deleted_at,
    bcd.deleted_by,
    u.first_name || ' ' || u.last_name as deleted_by_name,
    u.email as deleted_by_email
FROM public.bl_cargo_details bcd
LEFT JOIN public.users u ON bcd.deleted_by = u.id
WHERE bcd.deleted_at IS NOT NULL

UNION ALL

SELECT 
    'bl_freight_charges' as table_name,
    bfc.id,
    bfc.description as identifier,
    bfc.deleted_at,
    bfc.deleted_by,
    u.first_name || ' ' || u.last_name as deleted_by_name,
    u.email as deleted_by_email
FROM public.bl_freight_charges bfc
LEFT JOIN public.users u ON bfc.deleted_by = u.id
WHERE bfc.deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON COLUMN public.bills_of_lading.deleted_at IS 'Date de suppression logique (NULL = actif, date = supprimé)';
COMMENT ON COLUMN public.bills_of_lading.deleted_by IS 'Utilisateur qui a effectué la suppression logique';

COMMENT ON VIEW public.active_bills_of_lading IS 'Vue des BL actifs (non supprimés logiquement)';
COMMENT ON VIEW public.audit_deleted_records IS 'Vue d''audit globale de tous les enregistrements supprimés avec détails utilisateur';

-- ============================================================================
-- Permissions sur les nouvelles vues
-- ============================================================================

-- Vues actives - accès standard aux utilisateurs authentifiés
GRANT SELECT ON public.active_bills_of_lading TO authenticated;
GRANT SELECT ON public.active_bl_containers TO authenticated;
GRANT SELECT ON public.active_bl_cargo_details TO authenticated;
GRANT SELECT ON public.active_bl_freight_charges TO authenticated;
GRANT SELECT ON public.active_shipping_companies TO authenticated;
GRANT SELECT ON public.active_container_types TO authenticated;

-- Vue d'audit - accès restreint (pour les administrateurs dans le futur)
-- Pour l'instant, accès aux utilisateurs authentifiés pour développement
GRANT SELECT ON public.audit_deleted_records TO authenticated;