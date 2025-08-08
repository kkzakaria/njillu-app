/**
 * Types pour l'intégration et les API externes des Bills of Lading
 * Configuration système, synchronisation et résultats d'intégration
 */

// ============================================================================
// Types pour l'intégration et les API
// ============================================================================

/**
 * Configuration d'intégration avec des systèmes externes
 */
export interface BLIntegrationConfig {
  system_name: string;
  system_type: 'erp' | 'tms' | 'customs' | 'tracking' | 'billing';
  
  // Endpoints
  base_url: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth';
    credentials: Record<string, string>;
  };
  
  // Mapping des champs
  field_mapping: Record<string, string>;
  
  // Configuration de synchronisation
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  
  // Gestion des erreurs
  retry_policy: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    timeout_ms: number;
  };
}

/**
 * Résultat de synchronisation avec un système externe
 */
export interface BLSyncResult {
  integration_name: string;
  sync_started_at: string;
  sync_completed_at?: string;
  
  status: 'success' | 'partial_success' | 'failed';
  
  statistics: {
    total_records: number;
    synchronized_records: number;
    failed_records: number;
    skipped_records: number;
  };
  
  errors: Array<{
    bl_id: string;
    error_code: string;
    error_message: string;
    retry_possible: boolean;
  }>;
  
  next_sync_scheduled?: string;
}