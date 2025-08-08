# Types Containers - Documentation

Ce module fournit un système de types TypeScript complet pour la gestion des conteneurs et du suivi des arrivées dans une application de logistique maritime.

## 📋 Vue d'ensemble

Le système Containers est organisé en **14 modules spécialisés** pour une architecture modulaire et maintenable :

```
types/containers/
├── enums.ts                # Énumérations et constantes
├── tracking-core.ts        # Interfaces principales (ContainerArrivalTracking, History)
├── metrics.ts             # Métriques de performance et KPI
├── alerts.ts              # Système d'alertes (retards, ETA manquant)
├── notifications.ts       # Configuration et historique des notifications
├── tracking-operations.ts # Opérations sur le tracking et recherche
├── crud.ts                # Opérations de création/modification
├── integration.ts         # Intégration avec compagnies maritimes
├── automation.ts          # Règles d'automatisation et exécution
├── validation.ts          # Règles et résultats de validation
├── search.ts              # Recherche et filtrage avancés
├── workflows.ts           # Gestion des transitions d'état
├── batch.ts               # Opérations en lot et traitement groupé
├── dashboards.ts          # Vues dashboard et analyses
├── dashboard-types.ts     # Configuration widgets et filtres
├── base-types.ts          # Types union pour remplacer 'any'
└── index.ts               # Point d'entrée avec tous les exports
```

## 🚀 Installation et utilisation

### Import principal (recommandé)
```typescript
import type { 
  ContainerArrivalTracking, 
  CreateArrivalTrackingData, 
  ContainerArrivalStatus 
} from '@/types/containers';
```

### Imports modulaires
```typescript
import type * as ContainerCore from '@/types/containers/tracking-core';
import type * as ContainerCrud from '@/types/containers/crud';
import type * as ContainerMetrics from '@/types/containers/metrics';
```

### Imports spécifiques
```typescript
import type { ArrivalPerformanceMetrics } from '@/types/containers/metrics';
import type { ContainerDelayAlert } from '@/types/containers/alerts';
import type { ShippingLineIntegration } from '@/types/containers/integration';
```

## 📖 Guide des modules

### 🔧 Modules de base
- **[enums.ts](./enums.ts)** - Statuts d'arrivée, niveaux d'urgence, sévérité des retards
- **[tracking-core.ts](./tracking-core.ts)** - Structures de données principales et historique
- **[base-types.ts](./base-types.ts)** - Types union et utilitaires (remplacement des 'any')

### 📊 Modules de suivi et métriques
- **[metrics.ts](./metrics.ts)** - Analyses de performance et KPI d'arrivée
- **[alerts.ts](./alerts.ts)** - Système d'alertes pour retards et ETA manquant
- **[notifications.ts](./notifications.ts)** - Configuration et historique des notifications

### 🔄 Modules opérationnels
- **[crud.ts](./crud.ts)** - Création et modification des données d'arrivée
- **[tracking-operations.ts](./tracking-operations.ts)** - Opérations sur le tracking et recherche
- **[workflows.ts](./workflows.ts)** - Transitions d'état et actions disponibles

### ⚡ Modules avancés
- **[integration.ts](./integration.ts)** - Synchronisation avec compagnies maritimes
- **[automation.ts](./automation.ts)** - Règles d'automatisation et exécution
- **[validation.ts](./validation.ts)** - Contrôle qualité et règles de validation
- **[batch.ts](./batch.ts)** - Opérations groupées et traitement par lots
- **[search.ts](./search.ts)** - Recherche et filtrage avancés multi-critères

### 🎨 Modules d'affichage
- **[dashboards.ts](./dashboards.ts)** - Vues dashboard et rapports analytiques
- **[dashboard-types.ts](./dashboard-types.ts)** - Configuration widgets et filtres

## 🎯 Concepts clés

### Structure d'un Container Arrival Tracking
```typescript
interface ContainerArrivalTracking {
  // Identification unique
  container_id: string;
  container_number: string;
  bl_id: string;
  bl_number: string;
  
  // Compagnie maritime
  shipping_company_id: string;
  shipping_company_name: string;
  
  // Localisation et dates
  port_of_discharge: string;
  estimated_arrival_date?: string;
  actual_arrival_date?: string;
  
  // Statut et indicateurs
  arrival_status: ContainerArrivalStatus;
  urgency_level: ContainerUrgencyLevel;
  health_status: ContainerHealthStatus;
  
  // Calculs de délais
  delay_days?: number;
  delay_severity?: DelaySeverity;
}
```

### Workflow des statuts d'arrivée
```
scheduled → in_transit → port_arrival → customs_clearance → ready_for_delivery → delivered
                ↓                ↓               ↓                    ↓
            delayed         port_delay      customs_delay      delivery_delay
```

### Types d'opérations supportées
- **CRUD** : Création, lecture, mise à jour des données d'arrivée
- **Tracking** : Suivi en temps réel avec historique des changements
- **Alerts** : Système d'alertes automatiques pour retards et ETA manquant
- **Notifications** : Communications multicanaux (email, SMS, push, webhook)
- **Integration** : Synchronisation avec systèmes des compagnies maritimes
- **Automation** : Règles métier automatisées avec actions déclenchées
- **Validation** : Contrôle qualité des données avec corrections automatiques
- **Analytics** : Tableaux de bord et métriques de performance

## 📊 Métriques du système

| Module | Lignes | Types | Responsabilité |
|--------|--------|--------|----------------|
| `tracking-core.ts` | 119 | 2 | Structures principales et historique |
| `dashboards.ts` | 425 | 9 | Vues dashboard et analyses |
| `integration.ts` | 170 | 2 | API compagnies maritimes |
| `automation.ts` | 124 | 2 | Règles métier automatisées |
| `notifications.ts` | 158 | 3 | Configuration et historique notifications |
| `tracking-operations.ts` | 148 | 4 | Opérations tracking et recherche |
| `crud.ts` | 97 | 3 | Opérations CRUD de base |
| `validation.ts` | 115 | 2 | Contrôle qualité |
| `search.ts` | 97 | 1 | Recherche avancée |
| `workflows.ts` | 108 | 3 | États et transitions |
| `batch.ts` | 103 | 2 | Opérations groupées |
| `metrics.ts` | 96 | 2 | Métriques et KPI |
| `alerts.ts` | 157 | 3 | Système d'alertes |
| `dashboard-types.ts` | 248 | 16 | Configuration widgets |
| `base-types.ts` | 246 | 15 | Types union et utilitaires |
| `enums.ts` | 94 | 8 | Énumérations |

**Total** : 2 405 lignes, 75 types exportés

## 🔒 Sécurité des types

- ✅ **100% TypeScript strict** - Aucun type `any` (13 occurrences éliminées)
- ✅ **Unions discriminées** - Type safety avec `ContainerFieldValue` et autres unions
- ✅ **Validation runtime** - Type guards et validation business
- ✅ **Architecture modulaire** - Séparation claire des responsabilités

## 🚦 État de développement

- ✅ **Architecture modulaire** - Terminée (14 modules spécialisés)
- ✅ **Types de base** - Stables et sans 'any'
- ✅ **Opérations CRUD** - Production ready
- ✅ **Système d'alertes** - Implémenté avec escalade
- ✅ **Notifications multicanaux** - Opérationnel
- ✅ **Intégrations externes** - API compagnies maritimes
- ✅ **Automatisation** - Règles métier avec actions
- ✅ **Validation qualité** - Contrôles et corrections automatiques
- ✅ **Analytics & dashboards** - Vues spécialisées par rôle
- ✅ **Recherche avancée** - Filtrage multi-critères

## 🎨 Fonctionnalités principales

### Suivi des arrivées en temps réel
- Tracking automatique des conteneurs depuis l'embarquement
- Mise à jour des ETA avec historique des changements
- Calcul automatique des retards et niveaux d'urgence

### Système d'alertes intelligent
- **Alertes de retard** : Detection automatique avec seuils configurables
- **ETA manquant** : Suivi proactif des conteneurs sans estimation
- **Escalade automatique** : Processus d'escalade basé sur la sévérité

### Intégrations compagnies maritimes
- Support multi-protocoles (API REST, EDI, FTP, email parsing)
- Mapping de données configurable par compagnie
- Synchronisation automatique avec monitoring qualité

### Notifications multicanaux
- Email, SMS, Push notifications, Webhooks
- Templates personnalisables et localisés
- Historique complet avec métriques d'engagement

### Analytics et reporting
- Dashboards spécialisés par rôle (Manager, Opérateur, Client)
- Métriques de performance KPI
- Analyses comparatives et prédictives

## 🤝 Contribution

### Conventions de nommage
- **Interfaces** : PascalCase (ex: `ContainerArrivalTracking`)
- **Types union** : PascalCase (ex: `ContainerArrivalStatus`)
- **Paramètres** : camelCase avec suffixe `Params` (ex: `SearchParams`)
- **Résultats** : camelCase avec suffixe `Result` (ex: `ValidationResult`)

### Ajout de nouveaux types
1. Identifier le module approprié selon la responsabilité
2. Respecter les patterns existants et architecture modulaire
3. Ajouter l'export dans `index.ts` avec documentation
4. Maintenir la compatibilité backward avec les versions précédentes
5. Utiliser les types union de `base-types.ts` au lieu de `any`

## 📚 Ressources supplémentaires

- **[Guide d'exemples](./EXAMPLES.md)** - Cas d'usage concrets et scénarios réels
- **[Migration guide](../MIGRATION_GUIDE.md)** - Migration depuis v1.0
- **[Type system overview](../README.md)** - Vue d'ensemble du système de types

---

*Cette documentation est générée automatiquement et mise à jour avec chaque version du système de types.*