# Guide de Migration - Système de Types Modulaire v2.0

## 📋 Vue d'ensemble

Le système de types monolithique `bl.types.ts` (1398 lignes) a été refactorisé en une architecture modulaire pour améliorer la maintenabilité, la lisibilité et la réutilisabilité.

## 🏗️ Nouvelle Architecture

```
types/
├── index.ts                    # Point d'entrée principal
├── bl/                         # Bills of Lading
│   ├── index.ts
│   ├── enums.ts               # Statuts, types de charges, etc.
│   ├── core.ts                # Interfaces principales (BL, conteneurs, compagnies)
│   ├── charges.ts             # Gestion des frais et charges
│   ├── views.ts               # Vues dashboard et recherche
│   └── operations.ts          # CRUD, validation, workflows
├── folders/                    # Gestion des dossiers
│   ├── index.ts
│   ├── enums.ts               # Statuts de dossiers, priorités, etc.
│   ├── core.ts                # Interfaces principales (Folder, relations)
│   ├── alerts.ts              # Système d'alertes et notifications
│   └── operations.ts          # Opérations sur les dossiers
├── containers/                 # Suivi des arrivées de conteneurs
│   ├── index.ts
│   ├── enums.ts               # Statuts d'arrivée, urgences, etc.
│   ├── arrival-tracking.ts    # Suivi des arrivées et métriques
│   ├── dashboard.ts           # Dashboards et vues analytiques
│   └── operations.ts          # Intégrations et opérations
├── shared/                     # Types communs
│   ├── index.ts
│   ├── common.ts              # Types de base, pagination, validation
│   ├── soft-delete.ts         # Système de suppression logique
│   └── search.ts              # Recherche avancée et indexation
├── bl.types.legacy.ts         # Wrapper de compatibilité (DEPRECATED)
├── validation.test.ts         # Tests de validation (peut être supprimé)
└── MIGRATION_GUIDE.md         # Ce guide
```

## 🔄 Migration Step-by-Step

### 1. Remplacement des Imports Simples

**Avant (ancien système) :**
```typescript
import type { BillOfLading, BLContainer, BLStatus } from './types/bl.types';
```

**Après (nouveau système) :**
```typescript
// Option 1: Import depuis le point d'entrée principal (recommandé)
import type { BillOfLading, BLContainer, BLStatus } from './types';

// Option 2: Import depuis le module spécifique
import type { BillOfLading, BLContainer, BLStatus } from './types/bl';

// Option 3: Import depuis les sous-modules (pour usage avancé)
import type { BillOfLading, BLContainer } from './types/bl/core';
import type { BLStatus } from './types/bl/enums';
```

### 2. Migration des Types de Dossiers

**Avant :**
```typescript
import type { Folder, FolderStatus, FolderAlert } from './types/bl.types';
```

**Après :**
```typescript
import type { Folder, FolderStatus, FolderAlert } from './types/folders';
```

### 3. Migration des Types de Conteneurs

**Avant :**
```typescript
import type { ContainerArrivalTracking, ContainerArrivalStatus } from './types/bl.types';
```

**Après :**
```typescript
import type { ContainerArrivalTracking, ContainerArrivalStatus } from './types/containers';
```

### 4. Migration des Types Partagés

**Avant :**
```typescript
import type { AuditMetadata, ValidationResult, PaginationParams } from './types/bl.types';
```

**Après :**
```typescript
import type { AuditMetadata, ValidationResult, PaginationParams } from './types/shared';
```

## 📦 Stratégies d'Import

### Import Principal (Recommandé pour la plupart des cas)

```typescript
import type {
  // BL Types
  BillOfLading,
  BLContainer, 
  BLStatus,
  FreightTerms,
  
  // Folder Types
  Folder,
  FolderStatus,
  FolderAlert,
  
  // Container Types
  ContainerArrivalTracking,
  ContainerArrivalStatus,
  
  // Shared Types
  AuditMetadata,
  PaginationParams,
  ValidationResult
} from './types';
```

### Import Modulaire (Pour organization du code)

```typescript
import type * as BL from './types/bl';
import type * as Folders from './types/folders';
import type * as Containers from './types/containers';
import type * as Shared from './types/shared';

// Utilisation
type MyBL = BL.BillOfLading;
type MyFolder = Folders.Folder;
type MyTracking = Containers.ContainerArrivalTracking;
```

### Import Spécialisé (Pour usage avancé)

```typescript
// Import seulement les enums
import type { BLStatus, FreightTerms } from './types/bl/enums';

// Import seulement les interfaces principales
import type { BillOfLading, BLContainer } from './types/bl/core';

// Import seulement les opérations
import type { CreateBLData, UpdateBLData } from './types/bl/operations';
```

## 🔗 Compatibilité Backward

Un wrapper de compatibilité `bl.types.legacy.ts` est fourni pour faciliter la transition :

```typescript
// ⚠️ DEPRECATED - Mais fonctionne temporairement
import type { BillOfLading, Folder } from './types/bl.types.legacy';
```

**Ce wrapper sera supprimé dans une version future. Migrez dès que possible !**

## 🚀 Avantages du Nouveau Système

### 1. **Modularité**
- Code organisé par domaine fonctionnel
- Imports plus ciblés et efficaces
- Meilleure séparation des responsabilités

### 2. **Maintenabilité**
- Fichiers plus petits et focalisés
- Structure claire et logique
- Facilite les modifications et extensions

### 3. **Performance**
- Tree-shaking amélioré
- Imports plus légers
- Compilation TypeScript plus rapide

### 4. **Développeur Experience**
- IntelliSense plus précis
- Navigation plus facile
- Documentation intégrée

## 📋 Checklist de Migration

### Phase 1: Préparation
- [ ] Identifier tous les fichiers utilisant `bl.types.ts`
- [ ] Créer un inventaire des types utilisés
- [ ] Planifier l'ordre de migration des fichiers

### Phase 2: Migration Progressive
- [ ] Commencer par les fichiers utilisant le moins de types
- [ ] Migrer les imports vers le nouveau système
- [ ] Tester que la compilation fonctionne
- [ ] Vérifier que les fonctionnalités marchent

### Phase 3: Nettoyage
- [ ] Supprimer toutes les références à `bl.types.ts`
- [ ] Supprimer le fichier `bl.types.legacy.ts`
- [ ] Supprimer le fichier `validation.test.ts`
- [ ] Mettre à jour la documentation

## 🛠️ Scripts de Migration Automatique

### Script de Remplacement des Imports

```bash
#!/bin/bash
# Remplace les anciens imports par les nouveaux

# Pour BL types
find . -name "*.ts" -type f -exec sed -i "s|from ['\"]\.\/types\/bl\.types['\"]|from './types'|g" {} \;

# Pour les imports spécifiques
find . -name "*.ts" -type f -exec sed -i "s|from ['\"]\.\/types\/bl\.types\.legacy['\"]|from './types'|g" {} \;
```

### Script de Validation

```bash
#!/bin/bash
# Vérifie que tous les types sont toujours accessibles

npm run type-check
if [ $? -eq 0 ]; then
    echo "✅ Migration réussie - Tous les types sont accessibles"
else
    echo "❌ Erreurs de compilation détectées"
    exit 1
fi
```

## 🔍 Dépannage

### Erreur: "Cannot find module"

```typescript
// ❌ Ancien import qui ne marche plus
import type { BillOfLading } from './types/bl.types';

// ✅ Nouveau import correct
import type { BillOfLading } from './types';
```

### Erreur: "Type not exported"

```typescript
// ❌ Type qui a changé de module
import type { ContainerArrivalStatus } from './types/bl';

// ✅ Import depuis le bon module
import type { ContainerArrivalStatus } from './types/containers';
```

### Erreur: Import circulaire

```typescript
// ❌ Import trop spécifique créant des dépendances circulaires
import type { BLContainer } from './types/bl/core';
import type { Folder } from './types/folders/core';

// ✅ Import depuis le point d'entrée principal
import type { BLContainer, Folder } from './types';
```

## 📚 Ressources Additionnelles

### Documentation des Modules

- **BL Module** (`./types/bl/`): Gestion complète des Bills of Lading
- **Folders Module** (`./types/folders/`): Système de gestion des dossiers
- **Containers Module** (`./types/containers/`): Suivi des arrivées de conteneurs
- **Shared Module** (`./types/shared/`): Types communs et utilitaires

### Exemples d'Usage

```typescript
// Exemple: Création d'un nouveau BL
import type { CreateBLData, BLStatus } from './types';

const newBL: CreateBLData = {
  bl_number: 'NJLU2025001',
  shipping_company_id: 'company-1',
  status: 'draft' satisfies BLStatus,
  // ... autres propriétés
};

// Exemple: Gestion des alertes de dossier
import type { CreateAlertData, AlertType } from './types/folders';

const newAlert: CreateAlertData = {
  folder_id: 'folder-123',
  type: 'deadline' satisfies AlertType,
  severity: 'high',
  title: 'Échéance approchant',
  message: 'Le dossier arrive à échéance dans 2 jours'
};
```

## ⚠️ Points d'Attention

1. **Imports Legacy**: Le fichier `bl.types.legacy.ts` affiche des warnings dans la console
2. **Performance**: Les nouveaux imports sont plus efficaces mais nécessitent une recompilation
3. **Tests**: Mettre à jour tous les tests unitaires utilisant les anciens types
4. **Documentation**: Mettre à jour la documentation API et les guides développeur

## 🎯 Prochaines Étapes

1. **Migration Immédiate**: Remplacer tous les imports `bl.types.ts`
2. **Validation**: Exécuter les tests et vérifier la compilation
3. **Optimisation**: Utiliser les imports spécifiques pour de meilleures performances
4. **Nettoyage**: Supprimer les fichiers legacy une fois la migration terminée

---

**Besoin d'aide ?** Consultez les fichiers de validation dans `./types/validation.test.ts` ou contactez l'équipe de développement.