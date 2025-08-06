-- Migration: create_folder_processing_stages_rls_policies
-- Description: Politiques RLS pour sécuriser l'accès aux étapes de traitement de dossier
-- Date: 2025-08-06

-- ============================================================================
-- Activation de RLS sur les tables
-- ============================================================================

-- Activer RLS sur la table des étapes de traitement
ALTER TABLE public.folder_processing_stages ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur la table de configuration par défaut
ALTER TABLE public.default_processing_stages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Politiques pour folder_processing_stages
-- ============================================================================

-- Politique SELECT : Tous les utilisateurs authentifiés peuvent voir les étapes
-- (cohérent avec l'accès existant aux dossiers)
CREATE POLICY "folder_stages_select_authenticated" ON public.folder_processing_stages
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Politique INSERT : Utilisateurs authentifiés peuvent créer des étapes
-- (généralement via les fonctions système)
CREATE POLICY "folder_stages_insert_authenticated" ON public.folder_processing_stages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    -- Doit être le créateur du dossier associé ou un admin
    EXISTS (
      SELECT 1 FROM public.folders f 
      WHERE f.id = folder_id 
        AND f.deleted_at IS NULL
        AND (
          f.created_by = auth.uid() 
          OR f.assigned_to = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
              AND u.role IN ('super_admin', 'admin')
          )
        )
    )
  );

-- Politique UPDATE : Peut modifier ses propres étapes assignées ou être admin
CREATE POLICY "folder_stages_update_assigned_or_admin" ON public.folder_processing_stages
  FOR UPDATE 
  TO authenticated 
  USING (
    -- L'étape est assignée à l'utilisateur connecté
    assigned_to = auth.uid()
    OR 
    -- Ou l'utilisateur a créé l'étape
    created_by = auth.uid()
    OR
    -- Ou l'utilisateur est le créateur/assigné du dossier parent
    EXISTS (
      SELECT 1 FROM public.folders f 
      WHERE f.id = folder_id 
        AND f.deleted_at IS NULL
        AND (f.created_by = auth.uid() OR f.assigned_to = auth.uid())
    )
    OR
    -- Ou l'utilisateur est admin/super_admin
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    -- Mêmes conditions que USING pour les nouvelles valeurs
    assigned_to = auth.uid()
    OR 
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.folders f 
      WHERE f.id = folder_id 
        AND f.deleted_at IS NULL
        AND (f.created_by = auth.uid() OR f.assigned_to = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role IN ('super_admin', 'admin')
    )
  );

-- Politique DELETE : Seuls les admins peuvent effectuer des suppressions
-- (soft delete via updated_by)
CREATE POLICY "folder_stages_delete_admin_only" ON public.folder_processing_stages
  FOR UPDATE 
  TO authenticated 
  USING (
    -- Seulement si c'est une opération de soft delete
    deleted_at IS NULL
    AND
    -- Et l'utilisateur est admin
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    -- Permet la mise à jour des champs deleted_at et deleted_by
    deleted_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- Politiques pour default_processing_stages
-- ============================================================================

-- Politique SELECT : Tous les utilisateurs authentifiés peuvent voir la configuration
CREATE POLICY "default_stages_select_authenticated" ON public.default_processing_stages
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Politique INSERT/UPDATE/DELETE : Seuls les super_admins peuvent modifier la configuration
CREATE POLICY "default_stages_modify_super_admin_only" ON public.default_processing_stages
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role = 'super_admin'
    )
  );

-- ============================================================================
-- Politiques avancées pour cas d'usage spécifiques
-- ============================================================================

-- Politique pour les approbations : Seuls les utilisateurs avec le droit d'approbation
-- peuvent modifier le champ approval_by
CREATE POLICY "folder_stages_approval_authorized_only" ON public.folder_processing_stages
  FOR UPDATE 
  TO authenticated 
  USING (
    -- L'utilisateur peut approuver si :
    -- 1. Il est admin/super_admin
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.role IN ('super_admin', 'admin')
    )
    OR
    -- 2. Il est le superviseur du dossier ou de l'utilisateur assigné
    EXISTS (
      SELECT 1 FROM public.folders f 
      WHERE f.id = folder_id 
        AND f.deleted_at IS NULL
        AND f.assigned_to = auth.uid()  -- Responsable du dossier
    )
    OR 
    -- 3. Cas spéciaux : utilisateurs avec rôle d'approbation (futurs développements)
    (
      assigned_to = auth.uid() 
      AND NOT requires_approval  -- Peut seulement modifier les étapes qui ne nécessitent pas d'approbation
    )
  );

-- ============================================================================
-- Fonctions d'aide pour les politiques RLS
-- ============================================================================

-- Fonction pour vérifier si un utilisateur peut accéder à un dossier
CREATE OR REPLACE FUNCTION user_can_access_folder(folder_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folders f 
    WHERE f.id = folder_uuid
      AND f.deleted_at IS NULL
      AND (
        f.created_by = user_uuid 
        OR f.assigned_to = user_uuid
        OR EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
      )
  );
$$;

-- Fonction pour vérifier si un utilisateur peut modifier une étape
CREATE OR REPLACE FUNCTION user_can_modify_stage(stage_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folder_processing_stages fps
    JOIN public.folders f ON f.id = fps.folder_id
    WHERE fps.id = stage_uuid
      AND fps.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND (
        fps.assigned_to = user_uuid
        OR fps.created_by = user_uuid
        OR f.created_by = user_uuid
        OR f.assigned_to = user_uuid
        OR EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
      )
  );
$$;

-- Fonction pour vérifier si un utilisateur peut approuver une étape
CREATE OR REPLACE FUNCTION user_can_approve_stage(stage_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folder_processing_stages fps
    JOIN public.folders f ON f.id = fps.folder_id
    WHERE fps.id = stage_uuid
      AND fps.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND fps.requires_approval = true
      AND (
        -- Admins peuvent toujours approuver
        EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Responsable du dossier peut approuver
        f.assigned_to = user_uuid
        OR
        -- Créateur du dossier peut approuver
        f.created_by = user_uuid
      )
  );
$$;

-- ============================================================================
-- Grants pour les nouvelles fonctions
-- ============================================================================

GRANT EXECUTE ON FUNCTION user_can_access_folder(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_modify_stage(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_approve_stage(uuid, uuid) TO authenticated;

-- ============================================================================
-- Permissions CRUD sur les tables
-- ============================================================================

-- Permissions sur folder_processing_stages
GRANT SELECT, INSERT, UPDATE ON public.folder_processing_stages TO authenticated;
-- DELETE n'est pas accordé - seulement soft delete via UPDATE

-- Permissions sur default_processing_stages  
GRANT SELECT ON public.default_processing_stages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.default_processing_stages TO authenticated; -- Contrôlé par RLS

-- ============================================================================
-- Index pour optimiser les politiques RLS
-- ============================================================================

-- Index pour optimiser les vérifications de droit d'accès aux dossiers
CREATE INDEX IF NOT EXISTS idx_folders_access_rights 
ON public.folders(created_by, assigned_to) WHERE deleted_at IS NULL;

-- Index pour optimiser les vérifications d'assignation d'étapes
CREATE INDEX IF NOT EXISTS idx_folder_stages_assignment 
ON public.folder_processing_stages(assigned_to, created_by, folder_id) WHERE deleted_at IS NULL;

-- Index pour optimiser les vérifications d'approbation
CREATE INDEX IF NOT EXISTS idx_folder_stages_approval 
ON public.folder_processing_stages(requires_approval, approval_by, folder_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- Commentaires de documentation
-- ============================================================================

COMMENT ON POLICY "folder_stages_select_authenticated" ON public.folder_processing_stages 
IS 'Permet à tous les utilisateurs authentifiés de voir les étapes de traitement';

COMMENT ON POLICY "folder_stages_insert_authenticated" ON public.folder_processing_stages 
IS 'Permet la création d''étapes par les propriétaires de dossiers et les admins';

COMMENT ON POLICY "folder_stages_update_assigned_or_admin" ON public.folder_processing_stages 
IS 'Permet la modification des étapes par les assignés, propriétaires de dossiers et admins';

COMMENT ON POLICY "folder_stages_delete_admin_only" ON public.folder_processing_stages 
IS 'Limite le soft delete aux administrateurs';

COMMENT ON POLICY "default_stages_select_authenticated" ON public.default_processing_stages 
IS 'Permet à tous les utilisateurs de voir la configuration par défaut des étapes';

COMMENT ON POLICY "default_stages_modify_super_admin_only" ON public.default_processing_stages 
IS 'Seuls les super administrateurs peuvent modifier la configuration des étapes';

COMMENT ON FUNCTION user_can_access_folder(uuid, uuid) 
IS 'Vérifie si un utilisateur peut accéder à un dossier donné';

COMMENT ON FUNCTION user_can_modify_stage(uuid, uuid) 
IS 'Vérifie si un utilisateur peut modifier une étape de traitement donnée';

COMMENT ON FUNCTION user_can_approve_stage(uuid, uuid) 
IS 'Vérifie si un utilisateur peut approuver une étape de traitement donnée';