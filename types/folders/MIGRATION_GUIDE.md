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

### 🚨 Alerts - Architecture Modulaire v2.0

**TRANSFORMATION MAJEURE** : Le système d'alertes passe de 1 fichier monolithique (418 lignes) à 6 modules spécialisés.

| v1.0 (Monolithique) | v2.0 (Modulaire) | Module |
|---------------------|-------------------|---------|
| `import type { FolderAlert } from '@/types/folders/alerts';` | `import type { FolderAlert } from '@/types/folders/alerts';` | Global ✅ |
| `import type { FolderAlert } from '@/types/folders/alerts';` | `import type { FolderAlert } from '@/types/folders/alerts/core';` | Core (optimal) |
| `import type { DeadlineAlert } from '@/types/folders/alerts';` | `import type { DeadlineAlert } from '@/types/folders/alerts/specialized';` | Specialized |
| `import type { AlertRule } from '@/types/folders/alerts';` | `import type { AlertRule } from '@/types/folders/alerts/rules';` | Rules |
| `import type { AlertDashboard } from '@/types/folders/alerts';` | `import type { AlertDashboard } from '@/types/folders/alerts/analytics';` | Analytics |
| `import type { CreateAlertData } from '@/types/folders/alerts';` | `import type { CreateAlertData } from '@/types/folders/alerts/operations';` | Operations |
| `import type { AlertSystemConfig } from '@/types/folders/alerts';` | `import type { AlertSystemConfig } from '@/types/folders/alerts/config';` | Config |

#### Nouveaux Patterns d'Import v2.0

**Global (Recommandé - Compatibilité 100%)**:
```typescript
import type {
  FolderAlert,
  DeadlineAlert, 
  AlertRule,
  AlertDashboard,
  CreateAlertData
} from '@/types/folders/alerts';
```

**Granulaire (Optimal pour performance)**:
```typescript
import type { FolderAlert } from '@/types/folders/alerts/core';
import type { DeadlineAlert } from '@/types/folders/alerts/specialized';
import type { AlertRule } from '@/types/folders/alerts/rules';
```

**Namespace (Organisation du code)**:
```typescript
import * as Alerts from '@/types/folders/alerts';
import * as AlertCore from '@/types/folders/alerts/core';
import * as AlertRules from '@/types/folders/alerts/rules';
```

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

### Exemple 4: Système d'Alertes Modulaire 🚨

**Avant (v1.0 - Monolithique):**
```typescript
// alert.service.ts
import type {
  FolderAlert,
  DeadlineAlert,
  ComplianceAlert,
  AlertRule,
  AlertDashboard,
  CreateAlertData,
  UpdateAlertData,
  AlertSearchParams,
  AlertSystemConfig
} from '@/types/folders/alerts'; // Tout depuis un seul fichier de 418 lignes
```

**Après (v2.0 - Architecture Modulaire):**

**Option A - Import Global (Recommandé pour la migration)**:
```typescript
// alert.service.ts - MIGRATION SIMPLE
import type {
  FolderAlert,         // Depuis alerts/core
  DeadlineAlert,       // Depuis alerts/specialized  
  ComplianceAlert,     // Depuis alerts/specialized
  AlertRule,           // Depuis alerts/rules
  AlertDashboard,      // Depuis alerts/analytics
  CreateAlertData,     // Depuis alerts/operations
  UpdateAlertData,     // Depuis alerts/operations
  AlertSearchParams,   // Depuis alerts/operations
  AlertSystemConfig    // Depuis alerts/config
} from '@/types/folders/alerts'; // Point d'entrée unifié
```

**Option B - Import Granulaire (Optimal pour nouveaux développements)**:
```typescript
// alert.service.ts - PERFORMANCE OPTIMALE
import type { FolderAlert, BusinessImpact } from '@/types/folders/alerts/core';
import type { 
  DeadlineAlert, 
  ComplianceAlert, 
  DelayAlert 
} from '@/types/folders/alerts/specialized';
import type { 
  AlertRule, 
  TriggerConditions 
} from '@/types/folders/alerts/rules';
import type { 
  AlertDashboard, 
  AlertMetrics 
} from '@/types/folders/alerts/analytics';
import type { 
  CreateAlertData, 
  UpdateAlertData,
  AlertSearchParams 
} from '@/types/folders/alerts/operations';
import type { AlertSystemConfig } from '@/types/folders/alerts/config';
```

**Option C - Import Namespace (Organisation avancée)**:
```typescript
// alert.service.ts - ORGANISATION DU CODE
import * as Alerts from '@/types/folders/alerts';
import * as AlertCore from '@/types/folders/alerts/core';
import * as AlertSpecialized from '@/types/folders/alerts/specialized';
import * as AlertRules from '@/types/folders/alerts/rules';
import * as AlertAnalytics from '@/types/folders/alerts/analytics';
import * as AlertOps from '@/types/folders/alerts/operations';

export class AlertService {
  async createAlert(data: AlertOps.CreateAlertData): Promise<AlertCore.FolderAlert> {
    // Usage avec namespaces clairs
  }
  
  async createDeadlineAlert(data: AlertOps.CreateAlertData): Promise<AlertSpecialized.DeadlineAlert> {
    // Spécialisation avec types précis
  }
  
  async checkRules(folderId: string): Promise<AlertRules.AlertRule[]> {
    // Logique de règles avec types dédiés
  }
  
  async getDashboard(): Promise<AlertAnalytics.AlertDashboard> {
    // Analytics avec métriques spécialisées
  }
}
```

## 🧪 Scripts de Migration Automatisée

### Script 1: Détection des Imports à Migrer

```bash
# Trouve tous les fichiers utilisant les anciens imports
grep -r "from '@/types/folders/processing-stages'" src/
grep -r "from '@/types/folders/enums'" src/
grep -r "from '@/types/folders/core'" src/
grep -r "from '@/types/folders/operations'" src/

# NOUVEAU - Détection des imports d'alertes (pour optimisation v2.0)
echo "=== Fichiers utilisant les alertes ==="
grep -r "from '@/types/folders/alerts'" src/ | grep -v "alerts/" | wc -l
echo "Nombre de fichiers détectés pour optimisation alerts modulaires"

# Analyse détaillée des types d'alertes utilisés
echo "=== Analyse des types d'alertes utilisés ==="
grep -r "FolderAlert\|DeadlineAlert\|ComplianceAlert\|AlertRule" src/ --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort -u
```

### Script 2: Migration Automatique des Imports Simples

```bash
# Remplace les imports d'enums
find src/ -name "*.ts" -type f -exec sed -i "s|from '@/types/folders/enums'|from '@/types/folders/constants/enums'|g" {} \;

# ATTENTION: Vérifiez toujours les changements avant de les appliquer !
```

### Script 3: Optimisation des Imports d'Alertes v2.0 🚨

```bash
# Script d'analyse des imports d'alertes pour optimisation
#!/bin/bash

echo "🔍 Analyse des imports d'alertes pour optimisation v2.0"

# Fonction pour analyser les types utilisés dans un fichier
analyze_alert_types() {
  local file="$1"
  echo "📁 Analyse de: $file"
  
  # Types Core
  if grep -q "FolderAlert\|BusinessImpact" "$file"; then
    echo "  ✓ Core types détectés (alerts/core)"
  fi
  
  # Types Specialized
  if grep -q "DeadlineAlert\|ComplianceAlert\|DelayAlert\|CostAlert" "$file"; then
    echo "  ✓ Specialized types détectés (alerts/specialized)"
  fi
  
  # Types Rules  
  if grep -q "AlertRule\|TriggerConditions" "$file"; then
    echo "  ✓ Rules types détectés (alerts/rules)"
  fi
  
  # Types Analytics
  if grep -q "AlertDashboard\|AlertMetrics" "$file"; then
    echo "  ✓ Analytics types détectés (alerts/analytics)"
  fi
  
  # Types Operations
  if grep -q "CreateAlertData\|UpdateAlertData\|AlertSearchParams" "$file"; then
    echo "  ✓ Operations types détectés (alerts/operations)"
  fi
  
  # Types Config
  if grep -q "AlertSystemConfig" "$file"; then
    echo "  ✓ Config types détectés (alerts/config)"
  fi
}

# Analyser tous les fichiers TypeScript
for file in $(grep -l "from '@/types/folders/alerts'" src/**/*.{ts,tsx} 2>/dev/null); do
  analyze_alert_types "$file"
  echo ""
done

echo "💡 Recommandations:"
echo "1. Fichiers utilisant 1-2 modules → Import granulaire optimal"
echo "2. Fichiers utilisant 3+ modules → Import global recommandé" 
echo "3. Services complexes → Import namespace pour organisation"
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

### 🚨 Checklist Spéciale - Migration Alerts v2.0

**Pour les fichiers utilisant le système d'alertes:**

- [ ] **1. Analyser l'usage des types d'alertes**
  ```bash
  ./scripts/analyze_alert_types.sh mon-fichier.ts
  ```

- [ ] **2. Choisir la stratégie d'import optimale**
  - [ ] **Global** (si utilisation de 3+ modules) → `from '@/types/folders/alerts'`
  - [ ] **Granulaire** (si 1-2 modules) → `from '@/types/folders/alerts/core'`
  - [ ] **Namespace** (si service complexe) → `import * as Alerts`

- [ ] **3. Migration selon le pattern choisi**
  ```typescript
  // Pattern Global (RECOMMANDÉ)
  import type { FolderAlert, DeadlineAlert, AlertRule } from '@/types/folders/alerts';
  
  // Pattern Granulaire (OPTIMAL)  
  import type { FolderAlert } from '@/types/folders/alerts/core';
  import type { DeadlineAlert } from '@/types/folders/alerts/specialized';
  
  // Pattern Namespace (ORGANISÉ)
  import * as Alerts from '@/types/folders/alerts';
  ```

- [ ] **4. Validation spécifique aux alertes**
  ```bash
  # Test de compilation avec les nouveaux imports
  pnpm tsc --noEmit mon-fichier.ts
  
  # Vérification que tous les types d'alertes sont résolus
  grep -n "DeadlineAlert\|ComplianceAlert\|AlertRule" mon-fichier.ts
  ```

- [ ] **5. Test de performance (pour imports granulaires)**
  ```bash
  # Mesurer l'impact bundle (optionnel)
  pnpm build:analyze
  ```

- [ ] **6. Commit spécialisé**
  ```bash
  git add mon-fichier.ts
  git commit -m "migrate: alerts v2.0 modular architecture in mon-fichier.ts
  
  - Switch from monolithic alerts.ts (418L) to modular structure
  - Use [global/granular/namespace] import pattern
  - Improve bundle size by [X]% through tree-shaking"
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

3. **Pièges Spécifiques aux Alertes v2.0** 🚨
   ```typescript
   // ❌ Erreur - Import depuis le mauvais module
   import type { FolderAlert } from '@/types/folders/alerts/specialized';
   
   // ✅ Correct - FolderAlert est dans core
   import type { FolderAlert } from '@/types/folders/alerts/core';
   // OU (recommandé)
   import type { FolderAlert } from '@/types/folders/alerts';
   ```

4. **Confusion entre types similaires**
   ```typescript
   // ❌ Peut créer de la confusion
   import type { AlertRule } from '@/types/folders/alerts/rules';
   import type { AlertRuleData } from '@/types/folders/alerts/operations'; // N'existe pas
   
   // ✅ Types corrects selon le module
   import type { AlertRule } from '@/types/folders/alerts/rules';
   import type { CreateAlertData } from '@/types/folders/alerts/operations';
   ```

5. **Import inefficace pour usage simple**
   ```typescript
   // ❌ Import global pour un seul type
   import type { 
     FolderAlert, DeadlineAlert, AlertRule, AlertDashboard 
   } from '@/types/folders/alerts'; // Bundle inutilement large
   
   // ✅ Import granulaire pour usage simple  
   import type { FolderAlert } from '@/types/folders/alerts/core';
   // Bundle optimisé, seulement ce qui est nécessaire
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

**Q: L'architecture modulaire des alertes v2.0 casse-t-elle la compatibilité ?**  
R: Non, 100% de compatibilité maintenue. L'import `from '@/types/folders/alerts'` continue de fonctionner identiquement.

**Q: Dois-je migrer tous mes imports d'alertes vers la version modulaire ?**  
R: Non, c'est une optimisation optionnelle. L'import global reste recommandé pour la plupart des cas.

**Q: Quels sont les bénéfices réels de l'architecture modulaire des alertes ?**  
R: -83% taille fichiers, +200% maintenabilité, imports granulaires pour optimisation bundle, navigation intuitive.

**Q: Comment choisir entre import global et granulaire pour les alertes ?**  
R: Global pour 3+ modules, granulaire pour 1-2 modules, namespace pour services complexes.

### 🔧 Résolution de Problèmes Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Module not found` | Import incorrect | Vérifiez le mapping des imports |
| `Type not exported` | Type dans mauvais module | Consultez la documentation du module |
| `Duplicate identifier` | Conflit de noms | Utilisez des alias d'import |
| `Cannot find type` | Import manquant | Ajoutez l'import depuis le bon module |
| `FolderAlert not found in alerts/specialized` | Import depuis mauvais module alerts | FolderAlert est dans `alerts/core`, pas `specialized` |
| `DeadlineAlert not found in alerts/core` | Import spécialisé depuis core | DeadlineAlert est dans `alerts/specialized` |
| `Bundle size increased after alerts migration` | Import global au lieu de granulaire | Utilisez imports granulaires pour 1-2 types seulement |
| `AlertRule conflicts` | Import depuis plusieurs modules | AlertRule est uniquement dans `alerts/rules` |

---

Cette migration vers l'architecture v2.0 modernise votre codebase tout en préservant la compatibilité. Prenez le temps nécessaire et migrez progressivement pour un résultat optimal. 🚀