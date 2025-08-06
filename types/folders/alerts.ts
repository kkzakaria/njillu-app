/**
 * SYSTÈME D'ALERTES - Architecture Modulaire v2.0
 * 
 * ⚠️  MIGRATION VERS ARCHITECTURE MODULAIRE
 * Ce fichier redirige vers la nouvelle architecture modulaire dans alerts/
 * 
 * AVANT (v1.0):
 * - 1 fichier monolithique: alerts.ts (418 lignes)
 * - 12 interfaces mélangées dans un seul fichier
 * - Responsabilités non séparées
 * 
 * APRÈS (v2.0):
 * - 6 modules spécialisés: alerts/*.ts (~70 lignes chacun)
 * - Séparation claire des responsabilités
 * - Navigation intuitive par domaine
 * - Maintenance simplifiée
 * 
 * MIGRATION RECOMMANDÉE:
 * - Remplacer: import { Type } from './alerts'
 * - Par: import { Type } from './alerts' (toujours fonctionnel)
 * - Ou: import { Type } from './alerts/specialized' (import granulaire)
 * 
 * COMPATIBILITÉ: 100% maintenue - aucun breaking change
 */

// ============================================================================
// REDIRECTION VERS ARCHITECTURE MODULAIRE
// ============================================================================

// Re-export de tous les types depuis les nouveaux modules
export * from './alerts/index';

// ============================================================================
// NAMESPACE EXPORTS POUR IMPORTS GRANULAIRES (Optionnel)
// ============================================================================

// Import granulaire par domaine (nouveau en v2.0)
export * as AlertCore from './alerts/core';
export * as AlertSpecialized from './alerts/specialized';  
export * as AlertRules from './alerts/rules';
export * as AlertAnalytics from './alerts/analytics';
export * as AlertOperations from './alerts/operations';
export * as AlertConfig from './alerts/config';

// ============================================================================
// MIGRATION INFORMATION
// ============================================================================

/**
 * Information de migration pour les développeurs
 */
export const ALERTS_MODULE_INFO = {
  version: '2.0.0',
  migration_date: '2025-08-06',
  architecture: 'modular',
  
  // Nouveaux modules disponibles
  modules: {
    'alerts/core': 'Interface principale FolderAlert et types de base',
    'alerts/specialized': 'Alertes spécialisées (Deadline, Compliance, Delay, Cost)',
    'alerts/rules': 'Système de règles automatiques et triggers',
    'alerts/analytics': 'Dashboard, métriques et analytics',  
    'alerts/operations': 'Opérations CRUD (Create, Update, Search)',
    'alerts/config': 'Configuration système et environnements'
  },
  
  // Bénéfices de la migration
  benefits: [
    '83% réduction taille fichiers (418 → ~70 lignes)',
    'Navigation intuitive par domaine',
    'Import granulaire pour optimisation bundle',
    'Maintenance simplifiée - modifications isolées',
    'Séparation claire des responsabilités',
    'Compatibilité 100% maintenue'
  ],
  
  // Exemples d'utilisation
  usage_examples: {
    global_import: "import { FolderAlert, DeadlineAlert } from './alerts'",
    granular_import: "import { FolderAlert } from './alerts/core'",
    namespace_import: "import * as Alerts from './alerts'",
    specialized_import: "import { DeadlineAlert } from './alerts/specialized'"
  },
  
  deprecated: false,
  breaking_changes: false
} as const;