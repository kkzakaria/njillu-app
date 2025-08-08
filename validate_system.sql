-- Test simple de validation du système
SELECT 'Début des tests de validation' as message;

-- Test 1: Vérifier que les tables existent
SELECT 
    'Tables principales' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'folder_processing_stages') 
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'default_processing_stages')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'folders')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
        THEN 'PASS ✅'
        ELSE 'FAIL ❌'
    END as resultat;

-- Test 2: Vérifier que les fonctions existent
SELECT 
    'Fonctions principales' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'initialize_folder_stages')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'start_processing_stage')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'complete_processing_stage')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_folder_progress')
        THEN 'PASS ✅'
        ELSE 'FAIL ❌'
    END as resultat;

-- Test 3: Vérifier que les vues existent
SELECT 
    'Vues analytics' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'folder_stage_statistics')
        AND EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'folders_with_stage_progress')
        AND EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'stage_alerts_dashboard')
        THEN 'PASS ✅'
        ELSE 'FAIL ❌'
    END as resultat;

-- Test 4: Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as test,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'folder_processing_stages') >= 3
        AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'default_processing_stages') >= 3
        THEN 'PASS ✅'
        ELSE 'FAIL ❌'
    END as resultat;

-- Test 5: Compter les fonctions avec search_path sécurisé
SELECT 
    'Sécurité search_path' as test,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_proc WHERE prosecdef = true AND proconfig @> ARRAY['search_path=']) >= 10
        THEN 'PASS ✅'
        ELSE 'FAIL ❌'
    END as resultat;

SELECT 'Tests de validation terminés' as message;