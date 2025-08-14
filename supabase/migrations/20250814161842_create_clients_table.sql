-- Migration: create_clients_table
-- Description: Table clients avec support pour particuliers et entreprises
-- Date: 2025-08-14
-- Type: NOUVELLE MIGRATION

-- ============================================================================
-- Enums pour le système de clients
-- ============================================================================

-- Types de clients (particuliers ou entreprises)
CREATE TYPE client_type_enum AS ENUM (
  'individual',  -- Particulier
  'business'     -- Entreprise
);

-- Statuts des clients
CREATE TYPE client_status_enum AS ENUM (
  'active',      -- Actif
  'inactive',    -- Inactif
  'suspended',   -- Suspendu temporairement
  'archived'     -- Archivé
);

-- Industries pour les entreprises (optionnel)
CREATE TYPE industry_enum AS ENUM (
  'agriculture',
  'automotive',
  'banking',
  'construction',
  'consulting',
  'education',
  'energy',
  'finance',
  'food_beverage',
  'healthcare',
  'hospitality',
  'information_technology',
  'insurance',
  'logistics',
  'manufacturing',
  'media',
  'mining',
  'pharmaceutical',
  'real_estate',
  'retail',
  'telecommunications',
  'textiles',
  'transportation',
  'utilities',
  'other'
);

-- ============================================================================
-- Table principale des clients
-- ============================================================================

CREATE TABLE public.clients (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type de client (discriminant pour l'union)
  client_type client_type_enum NOT NULL,
  status client_status_enum NOT NULL DEFAULT 'active',
  
  -- Champs communs
  email varchar(255) NOT NULL,
  phone varchar(50),
  
  -- Adresse complète
  address_line1 varchar(255),
  address_line2 varchar(255),
  city varchar(100),
  postal_code varchar(20),
  state_province varchar(100),
  country varchar(2) DEFAULT 'FR', -- Code ISO 3166-1 alpha-2
  
  -- Champs pour particuliers (NULL si business)
  first_name varchar(100),
  last_name varchar(100),
  date_of_birth date,
  personal_id varchar(50), -- Numéro de pièce d'identité
  
  -- Champs pour entreprises (NULL si individual)
  company_name varchar(255),
  siret varchar(20), -- Numéro SIRET français
  contact_person_first_name varchar(100),
  contact_person_last_name varchar(100),
  contact_person_title varchar(100),
  industry industry_enum,
  vat_number varchar(50), -- Numéro de TVA intracommunautaire
  
  -- Informations commerciales
  credit_limit decimal(15,2) DEFAULT 0,
  credit_limit_currency varchar(3) DEFAULT 'EUR',
  payment_terms_days integer DEFAULT 30, -- Délai de paiement en jours
  preferred_language varchar(5) DEFAULT 'fr', -- Code langue (fr, en, es)
  
  -- Notes et observations
  internal_notes text,
  client_notes text,
  
  -- Métadonnées de gestion
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.users(id),
  
  -- Soft delete (compatible avec le système existant)
  deleted_at timestamptz NULL,
  deleted_by uuid REFERENCES public.users(id) NULL,
  
  -- ========================================================================
  -- Contraintes de validation
  -- ========================================================================
  
  -- Email valide
  CONSTRAINT clients_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  
  -- Format téléphone international
  CONSTRAINT clients_phone_format 
    CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\s\-()\.]+$'),
  
  -- Code pays ISO 3166-1 alpha-2
  CONSTRAINT clients_country_format 
    CHECK (country ~ '^[A-Z]{2}$'),
  
  -- Code postal français si pays = FR
  CONSTRAINT clients_postal_code_fr 
    CHECK (country != 'FR' OR postal_code ~ '^[0-9]{5}$'),
  
  -- Champs obligatoires pour particuliers
  CONSTRAINT clients_individual_required_fields 
    CHECK (
      client_type != 'individual' OR 
      (first_name IS NOT NULL AND last_name IS NOT NULL)
    ),
  
  -- Champs obligatoires pour entreprises
  CONSTRAINT clients_business_required_fields 
    CHECK (
      client_type != 'business' OR 
      (company_name IS NOT NULL AND contact_person_first_name IS NOT NULL AND contact_person_last_name IS NOT NULL)
    ),
  
  -- Champs exclusifs aux particuliers (NULL pour business)
  CONSTRAINT clients_individual_exclusive_fields 
    CHECK (
      client_type != 'business' OR 
      (first_name IS NULL AND last_name IS NULL AND date_of_birth IS NULL AND personal_id IS NULL)
    ),
  
  -- Champs exclusifs aux entreprises (NULL pour individual)
  CONSTRAINT clients_business_exclusive_fields 
    CHECK (
      client_type != 'individual' OR 
      (company_name IS NULL AND siret IS NULL AND contact_person_first_name IS NULL AND 
       contact_person_last_name IS NULL AND contact_person_title IS NULL AND 
       industry IS NULL AND vat_number IS NULL)
    ),
  
  -- Format SIRET français (14 chiffres)
  CONSTRAINT clients_siret_format 
    CHECK (siret IS NULL OR siret ~ '^[0-9]{14}$'),
  
  -- Format numéro TVA français (FR + 11 caractères)
  CONSTRAINT clients_vat_number_format 
    CHECK (vat_number IS NULL OR vat_number ~ '^[A-Z]{2}[A-Z0-9]+$'),
  
  -- Date de naissance cohérente (pas dans le futur, âge raisonnable)
  CONSTRAINT clients_date_of_birth_valid 
    CHECK (
      date_of_birth IS NULL OR 
      (date_of_birth <= CURRENT_DATE AND date_of_birth >= '1900-01-01'::date)
    ),
  
  -- Limite de crédit positive
  CONSTRAINT clients_credit_limit_positive 
    CHECK (credit_limit >= 0),
  
  -- Devise valide (code ISO 4217)
  CONSTRAINT clients_currency_format 
    CHECK (credit_limit_currency ~ '^[A-Z]{3}$'),
  
  -- Délai de paiement raisonnable (0-365 jours)
  CONSTRAINT clients_payment_terms_valid 
    CHECK (payment_terms_days >= 0 AND payment_terms_days <= 365),
  
  -- Langue supportée
  CONSTRAINT clients_language_valid 
    CHECK (preferred_language IN ('fr', 'en', 'es')),
  
  -- Cohérence soft delete
  CONSTRAINT clients_soft_delete_consistency 
    CHECK (
      (deleted_at IS NULL AND deleted_by IS NULL) OR 
      (deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
    ),
  
  -- deleted_at ne peut pas être dans le futur
  CONSTRAINT clients_deleted_at_not_future 
    CHECK (deleted_at IS NULL OR deleted_at <= now())
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

-- Index principal pour les clients actifs (requêtes fréquentes)
CREATE INDEX idx_clients_not_deleted ON public.clients(id) WHERE deleted_at IS NULL;

-- Index sur l'email (recherche et unicité métier)
CREATE INDEX idx_clients_email ON public.clients(email) WHERE deleted_at IS NULL;

-- Index pour filtrer par type de client
CREATE INDEX idx_clients_type_status ON public.clients(client_type, status) WHERE deleted_at IS NULL;

-- Index pour recherche par nom (particuliers)
CREATE INDEX idx_clients_individual_name ON public.clients(first_name, last_name) 
  WHERE client_type = 'individual' AND deleted_at IS NULL;

-- Index pour recherche par société (entreprises)
CREATE INDEX idx_clients_business_name ON public.clients(company_name) 
  WHERE client_type = 'business' AND deleted_at IS NULL;

-- Index pour recherche par SIRET
CREATE INDEX idx_clients_siret ON public.clients(siret) 
  WHERE siret IS NOT NULL AND deleted_at IS NULL;

-- Index géographique (pays/ville)
CREATE INDEX idx_clients_location ON public.clients(country, city) WHERE deleted_at IS NULL;

-- Index pour les créateurs et dates
CREATE INDEX idx_clients_created_by_date ON public.clients(created_by, created_at DESC) WHERE deleted_at IS NULL;

-- Index pour les clients supprimés (audit)
CREATE INDEX idx_clients_deleted_at ON public.clients(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_clients_deleted_by ON public.clients(deleted_by) WHERE deleted_at IS NOT NULL;

-- Index composite pour recherches complexes
CREATE INDEX idx_clients_type_country_status ON public.clients(client_type, country, status) WHERE deleted_at IS NULL;

-- Index pour recherche textuelle full-text (noms et sociétés)
CREATE INDEX idx_clients_search_individual ON public.clients 
  USING gin(to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '')))
  WHERE client_type = 'individual' AND deleted_at IS NULL;

CREATE INDEX idx_clients_search_business ON public.clients 
  USING gin(to_tsvector('french', coalesce(company_name, '')))
  WHERE client_type = 'business' AND deleted_at IS NULL;

-- ============================================================================
-- Trigger pour mise à jour automatique de updated_at
-- ============================================================================

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonctions utilitaires pour les clients
-- ============================================================================

-- Fonction pour obtenir le nom d'affichage d'un client
CREATE OR REPLACE FUNCTION get_client_display_name(client_row public.clients)
RETURNS varchar(255)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE client_row.client_type
    WHEN 'individual' THEN 
      coalesce(client_row.first_name, '') || 
      CASE WHEN client_row.first_name IS NOT NULL AND client_row.last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.last_name, '')
    WHEN 'business' THEN 
      coalesce(client_row.company_name, '')
    ELSE 'Client inconnu'
  END;
$$;

-- Fonction pour obtenir le contact principal d'un client
CREATE OR REPLACE FUNCTION get_client_contact_name(client_row public.clients)
RETURNS varchar(255)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE client_row.client_type
    WHEN 'individual' THEN 
      coalesce(client_row.first_name, '') || 
      CASE WHEN client_row.first_name IS NOT NULL AND client_row.last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.last_name, '')
    WHEN 'business' THEN 
      coalesce(client_row.contact_person_first_name, '') || 
      CASE WHEN client_row.contact_person_first_name IS NOT NULL AND client_row.contact_person_last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.contact_person_last_name, '') ||
      CASE WHEN client_row.contact_person_title IS NOT NULL THEN ' (' || client_row.contact_person_title || ')' ELSE '' END
    ELSE 'Contact inconnu'
  END;
$$;

-- Fonction pour valider l'unicité de l'email (métier)
CREATE OR REPLACE FUNCTION validate_client_email_uniqueness(
  p_client_id uuid,
  p_email varchar(255)
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.clients 
    WHERE email = p_email 
    AND id != coalesce(p_client_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND deleted_at IS NULL
  );
$$;

-- Fonction pour recherche full-text dans les clients
CREATE OR REPLACE FUNCTION search_clients(
  search_term text,
  client_types client_type_enum[] DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS SETOF public.clients
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.* FROM public.clients c
  WHERE c.deleted_at IS NULL
    AND (client_types IS NULL OR c.client_type = ANY(client_types))
    AND (
      -- Recherche dans les noms (particuliers)
      (c.client_type = 'individual' AND 
       to_tsvector('french', coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) 
       @@ plainto_tsquery('french', search_term))
      OR
      -- Recherche dans les sociétés (entreprises)
      (c.client_type = 'business' AND 
       to_tsvector('french', coalesce(c.company_name, '')) 
       @@ plainto_tsquery('french', search_term))
      OR
      -- Recherche dans l'email
      c.email ILIKE '%' || search_term || '%'
      OR
      -- Recherche dans le SIRET
      c.siret LIKE search_term || '%'
    )
  ORDER BY c.created_at DESC
  LIMIT limit_count;
$$;

-- ============================================================================
-- Vues utiles pour l'application
-- ============================================================================

-- Vue pour les clients actifs avec noms d'affichage
CREATE VIEW active_clients_with_display_names AS
SELECT 
  c.*,
  get_client_display_name(c) as display_name,
  get_client_contact_name(c) as contact_name,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Particulier'
    WHEN c.client_type = 'business' THEN 'Entreprise'
    ELSE 'Inconnu'
  END as type_label_fr,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Individual'
    WHEN c.client_type = 'business' THEN 'Business'
    ELSE 'Unknown'
  END as type_label_en,
  CASE 
    WHEN c.client_type = 'individual' THEN 'Particular'
    WHEN c.client_type = 'business' THEN 'Empresa'
    ELSE 'Desconocido'
  END as type_label_es
FROM public.clients c
WHERE c.deleted_at IS NULL
  AND c.status = 'active';

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.clients IS 'Table des clients avec support pour particuliers et entreprises';
COMMENT ON COLUMN public.clients.client_type IS 'Type de client: individual (particulier) ou business (entreprise)';
COMMENT ON COLUMN public.clients.status IS 'Statut du client: active, inactive, suspended, archived';
COMMENT ON COLUMN public.clients.email IS 'Adresse email du client (unique pour les clients actifs)';
COMMENT ON COLUMN public.clients.siret IS 'Numéro SIRET français (14 chiffres) - entreprises uniquement';
COMMENT ON COLUMN public.clients.vat_number IS 'Numéro de TVA intracommunautaire - entreprises uniquement';
COMMENT ON COLUMN public.clients.personal_id IS 'Numéro de pièce d''identité - particuliers uniquement';
COMMENT ON COLUMN public.clients.credit_limit IS 'Limite de crédit accordée au client';
COMMENT ON COLUMN public.clients.payment_terms_days IS 'Délai de paiement en jours (défaut: 30)';
COMMENT ON COLUMN public.clients.preferred_language IS 'Langue préférée du client (fr, en, es)';

COMMENT ON FUNCTION get_client_display_name(public.clients) IS 'Retourne le nom d''affichage d''un client selon son type';
COMMENT ON FUNCTION get_client_contact_name(public.clients) IS 'Retourne le nom du contact principal d''un client';
COMMENT ON FUNCTION validate_client_email_uniqueness(uuid, varchar) IS 'Valide l''unicité de l''email pour un client';
COMMENT ON FUNCTION search_clients(text, client_type_enum[], integer) IS 'Recherche full-text dans les clients';

COMMENT ON VIEW active_clients_with_display_names IS 'Vue des clients actifs avec noms d''affichage calculés';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire les clients
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.clients TO authenticated;
GRANT SELECT ON active_clients_with_display_names TO authenticated;

-- Permettre l'exécution des fonctions utilitaires
GRANT EXECUTE ON FUNCTION get_client_display_name(public.clients) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_contact_name(public.clients) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_client_email_uniqueness(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION search_clients(text, client_type_enum[], integer) TO authenticated;