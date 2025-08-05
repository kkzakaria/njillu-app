-- Migration: enhance_folder_alerts_with_container_tracking
-- Description: Enrichissement du système d'alertes des dossiers avec les retards de conteneurs
-- Date: 2025-08-04

-- ============================================================================
-- Vue améliorée: folders_requiring_attention (v2)
-- Description: Système d'alertes enrichi avec suivi des conteneurs
-- ============================================================================

-- Supprimer l'ancienne vue pour la recréer avec les nouvelles fonctionnalités
DROP VIEW IF EXISTS folders_requiring_attention;

CREATE VIEW folders_requiring_attention AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status,
  f.title,
  f.folder_date,
  f.expected_delivery_date,
  f.actual_delivery_date,
  f.priority,
  f.assigned_to,
  u.email as assignee_email,
  
  -- Agrégation des informations de conteneurs
  container_stats.total_containers,
  container_stats.overdue_containers,
  container_stats.no_eta_containers,
  container_stats.arriving_soon_containers,
  container_stats.max_container_delay_days,
  container_stats.avg_container_delay_days,
  
  -- Identification des problèmes (incluant conteneurs)
  ARRAY_REMOVE(ARRAY[
    -- Problèmes de dossier existants
    CASE WHEN f.bl_id IS NULL THEN 'Pas de BL associé' END,
    CASE WHEN f.assigned_to IS NULL THEN 'Pas d''assigné' END,
    CASE WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled') 
         THEN 'Livraison en retard' END,
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft' 
         THEN 'Brouillon ancien (>30j)' END,
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active' 
         THEN 'Actif depuis longtemps (>60j)' END,
    CASE WHEN f.priority = 'critical' AND f.status IN ('draft', 'active') 
         THEN 'Priorité critique non traitée' END,
    CASE WHEN f.priority = 'urgent' AND f.folder_date < CURRENT_DATE - INTERVAL '7 days' AND f.status IN ('draft', 'active') 
         THEN 'Urgent en attente (>7j)' END,
    CASE WHEN f.estimated_value IS NULL 
         THEN 'Valeur non estimée' END,
    
    -- Nouveaux problèmes liés aux conteneurs
    CASE WHEN container_stats.overdue_containers > 0 
         THEN container_stats.overdue_containers || ' conteneur(s) en retard' END,
    CASE WHEN container_stats.no_eta_containers > 0 
         THEN container_stats.no_eta_containers || ' conteneur(s) sans ETA' END,
    CASE WHEN container_stats.arriving_soon_containers > 0 AND f.status = 'draft'
         THEN container_stats.arriving_soon_containers || ' conteneur(s) arrivent bientôt (dossier non préparé)' END,
    CASE WHEN container_stats.max_container_delay_days >= 7 
         THEN 'Retard conteneur critique (>' || container_stats.max_container_delay_days || 'j)' END,
    CASE WHEN container_stats.total_containers > 0 AND container_stats.no_eta_containers = container_stats.total_containers
         THEN 'Aucun ETA sur les conteneurs' END
  ], NULL) as issues,
  
  -- Score de priorité enrichi (plus haut = plus urgent)
  (
    -- Score de base selon priorité
    CASE f.priority 
      WHEN 'critical' THEN 100
      WHEN 'urgent' THEN 75
      WHEN 'normal' THEN 50
      WHEN 'low' THEN 25
      ELSE 0
    END +
    
    -- Bonus pour problèmes de dossier
    CASE WHEN f.bl_id IS NULL THEN 20 ELSE 0 END +
    CASE WHEN f.assigned_to IS NULL THEN 15 ELSE 0 END +
    CASE WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE THEN 30 ELSE 0 END +
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft' THEN 25 ELSE 0 END +
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active' THEN 35 ELSE 0 END +
    
    -- Nouveaux bonus pour problèmes de conteneurs
    CASE WHEN container_stats.overdue_containers > 0 THEN 
      GREATEST(40, container_stats.overdue_containers * 10) -- Max 40 points, +10 par conteneur en retard
    ELSE 0 END +
    CASE WHEN container_stats.max_container_delay_days >= 7 THEN 50 -- Retard critique conteneur
    WHEN container_stats.max_container_delay_days >= 3 THEN 30    -- Retard modéré conteneur
    WHEN container_stats.max_container_delay_days >= 1 THEN 15    -- Retard léger conteneur
    ELSE 0 END +
    CASE WHEN container_stats.no_eta_containers > 0 THEN 
      container_stats.no_eta_containers * 5 -- +5 par conteneur sans ETA
    ELSE 0 END +
    CASE WHEN container_stats.arriving_soon_containers > 0 AND f.status = 'draft' THEN 25 -- Arrivée imminente non préparée
    ELSE 0 END
  ) as attention_score,
  
  -- Informations temporelles
  (CURRENT_DATE - f.folder_date)::integer as days_since_creation,
  CASE 
    WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled')
    THEN (CURRENT_DATE - f.expected_delivery_date)::integer
    ELSE NULL
  END as days_overdue

FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id

-- Sous-requête pour les statistiques de conteneurs par dossier
LEFT JOIN (
  SELECT 
    bl.folder_id,
    COUNT(c.id) as total_containers,
    COUNT(CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL THEN 1 END) as overdue_containers,
    COUNT(CASE WHEN c.estimated_arrival_date IS NULL THEN 1 END) as no_eta_containers,
    COUNT(CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' AND c.actual_arrival_date IS NULL THEN 1 END) as arriving_soon_containers,
    MAX(CASE 
      WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL 
      THEN (CURRENT_DATE - c.estimated_arrival_date)::integer 
      ELSE 0 
    END) as max_container_delay_days,
    ROUND(AVG(CASE 
      WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL 
      THEN (CURRENT_DATE - c.estimated_arrival_date)::integer 
      ELSE NULL 
    END), 1) as avg_container_delay_days
    
  FROM public.bills_of_lading bl
  INNER JOIN public.bl_containers c ON bl.id = c.bl_id
  WHERE bl.deleted_at IS NULL AND c.deleted_at IS NULL
  GROUP BY bl.folder_id
) container_stats ON f.bl_id IN (SELECT id FROM public.bills_of_lading WHERE folder_id = f.id AND deleted_at IS NULL)

WHERE f.deleted_at IS NULL
  AND (
    -- Conditions existantes
    f.bl_id IS NULL OR 
    f.assigned_to IS NULL OR
    (f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled')) OR
    (f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft') OR
    (f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active') OR
    (f.priority IN ('critical', 'urgent') AND f.status IN ('draft', 'active')) OR
    f.estimated_value IS NULL OR
    
    -- Nouvelles conditions liées aux conteneurs
    container_stats.overdue_containers > 0 OR
    container_stats.no_eta_containers > 0 OR
    (container_stats.arriving_soon_containers > 0 AND f.status = 'draft') OR
    container_stats.max_container_delay_days >= 3 OR
    (container_stats.total_containers > 0 AND container_stats.no_eta_containers = container_stats.total_containers)
  )
ORDER BY attention_score DESC, f.folder_date ASC;

-- ============================================================================
-- Vue dédiée: containers_requiring_attention  
-- Description: Alertes spécifiques aux conteneurs
-- ============================================================================

CREATE VIEW containers_requiring_attention AS
SELECT 
  c.id as container_id,
  c.container_number,
  c.bl_id,
  bl.bl_number,
  bl.folder_id,
  f.folder_number,
  f.transport_type,
  f.assigned_to,
  u.email as assignee_email,
  
  -- Informations de base du conteneur
  bl.port_of_discharge,
  c.arrival_location,
  sc.name as shipping_company_name,
  ct.iso_code as container_type,
  
  -- Dates et statuts
  c.estimated_arrival_date,
  c.actual_arrival_date,
  c.arrival_status,
  
  -- Calculs de délais
  get_container_delay_days(c.id) as delay_days,
  CASE 
    WHEN c.actual_arrival_date IS NOT NULL THEN 0
    WHEN c.estimated_arrival_date IS NOT NULL THEN (c.estimated_arrival_date - CURRENT_DATE)::integer
    ELSE NULL
  END as days_until_arrival,
  
  -- Identification des problèmes spécifiques au conteneur
  ARRAY_REMOVE(ARRAY[
    CASE WHEN c.estimated_arrival_date IS NULL THEN 'Pas d''ETA' END,
    CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL
         THEN 'En retard de ' || (CURRENT_DATE - c.estimated_arrival_date)::integer || ' jour(s)' END,
    CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '2 days' AND c.actual_arrival_date IS NULL AND f.status = 'draft'
         THEN 'Arrivée imminente - dossier non préparé' END,
    CASE WHEN c.arrival_status = 'delayed' THEN 'Retard confirmé par transporteur' END,
    CASE WHEN c.customs_clearance_date IS NULL AND c.actual_arrival_date IS NOT NULL AND c.actual_arrival_date < CURRENT_DATE - INTERVAL '2 days'
         THEN 'Dédouanement en attente' END,
    CASE WHEN c.delivery_ready_date IS NULL AND c.customs_clearance_date IS NOT NULL AND c.customs_clearance_date < CURRENT_DATE - INTERVAL '1 day'
         THEN 'Livraison non organisée' END
  ], NULL) as container_issues,
  
  -- Score de priorité pour conteneurs
  (
    -- Base selon statut
    CASE c.arrival_status
      WHEN 'delayed' THEN 60
      WHEN 'scheduled' THEN 40
      WHEN 'cancelled' THEN 80
      ELSE 20
    END +
    
    -- Bonus selon retard
    CASE 
      WHEN get_container_delay_days(c.id) >= 7 THEN 50
      WHEN get_container_delay_days(c.id) >= 3 THEN 30
      WHEN get_container_delay_days(c.id) >= 1 THEN 15
      ELSE 0
    END +
    
    -- Bonus selon urgence
    CASE 
      WHEN c.estimated_arrival_date IS NULL THEN 20
      WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '1 day' AND c.actual_arrival_date IS NULL AND f.status = 'draft' THEN 40
      WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' AND c.actual_arrival_date IS NULL AND f.status = 'draft' THEN 25
      ELSE 0
    END +
    
    -- Bonus selon priorité du dossier
    CASE f.priority
      WHEN 'critical' THEN 30
      WHEN 'urgent' THEN 20
      WHEN 'normal' THEN 10
      ELSE 0
    END
  ) as container_priority_score,
  
  -- Niveau d'urgence
  CASE 
    WHEN c.actual_arrival_date IS NOT NULL THEN 'Arrivé'
    WHEN c.estimated_arrival_date IS NULL THEN 'Pas d''ETA'
    WHEN get_container_delay_days(c.id) >= 7 THEN 'Retard critique'
    WHEN get_container_delay_days(c.id) >= 3 THEN 'Retard élevé'
    WHEN get_container_delay_days(c.id) >= 1 THEN 'En retard'
    WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '1 day' THEN 'Arrive demain'
    WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Arrive bientôt'
    ELSE 'Programmé'
  END as urgency_level,
  
  c.arrival_notes,
  c.created_at,
  c.updated_at

FROM public.bl_containers c
INNER JOIN public.bills_of_lading bl ON c.bl_id = bl.id
LEFT JOIN public.folders f ON bl.folder_id = f.id
LEFT JOIN public.users u ON f.assigned_to = u.id
INNER JOIN public.shipping_companies sc ON bl.shipping_company_id = sc.id
INNER JOIN public.container_types ct ON c.container_type_id = ct.id

WHERE c.deleted_at IS NULL 
  AND bl.deleted_at IS NULL
  AND (f.deleted_at IS NULL OR f.deleted_at IS NOT NULL) -- Inclure même les dossiers supprimés
  AND (
    -- Conteneurs nécessitant attention
    c.estimated_arrival_date IS NULL OR
    (c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL) OR
    (c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' AND c.actual_arrival_date IS NULL AND f.status = 'draft') OR
    c.arrival_status IN ('delayed', 'cancelled') OR
    (c.actual_arrival_date IS NOT NULL AND c.customs_clearance_date IS NULL AND c.actual_arrival_date < CURRENT_DATE - INTERVAL '2 days') OR
    (c.customs_clearance_date IS NOT NULL AND c.delivery_ready_date IS NULL AND c.customs_clearance_date < CURRENT_DATE - INTERVAL '1 day')
  )
ORDER BY container_priority_score DESC, c.estimated_arrival_date ASC NULLS LAST;

-- ============================================================================
-- Vue de synthèse: folder_container_summary
-- Description: Résumé des dossiers avec leurs conteneurs pour tableau de bord
-- ============================================================================

CREATE VIEW folder_container_summary AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status as folder_status,
  f.priority,
  f.title,
  f.assigned_to,
  u.email as assignee_email,
  
  -- Statistiques des conteneurs
  COALESCE(cs.total_containers, 0) as total_containers,
  COALESCE(cs.containers_with_eta, 0) as containers_with_eta,
  COALESCE(cs.overdue_containers, 0) as overdue_containers,
  COALESCE(cs.arrived_containers, 0) as arrived_containers,
  COALESCE(cs.arriving_soon, 0) as arriving_soon,
  
  -- Dates importantes
  f.folder_date,
  f.expected_delivery_date,
  cs.earliest_arrival,
  cs.latest_arrival,
  cs.max_delay_days,
  
  -- Indicateurs de santé
  CASE 
    WHEN cs.total_containers = 0 THEN 'Pas de conteneurs'
    WHEN cs.overdue_containers > 0 THEN 'Conteneurs en retard'
    WHEN cs.arriving_soon > 0 AND f.status = 'draft' THEN 'Préparation urgente'
    WHEN cs.containers_with_eta = cs.total_containers AND cs.arrived_containers = cs.total_containers THEN 'Tous arrivés'
    WHEN cs.containers_with_eta = cs.total_containers THEN 'Sous contrôle'
    WHEN cs.containers_with_eta < cs.total_containers THEN 'ETA manquants'
    ELSE 'À vérifier'
  END as container_health_status,
  
  -- Score de santé (0-100)
  CASE 
    WHEN cs.total_containers = 0 THEN 50
    ELSE GREATEST(0, LEAST(100, 
      100 - 
      (cs.overdue_containers * 30) - 
      ((cs.total_containers - cs.containers_with_eta) * 15) -
      (CASE WHEN cs.arriving_soon > 0 AND f.status = 'draft' THEN 20 ELSE 0 END) -
      (GREATEST(0, COALESCE(cs.max_delay_days, 0)) * 2)
    ))
  END as container_health_score

FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id
LEFT JOIN (
  SELECT 
    bl.folder_id,
    COUNT(c.id) as total_containers,
    COUNT(CASE WHEN c.estimated_arrival_date IS NOT NULL THEN 1 END) as containers_with_eta,
    COUNT(CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL THEN 1 END) as overdue_containers,
    COUNT(CASE WHEN c.actual_arrival_date IS NOT NULL THEN 1 END) as arrived_containers,
    COUNT(CASE WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' AND c.actual_arrival_date IS NULL THEN 1 END) as arriving_soon,
    MIN(c.estimated_arrival_date) as earliest_arrival,
    MAX(c.estimated_arrival_date) as latest_arrival,
    MAX(CASE 
      WHEN c.estimated_arrival_date IS NOT NULL AND c.estimated_arrival_date < CURRENT_DATE AND c.actual_arrival_date IS NULL 
      THEN (CURRENT_DATE - c.estimated_arrival_date)::integer 
      ELSE 0 
    END) as max_delay_days
  FROM public.bills_of_lading bl
  INNER JOIN public.bl_containers c ON bl.id = c.bl_id
  WHERE bl.deleted_at IS NULL AND c.deleted_at IS NULL
  GROUP BY bl.folder_id
) cs ON f.id = cs.folder_id

WHERE f.deleted_at IS NULL
ORDER BY 
  container_health_score ASC,
  cs.overdue_containers DESC,
  f.priority DESC,
  f.folder_date DESC;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON VIEW folders_requiring_attention IS 'Système d''alertes enrichi incluant le suivi des conteneurs et leurs retards';
COMMENT ON VIEW containers_requiring_attention IS 'Alertes spécifiques aux conteneurs nécessitant une attention immédiate';
COMMENT ON VIEW folder_container_summary IS 'Résumé de santé des dossiers basé sur l''état de leurs conteneurs';

-- ============================================================================
-- Fonctions utilitaires pour les alertes
-- ============================================================================

-- Fonction pour obtenir le nombre d'alertes par utilisateur
CREATE OR REPLACE FUNCTION get_user_alert_count(user_uuid uuid)
RETURNS TABLE (
  folder_alerts bigint,
  container_alerts bigint,
  total_alerts bigint,
  high_priority_alerts bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM folders_requiring_attention WHERE assigned_to = user_uuid) as folder_alerts,
    (SELECT COUNT(*) FROM containers_requiring_attention WHERE assigned_to = user_uuid) as container_alerts,
    (SELECT COUNT(*) FROM folders_requiring_attention WHERE assigned_to = user_uuid) + 
    (SELECT COUNT(*) FROM containers_requiring_attention WHERE assigned_to = user_uuid) as total_alerts,
    (SELECT COUNT(*) FROM folders_requiring_attention WHERE assigned_to = user_uuid AND attention_score >= 100) +
    (SELECT COUNT(*) FROM containers_requiring_attention WHERE assigned_to = user_uuid AND container_priority_score >= 100) as high_priority_alerts;
$$;

COMMENT ON FUNCTION get_user_alert_count(uuid) IS 'Compte les alertes par utilisateur assigné';