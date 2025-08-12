-- Données de test pour la table folders
-- Compatible avec la vraie structure (pas de client_name, mais client_reference)

INSERT INTO public.folders (
  folder_number,
  transport_type,
  status,
  title,
  description,
  client_reference,
  priority,
  estimated_value,
  estimated_value_currency,
  internal_notes,
  client_notes,
  folder_date,
  expected_delivery_date
) VALUES 
-- Dossiers Maritimes
('M250812-000001', 'M', 'active', 'Importation équipements médicaux', 'Matériel médical en provenance d''Allemagne', 'MEDEQUIP-REF-001', 'urgent', 50000.00, 'EUR', 'Contrôle qualité obligatoire', 'Livraison prioritaire demandée', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days'),
('M250812-000002', 'M', 'shipped', 'Export textile', 'Textiles vers les États-Unis', 'TEXTILE-SOL-002', 'normal', 25000.00, 'EUR', 'Emballage spécial requis', 'Livraison standard', CURRENT_DATE - 2, CURRENT_DATE + INTERVAL '20 days'),
('M250812-000003', 'M', 'delivered', 'Importation véhicules', 'Véhicules utilitaires du Japon', 'AUTO-IMP-003', 'normal', 150000.00, 'EUR', 'Inspection technique effectuée', 'Véhicules conformes CE', CURRENT_DATE - 7, CURRENT_DATE + INTERVAL '10 days'),

-- Dossiers Terrestres  
('T250812-000004', 'T', 'active', 'Produits alimentaires', 'Denrées périssables d''Espagne', 'FOOD-TRADE-004', 'critical', 30000.00, 'EUR', 'Transport frigorifique', 'Respecter la chaîne du froid', CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days'),
('T250812-000005', 'T', 'completed', 'Équipements industriels', 'Machines-outils vers l''Italie', 'INDUS-CORP-005', 'normal', 80000.00, 'EUR', 'Assurance transport complète', 'Livraison sur site client', CURRENT_DATE - 10, CURRENT_DATE - 2),

-- Dossiers Aériens
('A250812-000006', 'A', 'active', 'Produits pharmaceutiques', 'Médicaments urgents vers l''Afrique', 'PHARMA-EMER-006', 'critical', 75000.00, 'EUR', 'Autorisation spéciale obtenue', 'Mission humanitaire', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days'),
('A250812-000007', 'A', 'draft', 'Composants électroniques', 'Puces électroniques de Corée', 'ELEC-COMP-007', 'urgent', 120000.00, 'EUR', 'Emballage antistatique', 'Livraison express demandée', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),

-- Dossiers supplémentaires pour tests de pagination
('M250812-000008', 'M', 'active', 'Matières premières', 'Acier inoxydable de Chine', 'STEEL-IMP-008', 'normal', 45000.00, 'EUR', 'Certificats qualité fournis', 'Stockage en entrepôt', CURRENT_DATE, CURRENT_DATE + INTERVAL '18 days'),
('T250812-000009', 'T', 'shipped', 'Mobilier de bureau', 'Meubles vers la Suisse', 'OFFICE-FUR-009', 'low', 15000.00, 'EUR', 'Emballage protection renforcé', 'Installation sur site', CURRENT_DATE - 1, CURRENT_DATE + INTERVAL '12 days'),
('A250812-000010', 'A', 'active', 'Échantillons laboratoire', 'Échantillons médicaux urgents', 'LAB-SAMP-010', 'critical', 5000.00, 'EUR', 'Transport à température contrôlée', 'Analyse en urgence', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days');

-- Vérification du nombre d'enregistrements insérés
SELECT COUNT(*) as total_folders_inserted FROM public.folders WHERE deleted_at IS NULL;

-- Affichage d'un échantillon des dossiers créés
SELECT 
  folder_number, 
  transport_type, 
  status, 
  title, 
  client_reference, 
  priority, 
  estimated_value
FROM public.folders 
WHERE deleted_at IS NULL 
ORDER BY folder_number 
LIMIT 5;