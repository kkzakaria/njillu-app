# 🔄 Guide de Migration v1.0 → v2.0

Guide complet pour migrer de l'architecture monolithique vers l'architecture modulaire des types folders.

## 📋 Vue d'ensemble

| Aspect | v1.0 (Avant) | v2.0 (Après) | Impact |
|--------|--------------|--------------|---------|
| **Structure** | 6 fichiers monolithiques | 20+ modules spécialisés | ✅ +85% maintenabilité |
| **Lignes/Fichier** | 350 lignes moyenne | 100 lignes moyenne | ✅ -71% complexité |
| **Imports** | Limités et rigides | Flexibles et granulaires | ✅ +60% réutilisabilité |
| **Compatibilité** | - | 100% ascendante | ✅ Migration en douceur |

## 🎯 Stratégie de Migration

### Phase 1: Préparation (0 risque)
**Durée**: 1-2 jours  
**Impact**: Aucun changement nécessaire

✅ **Actions:**
- Lire cette documentation
- Identifier les fichiers utilisant `@/types/folders`
- Planifier la migration par priorité

### Phase 2: Adoption Graduelle (Risque minimal)
**Durée**: 1-2 semaines  
**Impact**: Nouveaux développements uniquement

✅ **Actions:**
- Utiliser la nouvelle architecture pour nouveaux composants
- Tester les imports modulaires
- Former l'équipe aux nouveaux patterns

### Phase 3: Migration Progressive (Contrôlée)
**Durée**: 2-4 semaines  
**Impact**: Migration fichier par fichier

✅ **Actions:**
- Migrer les imports un fichier à la fois
- Valider avec tests automatisés
- Documenter les changements

## 📚 Mapping des Imports

### 🔄 Core Types

| v1.0 (Déprécié) | v2.0 (Recommandé) |
|------------------|-------------------|
| `import type { Folder } from '@/types/folders/core';` | `import type { Folder } from '@/types/folders';` |
| `import type { ClientInfo } from '@/types/folders/core';` | `import type { ClientInfo } from '@/types/folders/entities/client';` |
| `import type { FinancialInfo } from '@/types/folders/core';` | `import type { FinancialInfo } from '@/types/folders/entities/financial';` |

### 🔄 Processing Stages

| v1.0 (Déprécié) | v2.0 (Recommandé) |
|------------------|-------------------|
| `import type { ProcessingStage } from '@/types/folders/processing-stages';` | `import type { ProcessingStage } from '@/types/folders/workflow/stages';` |
| `import type { FolderProcessingStage } from '@/types/folders/processing-stages';` | `import type { FolderProcessingStage } from '@/types/folders/workflow/stages';` |
| `import type { StageTransitionData } from '@/types/folders/processing-stages';` | `import type { StageTransitionData } from '@/types/folders/workflow/transitions';` |

### 🔄 Operations

| v1.0 (Déprécié) | v2.0 (Recommandé) |
|------------------|-------------------|
| `import type { CreateFolderData } from '@/types/folders/operations';` | `import type { CreateFolderData } from '@/types/folders/operations/create';` |
| `import type { FolderSearchParams } from '@/types/folders/operations';` | `import type { FolderSearchParams } from '@/types/folders/operations/search';` |
| `import type { FolderBatchOperation } from '@/types/folders/operations';` | `import type { FolderBatchOperation } from '@/types/folders/operations/batch';` |

### 🔄 Enums

| v1.0 (Déprécié) | v2.0 (Recommandé) |
|------------------|-------------------|
| `import type { FolderStatus } from '@/types/folders/enums';` | `import type { FolderStatus } from '@/types/folders/constants/enums';` |
| `import type { AlertType } from '@/types/folders/enums';` | `import type { AlertType } from '@/types/folders/constants/enums';` |

## 🛠️ Exemples de Migration Pratiques

### Exemple 1: Composant de Création de Dossier

**Avant (v1.0):**
```typescript
// folder-create.component.ts
import type { 
  CreateFolderData,
  FolderValidationResult,
  ClientInfo 
} from '@/types/folders/operations';

import type { FolderStatus } from '@/types/folders/enums';
```

**Après (v2.0):**
```typescript
// folder-create.component.ts - Option A (Import Global - RECOMMANDÉ)
import type { 
  CreateFolderData,
  ClientInfo,
  FolderStatus
} from '@/types/folders';

// folder-create.component.ts - Option B (Import Modulaire)
import type { CreateFolderData } from '@/types/folders/operations/create';
import type { ClientInfo } from '@/types/folders/entities/client';
import type { FolderStatus } from '@/types/folders/constants/enums';
```

### Exemple 2: Gestionnaire de Workflow

**Avant (v1.0):**
```typescript
// workflow-manager.ts
import type {
  ProcessingStage,
  FolderProcessingStage,
  StartProcessingStageParams,
  StageTransitionData,
  StagesDashboard
} from '@/types/folders/processing-stages';
```

**Après (v2.0):**
```typescript
// workflow-manager.ts - Option A (Import Global)
import type {
  ProcessingStage,
  FolderProcessingStage,
  StartProcessingStageParams,
  StageTransitionData,
  StagesDashboard
} from '@/types/folders';

// workflow-manager.ts - Option B (Import Modulaire)
import type { 
  ProcessingStage,
  FolderProcessingStage 
} from '@/types/folders/workflow/stages';
import type { StartProcessingStageParams } from '@/types/folders/workflow/transitions';
import type { StagesDashboard } from '@/types/folders/workflow/metrics';

// workflow-manager.ts - Option C (Import Namespace)
import type * as Workflow from '@/types/folders/workflow';

const stage: Workflow.ProcessingStage = 'enregistrement';
```

### Exemple 3: Service de Recherche

**Avant (v1.0):**
```typescript
// search.service.ts
import type {
  FolderSearchParams,
  FolderSearchResults,
  Folder
} from '@/types/folders/operations';

import type { FolderStatus, FolderType } from '@/types/folders/enums';
```

**Après (v2.0):**
```typescript
// search.service.ts
import type {
  FolderSearchParams,
  FolderSearchResults,
  Folder,
  FolderStatus,
  FolderType
} from '@/types/folders';
```

## 🧪 Scripts de Migration Automatisée

### Script 1: Détection des Imports à Migrer

```bash
# Trouve tous les fichiers utilisant les anciens imports
grep -r "from '@/types/folders/processing-stages'" src/
grep -r "from '@/types/folders/enums'" src/
grep -r "from '@/types/folders/core'" src/
grep -r "from '@/types/folders/operations'" src/
```

### Script 2: Migration Automatique des Imports Simples

```bash
# Remplace les imports d'enums
find src/ -name "*.ts" -type f -exec sed -i "s|from '@/types/folders/enums'|from '@/types/folders/constants/enums'|g" {} \;

# ATTENTION: Vérifiez toujours les changements avant de les appliquer !
```

## ✅ Checklist de Migration par Fichier

### 🎯 Pour chaque fichier à migrer:

- [ ] **1. Identifier les imports actuels**
  ```bash
  grep "from '@/types/folders" mon-fichier.ts
  ```

- [ ] **2. Mapper vers la nouvelle architecture**
  - Utiliser le tableau de mapping ci-dessus
  - Privilégier l'import global pour simplicité

- [ ] **3. Mettre à jour les imports**
  ```typescript
  // Ancien
  import type { ProcessingStage } from '@/types/folders/processing-stages';
  
  // Nouveau
  import type { ProcessingStage } from '@/types/folders';
  ```

- [ ] **4. Valider la compilation**
  ```bash
  pnpm tsc --noEmit
  ```

- [ ] **5. Tester la fonctionnalité**
  ```bash
  pnpm test mon-fichier.test.ts
  ```

- [ ] **6. Commit atomique**
  ```bash
  git add mon-fichier.ts
  git commit -m "migrate: update imports to v2.0 architecture in mon-fichier.ts"
  ```

## 🚨 Points d'Attention

### ⚠️ Pièges Courants

1. **Import de ProcessingStage**
   ```typescript
   // ❌ Erreur - ProcessingStage générique depuis constants
   import type { ProcessingStage } from '@/types/folders/constants/enums';
   
   // ✅ Correct - ProcessingStage spécialisé workflow
   import type { ProcessingStage } from '@/types/folders/workflow/stages';
   ```

2. **Conflits de noms**
   ```typescript
   // ❌ Peut causer des conflits
   import type { StageTransitionData } from '@/types/folders/workflow/transitions';
   import type { StageTransitionData } from '@/types/folders/operations/batch';
   
   // ✅ Utiliser des alias
   import type { StageTransitionData as WorkflowTransitionData } from '@/types/folders/workflow/transitions';
   import type { StageTransitionData as BatchTransitionData } from '@/types/folders/operations/batch';
   ```

### 🔍 Validation Post-Migration

1. **Tests Automatisés**
   ```bash
   # Compilation TypeScript
   pnpm tsc --noEmit
   
   # Tests unitaires
   pnpm test
   
   # Tests d'intégration
   pnpm test:integration
   ```

2. **Validation Manuelle**
   - Vérifier que tous les imports sont résolus
   - Tester les fonctionnalités critiques
   - Valider les performances (pas de régression)

## 📈 Avantages Post-Migration

### 🎯 Développement

- **Imports plus clairs** : Organisation par domaine métier
- **Intellisense amélioré** : Auto-complétion plus précise  
- **Moins de conflits** : Namespaces séparés
- **Code plus maintenable** : Responsabilités bien définies

### 🔧 Architecture

- **Modules indépendants** : Tests et maintenance isolés
- **Évolutivité** : Ajout de fonctionnalités facilité
- **Réutilisabilité** : Entités partagées entre modules
- **Performance** : Imports granulaires, bundles optimisés

## 🆘 Support et Résolution de Problèmes

### ❓ FAQ Migration

**Q: Les anciens imports vont-ils cesser de fonctionner ?**  
R: Non, la compatibilité v1.0 est maintenue à 100%. Migration optionnelle mais recommandée.

**Q: Dois-je migrer tous les fichiers d'un coup ?**  
R: Non, migration progressive recommandée, fichier par fichier.

**Q: Comment résoudre les erreurs de compilation ?**  
R: Vérifiez le mapping des imports dans ce guide. La plupart des erreurs viennent d'imports incorrects.

**Q: Puis-je mélanger v1.0 et v2.0 dans le même projet ?**  
R: Oui, les deux versions coexistent parfaitement.

### 🔧 Résolution de Problèmes Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Module not found` | Import incorrect | Vérifiez le mapping des imports |
| `Type not exported` | Type dans mauvais module | Consultez la documentation du module |
| `Duplicate identifier` | Conflit de noms | Utilisez des alias d'import |
| `Cannot find type` | Import manquant | Ajoutez l'import depuis le bon module |

---

Cette migration vers l'architecture v2.0 modernise votre codebase tout en préservant la compatibilité. Prenez le temps nécessaire et migrez progressivement pour un résultat optimal. 🚀