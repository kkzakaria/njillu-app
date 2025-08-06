# Types Containers - Guide d'exemples

Ce guide présente des exemples pratiques d'utilisation du système de types Containers pour le suivi des arrivées de conteneurs.

## 📦 Exemples de base

### Création d'un nouveau tracking de conteneur

```typescript
import type { 
  CreateArrivalTrackingData,
  ContainerArrivalStatus 
} from '@/types/containers';

// Création d'un nouveau tracking pour conteneur Shanghai → Le Havre
const newTracking: CreateArrivalTrackingData = {
  container_id: "CONT_2025_001234",
  port_of_discharge: "FRLEH", // Le Havre
  estimated_arrival_date: "2025-01-15T08:00:00Z",
  original_eta: "2025-01-15T08:00:00Z",
  arrival_location: "Terminal Atlantique",
  initial_status: "in_transit",
  tracking_source: "shipping_company_api",
  confidence_level: "high",
  enable_notifications: true,
  notification_config: {
    triggers: {
      eta_available: true,
      eta_changed: true,
      container_arrived: true,
      delay_detected: true,
      customs_cleared: false,
      ready_for_delivery: true
    },
    delay_threshold_days: 1,
    advance_notice_days: 3
  },
  notes: "Conteneur prioritaire - client VIP",
  created_by: "system_integration"
};
```

### Mise à jour d'informations d'arrivée

```typescript
import type { UpdateArrivalData } from '@/types/containers';

// Mise à jour ETA suite à retard météorologique
const updateData: UpdateArrivalData = {
  container_id: "CONT_2025_001234",
  estimated_arrival_date: "2025-01-17T14:00:00Z", // +2 jours
  arrival_status: "delayed",
  update_reason: "Tempête en Méditerranée retardant le navire",
  update_source: "manual",
  confidence_level: "high",
  notes: "Information confirmée par le capitaine du navire",
  notify_client: true,
  notification_message: "Nouveau retard prévu de 2 jours en raison des conditions météorologiques",
  updated_by: "operator_marine_001"
};
```

## 🔔 Système d'alertes

### Configuration d'alerte de retard

```typescript
import type { 
  ContainerDelayAlert,
  DelaySeverity 
} from '@/types/containers';

// Alerte automatique générée pour retard critique
const delayAlert: ContainerDelayAlert = {
  id: "ALERT_DELAY_001234",
  container_id: "CONT_2025_001234",
  alert_type: "container_delay",
  
  container_number: "MSCU1234567",
  bl_number: "BL2025001234",
  client_name: "Logistics Pro SARL",
  
  original_eta: "2025-01-15T08:00:00Z",
  current_eta: "2025-01-17T14:00:00Z",
  delay_days: 2,
  delay_severity: "moderate",
  
  delay_reason: "Conditions météorologiques défavorables",
  delay_category: "weather",
  
  business_impact: "medium",
  cost_impact_estimate: 2500, // EUR
  client_impact_description: "Retard possible sur livraison client final",
  
  recommended_actions: [
    {
      action: "Informer le client du nouveau délai",
      priority: "high",
      estimated_effort: "15 minutes",
      deadline: "2025-01-13T17:00:00Z"
    },
    {
      action: "Vérifier disponibilité transport alternatif",
      priority: "medium", 
      estimated_effort: "1 heure"
    }
  ],
  
  client_notified: false,
  notification_methods: ["email", "portal"],
  
  status: "active",
  assigned_to: "team_operations",
  created_at: "2025-01-13T10:30:00Z",
  updated_at: "2025-01-13T10:30:00Z",
  
  escalation_level: 0,
  escalation_history: []
};
```

### Alerte ETA manquant

```typescript
import type { MissingETAAlert } from '@/types/containers';

// Conteneur sans ETA depuis 5 jours
const missingETAAlert: MissingETAAlert = {
  id: "ALERT_ETA_005678",
  container_id: "CONT_2025_005678",
  alert_type: "missing_eta",
  
  container_number: "TEMU9876543",
  bl_number: "BL2025005678", 
  client_name: "Import Express SA",
  
  days_without_eta: 5,
  last_known_location: "Port de Shanghai",
  shipping_company_name: "Pacific Maritime Lines",
  
  urgency_level: "high",
  business_priority: "critical",
  
  follow_up_actions: [
    {
      action: "contacted_shipping_line",
      taken_at: "2025-01-12T09:00:00Z",
      taken_by: "operator_001",
      result: "Promesse de réponse sous 24h",
      notes: "Contact direct avec service client PML"
    },
    {
      action: "client_informed",
      taken_at: "2025-01-12T14:30:00Z",
      taken_by: "customer_service_002",
      result: "Client informé de la situation"
    }
  ],
  
  next_follow_up_date: "2025-01-14T09:00:00Z",
  follow_up_frequency: "daily",
  max_wait_days: 10,
  
  status: "active",
  created_at: "2025-01-11T08:00:00Z",
  updated_at: "2025-01-12T14:30:00Z",
  
  auto_generated: true,
  trigger_rule: "eta_missing_5_days"
};
```

## 🔗 Intégrations avec compagnies maritimes

### Configuration d'intégration API REST

```typescript
import type { ShippingLineIntegration } from '@/types/containers';

// Configuration pour intégration avec Maersk API
const maerskIntegration: ShippingLineIntegration = {
  integration_id: "INT_MAERSK_001",
  shipping_company_id: "COMP_MAERSK",
  company_name: "Maersk Line",
  
  integration_type: "api",
  
  connection_config: {
    base_url: "https://api.maersk.com/logistics/tracking/v1",
    api_key: "mk_live_1234567890abcdef",
    authentication_method: "api_key",
    timeout_seconds: 30,
    retry_attempts: 3,
    rate_limit_per_minute: 60
  },
  
  field_mapping: {
    container_number_field: "containerNumber",
    eta_field: "estimatedTimeOfArrival",
    actual_arrival_field: "actualTimeOfArrival", 
    status_field: "transportStatus",
    location_field: "location.name",
    
    status_value_mapping: {
      "IN_TRANSIT": "in_transit",
      "AT_DISCHARGE_PORT": "port_arrival",
      "CUSTOMS_CLEARANCE": "customs_clearance",
      "DELIVERED": "delivered"
    },
    
    date_format: "ISO8601",
    timezone: "UTC"
  },
  
  sync_schedule: {
    enabled: true,
    frequency: "hourly",
    sync_window_hours: 24
  },
  
  error_handling: {
    continue_on_error: true,
    max_consecutive_failures: 5,
    escalation_after_failures: 3,
    notification_recipients: ["ops-team@company.com"]
  },
  
  monitoring: {
    track_response_times: true,
    alert_on_sync_failure: true,
    success_rate_threshold: 95,
    data_quality_checks: true
  },
  
  status: "active",
  last_successful_sync: "2025-01-13T11:00:00Z",
  consecutive_failures: 0,
  
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-13T11:00:00Z",
  created_by: "admin_integration"
};
```

### Résultat de synchronisation

```typescript
import type { SyncResult } from '@/types/containers';

// Résultat d'une synchronisation avec données qualité
const syncResult: SyncResult = {
  sync_id: "SYNC_20250113_110000",
  integration_id: "INT_MAERSK_001",
  shipping_company_name: "Maersk Line",
  
  sync_started_at: "2025-01-13T11:00:00Z",
  sync_completed_at: "2025-01-13T11:03:45Z",
  sync_duration_ms: 225000, // 3m 45s
  
  status: "partial_success",
  
  containers_processed: 150,
  containers_updated: 142,
  containers_added: 3,
  containers_failed: 5,
  
  updates: [
    {
      container_id: "CONT_2025_001234",
      container_number: "MSCU1234567",
      changes: [
        {
          field: "estimated_arrival_date",
          old_value: "2025-01-15T08:00:00Z",
          new_value: "2025-01-16T10:00:00Z",
          confidence_level: "high"
        },
        {
          field: "arrival_status", 
          old_value: "in_transit",
          new_value: "port_arrival",
          confidence_level: "high"
        }
      ],
      notifications_triggered: 2
    }
  ],
  
  errors: [
    {
      container_number: "TEMU9999999",
      error_type: "validation",
      error_code: "INVALID_ETA_FORMAT",
      error_message: "Date format not recognized: '2025/01/15 8:00'",
      is_retryable: false
    }
  ],
  
  warnings: [
    {
      container_number: "MSCU1111111",
      warning_type: "data_quality",
      message: "ETA très éloignée de la moyenne pour cette route",
      recommended_action: "Vérifier manuellement avec la compagnie"
    }
  ],
  
  data_quality_metrics: {
    completeness_score: 87, // 87% des champs requis remplis
    accuracy_score: 94,     // 94% des données cohérentes
    timeliness_score: 96,   // 96% des données récentes
    consistency_score: 91   // 91% cohérent avec historique
  },
  
  recommended_actions: [
    {
      action: "Revoir le mapping de format de date",
      priority: "medium",
      description: "Certains formats de date ne sont pas reconnus",
      estimated_effort: "30 minutes"
    }
  ],
  
  next_sync_scheduled: "2025-01-13T12:00:00Z",
  sync_frequency_adjusted: false
};
```

## 🤖 Automatisation et règles métier

### Règle d'automatisation pour retards

```typescript
import type { ArrivalAutomationRule } from '@/types/containers';

// Règle automatique : notification client pour retard > 2 jours
const delayNotificationRule: ArrivalAutomationRule = {
  rule_id: "RULE_DELAY_NOTIFICATION",
  rule_name: "Notification automatique retard critique",
  description: "Envoie automatiquement une notification au client pour les retards supérieurs à 2 jours",
  
  trigger_conditions: {
    on_events: ["eta_changed", "delay_detected"],
    
    data_conditions: [
      {
        field: "delay_days",
        operator: "greater",
        value: 2
      },
      {
        field: "delay_severity", 
        operator: "equals",
        value: "major"
      }
    ],
    
    time_conditions: [
      {
        condition: "hours_without_update",
        threshold: 4 // Pas de mise à jour depuis 4h
      }
    ],
    
    entity_filters: {
      client_categories: ["VIP", "PREMIUM"],
      priority_levels: ["HIGH", "CRITICAL"]
    }
  },
  
  actions: [
    {
      action_type: "send_notification",
      action_config: {
        type: "notification",
        notification: {
          channels: ["email", "sms"],
          template_id: "TEMPLATE_DELAY_CRITICAL",
          recipients: ["client_contact", "account_manager"],
          delay_seconds: 0,
          max_repeats: 1
        }
      }
    },
    {
      action_type: "create_alert",
      action_config: {
        type: "alert",
        alert: {
          priority: "high",
          title: "Retard critique nécessitant action",
          description: "Conteneur en retard > 2 jours, client VIP impacté",
          auto_acknowledge: false
        }
      },
      delay_minutes: 15 // Créer alerte 15 min après notification
    }
  ],
  
  is_active: true,
  priority: 100,
  execution_mode: "immediate",
  
  error_handling: {
    continue_on_error: true,
    retry_attempts: 2,
    escalate_on_failure: true,
    escalation_recipients: ["ops-manager@company.com"]
  },
  
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z",
  created_by: "admin_rules",
  last_executed: "2025-01-13T09:45:00Z",
  execution_count: 47,
  success_rate: 95.7
};
```

## 📊 Dashboards et analytics

### Dashboard manager avec KPIs

```typescript
import type { ManagerDashboardView } from '@/types/containers';

// Vue dashboard pour responsable logistique
const managerDashboard: ManagerDashboardView = {
  executive_summary: {
    total_active_containers: 1247,
    on_time_performance: 87.3, // %
    cost_variance_percentage: -4.2, // Sous budget
    customer_satisfaction_score: 4.1, // /5
    revenue_at_risk: 45000 // EUR
  },
  
  team_performance: [
    {
      team_name: "Équipe Import Europe",
      containers_managed: 423,
      on_time_rate: 91.2,
      avg_resolution_time_hours: 2.3,
      customer_feedback_score: 4.3
    },
    {
      team_name: "Équipe Import Asie",
      containers_managed: 624,
      on_time_rate: 84.1,
      avg_resolution_time_hours: 3.1,
      customer_feedback_score: 3.9
    }
  ],
  
  client_performance: [
    {
      client_name: "Logistics Pro SARL",
      containers_count: 89,
      on_time_rate: 94.4,
      total_value: 234000,
      satisfaction_score: 4.6,
      risk_level: "low"
    },
    {
      client_name: "Import Express SA", 
      containers_count: 156,
      on_time_rate: 76.3,
      total_value: 445000,
      satisfaction_score: 3.2,
      risk_level: "high"
    }
  ],
  
  escalation_required: [
    {
      alert_type: "Retards répétés compagnie maritime",
      container_count: 23,
      max_delay_days: 8,
      estimated_impact: 15000,
      recommended_action: "Négociation SLA avec Pacific Maritime"
    }
  ],
  
  forecasts: {
    expected_arrivals_next_7_days: 198,
    expected_delays_next_7_days: 31,
    capacity_utilization_forecast: 78.5,
    resource_requirements_forecast: [
      "2 agents supplémentaires pour pics import",
      "Extension heures bureau service client"
    ]
  }
};
```

### Recherche avancée multi-critères

```typescript
import type { AdvancedContainerSearchParams } from '@/types/containers';

// Recherche complexe : conteneurs VIP en retard avec impact business
const advancedSearch: AdvancedContainerSearchParams = {
  search_query: {
    text: "URGENT PRIORITY",
    fields: ["container_number", "bl_number", "notes"],
    operators: ["OR"],
    fuzzy_matching: true
  },
  
  date_filters: {
    eta_range: {
      from: "2025-01-10T00:00:00Z",
      to: "2025-01-20T23:59:59Z"
    },
    arriving_in_days: 5,
    delayed_by_days: 2
  },
  
  status_filters: {
    arrival_statuses: ["delayed", "port_delay", "customs_delay"],
    urgency_levels: ["high", "critical"],
    health_statuses: ["at_risk", "problematic"],
    has_delays: true,
    missing_eta: false,
    requires_attention: true,
    client_vip: true
  },
  
  logistics_filters: {
    origin_ports: ["CNSHA", "CNSHG"], // Shanghai
    destination_ports: ["FRLEH", "FRBOT"], // Le Havre, Bordeaux
    shipping_companies: ["MAERSK", "MSC", "CMA_CGM"],
    container_types: ["20GP", "40HC"]
  },
  
  business_filters: {
    client_categories: ["VIP", "PREMIUM"],
    value_ranges: [
      { min: 50000, max: 999999, currency: "EUR" }
    ],
    priority_levels: ["HIGH", "CRITICAL"],
    service_types: ["EXPRESS", "TIME_CRITICAL"]
  },
  
  metrics_filters: {
    delay_severity: ["major", "critical"],
    performance_score_min: 70,
    cost_impact_min: 5000,
    client_satisfaction_min: 3.5
  },
  
  search_options: {
    include_archived: false,
    include_cancelled: false,
    exact_match_only: false,
    case_sensitive: false,
    include_soft_deleted: false
  },
  
  sorting: [
    { field: "delay_days", direction: "desc", priority: 1 },
    { field: "business_impact", direction: "desc", priority: 2 },
    { field: "eta", direction: "asc", priority: 3 }
  ],
  
  pagination: {
    page: 1,
    page_size: 25,
    max_results: 100
  },
  
  requested_aggregations: [
    "count_by_status",
    "avg_delay_by_company",
    "cost_by_client"
  ]
};
```

## 🔄 Opérations en lot

### Configuration d'opération batch

```typescript
import type { 
  BatchConfiguration,
  ExtendedBatchResult 
} from '@/types/containers';

// Configuration pour mise à jour en lot des ETA
const batchConfig: BatchConfiguration = {
  batch_id: "BATCH_ETA_UPDATE_20250113",
  batch_name: "Mise à jour ETA suite intégration Maersk",
  
  execution_config: {
    batch_size: 50, // 50 conteneurs par lot
    parallel_processing: true,
    max_concurrent_batches: 3,
    retry_failed_items: true,
    rollback_on_error: false
  },
  
  selection_criteria: {
    container_ids: [], // Tous les conteneurs Maersk
    status_filter: ["in_transit", "port_arrival"],
    date_range: {
      field: "eta",
      from: "2025-01-13T00:00:00Z", 
      to: "2025-01-20T23:59:59Z"
    },
    custom_filters: [
      {
        field: "shipping_company_name",
        operator: "equals",
        value: "Maersk Line"
      }
    ]
  },
  
  validation_rules: {
    validate_before_execution: true,
    dry_run_available: true,
    require_approval: true,
    approval_threshold: 100 // > 100 conteneurs impactés
  },
  
  monitoring: {
    notify_on_completion: true,
    notify_on_error: true,
    progress_reporting_interval: 30, // Toutes les 30 secondes
    recipients: ["ops-team@company.com", "integration-team@company.com"]
  }
};

// Résultat détaillé de l'opération batch
const batchResult: ExtendedBatchResult = {
  // Résultats de base héritée de BatchOperationResult
  operation_id: "OP_BATCH_20250113_140000",
  operation_type: "eta_bulk_update",
  total_items: 247,
  successful_items: 242,
  failed_items: 3,
  skipped_items: 2,
  
  item_results: [
    {
      container_id: "CONT_2025_001234",
      container_number: "MSCU1234567", 
      success: true,
      processing_time_ms: 1250
    },
    {
      container_id: "CONT_2025_005678",
      container_number: "TEMU9876543",
      success: false,
      error_code: "VALIDATION_ERROR",
      error_message: "ETA antérieure à la date actuelle",
      processing_time_ms: 850
    }
  ],
  
  execution_time_ms: 125000, // 2m 5s
  average_time_per_item: 506,
  peak_memory_usage: 128, // MB
  
  executed_at: "2025-01-13T14:00:00Z",
  executed_by: "integration_service",
  rollback_available: true,
  rollback_deadline: "2025-01-13T18:00:00Z",
  
  // Extensions spécifiques batch avancé
  batch_configuration: batchConfig,
  
  performance_metrics: {
    throughput_items_per_second: 1.97,
    average_latency_ms: 506,
    peak_concurrent_operations: 3,
    total_network_calls: 247,
    cache_hit_rate: 23.5
  },
  
  error_analysis: {
    error_categories: [
      {
        category: "validation_error",
        count: 2,
        percentage: 0.8,
        typical_cause: "Données incohérentes reçues de l'API"
      },
      {
        category: "timeout_error", 
        count: 1,
        percentage: 0.4,
        typical_cause: "Délai de réponse API dépassé"
      }
    ],
    retry_attempts_made: 3,
    items_resolved_on_retry: 0
  },
  
  business_impact: {
    containers_affected: 242,
    estimated_time_saved_hours: 12.1,
    estimated_cost_impact: -2400, // Économies
    sla_compliance_rate: 98.8
  },
  
  optimization_suggestions: [
    {
      suggestion: "Augmenter la taille des lots à 75 pour améliorer le débit",
      category: "performance",
      estimated_improvement: "+15% throughput",
      implementation_effort: "low"
    },
    {
      suggestion: "Implémenter cache Redis pour réduire les appels API",
      category: "cost",
      estimated_improvement: "30% réduction appels API",
      implementation_effort: "medium" 
    }
  ]
};
```

## 💡 Cas d'usage avancés

### Workflow complet : De l'embarquement à la livraison

```typescript
import type {
  ContainerArrivalTracking,
  ContainerArrivalHistory,
  WorkflowActionResult
} from '@/types/containers';

// 1. Conteneur embarqué à Shanghai
const initialTracking: ContainerArrivalTracking = {
  container_id: "CONT_2025_DEMO",
  container_number: "DEMO1234567",
  bl_id: "BL_2025_DEMO", 
  bl_number: "DEMO2025001",
  
  shipping_company_id: "COMP_MAERSK",
  shipping_company_name: "Maersk Line",
  shipping_company_short: "MAERSK",
  
  port_of_discharge: "FRLEH",
  arrival_location: "Terminal Atlantique",
  current_location: "En mer - Route Europe",
  
  estimated_arrival_date: "2025-01-20T06:00:00Z",
  original_eta: "2025-01-20T06:00:00Z",
  last_update_date: "2025-01-13T12:00:00Z",
  
  arrival_status: "in_transit",
  urgency_level: "normal", 
  health_status: "healthy",
  
  days_until_arrival: 7,
  
  last_notification_sent: "2025-01-13T12:00:00Z",
  notification_count: 1,
  client_informed: true,
  
  tracking_source: "shipping_company_api",
  confidence_level: "high"
};

// 2. Historique de changement - Retard météorologique
const delayHistory: ContainerArrivalHistory = {
  id: "HIST_DEMO_001",
  container_id: "CONT_2025_DEMO",
  
  previous_status: "in_transit",
  new_status: "delayed",
  
  previous_eta: "2025-01-20T06:00:00Z",
  new_eta: "2025-01-22T14:00:00Z",
  
  change_reason: "weather_conditions",
  change_description: "Tempête en Mer du Nord - déviation route vers port refuge",
  impact_assessment: "moderate",
  
  client_notified: true,
  notification_sent_at: "2025-01-15T10:30:00Z",
  
  updated_by: "captain_vessel_emma_maersk",
  update_source: "integration",
  data_quality_score: 95,
  
  created_at: "2025-01-15T10:15:00Z",
  external_reference: "WEATHER_ALERT_NS_20250115"
};

// 3. Action workflow - Transition vers arrivée port
const portArrivalAction: WorkflowActionResult = {
  action_id: "ACTION_PORT_ARRIVAL_DEMO",
  container_id: "CONT_2025_DEMO",
  action_type: "status_transition",
  
  success: true,
  
  status_changed: {
    from_status: "delayed",
    to_status: "port_arrival"
  },
  
  data_updated: [
    {
      field: "actual_arrival_date",
      old_value: null,
      new_value: "2025-01-22T15:30:00Z"
    },
    {
      field: "current_location", 
      old_value: "En mer - Route Europe",
      new_value: "Quai 12 - Terminal Atlantique Le Havre"
    }
  ],
  
  triggered_actions: [
    {
      action_type: "send_notification",
      status: "success",
      details: "Client notifié de l'arrivée effective"
    },
    {
      action_type: "create_alert",
      status: "success", 
      details: "Alerte douanes créée pour dédouanement"
    },
    {
      action_type: "trigger_workflow",
      status: "pending",
      details: "Workflow dédouanement initié"
    }
  ],
  
  executed_at: "2025-01-22T15:30:00Z",
  executed_by: "port_system_lehavre",
  execution_time_ms: 2340
};
```

Ce guide d'exemples illustre l'utilisation complète du système de types Containers, de la création initiale du tracking jusqu'aux opérations avancées en lot, en passant par la gestion des alertes, l'intégration avec les compagnies maritimes et l'automatisation des processus métier.

---

*Pour plus d'informations, consultez la [documentation principale](./README.md) et le [guide de migration](../MIGRATION_GUIDE.md).*