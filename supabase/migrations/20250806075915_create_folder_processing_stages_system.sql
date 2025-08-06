-- Migration: create_folder_processing_stages_system
-- Description: Système de suivi des étapes de traitement de dossier avec workflow configurable
-- Date: 2025-08-06

-- ============================================================================
-- Enums pour le système d'étapes de traitement
-- ============================================================================

-- Étapes spécifiques au processus logistique
CREATE TYPE processing_stage_enum AS ENUM (
  'enregistrement',               -- 1. Prise en charge initiale du dossier
  'revision_facture_commerciale', -- 2. Vérification documents commerciaux  
  'elaboration_fdi',             -- 3. Fiche de Déclaration à l'Import
  'elaboration_rfcv',            -- 4. Rapport Final de Classification et Valeur
  'declaration_douaniere',       -- 5. Soumission aux autorités douanières
  'service_exploitation',        -- 6. Paiement factures compagnies, acquisition conteneurs
  'facturation_client',          -- 7. Élaboration facture finale client
  'livraison'                    -- 8. Livraison des conteneurs au destinataire
);

-- Statuts d'étape
CREATE TYPE stage_status_enum AS ENUM (
  'pending',      -- En attente
  'in_progress',  -- En cours  
  'completed',    -- Terminé
  'blocked',      -- Bloqué (attente externe)
  'skipped'       -- Ignoré (non applicable)
);

-- Priorités d'étape
CREATE TYPE stage_priority_enum AS ENUM (
  'low',          -- Priorité faible
  'normal',       -- Priorité normale
  'high',         -- Priorité élevée
  'urgent'        -- Urgent
);

-- ============================================================================
-- Table principale de suivi des étapes
-- ============================================================================

CREATE TABLE public.folder_processing_stages (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  
  -- Configuration de l'étape
  stage processing_stage_enum NOT NULL,
  status stage_status_enum NOT NULL DEFAULT 'pending',
  sequence_order integer NOT NULL,
  priority stage_priority_enum NOT NULL DEFAULT 'normal',
  
  -- Dates de suivi
  started_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz,
  estimated_completion_date timestamptz,
  
  -- Responsabilités et assignation
  assigned_to uuid REFERENCES public.users(id),
  completed_by uuid REFERENCES public.users(id),
  
  -- Métadonnées de traitement
  notes text,
  internal_comments text,                    -- Commentaires internes équipe
  client_visible_comments text,              -- Commentaires visibles client
  documents_required text[],                 -- Documents nécessaires
  documents_received text[],                 -- Documents reçus
  blocking_reason text,                      -- Raison du blocage si status='blocked'
  
  -- Durées et performance
  estimated_duration interval,               -- Durée estimée de l'étape
  actual_duration interval,                  -- Durée réelle calculée
  
  -- Configuration dynamique
  is_mandatory boolean DEFAULT true,         -- Étape obligatoire ou optionnelle
  can_be_skipped boolean DEFAULT false,      -- Peut être ignorée
  requires_approval boolean DEFAULT false,   -- Nécessite une approbation
  approval_by uuid REFERENCES public.users(id), -- Qui a approuvé
  approval_date timestamptz,                 -- Date d'approbation
  
  -- Audit et traçabilité
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.users(id),
  updated_by uuid REFERENCES public.users(id),
  
  -- Soft delete (cohérent avec l'architecture existante)
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id),
  
  -- ========================================================================
  -- Contraintes de validation
  -- ========================================================================
  
  -- Une seule instance de chaque étape par dossier
  CONSTRAINT folder_stages_unique_stage_per_folder 
    UNIQUE (folder_id, stage),
  
  -- L'ordre de séquence doit être cohérent (1-8 pour les 8 étapes)
  CONSTRAINT folder_stages_sequence_valid 
    CHECK (sequence_order BETWEEN 1 AND 8),
  
  -- Cohérence des dates
  CONSTRAINT folder_stages_date_logic 
    CHECK (
      (started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at) AND
      (due_date IS NULL OR estimated_completion_date IS NULL OR estimated_completion_date <= due_date)
    ),
  
  -- Si complété, doit avoir started_at et completed_by
  CONSTRAINT folder_stages_completion_requirements 
    CHECK (
      (status != 'completed') OR 
      (started_at IS NOT NULL AND completed_by IS NOT NULL AND completed_at IS NOT NULL)
    ),
  
  -- Si bloqué, doit avoir une raison
  CONSTRAINT folder_stages_blocking_reason_required 
    CHECK (
      (status != 'blocked') OR 
      (blocking_reason IS NOT NULL AND length(trim(blocking_reason)) > 0)
    ),
  
  -- Si nécessite approbation et complété, doit avoir approval info
  CONSTRAINT folder_stages_approval_requirements 
    CHECK (
      (NOT requires_approval OR status != 'completed') OR 
      (approval_by IS NOT NULL AND approval_date IS NOT NULL)
    ),
  
  -- Documents reçus doit être subset de documents requis
  CONSTRAINT folder_stages_documents_consistency 
    CHECK (
      documents_required IS NULL OR 
      documents_received IS NULL OR 
      documents_received <@ documents_required
    ),
  
  -- Cohérence soft delete
  CONSTRAINT folder_stages_soft_delete_consistency 
    CHECK (
      (deleted_at IS NULL AND deleted_by IS NULL) OR 
      (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
    )
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index principal pour les requêtes par dossier
CREATE INDEX idx_folder_stages_folder_id ON public.folder_processing_stages(folder_id);

-- Index pour les étapes actives (non supprimées)
CREATE INDEX idx_folder_stages_active ON public.folder_processing_stages(folder_id, sequence_order) 
WHERE deleted_at IS NULL;

-- Index pour le workflow et assignation
CREATE INDEX idx_folder_stages_status_assigned ON public.folder_processing_stages(status, assigned_to) 
WHERE deleted_at IS NULL;

-- Index pour les étapes en cours par utilisateur
CREATE INDEX idx_folder_stages_user_active ON public.folder_processing_stages(assigned_to, status) 
WHERE status IN ('pending', 'in_progress') AND deleted_at IS NULL;

-- Index pour les étapes bloquées (dashboard alertes)
CREATE INDEX idx_folder_stages_blocked ON public.folder_processing_stages(status, blocking_reason) 
WHERE status = 'blocked' AND deleted_at IS NULL;

-- Index pour les échéances (alertes de retard)
CREATE INDEX idx_folder_stages_due_dates ON public.folder_processing_stages(due_date, status) 
WHERE due_date IS NOT NULL AND status IN ('pending', 'in_progress') AND deleted_at IS NULL;

-- Index composite pour recherches complexes
CREATE INDEX idx_folder_stages_folder_sequence_status ON public.folder_processing_stages(folder_id, sequence_order, status) 
WHERE deleted_at IS NULL;

-- Index pour les performances et analytics
CREATE INDEX idx_folder_stages_completion_times ON public.folder_processing_stages(stage, completed_at, actual_duration) 
WHERE status = 'completed' AND deleted_at IS NULL;

-- Index pour les approbations en attente
CREATE INDEX idx_folder_stages_pending_approval ON public.folder_processing_stages(requires_approval, approval_by) 
WHERE requires_approval = true AND approval_by IS NULL AND deleted_at IS NULL;

-- ============================================================================
-- Triggers pour automatisation
-- ============================================================================

-- Trigger pour mise à jour automatique de updated_at
CREATE TRIGGER update_folder_stages_updated_at 
  BEFORE UPDATE ON public.folder_processing_stages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonctions utilitaires pour le système d'étapes
-- ============================================================================

-- Fonction pour calculer la durée réelle d'une étape
CREATE OR REPLACE FUNCTION calculate_stage_actual_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculer la durée réelle quand l'étape est complétée
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.started_at IS NOT NULL AND NEW.completed_at IS NOT NULL THEN
      NEW.actual_duration = NEW.completed_at - NEW.started_at;
    END IF;
  END IF;
  
  -- Mettre à jour started_at quand l'étape passe en cours
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' AND NEW.started_at IS NULL THEN
    NEW.started_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Appliquer le trigger pour le calcul automatique des durées
CREATE TRIGGER calculate_folder_stage_duration 
  BEFORE UPDATE ON public.folder_processing_stages 
  FOR EACH ROW 
  EXECUTE FUNCTION calculate_stage_actual_duration();

-- ============================================================================
-- Configuration par défaut des étapes
-- ============================================================================

-- Table de configuration des étapes par défaut
CREATE TABLE public.default_processing_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage processing_stage_enum NOT NULL UNIQUE,
  sequence_order integer NOT NULL UNIQUE,
  default_duration interval DEFAULT '2 days',
  is_mandatory boolean DEFAULT true,
  can_be_skipped boolean DEFAULT false,
  requires_approval boolean DEFAULT false,
  default_priority stage_priority_enum DEFAULT 'normal',
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Insérer les étapes par défaut
INSERT INTO public.default_processing_stages (stage, sequence_order, default_duration, description, requires_approval) VALUES
  ('enregistrement', 1, '4 hours', 'Prise en charge initiale du dossier et création du dossier client', false),
  ('revision_facture_commerciale', 2, '1 day', 'Vérification et validation des documents commerciaux fournis', true),
  ('elaboration_fdi', 3, '2 days', 'Élaboration de la Fiche de Déclaration à l''Import', false),
  ('elaboration_rfcv', 4, '3 days', 'Création du Rapport Final de Classification et de Valeur', true),
  ('declaration_douaniere', 5, '1 day', 'Soumission de la déclaration aux autorités douanières', false),
  ('service_exploitation', 6, '2 days', 'Paiement des factures compagnies et acquisition des conteneurs', false),
  ('facturation_client', 7, '4 hours', 'Élaboration et envoi de la facture finale au client', true),
  ('livraison', 8, '1 day', 'Organisation et exécution de la livraison des conteneurs', false);

-- ============================================================================
-- Trigger pour mise à jour automatique de la configuration
-- ============================================================================

CREATE TRIGGER update_default_stages_updated_at 
  BEFORE UPDATE ON public.default_processing_stages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.folder_processing_stages IS 'Suivi détaillé des étapes de traitement des dossiers logistiques';
COMMENT ON COLUMN public.folder_processing_stages.stage IS 'Étape spécifique du processus de traitement';
COMMENT ON COLUMN public.folder_processing_stages.sequence_order IS 'Ordre de la séquence dans le workflow (1-8)';
COMMENT ON COLUMN public.folder_processing_stages.blocking_reason IS 'Raison du blocage si l''étape est en statut blocked';
COMMENT ON COLUMN public.folder_processing_stages.documents_required IS 'Liste des documents nécessaires pour cette étape';
COMMENT ON COLUMN public.folder_processing_stages.documents_received IS 'Liste des documents effectivement reçus';
COMMENT ON COLUMN public.folder_processing_stages.actual_duration IS 'Durée réelle calculée automatiquement';

COMMENT ON TABLE public.default_processing_stages IS 'Configuration par défaut des étapes de traitement';
COMMENT ON FUNCTION calculate_stage_actual_duration() IS 'Calcule automatiquement la durée réelle des étapes';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés d'accéder aux étapes
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.folder_processing_stages TO authenticated;
GRANT SELECT ON public.default_processing_stages TO authenticated;

-- Permettre l'exécution des fonctions
GRANT EXECUTE ON FUNCTION calculate_stage_actual_duration() TO authenticated;