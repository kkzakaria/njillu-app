-- Migration: create_folders_table_and_enums
-- Description: Création de la table folders avec enums pour le système de numérotation M250804-001234
-- Date: 2025-08-04

-- ============================================================================
-- Enums pour le système de dossiers
-- ============================================================================

-- Types de transport (M, T, A pour numéros courts)
CREATE TYPE transport_type_enum AS ENUM (
  'M',    -- Maritime
  'T',    -- Terrestre  
  'A'     -- Aérien
);

-- Statuts des dossiers avec workflow complet
CREATE TYPE folder_status_enum AS ENUM (
  'draft',      -- Brouillon (créé mais pas encore actif)
  'active',     -- Actif (en cours de traitement)
  'shipped',    -- Expédié (marchandise embarquée)
  'delivered',  -- Livré (marchandise arrivée à destination)
  'completed',  -- Terminé (dossier finalisé, facturé)
  'cancelled',  -- Annulé (dossier abandonné)
  'archived'    -- Archivé (pour référence historique)
);

-- ============================================================================
-- Table principale des dossiers
-- ============================================================================

CREATE TABLE public.folders (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Numérotation automatique unique
  folder_number varchar(15) UNIQUE NOT NULL, -- Format: M250804-001234
  
  -- Classification
  transport_type transport_type_enum NOT NULL,
  status folder_status_enum NOT NULL DEFAULT 'draft',
  
  -- Informations descriptives
  title varchar(255),
  description text,
  client_reference varchar(100), -- Référence client externe
  
  -- Dates importantes
  folder_date date NOT NULL DEFAULT CURRENT_DATE, -- Date de création du dossier
  expected_delivery_date date,                    -- Date de livraison prévue
  actual_delivery_date date,                      -- Date de livraison réelle
  
  -- Informations commerciales
  priority varchar(20) DEFAULT 'normal', -- normal, urgent, critical
  estimated_value decimal(15,2),          -- Valeur estimée du dossier
  estimated_value_currency varchar(3) DEFAULT 'EUR', -- Code ISO 4217
  
  -- Notes et observations
  internal_notes text,  -- Notes internes pour l'équipe
  client_notes text,    -- Notes visibles par le client
  
  -- Métadonnées de gestion
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.users(id),
  assigned_to uuid REFERENCES public.users(id), -- Responsable du dossier
  
  -- Soft delete (compatible avec le système existant)
  deleted_at timestamptz NULL,
  deleted_by uuid REFERENCES public.users(id) NULL,
  
  -- ========================================================================
  -- Contraintes de validation
  -- ========================================================================
  
  -- Format strict du numéro de dossier: [MTA]YYMMDD-NNNNNN
  CONSTRAINT folders_number_format 
    CHECK (folder_number ~ '^[MTA][0-9]{6}-[0-9]{6}$'),
  
  -- Cohérence des dates
  CONSTRAINT folders_delivery_dates_logical 
    CHECK (expected_delivery_date IS NULL OR actual_delivery_date IS NULL OR actual_delivery_date >= expected_delivery_date),
  
  -- Folder date ne peut pas être dans le futur
  CONSTRAINT folders_date_not_future 
    CHECK (folder_date <= CURRENT_DATE),
  
  -- Valeur estimée positive
  CONSTRAINT folders_estimated_value_positive 
    CHECK (estimated_value IS NULL OR estimated_value >= 0),
  
  -- Format devise
  CONSTRAINT folders_currency_format 
    CHECK (estimated_value_currency ~ '^[A-Z]{3}$'),
  
  -- Priorité valide
  CONSTRAINT folders_priority_valid 
    CHECK (priority IN ('low', 'normal', 'urgent', 'critical')),
  
  -- Cohérence soft delete
  CONSTRAINT folders_soft_delete_consistency 
    CHECK (
      (deleted_at IS NULL AND deleted_by IS NULL) OR 
      (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
    ),
  
  -- deleted_at ne peut pas être dans le futur
  CONSTRAINT folders_deleted_at_not_future 
    CHECK (deleted_at IS NULL OR deleted_at <= now())
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index principal sur le numéro de dossier (recherche fréquente)
CREATE UNIQUE INDEX idx_folders_number ON public.folders(folder_number);

-- Index pour les dossiers actifs (requêtes fréquentes)
CREATE INDEX idx_folders_not_deleted ON public.folders(id) WHERE deleted_at IS NULL;

-- Index pour filtrer par type de transport et date
CREATE INDEX idx_folders_transport_date ON public.folders(transport_type, folder_date DESC);

-- Index pour le workflow (statut + assignation)
CREATE INDEX idx_folders_status_assigned ON public.folders(status, assigned_to) WHERE deleted_at IS NULL;

-- Index pour les tableaux de bord utilisateur
CREATE INDEX idx_folders_created_by_date ON public.folders(created_by, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_assigned_to_status ON public.folders(assigned_to, status) WHERE deleted_at IS NULL;

-- Index pour les recherches par référence client
CREATE INDEX idx_folders_client_reference ON public.folders(client_reference) WHERE client_reference IS NOT NULL AND deleted_at IS NULL;

-- Index pour les dossiers supprimés (audit)
CREATE INDEX idx_folders_deleted_at ON public.folders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_folders_deleted_by ON public.folders(deleted_by) WHERE deleted_at IS NOT NULL;

-- Index composite pour les recherches complexes
CREATE INDEX idx_folders_transport_status_date ON public.folders(transport_type, status, folder_date DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- Trigger pour mise à jour automatique de updated_at
-- ============================================================================

CREATE TRIGGER update_folders_updated_at 
  BEFORE UPDATE ON public.folders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonctions de validation et utilitaires
-- ============================================================================

-- Fonction pour valider un numéro de dossier
CREATE OR REPLACE FUNCTION validate_folder_number(folder_num varchar)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT folder_num ~ '^[MTA][0-9]{6}-[0-9]{6}$';
$$;

-- Fonction pour extraire le type de transport d'un numéro de dossier
CREATE OR REPLACE FUNCTION extract_transport_type_from_number(folder_num varchar)
RETURNS transport_type_enum
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE LEFT(folder_num, 1)
    WHEN 'M' THEN 'M'::transport_type_enum
    WHEN 'T' THEN 'T'::transport_type_enum  
    WHEN 'A' THEN 'A'::transport_type_enum
    ELSE NULL
  END;
$$;

-- Fonction pour extraire la date d'un numéro de dossier
CREATE OR REPLACE FUNCTION extract_date_from_folder_number(folder_num varchar)
RETURNS date
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN validate_folder_number(folder_num) THEN
      ('20' || SUBSTRING(folder_num, 2, 2) || '-' || 
       SUBSTRING(folder_num, 4, 2) || '-' || 
       SUBSTRING(folder_num, 6, 2))::date
    ELSE NULL
  END;
$$;

-- Fonction pour extraire le compteur d'un numéro de dossier
CREATE OR REPLACE FUNCTION extract_counter_from_folder_number(folder_num varchar)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN validate_folder_number(folder_num) THEN
      SUBSTRING(folder_num, 10, 6)::integer
    ELSE NULL
  END;
$$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.folders IS 'Dossiers de suivi avec numérotation automatique M250804-001234';
COMMENT ON COLUMN public.folders.folder_number IS 'Numéro unique généré automatiquement au format [MTA]YYMMDD-NNNNNN';
COMMENT ON COLUMN public.folders.transport_type IS 'Type de transport: M=Maritime, T=Terrestre, A=Aérien';
COMMENT ON COLUMN public.folders.status IS 'Statut du dossier dans le workflow de traitement';
COMMENT ON COLUMN public.folders.folder_date IS 'Date de création du dossier (utilisée dans la numérotation)';
COMMENT ON COLUMN public.folders.assigned_to IS 'Utilisateur responsable du traitement du dossier';
COMMENT ON COLUMN public.folders.client_reference IS 'Référence externe fournie par le client';
COMMENT ON COLUMN public.folders.priority IS 'Priorité de traitement du dossier';

COMMENT ON FUNCTION validate_folder_number(varchar) IS 'Valide le format d''un numéro de dossier';
COMMENT ON FUNCTION extract_transport_type_from_number(varchar) IS 'Extrait le type de transport d''un numéro de dossier';
COMMENT ON FUNCTION extract_date_from_folder_number(varchar) IS 'Extrait la date d''un numéro de dossier';
COMMENT ON FUNCTION extract_counter_from_folder_number(varchar) IS 'Extrait le compteur d''un numéro de dossier';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire les dossiers
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.folders TO authenticated;

-- Permettre l'exécution des fonctions utilitaires
GRANT EXECUTE ON FUNCTION validate_folder_number(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_transport_type_from_number(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_date_from_folder_number(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_counter_from_folder_number(varchar) TO authenticated;