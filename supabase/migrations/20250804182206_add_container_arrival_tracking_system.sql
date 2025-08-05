-- Migration: add_container_arrival_tracking_system
-- Description: Ajout du système de suivi des dates d'arrivée des conteneurs
-- Date: 2025-08-04

-- ============================================================================
-- Enum: container_arrival_status
-- Description: Statut d'arrivée des conteneurs pour suivi logistique
-- ============================================================================

CREATE TYPE container_arrival_status AS ENUM (
  'scheduled',    -- Arrivée programmée
  'delayed',      -- Retard confirmé
  'arrived',      -- Arrivé à destination
  'early',        -- Arrivé en avance
  'cancelled'     -- Arrivée annulée
);

-- ============================================================================
-- Modification table: bl_containers
-- Description: Ajout des colonnes de suivi des arrivées
-- ============================================================================

-- Ajouter les nouvelles colonnes de tracking des arrivées
ALTER TABLE public.bl_containers 
ADD COLUMN estimated_arrival_date date,
ADD COLUMN actual_arrival_date date,
ADD COLUMN arrival_status container_arrival_status DEFAULT 'scheduled',
ADD COLUMN arrival_notes text,
ADD COLUMN arrival_location varchar(100), -- Port/Terminal d'arrivée
ADD COLUMN customs_clearance_date date,
ADD COLUMN delivery_ready_date date;

-- ============================================================================
-- Contraintes et validations
-- ============================================================================

-- Contraintes logiques sur les dates
ALTER TABLE public.bl_containers 
ADD CONSTRAINT bl_containers_arrival_dates_logical
  CHECK (
    -- La date d'arrivée estimée ne peut pas être dans le passé lointain
    (estimated_arrival_date IS NULL OR estimated_arrival_date >= '2020-01-01') AND
    -- La date d'arrivée réelle ne peut pas être antérieure à la création du conteneur
    (actual_arrival_date IS NULL OR actual_arrival_date >= DATE(created_at)) AND
    -- Si arrivé, doit avoir une date d'arrivée réelle
    (arrival_status != 'arrived' OR actual_arrival_date IS NOT NULL) AND
    -- Dédouanement après arrivée réelle
    (customs_clearance_date IS NULL OR actual_arrival_date IS NULL OR customs_clearance_date >= actual_arrival_date) AND
    -- Prêt pour livraison après dédouanement
    (delivery_ready_date IS NULL OR customs_clearance_date IS NULL OR delivery_ready_date >= customs_clearance_date)
  );

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index sur estimated_arrival_date pour requêtes de planning
CREATE INDEX idx_bl_containers_estimated_arrival ON public.bl_containers(estimated_arrival_date) 
WHERE estimated_arrival_date IS NOT NULL AND deleted_at IS NULL;

-- Index sur actual_arrival_date pour historique
CREATE INDEX idx_bl_containers_actual_arrival ON public.bl_containers(actual_arrival_date DESC) 
WHERE actual_arrival_date IS NOT NULL AND deleted_at IS NULL;

-- Index sur arrival_status pour filtrage
CREATE INDEX idx_bl_containers_arrival_status ON public.bl_containers(arrival_status)
WHERE deleted_at IS NULL;

-- Index composite pour requêtes d'alertes (retards) - sans condition CURRENT_DATE
CREATE INDEX idx_bl_containers_overdue_tracking ON public.bl_containers(estimated_arrival_date, arrival_status, bl_id) 
WHERE arrival_status IN ('scheduled', 'delayed') AND deleted_at IS NULL;

-- Index sur arrival_location pour regroupement par terminal
CREATE INDEX idx_bl_containers_arrival_location ON public.bl_containers(arrival_location)
WHERE arrival_location IS NOT NULL AND deleted_at IS NULL;

-- ============================================================================
-- Fonctions utilitaires pour le calcul des retards
-- ============================================================================

-- Fonction pour calculer les jours de retard d'un conteneur
CREATE OR REPLACE FUNCTION get_container_delay_days(container_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN c.estimated_arrival_date IS NULL THEN NULL
      WHEN c.actual_arrival_date IS NOT NULL THEN 
        -- Si arrivé, calculer le retard réel
        GREATEST(0, (c.actual_arrival_date - c.estimated_arrival_date)::integer)
      WHEN c.estimated_arrival_date < CURRENT_DATE THEN 
        -- Si pas encore arrivé et date dépassée, calculer retard actuel
        (CURRENT_DATE - c.estimated_arrival_date)::integer
      ELSE 0 -- Pas encore en retard
    END
  FROM bl_containers c 
  WHERE c.id = container_uuid AND c.deleted_at IS NULL;
$$;

-- Fonction pour obtenir le statut automatique d'un conteneur
CREATE OR REPLACE FUNCTION get_container_auto_status(
  estimated_date date,
  actual_date date,
  current_status container_arrival_status
)
RETURNS container_arrival_status
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN actual_date IS NOT NULL AND estimated_date IS NOT NULL THEN
        CASE
          WHEN actual_date < estimated_date THEN 'early'::container_arrival_status
          WHEN actual_date > estimated_date THEN 'arrived'::container_arrival_status -- Arrivé même si en retard
          ELSE 'arrived'::container_arrival_status
        END
      WHEN actual_date IS NOT NULL THEN 'arrived'::container_arrival_status
      WHEN estimated_date IS NOT NULL AND estimated_date < CURRENT_DATE THEN 'delayed'::container_arrival_status
      ELSE COALESCE(current_status, 'scheduled'::container_arrival_status)
    END;
$$;

-- ============================================================================
-- Triggers pour mise à jour automatique du statut
-- ============================================================================

-- Fonction trigger pour mise à jour automatique du statut d'arrivée
CREATE OR REPLACE FUNCTION update_container_arrival_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mise à jour automatique du statut basé sur les dates
  NEW.arrival_status := get_container_auto_status(
    NEW.estimated_arrival_date,
    NEW.actual_arrival_date,
    NEW.arrival_status
  );
  
  RETURN NEW;
END;
$$;

-- Appliquer le trigger sur INSERT et UPDATE
CREATE TRIGGER update_container_arrival_status_trigger
  BEFORE INSERT OR UPDATE OF estimated_arrival_date, actual_arrival_date, arrival_status
  ON public.bl_containers
  FOR EACH ROW
  EXECUTE FUNCTION update_container_arrival_status();

-- ============================================================================
-- Vue pour le dashboard des arrivées de conteneurs
-- ============================================================================

CREATE VIEW container_arrivals_dashboard AS
SELECT 
  c.id as container_id,
  c.container_number,
  c.bl_id,
  bl.bl_number,
  bl.port_of_discharge,
  c.arrival_location,
  sc.name as shipping_company_name,
  sc.short_name as shipping_company_short,
  
  -- Dates clés
  c.estimated_arrival_date,
  c.actual_arrival_date,
  c.customs_clearance_date,
  c.delivery_ready_date,
  
  -- Statut et délais
  c.arrival_status,
  get_container_delay_days(c.id) as delay_days,
  
  -- Calculer les jours restants ou écoulés
  CASE 
    WHEN c.actual_arrival_date IS NOT NULL THEN 0
    WHEN c.estimated_arrival_date IS NOT NULL THEN (c.estimated_arrival_date - CURRENT_DATE)::integer
    ELSE NULL
  END as days_until_arrival,
  
  -- Indicateurs business
  CASE 
    WHEN c.actual_arrival_date IS NOT NULL THEN 'Arrivé'
    WHEN c.estimated_arrival_date IS NULL THEN 'Pas d''ETA'
    WHEN c.estimated_arrival_date < CURRENT_DATE THEN 'En retard'
    WHEN c.estimated_arrival_date = CURRENT_DATE THEN 'Aujourd''hui'
    WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Imminent'
    ELSE 'Programmé'
  END as arrival_urgency,
  
  -- Informations du conteneur et BL
  ct.iso_code as container_type,
  c.gross_weight_kg,
  c.volume_cbm,
  c.arrival_notes,
  
  -- Métadonnées
  c.created_at,
  c.updated_at

FROM public.bl_containers c
INNER JOIN public.bills_of_lading bl ON c.bl_id = bl.id
INNER JOIN public.shipping_companies sc ON bl.shipping_company_id = sc.id
INNER JOIN public.container_types ct ON c.container_type_id = ct.id
WHERE c.deleted_at IS NULL 
  AND bl.deleted_at IS NULL
ORDER BY 
  c.estimated_arrival_date ASC NULLS LAST,
  c.arrival_status DESC,
  c.created_at DESC;

-- ============================================================================
-- Vue des conteneurs en retard
-- ============================================================================

CREATE VIEW overdue_containers AS
SELECT 
  c.id as container_id,
  c.container_number,
  c.bl_id,
  bl.bl_number,
  bl.port_of_discharge,
  c.arrival_location,
  sc.name as shipping_company_name,
  
  -- Dates et retards
  c.estimated_arrival_date,
  c.actual_arrival_date,
  (CURRENT_DATE - c.estimated_arrival_date)::integer as days_overdue,
  c.arrival_status,
  
  -- Niveau de criticité basé sur le retard
  CASE 
    WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 7 THEN 'Critique'
    WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 3 THEN 'Élevé'
    WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 1 THEN 'Modéré'
    ELSE 'Faible'
  END as delay_severity,
  
  -- Score de priorité pour tri
  (
    CASE 
      WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 7 THEN 100
      WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 3 THEN 75
      WHEN (CURRENT_DATE - c.estimated_arrival_date)::integer >= 1 THEN 50
      ELSE 25
    END +
    CASE c.arrival_status
      WHEN 'delayed' THEN 25
      WHEN 'scheduled' THEN 15
      ELSE 0
    END
  ) as priority_score,
  
  c.arrival_notes,
  c.created_at

FROM public.bl_containers c
INNER JOIN public.bills_of_lading bl ON c.bl_id = bl.id
INNER JOIN public.shipping_companies sc ON bl.shipping_company_id = sc.id
WHERE c.deleted_at IS NULL 
  AND bl.deleted_at IS NULL
  AND c.estimated_arrival_date IS NOT NULL
  AND c.estimated_arrival_date < CURRENT_DATE
  AND c.actual_arrival_date IS NULL -- Pas encore arrivé
ORDER BY priority_score DESC, c.estimated_arrival_date ASC;

-- ============================================================================
-- Vue des arrivées prochaines (dans les 7 jours)
-- ============================================================================

CREATE VIEW upcoming_arrivals AS
SELECT 
  c.id as container_id,
  c.container_number,
  c.bl_id,
  bl.bl_number,
  bl.port_of_discharge,
  c.arrival_location,
  sc.name as shipping_company_name,
  sc.short_name as shipping_company_short,
  
  -- Informations de timing
  c.estimated_arrival_date,
  (c.estimated_arrival_date - CURRENT_DATE)::integer as days_until_arrival,
  
  -- Urgence
  CASE 
    WHEN c.estimated_arrival_date = CURRENT_DATE THEN 'Aujourd''hui'
    WHEN c.estimated_arrival_date = CURRENT_DATE + INTERVAL '1 day' THEN 'Demain'
    WHEN c.estimated_arrival_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Cette semaine'
    ELSE 'Semaine prochaine'
  END as arrival_timing,
  
  -- Statut et préparation
  c.arrival_status,
  c.arrival_notes,
  
  -- Informations du conteneur
  ct.iso_code as container_type,
  c.gross_weight_kg,
  c.volume_cbm,
  
  c.created_at

FROM public.bl_containers c
INNER JOIN public.bills_of_lading bl ON c.bl_id = bl.id
INNER JOIN public.shipping_companies sc ON bl.shipping_company_id = sc.id
INNER JOIN public.container_types ct ON c.container_type_id = ct.id
WHERE c.deleted_at IS NULL 
  AND bl.deleted_at IS NULL
  AND c.estimated_arrival_date IS NOT NULL
  AND c.estimated_arrival_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND c.actual_arrival_date IS NULL -- Pas encore arrivé
ORDER BY c.estimated_arrival_date ASC, c.created_at DESC;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON COLUMN public.bl_containers.estimated_arrival_date IS 'Date d''arrivée estimée du conteneur au port de destination';
COMMENT ON COLUMN public.bl_containers.actual_arrival_date IS 'Date d''arrivée réelle confirmée du conteneur';
COMMENT ON COLUMN public.bl_containers.arrival_status IS 'Statut de l''arrivée (scheduled, delayed, arrived, early, cancelled)';
COMMENT ON COLUMN public.bl_containers.arrival_location IS 'Terminal ou port spécifique d''arrivée';
COMMENT ON COLUMN public.bl_containers.customs_clearance_date IS 'Date de dédouanement du conteneur';
COMMENT ON COLUMN public.bl_containers.delivery_ready_date IS 'Date à laquelle le conteneur est prêt pour livraison';

COMMENT ON VIEW container_arrivals_dashboard IS 'Dashboard complet des arrivées de conteneurs avec indicateurs de performance';
COMMENT ON VIEW overdue_containers IS 'Conteneurs en retard avec calcul automatique de la criticité';
COMMENT ON VIEW upcoming_arrivals IS 'Arrivées prévues dans les 7 prochains jours pour planification';

COMMENT ON FUNCTION get_container_delay_days(uuid) IS 'Calcule le nombre de jours de retard d''un conteneur';
COMMENT ON FUNCTION get_container_auto_status(date, date, container_arrival_status) IS 'Détermine automatiquement le statut d''arrivée basé sur les dates';