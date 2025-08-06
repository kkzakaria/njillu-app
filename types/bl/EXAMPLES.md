# Types BL - Guide d'exemples

Ce guide présente des exemples pratiques d'utilisation des types Bills of Lading dans différents scénarios.

## 📋 Table des matières

- [Création d'un BL complet](#création-dun-bl-complet)
- [Gestion des workflows](#gestion-des-workflows)
- [Opérations en lot](#opérations-en-lot)
- [Validation et contrôle qualité](#validation-et-contrôle-qualité)
- [Audit et traçabilité](#audit-et-traçabilité)
- [Intégration avec systèmes externes](#intégration-avec-systèmes-externes)
- [Patterns avancés](#patterns-avancés)

## 🚢 Création d'un BL complet

### Exemple : Export FCL Shanghai → Los Angeles

```typescript
import type { 
  CreateBLData, 
  CreateBLContainerData, 
  CreateCargoDetailData 
} from '@/types/bl/crud';
import type { CreateFreightChargeData } from '@/types/bl/charges';

// Détails de la cargaison
const cargoDetails: CreateCargoDetailData[] = [
  {
    description: 'Electronic Components',
    hs_code: '8542.39.0000',
    commodity_code: 'ELEC-001',
    quantity: 1000,
    unit_type: 'PCS',
    weight_kg: 5000,
    volume_cbm: 25,
    number_of_packages: 50,
    package_type: 'CTN'
  }
];

// Conteneur 40' HC
const container: CreateBLContainerData = {
  container_type_id: '40HC',
  container_number: 'MSCU1234567',
  seal_number: 'S12345',
  
  gross_weight_kg: 15000,
  tare_weight_kg: 3800,
  net_weight_kg: 11200,
  volume_cbm: 67.7,
  
  loading_method: 'fcl',
  shipper_load_stow_count: true,
  marks_and_numbers: 'ACME/LOT-2025-001',
  
  estimated_arrival_date: '2025-02-15',
  arrival_location: 'Los Angeles',
  
  cargo_details: cargoDetails
};

// Frais de transport
const freightCharges: CreateFreightChargeData[] = [
  {
    charge_type: 'ocean_freight',
    charge_category: 'basic',
    amount: 2500.00,
    currency: 'USD',
    calculation_basis: 'per_container',
    paid_by: 'shipper',
    payment_status: 'pending'
  },
  {
    charge_type: 'documentation_fee',
    charge_category: 'administrative',
    amount: 50.00,
    currency: 'USD',
    calculation_basis: 'per_bl',
    paid_by: 'shipper',
    payment_status: 'pending'
  }
];

// BL complet
const newBL: CreateBLData = {
  // Identification
  bl_number: 'MSCSHA250106001',
  booking_reference: 'MSC-BKG-2025-001',
  export_reference: 'EXP-2025-SHA-001',
  service_contract: 'SC-MSC-2025',
  
  // Compagnie maritime
  shipping_company_id: 'msc-mediterranean-shipping',
  
  // Parties impliquées
  shipper_info: {
    name: 'Shanghai Export Industries Co., Ltd',
    address: '1234 Huangpu Industrial Road',
    city: 'Shanghai',
    country: 'CN',
    phone: '+86-21-1234-5678',
    email: 'export@shanghai-industries.com',
    tax_id: '91310000123456789X'
  },
  consignee_info: {
    name: 'Los Angeles Import Solutions Inc',
    address: '5678 Harbor Boulevard',
    city: 'Los Angeles',
    country: 'US',
    phone: '+1-310-987-6543',
    email: 'import@laimport.com',
    tax_id: '95-1234567'
  },
  notify_party_info: {
    name: 'Global Logistics Services',
    address: '999 Logistics Center Drive',
    city: 'Long Beach',
    country: 'US',
    phone: '+1-562-555-0123',
    email: 'operations@globallogistics.com'
  },
  
  // Transport
  port_of_loading: 'CNSHA',
  port_of_discharge: 'USLAX',
  place_of_receipt: 'Shanghai Factory',
  place_of_delivery: 'Los Angeles Warehouse',
  
  // Navire
  vessel_name: 'MSC MAGNIFICA',
  voyage_number: '2501E',
  vessel_imo_number: '9876543210',
  
  // Dates
  issue_date: '2025-01-06',
  shipped_on_board_date: '2025-01-08',
  estimated_arrival_date: '2025-02-15',
  
  // Termes commerciaux
  freight_terms: 'prepaid',
  loading_method: 'fcl',
  
  // Cargaison
  cargo_description: 'Electronic Components and Accessories',
  total_packages: 50,
  total_gross_weight_kg: 15000,
  total_volume_cbm: 67.7,
  
  // Valeur déclarée
  declared_value_amount: 150000,
  declared_value_currency: 'USD',
  
  // Relations
  containers: [container],
  freight_charges: freightCharges
};
```

## 🔄 Gestion des workflows

### Exemple : Cycle de vie complet d'un BL

```typescript
import type { 
  BLStatusChangeData, 
  BLAvailableActions 
} from '@/types/bl/workflows';

// 1. Émission du BL
const issueBL: BLStatusChangeData = {
  bl_id: 'bl-12345',
  new_status: 'issued',
  reason: 'BL émis après vérification des documents',
  notes: 'Tous les documents requis ont été fournis et validés',
  effective_date: '2025-01-06T14:30:00Z',
  notify_parties: true
};

// 2. Chargement à bord
const shipBL: BLStatusChangeData = {
  bl_id: 'bl-12345',
  new_status: 'shipped',
  reason: 'Conteneurs chargés à bord du MSC MAGNIFICA',
  effective_date: '2025-01-08T08:15:00Z',
  notify_parties: true
};

// 3. Déchargement au port de destination
const dischargeBL: BLStatusChangeData = {
  bl_id: 'bl-12345',
  new_status: 'discharged',
  reason: 'Conteneurs déchargés au port de Los Angeles',
  effective_date: '2025-02-15T12:45:00Z',
  notify_parties: true
};

// 4. Livraison finale
const deliverBL: BLStatusChangeData = {
  bl_id: 'bl-12345',
  new_status: 'delivered',
  reason: 'Marchandises livrées au destinataire final',
  notes: 'Livraison effectuée avec signature du consignataire',
  effective_date: '2025-02-18T10:30:00Z',
  notify_parties: true
};

// Actions disponibles selon le statut
const availableActions: BLAvailableActions = {
  bl_id: 'bl-12345',
  current_status: 'issued',
  available_transitions: [
    {
      target_status: 'shipped',
      action_name: 'Marquer comme expédié',
      requires_confirmation: true,
      required_fields: ['vessel_name', 'shipped_on_board_date'],
      validation_rules: ['check_vessel_departure']
    },
    {
      target_status: 'cancelled',
      action_name: 'Annuler le BL',
      requires_confirmation: true,
      required_fields: ['reason'],
      validation_rules: ['check_cancellation_policy']
    }
  ],
  blocked_reasons: []
};
```

## ⚡ Opérations en lot

### Exemple : Changement de statut en masse

```typescript
import type { 
  BLBatchOperation, 
  StatusChangeParams 
} from '@/types/bl';

// Changement de statut pour plusieurs BL après départ du navire
const batchStatusChange: BLBatchOperation = {
  operation_type: 'status_change',
  bl_ids: [
    'bl-12345',
    'bl-12346', 
    'bl-12347',
    'bl-12348'
  ],
  parameters: {
    new_status: 'shipped',
    reason: 'Navire MSC MAGNIFICA parti de Shanghai',
    effective_date: '2025-01-08T08:15:00Z',
    notify_parties: true,
    notes: 'Départ confirmé par agent portuaire'
  } as StatusChangeParams,
  
  // Options de traitement
  continue_on_error: true,
  notify_on_completion: true,
  
  // Test préalable
  dry_run: false
};

// Export en lot
const batchExport: BLBatchOperation = {
  operation_type: 'bulk_export',
  bl_ids: ['bl-12345', 'bl-12346'],
  parameters: {
    format: 'excel',
    include_containers: true,
    include_charges: true,
    include_cargo_details: true,
    template_id: 'standard-bl-export'
  },
  continue_on_error: false,
  notify_on_completion: true
};
```

## ✅ Validation et contrôle qualité

### Exemple : Validation complète d'un BL

```typescript
import type { 
  BLValidationRules, 
  BLValidationResult 
} from '@/types/bl/validation';

// Configuration de validation stricte
const strictValidation: BLValidationRules = {
  bl_number: {
    required: true,
    format_pattern: '^[A-Z]{3}\\d{11}$',
    uniqueness_check: true
  },
  parties: {
    require_shipper: true,
    require_consignee: true,
    require_notify_party: false,
    validate_addresses: true
  },
  transport: {
    require_loading_port: true,
    require_discharge_port: true,
    validate_port_codes: true
  },
  containers: {
    minimum_count: 1,
    maximum_count: 20,
    require_container_numbers: true,
    validate_container_format: true
  },
  charges: {
    require_ocean_freight: true,
    validate_amounts: true,
    require_payment_terms: true
  }
};

// Résultat de validation avec erreurs
const validationWithErrors: BLValidationResult = {
  is_valid: false,
  errors: [
    {
      field: 'bl_number',
      code: 'INVALID_FORMAT',
      message: 'Le numéro de BL ne respecte pas le format requis',
      severity: 'error'
    },
    {
      field: 'consignee_info.address',
      code: 'REQUIRED_FIELD',
      message: 'L\'adresse du destinataire est obligatoire',
      severity: 'error'
    }
  ],
  warnings: [
    {
      field: 'notify_party_info',
      code: 'RECOMMENDED_FIELD',
      message: 'Il est recommandé de spécifier une partie à notifier',
      recommendation: 'Ajouter les informations de la partie à notifier'
    },
    {
      field: 'declared_value_amount',
      code: 'MISSING_VALUE',
      message: 'Valeur déclarée non spécifiée',
      recommendation: 'Ajouter la valeur déclarée pour l\'assurance'
    }
  ],
  completeness_score: 75,
  missing_required_fields: [
    'consignee_info.address',
    'freight_charges[0].amount'
  ],
  suggested_improvements: [
    'Compléter les adresses des parties',
    'Vérifier les montants des frais',
    'Ajouter une partie à notifier'
  ]
};
```

## 🔍 Audit et traçabilité

### Exemple : Suivi complet des modifications

```typescript
import type { 
  BLAuditEntry, 
  BLAuditQuery 
} from '@/types/bl/audit';

// Entrée d'audit pour changement de statut
const statusChangeAudit: BLAuditEntry = {
  id: 'audit-789',
  bl_id: 'bl-12345',
  
  action: 'status_changed',
  entity_type: 'bl',
  
  old_values: {
    status: 'issued',
    updated_at: '2025-01-06T14:30:00Z'
  },
  new_values: {
    status: 'shipped',
    updated_at: '2025-01-08T08:15:00Z',
    shipped_on_board_date: '2025-01-08T08:15:00Z'
  },
  
  performed_by: 'user-456',
  performed_at: '2025-01-08T08:15:30Z',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  
  reason: 'Navire parti du port de Shanghai',
  notes: 'Confirmation reçue de l\'agent portuaire',
  reference_number: 'DEP-SHA-20250108-001'
};

// Requête d'audit pour un BL spécifique
const auditQuery: BLAuditQuery = {
  bl_ids: ['bl-12345'],
  actions: ['status_changed', 'updated'],
  date_from: '2025-01-01T00:00:00Z',
  date_to: '2025-01-31T23:59:59Z',
  
  page: 1,
  page_size: 50,
  sort_by: 'performed_at',
  sort_order: 'desc'
};
```

## 🔗 Intégration avec systèmes externes

### Exemple : Synchronisation avec ERP

```typescript
import type { 
  BLIntegrationConfig, 
  BLSyncResult 
} from '@/types/bl/integration';

// Configuration SAP ERP
const sapIntegration: BLIntegrationConfig = {
  system_name: 'SAP ERP Production',
  system_type: 'erp',
  
  base_url: 'https://sap.company.com/api/v2',
  authentication: {
    type: 'oauth2',
    credentials: {
      client_id: 'bl-sync-client',
      client_secret: '${SAP_CLIENT_SECRET}',
      token_url: 'https://sap.company.com/oauth/token'
    }
  },
  
  field_mapping: {
    'bl_number': 'delivery_note_number',
    'shipper_info.name': 'vendor_name',
    'consignee_info.name': 'customer_name',
    'total_gross_weight_kg': 'total_weight',
    'freight_charges[].amount': 'shipping_cost'
  },
  
  sync_direction: 'bidirectional',
  sync_frequency: 'real_time',
  
  retry_policy: {
    max_attempts: 3,
    backoff_strategy: 'exponential',
    timeout_ms: 30000
  }
};

// Résultat de synchronisation
const syncResult: BLSyncResult = {
  integration_name: 'SAP ERP Production',
  sync_started_at: '2025-01-08T09:00:00Z',
  sync_completed_at: '2025-01-08T09:05:30Z',
  
  status: 'partial_success',
  
  statistics: {
    total_records: 156,
    synchronized_records: 152,
    failed_records: 4,
    skipped_records: 0
  },
  
  errors: [
    {
      bl_id: 'bl-12349',
      error_code: 'INVALID_CUSTOMER',
      error_message: 'Customer code not found in SAP',
      retry_possible: false
    },
    {
      bl_id: 'bl-12350',
      error_code: 'NETWORK_TIMEOUT',
      error_message: 'Connection timeout during sync',
      retry_possible: true
    }
  ],
  
  next_sync_scheduled: '2025-01-08T10:00:00Z'
};
```

## 🎯 Patterns avancés

### Union discriminée pour opérations

```typescript
import type { BLBatchOperationParams } from '@/types/bl/parameters';

function processBatchOperation(
  operationType: string, 
  params: BLBatchOperationParams
) {
  switch (operationType) {
    case 'status_change':
      // TypeScript infère automatiquement StatusChangeParams
      console.log(`Changement vers: ${params.new_status}`);
      if (params.notify_parties) {
        // Notifier les parties
      }
      break;
      
    case 'add_charges':
      // TypeScript infère automatiquement AddChargesParams
      params.charges.forEach(charge => {
        console.log(`Frais ${charge.charge_type}: ${charge.amount} ${charge.currency}`);
      });
      break;
      
    case 'bulk_export':
      // TypeScript infère automatiquement BulkExportParams
      console.log(`Export au format: ${params.format}`);
      break;
  }
}
```

### Type guards pour validation runtime

```typescript
import type { BLFieldValue } from '@/types/bl/parameters';
import type { PartyInfo } from '@/types/bl/core';

function isPartyInfo(value: BLFieldValue): value is PartyInfo {
  return typeof value === 'object' && 
         value !== null && 
         'name' in value && 
         typeof (value as any).name === 'string';
}

function processAuditChange(field: string, value: BLFieldValue) {
  if (field.includes('_info') && isPartyInfo(value)) {
    console.log(`Partie modifiée: ${value.name}`);
    if (value.email) {
      console.log(`Email: ${value.email}`);
    }
  } else if (typeof value === 'string') {
    console.log(`Champ texte modifié: ${value}`);
  } else if (typeof value === 'number') {
    console.log(`Valeur numérique: ${value}`);
  }
}
```

---

*Ce guide d'exemples est maintenu en parallèle de l'évolution des types BL. Pour des cas d'usage spécifiques, consultez la [documentation principale](./README.md).*