import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/folders - Récupérer tous les dossiers avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Paramètres de filtrage
    const transportType = searchParams.get('transport_type');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const createdBy = searchParams.get('created_by');
    const clientId = searchParams.get('client_id');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const hasBlOnly = searchParams.get('has_bl') === 'true';
    const noBl = searchParams.get('no_bl') === 'true';
    
    // Filtres de dates
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const createdFrom = searchParams.get('created_from');
    const createdTo = searchParams.get('created_to');

    // Construction de la requête
    let query = supabase
      .from('folders')
      .select(`
        *,
        created_by_user:users!folders_created_by_fkey(id, first_name, last_name, email),
        assigned_to_user:users!folders_assigned_to_fkey(id, first_name, last_name, email),
        client:clients(id, first_name, last_name, company_name, email),
        bill_of_lading:bills_of_lading!folders_bl_id_fkey(
          id, bl_number, shipping_company_id, issue_date, status,
          shipping_company:shipping_companies(id, name, short_name)
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Application des filtres
    if (transportType) {
      query = query.eq('transport_type', transportType);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (hasBlOnly) {
      query = query.not('bl_id', 'is', null);
    }
    if (noBl) {
      query = query.is('bl_id', null);
    }

    // Filtres de dates
    if (dateFrom) {
      query = query.gte('folder_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('folder_date', dateTo);
    }
    if (createdFrom) {
      query = query.gte('created_at', createdFrom);
    }
    if (createdTo) {
      query = query.lte('created_at', createdTo);
    }

    // Recherche textuelle
    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        client_reference.ilike.%${search}%,
        folder_number.ilike.%${search}%,
        internal_notes.ilike.%${search}%
      `);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: folders, error, count } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Métadonnées de pagination
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      data: folders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev
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

// POST /api/folders - Créer un nouveau dossier
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des champs requis
    if (!body.transport_type) {
      return NextResponse.json(
        { error: 'Le type de transport est requis' },
        { status: 400 }
      );
    }

    // Validation du type de transport
    const validTransportTypes = ['M', 'T', 'A'];
    if (!validTransportTypes.includes(body.transport_type)) {
      return NextResponse.json(
        { error: 'Type de transport invalide. Valeurs acceptées: M, T, A' },
        { status: 400 }
      );
    }

    // Validation des priorités
    const validPriorities = ['low', 'normal', 'urgent', 'critical'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { error: 'Priorité invalide. Valeurs acceptées: low, normal, urgent, critical' },
        { status: 400 }
      );
    }

    // Validation des statuts
    const validStatuses = ['draft', 'active', 'shipped', 'delivered', 'completed', 'cancelled', 'archived'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Statut invalide.' },
        { status: 400 }
      );
    }

    // Validation des dates
    if (body.expected_delivery_date && body.folder_date) {
      const folderDate = new Date(body.folder_date);
      const expectedDate = new Date(body.expected_delivery_date);
      if (expectedDate < folderDate) {
        return NextResponse.json(
          { error: 'La date de livraison prévue ne peut pas être antérieure à la date du dossier' },
          { status: 400 }
        );
      }
    }

    // Préparer les données à insérer
    const folderData = {
      transport_type: body.transport_type,
      status: body.status || 'draft',
      title: body.title || null,
      description: body.description || null,
      client_reference: body.client_reference || null,
      folder_date: body.folder_date || new Date().toISOString().split('T')[0],
      expected_delivery_date: body.expected_delivery_date || null,
      priority: body.priority || 'normal',
      estimated_value: body.estimated_value || null,
      estimated_value_currency: body.estimated_value_currency || 'EUR',
      internal_notes: body.internal_notes || null,
      client_notes: body.client_notes || null,
      client_id: body.client_id || null,
      assigned_to: body.assigned_to || null,
      created_by: user.id
    };

    // Créer le dossier
    const { data: folder, error } = await supabase
      .from('folders')
      .insert(folderData)
      .select(`
        *,
        created_by_user:users!folders_created_by_fkey(id, first_name, last_name, email),
        assigned_to_user:users!folders_assigned_to_fkey(id, first_name, last_name, email),
        client:clients(id, first_name, last_name, company_name, email)
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la création du dossier:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si spécifié, initialiser les étapes de traitement
    if (body.initialize_stages !== false) {
      const { error: stagesError } = await supabase.rpc('initialize_folder_stages', {
        p_folder_id: folder.id,
        p_user_id: user.id
      });

      if (stagesError) {
        console.warn('Erreur lors de l\'initialisation des étapes:', stagesError);
        // Ne pas faire échouer la création pour cette erreur non critique
      }
    }

    return NextResponse.json({
      message: 'Dossier créé avec succès',
      data: folder
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}