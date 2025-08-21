import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/folders/search - Recherche avancée de dossiers
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      query, // Recherche textuelle
      filters = {}, // Filtres spécifiques
      pagination = { page: 1, limit: 20 }, // Pagination
      sort = { field: 'created_at', order: 'desc' } // Tri
    } = body;

    // Validation de la pagination
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const offset = (page - 1) * limit;

    // Construction de la requête de base
    let searchQuery = supabase
      .from('folders')
      .select(`
        *,
        created_by_user:users!folders_created_by_fkey(id, first_name, last_name, email),
        assigned_to_user:users!folders_assigned_to_fkey(id, first_name, last_name, email),
        client:clients(id, first_name, last_name, company_name, email),
        bill_of_lading:bills_of_lading!folders_bl_id_fkey(
          id, bl_number, shipping_company_id, issue_date, status,
          shipping_company:shipping_companies(id, name, short_name),
          containers:bl_containers!bl_containers_bl_id_fkey(
            id, container_number, arrival_status,
            container_type:container_types(iso_code, size_feet)
          )
        ),
        processing_stages:folder_processing_stages(
          id, stage, status, sequence_order, priority, completion_percentage:completed_at
        )
      `, { count: 'exact' })
      .is('deleted_at', null);

    // Application des filtres de base
    if (filters.transport_type) {
      if (Array.isArray(filters.transport_type)) {
        searchQuery = searchQuery.in('transport_type', filters.transport_type);
      } else {
        searchQuery = searchQuery.eq('transport_type', filters.transport_type);
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        searchQuery = searchQuery.in('status', filters.status);
      } else {
        searchQuery = searchQuery.eq('status', filters.status);
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        searchQuery = searchQuery.in('priority', filters.priority);
      } else {
        searchQuery = searchQuery.eq('priority', filters.priority);
      }
    }

    if (filters.assigned_to) {
      if (Array.isArray(filters.assigned_to)) {
        searchQuery = searchQuery.in('assigned_to', filters.assigned_to);
      } else {
        searchQuery = searchQuery.eq('assigned_to', filters.assigned_to);
      }
    }

    if (filters.created_by) {
      if (Array.isArray(filters.created_by)) {
        searchQuery = searchQuery.in('created_by', filters.created_by);
      } else {
        searchQuery = searchQuery.eq('created_by', filters.created_by);
      }
    }

    if (filters.client_id) {
      if (Array.isArray(filters.client_id)) {
        searchQuery = searchQuery.in('client_id', filters.client_id);
      } else {
        searchQuery = searchQuery.eq('client_id', filters.client_id);
      }
    }

    // Filtres de dates
    if (filters.date_range) {
      if (filters.date_range.from) {
        searchQuery = searchQuery.gte('folder_date', filters.date_range.from);
      }
      if (filters.date_range.to) {
        searchQuery = searchQuery.lte('folder_date', filters.date_range.to);
      }
    }

    if (filters.created_range) {
      if (filters.created_range.from) {
        searchQuery = searchQuery.gte('created_at', filters.created_range.from);
      }
      if (filters.created_range.to) {
        searchQuery = searchQuery.lte('created_at', filters.created_range.to);
      }
    }

    if (filters.expected_delivery_range) {
      if (filters.expected_delivery_range.from) {
        searchQuery = searchQuery.gte('expected_delivery_date', filters.expected_delivery_range.from);
      }
      if (filters.expected_delivery_range.to) {
        searchQuery = searchQuery.lte('expected_delivery_date', filters.expected_delivery_range.to);
      }
    }

    // Filtres de valeur
    if (filters.estimated_value_range) {
      if (filters.estimated_value_range.min !== undefined) {
        searchQuery = searchQuery.gte('estimated_value', filters.estimated_value_range.min);
      }
      if (filters.estimated_value_range.max !== undefined) {
        searchQuery = searchQuery.lte('estimated_value', filters.estimated_value_range.max);
      }
    }

    // Filtres spéciaux
    if (filters.has_bl === true) {
      searchQuery = searchQuery.not('bl_id', 'is', null);
    } else if (filters.has_bl === false) {
      searchQuery = searchQuery.is('bl_id', null);
    }

    if (filters.is_delayed === true) {
      // Dossiers en retard (date de livraison prévue dépassée)
      const today = new Date().toISOString().split('T')[0];
      searchQuery = searchQuery
        .lt('expected_delivery_date', today)
        .neq('status', 'completed')
        .neq('status', 'cancelled');
    }

    if (filters.is_urgent === true) {
      searchQuery = searchQuery.in('priority', ['urgent', 'critical']);
    }

    // Recherche textuelle avancée
    if (query && query.trim()) {
      const searchTerms = query.trim();
      
      // Si le terme ressemble à un numéro de dossier (format: M250804-000001)
      const folderNumberPattern = /^[MTA]\d{6}-\d{6}$/;
      if (folderNumberPattern.test(searchTerms)) {
        // Recherche exacte sur le numéro de dossier
        searchQuery = searchQuery.eq('folder_number', searchTerms);
      } else {
        // Recherche textuelle dans plusieurs champs avec syntaxe Supabase correcte
        searchQuery = searchQuery.or(`title.ilike.*${searchTerms}*,description.ilike.*${searchTerms}*,client_reference.ilike.*${searchTerms}*,folder_number.ilike.*${searchTerms}*,internal_notes.ilike.*${searchTerms}*,client_notes.ilike.*${searchTerms}*`);
      }
    }

    // Application du tri
    const validSortFields = [
      'created_at', 'updated_at', 'folder_date', 'expected_delivery_date',
      'actual_delivery_date', 'folder_number', 'title', 'priority', 'status'
    ];
    
    const sortField = validSortFields.includes(sort.field) ? sort.field : 'created_at';
    const sortOrder = sort.order === 'asc' ? true : false;
    
    searchQuery = searchQuery.order(sortField, { ascending: sortOrder });

    // Application de la pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    // Exécution de la requête
    const { data: folders, error: searchError, count } = await searchQuery;

    if (searchError) {
      console.error('Erreur lors de la recherche:', searchError);
      return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    // Calcul des métadonnées de pagination
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Ajout de métriques de recherche
    const searchMetrics = {
      total_results: count || 0,
      page_results: folders?.length || 0,
      search_query: query || null,
      filters_applied: Object.keys(filters).length,
      execution_time: Date.now() // Timestamp pour calculer le temps d'exécution côté client
    };

    return NextResponse.json({
      data: folders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev
      },
      search_metadata: searchMetrics,
      applied_filters: filters,
      sort_applied: {
        field: sortField,
        order: sort.order || 'desc'
      }
    });

  } catch (error) {
    console.error('Erreur serveur lors de la recherche:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}