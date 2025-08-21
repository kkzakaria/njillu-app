import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string; stage: string };
}

const VALID_STAGES = [
  'enregistrement', 'revision_facture_commerciale', 'elaboration_fdi',
  'elaboration_rfcv', 'declaration_douaniere', 'service_exploitation',
  'facturation_client', 'livraison'
];

const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'blocked', 'skipped'];
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

// GET /api/folders/[id]/stages/[stage] - Récupérer une étape spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, stage } = params;

    // Validation de l'ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de dossier invalide' },
        { status: 400 }
      );
    }

    // Validation de l'étape
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Étape invalide. Étapes valides: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      );
    }

    // Récupérer l'étape spécifique
    const { data: stageData, error: stageError } = await supabase
      .from('folder_processing_stages')
      .select(`
        *,
        folder:folders(id, folder_number, status),
        assigned_to_user:users!folder_processing_stages_assigned_to_fkey(id, first_name, last_name, email),
        completed_by_user:users!folder_processing_stages_completed_by_fkey(id, first_name, last_name, email),
        started_by_user:users!folder_processing_stages_started_by_fkey(id, first_name, last_name, email)
      `)
      .eq('folder_id', id)
      .eq('stage', stage)
      .single();

    if (stageError) {
      if (stageError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Étape non trouvée pour ce dossier' },
          { status: 404 }
        );
      }
      console.error('Erreur lors de la récupération de l\'étape:', stageError);
      return NextResponse.json({ error: stageError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: stageData
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// PUT /api/folders/[id]/stages/[stage] - Mettre à jour une étape
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, stage } = params;
    const body = await request.json();

    // Validation de l'ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de dossier invalide' },
        { status: 400 }
      );
    }

    // Validation de l'étape
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Étape invalide. Étapes valides: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validation des champs
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Statut invalide. Statuts valides: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json(
        { error: `Priorité invalide. Priorités valides: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Vérifier que l'étape existe
    const { data: existingStage, error: existingError } = await supabase
      .from('folder_processing_stages')
      .select('id, status, assigned_to, completed_at, folder_id')
      .eq('folder_id', id)
      .eq('stage', stage)
      .single();

    if (existingError) {
      if (existingError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Étape non trouvée pour ce dossier' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    // Vérifier les permissions via la fonction PostgreSQL
    const { data: canModify, error: permError } = await supabase.rpc('user_can_modify_stage', {
      p_user_id: user.id,
      p_stage_id: existingStage.id
    });

    if (permError) {
      return NextResponse.json({ error: permError.message }, { status: 500 });
    }

    if (!canModify) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour modifier cette étape' },
        { status: 403 }
      );
    }

    // Validation des règles métier
    if (body.status === 'completed' && existingStage.status === 'completed') {
      return NextResponse.json(
        { error: 'Cette étape est déjà complétée' },
        { status: 409 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    
    const allowedFields = [
      'status', 'priority', 'assigned_to', 'due_date', 'estimated_completion_date',
      'notes', 'internal_comments', 'client_visible_comments',
      'documents_required', 'documents_received'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Gestion des transitions d'état spéciales
    if (body.action) {
      switch (body.action) {
        case 'start':
          // Démarrer une étape
          const { data: startResult, error: startError } = await supabase.rpc('start_processing_stage', {
            p_folder_id: id,
            p_stage: stage,
            p_user_id: user.id,
            p_assigned_to: body.assigned_to || user.id,
            p_notes: body.notes || null
          });

          if (startError) {
            return NextResponse.json({ error: startError.message }, { status: 500 });
          }

          break;

        case 'complete':
          // Compléter une étape
          const { data: completeResult, error: completeError } = await supabase.rpc('complete_processing_stage', {
            p_folder_id: id,
            p_stage: stage,
            p_user_id: user.id,
            p_notes: body.notes || null,
            p_documents: body.documents || null
          });

          if (completeError) {
            return NextResponse.json({ error: completeError.message }, { status: 500 });
          }

          break;

        case 'block':
          // Bloquer une étape
          if (!body.blocking_reason) {
            return NextResponse.json(
              { error: 'La raison du blocage est requise' },
              { status: 400 }
            );
          }

          const { data: blockResult, error: blockError } = await supabase.rpc('block_processing_stage', {
            p_folder_id: id,
            p_stage: stage,
            p_blocking_reason: body.blocking_reason,
            p_user_id: user.id
          });

          if (blockError) {
            return NextResponse.json({ error: blockError.message }, { status: 500 });
          }

          break;

        case 'unblock':
          // Débloquer une étape
          const { data: unblockResult, error: unblockError } = await supabase.rpc('unblock_processing_stage', {
            p_folder_id: id,
            p_stage: stage,
            p_user_id: user.id,
            p_notes: body.notes || null
          });

          if (unblockError) {
            return NextResponse.json({ error: unblockError.message }, { status: 500 });
          }

          break;
      }
    } else if (Object.keys(updateData).length > 0) {
      // Mise à jour simple des champs
      const { error: updateError } = await supabase
        .from('folder_processing_stages')
        .update(updateData)
        .eq('folder_id', id)
        .eq('stage', stage);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'étape:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    // Récupérer l'étape mise à jour
    const { data: updatedStage, error: fetchError } = await supabase
      .from('folder_processing_stages')
      .select(`
        *,
        folder:folders(id, folder_number, status),
        assigned_to_user:users!folder_processing_stages_assigned_to_fkey(id, first_name, last_name, email),
        completed_by_user:users!folder_processing_stages_completed_by_fkey(id, first_name, last_name, email)
      `)
      .eq('folder_id', id)
      .eq('stage', stage)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Étape ${stage} mise à jour avec succès`,
      data: updatedStage
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}