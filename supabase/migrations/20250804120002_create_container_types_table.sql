-- Migration: create_container_types_table
-- Description: Types de conteneurs basés sur l'analyse des BL (20GP, 40HC, 40HQ, etc.)
-- Date: 2025-08-04

-- ============================================================================
-- Enums: container_category & container_height_type
-- Description: Catégories et types de hauteur des conteneurs
-- ============================================================================

CREATE TYPE container_category AS ENUM (
  'general_purpose',    -- GP - Conteneurs secs standards
  'high_cube',         -- HC/HQ - Conteneurs haute capacité
  'refrigerated',      -- RF - Conteneurs frigorifiques
  'open_top',          -- OT - Conteneurs à toit ouvrant
  'flat_rack',         -- FR - Conteneurs à plateaux
  'tank',              -- TK - Conteneurs citernes
  'ventilated',        -- VH - Conteneurs ventilés
  'bulk',              -- BU - Conteneurs en vrac
  'platform',          -- PL - Plateformes
  'roro'               -- RoRo - Roll-on/Roll-off
);

CREATE TYPE container_height_type AS ENUM (
  'standard',          -- Hauteur standard 8'6"
  'high_cube'          -- Hauteur élevée 9'6"
);

-- ============================================================================
-- Table: container_types
-- Description: Types de conteneurs standards selon ISO et pratiques du secteur
-- ============================================================================

CREATE TABLE public.container_types (
  -- Clé primaire
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  iso_code varchar(10) NOT NULL UNIQUE, -- Ex: 20GP, 40HC, 40HQ, 20RF
  description varchar(255) NOT NULL,
  
  -- Classification
  category container_category NOT NULL,
  size_feet integer NOT NULL, -- 20, 40, 45, 53
  height_type container_height_type NOT NULL DEFAULT 'standard',
  
  -- Dimensions physiques (en mètres)
  length_meters decimal(5,2), -- Longueur externe
  width_meters decimal(5,2),  -- Largeur externe
  height_meters decimal(5,2), -- Hauteur externe
  
  -- Dimensions internes (en mètres)
  internal_length_meters decimal(5,2),
  internal_width_meters decimal(5,2),
  internal_height_meters decimal(5,2),
  
  -- Poids et capacités
  tare_weight_kg integer,     -- Poids à vide (kg)
  max_payload_kg integer,     -- Charge utile maximale (kg)
  max_gross_weight_kg integer, -- Poids brut maximal (kg)
  volume_cubic_meters decimal(8,2), -- Volume interne (m³)
  
  -- Équivalence TEU (Twenty-foot Equivalent Unit)
  teu_equivalent decimal(3,1) NOT NULL DEFAULT 1,
  
  -- Caractéristiques spéciales
  special_features jsonb DEFAULT '{}',
  -- Structure: {"temperature_range": "-25/+25", "power_required": true, "hazmat_approved": false}
  
  -- Statut
  is_active boolean DEFAULT true,
  
  -- Métadonnées
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT container_types_size_feet_valid 
    CHECK (size_feet IN (10, 20, 40, 45, 53)),
  CONSTRAINT container_types_teu_positive 
    CHECK (teu_equivalent > 0),
  CONSTRAINT container_types_dimensions_positive 
    CHECK (
      length_meters IS NULL OR length_meters > 0 AND
      width_meters IS NULL OR width_meters > 0 AND
      height_meters IS NULL OR height_meters > 0
    ),
  CONSTRAINT container_types_weights_logical 
    CHECK (
      tare_weight_kg IS NULL OR tare_weight_kg > 0 AND
      max_payload_kg IS NULL OR max_payload_kg > 0 AND
      max_gross_weight_kg IS NULL OR max_gross_weight_kg > 0 AND
      (tare_weight_kg IS NULL OR max_payload_kg IS NULL OR max_gross_weight_kg IS NULL OR
       max_gross_weight_kg >= tare_weight_kg + max_payload_kg)
    )
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

CREATE INDEX idx_container_types_iso_code ON public.container_types(iso_code);
CREATE INDEX idx_container_types_category ON public.container_types(category);
CREATE INDEX idx_container_types_size_feet ON public.container_types(size_feet);
CREATE INDEX idx_container_types_height_type ON public.container_types(height_type);
CREATE INDEX idx_container_types_active ON public.container_types(is_active);
CREATE INDEX idx_container_types_teu ON public.container_types(teu_equivalent);

-- Index GIN pour recherche dans special_features JSON
CREATE INDEX idx_container_types_special_features ON public.container_types USING GIN(special_features);

-- ============================================================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================================================

CREATE TRIGGER update_container_types_updated_at 
    BEFORE UPDATE ON public.container_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Données de référence basées sur l'analyse des BL et standards ISO
-- ============================================================================

INSERT INTO public.container_types (
  iso_code, description, category, size_feet, height_type, 
  length_meters, width_meters, height_meters,
  internal_length_meters, internal_width_meters, internal_height_meters,
  tare_weight_kg, max_payload_kg, max_gross_weight_kg, volume_cubic_meters, teu_equivalent
) VALUES

-- Conteneurs 20 pieds identifiés dans les BL
('20GP', '20ft General Purpose Container', 'general_purpose', 20, 'standard', 
 6.06, 2.44, 2.59, 5.90, 2.35, 2.39, 2300, 28180, 30480, 33.2, 1.0),

('20DV', '20ft Dry Van Container', 'general_purpose', 20, 'standard', 
 6.06, 2.44, 2.59, 5.90, 2.35, 2.39, 2300, 28180, 30480, 33.2, 1.0),

('20HC', '20ft High Cube Container', 'high_cube', 20, 'high_cube', 
 6.06, 2.44, 2.90, 5.90, 2.35, 2.70, 2500, 27980, 30480, 37.4, 1.0),

-- Conteneurs 40 pieds identifiés dans les BL (les plus fréquents)
('40GP', '40ft General Purpose Container', 'general_purpose', 40, 'standard', 
 12.19, 2.44, 2.59, 12.03, 2.35, 2.39, 3800, 26680, 30480, 67.7, 2.0),

('40HC', '40ft High Cube Container', 'high_cube', 40, 'high_cube', 
 12.19, 2.44, 2.90, 12.03, 2.35, 2.70, 4000, 26480, 30480, 76.3, 2.0),

('40HQ', '40ft High Cube Container (Alternative)', 'high_cube', 40, 'high_cube', 
 12.19, 2.44, 2.90, 12.03, 2.35, 2.70, 4000, 26480, 30480, 76.3, 2.0),

-- Conteneurs spécialisés potentiels
('20RF', '20ft Refrigerated Container', 'refrigerated', 20, 'standard', 
 6.06, 2.44, 2.59, 5.44, 2.29, 2.27, 3100, 27380, 30480, 28.3, 1.0),

('40RF', '40ft Refrigerated Container', 'refrigerated', 40, 'standard', 
 12.19, 2.44, 2.59, 11.56, 2.29, 2.50, 4800, 25680, 30480, 66.2, 2.0),

('20OT', '20ft Open Top Container', 'open_top', 20, 'standard', 
 6.06, 2.44, 2.59, 5.90, 2.35, 2.35, 2400, 28080, 30480, 32.5, 1.0),

('40OT', '40ft Open Top Container', 'open_top', 40, 'standard', 
 12.19, 2.44, 2.59, 12.03, 2.35, 2.35, 4200, 26280, 30480, 66.2, 2.0),

('20FR', '20ft Flat Rack Container', 'flat_rack', 20, 'standard', 
 6.06, 2.44, 2.59, 5.94, 2.44, 2.35, 2360, 28120, 30480, 0, 1.0),

('40FR', '40ft Flat Rack Container', 'flat_rack', 40, 'standard', 
 12.19, 2.44, 2.59, 12.13, 2.44, 2.35, 5000, 25480, 30480, 0, 2.0),

-- Conteneurs 45 pieds
('45HC', '45ft High Cube Container', 'high_cube', 45, 'high_cube', 
 13.72, 2.44, 2.90, 13.55, 2.35, 2.70, 4800, 25680, 30480, 86.0, 2.25);

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.container_types IS 'Types de conteneurs standards ISO et variations observées dans les BL';
COMMENT ON COLUMN public.container_types.iso_code IS 'Code ISO standard du type de conteneur (ex: 20GP, 40HC, 40HQ)';
COMMENT ON COLUMN public.container_types.category IS 'Catégorie fonctionnelle du conteneur';
COMMENT ON COLUMN public.container_types.size_feet IS 'Longueur du conteneur en pieds (20, 40, 45, 53)';
COMMENT ON COLUMN public.container_types.teu_equivalent IS 'Équivalence en TEU (Twenty-foot Equivalent Unit)';
COMMENT ON COLUMN public.container_types.special_features IS 'Caractéristiques spéciales au format JSON (température, alimentation, etc.)';
COMMENT ON COLUMN public.container_types.max_payload_kg IS 'Charge utile maximale en kilogrammes';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire la table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.container_types TO authenticated;