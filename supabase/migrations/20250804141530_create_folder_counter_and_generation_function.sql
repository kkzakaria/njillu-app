-- Migration: create_folder_counter_and_generation_function
-- Description: Compteur unique global et fonction de génération automatique pour numéros de dossier
-- Date: 2025-08-04

-- ============================================================================
-- Table de compteur global pour la numérotation des dossiers
-- ============================================================================

-- Table pour gérer le compteur global unique (thread-safe)
CREATE TABLE public.folder_counter (
  -- Année de référence pour le compteur
  year integer PRIMARY KEY,
  
  -- Compteur séquentiel global (resetté chaque année)
  counter integer NOT NULL DEFAULT 0,
  
  -- Métadonnées de suivi
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes de validation
  CONSTRAINT folder_counter_year_valid 
    CHECK (year >= 2020 AND year <= 2050),
  CONSTRAINT folder_counter_positive 
    CHECK (counter >= 0)
);

-- Index pour optimiser les accès au compteur
CREATE INDEX idx_folder_counter_year ON public.folder_counter(year);

-- ============================================================================
-- Fonction de génération de numéro de dossier (thread-safe)
-- ============================================================================

-- Fonction principale pour générer un numéro de dossier unique
CREATE OR REPLACE FUNCTION generate_folder_number(
  p_transport_type transport_type_enum,
  p_folder_date date DEFAULT CURRENT_DATE
)
RETURNS varchar(15)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year integer;
  v_date_part varchar(6);
  v_counter integer;
  v_folder_number varchar(15);
  v_max_retries integer DEFAULT 5;
  v_retry_count integer DEFAULT 0;
BEGIN
  -- Validation des paramètres d'entrée
  IF p_transport_type IS NULL THEN
    RAISE EXCEPTION 'Le type de transport ne peut pas être NULL';
  END IF;
  
  IF p_folder_date IS NULL THEN
    RAISE EXCEPTION 'La date du dossier ne peut pas être NULL';
  END IF;
  
  IF p_folder_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'La date du dossier ne peut pas être dans le futur';
  END IF;
  
  -- Extraction de l'année et formatage de la date (YYMMDD)
  v_year := EXTRACT(YEAR FROM p_folder_date);
  v_date_part := TO_CHAR(p_folder_date, 'YYMMDD');
  
  -- Boucle de retry pour gérer la concurrence
  WHILE v_retry_count < v_max_retries LOOP
    BEGIN
      -- Tentative d'obtenir et incrémenter le compteur (avec verrou)
      INSERT INTO public.folder_counter (year, counter) 
      VALUES (v_year, 1)
      ON CONFLICT (year) DO UPDATE 
      SET 
        counter = folder_counter.counter + 1,
        updated_at = now()
      RETURNING counter INTO v_counter;
      
      -- Formatage du numéro final: [MTA]YYMMDD-NNNNNN
      v_folder_number := p_transport_type::text || v_date_part || '-' || LPAD(v_counter::text, 6, '0');
      
      -- Vérification que le numéro n'existe pas déjà (double sécurité)
      IF EXISTS (SELECT 1 FROM public.folders WHERE folder_number = v_folder_number) THEN
        -- Numéro déjà utilisé, retry avec le compteur suivant
        v_retry_count := v_retry_count + 1;
        IF v_retry_count >= v_max_retries THEN
          RAISE EXCEPTION 'Impossible de générer un numéro unique après % tentatives', v_max_retries;
        END IF;
        -- Petite pause avant retry (évite les conflits rapides)
        PERFORM pg_sleep(0.001 * v_retry_count);
        CONTINUE;
      END IF;
      
      -- Succès - sortir de la boucle
      EXIT;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_retry_count := v_retry_count + 1;
        IF v_retry_count >= v_max_retries THEN
          RAISE EXCEPTION 'Erreur lors de la génération du numéro de dossier: %', SQLERRM;
        END IF;
        -- Pause exponentielle avant retry
        PERFORM pg_sleep(0.01 * POWER(2, v_retry_count));
    END;
  END LOOP;
  
  RETURN v_folder_number;
END;
$$;

-- ============================================================================
-- Fonction helper pour obtenir le prochain numéro sans l'assigner
-- ============================================================================

-- Fonction pour prévisualiser le prochain numéro (sans l'incrémenter)
CREATE OR REPLACE FUNCTION preview_next_folder_number(
  p_transport_type transport_type_enum,
  p_folder_date date DEFAULT CURRENT_DATE
)
RETURNS varchar(15)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year integer;
  v_date_part varchar(6);
  v_next_counter integer;
  v_preview_number varchar(15);
BEGIN
  -- Validation des paramètres
  IF p_transport_type IS NULL THEN
    RAISE EXCEPTION 'Le type de transport ne peut pas être NULL';
  END IF;
  
  IF p_folder_date IS NULL THEN
    RAISE EXCEPTION 'La date du dossier ne peut pas être NULL';
  END IF;
  
  -- Extraction de l'année et formatage de la date
  v_year := EXTRACT(YEAR FROM p_folder_date);
  v_date_part := TO_CHAR(p_folder_date, 'YYMMDD');
  
  -- Récupération du compteur actuel (sans l'incrémenter)
  SELECT COALESCE(counter, 0) + 1 
  INTO v_next_counter
  FROM public.folder_counter 
  WHERE year = v_year;
  
  -- Si aucun compteur pour cette année, le prochain sera 1
  IF v_next_counter IS NULL THEN
    v_next_counter := 1;
  END IF;
  
  -- Formatage du numéro de prévisualisation
  v_preview_number := p_transport_type::text || v_date_part || '-' || LPAD(v_next_counter::text, 6, '0');
  
  RETURN v_preview_number;
END;
$$;

-- ============================================================================
-- Fonction pour réinitialiser le compteur (admin uniquement)
-- ============================================================================

-- Fonction pour réinitialiser le compteur d'une année (usage admin)
CREATE OR REPLACE FUNCTION reset_folder_counter(
  p_year integer,
  p_new_value integer DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validation des paramètres
  IF p_year IS NULL OR p_year < 2020 OR p_year > 2050 THEN
    RAISE EXCEPTION 'Année invalide: %', p_year;
  END IF;
  
  IF p_new_value < 0 THEN
    RAISE EXCEPTION 'La valeur du compteur ne peut pas être négative';
  END IF;
  
  -- Mise à jour ou insertion du compteur
  INSERT INTO public.folder_counter (year, counter) 
  VALUES (p_year, p_new_value)
  ON CONFLICT (year) DO UPDATE 
  SET 
    counter = p_new_value,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- ============================================================================
-- Vues utilitaires pour le monitoring
-- ============================================================================

-- Vue pour suivre l'état des compteurs par année
CREATE VIEW folder_counter_status AS
SELECT 
  year,
  counter,
  counter || ' dossiers générés' as status,
  created_at,
  updated_at,
  CASE 
    WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) THEN 'Année courante'
    WHEN year < EXTRACT(YEAR FROM CURRENT_DATE) THEN 'Année passée'
    ELSE 'Année future'
  END as year_status
FROM public.folder_counter
ORDER BY year DESC;

-- Vue pour statistiques rapides
CREATE VIEW folder_numbering_stats AS
SELECT 
  COUNT(DISTINCT year) as years_active,
  SUM(counter) as total_folders_generated,
  MAX(counter) as max_counter_per_year,
  MIN(year) as first_year,
  MAX(year) as last_year,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.folder_counter WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)) 
    THEN (SELECT counter FROM public.folder_counter WHERE year = EXTRACT(YEAR FROM CURRENT_DATE))
    ELSE 0
  END as current_year_count
FROM public.folder_counter;

-- ============================================================================
-- Trigger pour mise à jour automatique de updated_at
-- ============================================================================

CREATE TRIGGER update_folder_counter_updated_at 
  BEFORE UPDATE ON public.folder_counter 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Index additionnels pour les vues et performances
-- ============================================================================

-- Index pour les requêtes par année (très fréquentes)
-- Note: Index standard sans prédicat car CURRENT_DATE n'est pas IMMUTABLE
CREATE INDEX idx_folder_counter_year_desc 
ON public.folder_counter(year DESC);

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.folder_counter IS 'Compteur global unique pour la génération des numéros de dossier par année';
COMMENT ON COLUMN public.folder_counter.year IS 'Année de référence pour le compteur (clé primaire)';
COMMENT ON COLUMN public.folder_counter.counter IS 'Compteur séquentiel global, resetté chaque année';

COMMENT ON FUNCTION generate_folder_number(transport_type_enum, date) IS 'Génère un numéro de dossier unique et thread-safe';
COMMENT ON FUNCTION preview_next_folder_number(transport_type_enum, date) IS 'Prévisualise le prochain numéro sans l''assigner';
COMMENT ON FUNCTION reset_folder_counter(integer, integer) IS 'Réinitialise le compteur pour une année donnée (admin)';

COMMENT ON VIEW folder_counter_status IS 'Vue de monitoring des compteurs par année';
COMMENT ON VIEW folder_numbering_stats IS 'Statistiques globales du système de numérotation';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire les compteurs et statistiques
GRANT SELECT ON public.folder_counter TO authenticated;
GRANT SELECT ON folder_counter_status TO authenticated;
GRANT SELECT ON folder_numbering_stats TO authenticated;

-- Permettre l'exécution des fonctions utilitaires
GRANT EXECUTE ON FUNCTION generate_folder_number(transport_type_enum, date) TO authenticated;
GRANT EXECUTE ON FUNCTION preview_next_folder_number(transport_type_enum, date) TO authenticated;

-- Fonction de reset réservée aux admins (sera configurée avec RLS plus tard)
GRANT EXECUTE ON FUNCTION reset_folder_counter(integer, integer) TO authenticated;

-- ============================================================================
-- Trigger pour auto-générer les numéros de dossier
-- ============================================================================

-- Fonction trigger pour générer automatiquement folder_number
CREATE OR REPLACE FUNCTION set_folder_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Générer automatiquement le numéro de dossier si pas fourni
  IF NEW.folder_number IS NULL THEN
    NEW.folder_number := generate_folder_number(NEW.transport_type, NEW.folder_date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger avant insertion
CREATE TRIGGER set_folder_number_trigger
  BEFORE INSERT ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION set_folder_number();

-- Commentaires
COMMENT ON FUNCTION set_folder_number() IS 'Fonction trigger pour auto-générer folder_number lors de l''insertion';
COMMENT ON TRIGGER set_folder_number_trigger ON public.folders IS 'Trigger pour auto-générer folder_number avant insertion';

-- Permissions pour la fonction trigger
GRANT EXECUTE ON FUNCTION set_folder_number() TO authenticated;