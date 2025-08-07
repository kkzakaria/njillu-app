/**
 * Point d'entrée du module Events
 * Export de tous les types d'événements
 * 
 * @module Shared/Events
 * @version 2.0.0
 * @since 2025-01-06
 */

export type {
  SystemEvent,
  BusinessEvent,
  SystemOperationEvent,
  EventBatch
} from './system-event';

export type {
  EventHandler,
  HandlerExecutionContext,
  HandlerExecutionResult
} from './event-handler';