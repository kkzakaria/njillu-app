# 📦 Système de Types Modulaire v2.0

Système de types TypeScript modulaire et maintenable pour l'application NJILLU.

## 🏗️ Architecture

```
types/
├── index.ts                    # 🎯 Point d'entrée principal
├── bl/                         # 📋 Bills of Lading
├── folders/                    # 📁 Gestion des dossiers
├── containers/                 # 🚢 Suivi des arrivées
├── shared/                     # 🔧 Types communs
├── bl.types.legacy.ts          # ⚠️  Compatibilité (DEPRECATED)
├── MIGRATION_GUIDE.md          # 📖 Guide de migration
└── README.md                   # 📚 Cette documentation
```

## 🚀 Usage Rapide

### Import Principal (Recommandé)
```typescript
import type {
  BillOfLading,
  Folder, 
  ContainerArrivalTracking,
  AuditMetadata
} from './types';
```

### Import Modulaire
```typescript
import type * as BL from './types/bl';
import type * as Folders from './types/folders';
```

### Import Spécialisé
```typescript
import type { BLStatus } from './types/bl/enums';
import type { CreateBLData } from './types/bl/operations';
```

## 📋 Modules Disponibles

### 🔷 **BL Module** (`./types/bl/`)
Gestion complète des Bills of Lading

**Fichiers :**
- `enums.ts` - Statuts, types de charges, termes commerciaux
- `core.ts` - Interfaces principales (BL, conteneurs, compagnies)
- `charges.ts` - Système de gestion des frais
- `views.ts` - Vues dashboard et recherche
- `operations.ts` - CRUD, validation, workflows

**Types principaux :** `BillOfLading`, `BLContainer`, `BLFreightCharge`, `ShippingCompany`

### 🔷 **Folders Module** (`./types/folders/`)
Système de gestion des dossiers

**Fichiers :**
- `enums.ts` - Statuts de dossiers, priorités, régimes douaniers
- `core.ts` - Interfaces principales (Folder, relations, métadonnées)
- `alerts.ts` - Système d'alertes et notifications
- `operations.ts` - Opérations CRUD et workflows

**Types principaux :** `Folder`, `FolderAlert`, `ClientInfo`, `LocationInfo`

### 🔷 **Containers Module** (`./types/containers/`)
Suivi avancé des arrivées de conteneurs

**Fichiers :**
- `enums.ts` - Statuts d'arrivée, niveaux d'urgence
- `arrival-tracking.ts` - Tracking, métriques, notifications
- `dashboard.ts` - Dashboards et vues analytiques
- `operations.ts` - Intégrations, automatisation, validation

**Types principaux :** `ContainerArrivalTracking`, `ArrivalPerformanceMetrics`, `ContainerArrivalDashboard`

### 🔷 **Shared Module** (`./types/shared/`)
Types communs et utilitaires système

**Fichiers :**
- `common.ts` - Types de base, pagination, validation, API
- `soft-delete.ts` - Système de suppression logique
- `search.ts` - Recherche avancée et indexation

**Types principaux :** `AuditMetadata`, `ValidationResult`, `ApiResponse`, `SoftDeletable`

## 🔍 Recherche de Types

### Par Domaine Fonctionnel
```typescript
// Bills of Lading
import type { BillOfLading } from './types/bl';

// Gestion des dossiers  
import type { Folder } from './types/folders';

// Suivi des conteneurs
import type { ContainerArrivalTracking } from './types/containers';
```

### Par Catégorie
```typescript
// Enums et constantes
import type { BLStatus, FolderStatus } from './types';

// Interfaces principales
import type { BillOfLading, Folder } from './types';

// Opérations et workflows
import type { CreateBLData, UpdateFolderData } from './types';
```

## 🛠️ Développement

### Ajout de Nouveaux Types

1. **Identifier le module approprié** (bl, folders, containers, shared)
2. **Choisir le fichier correct** (enums, core, operations, etc.)
3. **Ajouter le type** avec documentation JSDoc
4. **Exporter dans le fichier index.ts du module**
5. **Optionnellement exporter dans le point d'entrée principal**

### Exemple d'Ajout
```typescript
// Dans types/bl/enums.ts
export type NewBLStatus = 'processing' | 'validated';

// Dans types/bl/index.ts
export type { NewBLStatus } from './enums';

// Dans types/index.ts (optionnel)
export type { NewBLStatus } from './bl/enums';
```

## 🔧 Maintenance

### Structure des Fichiers
- **enums.ts** - Types union, constantes
- **core.ts** - Interfaces principales
- **operations.ts** - CRUD, validation, workflows
- **views.ts** - Vues, dashboards, reporting
- **index.ts** - Exports du module

### Conventions
- **Interfaces** : PascalCase (`BillOfLading`)
- **Types union** : PascalCase (`BLStatus`)
- **Fichiers** : kebab-case (`arrival-tracking.ts`)
- **Exports** : Toujours via index.ts

## 📊 Métriques

- **16 fichiers** de types modulaires
- **~150 interfaces** TypeScript
- **~45 enums** et types union
- **4 modules** organisés par domaine
- **100% compatibilité** backward

## 🎯 Avantages

- ✅ **Maintenabilité** - Fichiers plus petits et focalisés
- ✅ **Performance** - Tree-shaking optimisé
- ✅ **Developer Experience** - IntelliSense amélioré
- ✅ **Modularity** - Architecture par domaine
- ✅ **Scalabilité** - Facilité d'extension

## ⚠️ Migration depuis v1.0

Le fichier monolithique `bl.types.ts` a été refactorisé. Un wrapper de compatibilité `bl.types.legacy.ts` est disponible temporairement.

**Migration :**
```typescript
// ❌ Ancien (DEPRECATED)
import type { BillOfLading } from './types/bl.types';

// ✅ Nouveau (RECOMMANDÉ)  
import type { BillOfLading } from './types';
```

📖 **Guide complet :** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 🆘 Support

- **Documentation :** Consultez les commentaires JSDoc dans les fichiers
- **Exemples :** Voir `MIGRATION_GUIDE.md` pour des exemples d'usage
- **Problèmes :** Vérifiez que vos imports utilisent les nouveaux chemins

---

**Version :** 2.0.0 | **Créé :** 2025-08-04 | **Status :** ✅ Production Ready