/**
 * Module Entities - Point d'entrée des entités métier
 * Export de toutes les entités de support
 */

export * from './client';
export * from './location';
export * from './financial';
export * from './audit';

// Re-exports pour compatibilité
export type {
  ClientInfo,
  ExtendedClientInfo
} from './client';

export type {
  LocationInfo,
  PortInfo,
  GeoCoordinates
} from './location';

export type {
  FinancialInfo,
  CostBreakdown,
  CostCategory,
  BillingInfo,
  PaymentStatus
} from './financial';

export type {
  AuditMetadata,
  AuditLogEntry,
  FieldChange,
  AuditAction,
  AuditConfig
} from './audit';