/**
 * Configuration nuqs côté client pour les paramètres de recherche des dossiers
 * Utilisé uniquement dans les composants client
 */
'use client'

import { 
  parseAsString, 
  parseAsInteger,
  parseAsArrayOf
} from 'nuqs'

// ============================================================================
// Parsers nuqs pour les composants client
// ============================================================================

export const folderSearchParams = {
  // Recherche textuelle
  search: parseAsString,
  
  // Filtres de statut et classification
  status: parseAsArrayOf(parseAsString),
  type: parseAsArrayOf(parseAsString),
  category: parseAsArrayOf(parseAsString),
  priority: parseAsArrayOf(parseAsString),
  urgency: parseAsArrayOf(parseAsString),
  processing_stage: parseAsArrayOf(parseAsString),
  health_status: parseAsArrayOf(parseAsString),
  
  // Filtres clients et géographiques
  client: parseAsString,
  origin_country: parseAsString,
  destination_country: parseAsString,
  
  // Filtres temporels
  created_from: parseAsString,
  created_to: parseAsString,
  deadline_from: parseAsString,
  deadline_to: parseAsString,
  
  // Filtres financiers
  cost_min: parseAsInteger,
  cost_max: parseAsInteger,
  currency: parseAsString,
  
  // Filtres booléens
  has_alerts: parseAsString,
  is_overdue: parseAsString,
  has_bls: parseAsString,
  
  // Filtres de relations
  bl_count_min: parseAsInteger,
  bl_count_max: parseAsInteger,
  
  // Pagination et tri
  page: parseAsInteger,
  limit: parseAsInteger,
  sort_by: parseAsString,
  sort_order: parseAsString,
  
  // Vue et affichage
  view_mode: parseAsString,
  columns: parseAsArrayOf(parseAsString)
} as const

export type FolderSearchParamsType = typeof folderSearchParams