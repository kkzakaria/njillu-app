-- Migration: Ajouter une relation 1:N entre clients et folders
-- Description: Un client peut avoir plusieurs dossiers, mais un dossier ne peut avoir qu'un seul client
-- Date: 2025-08-21

-- 1. Ajouter la colonne client_id à la table folders
ALTER TABLE folders 
ADD COLUMN client_id uuid REFERENCES clients(id);

-- 2. Créer un index pour optimiser les requêtes de jointure
CREATE INDEX idx_folders_client_id ON folders(client_id) 
WHERE client_id IS NOT NULL AND deleted_at IS NULL;

-- 3. Créer un index composite pour les requêtes courantes
CREATE INDEX idx_folders_client_status_date ON folders(client_id, status, folder_date DESC) 
WHERE client_id IS NOT NULL AND deleted_at IS NULL;

-- 4. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN folders.client_id IS 'Référence vers le client propriétaire du dossier (relation 1:N)';

-- 5. Créer une vue pour faciliter les requêtes avec informations client
CREATE VIEW folders_with_client AS
SELECT 
    f.*,
    c.client_type,
    c.email as client_email,
    c.phone as client_phone,
    CASE 
        WHEN c.client_type = 'business' THEN c.company_name
        ELSE CONCAT(c.first_name, ' ', c.last_name)
    END as client_name,
    c.country as client_country,
    c.preferred_language as client_language
FROM folders f
LEFT JOIN clients c ON f.client_id = c.id
WHERE f.deleted_at IS NULL;

-- 6. Ajouter un commentaire à la vue
COMMENT ON VIEW folders_with_client IS 'Vue simplifiée des dossiers avec informations client associé';

-- 7. Configuration RLS pour la vue (hérite des politiques des tables sous-jacentes)
-- La vue hérite automatiquement des politiques RLS des tables folders et clients