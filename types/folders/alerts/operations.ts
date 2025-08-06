/**
 * Opérations CRUD pour les alertes
 * Création, modification, recherche et gestion des alertes
 */

import type {
  AlertType,
  AlertSeverity,
  AlertStatus
} from '../constants/enums';

import type {
  BusinessImpact,
  ActionPriority,
  RecommendedAction
} from './core';

// ============================================================================
// Types pour les opérations
// ============================================================================

/**
 * Champs de tri disponibles
 */
export type AlertSortField = 'created_at' | 'severity' | 'due_date' | 'updated_at';

/**
 * Ordre de tri
 */
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// Opérations de création
// ============================================================================

/**
 * Données pour créer une nouvelle alerte
 */
export interface CreateAlertData {
  folder_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  description?: string;
  business_impact: BusinessImpact;
  due_date?: string;
  assigned_to?: string;
  recommended_actions?: RecommendedAction[];
}

// ============================================================================
// Opérations de mise à jour
// ============================================================================

/**
 * Données pour mettre à jour une alerte existante
 */
export interface UpdateAlertData {
  status?: AlertStatus;
  severity?: AlertSeverity;
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
  recommended_actions?: RecommendedAction[];
}

// ============================================================================
// Opérations de recherche
// ============================================================================

/**
 * Paramètres pour rechercher les alertes
 */
export interface AlertSearchParams {
  folder_ids?: string[];
  types?: AlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  assigned_to?: string[];
  created_from?: string;
  created_to?: string;
  due_from?: string;
  due_to?: string;
  business_impact?: BusinessImpact[];
  
  // Tri et pagination
  sort_by?: AlertSortField;
  sort_order?: SortOrder;
  page?: number;
  page_size?: number;
}