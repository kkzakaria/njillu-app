/**
 * Événements système
 * Types pour les événements et notifications système
 * 
 * @module Shared/Events/SystemEvent
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../core/identifiers';
import type { Timestamp } from '../core/primitives';
import type { EventPayload, SystemEventPayload, BusinessEventPayload } from '../core/value-objects';

// ============================================================================
// Événements système
// ============================================================================

/**
 * Événement système générique avec contraintes de type
 */
export interface SystemEvent<T extends EventPayload = EventPayload> {
  event_id: EntityId;
  event_type: string;
  event_category: 'system' | 'business' | 'security' | 'performance';
  
  // Données de l'événement
  payload: T;
  
  // Métadonnées temporelles
  timestamp: Timestamp;
  expiry_timestamp?: Timestamp;
  
  // Contexte d'origine
  source: {
    service_name: string;
    service_version?: string;
    instance_id?: string;
    environment: 'development' | 'staging' | 'production';
  };
  
  // Traçabilité
  correlation_id?: string;
  parent_event_id?: EntityId;
  root_event_id?: EntityId;
  
  // Métadonnées additionnelles
  priority: 'low' | 'normal' | 'high' | 'critical';
  tags?: Record<string, string>;
  retry_count?: number;
}

/**
 * Événement métier spécialisé
 */
export interface BusinessEvent extends SystemEvent<BusinessEventPayload> {
  event_category: 'business';
}

/**
 * Événement système spécialisé
 */
export interface SystemOperationEvent extends SystemEvent<SystemEventPayload> {
  event_category: 'system';
}

/**
 * Batch d'événements pour traitement optimisé
 */
export interface EventBatch {
  batch_id: string;
  events: SystemEvent[];
  batch_size: number;
  created_at: Timestamp;
  expires_at?: Timestamp;
  
  // Métadonnées de lot
  batch_metadata: {
    source_service: string;
    batch_type: 'realtime' | 'scheduled' | 'replay';
    compression?: 'gzip' | 'none';
    checksum?: string;
  };
}