/**
 * Parsers nuqs personnalisés pour validation et sérialisation des paramètres URL
 */

import { parseAsArrayOf, parseAsString, parseAsInteger, parseAsBoolean, parseAsStringEnum } from 'nuqs';
import type { 
  FolderPriority, 
  FolderType, 
  FolderCategory,
  ProcessingStage,
  HealthStatus 
} from '@/types/folders';
import type { StatusCategory } from '@/app/[locale]/folders/components/folder-filters-menu/folder-filter.types';

// ============================================================================
// Basic parsers
// ============================================================================

export const queryParser = parseAsString.withDefault('');
export const pageParser = parseAsInteger.withDefault(1);
export const pageSizeParser = parseAsInteger.withDefault(50);
export const sortDirectionParser = parseAsStringEnum(['asc', 'desc'] as const).withDefault('desc');

// ============================================================================
// Folder-specific parsers
// ============================================================================

export const statusCategoryParser = parseAsStringEnum([
  'active', 'completed', 'archived', 'deleted'
] as const).withDefault('active');

export const priorityParser = parseAsArrayOf(
  parseAsStringEnum([
    'low', 'medium', 'high', 'urgent', 'critical'
  ] as const)
).withDefault([]);

export const folderTypeParser = parseAsArrayOf(
  parseAsStringEnum([
    'import', 'export', 'domestic', 'transit'
  ] as const)
).withDefault([]);

export const categoryParser = parseAsArrayOf(
  parseAsStringEnum([
    'standard', 'express', 'urgent', 'vip'
  ] as const)
).withDefault([]);

export const healthStatusParser = parseAsArrayOf(
  parseAsStringEnum([
    'on_track', 'at_risk', 'delayed', 'critical'
  ] as const)
).withDefault([]);

export const processingStageParser = parseAsArrayOf(
  parseAsStringEnum([
    'pending', 'documents_review', 'customs_clearance', 'transport', 'delivered'
  ] as const)
).withDefault([]);

export const transportModeParser = parseAsArrayOf(
  parseAsStringEnum(['maritime', 'terrestre', 'aerien'] as const)
).withDefault([]);

export const transitTypeParser = parseAsArrayOf(
  parseAsStringEnum(['import', 'export'] as const)
).withDefault([]);

// ============================================================================
// Special parsers for time/performance filters
// ============================================================================

export const slaThresholdParser = parseAsStringEnum(['low', 'medium', 'high'] as const);
export const deadlineProximityParser = parseAsStringEnum(['today', 'week', 'month'] as const);
export const isOverdueParser = parseAsBoolean;

export const completionPeriodParser = parseAsStringEnum([
  'today', '3_days', 'week', '2_weeks', 'month'
] as const);

export const performanceRatingParser = parseAsStringEnum([
  'excellent', 'good', 'average', 'poor'
] as const);

export const archiveAgeParser = parseAsStringEnum([
  'recent', 'month', 'quarter', 'semester', 'old'
] as const);

export const deletionPeriodParser = parseAsStringEnum([
  'today', '3_days', 'week', '2_weeks', 'month', 'quarter'
] as const);

// ============================================================================
// Client-specific parsers
// ============================================================================

export const clientFiltersParser = parseAsArrayOf(parseAsString).withDefault([]);

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Convertit un tableau de valeurs en string pour l'URL
 */
export function arrayToUrlString<T>(array: T[]): string {
  return array.join(',');
}

/**
 * Convertit une string URL en tableau de valeurs
 */
export function urlStringToArray(str: string): string[] {
  return str ? str.split(',').filter(Boolean) : [];
}