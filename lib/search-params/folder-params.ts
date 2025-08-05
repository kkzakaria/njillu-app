/**
 * Configuration nuqs pour les paramètres de recherche des dossiers
 * Type-safe URL state management pour les filtres, recherche et pagination
 */

import { createSearchParamsCache, parseAsString, parseAsArrayOf, parseAsInteger, parseAsStringEnum } from 'nuqs/server'
import type { 
  FolderStatus, 
  FolderType, 
  FolderCategory, 
  FolderPriority, 
  FolderUrgency
} from '@/types/folders'

// ============================================================================
// Types pour les paramètres de recherche (côté serveur et client)
// ============================================================================

export interface FolderSearchParams {
  // Recherche textuelle
  search: string
  
  // Filtres de statut et classification
  status: string[]
  type: string[]
  category: string[]
  priority: string[]
  urgency: string[]
  processing_stage: string[]
  health_status: string[]
  
  // Filtres clients et géographiques
  client: string
  origin_country: string
  destination_country: string
  
  // Filtres temporels
  created_from: string
  created_to: string
  deadline_from: string
  deadline_to: string
  
  // Filtres financiers
  cost_min: number
  cost_max: number
  currency: string
  
  // Filtres booléens
  has_alerts: string
  is_overdue: string
  has_bls: string
  
  // Filtres de relations
  bl_count_min: number
  bl_count_max: number
  
  // Pagination et tri
  page: number
  limit: number
  sort_by: string
  sort_order: string
  
  // Vue et affichage
  view_mode: string
  columns: string[]
}

// ============================================================================
// Parser pour SSR - Version côté serveur seulement
// ============================================================================

export function parseServerSearchParams(searchParams: Record<string, string | string[] | undefined>): FolderSearchParams {
  // Helper pour parser les arrays
  const parseArray = (value: string | string[] | undefined): string[] => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') return [value]
    return []
  }
  
  // Helper pour parser les entiers
  const parseInteger = (value: string | string[] | undefined, defaultValue: number = 0): number => {
    const str = Array.isArray(value) ? value[0] : value
    const parsed = str ? parseInt(str, 10) : defaultValue
    return isNaN(parsed) ? defaultValue : parsed
  }
  
  // Helper pour parser les strings
  const parseString = (value: string | string[] | undefined, defaultValue: string = ''): string => {
    if (Array.isArray(value)) return value[0] || defaultValue
    return value || defaultValue
  }

  return {
    // Recherche textuelle
    search: parseString(searchParams.search),
    
    // Filtres de statut (arrays)
    status: parseArray(searchParams.status),
    type: parseArray(searchParams.type),
    category: parseArray(searchParams.category),
    priority: parseArray(searchParams.priority),
    urgency: parseArray(searchParams.urgency),
    processing_stage: parseArray(searchParams.processing_stage),
    health_status: parseArray(searchParams.health_status),
    
    // Filtres clients et géographiques
    client: parseString(searchParams.client),
    origin_country: parseString(searchParams.origin_country),
    destination_country: parseString(searchParams.destination_country),
    
    // Filtres temporels
    created_from: parseString(searchParams.created_from),
    created_to: parseString(searchParams.created_to),
    deadline_from: parseString(searchParams.deadline_from),
    deadline_to: parseString(searchParams.deadline_to),
    
    // Filtres financiers
    cost_min: parseInteger(searchParams.cost_min, 0),
    cost_max: parseInteger(searchParams.cost_max, 0),
    currency: parseString(searchParams.currency),
    
    // Filtres booléens
    has_alerts: parseString(searchParams.has_alerts),
    is_overdue: parseString(searchParams.is_overdue),
    has_bls: parseString(searchParams.has_bls),
    
    // Filtres de relations
    bl_count_min: parseInteger(searchParams.bl_count_min, 0),
    bl_count_max: parseInteger(searchParams.bl_count_max, 0),
    
    // Pagination et tri
    page: parseInteger(searchParams.page, 1),
    limit: parseInteger(searchParams.limit, 20),
    sort_by: parseString(searchParams.sort_by, 'created_at'),
    sort_order: parseString(searchParams.sort_order, 'desc'),
    
    // Vue et affichage
    view_mode: parseString(searchParams.view_mode, 'cards'),
    columns: parseArray(searchParams.columns).length > 0 ? parseArray(searchParams.columns) : 
             ['folder_number', 'client_name', 'status', 'priority', 'deadline_date']
  }
}

// ============================================================================
// Types utilitaires
// ============================================================================

export type FolderFilters = FolderSearchParams

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
  const params: Record<string, unknown> = {}
  
  // Recherche textuelle
  if (filters.search) {
    params.search_query = filters.search
    params.search_fields = ['folder_number', 'reference_number', 'description', 'client_name']
  }
  
  // Filtres de statut (arrays)
  if (filters.status && filters.status.length > 0) params.statuses = filters.status
  if (filters.type && filters.type.length > 0) params.types = filters.type
  if (filters.category && filters.category.length > 0) params.categories = filters.category
  if (filters.priority && filters.priority.length > 0) params.priorities = filters.priority
  if (filters.urgency && filters.urgency.length > 0) params.urgencies = filters.urgency
  if (filters.processing_stage && filters.processing_stage.length > 0) params.processing_stages = filters.processing_stage
  if (filters.health_status && filters.health_status.length > 0) params.health_statuses = filters.health_status
  
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
  if (filters.status && filters.status.length > 0) count++
  if (filters.type && filters.type.length > 0) count++
  if (filters.category && filters.category.length > 0) count++
  if (filters.priority && filters.priority.length > 0) count++
  if (filters.urgency && filters.urgency.length > 0) count++
  if (filters.processing_stage && filters.processing_stage.length > 0) count++
  if (filters.health_status && filters.health_status.length > 0) count++
  if (filters.client) count++
  if (filters.origin_country) count++
  if (filters.destination_country) count++
  if (filters.created_from) count++
  if (filters.created_to) count++
  if (filters.deadline_from) count++
  if (filters.deadline_to) count++
  if (filters.cost_min && filters.cost_min > 0) count++
  if (filters.cost_max && filters.cost_max > 0) count++
  if (filters.currency) count++
  if (filters.has_alerts) count++
  if (filters.is_overdue) count++
  if (filters.has_bls) count++
  if (filters.bl_count_min && filters.bl_count_min > 0) count++
  if (filters.bl_count_max && filters.bl_count_max > 0) count++
  
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

// ============================================================================
// Configuration nuqs pour les paramètres de recherche côté client
// ============================================================================

/**
 * Parsers nuqs pour chaque paramètre de recherche
 */
export const folderSearchParsers = {
  // Recherche textuelle
  search: parseAsString.withDefault(''),
  
  // Filtres de statut (arrays)
  status: parseAsArrayOf(parseAsString).withDefault([]),
  type: parseAsArrayOf(parseAsString).withDefault([]),
  category: parseAsArrayOf(parseAsString).withDefault([]),
  priority: parseAsArrayOf(parseAsString).withDefault([]),
  urgency: parseAsArrayOf(parseAsString).withDefault([]),
  processing_stage: parseAsArrayOf(parseAsString).withDefault([]),
  health_status: parseAsArrayOf(parseAsString).withDefault([]),
  
  // Filtres clients et géographiques
  client: parseAsString.withDefault(''),
  origin_country: parseAsString.withDefault(''),
  destination_country: parseAsString.withDefault(''),
  
  // Filtres temporels (ISO date strings)
  created_from: parseAsString.withDefault(''),
  created_to: parseAsString.withDefault(''),
  deadline_from: parseAsString.withDefault(''),
  deadline_to: parseAsString.withDefault(''),
  
  // Filtres financiers
  cost_min: parseAsInteger.withDefault(0),
  cost_max: parseAsInteger.withDefault(0),
  currency: parseAsString.withDefault(''),
  
  // Filtres booléens (comme strings)
  has_alerts: parseAsString.withDefault(''),
  is_overdue: parseAsString.withDefault(''),
  has_bls: parseAsString.withDefault(''),
  
  // Filtres de relations
  bl_count_min: parseAsInteger.withDefault(0),
  bl_count_max: parseAsInteger.withDefault(0),
  
  // Pagination et tri
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  sort_by: parseAsString.withDefault('created_at'),
  sort_order: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
  
  // Vue et affichage
  view_mode: parseAsStringEnum(['cards', 'table', 'list']).withDefault('cards'),
  columns: parseAsArrayOf(parseAsString).withDefault(['folder_number', 'client_name', 'status', 'priority', 'deadline_date'])
}

/**
 * Cache de paramètres de recherche pour optimiser les performances
 */
export const folderSearchParamsCache = createSearchParamsCache(folderSearchParsers)