-- Script de données de test réalistes basé sur l'analyse des vrais BL
-- Exécuter après avoir créé les données de base avec reset-db-with-user.sh

BEGIN;

-- 1. Compagnies maritimes réelles (étendre la liste de base)
INSERT INTO shipping_companies (name, short_name, scac_code) VALUES
('Mediterranean Shipping Company', 'MSC', 'MSCU'),
('COSCO SHIPPING Lines', 'COSCO', 'COSU'),
('Hapag-Lloyd', 'HLAG', 'HLCU'),
('Ocean Network Express', 'ONE', 'ONEY'),
('Pacific International Lines', 'PIL', 'PILU'),
('Orient Overseas Container Line', 'OOCL', 'OOLU')
ON CONFLICT (scac_code) DO NOTHING;

-- 2. Types de conteneurs étendus (basés sur les BL réels)
INSERT INTO container_types (iso_code, description, category, size_feet, height_type, teu_equivalent) VALUES
('45HC', 'Conteneur high cube 45 pieds', 'high_cube', 45, 'high_cube', 2.25),
('20OT', 'Conteneur open top 20 pieds', 'open_top', 20, 'standard', 1.0),
('40OT', 'Conteneur open top 40 pieds', 'open_top', 40, 'standard', 2.0),
('20FR', 'Conteneur flat rack 20 pieds', 'flat_rack', 20, 'standard', 1.0),
('40FR', 'Conteneur flat rack 40 pieds', 'flat_rack', 40, 'standard', 2.0)
ON CONFLICT (iso_code) DO NOTHING;

-- 3. Clients réalistes (expansion) - Éviter les doublons avec vérification d'existence
DO $$
BEGIN
    -- Client 1: Shanghai Import Export Co. (business)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'zhang.wei@shanghai-ie.com') THEN
        INSERT INTO clients (
            client_type, email, company_name, 
            contact_person_first_name, contact_person_last_name, contact_person_title,
            phone, country
        ) VALUES (
            'business', 'zhang.wei@shanghai-ie.com', 'Shanghai Import Export Co.',
            'Zhang', 'Wei', 'Export Manager',
            '+86-21-5555-0001', 'CN'
        );
    END IF;
    
    -- Client 2: Hamburg Logistics GmbH (business)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'h.mueller@hamburg-log.de') THEN
        INSERT INTO clients (
            client_type, email, company_name, 
            contact_person_first_name, contact_person_last_name, contact_person_title,
            phone, country
        ) VALUES (
            'business', 'h.mueller@hamburg-log.de', 'Hamburg Logistics GmbH',
            'Hans', 'Mueller', 'Logistics Director',
            '+49-40-1234-567', 'DE'
        );
    END IF;
    
    -- Client 3: Marseille Trading SARL (business)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'marie.dubois@marseille-trade.fr') THEN
        INSERT INTO clients (
            client_type, email, company_name, 
            contact_person_first_name, contact_person_last_name, contact_person_title,
            phone, country, postal_code, city
        ) VALUES (
            'business', 'marie.dubois@marseille-trade.fr', 'Marseille Trading SARL',
            'Marie', 'Dubois', 'Import Manager',
            '+33-4-9111-2233', 'FR', '13001', 'Marseille'
        );
    END IF;
    
    -- Client 4: Genova Freight Srl (business)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'a.rossi@genova-freight.it') THEN
        INSERT INTO clients (
            client_type, email, company_name, 
            contact_person_first_name, contact_person_last_name, contact_person_title,
            phone, country
        ) VALUES (
            'business', 'a.rossi@genova-freight.it', 'Genova Freight Srl',
            'Antonio', 'Rossi', 'Freight Manager',
            '+39-010-555-777', 'IT'
        );
    END IF;
    
    -- Client 5: Alexandria Shipping Ltd (business)
    IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'ahmed@alex-shipping.eg') THEN
        INSERT INTO clients (
            client_type, email, company_name, 
            contact_person_first_name, contact_person_last_name, contact_person_title,
            phone, country
        ) VALUES (
            'business', 'ahmed@alex-shipping.eg', 'Alexandria Shipping Ltd',
            'Ahmed', 'Hassan', 'Shipping Coordinator',
            '+20-3-444-8899', 'EG'
        );
    END IF;
END $$;

-- 4. Bills of Lading réalistes avec les 5 champs essentiels
DO $$
DECLARE
    msc_id INTEGER;
    cosco_id INTEGER;
    hapag_id INTEGER;
    one_id INTEGER;
    pil_id INTEGER;
    oocl_id INTEGER;
    client1_id INTEGER;
    client2_id INTEGER;
    client3_id INTEGER;
    bl1_id INTEGER;
    bl2_id INTEGER;
    bl3_id INTEGER;
    bl4_id INTEGER;
    bl5_id INTEGER;
    container_20gp_id INTEGER;
    container_40gp_id INTEGER;
    container_40hc_id INTEGER;
    container_45hc_id INTEGER;
    container_20rf_id INTEGER;
BEGIN
    -- Récupérer les IDs des compagnies
    SELECT id INTO msc_id FROM shipping_companies WHERE scac_code = 'MSCU';
    SELECT id INTO cosco_id FROM shipping_companies WHERE scac_code = 'COSU';
    SELECT id INTO hapag_id FROM shipping_companies WHERE scac_code = 'HLCU';
    SELECT id INTO one_id FROM shipping_companies WHERE scac_code = 'ONEY';
    SELECT id INTO pil_id FROM shipping_companies WHERE scac_code = 'PILU';
    SELECT id INTO oocl_id FROM shipping_companies WHERE scac_code = 'OOLU';
    
    -- Récupérer les IDs des clients
    SELECT id INTO client1_id FROM clients WHERE email = 'zhang.wei@shanghai-ie.com';
    SELECT id INTO client2_id FROM clients WHERE email = 'h.mueller@hamburg-log.de';
    SELECT id INTO client3_id FROM clients WHERE email = 'marie.dubois@marseille-trade.fr';
    
    -- Récupérer les IDs des types de conteneurs
    SELECT id INTO container_20gp_id FROM container_types WHERE iso_code = '20GP';
    SELECT id INTO container_40gp_id FROM container_types WHERE iso_code = '40GP';
    SELECT id INTO container_40hc_id FROM container_types WHERE iso_code = '40HC';
    SELECT id INTO container_45hc_id FROM container_types WHERE iso_code = '45HC';
    SELECT id INTO container_20rf_id FROM container_types WHERE iso_code = '20RF';
    
    -- BL 1: MSC Shanghai → Le Havre (basé sur MSC BL réel)
    INSERT INTO bills_of_lading (
        bl_number, shipping_company_id, issue_date, status,
        port_of_loading, port_of_discharge, shipped_on_board_date, bl_type,
        shipper_name, consignee_name, notify_party_name,
        vessel_name, voyage_number, freight_terms
    ) VALUES (
        'MEDUGZ075755', msc_id, '2024-08-15', 'issued',
        'Shanghai, China', 'Le Havre, France', '2024-08-17', 'NEGOTIABLE',
        'Shanghai Import Export Co.', 'Marseille Trading SARL', 'Same as consignee',
        'MSC IRINA', 'FA441W', 'PREPAID'
    ) RETURNING id INTO bl1_id;
    
    -- BL 2: COSCO Ningbo → Hamburg (basé sur COSCO BL réel)
    INSERT INTO bills_of_lading (
        bl_number, shipping_company_id, issue_date, status,
        port_of_loading, port_of_discharge, shipped_on_board_date, bl_type,
        shipper_name, consignee_name, notify_party_name,
        vessel_name, voyage_number, freight_terms
    ) VALUES (
        'COSU6412294940', cosco_id, '2024-08-20', 'issued',
        'Ningbo, China', 'Hamburg, Germany', '2024-08-22', 'SEA_WAYBILL',
        'Shanghai Import Export Co.', 'Hamburg Logistics GmbH', 'Same as consignee',
        'COSCO SHIPPING DENALI', '105W', 'PREPAID'
    ) RETURNING id INTO bl2_id;
    
    -- BL 3: Hapag-Lloyd Qingdao → Rotterdam
    INSERT INTO bills_of_lading (
        bl_number, shipping_company_id, issue_date, status,
        port_of_loading, port_of_discharge, shipped_on_board_date, bl_type,
        shipper_name, consignee_name, notify_party_name,
        vessel_name, voyage_number, freight_terms
    ) VALUES (
        'HLCUBA240815001', hapag_id, '2024-08-18', 'issued',
        'Qingdao, China', 'Rotterdam, Netherlands', '2024-08-20', 'NEGOTIABLE',
        'Qingdao Export Ltd', 'Rotterdam Trading BV', 'Bank of Rotterdam',
        'MONTREAL EXPRESS', '442W', 'COLLECT'
    ) RETURNING id INTO bl3_id;
    
    -- BL 4: ONE Guangzhou → Antwerp
    INSERT INTO bills_of_lading (
        bl_number, shipping_company_id, issue_date, status,
        port_of_loading, port_of_discharge, shipped_on_board_date, bl_type,
        shipper_name, consignee_name, notify_party_name,
        vessel_name, voyage_number, freight_terms
    ) VALUES (
        'ONEYSHA240820055', one_id, '2024-08-19', 'issued',
        'Guangzhou, China', 'Antwerp, Belgium', '2024-08-21', 'NON_NEGOTIABLE',
        'Guangzhou Manufacturing', 'Antwerp Distributors', 'Same as consignee',
        'ONE COMMITMENT', 'FA443W', 'PREPAID'
    ) RETURNING id INTO bl4_id;
    
    -- BL 5: PIL Singapore → Marseille
    INSERT INTO bills_of_lading (
        bl_number, shipping_company_id, issue_date, status,
        port_of_loading, port_of_discharge, shipped_on_board_date, bl_type,
        shipper_name, consignee_name, notify_party_name,
        vessel_name, voyage_number, freight_terms
    ) VALUES (
        'PILSIN240821789', pil_id, '2024-08-21', 'issued',
        'Singapore', 'Marseille, France', '2024-08-23', 'NEGOTIABLE',
        'Singapore Exports Pte', 'Marseille Trading SARL', 'Credit Agricole',
        'PIL PHILIPPINES', 'MP892', 'PREPAID'
    ) RETURNING id INTO bl5_id;
    
    -- Conteneurs pour BL MSC (1 x 40HC)
    INSERT INTO bl_containers (
        bl_id, container_number, container_type_id, 
        seal_number, tare_weight_kg, gross_weight_kg,
        arrival_status, estimated_arrival_date
    ) VALUES (
        bl1_id, 'MSDU5618774', container_40hc_id,
        'MSC7755A', 3800.5, 28350.0,
        'in_transit', '2024-09-05'
    );
    
    -- Conteneurs pour BL COSCO (2 x 20GP)
    INSERT INTO bl_containers (
        bl_id, container_number, container_type_id, 
        seal_number, tare_weight_kg, gross_weight_kg,
        arrival_status, estimated_arrival_date
    ) VALUES 
    (bl2_id, 'COSU4457891', container_20gp_id, 'COS2940A', 2200.0, 18500.0, 'in_transit', '2024-09-08'),
    (bl2_id, 'COSU4457892', container_20gp_id, 'COS2940B', 2180.5, 17800.0, 'in_transit', '2024-09-08');
    
    -- Conteneurs pour BL Hapag-Lloyd (1 x 45HC)
    INSERT INTO bl_containers (
        bl_id, container_number, container_type_id, 
        seal_number, tare_weight_kg, gross_weight_kg,
        arrival_status, estimated_arrival_date
    ) VALUES (
        bl3_id, 'HLBU7728934', container_45hc_id,
        'HLAG001A', 4250.0, 29700.0,
        'in_transit', '2024-09-12'
    );
    
    -- Conteneurs pour BL ONE (2 x 40GP)
    INSERT INTO bl_containers (
        bl_id, container_number, container_type_id, 
        seal_number, tare_weight_kg, gross_weight_kg,
        arrival_status, estimated_arrival_date
    ) VALUES 
    (bl4_id, 'ONEU8845123', container_40gp_id, 'ONE055A1', 3650.0, 27800.0, 'in_transit', '2024-09-10'),
    (bl4_id, 'ONEU8845124', container_40gp_id, 'ONE055A2', 3680.5, 28100.0, 'in_transit', '2024-09-10');
    
    -- Conteneurs pour BL PIL (1 x 20RF réfrigéré)
    INSERT INTO bl_containers (
        bl_id, container_number, container_type_id, 
        seal_number, tare_weight_kg, gross_weight_kg,
        arrival_status, estimated_arrival_date
    ) VALUES (
        bl5_id, 'PILU5599887', container_20rf_id,
        'PIL789RF', 2750.0, 19500.0,
        'in_transit', '2024-09-15'
    );
    
END $$;

-- 5. Dossiers réalistes avec BL associés
DO $$
DECLARE
    user_id UUID;
    client1_id INTEGER;
    client2_id INTEGER;
    client3_id INTEGER;
    bl1_id INTEGER;
    bl2_id INTEGER;
    bl3_id INTEGER;
    bl4_id INTEGER;
    bl5_id INTEGER;
BEGIN
    -- Récupérer l'utilisateur de test
    SELECT id INTO user_id FROM users WHERE email = 'test@example.com';
    
    -- Récupérer les IDs des clients
    SELECT id INTO client1_id FROM clients WHERE email = 'zhang.wei@shanghai-ie.com';
    SELECT id INTO client2_id FROM clients WHERE email = 'h.mueller@hamburg-log.de';
    SELECT id INTO client3_id FROM clients WHERE email = 'marie.dubois@marseille-trade.fr';
    
    -- Récupérer les IDs des BL
    SELECT id INTO bl1_id FROM bills_of_lading WHERE bl_number = 'MEDUGZ075755';
    SELECT id INTO bl2_id FROM bills_of_lading WHERE bl_number = 'COSU6412294940';
    SELECT id INTO bl3_id FROM bills_of_lading WHERE bl_number = 'HLCUBA240815001';
    SELECT id INTO bl4_id FROM bills_of_lading WHERE bl_number = 'ONEYSHA240820055';
    SELECT id INTO bl5_id FROM bills_of_lading WHERE bl_number = 'PILSIN240821789';
    
    -- Dossier 1: Import MSC Shanghai → Le Havre
    INSERT INTO folders (
        transport_type, title, description, folder_date, expected_delivery_date,
        status, priority, client_id, bl_id, client_reference,
        estimated_value, estimated_value_currency, created_by, assigned_to
    ) VALUES (
        'M', 'Import conteneur textile Shanghai-Le Havre', 
        'Conteneur 40HC textile et accessoires mode depuis Shanghai',
        '2024-08-15', '2024-09-10',
        'active', 'normal', client3_id, bl1_id, 'TEX-2024-001',
        48500.00, 'EUR', user_id, user_id
    );
    
    -- Dossier 2: Import COSCO Ningbo → Hamburg
    INSERT INTO folders (
        transport_type, title, description, folder_date, expected_delivery_date,
        status, priority, client_id, bl_id, client_reference,
        estimated_value, estimated_value_currency, created_by, assigned_to
    ) VALUES (
        'M', 'Import électronique Ningbo-Hamburg',
        'Deux conteneurs 20GP électronique et composants',
        '2024-08-20', '2024-09-12',
        'active', 'urgent', client2_id, bl2_id, 'ELEC-HH-2024-078',
        75200.00, 'EUR', user_id, user_id
    );
    
    -- Dossier 3: Import Hapag-Lloyd Qingdao → Rotterdam
    INSERT INTO folders (
        transport_type, title, description, folder_date, expected_delivery_date,
        status, priority, client_id, bl_id, client_reference,
        estimated_value, estimated_value_currency, created_by, assigned_to
    ) VALUES (
        'M', 'Import machinerie Qingdao-Rotterdam',
        'Conteneur 45HC machinerie industrielle lourde',
        '2024-08-18', '2024-09-15',
        'shipped', 'critical', client2_id, bl3_id, 'MACH-RTM-2024-091',
        185000.00, 'EUR', user_id, user_id
    );
    
    -- Dossier 4: Import ONE Guangzhou → Antwerp
    INSERT INTO folders (
        transport_type, title, description, folder_date, expected_delivery_date,
        status, priority, client_id, bl_id, client_reference,
        estimated_value, estimated_value_currency, created_by, assigned_to
    ) VALUES (
        'M', 'Import mobilier Guangzhou-Antwerp',
        'Deux conteneurs 40GP mobilier et décoration',
        '2024-08-19', '2024-09-14',
        'active', 'normal', client1_id, bl4_id, 'MOB-ANT-2024-055',
        32800.00, 'EUR', user_id, user_id
    );
    
    -- Dossier 5: Import PIL Singapore → Marseille (réfrigéré)
    INSERT INTO folders (
        transport_type, title, description, folder_date, expected_delivery_date,
        status, priority, client_id, bl_id, client_reference,
        estimated_value, estimated_value_currency, created_by, assigned_to
    ) VALUES (
        'M', 'Import produits frais Singapore-Marseille',
        'Conteneur 20RF produits alimentaires tropicaux réfrigérés',
        '2024-08-21', '2024-09-18',
        'active', 'urgent', client3_id, bl5_id, 'FOOD-MAR-2024-112',
        28500.00, 'EUR', user_id, user_id
    );
    
END $$;

COMMIT;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Données de test réalistes créées avec succès !';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Résumé des données créées basées sur l''analyse des vrais BL :';
    RAISE NOTICE '   • 6 compagnies maritimes supplémentaires (MSC, COSCO, Hapag-Lloyd, etc.)';
    RAISE NOTICE '   • 5 types de conteneurs étendus (45HC, OT, FR)';
    RAISE NOTICE '   • 5 clients internationaux réalistes';
    RAISE NOTICE '   • 5 bills of lading avec tous les champs essentiels :';
    RAISE NOTICE '     - Ports de chargement/déchargement';
    RAISE NOTICE '     - Types de BL (NEGOTIABLE, SEA_WAYBILL, NON_NEGOTIABLE)';
    RAISE NOTICE '     - Dates d''expédition réelles';
    RAISE NOTICE '   • 8 conteneurs avec sceaux et poids à vide';
    RAISE NOTICE '   • 5 dossiers complets liés aux BL';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Utilisation :';
    RAISE NOTICE '   • Tester les endpoints améliorés avec des données réelles';
    RAISE NOTICE '   • Valider les nouveaux filtres de recherche';
    RAISE NOTICE '   • Vérifier l''affichage des champs essentiels des BL';
    RAISE NOTICE '';
END $$;