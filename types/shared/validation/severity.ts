/**
 * Niveaux de sévérité pour validation et erreurs
 * Classification des niveaux d'importance
 * 
 * @module Shared/Validation/Severity
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Niveaux de sévérité
// ============================================================================

/**
 * Niveaux de sévérité standard
 */
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

/**
 * Niveaux de sévérité étendus pour cas spéciaux
 */
export type ExtendedSeverityLevel = 
  | SeverityLevel 
  | 'debug'
  | 'trace'
  | 'fatal';

/**
 * Mappage des niveaux de sévérité avec leurs priorités numériques
 */
export const SEVERITY_LEVELS: Record<SeverityLevel, number> = {
  info: 1,
  warning: 2,
  error: 3,
  critical: 4
} as const;

/**
 * Configuration d'affichage pour chaque niveau de sévérité
 */
export interface SeverityConfig {
  level: SeverityLevel;
  priority: number;
  color: string;
  icon: string;
  requires_attention: boolean;
  blocks_operation: boolean;
}

/**
 * Configuration par défaut pour les niveaux de sévérité
 */
export const DEFAULT_SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
  info: {
    level: 'info',
    priority: 1,
    color: 'blue',
    icon: 'info',
    requires_attention: false,
    blocks_operation: false
  },
  warning: {
    level: 'warning', 
    priority: 2,
    color: 'yellow',
    icon: 'warning',
    requires_attention: true,
    blocks_operation: false
  },
  error: {
    level: 'error',
    priority: 3,
    color: 'red',
    icon: 'error',
    requires_attention: true,
    blocks_operation: true
  },
  critical: {
    level: 'critical',
    priority: 4,
    color: 'red',
    icon: 'critical',
    requires_attention: true,
    blocks_operation: true
  }
} as const;