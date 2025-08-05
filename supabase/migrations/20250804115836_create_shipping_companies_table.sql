-- Migration: create_shipping_companies_table
-- Description: Table des compagnies maritimes basée sur l'analyse des BL (MSC, Maersk, CMA-CGM, etc.)
-- Date: 2025-08-04

-- ============================================================================
-- Enum: shipping_company_status
-- Description: Statut des compagnies maritimes
-- ============================================================================

CREATE TYPE shipping_company_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- ============================================================================
-- Table: shipping_companies
-- Description: Compagnies maritimes internationales avec leurs informations
-- ============================================================================

CREATE TABLE public.shipping_companies (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations de base
  name varchar(255) NOT NULL,
  short_name varchar(100),
  scac_code varchar(4) UNIQUE, -- Standard Carrier Alpha Code
  iata_code varchar(3),
  
  -- Informations de contact
  headquarters_country varchar(2), -- Code ISO 3166-1 alpha-2
  headquarters_city varchar(100),
  headquarters_address text,
  
  -- Contact details (JSON pour flexibilité)
  contact_info jsonb DEFAULT '{}',
  -- Structure: {"phone": "+41...", "fax": "+41...", "email": "info@...", "website": "https://..."}
  
  -- Informations commerciales
  status shipping_company_status DEFAULT 'active',
  founded_year integer,
  fleet_size integer,
  
  -- Métadonnées
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.users(id),
  
  -- Contraintes
  CONSTRAINT shipping_companies_name_not_empty 
    CHECK (length(trim(name)) > 0),
  CONSTRAINT shipping_companies_scac_format 
    CHECK (scac_code IS NULL OR scac_code ~ '^[A-Z]{4}$'),
  CONSTRAINT shipping_companies_country_format 
    CHECK (headquarters_country IS NULL OR headquarters_country ~ '^[A-Z]{2}$'),
  CONSTRAINT shipping_companies_founded_year_valid 
    CHECK (founded_year IS NULL OR (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE))),
  CONSTRAINT shipping_companies_fleet_size_positive 
    CHECK (fleet_size IS NULL OR fleet_size >= 0)
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

CREATE INDEX idx_shipping_companies_name ON public.shipping_companies(name);
CREATE INDEX idx_shipping_companies_scac_code ON public.shipping_companies(scac_code);
CREATE INDEX idx_shipping_companies_status ON public.shipping_companies(status);
CREATE INDEX idx_shipping_companies_country ON public.shipping_companies(headquarters_country);
CREATE INDEX idx_shipping_companies_created_at ON public.shipping_companies(created_at DESC);

-- Index GIN pour recherche dans contact_info JSON
CREATE INDEX idx_shipping_companies_contact_info ON public.shipping_companies USING GIN(contact_info);

-- ============================================================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================================================

CREATE TRIGGER update_shipping_companies_updated_at 
    BEFORE UPDATE ON public.shipping_companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Données de référence basées sur l'analyse des BL
-- ============================================================================

INSERT INTO public.shipping_companies (name, short_name, scac_code, headquarters_country, headquarters_city, contact_info) VALUES
-- Compagnies identifiées dans le dataset analysé
('Mediterranean Shipping Company S.A.', 'MSC', 'MSCU', 'CH', 'Geneva', '{"website": "https://www.msc.com", "phone": "+41 22 703 8888"}'),
('A.P. Moller - Maersk', 'Maersk', 'MAEU', 'DK', 'Copenhagen', '{"website": "https://www.maersk.com", "phone": "+45 33 63 33 63"}'),
('CMA CGM', 'CMA CGM', 'CMDU', 'FR', 'Marseille', '{"website": "https://www.cma-cgm.com", "phone": "+33 4 88 91 90 00"}'),
('COSCO SHIPPING Lines', 'COSCO', 'COSU', 'CN', 'Shanghai', '{"website": "https://lines.coscoshipping.com", "phone": "+86 21 3512 4888"}'),
('Hapag-Lloyd AG', 'Hapag-Lloyd', 'HLCU', 'DE', 'Hamburg', '{"website": "https://www.hapag-lloyd.com", "phone": "+49 40 3001 0"}'),
('Ocean Network Express', 'ONE', 'ONEY', 'SG', 'Singapore', '{"website": "https://www.one-line.com", "phone": "+65 6603 8888"}'),
('Orient Overseas Container Line', 'OOCL', 'OOLU', 'HK', 'Hong Kong', '{"website": "https://www.oocl.com", "phone": "+852 2833 3888"}'),
('Pacific International Lines', 'PIL', 'PILU', 'SG', 'Singapore', '{"website": "https://www.pilship.com", "phone": "+65 6270 7000"}'),
('Grimaldi Deep Sea S.p.A.', 'Grimaldi', 'GRDI', 'IT', 'Naples', '{"website": "https://www.grimaldi-lines.com", "phone": "+39 081 496 444"}'),
('ARKAS Line', 'ARKAS', 'ARKU', 'TR', 'Istanbul', '{"website": "https://www.arkas.com.tr", "phone": "+90 232 482 1500"}'),
('Gold Star Line Ltd.', 'Gold Star Line', 'GSLU', 'CN', 'Tianjin', '{"website": "https://www.goldstarline.com"}'),
('Lynux Shipping Limited', 'Lynux Shipping', 'LYNX', 'CN', 'Shanghai', '{"website": "https://www.lynuxshipping.com"}');

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.shipping_companies IS 'Compagnies maritimes internationales identifiées dans les BL analysés';
COMMENT ON COLUMN public.shipping_companies.id IS 'Identifiant unique de la compagnie';
COMMENT ON COLUMN public.shipping_companies.name IS 'Nom complet officiel de la compagnie';
COMMENT ON COLUMN public.shipping_companies.scac_code IS 'Standard Carrier Alpha Code (4 lettres) - identifiant unique international';
COMMENT ON COLUMN public.shipping_companies.contact_info IS 'Informations de contact au format JSON (email, téléphone, website, etc.)';
COMMENT ON COLUMN public.shipping_companies.headquarters_country IS 'Code pays ISO 3166-1 alpha-2 du siège social';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire la table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.shipping_companies TO authenticated;