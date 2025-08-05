-- Migration: create_bills_of_lading_tables
-- Description: Tables principales pour les BL, conteneurs et marchandises
-- Date: 2025-08-04

-- ============================================================================
-- Enums: freight_terms, bl_status, loading_method
-- Description: Énumérations pour les termes de fret et statuts des BL
-- ============================================================================

CREATE TYPE freight_terms AS ENUM (
  'prepaid',           -- Fret payé à l'avance
  'collect',           -- Fret à percevoir
  'prepaid_collect'    -- Mixte
);

CREATE TYPE bl_status AS ENUM (
  'draft',             -- Brouillon
  'issued',            -- Émis
  'shipped',           -- Embarqué
  'discharged',        -- Déchargé
  'delivered',         -- Livré
  'cancelled'          -- Annulé
);

CREATE TYPE loading_method AS ENUM (
  'FCL',               -- Full Container Load
  'LCL',               -- Less than Container Load
  'RORO',              -- Roll-on/Roll-off
  'BREAK_BULK'         -- Vrac conventionnel
);

-- ============================================================================
-- Table: bills_of_lading
-- Description: BL principaux avec toutes les informations de transport
-- ============================================================================

CREATE TABLE public.bills_of_lading (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification du BL
  bl_number varchar(50) NOT NULL,
  booking_reference varchar(50),
  export_reference varchar(100),
  service_contract varchar(50),
  
  -- Compagnie maritime
  shipping_company_id uuid NOT NULL REFERENCES public.shipping_companies(id),
  
  -- Parties impliquées (JSON pour flexibilité)
  shipper_info jsonb NOT NULL DEFAULT '{}',
  -- Structure: {"name": "", "address": "", "city": "", "country": "", "phone": "", "email": ""}
  
  consignee_info jsonb NOT NULL DEFAULT '{}',
  -- Structure: {"name": "", "address": "", "city": "", "country": "", "phone": "", "email": ""}
  
  notify_party_info jsonb DEFAULT '{}',
  -- Structure: {"name": "", "address": "", "city": "", "country": "", "phone": "", "email": ""}
  
  -- Informations de transport
  port_of_loading varchar(100) NOT NULL,
  port_of_discharge varchar(100) NOT NULL,
  place_of_receipt varchar(100),
  place_of_delivery varchar(100),
  
  -- Navire et voyage
  vessel_name varchar(100),
  voyage_number varchar(50),
  vessel_imo_number varchar(20),
  
  -- Dates importantes
  issue_date date NOT NULL,
  shipped_on_board_date date,
  estimated_arrival_date date,
  
  -- Termes commerciaux
  freight_terms freight_terms NOT NULL DEFAULT 'prepaid',
  loading_method loading_method NOT NULL DEFAULT 'FCL',
  
  -- Description générale de la cargaison
  cargo_description text,
  total_packages integer,
  total_gross_weight_kg decimal(12,3),
  total_volume_cbm decimal(10,3),
  
  -- Valeur déclarée
  declared_value_amount decimal(15,2),
  declared_value_currency varchar(3), -- Code ISO 4217
  
  -- Statut et métadonnées
  status bl_status DEFAULT 'draft',
  
  -- Liens vers l'utilisateur
  created_by uuid REFERENCES public.users(id),
  updated_by uuid REFERENCES public.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT bl_number_company_unique UNIQUE (bl_number, shipping_company_id),
  CONSTRAINT bl_issue_date_valid 
    CHECK (issue_date >= '1990-01-01' AND issue_date <= CURRENT_DATE + INTERVAL '1 year'),
  CONSTRAINT bl_shipped_date_after_issue 
    CHECK (shipped_on_board_date IS NULL OR shipped_on_board_date >= issue_date),
  CONSTRAINT bl_total_packages_positive 
    CHECK (total_packages IS NULL OR total_packages > 0),
  CONSTRAINT bl_declared_value_positive 
    CHECK (declared_value_amount IS NULL OR declared_value_amount >= 0),
  CONSTRAINT bl_currency_code_format 
    CHECK (declared_value_currency IS NULL OR declared_value_currency ~ '^[A-Z]{3}$')
);

-- ============================================================================
-- Table: bl_containers
-- Description: Conteneurs associés à chaque BL
-- ============================================================================

CREATE TABLE public.bl_containers (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  bl_id uuid NOT NULL REFERENCES public.bills_of_lading(id) ON DELETE CASCADE,
  container_type_id uuid NOT NULL REFERENCES public.container_types(id),
  
  -- Identification du conteneur
  container_number varchar(20) NOT NULL,
  seal_number varchar(50),
  
  -- Poids et mesures
  tare_weight_kg integer,
  gross_weight_kg decimal(10,3),
  net_weight_kg decimal(10,3),
  volume_cbm decimal(8,3),
  
  -- Méthode de chargement
  loading_method loading_method NOT NULL DEFAULT 'FCL',
  
  -- Marques et numéros
  marks_and_numbers text,
  
  -- Informations de chargement
  shipper_load_stow_count boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT bl_containers_number_format 
    CHECK (container_number ~ '^[A-Z]{4}[0-9]{7}$'),
  CONSTRAINT bl_containers_weights_logical 
    CHECK (
      (tare_weight_kg IS NULL OR tare_weight_kg > 0) AND
      (gross_weight_kg IS NULL OR gross_weight_kg > 0) AND
      (net_weight_kg IS NULL OR net_weight_kg >= 0) AND
      (tare_weight_kg IS NULL OR gross_weight_kg IS NULL OR net_weight_kg IS NULL OR
       gross_weight_kg >= tare_weight_kg)
    ),
  CONSTRAINT bl_containers_volume_positive 
    CHECK (volume_cbm IS NULL OR volume_cbm > 0)
);

-- ============================================================================
-- Table: bl_cargo_details
-- Description: Détails des marchandises par conteneur
-- ============================================================================

CREATE TABLE public.bl_cargo_details (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence au conteneur
  container_id uuid NOT NULL REFERENCES public.bl_containers(id) ON DELETE CASCADE,
  
  -- Classification des marchandises
  hs_code varchar(10), -- Code SH (Système Harmonisé)
  commodity_code varchar(20),
  
  -- Description
  description text NOT NULL,
  quantity integer,
  unit_type varchar(20), -- pieces, cartons, pallets, etc.
  
  -- Poids et mesures spécifiques
  weight_kg decimal(10,3),
  volume_cbm decimal(8,3),
  
  -- Marques et numéros spécifiques
  marks_and_numbers text,
  
  -- Package details
  number_of_packages integer,
  package_type varchar(50), -- cartons, bales, drums, etc.
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT bl_cargo_quantity_positive 
    CHECK (quantity IS NULL OR quantity > 0),
  CONSTRAINT bl_cargo_packages_positive 
    CHECK (number_of_packages IS NULL OR number_of_packages > 0),
  CONSTRAINT bl_cargo_weight_positive 
    CHECK (weight_kg IS NULL OR weight_kg > 0),
  CONSTRAINT bl_cargo_volume_positive 
    CHECK (volume_cbm IS NULL OR volume_cbm > 0),
  CONSTRAINT bl_cargo_hs_code_format 
    CHECK (hs_code IS NULL OR hs_code ~ '^[0-9]{4,10}$')
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index pour bills_of_lading
CREATE INDEX idx_bills_of_lading_bl_number ON public.bills_of_lading(bl_number);
CREATE INDEX idx_bills_of_lading_company ON public.bills_of_lading(shipping_company_id);
CREATE INDEX idx_bills_of_lading_status ON public.bills_of_lading(status);
CREATE INDEX idx_bills_of_lading_issue_date ON public.bills_of_lading(issue_date DESC);
CREATE INDEX idx_bills_of_lading_port_loading ON public.bills_of_lading(port_of_loading);
CREATE INDEX idx_bills_of_lading_port_discharge ON public.bills_of_lading(port_of_discharge);
CREATE INDEX idx_bills_of_lading_vessel ON public.bills_of_lading(vessel_name);
CREATE INDEX idx_bills_of_lading_created_by ON public.bills_of_lading(created_by);

-- Index GIN pour recherche dans les JSONs
CREATE INDEX idx_bills_of_lading_shipper_info ON public.bills_of_lading USING GIN(shipper_info);
CREATE INDEX idx_bills_of_lading_consignee_info ON public.bills_of_lading USING GIN(consignee_info);

-- Index pour bl_containers
CREATE INDEX idx_bl_containers_bl_id ON public.bl_containers(bl_id);
CREATE INDEX idx_bl_containers_container_type ON public.bl_containers(container_type_id);
CREATE INDEX idx_bl_containers_number ON public.bl_containers(container_number);
CREATE INDEX idx_bl_containers_loading_method ON public.bl_containers(loading_method);

-- Index pour bl_cargo_details
CREATE INDEX idx_bl_cargo_details_container_id ON public.bl_cargo_details(container_id);
CREATE INDEX idx_bl_cargo_details_hs_code ON public.bl_cargo_details(hs_code);
CREATE INDEX idx_bl_cargo_details_commodity_code ON public.bl_cargo_details(commodity_code);

-- Index de recherche full-text sur les descriptions
CREATE INDEX idx_bl_cargo_description_search ON public.bl_cargo_details USING GIN(to_tsvector('english', description));

-- ============================================================================
-- Triggers pour mettre à jour updated_at automatiquement
-- ============================================================================

CREATE TRIGGER update_bills_of_lading_updated_at 
    BEFORE UPDATE ON public.bills_of_lading 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bl_containers_updated_at 
    BEFORE UPDATE ON public.bl_containers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bl_cargo_details_updated_at 
    BEFORE UPDATE ON public.bl_cargo_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonctions utilitaires
-- ============================================================================

-- Fonction pour calculer le total des conteneurs d'un BL
CREATE OR REPLACE FUNCTION get_bl_container_count(bl_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM bl_containers 
  WHERE bl_id = bl_uuid;
$$;

-- Fonction pour calculer le poids total d'un BL
CREATE OR REPLACE FUNCTION get_bl_total_weight(bl_uuid uuid)
RETURNS decimal(12,3)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(gross_weight_kg), 0)
  FROM bl_containers 
  WHERE bl_id = bl_uuid;
$$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.bills_of_lading IS 'BL principaux avec informations de transport complètes';
COMMENT ON COLUMN public.bills_of_lading.bl_number IS 'Numéro unique du BL par compagnie';
COMMENT ON COLUMN public.bills_of_lading.shipper_info IS 'Informations expéditeur au format JSON';
COMMENT ON COLUMN public.bills_of_lading.consignee_info IS 'Informations destinataire au format JSON';
COMMENT ON COLUMN public.bills_of_lading.freight_terms IS 'Termes de paiement du fret (prepaid/collect)';

COMMENT ON TABLE public.bl_containers IS 'Conteneurs associés aux BL avec leurs spécifications';
COMMENT ON COLUMN public.bl_containers.container_number IS 'Numéro unique du conteneur (format ISO)';
COMMENT ON COLUMN public.bl_containers.shipper_load_stow_count IS 'Indique si le chargement est fait par l''expéditeur';

COMMENT ON TABLE public.bl_cargo_details IS 'Détails des marchandises transportées dans chaque conteneur';
COMMENT ON COLUMN public.bl_cargo_details.hs_code IS 'Code du Système Harmonisé pour classification douanière';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire les tables
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.bills_of_lading TO authenticated;
GRANT SELECT ON public.bl_containers TO authenticated;
GRANT SELECT ON public.bl_cargo_details TO authenticated;