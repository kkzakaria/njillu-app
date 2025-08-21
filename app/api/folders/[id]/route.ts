import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

// GET /api/folders/[id] - Récupérer un dossier spécifique
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

    // Récupérer le dossier avec toutes ses relations
    const { data: folder, error } = await supabase
      .from('folders')
      .select(`
        *,
        created_by_user:users!folders_created_by_fkey(id, first_name, last_name, email),
        assigned_to_user:users!folders_assigned_to_fkey(id, first_name, last_name, email),
        client:clients(
          id, first_name, last_name, company_name, email, phone,
          address_line1, address_line2, city, postal_code, country
        ),
        bill_of_lading:bills_of_lading!folders_bl_id_fkey(
          id, bl_number, booking_reference, export_reference,
          shipping_company_id, shipper_info, consignee_info, notify_party_info,
          port_of_loading, port_of_discharge, vessel_name, voyage_number,
          issue_date, shipped_on_board_date, estimated_arrival_date,
          freight_terms, loading_method, status,
          shipping_company:shipping_companies(id, name, short_name, scac_code),
          containers:bl_containers(
            id, container_number, seal_number, container_type_id,
            tare_weight_kg, gross_weight_kg, net_weight_kg, volume_cbm,
            loading_method, marks_and_numbers, shipper_load_stow_count,
            estimated_arrival_date, actual_arrival_date, arrival_status,
            arrival_notes, arrival_location, customs_clearance_date, delivery_ready_date,
            container_type:container_types(id, iso_code, description, size_feet, category, height_type, teu_equivalent)
          ),
          freight_charges:bl_freight_charges(
            id, charge_type, description, amount, currency,
            calculation_basis, payment_status
          )
        ),
        processing_stages:folder_processing_stages(
          id, stage, status, sequence_order, priority,
          started_at, completed_at, due_date, estimated_completion_date,
          notes, internal_comments, client_visible_comments,
          assigned_to_user:users!folder_processing_stages_assigned_to_fkey(id, first_name, last_name, email),
          completed_by_user:users!folder_processing_stages_completed_by_fkey(id, first_name, last_name, email)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dossier non trouvé' },
          { status: 404 }
        );
      }
      console.error('Erreur lors de la récupération du dossier:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculer les métriques du dossier
    const { data: progressData } = await supabase.rpc('get_folder_progress', {
      p_folder_id: id
    });

    const folderWithMetrics = {
      ...folder,
      metrics: progressData?.[0] || {
        total_stages: 0,
        completed_stages: 0,
        completion_percentage: 0
      }
    };

    return NextResponse.json({
      data: folderWithMetrics
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// PUT /api/folders/[id] - Mettre à jour un dossier
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();

    // Vérifier que le dossier existe et que l'utilisateur peut le modifier
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('id, created_by, assigned_to, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dossier non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // Vérifier les permissions (créateur ou assigné)
    if (existingFolder.created_by !== user.id && existingFolder.assigned_to !== user.id) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour modifier ce dossier' },
        { status: 403 }
      );
    }

    // Validation des champs si fournis
    if (body.transport_type) {
      const validTransportTypes = ['M', 'T', 'A'];
      if (!validTransportTypes.includes(body.transport_type)) {
        return NextResponse.json(
          { error: 'Type de transport invalide. Valeurs acceptées: M, T, A' },
          { status: 400 }
        );
      }
    }

    if (body.priority) {
      const validPriorities = ['low', 'normal', 'urgent', 'critical'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: 'Priorité invalide. Valeurs acceptées: low, normal, urgent, critical' },
          { status: 400 }
        );
      }
    }

    if (body.status) {
      const validStatuses = ['draft', 'active', 'shipped', 'delivered', 'completed', 'cancelled', 'archived'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Statut invalide.' },
          { status: 400 }
        );
      }
    }

    // Validation des dates
    if (body.expected_delivery_date || body.actual_delivery_date) {
      const folderDate = new Date(body.folder_date || existingFolder.folder_date);
      
      if (body.expected_delivery_date) {
        const expectedDate = new Date(body.expected_delivery_date);
        if (expectedDate < folderDate) {
          return NextResponse.json(
            { error: 'La date de livraison prévue ne peut pas être antérieure à la date du dossier' },
            { status: 400 }
          );
        }
      }

      if (body.actual_delivery_date && body.expected_delivery_date) {
        const actualDate = new Date(body.actual_delivery_date);
        const expectedDate = new Date(body.expected_delivery_date);
        if (actualDate < expectedDate) {
          return NextResponse.json(
            { error: 'La date de livraison réelle ne peut pas être antérieure à la date prévue' },
            { status: 400 }
          );
        }
      }
    }

    // Préparer les données à mettre à jour (uniquement les champs fournis)
    const updateData: any = {};
    
    const allowedFields = [
      'transport_type', 'status', 'title', 'description', 'client_reference',
      'folder_date', 'expected_delivery_date', 'actual_delivery_date',
      'priority', 'estimated_value', 'estimated_value_currency',
      'internal_notes', 'client_notes', 'client_id', 'assigned_to'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Si aucun champ à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ valide à mettre à jour' },
        { status: 400 }
      );
    }

    // Mettre à jour le dossier
    const { data: updatedFolder, error: updateError } = await supabase
      .from('folders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        created_by_user:users!folders_created_by_fkey(id, first_name, last_name, email),
        assigned_to_user:users!folders_assigned_to_fkey(id, first_name, last_name, email),
        client:clients(id, first_name, last_name, company_name, email)
      `)
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour du dossier:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Dossier mis à jour avec succès',
      data: updatedFolder
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Supprimer (soft delete) un dossier
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Vérifier que le dossier existe et que l'utilisateur peut le supprimer
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('id, created_by, status, folder_number')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dossier non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // Vérifier les permissions (seul le créateur peut supprimer)
    if (existingFolder.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Seul le créateur du dossier peut le supprimer' },
        { status: 403 }
      );
    }

    // Empêcher la suppression de dossiers dans certains statuts critiques
    const protectedStatuses = ['shipped', 'delivered', 'completed'];
    if (protectedStatuses.includes(existingFolder.status)) {
      return NextResponse.json(
        { error: `Impossible de supprimer un dossier avec le statut '${existingFolder.status}'` },
        { status: 409 }
      );
    }

    // Effectuer le soft delete
    const { data: deletedFolder, error: deleteError } = await supabase
      .from('folders')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id
      })
      .eq('id', id)
      .select('id, folder_number')
      .single();

    if (deleteError) {
      console.error('Erreur lors de la suppression du dossier:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Dossier ${existingFolder.folder_number} supprimé avec succès`,
      data: { id: deletedFolder.id, folder_number: deletedFolder.folder_number }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}