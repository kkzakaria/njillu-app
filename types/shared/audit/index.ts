/**
 * Point d'entrée du module Audit
 * Export de tous les types d'audit et performance
 * 
 * @module Shared/Audit
 * @version 2.0.0
 * @since 2025-01-06
 */

export type {
  AuditMetadata,
  SimpleAuditInfo,
  AuditTrail,
  AuditContext
} from './metadata';

export type {
  PerformanceMetadata,
  PerformanceThresholds,
  PerformanceReport
} from './performance';