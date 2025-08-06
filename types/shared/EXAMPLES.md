# Types Shared - Exemples pratiques d'utilisation

**Guide complet avec exemples concrets pour le module types/shared v2.0**

> **Note** : Cette version utilise la nouvelle architecture modulaire v2.0. Les anciens fichiers `common.ts`, `search.ts` et `soft-delete.ts` ont été supprimés et remplacés par une architecture modulaire avec 9 modules spécialisés.

## 🚀 Exemples de base

### Import et utilisation des types core

```typescript
// Import des types essentiels
import type {
  EntityId,
  UserId, 
  BillOfLadingId,
  Timestamp,
  AuditMetadata
} from '@/types/shared';

// Utilisation avec branded types (sécurité)
const userId: UserId = 'user_123' as UserId;
const blId: BillOfLadingId = 'bl_456' as BillOfLadingId;

// ✅ Sécurité TypeScript - empêche les erreurs
function assignBLToUser(userId: UserId, blId: BillOfLadingId) {
  // userId et blId sont des types distincts non interchangeables
}

// ❌ Erreur TypeScript si inversion des paramètres
// assignBLToUser(blId, userId); // Erreur de compilation !
```

### Métadonnées d'audit

```typescript
import type { AuditMetadata } from '@/types/shared';

interface UserProfile extends AuditMetadata {
  id: UserId;
  email: string;
  name: string;
  // AuditMetadata ajoute automatiquement :
  // created_at, created_by, updated_at, updated_by, version
}

const profile: UserProfile = {
  id: 'user_123' as UserId,
  email: 'user@example.com',
  name: 'John Doe',
  created_at: '2025-01-06T10:00:00Z',
  updated_at: '2025-01-06T10:00:00Z',
  version: 1
};
```

## 📄 Pagination avancée

### Configuration basique

```typescript
import type {
  PaginationParams,
  PaginationInfo,
  PaginatedResponse
} from '@/types/shared/pagination';

// Paramètres de pagination
const paginationParams: PaginationParams = {
  page: 1,
  limit: 20,
  offset: 0
};

// Réponse paginée typée
const response: PaginatedResponse<UserProfile> = {
  data: [/* array of UserProfile */],
  pagination: {
    current_page: 1,
    total_pages: 5,
    total_count: 100,
    page_size: 20,
    has_next_page: true,
    has_previous_page: false
  }
};
```

### Pagination avec métadonnées personnalisées

```typescript
import type { PaginatedResponse, ExtendedPaginationInfo } from '@/types/shared';

interface BLSearchResponse extends PaginatedResponse<BillOfLading> {
  pagination: ExtendedPaginationInfo & {
    // Métadonnées spécifiques à la recherche BL
    search_stats: {
      search_duration_ms: number;
      filters_applied: number;
      exact_matches: number;
      fuzzy_matches: number;
    };
  };
}
```

## 🔍 Système de filtrage complet

### Filtres simples

```typescript
import type { Filter, FilterOperator } from '@/types/shared/filtering';

// Filtre par statut
const statusFilter: Filter = {
  field: 'status',
  operator: 'in' as FilterOperator,
  value: ['active', 'pending'] // FilterValue type sécurisé
};

// Filtre par date
const dateFilter: Filter = {
  field: 'created_at',
  operator: 'greater_than' as FilterOperator,
  value: '2025-01-01T00:00:00Z'
};
```

### Filtres groupés avec logique complexe

```typescript
import type { FilterGroup, LogicalOperator } from '@/types/shared/filtering';

const complexFilter: FilterGroup = {
  logic: 'AND' as LogicalOperator,
  filters: [
    {
      field: 'status',
      operator: 'equals',
      value: 'active'
    }
  ],
  groups: [
    {
      logic: 'OR',
      filters: [
        {
          field: 'priority',
          operator: 'equals', 
          value: 'high'
        },
        {
          field: 'urgent',
          operator: 'equals',
          value: true
        }
      ]
    }
  ]
};
```

### Configuration de tri

```typescript
import type { SortParam, SortDirection } from '@/types/shared/filtering';

const sorting: SortParam[] = [
  {
    field: 'priority',
    direction: 'desc' as SortDirection,
    nulls_handling: 'last'
  },
  {
    field: 'created_at', 
    direction: 'desc'
  }
];
```

## ✅ Validation et gestion d'erreurs

### Validation basique

```typescript
import type {
  ValidationResult,
  ValidationError,
  SeverityLevel
} from '@/types/shared/validation';

function validateUserEmail(email: string): ValidationResult<string> {
  const errors: ValidationError[] = [];
  
  if (!email.includes('@')) {
    errors.push({
      field: 'email',
      message: 'Format email invalide',
      code: 'INVALID_FORMAT',
      severity: 'error' as SeverityLevel
    });
  }
  
  if (!email.endsWith('@company.com')) {
    errors.push({
      field: 'email', 
      message: 'Utilisez votre email professionnel',
      code: 'DOMAIN_PREFERENCE',
      severity: 'warning' as SeverityLevel
    });
  }
  
  return {
    is_valid: errors.filter(e => e.severity === 'error').length === 0,
    data: errors.length === 0 ? email : undefined,
    errors: errors.filter(e => e.severity === 'error'),
    warnings: errors.filter(e => e.severity === 'warning')
  };
}
```

### Validation avec contexte personnalisé

```typescript
import type { ValidationContext, FieldValidation } from '@/types/shared/validation';

const validationContext: ValidationContext = {
  entity_type: 'user_profile',
  operation: 'create',
  user_permissions: ['read', 'write'],
  business_rules: {
    require_company_email: true,
    min_password_length: 8
  }
};

const fieldValidations: FieldValidation[] = [
  {
    field_name: 'email',
    rules: ['required', 'email', 'company_domain'],
    custom_message: 'Email professionnel requis'
  },
  {
    field_name: 'password',
    rules: ['required', 'min_length:8', 'complexity'],
    severity_override: 'critical'
  }
];
```

## 🌐 API et réponses

### Réponse API standard

```typescript
import type { ApiResponse, ResponseStatus } from '@/types/shared/api';

// Réponse de succès
const successResponse: ApiResponse<UserProfile> = {
  status: 'success' as ResponseStatus,
  data: userProfile,
  message: 'Profil utilisateur récupéré avec succès',
  request_id: 'req_789',
  timestamp: '2025-01-06T10:00:00Z'
};

// Réponse d'erreur
const errorResponse: ApiResponse<never> = {
  status: 'error' as ResponseStatus,
  error: {
    code: 'USER_NOT_FOUND',
    message: 'Utilisateur introuvable',
    details: {
      searched_id: 'user_123',
      search_timestamp: '2025-01-06T10:00:00Z'
    }
  },
  request_id: 'req_790',
  timestamp: '2025-01-06T10:00:00Z'
};
```

### API avec pagination et filtres

```typescript
import type { 
  PaginatedApiResponse,
  ApiSearchParams 
} from '@/types/shared/api';

const searchParams: ApiSearchParams = {
  pagination: { page: 1, limit: 20 },
  filters: [statusFilter, dateFilter],
  sorting: sorting,
  search_query: 'John Doe',
  include_metadata: true
};

const searchResponse: PaginatedApiResponse<UserProfile> = {
  status: 'success',
  data: userProfiles,
  pagination: paginationInfo,
  metadata: {
    search_stats: {
      total_results: 150,
      search_time_ms: 45,
      facets: {
        status: { active: 120, inactive: 30 },
        department: { sales: 80, support: 40, dev: 30 }
      }
    }
  }
};
```

## 🔍 Recherche avancée

### Configuration de recherche

```typescript
import type { 
  SearchConfig,
  SearchQuery,
  SearchResponse 
} from '@/types/shared/search';

const searchConfig: SearchConfig = {
  indices: ['users', 'profiles'],
  fields: ['name', 'email', 'department'],
  boost_fields: {
    name: 2.0,
    email: 1.5
  },
  facets: ['department', 'status', 'creation_date'],
  highlighting: {
    enabled: true,
    fields: ['name', 'email'],
    max_fragment_length: 150
  }
};

const searchQuery: SearchQuery = {
  query: 'John Doe',
  config: searchConfig,
  pagination: { page: 1, limit: 10 },
  filters: [statusFilter]
};
```

### Résultats de recherche avec métadonnées

```typescript
const searchResponse: SearchResponse<UserProfile> = {
  hits: [
    {
      document: userProfile,
      score: 0.95,
      highlights: {
        name: ['<em>John</em> <em>Doe</em>'],
        email: ['<em>john</em>.<em>doe</em>@company.com']
      }
    }
  ],
  total_hits: 25,
  search_time_ms: 12,
  facets: {
    department: [
      { value: 'sales', count: 15 },
      { value: 'support', count: 8 },
      { value: 'dev', count: 2 }
    ],
    status: [
      { value: 'active', count: 20 },
      { value: 'inactive', count: 5 }
    ]
  },
  pagination: paginationInfo
};
```

### Recherches sauvegardées

```typescript
import type { SavedSearch, SearchPreferences } from '@/types/shared';

const savedSearch: SavedSearch = {
  id: 'search_123' as EntityId,
  user_id: userId,
  name: 'Utilisateurs actifs Sales',
  description: 'Recherche des utilisateurs actifs du département vente',
  query: searchQuery,
  is_public: false,
  tags: ['users', 'sales', 'active'],
  created_at: '2025-01-06T10:00:00Z',
  updated_at: '2025-01-06T10:00:00Z'
};

const searchPreferences: SearchPreferences = {
  user_id: userId,
  default_page_size: 20,
  preferred_facets: ['department', 'status'],
  auto_complete: true,
  search_suggestions: true,
  save_search_history: true,
  max_saved_searches: 50
};
```

## 🗑️ Suppression logique (Soft Delete)

### Entité avec suppression logique

```typescript
import type { SoftDeletable, DeletionMetadata } from '@/types/shared';

interface User extends SoftDeletable, AuditMetadata {
  id: UserId;
  email: string;
  name: string;
  
  // SoftDeletable ajoute :
  // deleted_at?, deleted_by?, is_deleted?, deletion_reason?, etc.
}

// Suppression logique
const deletedUser: User = {
  ...existingUser,
  deleted_at: '2025-01-06T15:30:00Z',
  deleted_by: adminUserId,
  is_deleted: true,
  deletion_reason: 'Compte fermé à la demande de l\'utilisateur',
  can_be_restored: true,
  permanent_deletion_at: '2025-04-06T15:30:00Z' // 3 mois plus tard
};
```

### Paramètres de suppression

```typescript
import type { SoftDeleteParams } from '@/types/shared';

const deleteParams: SoftDeleteParams = {
  entity_id: userId,
  entity_type: 'user',
  reason: 'Demande de suppression RGPD',
  deletion_context: {
    gdpr_request_id: 'gdpr_123',
    user_consent: true
  },
  options: {
    cascade: true, // Supprimer entités liées
    schedule_permanent_deletion: true,
    permanent_deletion_date: '2025-04-06T15:30:00Z',
    audit_context: {
      user_id: adminUserId,
      session_id: 'session_456'
    }
  }
};
```

### Politique de rétention

```typescript
import type { RetentionPolicy } from '@/types/shared';

const userRetentionPolicy: RetentionPolicy = {
  policy_id: 'user_retention_v1',
  policy_name: 'Politique de rétention utilisateurs',
  entity_type: 'user',
  retention_config: {
    soft_delete_retention_days: 90,
    auto_permanent_deletion: true,
    grace_period_days: 7,
    extended_retention_conditions: [
      {
        condition_name: 'Compte admin',
        field: 'role',
        operator: 'equals',
        value: 'admin',
        extended_days: 365, // Rétention 1 an pour admins
        reason: 'Obligations légales audit'
      }
    ]
  },
  cleanup_config: {
    cleanup_enabled: true,
    cleanup_schedule: 'weekly',
    cleanup_batch_size: 100,
    cleanup_time_window: {
      start_hour: 2,
      end_hour: 6,
      timezone: 'Europe/Paris'
    }
  }
};
```

## 🎯 Cas d'usage avancés

### Pipeline de validation complète

```typescript
import type {
  ValidationResult,
  ValidationError,
  Filter,
  PaginatedResponse
} from '@/types/shared';

interface UserCreateRequest {
  email: string;
  name: string;
  department: string;
}

class UserService {
  async createUser(request: UserCreateRequest): Promise<ValidationResult<User>> {
    // Validation des données
    const validation = this.validateUserData(request);
    if (!validation.is_valid) {
      return validation;
    }
    
    // Vérification unicité email
    const emailCheck = await this.checkEmailUniqueness(request.email);
    if (!emailCheck.is_valid) {
      return emailCheck;
    }
    
    // Création utilisateur
    const user = await this.persistUser(request);
    
    return {
      is_valid: true,
      data: user,
      metadata: {
        operation: 'user_created',
        timestamp: new Date().toISOString(),
        validation_passed: true
      }
    };
  }
  
  private validateUserData(data: UserCreateRequest): ValidationResult<UserCreateRequest> {
    const errors: ValidationError[] = [];
    
    // Validation email
    if (!data.email || !data.email.includes('@')) {
      errors.push({
        field: 'email',
        message: 'Email requis et valide',
        severity: 'error'
      });
    }
    
    return {
      is_valid: errors.length === 0,
      data: errors.length === 0 ? data : undefined,
      errors
    };
  }
}
```

### Recherche avec cache et performance

```typescript
import type {
  SearchQuery,
  SearchResponse,
  SearchCache,
  PerformanceMetrics
} from '@/types/shared/search';

class SearchService {
  private cache = new Map<string, SearchCache>();
  
  async search<T>(query: SearchQuery): Promise<SearchResponse<T>> {
    const startTime = performance.now();
    
    // Vérification cache
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return {
        ...cached.response,
        from_cache: true,
        performance_metrics: {
          search_time_ms: performance.now() - startTime,
          cache_hit: true
        }
      };
    }
    
    // Recherche effective
    const response = await this.performSearch<T>(query);
    
    // Mise en cache
    this.cache.set(cacheKey, {
      response,
      cached_at: Date.now(),
      ttl_ms: 300000 // 5 minutes
    });
    
    return {
      ...response,
      from_cache: false,
      performance_metrics: {
        search_time_ms: performance.now() - startTime,
        cache_hit: false,
        index_searched: response.metadata?.indices_searched || []
      }
    };
  }
}
```

## 🚀 Bonnes pratiques

### 1. Utilisation des branded types
```typescript
// ✅ Bon - Types sécurisés
function transferBL(fromUser: UserId, toUser: UserId, blId: BillOfLadingId) {
  // Impossible de confondre les IDs
}

// ❌ Éviter - Types génériques
function transferBL(fromUser: string, toUser: string, blId: string) {
  // Risque d'inversion des paramètres
}
```

### 2. Validation progressive
```typescript
// ✅ Bon - Validation par étapes
const validation = this.validateBasicData(data)
  .then(this.validateBusinessRules)
  .then(this.validateUniqueness);

// ❌ Éviter - Validation monolithique
const validation = this.validateEverything(data);
```

### 3. Gestion des erreurs typées
```typescript
// ✅ Bon - Types d'erreurs spécifiques
type UserError = 
  | { type: 'NOT_FOUND'; userId: UserId }
  | { type: 'PERMISSION_DENIED'; required: string[] }
  | { type: 'VALIDATION_FAILED'; errors: ValidationError[] };

// ❌ Éviter - Erreurs génériques
throw new Error('Something went wrong');
```

---

*Types Shared v2.0 - Exemples pratiques pour une utilisation optimale* 📚