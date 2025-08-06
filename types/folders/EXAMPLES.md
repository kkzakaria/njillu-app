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

### 4. 🚨 Système d'Alertes Intelligent

```typescript
import type {
  FolderAlert,
  AlertRule,
  AlertDashboard,
  CreateAlertData,
  AlertType,
  AlertSeverity
} from '@/types/folders';

// Création d'une alerte manuelle
const createAlertData: CreateAlertData = {
  folder_id: "folder-123",
  type: "deadline" as AlertType,
  severity: "high" as AlertSeverity,
  title: "Échéance douanière approche",
  message: "La déclaration douanière doit être soumise avant le 15/08/2025",
  description: "Dossier F-2025-0001 - Risque de pénalités si retard",
  business_impact: "high",
  due_date: "2025-08-15T23:59:59Z",
  assigned_to: "customs-team",
  recommended_actions: [
    {
      action_type: "urgent_processing",
      description: "Prioriser le traitement de la déclaration",
      priority: "high"
    },
    {
      action_type: "client_contact", 
      description: "Contacter le client pour documents manquants",
      priority: "medium"
    }
  ]
};

// Configuration d'une règle d'alerte automatique
const alertRule: AlertRule = {
  id: "rule-deadline-warning",
  name: "Alerte échéance déclaration douanière", 
  description: "Alerte 48h avant l'échéance de déclaration",
  
  trigger_conditions: {
    folder_status: ["processing"],
    processing_stage: ["declaration_douaniere"],
    alert_type: "deadline",
    time_based_triggers: [
      {
        condition: "days_before_deadline",
        threshold: 2,
        comparison: "less_than"
      }
    ]
  },
  
  alert_config: {
    title_template: "Échéance {stage} dans {days_remaining} jours",
    message_template: "Le dossier {folder_number} nécessite une action urgente",
    severity: "high",
    business_impact: "high",
    auto_assign_team: "customs-team",
    sla_hours: 24
  },
  
  notification_config: {
    methods: ["email", "push"],
    recipients: ["customs@company.com", "supervisor@company.com"],
    escalation_rules: [
      {
        delay_hours: 12,
        escalate_to: ["manager@company.com"],
        increase_severity: true
      }
    ]
  },
  
  is_active: true,
  priority: 1
};

// Dashboard des alertes
class AlertDashboardService {
  async getDashboard(): Promise<AlertDashboard> {
    return {
      total_active_alerts: 23,
      critical_alerts: 5,
      overdue_alerts: 8,
      unassigned_alerts: 3,
      
      alerts_by_type: {
        deadline: 12,
        delay: 6,
        compliance_issue: 3,
        cost_overrun: 2
      },
      
      alerts_by_severity: {
        critical: 5,
        high: 10,
        medium: 6,
        low: 2
      },
      
      new_alerts_today: 7,
      resolved_alerts_today: 4,
      average_resolution_time_hours: 18.5,
      
      folders_with_most_alerts: [
        {
          folder_id: "folder-123",
          folder_number: "F-2025-0001", 
          alert_count: 4,
          highest_severity: "critical"
        }
      ],
      
      alert_resolution_rate: 85.5,
      sla_compliance_rate: 92.0,
      average_first_response_time_hours: 2.3,
      
      generated_at: new Date().toISOString()
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