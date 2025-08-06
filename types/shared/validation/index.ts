/**
 * Point d'entrée du module Validation
 * Export de tous les types de validation
 * 
 * @module Shared/Validation
 * @version 2.0.0
 * @since 2025-01-06
 */

export type {
  SeverityLevel,
  ExtendedSeverityLevel,
  SeverityConfig
} from './severity';

export {
  SEVERITY_LEVELS,
  DEFAULT_SEVERITY_CONFIG
} from './severity';

export type {
  ValidationError,
  SchemaValidationError,
  BusinessValidationError,
  ValidationErrorCollection
} from './errors';

export type {
  ValidationResult,
  AdvancedValidationResult,
  BatchValidationResult
} from './results';