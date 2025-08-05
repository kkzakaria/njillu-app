/**
 * Configuration nuqs pour les paramètres de recherche des dossiers
 * Type-safe URL state management pour les filtres, recherche et pagination
 */

import { 
  createSearchParamsCache, 
  parseAsString, 
  parseAsStringEnum, 
  parseAsInteger,
  parseAsArrayOf,
  parseAsStringLiteral
} from 'nuqs'
import type { 
  FolderStatus, 
  FolderType, 
  FolderCategory, 
  FolderPriority, 
  FolderUrgency,
  ProcessingStage,
  HealthStatus 
} from '@/types/folders'

// ============================================================================
// Parsers pour les filtres de dossiers
// ============================================================================

export const folderSearchParams = {
  // Recherche textuelle
  search: parseAsString.withDefault(''),
  
  // Filtres de statut et classification
  status: parseAsArrayOf(
    parseAsStringEnum<FolderStatus>([
      'open', 'processing', 'completed', 'closed', 'on_hold', 'cancelled'
    ])
  ).withDefault([]),
  
  type: parseAsArrayOf(
    parseAsStringEnum<FolderType>([
      'import', 'export', 'transit', 'transhipment', 'storage', 'consolidation', 'distribution'
    ])
  ).withDefault([]),
  
  category: parseAsArrayOf(
    parseAsStringEnum<FolderCategory>([
      'commercial', 'urgent', 'vip', 'hazmat', 'perishable', 'oversized', 'fragile', 'high_value'
    ])
  ).withDefault([]),
  
  priority: parseAsArrayOf(
    parseAsStringEnum<FolderPriority>([
      'low', 'normal', 'high', 'urgent', 'critical'
    ])
  ).withDefault([]),
  
  urgency: parseAsArrayOf(
    parseAsStringEnum<FolderUrgency>([
      'standard', 'expedited', 'rush', 'emergency'
    ])
  ).withDefault([]),
  
  processing_stage: parseAsArrayOf(
    parseAsStringEnum<ProcessingStage>([
      'intake', 'documentation', 'customs_clearance', 'inspection', 
      'storage', 'preparation', 'delivery', 'invoicing', 'closure'
    ])
  ).withDefault([]),
  
  health_status: parseAsArrayOf(
    parseAsStringEnum<HealthStatus>([
      'healthy', 'warning', 'critical', 'failed'
    ])
  ).withDefault([]),
  
  // Filtres clients et géographiques
  client: parseAsString.withDefault(''),
  origin_country: parseAsString.withDefault(''),
  destination_country: parseAsString.withDefault(''),
  
  // Filtres temporels (format ISO string)
  created_from: parseAsString.withDefault(''),
  created_to: parseAsString.withDefault(''),
  deadline_from: parseAsString.withDefault(''),
  deadline_to: parseAsString.withDefault(''),
  
  // Filtres financiers
  cost_min: parseAsInteger.withDefault(0),
  cost_max: parseAsInteger.withDefault(0),
  currency: parseAsString.withDefault(''),
  
  // Filtres de performance et alertes
  has_alerts: parseAsStringLiteral(['true', 'false'] as const).withDefault(''),
  is_overdue: parseAsStringLiteral(['true', 'false'] as const).withDefault(''),
  
  // Filtres de relations
  has_bls: parseAsStringLiteral(['true', 'false'] as const).withDefault(''),
  bl_count_min: parseAsInteger.withDefault(0),
  bl_count_max: parseAsInteger.withDefault(0),
  
  // Pagination et tri
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort_by: parseAsStringEnum([
    'created_at', 
    'folder_number', 
    'deadline_date', 
    'status', 
    'priority',
    'client_name',
    'completion_percentage'
  ] as const).withDefault('created_at'),
  sort_order: parseAsStringEnum(['asc', 'desc'] as const).withDefault('desc'),
  
  // Vue et affichage
  view_mode: parseAsStringEnum(['list', 'cards', 'table'] as const).withDefault('cards'),
  columns: parseAsArrayOf(parseAsString).withDefault([
    'folder_number', 'client_name', 'status', 'priority', 'deadline_date'
  ])
} as const

// ============================================================================
// Cache des paramètres pour SSR
// ============================================================================

export const folderSearchParamsCache = createSearchParamsCache(folderSearchParams)

// ============================================================================
// Types utilitaires
// ============================================================================

export type FolderSearchParamsType = typeof folderSearchParams
export type FolderFilters = ReturnType<typeof folderSearchParamsCache.parse>

// ============================================================================
// Presets de vues communes
// ============================================================================

export const FOLDER_VIEW_PRESETS = {
  all: {
    name: 'Tous les dossiers',
    params: {}
  },
  active: {
    name: 'Dossiers actifs',
    params: {
      status: ['open', 'processing'] as FolderStatus[]
    }
  },
  urgent: {
    name: 'Urgents',
    params: {
      priority: ['urgent', 'critical'] as FolderPriority[],
      urgency: ['rush', 'emergency'] as FolderUrgency[]
    }
  },
  overdue: {
    name: 'En retard',
    params: {
      is_overdue: 'true' as const
    }
  },
  with_alerts: {
    name: 'Avec alertes',
    params: {
      has_alerts: 'true' as const
    }
  },
  import_processing: {
    name: 'Imports en cours',
    params: {
      type: ['import'] as FolderType[],
      status: ['processing'] as FolderStatus[]
    }
  },
  export_processing: {
    name: 'Exports en cours',
    params: {
      type: ['export'] as FolderType[],
      status: ['processing'] as FolderStatus[]
    }
  },
  vip_clients: {
    name: 'Clients VIP',
    params: {
      category: ['vip'] as FolderCategory[]
    }
  },
  hazmat: {
    name: 'Matières dangereuses',
    params: {
      category: ['hazmat'] as FolderCategory[]
    }
  },
  completed_today: {
    name: 'Terminés aujourd\'hui',
    params: {
      status: ['completed'] as FolderStatus[],
      created_from: new Date().toISOString().split('T')[0]
    }
  }
} as const

export type FolderViewPreset = keyof typeof FOLDER_VIEW_PRESETS

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Construit les paramètres de recherche pour l'API
 */
export function buildApiSearchParams(filters: FolderFilters) {
  const params: Record<string, any> = {}
  
  // Recherche textuelle
  if (filters.search) {
    params.search_query = filters.search
    params.search_fields = ['folder_number', 'reference_number', 'description', 'client_name']
  }
  
  // Filtres de statut (arrays)
  if (filters.status.length > 0) params.statuses = filters.status
  if (filters.type.length > 0) params.types = filters.type
  if (filters.category.length > 0) params.categories = filters.category
  if (filters.priority.length > 0) params.priorities = filters.priority
  if (filters.urgency.length > 0) params.urgencies = filters.urgency
  if (filters.processing_stage.length > 0) params.processing_stages = filters.processing_stage
  if (filters.health_status.length > 0) params.health_statuses = filters.health_status
  
  // Filtres de client et géographie
  if (filters.client) params.client_names = [filters.client]
  if (filters.origin_country) params.origin_countries = [filters.origin_country]
  if (filters.destination_country) params.destination_countries = [filters.destination_country]
  
  // Filtres temporels
  if (filters.created_from) params.created_from = filters.created_from
  if (filters.created_to) params.created_to = filters.created_to
  if (filters.deadline_from) params.deadline_from = filters.deadline_from
  if (filters.deadline_to) params.deadline_to = filters.deadline_to
  
  // Filtres financiers
  if (filters.cost_min > 0) params.cost_min = filters.cost_min
  if (filters.cost_max > 0) params.cost_max = filters.cost_max
  if (filters.currency) params.currency = filters.currency
  
  // Filtres booléens
  if (filters.has_alerts) params.has_active_alerts = filters.has_alerts === 'true'
  if (filters.is_overdue) params.is_overdue = filters.is_overdue === 'true'
  if (filters.has_bls) params.has_bls = filters.has_bls === 'true'
  
  // Filtres de relations
  if (filters.bl_count_min > 0) params.bl_count_min = filters.bl_count_min
  if (filters.bl_count_max > 0) params.bl_count_max = filters.bl_count_max
  
  // Pagination et tri
  params.page = filters.page
  params.page_size = filters.limit
  params.sort_by = filters.sort_by
  params.sort_order = filters.sort_order
  
  return params
}

/**
 * Compte le nombre de filtres actifs
 */
export function countActiveFilters(filters: FolderFilters): number {
  let count = 0
  
  if (filters.search) count++
  if (filters.status.length > 0) count++
  if (filters.type.length > 0) count++
  if (filters.category.length > 0) count++
  if (filters.priority.length > 0) count++
  if (filters.urgency.length > 0) count++
  if (filters.processing_stage.length > 0) count++
  if (filters.health_status.length > 0) count++
  if (filters.client) count++
  if (filters.origin_country) count++
  if (filters.destination_country) count++
  if (filters.created_from) count++
  if (filters.created_to) count++
  if (filters.deadline_from) count++
  if (filters.deadline_to) count++
  if (filters.cost_min > 0) count++
  if (filters.cost_max > 0) count++
  if (filters.currency) count++
  if (filters.has_alerts) count++
  if (filters.is_overdue) count++
  if (filters.has_bls) count++
  if (filters.bl_count_min > 0) count++
  if (filters.bl_count_max > 0) count++
  
  return count
}

/**
 * Réinitialise tous les filtres sauf la pagination
 */
export function getResetFilters(): Partial<FolderFilters> {
  return {
    search: '',
    status: [],
    type: [],
    category: [],
    priority: [],
    urgency: [],
    processing_stage: [],
    health_status: [],
    client: '',
    origin_country: '',
    destination_country: '',
    created_from: '',
    created_to: '',
    deadline_from: '',
    deadline_to: '',
    cost_min: 0,
    cost_max: 0,
    currency: '',
    has_alerts: '',
    is_overdue: '',
    has_bls: '',
    bl_count_min: 0,
    bl_count_max: 0
  }
}