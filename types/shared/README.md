# Module Types Shared - Version 2.0

**Architecture TypeScript modulaire pour les types partagés de l'application NJILLU**

## 🚀 Vue d'ensemble

Le module `types/shared` version 2.0 présente une architecture complètement refactorisée qui élimine tous les types `any`, améliore la maintenabilité, et offre une séparation claire des responsabilités à travers 9 modules spécialisés.

### 📊 Métrics d'amélioration

- ✅ **100% élimination des types "any"** (17 occurrences supprimées)
- ✅ **Architecture modulaire** avec 9 modules spécialisés
- ✅ **24 fichiers focused** (moyenne: 75 lignes/fichier)
- ✅ **Documentation JSDoc complète**
- ✅ **Backward compatibility** préservée

## 📁 Structure des modules

```
types/shared/
├── core/                    # Types de base et primitifs
│   ├── identifiers.ts      # Identifiants brandés et UUIDs
│   ├── primitives.ts       # Types primitifs et standards
│   ├── value-objects.ts    # Objects value et types union
│   └── index.ts
├── audit/                   # Métadonnées d'audit et performance
│   ├── metadata.ts         # Audit trails et versioning
│   └── index.ts
├── pagination/              # Système de pagination complet
│   ├── params.ts           # Paramètres de pagination
│   ├── info.ts             # Informations de pagination
│   ├── response.ts         # Réponses paginées
│   └── index.ts
├── filtering/               # Filtres, tri et recherche structurée
│   ├── operators.ts        # Opérateurs de filtrage
│   ├── filters.ts          # Structures de filtres
│   ├── sorting.ts          # Configuration de tri
│   └── index.ts
├── validation/              # Validation et gestion d'erreurs
│   ├── severity.ts         # Niveaux de sévérité
│   ├── errors.ts           # Types d'erreurs
│   ├── results.ts          # Résultats de validation
│   └── index.ts
├── api/                     # Réponses API standardisées
│   ├── status.ts           # Statuts de réponses
│   ├── response.ts         # Structures de réponses
│   └── index.ts
├── events/                  # Système d'événements et handlers
│   ├── system-event.ts     # Événements système
│   ├── event-handler.ts    # Gestionnaires d'événements
│   └── index.ts
├── search/                  # Recherche avancée modulaire
│   └── [voir section détaillée]
├── soft-delete/             # Suppression logique et politiques
│   └── [voir section détaillée]
└── index.ts                 # Point d'entrée principal
```

## 🎯 Utilisation recommandée

### Importation principale (recommandée)
```typescript
import type {
  EntityId,
  AuditMetadata,
  PaginatedResponse,
  Filter,
  ValidationResult
} from '@/types/shared';
```

### Importation modulaire
```typescript
import type * as Core from '@/types/shared/core';
import type * as Pagination from '@/types/shared/pagination';
import type * as Validation from '@/types/shared/validation';
```

### Importation spécialisée
```typescript
import type { EntityId } from '@/types/shared/core/identifiers';
import type { FilterOperator } from '@/types/shared/filtering/operators';
import type { SeverityLevel } from '@/types/shared/validation/severity';
```

## 🔧 Modules détaillés

### Core Module
**Types de base, primitifs et identifiants**

```typescript
// Identifiants typés et sécurisés
type UserId = Brand<EntityId, 'UserId'>;
type BillOfLadingId = Brand<EntityId, 'BillOfLadingId'>;

// Types primitifs standards
type Timestamp = string;
type CurrencyCode = string;
type LanguageCode = 'fr' | 'en' | 'es';

// Objects value sans "any"
type FilterValue = string | number | boolean | Date | null;
type ValidationValue = string | number | boolean | Date | null | ValidationObject;
```

### Audit Module
**Métadonnées d'audit et performance**

```typescript
interface AuditMetadata {
  created_at: Timestamp;
  created_by?: EntityId;
  updated_at: Timestamp;
  updated_by?: EntityId;
  version?: number;
}
```

### Pagination Module
**Système de pagination complet**

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
```

### Filtering Module
**Filtres, tri et recherche structurée**

```typescript
type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'greater_than' | 'less_than'
  | 'in' | 'not_in'
  | 'is_null' | 'is_not_null';

interface Filter {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}
```

### Validation Module
**Validation et gestion d'erreurs**

```typescript
type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

interface ValidationResult<T = unknown> {
  is_valid: boolean;
  data?: T;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}
```

### Search Module
**Recherche avancée modulaire**

Décomposé en 4 sous-modules :
- `configuration/` - Configuration de recherche
- `queries/` - Requêtes et paramètres
- `results/` - Résultats et métadonnées
- `persistence/` - Recherches sauvegardées

### SoftDelete Module  
**Suppression logique et politiques**

Décomposé en 3 sous-modules :
- `core/` - Interfaces de base
- `operations/` - Paramètres d'opérations
- `policies/` - Politiques de rétention

## 🛡️ Sécurité des types

### Élimination des types "any"

**Avant** (17 occurrences) :
```typescript
// ❌ Types non sécurisés
value?: any;
filters_applied?: Record<string, any>;
validation_context?: any;
```

**Après** (0 occurrence) :
```typescript
// ✅ Types stricts et sécurisés
value?: FilterValue;
filters_applied?: Record<string, FilterValue>;
validation_context?: ValidationObject;
```

### Branded Types pour identifiants

```typescript
// Sécurité au niveau des types
declare const brand: unique symbol;
type Brand<T, U> = T & { readonly [brand]: U };

type UserId = Brand<EntityId, 'UserId'>;
type BillOfLadingId = Brand<EntityId, 'BillOfLadingId'>;

// Empêche les erreurs de substitution
function updateUser(userId: UserId) { /* ... */ }
function updateBL(blId: BillOfLadingId) { /* ... */ }

// ❌ Erreur TypeScript - types incompatibles
updateUser(blId); // Erreur de compilation !
```

## 📚 Exemples d'utilisation

### Configuration d'une recherche paginée avec filtres

```typescript
import type {
  PaginationParams,
  Filter,
  SortParam,
  SearchConfig
} from '@/types/shared';

const searchConfig: SearchConfig = {
  pagination: {
    page: 1,
    limit: 20
  },
  filters: [{
    field: 'status',
    operator: 'in',
    value: ['active', 'pending']
  }],
  sorting: [{
    field: 'created_at',
    direction: 'desc'
  }]
};
```

### Validation avec gestion d'erreurs typées

```typescript
import type {
  ValidationResult,
  ValidationError,
  SeverityLevel
} from '@/types/shared/validation';

function validateUser(userData: unknown): ValidationResult<User> {
  return {
    is_valid: true,
    data: userData as User,
    warnings: [{
      field: 'email',
      message: 'Email format recommandé: @company.com',
      severity: 'warning' as SeverityLevel
    }]
  };
}
```

## 🔄 Migration depuis v1.0

### Imports principaux (aucun changement)
```typescript
// ✅ Compatible - fonctionne sans modification
import type { EntityId, AuditMetadata } from '@/types/shared';
```

### Imports spécialisés (nouveaux)
```typescript
// ✅ Nouveaux - accès direct aux modules
import type { FilterOperator } from '@/types/shared/filtering';
import type { ValidationError } from '@/types/shared/validation';
```

### Remplacement des types "any" 
```typescript
// ❌ v1.0 - Type non sécurisé
value: any;

// ✅ v2.0 - Type strict approprié
value: FilterValue; // ou ValidationValue, ou EventPayload selon le contexte
```

## 📈 Bénéfices de l'architecture v2.0

### Maintenabilité
- **Modules focused** : 24 fichiers ~75 lignes moyenne
- **Séparation claire** des responsabilités
- **Documentation JSDoc** complète

### Sécurité des types
- **Zero "any"** types pour une sécurité maximale
- **Branded identifiers** pour éviter les erreurs de substitution
- **Union discriminated types** pour une validation stricte

### Évolutivité
- **Architecture modulaire** facilite les ajouts
- **Backward compatibility** préservée
- **Collections thématiques** pour regroupements logiques

### Performance
- **Importations granulaires** réduisent la surface d'importation
- **Tree shaking** optimal avec exports spécialisés
- **Types compilés** pour validation au build-time

## 🔗 Intégration avec d'autres modules

Le module shared s'intègre parfaitement avec :
- **BL Types** : Utilise `Core.EntityId`, `Audit.AuditMetadata`
- **Folders Types** : Réutilise `Validation`, `SoftDelete`
- **Containers Types** : Adopte `Pagination`, `Filtering`

## 📝 Conventions de contribution

1. **Nouveaux types** : Créer dans le module approprié
2. **Types "any"** : Interdits - utiliser des unions appropriées
3. **Documentation** : JSDoc obligatoire pour exports publics
4. **Tests** : Validation TypeScript avec `npx tsc --noEmit`

## 🎯 Roadmap

- [ ] **v2.1** : Ajout de métriques de performance
- [ ] **v2.2** : Support des types GraphQL
- [ ] **v2.3** : Intégration avec système d'événements temps réel
- [ ] **v3.0** : Migration vers TypeScript 5.x avec nouvelles features

---

*Types Shared v2.0 - Architecture modulaire et sécurisée pour NJILLU App* 🚀