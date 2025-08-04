-- Migration: create_freight_charges_table
-- Description: Table des frais et charges pour les BL (freight, THC, handling, etc.)
-- Date: 2025-08-04

-- ============================================================================
-- Enums: charge_type, charge_category, calculation_basis
-- Description: Types et catégories de frais maritimes
-- ============================================================================

CREATE TYPE charge_type AS ENUM (
  'ocean_freight',      -- Fret maritime de base
  'thc_origin',         -- Terminal Handling Charges au départ
  'thc_destination',    -- Terminal Handling Charges à l'arrivée
  'documentation',      -- Frais de documentation
  'seal_fee',           -- Frais de scellé
  'container_cleaning', -- Nettoyage de conteneur
  'weighing',           -- Pesage
  'detention',          -- Surestarie
  'demurrage',          -- Surestarie portuaire
  'storage',            -- Stockage
  'customs_clearance',  -- Dédouanement
  'inspection',         -- Inspection
  'fumigation',         -- Fumigation
  'reefer_monitoring',  -- Surveillance frigorifique
  'bunker_adjustment',  -- Ajustement carburant (BAF)
  'currency_adjustment',-- Ajustement monétaire (CAF)
  'security_surcharge', -- Surcharge sécurité
  'war_risk_surcharge', -- Surcharge risque de guerre
  'port_congestion',    -- Surcharge congestion portuaire
  'peak_season',        -- Surcharge haute saison
  'heavy_lift',         -- Surcharge colis lourd
  'oversize',           -- Surcharge hors gabarit
  'hazmat',             -- Surcharge matières dangereuses
  'other'               -- Autres frais
);

CREATE TYPE charge_category AS ENUM (
  'mandatory',          -- Frais obligatoires
  'optional',           -- Frais optionnels
  'regulatory',         -- Frais réglementaires
  'surcharge',          -- Surcharges
  'penalty'             -- Pénalités
);

CREATE TYPE calculation_basis AS ENUM (
  'per_container',      -- Par conteneur
  'per_teu',            -- Par TEU
  'per_weight',         -- Par poids (kg/tonne)
  'per_volume',         -- Par volume (m³)
  'per_bl',             -- Par BL
  'percentage',         -- Pourcentage
  'flat_rate',          -- Forfait
  'per_day'             -- Par jour
);

-- ============================================================================
-- Table: bl_freight_charges
-- Description: Frais et charges associés aux BL
-- ============================================================================

CREATE TABLE public.bl_freight_charges (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence au BL
  bl_id uuid NOT NULL REFERENCES public.bills_of_lading(id) ON DELETE CASCADE,
  
  -- Classification du frais
  charge_type charge_type NOT NULL,
  charge_category charge_category NOT NULL DEFAULT 'mandatory',
  
  -- Description et référence
  description text NOT NULL,
  charge_code varchar(20), -- Code interne de la compagnie
  
  -- Montant et devise
  amount decimal(15,2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD', -- Code ISO 4217
  
  -- Base de calcul
  calculation_basis calculation_basis NOT NULL,
  quantity decimal(10,3), -- Quantité sur laquelle se base le calcul
  unit_rate decimal(15,4), -- Taux unitaire
  
  -- Informations sur qui paie
  paid_by varchar(20) DEFAULT 'shipper', -- shipper, consignee, third_party
  payment_status varchar(20) DEFAULT 'pending', -- pending, paid, overdue
  
  -- Facture et référence comptable
  invoice_number varchar(50),
  invoice_date date,
  due_date date,
  
  -- Taxes
  tax_rate decimal(5,2) DEFAULT 0, -- Pourcentage de TVA/taxes
  tax_amount decimal(15,2) DEFAULT 0,
  total_amount decimal(15,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  
  -- Période d'application (pour les frais périodiques)
  period_start date,
  period_end date,
  
  -- Informations complémentaires
  notes text,
  
  -- Statut
  is_active boolean DEFAULT true,
  
  -- Métadonnées
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.users(id),
  
  -- Contraintes
  CONSTRAINT bl_freight_charges_amount_positive 
    CHECK (amount >= 0),
  CONSTRAINT bl_freight_charges_tax_rate_valid 
    CHECK (tax_rate >= 0 AND tax_rate <= 100),
  CONSTRAINT bl_freight_charges_tax_amount_positive 
    CHECK (tax_amount >= 0),
  CONSTRAINT bl_freight_charges_currency_format 
    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT bl_freight_charges_quantity_positive 
    CHECK (quantity IS NULL OR quantity > 0),
  CONSTRAINT bl_freight_charges_unit_rate_positive 
    CHECK (unit_rate IS NULL OR unit_rate >= 0),
  CONSTRAINT bl_freight_charges_paid_by_valid 
    CHECK (paid_by IN ('shipper', 'consignee', 'third_party')),
  CONSTRAINT bl_freight_charges_payment_status_valid 
    CHECK (payment_status IN ('pending', 'paid', 'overdue', 'disputed', 'waived')),
  CONSTRAINT bl_freight_charges_period_logical 
    CHECK (period_start IS NULL OR period_end IS NULL OR period_end >= period_start),
  CONSTRAINT bl_freight_charges_due_date_after_invoice 
    CHECK (due_date IS NULL OR invoice_date IS NULL OR due_date >= invoice_date)
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index principaux
CREATE INDEX idx_bl_freight_charges_bl_id ON public.bl_freight_charges(bl_id);
CREATE INDEX idx_bl_freight_charges_type ON public.bl_freight_charges(charge_type);
CREATE INDEX idx_bl_freight_charges_category ON public.bl_freight_charges(charge_category);
CREATE INDEX idx_bl_freight_charges_currency ON public.bl_freight_charges(currency);
CREATE INDEX idx_bl_freight_charges_paid_by ON public.bl_freight_charges(paid_by);
CREATE INDEX idx_bl_freight_charges_payment_status ON public.bl_freight_charges(payment_status);
CREATE INDEX idx_bl_freight_charges_active ON public.bl_freight_charges(is_active);

-- Index pour les factures et paiements
CREATE INDEX idx_bl_freight_charges_invoice_number ON public.bl_freight_charges(invoice_number);
CREATE INDEX idx_bl_freight_charges_invoice_date ON public.bl_freight_charges(invoice_date DESC);
CREATE INDEX idx_bl_freight_charges_due_date ON public.bl_freight_charges(due_date);

-- Index pour les totaux et reporting
CREATE INDEX idx_bl_freight_charges_amount ON public.bl_freight_charges(amount);
CREATE INDEX idx_bl_freight_charges_total_amount ON public.bl_freight_charges(total_amount);

-- Index composites pour requêtes fréquentes
CREATE INDEX idx_bl_freight_charges_bl_type_status ON public.bl_freight_charges(bl_id, charge_type, payment_status);
CREATE INDEX idx_bl_freight_charges_type_currency ON public.bl_freight_charges(charge_type, currency);

-- ============================================================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================================================

CREATE TRIGGER update_bl_freight_charges_updated_at 
    BEFORE UPDATE ON public.bl_freight_charges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonctions utilitaires pour les calculs de frais
-- ============================================================================

-- Fonction pour calculer le total des frais d'un BL par type
CREATE OR REPLACE FUNCTION get_bl_charges_total(bl_uuid uuid, charge_type_filter charge_type DEFAULT NULL)
RETURNS decimal(15,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_amount), 0)
  FROM bl_freight_charges 
  WHERE bl_id = bl_uuid 
    AND is_active = true
    AND (charge_type_filter IS NULL OR charge_type = charge_type_filter);
$$;

-- Fonction pour calculer le total des frais impayés d'un BL
CREATE OR REPLACE FUNCTION get_bl_unpaid_charges(bl_uuid uuid)
RETURNS decimal(15,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_amount), 0)
  FROM bl_freight_charges 
  WHERE bl_id = bl_uuid 
    AND is_active = true
    AND payment_status IN ('pending', 'overdue', 'disputed');
$$;

-- Fonction pour obtenir le résumé des frais par devise
CREATE OR REPLACE FUNCTION get_bl_charges_by_currency(bl_uuid uuid)
RETURNS TABLE(
  currency varchar(3),
  total_amount decimal(15,2),
  paid_amount decimal(15,2),
  unpaid_amount decimal(15,2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bfc.currency,
    COALESCE(SUM(bfc.total_amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN bfc.payment_status = 'paid' THEN bfc.total_amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN bfc.payment_status IN ('pending', 'overdue', 'disputed') THEN bfc.total_amount ELSE 0 END), 0) as unpaid_amount
  FROM bl_freight_charges bfc
  WHERE bfc.bl_id = bl_uuid 
    AND bfc.is_active = true
  GROUP BY bfc.currency;
$$;

-- ============================================================================
-- Données de référence pour les frais standards
-- ============================================================================

-- Fonction pour insérer des frais standards selon le type de BL
CREATE OR REPLACE FUNCTION add_standard_charges(bl_uuid uuid, shipping_company_name varchar DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bl_record record;
  container_count integer;
BEGIN
  -- Récupérer les informations du BL
  SELECT bl.*, sc.name as company_name
  INTO bl_record
  FROM bills_of_lading bl
  JOIN shipping_companies sc ON bl.shipping_company_id = sc.id
  WHERE bl.id = bl_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'BL not found: %', bl_uuid;
  END IF;
  
  -- Compter les conteneurs
  SELECT COUNT(*) INTO container_count
  FROM bl_containers
  WHERE bl_id = bl_uuid;
  
  -- Ajouter les frais standards selon le type de fret
  IF bl_record.freight_terms = 'prepaid' THEN
    -- Fret maritime de base (par conteneur)
    INSERT INTO bl_freight_charges (
      bl_id, charge_type, charge_category, description, 
      amount, currency, calculation_basis, quantity, paid_by
    ) VALUES (
      bl_uuid, 'ocean_freight', 'mandatory', 'Ocean Freight - Prepaid',
      1500.00 * container_count, 'USD', 'per_container', container_count, 'shipper'
    );
    
    -- THC Origin
    INSERT INTO bl_freight_charges (
      bl_id, charge_type, charge_category, description, 
      amount, currency, calculation_basis, quantity, paid_by
    ) VALUES (
      bl_uuid, 'thc_origin', 'mandatory', 'Terminal Handling Charges - Origin',
      150.00 * container_count, 'USD', 'per_container', container_count, 'shipper'
    );
  END IF;
  
  -- Documentation fee (standard pour tous)
  INSERT INTO bl_freight_charges (
    bl_id, charge_type, charge_category, description, 
    amount, currency, calculation_basis, paid_by
  ) VALUES (
    bl_uuid, 'documentation', 'mandatory', 'Documentation Fee',
    50.00, 'USD', 'per_bl', 'shipper'
  );
  
END;
$$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.bl_freight_charges IS 'Frais et charges détaillés pour chaque BL';
COMMENT ON COLUMN public.bl_freight_charges.charge_type IS 'Type de frais selon la classification maritime standard';
COMMENT ON COLUMN public.bl_freight_charges.calculation_basis IS 'Base de calcul du frais (conteneur, poids, volume, etc.)';
COMMENT ON COLUMN public.bl_freight_charges.paid_by IS 'Qui paie le frais (shipper, consignee, third_party)';
COMMENT ON COLUMN public.bl_freight_charges.total_amount IS 'Montant total incluant les taxes (calculé automatiquement)';
COMMENT ON COLUMN public.bl_freight_charges.period_start IS 'Date de début pour les frais périodiques (detention, demurrage)';

COMMENT ON FUNCTION get_bl_charges_total(uuid, charge_type) IS 'Calcule le total des frais d''un BL, optionnellement filtré par type';
COMMENT ON FUNCTION get_bl_unpaid_charges(uuid) IS 'Calcule le total des frais impayés d''un BL';
COMMENT ON FUNCTION get_bl_charges_by_currency(uuid) IS 'Résumé des frais par devise avec statuts de paiement';
COMMENT ON FUNCTION add_standard_charges(uuid, varchar) IS 'Ajoute automatiquement les frais standards selon le type de BL';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire la table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.bl_freight_charges TO authenticated;