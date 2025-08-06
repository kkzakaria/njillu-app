# Types Bills of Lading (BL) - Documentation

Ce module fournit un système de types TypeScript complet pour la gestion des Bills of Lading (Connaissements) dans une application de logistique maritime.

## 📋 Vue d'ensemble

Le système BL est organisé en **12 modules spécialisés** pour une architecture modulaire et maintenable :

```
types/bl/
├── enums.ts          # Énumérations et constantes
├── core.ts           # Interfaces principales (BillOfLading, BLContainer, etc.)
├── charges.ts        # Gestion des frais de transport
├── views.ts          # Vues dashboard et recherche
├── parameters.ts     # Types de base et paramètres d'opérations
├── crud.ts           # Opérations de création/modification
├── workflows.ts      # Gestion des changements d'état
├── validation.ts     # Règles et résultats de validation
├── batch.ts          # Opérations en lot
├── audit.ts          # Traçabilité et historique
├── integration.ts    # Intégration avec systèmes externes
└── index.ts          # Point d'entrée avec tous les exports
```

## 🚀 Installation et utilisation

### Import principal (recommandé)
```typescript
import type { BillOfLading, CreateBLData, BLStatus } from '@/types/bl';
```

### Imports modulaires
```typescript
import type * as BLCore from '@/types/bl/core';
import type * as BLCrud from '@/types/bl/crud';
import type * as BLWorkflows from '@/types/bl/workflows';
```

### Imports spécifiques
```typescript
import type { BLValidationResult } from '@/types/bl/validation';
import type { BLBatchOperation } from '@/types/bl/batch';
```

## 📖 Guide des modules

### 🔧 Modules de base
- **[enums.ts](./enums.ts)** - Statuts, termes de transport, types de frais
- **[core.ts](./core.ts)** - Structures de données principales
- **[parameters.ts](./parameters.ts)** - Types union et paramètres d'opérations

### 🔄 Modules opérationnels
- **[crud.ts](./crud.ts)** - Création, modification des BL et conteneurs
- **[workflows.ts](./workflows.ts)** - Transitions d'état et actions disponibles
- **[validation.ts](./validation.ts)** - Règles de validation business

### ⚡ Modules avancés
- **[batch.ts](./batch.ts)** - Opérations groupées sur plusieurs BL
- **[audit.ts](./audit.ts)** - Journalisation et traçabilité
- **[integration.ts](./integration.ts)** - Synchronisation avec ERP/TMS

### 💰 Modules métier
- **[charges.ts](./charges.ts)** - Gestion financière et frais de transport
- **[views.ts](./views.ts)** - Vues dashboard et rapports

## 🎯 Concepts clés

### Structure d'un Bill of Lading
```typescript
interface BillOfLading {
  // Identification unique
  id: string;
  bl_number: string;
  
  // Parties impliquées
  shipper_info: PartyInfo;
  consignee_info: PartyInfo;
  notify_party_info?: PartyInfo;
  
  // Transport
  shipping_company_id: string;
  port_of_loading: string;
  port_of_discharge: string;
  
  // Statut et workflow
  status: BLStatus;
  
  // Conteneurs et cargaison
  containers: BLContainer[];
  
  // Frais associés
  freight_charges: BLFreightCharge[];
}
```

### Workflow des statuts
```
draft → issued → shipped → discharged → delivered
                    ↓
                cancelled
```

### Types d'opérations supportées
- **CRUD** : Création, lecture, mise à jour, suppression
- **Workflow** : Changements d'état avec validation
- **Batch** : Opérations groupées sur plusieurs BL
- **Audit** : Traçabilité complète des modifications
- **Integration** : Synchronisation avec systèmes externes

## 📊 Métriques du système

| Module | Lignes | Types | Responsabilité |
|--------|--------|--------|----------------|
| `core.ts` | 302 | 8 | Structures principales |
| `views.ts` | 311 | 9 | Vues et rapports |
| `crud.ts` | 161 | 4 | Opérations CRUD |
| `charges.ts` | 143 | 6 | Gestion financière |
| `parameters.ts` | 111 | 8 | Types de base |
| `enums.ts` | 94 | 8 | Énumérations |
| `audit.ts` | 66 | 2 | Traçabilité |
| `integration.ts` | 63 | 2 | API externes |
| `validation.ts` | 62 | 2 | Validation |
| `batch.ts` | 59 | 2 | Opérations lot |
| `workflows.ts` | 51 | 3 | États et transitions |

**Total** : 1 423 lignes, 53 types exportés

## 🔒 Sécurité des types

- ✅ **100% TypeScript strict** - Aucun type `any`
- ✅ **Unions discriminées** - Type safety avec `BLFieldValue`
- ✅ **Validation runtime** - Types guards et validation business
- ✅ **Immutabilité** - Interfaces readonly quand approprié

## 🚦 État de développement

- ✅ **Architecture modulaire** - Terminée
- ✅ **Types de base** - Stables
- ✅ **Opérations CRUD** - Production ready
- ✅ **Workflow management** - Implémenté
- ✅ **Validation système** - Opérationnelle
- ✅ **Opérations batch** - Disponibles
- ✅ **Audit trail** - Fonctionnel
- ✅ **API intégration** - Prête

## 🤝 Contribution

### Conventions de nommage
- **Interfaces** : PascalCase (ex: `BillOfLading`)
- **Types union** : PascalCase (ex: `BLStatus`)
- **Paramètres** : camelCase avec suffixe `Params` (ex: `StatusChangeParams`)
- **Résultats** : camelCase avec suffixe `Result` (ex: `BLValidationResult`)

### Ajout de nouveaux types
1. Identifier le module approprié
2. Respecter les patterns existants
3. Ajouter l'export dans `index.ts`
4. Documenter les nouveaux types
5. Maintenir la compatibilité backward

## 📚 Ressources supplémentaires

- **[Guide d'exemples](./EXAMPLES.md)** - Cas d'usage concrets
- **[Migration guide](../MIGRATION_GUIDE.md)** - Migration depuis v1.0
- **[Type system overview](../README.md)** - Vue d'ensemble du système de types

---

*Cette documentation est générée automatiquement et mise à jour avec chaque version du système de types.*