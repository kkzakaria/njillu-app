import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

// GET /api/folders/[id]/containers - Récupérer tous les conteneurs d'un dossier
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

    // Vérifier que le dossier existe et que l'utilisateur peut y accéder
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, folder_number, bl_id, created_by, assigned_to')
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

    // Vérifier les permissions (créateur, assigné ou admin)
    if (folder.created_by !== user.id && folder.assigned_to !== user.id) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour accéder aux conteneurs de ce dossier' },
        { status: 403 }
      );
    }

    // Si pas de BL associé, retourner une liste vide
    if (!folder.bl_id) {
      return NextResponse.json({
        data: [],
        folder_info: {
          id: folder.id,
          folder_number: folder.folder_number,
          has_bill_of_lading: false
        },
        container_summary: {
          total_containers: 0,
          arrival_status_summary: {},
          container_types_summary: {}
        }
      });
    }

    // Récupérer les conteneurs avec toutes leurs informations
    const { data: containers, error: containersError } = await supabase
      .from('bl_containers')
      .select(`
        id,
        container_number,
        seal_number,
        container_type_id,
        tare_weight_kg,
        gross_weight_kg,
        net_weight_kg,
        volume_cbm,
        loading_method,
        marks_and_numbers,
        shipper_load_stow_count,
        estimated_arrival_date,
        actual_arrival_date,
        arrival_status,
        arrival_notes,
        arrival_location,
        customs_clearance_date,
        delivery_ready_date,
        created_at,
        updated_at,
        container_type:container_types(
          id,
          iso_code,
          description,
          category,
          size_feet,
          height_type,
          teu_equivalent,
          length_meters,
          width_meters,
          height_meters,
          max_payload_kg,
          max_gross_weight_kg,
          volume_cubic_meters,
          special_features
        )
      `)
      .eq('bl_id', folder.bl_id)
      .is('deleted_at', null)
      .order('container_number');

    if (containersError) {
      console.error('Erreur lors de la récupération des conteneurs:', containersError);
      return NextResponse.json({ error: containersError.message }, { status: 500 });
    }

    // Calculer les résumés et statistiques
    const arrivalStatusSummary = containers.reduce((acc: any, container: any) => {
      const status = container.arrival_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const containerTypesSummary = containers.reduce((acc: any, container: any) => {
      const isoCode = container.container_type?.iso_code || 'unknown';
      const sizeFeet = container.container_type?.size_feet || 0;
      const key = `${isoCode}_${sizeFeet}ft`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalTEU = containers.reduce((sum: number, container: any) => {
      return sum + (container.container_type?.teu_equivalent || 1);
    }, 0);

    const totalVolumeCBM = containers.reduce((sum: number, container: any) => {
      return sum + (container.volume_cbm || 0);
    }, 0);

    const totalGrossWeight = containers.reduce((sum: number, container: any) => {
      return sum + (container.gross_weight_kg || 0);
    }, 0);

    return NextResponse.json({
      data: containers,
      folder_info: {
        id: folder.id,
        folder_number: folder.folder_number,
        has_bill_of_lading: true,
        bl_id: folder.bl_id
      },
      container_summary: {
        total_containers: containers.length,
        total_teu: totalTEU,
        total_volume_cbm: totalVolumeCBM,
        total_gross_weight_kg: totalGrossWeight,
        arrival_status_summary: arrivalStatusSummary,
        container_types_summary: containerTypesSummary
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

// PUT /api/folders/[id]/containers - Mettre à jour le statut d'arrivée des conteneurs
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validation de l'ID UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de dossier invalide' },
        { status: 400 }
      );
    }

    // Validation des données
    if (!body.container_updates || !Array.isArray(body.container_updates)) {
      return NextResponse.json(
        { error: 'container_updates requis et doit être un tableau' },
        { status: 400 }
      );
    }

    // Vérifier que le dossier existe et que l'utilisateur peut le modifier
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, bl_id, created_by, assigned_to')
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
        { error: 'Permissions insuffisantes pour modifier les conteneurs de ce dossier' },
        { status: 403 }
      );
    }

    if (!folder.bl_id) {
      return NextResponse.json(
        { error: 'Ce dossier n\'a pas de connaissement associé' },
        { status: 400 }
      );
    }

    // Valider les statuts d'arrivée
    const validArrivalStatuses = ['scheduled', 'delayed', 'arrived', 'early', 'cancelled'];
    
    for (const update of body.container_updates) {
      if (!update.container_id) {
        return NextResponse.json(
          { error: 'container_id requis pour chaque mise à jour' },
          { status: 400 }
        );
      }

      if (update.arrival_status && !validArrivalStatuses.includes(update.arrival_status)) {
        return NextResponse.json(
          { error: `Statut d'arrivée invalide: ${update.arrival_status}. Valeurs acceptées: ${validArrivalStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Effectuer les mises à jour
    const updateResults = [];
    
    for (const update of body.container_updates) {
      const updateData: any = {};
      
      // Champs autorisés pour mise à jour
      const allowedFields = [
        'arrival_status', 'actual_arrival_date', 'arrival_notes', 
        'arrival_location', 'customs_clearance_date', 'delivery_ready_date'
      ];
      
      allowedFields.forEach(field => {
        if (update[field] !== undefined) {
          updateData[field] = update[field];
        }
      });

      if (Object.keys(updateData).length > 0) {
        const { data: updatedContainer, error: updateError } = await supabase
          .from('bl_containers')
          .update(updateData)
          .eq('id', update.container_id)
          .eq('bl_id', folder.bl_id)
          .select(`
            id, container_number, arrival_status, 
            actual_arrival_date, arrival_notes
          `)
          .single();

        if (updateError) {
          console.error(`Erreur mise à jour conteneur ${update.container_id}:`, updateError);
          updateResults.push({
            container_id: update.container_id,
            success: false,
            error: updateError.message
          });
        } else {
          updateResults.push({
            container_id: update.container_id,
            success: true,
            data: updatedContainer
          });
        }
      }
    }

    const successCount = updateResults.filter(r => r.success).length;
    const errorCount = updateResults.filter(r => !r.success).length;

    return NextResponse.json({
      message: `${successCount} conteneurs mis à jour avec succès`,
      summary: {
        total_updates: updateResults.length,
        successful: successCount,
        failed: errorCount
      },
      results: updateResults
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}