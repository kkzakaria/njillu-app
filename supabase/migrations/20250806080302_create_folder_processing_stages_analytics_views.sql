-- Migration: create_folder_processing_stages_analytics_views
-- Description: Vues analytics et dashboard pour le système d'étapes de traitement
-- Date: 2025-08-06

-- ============================================================================
-- Vue pour les statistiques par étape
-- ============================================================================

CREATE OR REPLACE VIEW folder_stage_statistics AS
SELECT 
  fps.stage,
  CASE fps.stage
    WHEN 'enregistrement' THEN 'Enregistrement'
    WHEN 'revision_facture_commerciale' THEN 'Révision Facture Commerciale'
    WHEN 'elaboration_fdi' THEN 'Élaboration FDI'
    WHEN 'elaboration_rfcv' THEN 'Élaboration RFCV'
    WHEN 'declaration_douaniere' THEN 'Déclaration Douanière'
    WHEN 'service_exploitation' THEN 'Service Exploitation'
    WHEN 'facturation_client' THEN 'Facturation Client'
    WHEN 'livraison' THEN 'Livraison'
  END as stage_name,
  fps.sequence_order,
  
  -- Comptages par statut
  COUNT(*) as total_instances,
  COUNT(CASE WHEN fps.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN fps.status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN fps.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END) as blocked_count,
  COUNT(CASE WHEN fps.status = 'skipped' THEN 1 END) as skipped_count,
  
  -- Pourcentages
  ROUND(
    COUNT(CASE WHEN fps.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 1
  ) as completion_rate,
  ROUND(
    COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 1
  ) as blocking_rate,
  
  -- Métriques de performance
  AVG(fps.actual_duration) as avg_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fps.actual_duration) as median_duration,
  MIN(fps.actual_duration) as min_duration,
  MAX(fps.actual_duration) as max_duration,
  
  -- Métriques de retard
  COUNT(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    AND fps.due_date IS NOT NULL 
    AND fps.due_date < now() 
    THEN 1 
  END) as overdue_count,
  AVG(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    AND fps.due_date IS NOT NULL 
    AND fps.due_date < now() 
    THEN EXTRACT(days FROM now() - fps.due_date)
  END) as avg_days_overdue,
  
  -- Métriques d'assignation
  COUNT(CASE WHEN fps.assigned_to IS NOT NULL THEN 1 END) as assigned_count,
  COUNT(CASE WHEN fps.requires_approval THEN 1 END) as approval_required_count,
  COUNT(CASE 
    WHEN fps.requires_approval 
    AND fps.approval_by IS NOT NULL 
    THEN 1 
  END) as approved_count,
  
  -- Dates d'analyse
  MIN(fps.created_at) as first_instance_date,
  MAX(fps.updated_at) as last_update_date

FROM folder_processing_stages fps
WHERE fps.deleted_at IS NULL
GROUP BY fps.stage, fps.sequence_order
ORDER BY fps.sequence_order;

-- ============================================================================
-- Vue pour le dashboard des dossiers avec progression
-- ============================================================================

CREATE OR REPLACE VIEW folders_with_stage_progress AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status as folder_status,
  f.title,
  f.priority as folder_priority,
  f.folder_date,
  f.assigned_to as folder_assigned_to,
  f.created_by as folder_created_by,
  
  -- Statistiques des étapes
  COUNT(fps.id) as total_stages,
  COUNT(CASE WHEN fps.status = 'completed' THEN 1 END) as completed_stages,
  COUNT(CASE WHEN fps.status = 'in_progress' THEN 1 END) as in_progress_stages,
  COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END) as blocked_stages,
  COUNT(CASE WHEN fps.status = 'pending' THEN 1 END) as pending_stages,
  COUNT(CASE WHEN fps.status = 'skipped' THEN 1 END) as skipped_stages,
  
  -- Pourcentage de progression
  ROUND(
    (COUNT(CASE WHEN fps.status IN ('completed', 'skipped') THEN 1 END)::numeric / 
    NULLIF(COUNT(fps.id), 0)) * 100, 1
  ) as completion_percentage,
  
  -- Étape actuelle et suivante
  (
    SELECT fps2.stage 
    FROM folder_processing_stages fps2 
    WHERE fps2.folder_id = f.id 
      AND fps2.status = 'in_progress' 
      AND fps2.deleted_at IS NULL
    ORDER BY fps2.sequence_order 
    LIMIT 1
  ) as current_stage,
  (
    SELECT fps3.stage 
    FROM folder_processing_stages fps3 
    WHERE fps3.folder_id = f.id 
      AND fps3.status = 'pending' 
      AND fps3.deleted_at IS NULL
    ORDER BY fps3.sequence_order 
    LIMIT 1
  ) as next_stage,
  
  -- Indicateurs d'alerte
  COUNT(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    AND fps.due_date IS NOT NULL 
    AND fps.due_date < now() 
    THEN 1 
  END) as overdue_stages,
  COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END) > 0 as has_blocked_stages,
  COUNT(CASE 
    WHEN fps.requires_approval 
    AND fps.approval_by IS NULL 
    AND fps.status = 'in_progress'
    THEN 1 
  END) as pending_approvals,
  
  -- Estimations
  MAX(fps.estimated_completion_date) as estimated_completion_date,
  CASE 
    WHEN COUNT(CASE 
      WHEN fps.status IN ('pending', 'in_progress') 
      AND fps.due_date IS NOT NULL 
      AND fps.due_date < now() 
      THEN 1 
    END) = 0 THEN true
    ELSE false
  END as is_on_schedule,
  
  -- Dates importantes
  MIN(fps.started_at) as first_stage_started,
  MAX(fps.completed_at) as last_stage_completed,
  f.created_at,
  f.updated_at

FROM folders f
LEFT JOIN folder_processing_stages fps ON fps.folder_id = f.id AND fps.deleted_at IS NULL
WHERE f.deleted_at IS NULL
GROUP BY f.id, f.folder_number, f.transport_type, f.status, f.title, 
         f.priority, f.folder_date, f.assigned_to, f.created_by,
         f.created_at, f.updated_at
ORDER BY f.folder_date DESC, f.folder_number;

-- ============================================================================
-- Vue pour les alertes et étapes nécessitant attention
-- ============================================================================

CREATE OR REPLACE VIEW stage_alerts_dashboard AS
SELECT 
  fps.id as stage_id,
  fps.folder_id,
  f.folder_number,
  fps.stage,
  CASE fps.stage
    WHEN 'enregistrement' THEN 'Enregistrement'
    WHEN 'revision_facture_commerciale' THEN 'Révision Facture Commerciale'
    WHEN 'elaboration_fdi' THEN 'Élaboration FDI'
    WHEN 'elaboration_rfcv' THEN 'Élaboration RFCV'
    WHEN 'declaration_douaniere' THEN 'Déclaration Douanière'
    WHEN 'service_exploitation' THEN 'Service Exploitation'
    WHEN 'facturation_client' THEN 'Facturation Client'
    WHEN 'livraison' THEN 'Livraison'
  END as stage_name,
  fps.status,
  fps.priority,
  fps.assigned_to,
  COALESCE(u.first_name || ' ' || u.last_name, u.email) as assignee_name,
  fps.due_date,
  fps.blocking_reason,
  fps.started_at,
  
  -- Calcul des jours de retard
  CASE 
    WHEN fps.due_date IS NOT NULL AND fps.due_date < now() 
    THEN EXTRACT(days FROM now() - fps.due_date)::integer
    ELSE 0
  END as days_overdue,
  
  -- Type d'alerte
  CASE 
    WHEN fps.status = 'blocked' THEN 'blocked'
    WHEN fps.status = 'in_progress' AND fps.requires_approval AND fps.approval_by IS NULL THEN 'approval_required'
    WHEN fps.due_date IS NOT NULL AND fps.due_date < now() THEN 'overdue'
    WHEN fps.priority = 'urgent' THEN 'urgent'
    WHEN fps.priority = 'high' THEN 'high_priority'
    WHEN fps.status = 'in_progress' AND fps.started_at < now() - interval '3 days' THEN 'long_running'
    ELSE 'normal'
  END as alert_type,
  
  -- Niveau de sévérité
  CASE 
    WHEN fps.status = 'blocked' THEN 'critical'
    WHEN fps.due_date IS NOT NULL AND fps.due_date < now() - interval '2 days' THEN 'critical'
    WHEN fps.priority = 'urgent' OR (fps.due_date IS NOT NULL AND fps.due_date < now()) THEN 'high'
    WHEN fps.priority = 'high' OR (fps.status = 'in_progress' AND fps.requires_approval AND fps.approval_by IS NULL) THEN 'medium'
    ELSE 'low'
  END as alert_severity,
  
  -- Score d'attention (0-100)
  (
    CASE fps.status
      WHEN 'blocked' THEN 40
      WHEN 'in_progress' THEN 20
      ELSE 10
    END +
    CASE fps.priority
      WHEN 'urgent' THEN 30
      WHEN 'high' THEN 20
      WHEN 'normal' THEN 10
      ELSE 5
    END +
    CASE 
      WHEN fps.due_date IS NOT NULL AND fps.due_date < now() 
      THEN LEAST(EXTRACT(days FROM now() - fps.due_date)::integer * 5, 30)
      ELSE 0
    END +
    CASE 
      WHEN fps.status = 'in_progress' AND fps.requires_approval AND fps.approval_by IS NULL 
      THEN 15
      ELSE 0
    END
  ) as attention_score,
  
  -- Message d'alerte
  CASE 
    WHEN fps.status = 'blocked' THEN 
      'Étape bloquée: ' || COALESCE(fps.blocking_reason, 'Raison non spécifiée')
    WHEN fps.due_date IS NOT NULL AND fps.due_date < now() THEN 
      'En retard de ' || EXTRACT(days FROM now() - fps.due_date)::integer || ' jour(s)'
    WHEN fps.status = 'in_progress' AND fps.requires_approval AND fps.approval_by IS NULL THEN
      'Approbation requise'
    WHEN fps.priority = 'urgent' THEN
      'Priorité urgente'
    WHEN fps.status = 'in_progress' AND fps.started_at < now() - interval '3 days' THEN
      'En cours depuis ' || EXTRACT(days FROM now() - fps.started_at)::integer || ' jour(s)'
    ELSE 'Surveillance normale'
  END as alert_message,
  
  -- Métadonnées
  f.transport_type,
  f.priority as folder_priority,
  fps.created_at,
  fps.updated_at

FROM folder_processing_stages fps
JOIN folders f ON f.id = fps.folder_id
LEFT JOIN users u ON u.id = fps.assigned_to
WHERE fps.deleted_at IS NULL
  AND f.deleted_at IS NULL
  AND fps.status IN ('pending', 'in_progress', 'blocked')
  AND (
    fps.status = 'blocked' 
    OR fps.priority IN ('high', 'urgent')
    OR (fps.due_date IS NOT NULL AND fps.due_date < now())
    OR (fps.status = 'in_progress' AND fps.requires_approval AND fps.approval_by IS NULL)
    OR (fps.status = 'in_progress' AND fps.started_at < now() - interval '3 days')
  )
ORDER BY attention_score DESC, fps.due_date ASC NULLS LAST;

-- ============================================================================
-- Vue pour l'analyse de performance par utilisateur
-- ============================================================================

CREATE OR REPLACE VIEW user_stage_performance AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(u.first_name || ' ' || u.last_name, u.email) as full_name,
  u.role,
  
  -- Statistiques d'assignation
  COUNT(fps.id) as total_assigned_stages,
  COUNT(CASE WHEN fps.status = 'completed' THEN 1 END) as completed_stages,
  COUNT(CASE WHEN fps.status = 'in_progress' THEN 1 END) as in_progress_stages,
  COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END) as blocked_stages,
  COUNT(CASE WHEN fps.status = 'pending' THEN 1 END) as pending_stages,
  
  -- Taux de réussite
  ROUND(
    COUNT(CASE WHEN fps.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(fps.id), 0) * 100, 1
  ) as completion_rate,
  
  -- Performance temporelle
  AVG(fps.actual_duration) as avg_completion_time,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fps.actual_duration) as median_completion_time,
  
  -- Retards et problèmes
  COUNT(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    AND fps.due_date IS NOT NULL 
    AND fps.due_date < now() 
    THEN 1 
  END) as overdue_stages,
  AVG(CASE 
    WHEN fps.completed_at IS NOT NULL 
    AND fps.due_date IS NOT NULL 
    AND fps.completed_at > fps.due_date 
    THEN EXTRACT(days FROM fps.completed_at - fps.due_date)
  END) as avg_delay_days,
  
  -- Charge de travail actuelle
  COUNT(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    THEN 1 
  END) as current_workload,
  
  -- Étapes par priorité
  COUNT(CASE WHEN fps.priority = 'urgent' THEN 1 END) as urgent_stages,
  COUNT(CASE WHEN fps.priority = 'high' THEN 1 END) as high_priority_stages,
  
  -- Dates d'activité
  MIN(fps.created_at) as first_assignment_date,
  MAX(fps.updated_at) as last_activity_date

FROM users u
LEFT JOIN folder_processing_stages fps ON fps.assigned_to = u.id AND fps.deleted_at IS NULL
WHERE true
GROUP BY u.id, u.email, u.first_name, u.last_name, u.role
HAVING COUNT(fps.id) > 0  -- Seulement les utilisateurs avec des assignations
ORDER BY completion_rate DESC, total_assigned_stages DESC;

-- ============================================================================
-- Vue pour les métriques de tendance temporelle
-- ============================================================================

CREATE OR REPLACE VIEW stage_trend_analysis AS
WITH monthly_stats AS (
  SELECT 
    DATE_TRUNC('month', fps.created_at) as month,
    fps.stage,
    COUNT(*) as stage_instances,
    COUNT(CASE WHEN fps.status = 'completed' THEN 1 END) as completed_instances,
    AVG(fps.actual_duration) as avg_duration,
    COUNT(CASE 
      WHEN fps.completed_at IS NOT NULL 
      AND fps.due_date IS NOT NULL 
      AND fps.completed_at > fps.due_date 
      THEN 1 
    END) as late_completions
  FROM folder_processing_stages fps
  WHERE fps.deleted_at IS NULL
    AND fps.created_at >= DATE_TRUNC('year', now()) - interval '1 year' -- Dernière année
  GROUP BY DATE_TRUNC('month', fps.created_at), fps.stage
)
SELECT 
  month,
  stage,
  CASE stage
    WHEN 'enregistrement' THEN 'Enregistrement'
    WHEN 'revision_facture_commerciale' THEN 'Révision Facture Commerciale'
    WHEN 'elaboration_fdi' THEN 'Élaboration FDI'
    WHEN 'elaboration_rfcv' THEN 'Élaboration RFCV'
    WHEN 'declaration_douaniere' THEN 'Déclaration Douanière'
    WHEN 'service_exploitation' THEN 'Service Exploitation'
    WHEN 'facturation_client' THEN 'Facturation Client'
    WHEN 'livraison' THEN 'Livraison'
  END as stage_name,
  stage_instances,
  completed_instances,
  ROUND(
    completed_instances::numeric / NULLIF(stage_instances, 0) * 100, 1
  ) as completion_rate,
  avg_duration,
  late_completions,
  ROUND(
    late_completions::numeric / NULLIF(completed_instances, 0) * 100, 1
  ) as late_completion_rate,
  
  -- Comparaison avec le mois précédent
  LAG(stage_instances) OVER (PARTITION BY stage ORDER BY month) as prev_month_instances,
  LAG(completed_instances) OVER (PARTITION BY stage ORDER BY month) as prev_month_completed,
  
  -- Calcul des variations
  ROUND(
    ((stage_instances - LAG(stage_instances) OVER (PARTITION BY stage ORDER BY month))::numeric / 
    NULLIF(LAG(stage_instances) OVER (PARTITION BY stage ORDER BY month), 0)) * 100, 1
  ) as instance_change_percent,
  ROUND(
    ((completed_instances - LAG(completed_instances) OVER (PARTITION BY stage ORDER BY month))::numeric / 
    NULLIF(LAG(completed_instances) OVER (PARTITION BY stage ORDER BY month), 0)) * 100, 1
  ) as completion_change_percent

FROM monthly_stats
ORDER BY month DESC, stage;

-- ============================================================================
-- Vue pour le dashboard exécutif des étapes
-- ============================================================================

CREATE OR REPLACE VIEW executive_stage_dashboard AS
SELECT 
  -- Métriques globales
  COUNT(DISTINCT fps.folder_id) as total_folders_with_stages,
  COUNT(fps.id) as total_stage_instances,
  COUNT(CASE WHEN fps.status = 'completed' THEN 1 END) as total_completed_stages,
  COUNT(CASE WHEN fps.status = 'in_progress' THEN 1 END) as total_in_progress_stages,
  COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END) as total_blocked_stages,
  COUNT(CASE WHEN fps.status = 'pending' THEN 1 END) as total_pending_stages,
  
  -- Taux de performance globaux
  ROUND(
    COUNT(CASE WHEN fps.status = 'completed' THEN 1 END)::numeric / 
    NULLIF(COUNT(fps.id), 0) * 100, 1
  ) as global_completion_rate,
  ROUND(
    COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END)::numeric / 
    NULLIF(COUNT(fps.id), 0) * 100, 1
  ) as global_blocking_rate,
  
  -- Métriques de retard
  COUNT(CASE 
    WHEN fps.status IN ('pending', 'in_progress') 
    AND fps.due_date IS NOT NULL 
    AND fps.due_date < now() 
    THEN 1 
  END) as total_overdue_stages,
  ROUND(
    COUNT(CASE 
      WHEN fps.status IN ('pending', 'in_progress') 
      AND fps.due_date IS NOT NULL 
      AND fps.due_date < now() 
      THEN 1 
    END)::numeric / NULLIF(COUNT(CASE 
      WHEN fps.status IN ('pending', 'in_progress') 
      THEN 1 
    END), 0) * 100, 1
  ) as overdue_rate,
  
  -- Métriques d'approbation
  COUNT(CASE WHEN fps.requires_approval THEN 1 END) as total_approval_required,
  COUNT(CASE 
    WHEN fps.requires_approval 
    AND fps.approval_by IS NOT NULL 
    THEN 1 
  END) as total_approved,
  COUNT(CASE 
    WHEN fps.requires_approval 
    AND fps.approval_by IS NULL 
    AND fps.status = 'in_progress'
    THEN 1 
  END) as pending_approvals,
  
  -- Performance temporelle
  AVG(fps.actual_duration) as avg_stage_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fps.actual_duration) as median_stage_duration,
  
  -- Métriques par transport
  COUNT(CASE WHEN f.transport_type = 'M' THEN 1 END) as maritime_folders,
  COUNT(CASE WHEN f.transport_type = 'T' THEN 1 END) as terrestrial_folders,
  COUNT(CASE WHEN f.transport_type = 'A' THEN 1 END) as aerial_folders,
  
  -- Métriques d'assignation
  COUNT(CASE WHEN fps.assigned_to IS NOT NULL THEN 1 END) as assigned_stages,
  COUNT(DISTINCT fps.assigned_to) as unique_assignees,
  
  -- Alertes et problèmes
  COUNT(CASE 
    WHEN fps.status = 'blocked' 
    OR fps.priority = 'urgent'
    OR (fps.due_date IS NOT NULL AND fps.due_date < now())
    THEN 1 
  END) as stages_requiring_attention,
  
  -- Dates de référence
  MIN(fps.created_at) as oldest_stage_date,
  MAX(fps.updated_at) as most_recent_update,
  current_date as report_date

FROM folder_processing_stages fps
JOIN folders f ON f.id = fps.folder_id
WHERE fps.deleted_at IS NULL
  AND f.deleted_at IS NULL;

-- ============================================================================
-- Permissions pour les vues
-- ============================================================================

GRANT SELECT ON folder_stage_statistics TO authenticated;
GRANT SELECT ON folders_with_stage_progress TO authenticated;
GRANT SELECT ON stage_alerts_dashboard TO authenticated;
GRANT SELECT ON user_stage_performance TO authenticated;
GRANT SELECT ON stage_trend_analysis TO authenticated;
GRANT SELECT ON executive_stage_dashboard TO authenticated;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON VIEW folder_stage_statistics IS 'Statistiques détaillées par type d''étape de traitement';
COMMENT ON VIEW folders_with_stage_progress IS 'Vue d''ensemble des dossiers avec leur progression par étapes';
COMMENT ON VIEW stage_alerts_dashboard IS 'Dashboard des alertes et étapes nécessitant une attention';
COMMENT ON VIEW user_stage_performance IS 'Analyse de performance des utilisateurs sur les étapes';
COMMENT ON VIEW stage_trend_analysis IS 'Analyse des tendances temporelles par étape';
COMMENT ON VIEW executive_stage_dashboard IS 'Dashboard exécutif avec métriques globales des étapes';