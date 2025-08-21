import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

// GET /api/folders/[id]/stages - Récupérer les étapes d'un dossier
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    // Validation de l'ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de dossier invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le dossier existe
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, folder_number')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (folderError) {
      if (folderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dossier non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: folderError.message }, { status: 500 });
    }

    // Récupérer les étapes de traitement
    const { data: stages, error: stagesError } = await supabase
      .from('folder_processing_stages')
      .select(`
        *,
        assigned_to_user:users!folder_processing_stages_assigned_to_fkey(id, first_name, last_name, email),
        completed_by_user:users!folder_processing_stages_completed_by_fkey(id, first_name, last_name, email),
        started_by_user:users!folder_processing_stages_started_by_fkey(id, first_name, last_name, email)
      `)
      .eq('folder_id', id)
      .order('sequence_order', { ascending: true });

    if (stagesError) {
      console.error('Erreur lors de la récupération des étapes:', stagesError);
      return NextResponse.json({ error: stagesError.message }, { status: 500 });
    }

    // Calculer les métriques de progression
    const totalStages = stages?.length || 0;
    const completedStages = stages?.filter(s => s.status === 'completed').length || 0;
    const inProgressStages = stages?.filter(s => s.status === 'in_progress').length || 0;
    const pendingStages = stages?.filter(s => s.status === 'pending').length || 0;
    const blockedStages = stages?.filter(s => s.status === 'blocked').length || 0;
    const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    // Déterminer l'étape actuelle (première étape non complétée)
    const currentStage = stages?.find(s => s.status !== 'completed' && s.status !== 'skipped');

    return NextResponse.json({
      data: {
        folder: {
          id: folder.id,
          folder_number: folder.folder_number
        },
        stages,
        metrics: {
          total_stages: totalStages,
          completed_stages: completedStages,
          in_progress_stages: inProgressStages,
          pending_stages: pendingStages,
          blocked_stages: blockedStages,
          completion_percentage: completionPercentage,
          current_stage: currentStage?.stage || null
        }
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// POST /api/folders/[id]/stages - Initialiser les étapes d'un dossier
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    // Validation de l'ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de dossier invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le dossier existe et que l'utilisateur peut le modifier
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, folder_number, created_by, assigned_to')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (folderError) {
      if (folderError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dossier non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: folderError.message }, { status: 500 });
    }

    // Vérifier les permissions
    if (folder.created_by !== user.id && folder.assigned_to !== user.id) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour modifier les étapes de ce dossier' },
        { status: 403 }
      );
    }

    // Vérifier si des étapes existent déjà
    const { data: existingStages, error: existingError } = await supabase
      .from('folder_processing_stages')
      .select('id')
      .eq('folder_id', id)
      .limit(1);

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existingStages && existingStages.length > 0) {
      return NextResponse.json(
        { error: 'Les étapes de traitement existent déjà pour ce dossier' },
        { status: 409 }
      );
    }

    // Initialiser les étapes via la fonction PostgreSQL
    const { data: initResult, error: initError } = await supabase.rpc('initialize_folder_stages', {
      p_folder_id: id,
      p_user_id: user.id
    });

    if (initError) {
      console.error('Erreur lors de l\'initialisation des étapes:', initError);
      return NextResponse.json({ error: initError.message }, { status: 500 });
    }

    // Récupérer les étapes nouvellement créées
    const { data: newStages, error: newStagesError } = await supabase
      .from('folder_processing_stages')
      .select(`
        *,
        assigned_to_user:users!folder_processing_stages_assigned_to_fkey(id, first_name, last_name, email)
      `)
      .eq('folder_id', id)
      .order('sequence_order', { ascending: true });

    if (newStagesError) {
      return NextResponse.json({ error: newStagesError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Étapes de traitement initialisées pour le dossier ${folder.folder_number}`,
      data: {
        folder: {
          id: folder.id,
          folder_number: folder.folder_number
        },
        stages: newStages,
        total_stages: newStages?.length || 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}