-- Migration: Ajout conditionnel des champs essentiels identifiés depuis l'analyse des BL réels
-- Date: 2025-08-21
-- Description: Ajout ciblé des 5 éléments critiques pour le traitement des dossiers

-- 1. Ajout conditionnel des ports de chargement/déchargement dans bills_of_lading
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bills_of_lading' 
        AND column_name = 'port_of_loading'
    ) THEN
        ALTER TABLE bills_of_lading ADD COLUMN port_of_loading VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bills_of_lading' 
        AND column_name = 'port_of_discharge'
    ) THEN
        ALTER TABLE bills_of_lading ADD COLUMN port_of_discharge VARCHAR(200);
    END IF;
END $$;

-- 2. Ajout conditionnel date d'expédition et type de BL
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bills_of_lading' 
        AND column_name = 'shipped_on_board_date'
    ) THEN
        ALTER TABLE bills_of_lading ADD COLUMN shipped_on_board_date DATE;
    END IF;
    
    -- Vérifier si le type bl_type existe déjà
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bl_type') THEN
        CREATE TYPE bl_type AS ENUM (
            'NEGOTIABLE',
            'NON_NEGOTIABLE', 
            'SEA_WAYBILL'
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bills_of_lading' 
        AND column_name = 'bl_type'
    ) THEN
        ALTER TABLE bills_of_lading 
        ADD COLUMN bl_type bl_type DEFAULT 'NEGOTIABLE';
    END IF;
END $$;

-- 3. Ajout conditionnel des champs conteneurs essentiels
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bl_containers' 
        AND column_name = 'seal_number'
    ) THEN
        ALTER TABLE bl_containers ADD COLUMN seal_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bl_containers' 
        AND column_name = 'tare_weight_kg'
    ) THEN
        ALTER TABLE bl_containers ADD COLUMN tare_weight_kg DECIMAL(10,3);
    END IF;
END $$;

-- 4. Commentaires sur les nouveaux champs
COMMENT ON COLUMN bills_of_lading.port_of_loading IS 'Port de chargement des marchandises';
COMMENT ON COLUMN bills_of_lading.port_of_discharge IS 'Port de déchargement des marchandises';
COMMENT ON COLUMN bills_of_lading.shipped_on_board_date IS 'Date de mise à bord effective des marchandises';
COMMENT ON COLUMN bills_of_lading.bl_type IS 'Type de BL: NEGOTIABLE, NON_NEGOTIABLE, ou SEA_WAYBILL';
COMMENT ON COLUMN bl_containers.seal_number IS 'Numéro du sceau pour conteneurs scellés';
COMMENT ON COLUMN bl_containers.tare_weight_kg IS 'Poids à vide du conteneur en kg';

-- 5. Index conditionnels pour optimiser les recherches
DO $$
BEGIN
    -- Index pour les ports (si n'existe pas déjà)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_bills_of_lading_ports'
    ) THEN
        CREATE INDEX idx_bills_of_lading_ports ON bills_of_lading(port_of_loading, port_of_discharge);
    END IF;
    
    -- Index pour la date d'expédition (si n'existe pas déjà)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_bills_of_lading_shipped_date'
    ) THEN
        CREATE INDEX idx_bills_of_lading_shipped_date ON bills_of_lading(shipped_on_board_date);
    END IF;
    
    -- Index pour les numéros de sceau (si n'existe pas déjà)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_bl_containers_seal'
    ) THEN
        CREATE INDEX idx_bl_containers_seal ON bl_containers(seal_number) WHERE seal_number IS NOT NULL;
    END IF;
END $$;

-- 6. Mise à jour des RLS policies existantes (pas de changement nécessaire car les nouvelles colonnes 
-- héritent automatiquement des policies existantes sur les tables)

-- 7. Fonction conditionnelle pour valider les ports (optionnel, pour validation métier future)
DO $$
BEGIN
    -- Créer la fonction seulement si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'validate_port_names'
    ) THEN
        CREATE FUNCTION validate_port_names()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $func$
        BEGIN
            -- Validation basique des ports (peut être étendue avec une table de référence)
            IF NEW.port_of_loading IS NOT NULL AND LENGTH(TRIM(NEW.port_of_loading)) = 0 THEN
                RAISE EXCEPTION 'Port de chargement ne peut pas être vide';
            END IF;
            
            IF NEW.port_of_discharge IS NOT NULL AND LENGTH(TRIM(NEW.port_of_discharge)) = 0 THEN
                RAISE EXCEPTION 'Port de déchargement ne peut pas être vide';
            END IF;
            
            RETURN NEW;
        END;
        $func$;
    END IF;
END $$;

-- 8. Trigger conditionnel pour validation (optionnel)
DO $$
BEGIN
    -- Créer le trigger seulement s'il n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_validate_ports'
    ) THEN
        CREATE TRIGGER trigger_validate_ports 
            BEFORE INSERT OR UPDATE ON bills_of_lading
            FOR EACH ROW 
            EXECUTE FUNCTION validate_port_names();
    END IF;
END $$;