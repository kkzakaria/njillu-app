/**
 * List-Detail API Endpoint Specifications
 * RESTful API design for list-detail layout system
 * 
 * @module API/ListDetailEndpoints
 * @version 1.0.0
 * @since 2025-08-08
 */

import type { 
  EntityType, 
  EntityId,
  ListViewResponse,
  ListViewItem,
  DetailViewData,
  ListApiParams,
  DetailApiParams,
  BulkOperationParams,
  SearchSuggestion,
  ListViewAggregates,
  ApiResponse
} from '@/types';

// ============================================================================
// API ROUTE PATTERNS
// ============================================================================

/**
 * RESTful API route patterns for list-detail operations
 */
export const API_ROUTES = {
  // List operations
  LIST: '/api/v1/:entityType',
  LIST_AGGREGATES: '/api/v1/:entityType/aggregates',
  LIST_FACETS: '/api/v1/:entityType/facets',
  
  // Detail operations  
  DETAIL: '/api/v1/:entityType/:id',
  DETAIL_ACTIVITIES: '/api/v1/:entityType/:id/activities',
  DETAIL_RELATED: '/api/v1/:entityType/:id/related',
  
  // Search operations
  SEARCH: '/api/v1/:entityType/search',
  SEARCH_SUGGESTIONS: '/api/v1/:entityType/search/suggestions',
  
  // Bulk operations
  BULK: '/api/v1/:entityType/bulk',
  
  // Export operations
  EXPORT: '/api/v1/:entityType/export'
} as const;

/**
 * HTTP methods for each endpoint
 */
export const API_METHODS = {
  LIST: 'GET',
  LIST_AGGREGATES: 'GET', 
  LIST_FACETS: 'GET',
  DETAIL: 'GET',
  DETAIL_ACTIVITIES: 'GET',
  DETAIL_RELATED: 'GET',
  SEARCH: 'GET',
  SEARCH_SUGGESTIONS: 'GET',
  BULK: 'POST',
  EXPORT: 'POST'
} as const;

// ============================================================================
// SUPABASE QUERY BUILDERS
// ============================================================================

/**
 * Supabase table mapping for entity types
 */
export const SUPABASE_TABLES: Record<EntityType, string> = {
  bill_of_lading: 'bills_of_lading',
  bl_container: 'bl_containers',
  bl_freight_charge: 'bl_freight_charges',
  shipping_company: 'shipping_companies',
  container_type: 'container_types',
  folder: 'folders',
  folder_alert: 'folder_alerts',
  folder_document: 'folder_documents',
  container_arrival_tracking: 'container_arrival_tracking'
};

/**
 * Base query configuration for each entity type
 */
export interface EntityQueryConfig {
  readonly table: string;
  readonly listFields: string[];
  readonly detailFields: string[];
  readonly searchFields: string[];
  readonly filterFields: string[];
  readonly sortFields: string[];
  readonly relations: Record<string, {
    table: string;
    foreignKey: string;
    fields: string[];
  }>;
}

/**
 * Query configuration for Bills of Lading
 */
export const BL_QUERY_CONFIG: EntityQueryConfig = {
  table: 'bills_of_lading',
  listFields: [
    'id',
    'bl_number', 
    'vessel_name',
    'status',
    'created_at',
    'updated_at',
    'shipper_name',
    'consignee_name',
    'port_of_loading',
    'port_of_discharge'
  ],
  detailFields: ['*'],
  searchFields: ['bl_number', 'vessel_name', 'shipper_name', 'consignee_name'],
  filterFields: ['status', 'port_of_loading', 'port_of_discharge', 'created_at'],
  sortFields: ['created_at', 'updated_at', 'bl_number', 'vessel_name'],
  relations: {
    containers: {
      table: 'bl_containers',
      foreignKey: 'bill_of_lading_id',
      fields: ['id', 'container_number', 'container_type', 'seal_number']
    },
    charges: {
      table: 'bl_freight_charges',
      foreignKey: 'bill_of_lading_id', 
      fields: ['id', 'charge_type', 'amount', 'currency']
    }
  }
};

/**
 * Query configuration for Folders
 */
export const FOLDER_QUERY_CONFIG: EntityQueryConfig = {
  table: 'folders',
  listFields: [
    'id',
    'folder_number',
    'client_name',
    'status',
    'priority', 
    'created_at',
    'updated_at',
    'processing_stage',
    'customs_type'
  ],
  detailFields: ['*'],
  searchFields: ['folder_number', 'client_name', 'description'],
  filterFields: ['status', 'priority', 'processing_stage', 'customs_type', 'created_at'],
  sortFields: ['created_at', 'updated_at', 'folder_number', 'client_name', 'priority'],
  relations: {
    alerts: {
      table: 'folder_alerts',
      foreignKey: 'folder_id',
      fields: ['id', 'alert_type', 'severity', 'message', 'created_at']
    },
    documents: {
      table: 'folder_documents', 
      foreignKey: 'folder_id',
      fields: ['id', 'document_name', 'document_type', 'file_url']
    }
  }
};

/**
 * Query configuration for Container Arrivals
 */
export const CONTAINER_QUERY_CONFIG: EntityQueryConfig = {
  table: 'container_arrival_tracking',
  listFields: [
    'container_id',
    'container_number',
    'vessel_name',
    'arrival_status',
    'urgency_level',
    'eta_date',
    'actual_arrival_date',
    'created_at',
    'updated_at'
  ],
  detailFields: ['*'],
  searchFields: ['container_number', 'vessel_name', 'port_name'],
  filterFields: ['arrival_status', 'urgency_level', 'eta_date', 'port_name'],
  sortFields: ['eta_date', 'actual_arrival_date', 'created_at', 'container_number'],
  relations: {
    delays: {
      table: 'container_delay_alerts',
      foreignKey: 'container_id', 
      fields: ['id', 'delay_reason', 'estimated_delay_hours', 'created_at']
    }
  }
};

/**
 * Get query configuration for entity type
 */
export function getQueryConfig(entityType: EntityType): EntityQueryConfig {
  switch (entityType) {
    case 'bill_of_lading':
      return BL_QUERY_CONFIG;
    case 'folder':
      return FOLDER_QUERY_CONFIG;
    case 'container_arrival_tracking':
      return CONTAINER_QUERY_CONFIG;
    default:
      throw new Error(`Query configuration not implemented for entity type: ${entityType}`);
  }
}

// ============================================================================
// QUERY BUILDER FUNCTIONS
// ============================================================================

/**
 * Build list query with filters, search, and pagination
 */
export function buildListQuery(params: ListApiParams) {
  const config = getQueryConfig(params.entityType);
  const tableName = SUPABASE_TABLES[params.entityType];
  
  let query = `
    SELECT ${config.listFields.join(', ')}
    FROM ${tableName}
    WHERE deleted_at IS NULL
  `;
  
  // Apply search
  if (params.search && params.search.trim()) {
    const searchConditions = config.searchFields
      .map(field => `${field} ILIKE '%${params.search}%'`)
      .join(' OR ');
    query += ` AND (${searchConditions})`;
  }
  
  // Apply filters
  if (params.filters && params.filters.length > 0) {
    for (const filter of params.filters) {
      switch (filter.operator) {
        case 'eq':
          query += ` AND ${filter.field} = '${filter.value}'`;
          break;
        case 'ne':
          query += ` AND ${filter.field} != '${filter.value}'`;
          break;
        case 'gt':
          query += ` AND ${filter.field} > '${filter.value}'`;
          break;
        case 'gte': 
          query += ` AND ${filter.field} >= '${filter.value}'`;
          break;
        case 'lt':
          query += ` AND ${filter.field} < '${filter.value}'`;
          break;
        case 'lte':
          query += ` AND ${filter.field} <= '${filter.value}'`;
          break;
        case 'in':
          query += ` AND ${filter.field} IN (${Array.isArray(filter.value) ? filter.value.map(v => `'${v}'`).join(',') : `'${filter.value}'`})`;
          break;
        case 'like':
          query += ` AND ${filter.field} ILIKE '%${filter.value}%'`;
          break;
        case 'is_null':
          query += ` AND ${filter.field} IS NULL`;
          break;
        case 'is_not_null':
          query += ` AND ${filter.field} IS NOT NULL`;
          break;
      }
    }
  }
  
  // Apply sorting
  if (params.sort && params.sort.length > 0) {
    const sortClauses = params.sort
      .filter(sort => config.sortFields.includes(sort.field))
      .map(sort => `${sort.field} ${sort.direction}`)
      .join(', ');
    if (sortClauses) {
      query += ` ORDER BY ${sortClauses}`;
    }
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  
  // Apply pagination
  if (params.limit) {
    query += ` LIMIT ${params.limit}`;
  }
  if (params.offset) {
    query += ` OFFSET ${params.offset}`;
  }
  
  return query;
}

/**
 * Build detail query with relations
 */
export function buildDetailQuery(params: DetailApiParams) {
  const config = getQueryConfig(params.entityType);
  const tableName = SUPABASE_TABLES[params.entityType];
  
  let queries = {
    main: `
      SELECT ${config.detailFields.join(', ')}
      FROM ${tableName}
      WHERE id = '${params.id}' AND deleted_at IS NULL
    `,
    related: {} as Record<string, string>,
    activities: ''
  };
  
  // Build related queries
  if (params.includeRelated) {
    for (const [relationName, relationConfig] of Object.entries(config.relations)) {
      queries.related[relationName] = `
        SELECT ${relationConfig.fields.join(', ')}
        FROM ${relationConfig.table}
        WHERE ${relationConfig.foreignKey} = '${params.id}' AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 10
      `;
    }
  }
  
  // Build activities query (assuming audit table pattern)
  if (params.includeActivities) {
    queries.activities = `
      SELECT 
        id, action, description, changes, comment,
        created_at, created_by_id, user_id
      FROM audit_logs
      WHERE entity_type = '${params.entityType}' 
        AND entity_id = '${params.id}'
      ORDER BY created_at DESC
      LIMIT ${params.activityLimit || 20}
    `;
  }
  
  return queries;
}

/**
 * Build aggregates query
 */
export function buildAggregatesQuery(entityType: EntityType) {
  const config = getQueryConfig(entityType);
  const tableName = SUPABASE_TABLES[entityType];
  
  // Status counts query
  let query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM ${tableName}
    WHERE deleted_at IS NULL
    GROUP BY status
  `;
  
  return query;
}

/**
 * Build facets query for filtering
 */
export function buildFacetsQuery(entityType: EntityType) {
  const config = getQueryConfig(entityType);
  const tableName = SUPABASE_TABLES[entityType];
  
  const queries: Record<string, string> = {};
  
  // Build facet queries for filterable fields
  for (const field of config.filterFields) {
    if (field !== 'created_at' && field !== 'updated_at') {
      queries[field] = `
        SELECT 
          ${field} as value,
          COUNT(*) as count
        FROM ${tableName}
        WHERE deleted_at IS NULL AND ${field} IS NOT NULL
        GROUP BY ${field}
        ORDER BY count DESC, ${field}
        LIMIT 50
      `;
    }
  }
  
  return queries;
}

// ============================================================================
// RESPONSE TRANSFORMATION
// ============================================================================

/**
 * Transform database row to list view item
 */
export function transformToListViewItem<T extends EntityType>(
  entityType: T,
  row: Record<string, unknown>
): ListViewItem<T> {
  const baseItem: ListViewItem<T> = {
    id: row.id as string,
    entityType,
    title: getEntityTitle(entityType, row),
    subtitle: getEntitySubtitle(entityType, row),
    status: row.status as string,
    priority: getEntityPriority(entityType, row),
    updatedAt: row.updated_at as string,
    preview: row as any, // Type assertion for EntityTypeMap[T]
    badges: generateBadges(entityType, row),
    actions: generateActions(entityType, row),
    metadata: {
      table: SUPABASE_TABLES[entityType],
      queryTime: Date.now()
    }
  };
  
  return baseItem;
}

/**
 * Get entity title for list display
 */
function getEntityTitle(entityType: EntityType, row: Record<string, unknown>): string {
  switch (entityType) {
    case 'bill_of_lading':
      return `BL ${row.bl_number || 'N/A'}`;
    case 'folder':
      return `Folder ${row.folder_number || 'N/A'}`;
    case 'container_arrival_tracking':
      return `Container ${row.container_number || 'N/A'}`;
    default:
      return row.name as string || row.title as string || 'Untitled';
  }
}

/**
 * Get entity subtitle for list display  
 */
function getEntitySubtitle(entityType: EntityType, row: Record<string, unknown>): string | undefined {
  switch (entityType) {
    case 'bill_of_lading':
      return `${row.vessel_name || 'Unknown Vessel'} • ${row.shipper_name || 'Unknown Shipper'}`;
    case 'folder':
      return `${row.client_name || 'Unknown Client'} • ${row.processing_stage || 'Unknown Stage'}`;
    case 'container_arrival_tracking':
      return `${row.vessel_name || 'Unknown Vessel'} • ETA: ${row.eta_date || 'Unknown'}`;
    default:
      return undefined;
  }
}

/**
 * Get entity priority for list display
 */
function getEntityPriority(
  entityType: EntityType, 
  row: Record<string, unknown>
): 'low' | 'medium' | 'high' | 'urgent' | undefined {
  switch (entityType) {
    case 'folder':
      return row.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined;
    case 'container_arrival_tracking':
      // Map urgency to priority
      const urgency = row.urgency_level as string;
      switch (urgency) {
        case 'low': return 'low';
        case 'medium': return 'medium'; 
        case 'high': return 'high';
        case 'critical': return 'urgent';
        default: return undefined;
      }
    default:
      return undefined;
  }
}

/**
 * Generate status badges for list items
 */
function generateBadges(entityType: EntityType, row: Record<string, unknown>): ListItemBadge[] {
  const badges: ListItemBadge[] = [];
  
  // Status badge
  const status = row.status as string;
  if (status) {
    badges.push({
      label: status.replace('_', ' ').toUpperCase(),
      variant: getStatusVariant(status),
      tooltip: `Status: ${status}`
    });
  }
  
  // Entity-specific badges
  switch (entityType) {
    case 'container_arrival_tracking':
      const urgency = row.urgency_level as string;
      if (urgency === 'critical' || urgency === 'high') {
        badges.push({
          label: urgency.toUpperCase(),
          variant: urgency === 'critical' ? 'danger' : 'warning',
          icon: 'alert-triangle',
          tooltip: `Urgency level: ${urgency}`
        });
      }
      break;
  }
  
  return badges;
}

/**
 * Generate quick actions for list items
 */
function generateActions(entityType: EntityType, row: Record<string, unknown>): ListItemAction[] {
  const actions: ListItemAction[] = [
    {
      id: 'view',
      label: 'View',
      icon: 'eye',
      variant: 'default'
    },
    {
      id: 'edit', 
      label: 'Edit',
      icon: 'edit',
      variant: 'secondary'
    }
  ];
  
  // Add entity-specific actions
  switch (entityType) {
    case 'bill_of_lading':
      actions.push({
        id: 'download_pdf',
        label: 'Download PDF',
        icon: 'download',
        variant: 'default'
      });
      break;
    case 'folder':
      actions.push({
        id: 'add_document',
        label: 'Add Document', 
        icon: 'file-plus',
        variant: 'default'
      });
      break;
  }
  
  // Delete action
  actions.push({
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    variant: 'danger',
    requiresConfirmation: true
  });
  
  return actions;
}

/**
 * Get status variant for badge styling
 */
function getStatusVariant(status: string): ListItemBadge['variant'] {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'delivered':
    case 'arrived':
      return 'success';
    case 'pending':
    case 'in_transit':
    case 'processing':
      return 'warning';
    case 'cancelled':
    case 'failed':
    case 'delayed':
      return 'danger';
    case 'draft':
    case 'created':
      return 'info';
    default:
      return 'default';
  }
}

// ============================================================================
// CACHE KEYS
// ============================================================================

/**
 * Generate cache keys for different operations
 */
export const CACHE_KEYS = {
  list: (entityType: EntityType, params: string) => `list:${entityType}:${params}`,
  detail: (entityType: EntityType, id: EntityId) => `detail:${entityType}:${id}`,
  aggregates: (entityType: EntityType) => `aggregates:${entityType}`,
  facets: (entityType: EntityType) => `facets:${entityType}`,
  search: (entityType: EntityType, query: string) => `search:${entityType}:${query}`
} as const;