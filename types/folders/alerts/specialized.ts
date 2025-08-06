/**
 * Alertes spécialisées par domaine métier
 * Extensions spécialisées de l'interface FolderAlert
 */

import type { FolderAlert } from './core';

// ============================================================================
// Types spécialisés pour les domaines métier
// ============================================================================

/**
 * Types d'échéances
 */
export type DeadlineType = 'processing' | 'customs' | 'delivery' | 'payment' | 'document_expiry';

/**
 * Domaines de conformité
 */
export type ComplianceArea = 'customs' | 'safety' | 'environmental' | 'regulatory' | 'quality';

/**
 * Types de retard
 */
export type DelayType = 'processing' | 'transport' | 'customs' | 'document' | 'client_response';

/**
 * Niveaux d'impact de retard
 */
export type ImpactAssessment = 'minimal' | 'moderate' | 'significant' | 'critical';

/**
 * Catégories de budget pour alertes de coût
 */
export type BudgetCategory = 'transport' | 'customs' | 'storage' | 'handling' | 'documentation' | 'other';

/**
 * Types de pénalités de conformité
 */
export type PenaltyType = 'fine' | 'suspension' | 'license_revocation';

// ============================================================================
// Interfaces spécialisées
// ============================================================================

/**
 * Impact en aval d'un retard
 */
export interface DownstreamImpact {
  affected_process: string;
  estimated_delay: string;
  mitigation_possible: boolean;
}

/**
 * Pénalité potentielle de conformité
 */
export interface PotentialPenalty {
  type: PenaltyType;
  amount?: number;
  currency?: string;
  description: string;
}

/**
 * Facteur de coût dans une alerte
 */
export interface CostDriver {
  category: string;
  description: string;
  amount: number;
  is_avoidable: boolean;
}

// ============================================================================
// Alertes spécialisées
// ============================================================================

/**
 * Alerte d'échéance
 */
export interface DeadlineAlert extends Omit<FolderAlert, 'type'> {
  type: 'deadline';
  
  // Spécifique aux échéances
  deadline_type: DeadlineType;
  original_deadline: string;
  current_deadline: string;
  days_remaining: number;
  is_overdue: boolean;
  grace_period_days?: number;
}

/**
 * Alerte de conformité
 */
export interface ComplianceAlert extends Omit<FolderAlert, 'type'> {
  type: 'compliance_issue';
  
  // Spécifique à la conformité
  compliance_area: ComplianceArea;
  regulation_reference?: string;
  violation_details: string;
  corrective_actions_required: string[];
  regulatory_deadline?: string;
  potential_penalties?: PotentialPenalty[];
}

/**
 * Alerte de retard
 */
export interface DelayAlert extends Omit<FolderAlert, 'type'> {
  type: 'delay';
  
  // Spécifique aux retards
  delay_type: DelayType;
  original_schedule: string;
  current_estimate: string;
  delay_duration_hours: number;
  impact_assessment: ImpactAssessment;
  downstream_impacts?: DownstreamImpact[];
}

/**
 * Alerte de coût
 */
export interface CostAlert extends Omit<FolderAlert, 'type'> {
  type: 'cost_overrun';
  
  // Spécifique aux coûts
  budget_category: BudgetCategory;
  original_budget: number;
  current_cost: number;
  projected_final_cost: number;
  overrun_amount: number;
  overrun_percentage: number;
  currency: string;
  
  // Analyse des causes
  cost_drivers?: CostDriver[];
}