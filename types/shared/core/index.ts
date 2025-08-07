/**
 * Point d'entrée du module Core - Types de base
 * Export de tous les types fondamentaux
 * 
 * @module Shared/Core
 * @version 2.0.0
 * @since 2025-01-06
 */

// Types primitifs et standards
export type {
  Timestamp,
  ISODate,
  DurationMs,
  DurationSeconds,
  CurrencyCode,
  CountryCode,
  LanguageCode,
  TimezoneCode,
  Percentage,
  Latitude,
  Longitude,
  GeoPosition,
  EmailAddress,
  URL,
  PhoneNumber,
  HexHash,
  FileSize,
  PageCount,
  ResultLimit,
  ResultOffset
} from './primitives';

// Identifiants et branded types
export type {
  EntityId,
  UUIDv4,
  SequentialId,
  UserId,
  SessionId,
  RequestId,
  TransactionId,
  BillOfLadingId,
  FolderId,
  ContainerId,
  DocumentId,
  ClientId,
  CompanyId,
  EventId,
  NotificationId,
  TaskId,
  JobId,
  ExternalSystemId,
  SupabaseId,
  StripeCustomerId,
  GoogleAnalyticsId
} from './identifiers';

// Helpers d'identifiants
export {
  createBrandedId,
  extractId,
  isValidUUID,
  isValidEntityId
} from './identifiers';

// Types de valeurs et objects value
export type {
  FilterValue,
  FilterValueArray,
  AnyFilterValue,
  PreferenceObject,
  UserPreference,
  UserPreferences,
  ValidationValue,
  ValidationObject,
  EventPayload,
  BusinessEventPayload,
  SystemEventPayload,
  ApiErrorDetails,
  ApiResponseMetadata,
  SearchableEntity,
  FacetValue,
  FacetFilters,
  UserProfileData,
  SoftDeleteConditionValue,
  SafeAny
} from './value-objects';