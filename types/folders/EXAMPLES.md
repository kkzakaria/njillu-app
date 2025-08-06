# 💡 Exemples Pratiques - Types Folders v2.0

Collection d'exemples pratiques d'utilisation de l'architecture modulaire des types folders.

## 🎯 Cas d'Usage Courants

### 1. 📁 Création d'un Nouveau Dossier

```typescript
import type {
  CreateFolderData,
  ClientInfo,
  FolderType,
  FolderPriority
} from '@/types/folders';

// Données client
const clientInfo: ClientInfo = {
  name: "Société d'Import SARL",
  company: "SOCIMP",
  email: "contact@socimp.com",
  phone: "+33 1 23 45 67 89",
  address: "123 Rue du Commerce",
  city: "Le Havre",
  country: "France",
  client_code: "SOCIMP001",
  account_manager: "Jean Dupont"
};

// Données de création du dossier
const createData: CreateFolderData = {
  folder_number: "F-2025-0001",
  reference_number: "REF-SOCIMP-001",
  internal_reference: "INT-001",
  type: "import" as FolderType,
  category: "commercial",
  priority: "normal" as FolderPriority,
  urgency: "standard",
  client_info: clientInfo,
  estimated_value: 50000,
  currency: "EUR",
  description: "Import de marchandises textiles",
  special_instructions: "Contrôle qualité requis à l'arrivée"
};

// Utilisation dans un service
async function createFolder(data: CreateFolderData) {
  // Validation et création
  return await folderService.create(data);
}
```

### 2. ⚙️ Gestion du Workflow d'Étapes

```typescript
import type {
  ProcessingStage,
  StageStatus,
  FolderProcessingStage,
  StartProcessingStageParams,
  CompleteProcessingStageParams,
  StageTransitionData
} from '@/types/folders';

// Démarrage d'une étape
const startStageParams: StartProcessingStageParams = {
  folder_id: "folder-123",
  stage: "elaboration_fdi" as ProcessingStage,
  assigned_to: "user-456",
  started_by: "supervisor-789",
  notes: "Dossier prioritaire - traitement urgent requis",
  estimated_completion_date: "2025-08-10T14:00:00Z",
  priority_override: "high"
};

// Completion d'une étape
const completeStageParams: CompleteProcessingStageParams = {
  folder_id: "folder-123",
  stage: "elaboration_fdi" as ProcessingStage,
  completed_by: "user-456",
  completion_notes: "FDI élaborée et validée",
  documents_attached: ["FDI-2025-001.pdf", "annexes-techniques.pdf"],
  quality_check_passed: true,
  client_notification_required: true
};

// Suivi des transitions
const transitionData: StageTransitionData = {
  folder_id: "folder-123",
  stage: "elaboration_fdi",
  from_status: "in_progress" as StageStatus,
  to_status: "completed" as StageStatus,
  initiated_by: "user-456",
  initiated_at: new Date().toISOString(),
  reason: "Étape terminée avec succès",
  validation_passed: true,
  affects_timeline: false,
  client_notification_sent: true,
  next_stage_auto_started: true
};

// Service de workflow
class FolderWorkflowService {
  async startStage(params: StartProcessingStageParams) {
    // Validation des prérequis
    // Assignation et démarrage
    // Notification des parties prenantes
  }

  async completeStage(params: CompleteProcessingStageParams) {
    // Validation des livrables
    // Mise à jour du statut
    // Déclenchement de l'étape suivante
  }
}
```

### 3. 🔍 Recherche Avancée de Dossiers

```typescript
import type {
  FolderSearchParams,
  FolderSearchResults,
  ProcessingStage,
  FolderStatus
} from '@/types/folders';

// Recherche complexe
const searchParams: FolderSearchParams = {
  // Critères de base
  statuses: ["processing", "completed"] as FolderStatus[],
  types: ["import", "export"],
  categories: ["commercial", "urgent"],
  priorities: ["high", "urgent"],
  
  // Critères temporels
  created_after: "2025-01-01",
  created_before: "2025-12-31",
  updated_after: "2025-08-01",
  
  // Critères client
  client_names: ["Société d'Import SARL", "Export Co."],
  client_codes: ["SOCIMP001", "EXPCO002"],
  account_managers: ["Jean Dupont", "Marie Martin"],
  
  // Critères financiers
  estimated_value_min: 10000,
  estimated_value_max: 100000,
  currency: "EUR",
  
  // Critères workflow
  processing_stages: ["elaboration_fdi", "declaration_douaniere"] as ProcessingStage[],
  has_overdue_stages: true,
  requires_attention: true,
  
  // Recherche textuelle
  search_query: "textile import urgent",
  search_fields: ["description", "special_instructions", "client_notes"],
  
  // Tri et pagination
  sort_by: "updated_at",
  sort_order: "desc",
  page: 1,
  page_size: 20
};

// Service de recherche
class FolderSearchService {
  async searchFolders(params: FolderSearchParams): Promise<FolderSearchResults> {
    // Construction de la requête
    // Exécution avec optimisations
    // Retour des résultats paginés
    return {
      folders: [], // Liste des dossiers trouvés
      total_count: 0,
      page: params.page || 1,
      page_size: params.page_size || 20,
      total_pages: 0,
      has_more: false,
      search_metadata: {
        query_time_ms: 45,
        total_scanned: 1500,
        filters_applied: 8
      }
    };
  }
}
```

### 4. 🚨 Système d'Alertes Modulaire v2.0

#### Architecture Modulaire - Imports Flexibles

```typescript
// Import global (recommandé pour usage général)
import type {
  FolderAlert,
  DeadlineAlert,
  ComplianceAlert,
  AlertRule,
  AlertDashboard,
  CreateAlertData,
  AlertType,
  AlertSeverity
} from '@/types/folders/alerts';

// Import modulaire granulaire (optimal pour performance)
import type { FolderAlert, BusinessImpact } from '@/types/folders/alerts/core';
import type { DeadlineAlert, ComplianceAlert } from '@/types/folders/alerts/specialized';
import type { AlertRule, TriggerConditions } from '@/types/folders/alerts/rules';
import type { AlertDashboard, AlertMetrics } from '@/types/folders/alerts/analytics';
import type { CreateAlertData, UpdateAlertData } from '@/types/folders/alerts/operations';
import type { AlertSystemConfig } from '@/types/folders/alerts/config';

// Import par namespace (pour organisation du code)
import * as Alerts from '@/types/folders/alerts';
import * as AlertCore from '@/types/folders/alerts/core';
import * as AlertRules from '@/types/folders/alerts/rules';

#### A. Core - Alerte de Base

```typescript
// Alerte de base (depuis alerts/core.ts)
const baseAlert: FolderAlert = {
  id: "alert-2025-001",
  folder_id: "folder-123",
  type: "deadline",
  severity: "high",
  status: "active",
  title: "Échéance douanière approche",
  message: "La déclaration douanière doit être soumise avant le 15/08/2025",
  description: "Dossier F-2025-0001 - Risque de pénalités si retard",
  
  // Impact business (type strict)
  business_impact: "high" as BusinessImpact,
  
  // Entités affectées
  affected_entities: [
    {
      entity_type: "document",
      entity_id: "declaration-douaniere-123",
      entity_reference: "DEC-2025-001"
    }
  ],
  
  // Timing
  triggered_at: "2025-08-06T10:00:00Z",
  due_date: "2025-08-15T23:59:59Z",
  sla_deadline: "2025-08-14T18:00:00Z",
  
  // Assignation
  assigned_to: "customs-team",
  team_responsible: "operations",
  
  // Actions recommandées
  recommended_actions: [
    {
      action_type: "urgent_processing",
      description: "Prioriser le traitement de la déclaration",
      priority: "high",
      estimated_effort: "2 heures"
    }
  ],
  
  // Notifications
  notification_sent: true,
  notification_methods: ["email", "push"],
  notification_recipients: ["customs@company.com"],
  
  // Métadonnées
  created_at: "2025-08-06T10:00:00Z",
  updated_at: "2025-08-06T10:00:00Z"
};
```

#### B. Specialized - Alertes Spécialisées par Domaine

```typescript
// 1. Alerte d'échéance (depuis alerts/specialized.ts)
const deadlineAlert: DeadlineAlert = {
  ...baseAlert, // Hérite de FolderAlert
  type: "deadline", // Type discriminé
  
  // Propriétés spécialisées pour les échéances
  deadline_type: "customs",
  original_deadline: "2025-08-15T23:59:59Z",
  current_deadline: "2025-08-15T23:59:59Z",
  days_remaining: 9,
  is_overdue: false,
  grace_period_days: 2
};

// 2. Alerte de conformité (depuis alerts/specialized.ts)  
const complianceAlert: ComplianceAlert = {
  ...baseAlert,
  type: "compliance_issue",
  
  // Propriétés spécialisées pour la conformité
  compliance_area: "customs",
  regulation_reference: "Art. 182 Code des douanes",
  violation_details: "Déclaration incomplète - documents manquants",
  corrective_actions_required: [
    "Fournir certificat d'origine",
    "Compléter valorisation détaillée"
  ],
  regulatory_deadline: "2025-08-20T23:59:59Z",
  potential_penalties: [
    {
      type: "fine",
      amount: 5000,
      currency: "EUR",
      description: "Pénalité pour déclaration tardive"
    }
  ]
};

// 3. Alerte de retard (depuis alerts/specialized.ts)
const delayAlert: DelayAlert = {
  ...baseAlert,
  type: "delay",
  
  // Propriétés spécialisées pour les retards
  delay_type: "processing",
  original_schedule: "2025-08-10T14:00:00Z",
  current_estimate: "2025-08-12T16:00:00Z",
  delay_duration_hours: 50,
  impact_assessment: "moderate",
  downstream_impacts: [
    {
      affected_process: "livraison_client",
      estimated_delay: "48 heures",
      mitigation_possible: true
    }
  ]
};

// 4. Alerte de coût (depuis alerts/specialized.ts)
const costAlert: CostAlert = {
  ...baseAlert,
  type: "cost_overrun",
  
  // Propriétés spécialisées pour les coûts
  budget_category: "customs",
  original_budget: 2000,
  current_cost: 2750,
  projected_final_cost: 3200,
  overrun_amount: 1200,
  overrun_percentage: 60,
  currency: "EUR",
  
  // Analyse des causes
  cost_drivers: [
    {
      category: "penalties",
      description: "Pénalités douanières tardives",
      amount: 800,
      is_avoidable: true
    },
    {
      category: "additional_inspections", 
      description: "Inspections supplémentaires requises",
      amount: 400,
      is_avoidable: false
    }
  ]
};
```

#### C. Operations - CRUD et Recherche

```typescript
// Création d'alerte (depuis alerts/operations.ts)
const createAlertData: CreateAlertData = {
  folder_id: "folder-123",
  type: "deadline",
  severity: "high",
  title: "Échéance douanière approche",
  message: "Action requise avant le 15/08/2025",
  business_impact: "high",
  due_date: "2025-08-15T23:59:59Z",
  assigned_to: "customs-team",
  recommended_actions: [
    {
      action_type: "urgent_processing",
      description: "Traitement prioritaire",
      priority: "high"
    }
  ]
};

// Mise à jour d'alerte (depuis alerts/operations.ts)
const updateAlertData: UpdateAlertData = {
  status: "in_progress",
  assigned_to: "user-456",
  resolution_notes: "Prise en charge par l'équipe douanes",
  recommended_actions: [
    {
      action_type: "document_review",
      description: "Révision des documents techniques",
      priority: "medium"
    }
  ]
};

// Recherche avancée d'alertes (depuis alerts/operations.ts)
const searchParams: AlertSearchParams = {
  folder_ids: ["folder-123", "folder-456"],
  types: ["deadline", "compliance_issue"],
  severities: ["high", "critical"],
  statuses: ["active", "in_progress"],
  assigned_to: ["customs-team"],
  created_from: "2025-08-01",
  created_to: "2025-08-31",
  business_impact: ["high", "critical"],
  
  // Tri et pagination
  sort_by: "created_at",
  sort_order: "desc",
  page: 1,
  page_size: 20
};
```

#### D. Rules - Système de Règles Automatiques

```typescript
// Configuration d'une règle d'alerte automatique (depuis alerts/rules.ts)
const alertRule: AlertRule = {
  id: "rule-deadline-warning",
  name: "Alerte échéance déclaration douanière", 
  description: "Alerte automatique 48h avant l'échéance de déclaration",
  
  // Conditions de déclenchement (type strict)
  trigger_conditions: {
    folder_status: ["processing"],
    processing_stage: ["declaration_douaniere"],
    alert_type: "deadline",
    severity_threshold: "medium",
    
    // Conditions temporelles
    time_based_triggers: [
      {
        condition: "days_before_deadline",
        threshold: 2,
        comparison: "less_than"
      },
      {
        condition: "hours_without_update", 
        threshold: 24,
        comparison: "greater_than"
      }
    ],
    
    // Conditions sur les données
    data_conditions: [
      {
        field_path: "folder.estimated_value",
        operator: "greater",
        value: 10000
      },
      {
        field_path: "folder.urgency",
        operator: "equals",
        value: "urgent"
      }
    ]
  },
  
  // Configuration de l'alerte générée
  alert_config: {
    title_template: "Échéance {stage} dans {days_remaining} jours",
    message_template: "Le dossier {folder_number} nécessite une action urgente - Valeur: {estimated_value}€",
    severity: "high",
    business_impact: "high",
    auto_assign_to: "lead-customs-officer",
    auto_assign_team: "customs-team",
    sla_hours: 24
  },
  
  // Configuration des notifications
  notification_config: {
    methods: ["email", "push", "webhook"],
    recipients: ["customs@company.com", "supervisor@company.com"],
    escalation_rules: [
      {
        delay_hours: 12,
        escalate_to: ["manager@company.com"],
        increase_severity: true
      },
      {
        delay_hours: 24,
        escalate_to: ["director@company.com"],
        increase_severity: true
      }
    ]
  },
  
  // Métadonnées de la règle
  is_active: true,
  priority: 1,
  created_at: "2025-08-06T10:00:00Z",
  updated_at: "2025-08-06T10:00:00Z",
  created_by: "admin-user"
};

// Condition de déclenchement complexe (depuis alerts/rules.ts)
const complexTriggerConditions: TriggerConditions = {
  folder_status: ["processing", "on_hold"],
  processing_stage: ["elaboration_fdi", "elaboration_rfcv"],
  alert_type: "delay",
  
  // Conditions multiples avec logique ET
  time_based_triggers: [
    {
      condition: "days_after_creation",
      threshold: 5,
      comparison: "greater_than"
    },
    {
      condition: "hours_without_update",
      threshold: 48,
      comparison: "greater_than"
    }
  ],
  
  // Conditions sur données métier
  data_conditions: [
    {
      field_path: "folder.client_info.client_type",
      operator: "equals",
      value: "vip"
    },
    {
      field_path: "folder.priority",
      operator: "not_equals", 
      value: "low"
    },
    {
      field_path: "workflow.overdue_stages_count",
      operator: "greater",
      value: 0
    }
  ]
};
```

#### E. Analytics - Dashboard et Métriques

```typescript
// Dashboard des alertes (depuis alerts/analytics.ts)
const alertDashboard: AlertDashboard = {
  // Compteurs globaux
  total_active_alerts: 42,
  critical_alerts: 8,
  overdue_alerts: 12,
  unassigned_alerts: 5,
  
  // Répartition par type
  alerts_by_type: {
    deadline: 18,
    delay: 12,
    compliance_issue: 8,
    cost_overrun: 4,
    quality_issue: 0,
    system_error: 0
  },
  
  // Répartition par sévérité
  alerts_by_severity: {
    critical: 8,
    high: 16,
    medium: 14,
    low: 4
  },
  
  // Tendances temporelles
  new_alerts_today: 7,
  resolved_alerts_today: 9,
  average_resolution_time_hours: 18.5,
  
  // Top dossiers avec alertes
  folders_with_most_alerts: [
    {
      folder_id: "folder-123",
      folder_number: "F-2025-0001",
      alert_count: 5,
      highest_severity: "critical"
    },
    {
      folder_id: "folder-456", 
      folder_number: "F-2025-0002",
      alert_count: 3,
      highest_severity: "high"
    }
  ],
  
  // Performance du système
  alert_resolution_rate: 85.5,
  sla_compliance_rate: 92.3,
  average_first_response_time_hours: 2.1,
  
  generated_at: "2025-08-06T15:30:00Z"
};

// Métriques de performance détaillées (depuis alerts/analytics.ts)
const alertMetrics: AlertMetrics = {
  period_start: "2025-08-01T00:00:00Z",
  period_end: "2025-08-06T23:59:59Z",
  
  // Volumes
  total_alerts_generated: 156,
  total_alerts_resolved: 133,
  alerts_auto_resolved: 28,
  alerts_escalated: 12,
  
  // Temps de traitement
  average_detection_time_minutes: 8.5,
  average_response_time_hours: 2.1,
  average_resolution_time_hours: 18.5,
  
  // Efficacité du système
  false_positive_rate: 0.05, // 5%
  duplicate_alert_rate: 0.03, // 3%
  alert_recurrence_rate: 0.12, // 12%
  
  // Impact business
  business_impact_prevented: 125000, // Valeur en euros
  cost_of_downtime_avoided: 45000,
  
  // Performance par type d'alerte
  performance_by_type: {
    deadline: {
      count: 68,
      avg_resolution_time_hours: 16.2,
      resolution_rate: 0.92
    },
    delay: {
      count: 42,
      avg_resolution_time_hours: 22.8,
      resolution_rate: 0.88
    },
    compliance_issue: {
      count: 28,
      avg_resolution_time_hours: 31.5,
      resolution_rate: 0.82
    },
    cost_overrun: {
      count: 18,
      avg_resolution_time_hours: 45.2,
      resolution_rate: 0.78
    }
  },
  
  calculated_at: "2025-08-06T15:30:00Z"
};
```

#### F. Config - Configuration Système

```typescript
// Configuration globale du système (depuis alerts/config.ts)
const systemConfig: AlertSystemConfig = {
  // Paramètres généraux
  enabled: true,
  evaluation_interval_minutes: 5,
  max_alerts_per_folder: 10,
  auto_resolve_after_days: 30,
  
  // Paramètres de notification
  notification_batch_size: 50,
  notification_rate_limit: 100, // par minute
  notification_retry_attempts: 3,
  
  // Paramètres d'escalade
  default_escalation_delay_hours: 24,
  max_escalation_levels: 3,
  weekend_escalation_enabled: false,
  
  // Paramètres de performance
  alert_retention_days: 365,
  enable_alert_aggregation: true,
  duplicate_suppression_window_minutes: 30,
  
  // Configuration par environnement
  environment: "production",
  debug_mode: false,
  
  updated_at: "2025-08-06T10:00:00Z",
  updated_by: "system-admin"
};
```

#### G. Services Modulaires - Architecture de Service

```typescript
// Service principal avec architecture modulaire
export class ModularAlertService {
  constructor(
    private readonly coreService: AlertCoreService,
    private readonly specializedService: AlertSpecializedService,
    private readonly rulesService: AlertRulesService,
    private readonly analyticsService: AlertAnalyticsService,
    private readonly operationsService: AlertOperationsService,
    private readonly configService: AlertConfigService
  ) {}

  // Méthode principale utilisant tous les modules
  async processAlertWorkflow(folderId: string): Promise<void> {
    // 1. Vérifier les règles (Rules)
    const triggeredRules = await this.rulesService.checkTriggers(folderId);
    
    // 2. Créer les alertes appropriées (Core + Specialized)
    for (const rule of triggeredRules) {
      const alertData = await this.coreService.prepareAlertData(rule, folderId);
      
      if (rule.alert_config.requires_specialization) {
        // Utiliser les alertes spécialisées
        await this.specializedService.createSpecializedAlert(alertData);
      } else {
        // Utiliser les alertes de base
        await this.coreService.createBaseAlert(alertData);
      }
    }
    
    // 3. Mettre à jour les métriques (Analytics)
    await this.analyticsService.updateMetrics(folderId);
  }
}

// Service Core - Gestion des alertes de base
export class AlertCoreService {
  async createBaseAlert(data: CreateAlertData): Promise<FolderAlert> {
    // Validation des données core
    const validatedData = this.validateCoreData(data);
    
    // Création de l'alerte de base
    const alert: FolderAlert = {
      id: generateId(),
      ...validatedData,
      triggered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return await this.repository.create(alert);
  }
  
  private validateCoreData(data: CreateAlertData): CreateAlertData {
    // Validation des champs obligatoires
    if (!data.folder_id || !data.type || !data.severity) {
      throw new ValidationError("Champs obligatoires manquants");
    }
    
    // Validation business impact
    const validImpacts: BusinessImpact[] = ["low", "medium", "high", "critical"];
    if (!validImpacts.includes(data.business_impact)) {
      throw new ValidationError("Impact business invalide");
    }
    
    return data;
  }
}

// Service Specialized - Gestion des alertes spécialisées  
export class AlertSpecializedService {
  async createDeadlineAlert(data: CreateAlertData): Promise<DeadlineAlert> {
    const baseAlert = await this.coreService.createBaseAlert(data);
    
    // Extensions spécifiques aux échéances
    const deadlineAlert: DeadlineAlert = {
      ...baseAlert,
      type: "deadline",
      deadline_type: this.determineDeadlineType(data),
      original_deadline: data.due_date!,
      current_deadline: data.due_date!,
      days_remaining: this.calculateDaysRemaining(data.due_date!),
      is_overdue: new Date() > new Date(data.due_date!),
      grace_period_days: 2
    };
    
    return await this.repository.update(baseAlert.id, deadlineAlert);
  }
  
  async createComplianceAlert(data: CreateAlertData): Promise<ComplianceAlert> {
    const baseAlert = await this.coreService.createBaseAlert(data);
    
    // Extensions spécifiques à la conformité
    const complianceAlert: ComplianceAlert = {
      ...baseAlert,
      type: "compliance_issue",
      compliance_area: "customs",
      violation_details: data.message,
      corrective_actions_required: this.generateCorrectiveActions(data),
      potential_penalties: this.assessPotentialPenalties(data)
    };
    
    return await this.repository.update(baseAlert.id, complianceAlert);
  }
}

// Service Rules - Moteur de règles
export class AlertRulesService {
  async checkTriggers(folderId: string): Promise<AlertRule[]> {
    const folder = await this.folderRepository.findById(folderId);
    const activeRules = await this.rulesRepository.findActive();
    
    const triggeredRules: AlertRule[] = [];
    
    for (const rule of activeRules) {
      if (await this.evaluateRule(rule, folder)) {
        triggeredRules.push(rule);
      }
    }
    
    return triggeredRules;
  }
  
  private async evaluateRule(rule: AlertRule, folder: Folder): Promise<boolean> {
    // Évaluation des conditions temporelles
    const timeConditionsMet = rule.trigger_conditions.time_based_triggers?.every(
      trigger => this.evaluateTimeCondition(trigger, folder)
    ) ?? true;
    
    // Évaluation des conditions sur les données
    const dataConditionsMet = rule.trigger_conditions.data_conditions?.every(
      condition => this.evaluateDataCondition(condition, folder)
    ) ?? true;
    
    // Évaluation des conditions de base
    const baseConditionsMet = this.evaluateBaseConditions(rule.trigger_conditions, folder);
    
    return timeConditionsMet && dataConditionsMet && baseConditionsMet;
  }
}

// Service Analytics - Dashboard et métriques
export class AlertAnalyticsService {
  async generateDashboard(): Promise<AlertDashboard> {
    // Collecte des données depuis tous les modules
    const activeAlerts = await this.operationsService.search({ statuses: ["active"] });
    const todayMetrics = await this.calculateTodayMetrics();
    const performanceMetrics = await this.calculatePerformanceMetrics();
    
    return {
      total_active_alerts: activeAlerts.total_count,
      critical_alerts: activeAlerts.results.filter(a => a.severity === "critical").length,
      overdue_alerts: activeAlerts.results.filter(a => this.isOverdue(a)).length,
      unassigned_alerts: activeAlerts.results.filter(a => !a.assigned_to).length,
      
      alerts_by_type: this.groupByType(activeAlerts.results),
      alerts_by_severity: this.groupBySeverity(activeAlerts.results),
      
      ...todayMetrics,
      ...performanceMetrics,
      
      generated_at: new Date().toISOString()
    };
  }
  
  async calculateMetrics(period: { start: string; end: string }): Promise<AlertMetrics> {
    // Calcul des métriques détaillées par période
    const allAlerts = await this.operationsService.search({
      created_from: period.start,
      created_to: period.end
    });
    
    return {
      period_start: period.start,
      period_end: period.end,
      
      total_alerts_generated: allAlerts.total_count,
      total_alerts_resolved: allAlerts.results.filter(a => a.status === "resolved").length,
      alerts_auto_resolved: allAlerts.results.filter(a => a.resolution_method === "automatic").length,
      alerts_escalated: allAlerts.results.filter(a => this.wasEscalated(a)).length,
      
      // Calculs de temps moyens
      average_detection_time_minutes: this.calculateAverageDetectionTime(allAlerts.results),
      average_response_time_hours: this.calculateAverageResponseTime(allAlerts.results),
      average_resolution_time_hours: this.calculateAverageResolutionTime(allAlerts.results),
      
      // Efficacité
      false_positive_rate: this.calculateFalsePositiveRate(allAlerts.results),
      duplicate_alert_rate: this.calculateDuplicateRate(allAlerts.results),
      alert_recurrence_rate: this.calculateRecurrenceRate(allAlerts.results),
      
      // Impact business
      business_impact_prevented: this.calculateBusinessImpactPrevented(allAlerts.results),
      cost_of_downtime_avoided: this.calculateDowntimeCostAvoided(allAlerts.results),
      
      // Performance par type
      performance_by_type: this.calculatePerformanceByType(allAlerts.results),
      
      calculated_at: new Date().toISOString()
    };
  }
}
```

### 5. 📊 Opérations en Lot

```typescript
import type {
  FolderBatchOperation,
  BatchOperationType,
  BulkUpdateData,
  StatusChangeData,
  FolderBatchOperationResult
} from '@/types/folders';

// Mise à jour en lot des priorités
const bulkUpdateData: BulkUpdateData = {
  folder_ids: ["folder-123", "folder-456", "folder-789"],
  updates: {
    priority: "urgent",
    urgency: "critical",
    account_manager: "emergency-team"
  },
  reason: "Situation d'urgence - priorisation client VIP",
  notify_stakeholders: true
};

// Changement de statut en lot
const statusChangeData: StatusChangeData = {
  folder_ids: ["folder-100", "folder-101", "folder-102"],
  new_status: "on_hold",
  reason: "Attente documents client",
  expected_resolution_date: "2025-08-20",
  notify_clients: true
};

// Opération batch complète
const batchOperation: FolderBatchOperation = {
  id: "batch-2025-08-06-001",
  operation_type: "bulk_update" as BatchOperationType,
  folder_ids: ["folder-123", "folder-456", "folder-789"],
  operation_data: bulkUpdateData,
  
  execution_options: {
    validate_before_execution: true,
    stop_on_first_error: false,
    max_concurrent_operations: 5,
    timeout_seconds: 300,
    dry_run: false
  },
  
  created_by: "admin-user",
  created_at: new Date().toISOString()
};

// Service d'opérations batch
class FolderBatchService {
  async executeBatch(operation: FolderBatchOperation): Promise<FolderBatchOperationResult> {
    return {
      operation_id: operation.id,
      status: "completed",
      
      progress: {
        total_items: operation.folder_ids.length,
        processed_items: operation.folder_ids.length,
        successful_items: operation.folder_ids.length - 1,
        failed_items: 1,
        progress_percentage: 100,
        estimated_remaining_time: 0
      },
      
      results: [
        {
          folder_id: "folder-123",
          success: true,
          message: "Mise à jour réussie"
        },
        {
          folder_id: "folder-456", 
          success: true,
          message: "Mise à jour réussie"
        },
        {
          folder_id: "folder-789",
          success: false,
          error_code: "FOLDER_LOCKED",
          error_message: "Dossier verrouillé par un autre utilisateur"
        }
      ],
      
      execution_summary: {
        started_at: "2025-08-06T10:00:00Z",
        completed_at: "2025-08-06T10:02:30Z",
        total_duration_seconds: 150
      }
    };
  }
}
```

## 🎨 Patterns d'Import Avancés

### Import Sélectif par Domaine

```typescript
// Pour le développement workflow
import type * as Workflow from '@/types/folders/workflow';

function processStage(stage: Workflow.ProcessingStage) {
  const params: Workflow.StartProcessingStageParams = {
    folder_id: "123",
    stage,
    started_by: "user"
  };
  
  // Utilisation avec namespace clair
}

// Pour les opérations CRUD
import type * as Operations from '@/types/folders/operations';

function searchFolders(params: Operations.FolderSearchParams) {
  // Recherche avec types spécialisés
}

// Pour les entités métier
import type * as Entities from '@/types/folders/entities';

function validateClient(client: Entities.ClientInfo): boolean {
  // Validation métier
  return true;
}

// Pour les alertes modulaires (NOUVEAU v2.0)
import type * as Alerts from '@/types/folders/alerts';
import type * as AlertCore from '@/types/folders/alerts/core';
import type * as AlertSpecialized from '@/types/folders/alerts/specialized';
import type * as AlertRules from '@/types/folders/alerts/rules';
import type * as AlertAnalytics from '@/types/folders/alerts/analytics';

function processAlerts() {
  // Core - Alertes de base
  const baseAlert: AlertCore.FolderAlert = {
    id: "alert-1",
    folder_id: "folder-1",
    type: "deadline",
    severity: "high",
    // ... autres propriétés core
  } as AlertCore.FolderAlert;
  
  // Specialized - Alertes spécialisées
  const deadlineAlert: AlertSpecialized.DeadlineAlert = {
    ...baseAlert,
    deadline_type: "customs",
    days_remaining: 2,
    is_overdue: false
  };
  
  // Rules - Règles de déclenchement
  const rule: AlertRules.AlertRule = {
    id: "rule-1",
    name: "Échéance douanière",
    trigger_conditions: {
      alert_type: "deadline",
      time_based_triggers: [{
        condition: "days_before_deadline",
        threshold: 2,
        comparison: "less_than"
      }]
    },
    // ... configuration complète
  } as AlertRules.AlertRule;
  
  // Analytics - Métriques et dashboard  
  const dashboard: AlertAnalytics.AlertDashboard = {
    total_active_alerts: 10,
    critical_alerts: 2,
    // ... métriques complètes
  } as AlertAnalytics.AlertDashboard;
}
```

### Import Conditionnel selon Contexte

```typescript
// Import global pour utilisation générale
import type { Folder, ProcessingStage } from '@/types/folders';

// Import spécialisé pour logique complexe
import type { 
  StageTransitionRules, 
  TransitionValidation 
} from '@/types/folders/workflow/transitions';

// Import d'entités pour validation
import type { AuditMetadata } from '@/types/folders/entities/audit';

// Import d'alertes selon le contexte (NOUVEAU v2.0)
import type { FolderAlert } from '@/types/folders/alerts'; // Global

// Import granulaire pour performance critique
import type { DeadlineAlert } from '@/types/folders/alerts/specialized';
import type { AlertRule } from '@/types/folders/alerts/rules';
import type { CreateAlertData } from '@/types/folders/alerts/operations';

class FolderManager {
  // Méthodes utilisant imports spécialisés
  async validateTransition(
    transition: StageTransitionRules
  ): Promise<TransitionValidation> {
    // Logique complexe avec types précis
    return {
      is_valid: true,
      can_proceed: true,
      errors: [],
      warnings: [],
      requirements: [],
      impact_assessment: {
        affects_timeline: false,
        affects_cost: false,
        requires_client_notification: false
      }
    };
  }
  
  // NOUVEAU - Méthodes utilisant l'architecture modulaire d'alertes
  async processDeadlineAlerts(folderId: string): Promise<void> {
    // Import granulaire pour optimisation de performance
    const deadlineAlerts = await this.getDeadlineAlerts(folderId);
    
    for (const alert of deadlineAlerts) {
      // Type strict avec propriétés spécialisées
      if (alert.days_remaining <= 1 && !alert.is_overdue) {
        await this.escalateDeadlineAlert(alert);
      }
    }
  }
  
  private async getDeadlineAlerts(folderId: string): Promise<DeadlineAlert[]> {
    // Utilisation du type spécialisé
    const searchParams: CreateAlertData = {
      folder_id: folderId,
      type: "deadline",
      severity: "high",
      title: "Recherche alertes échéances",
      message: "Recherche des alertes d'échéance",
      business_impact: "high"
    };
    
    // Logique de recherche spécialisée
    return [];
  }
}

// Classe spécialisée utilisant l'architecture modulaire complète
class ModularAlertManager {
  // Import conditionnel basé sur les fonctionnalités utilisées
  async manageAlertsByContext(context: 'core' | 'specialized' | 'rules' | 'analytics') {
    switch (context) {
      case 'core':
        // Import : @/types/folders/alerts/core
        const { FolderAlert, BusinessImpact } = await import('@/types/folders/alerts/core');
        // Logique core
        break;
        
      case 'specialized':
        // Import : @/types/folders/alerts/specialized  
        const { DeadlineAlert, ComplianceAlert } = await import('@/types/folders/alerts/specialized');
        // Logique spécialisée
        break;
        
      case 'rules':
        // Import : @/types/folders/alerts/rules
        const { AlertRule, TriggerConditions } = await import('@/types/folders/alerts/rules');
        // Logique de règles
        break;
        
      case 'analytics':
        // Import : @/types/folders/alerts/analytics
        const { AlertDashboard, AlertMetrics } = await import('@/types/folders/alerts/analytics');
        // Logique d'analytics
        break;
    }
  }
}
```

## 🔧 Intégration avec Services

### Service Layer Pattern

```typescript
import type {
  Folder,
  CreateFolderData,
  UpdateFolderData,
  FolderSearchParams,
  ProcessingStage,
  StartProcessingStageParams
} from '@/types/folders';

// Service principal de gestion des dossiers
export class FolderService {
  constructor(
    private readonly repository: FolderRepository,
    private readonly workflowService: WorkflowService,
    private readonly alertService: AlertService
  ) {}

  async createFolder(data: CreateFolderData): Promise<Folder> {
    // 1. Validation des données
    const validation = await this.validateCreateData(data);
    if (!validation.is_valid) {
      throw new ValidationError(validation.errors);
    }

    // 2. Création du dossier
    const folder = await this.repository.create(data);

    // 3. Initialisation du workflow
    await this.workflowService.initializeStages(folder.id);

    // 4. Déclenchement d'alertes si nécessaire
    await this.alertService.checkTriggers(folder);

    return folder;
  }

  async updateFolder(id: string, data: UpdateFolderData): Promise<Folder> {
    // Mise à jour avec gestion des transitions
    const currentFolder = await this.repository.findById(id);
    const updatedFolder = await this.repository.update(id, data);
    
    // Gestion des changements de statut
    if (currentFolder.status !== updatedFolder.status) {
      await this.workflowService.handleStatusChange(
        id,
        currentFolder.status,
        updatedFolder.status
      );
    }

    return updatedFolder;
  }

  async searchFolders(params: FolderSearchParams) {
    return await this.repository.search(params);
  }
}

// Service spécialisé pour le workflow
export class WorkflowService {
  async startStage(params: StartProcessingStageParams): Promise<void> {
    // Logique de démarrage d'étape
    const stage = await this.validateStageStart(params);
    await this.assignStage(params);
    await this.notifyStakeholders(params);
  }

  private async validateStageStart(params: StartProcessingStageParams): Promise<boolean> {
    // Validation des prérequis
    return true;
  }
}
```

### Repository Pattern avec Types

```typescript
import type {
  Folder,
  FolderSearchParams,
  FolderSearchResults,
  CreateFolderData,
  UpdateFolderData
} from '@/types/folders';

export interface FolderRepository {
  findById(id: string): Promise<Folder | null>;
  findByNumber(folderNumber: string): Promise<Folder | null>;
  create(data: CreateFolderData): Promise<Folder>;
  update(id: string, data: UpdateFolderData): Promise<Folder>;
  delete(id: string): Promise<void>;
  search(params: FolderSearchParams): Promise<FolderSearchResults>;
  findByClientCode(clientCode: string): Promise<Folder[]>;
}

// Implémentation avec Prisma
export class PrismaFolderRepository implements FolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Folder | null> {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        processing_stages: true,
        alerts: true,
        documents: true
      }
    });

    return folder ? this.mapToFolder(folder) : null;
  }

  private mapToFolder(prismaFolder: any): Folder {
    // Mapping des données Prisma vers types TypeScript
    return {
      id: prismaFolder.id,
      folder_number: prismaFolder.folder_number,
      // ... autres mappings
    } as Folder;
  }
}
```

---

Ces exemples montrent l'utilisation pratique de l'architecture v2.0 dans des scénarios réels de développement. L'architecture modulaire facilite la maintenance, l'évolutivité et la collaboration d'équipe. 💡