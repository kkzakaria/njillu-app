# 🔗 Guide d'Intégration nuqs

Ce guide documente l'intégration de **nuqs** (Next.js URL Query State) dans le projet pour une gestion d'état URL type-safe et réactive.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Migration](#migration)
- [API Reference](#api-reference)
- [Patterns d'usage](#patterns-dusage)
- [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

### Pourquoi nuqs ?

- **Type Safety** : Paramètres URL type-safe avec validation
- **Réactivité** : Synchronisation automatique URL ↔ État React
- **Performance** : Debouncing et optimisations intégrées
- **Sharability** : URLs partageables avec état complet
- **Next.js Ready** : Intégration native avec App Router

### Avant / Après

```tsx
// ❌ Avant - Manuel et fragile
const searchParams = useSearchParams();
const query = searchParams.get('q') || '';
const router = useRouter();

const updateQuery = (newQuery: string) => {
  const params = new URLSearchParams(searchParams);
  params.set('q', newQuery);
  router.push(`?${params.toString()}`);
};

// ✅ Après - Type-safe et automatique
const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
```

## 🏗️ Architecture

### Structure des hooks

```
hooks/nuqs/
├── index.ts                    # Exports principaux
├── types.ts                    # Types partagés
├── parsers.ts                  # Parsers et validateurs
├── use-folder-filters-url.ts   # Filtres de dossiers
├── use-client-search-url.ts    # Recherche clients
├── use-pagination-url.ts       # Pagination
└── use-search-url.ts           # Recherche générique
```

### Intégration avec Zustand

```typescript
// Store hybride : UI (Zustand) + URL (nuqs)
export function useFolderState() {
  const uiState = useFolderStoreNuqs();  // Local UI state
  const urlState = useFolderFiltersUrl(); // URL synchronized state
  
  return { ui: uiState, url: urlState, ...actions };
}
```

### Provider Setup

```tsx
// app/[locale]/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function LocaleLayout({ children }) {
  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
```

## 🔄 Migration

### 1. Migration des filtres de dossiers

```tsx
// Avant
const [filters, setFilters] = useState<FolderFilters>({});

// Après
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url';
const { filters, updateFilters, activeFiltersCount } = useFolderFiltersUrl();
```

### 2. Migration de la recherche

```tsx
// Avant
const searchParams = useSearchParams();
const query = searchParams.get('q') || '';

// Après
import { useSearchUrl } from '@/hooks/nuqs/use-search-url';
const { query, setQuery, debouncedQuery } = useSearchUrl();
```

### 3. Migration de la pagination

```tsx
// Avant - gestion manuelle complexe
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);

// Après - intégré et intelligent
import { usePaginationUrl } from '@/hooks/nuqs/use-pagination-url';
const { page, pageSize, setPage, canGoNext, nextPage } = usePaginationUrl();
```

## 📚 API Reference

### `useFolderFiltersUrl()`

Gestion des filtres de dossiers avec synchronisation URL.

```typescript
const {
  // État
  filters: FolderFilters,
  statusCategory: StatusCategory,
  activeFiltersCount: number,
  
  // Actions
  updateFilters: (filters: Partial<FolderFilters>) => void,
  clearAllFilters: () => void,
  setStatusCategory: (category: StatusCategory) => void,
} = useFolderFiltersUrl();
```

**Paramètres URL générés :**
- `status` : Catégorie de statut (active, completed, archived, deleted)
- `client_search` : Recherche textuelle
- `type[]` : Types de dossiers
- `priority[]` : Niveaux de priorité
- `health_status[]` : États de santé
- Et plus selon la configuration...

### `useClientSearchUrl()`

Gestion des paramètres de recherche client.

```typescript
const {
  // État
  searchParams: ClientSearchParams,
  
  // Actions
  setQuery: (query: string) => void,
  addFilter: (filter: string) => void,
  removeFilter: (filter: string) => void,
  setPage: (page: number) => void,
  setSort: (field: string, direction: 'asc' | 'desc') => void,
} = useClientSearchUrl();
```

**Paramètres URL générés :**
- `query` : Recherche textuelle
- `filters[]` : Filtres appliqués
- `page` : Numéro de page
- `page_size` : Taille de page
- `sort_field` : Champ de tri
- `sort_direction` : Direction de tri

### `usePaginationUrl()`

Gestion de la pagination avec logique métier intégrée.

```typescript
const {
  // État
  page: number,
  page_size: number,
  sort_field?: string,
  sort_direction: 'asc' | 'desc',
  
  // Actions
  setPage: (page: number) => void,
  nextPage: () => void,
  prevPage: () => void,
  setSort: (field: string, direction?: 'asc' | 'desc') => void,
  
  // Utilitaires
  canGoNext: (totalItems: number) => boolean,
  canGoPrev: () => boolean,
  getOffset: () => number,
} = usePaginationUrl();
```

### `useSearchUrl()`

Hook générique pour recherche avec debouncing.

```typescript
const {
  // État immédiat
  query: string,
  filters: string[],
  
  // État debounced pour API
  debouncedQuery: string,
  debouncedSearchState: SearchState,
  
  // Actions
  setQuery: (query: string) => void,
  toggleFilter: (filter: string) => void,
  clearAll: () => void,
} = useSearchUrl(debounceMs?: number);
```

## 💡 Patterns d'usage

### 1. Composant avec filtres

```tsx
export function FolderFiltersComponent() {
  const { filters, updateFilters, activeFiltersCount } = useFolderFiltersUrl();
  
  return (
    <div>
      <Badge>{activeFiltersCount} filtres actifs</Badge>
      <Button onClick={() => updateFilters({ priority: ['high'] })}>
        Haute priorité
      </Button>
    </div>
  );
}
```

### 2. Intégration avec TanStack Query

```tsx
export function FoldersList() {
  const { filters, statusCategory } = useFolderFiltersUrl();
  const { debouncedQuery } = useSearchUrl();
  
  // TanStack Query avec dépendances automatiques
  const { data } = useQuery({
    queryKey: ['folders', filters, statusCategory, debouncedQuery],
    queryFn: () => fetchFolders({ filters, statusCategory, search: debouncedQuery }),
  });
  
  return <div>{/* Render folders */}</div>;
}
```

### 3. Store hybride Zustand + nuqs

```tsx
export function useHybridState() {
  const uiState = useUIStore(); // Zustand pour état local
  const urlState = useFiltersUrl(); // nuqs pour état URL
  
  return {
    // État local (sélections, vue, etc.)
    selectedIds: uiState.selectedIds,
    viewMode: uiState.viewMode,
    
    // État URL (filtres, pagination, etc.)
    filters: urlState.filters,
    page: urlState.page,
    
    // Actions combinées
    selectItem: uiState.selectItem,
    updateFilters: urlState.updateFilters,
  };
}
```

### 4. Réinitialisation intelligente

```tsx
// Reset uniquement les filtres URL
clearAllFilters();

// Reset uniquement l'état UI
resetUIState();

// Reset complet (UI + URL)
resetAll();
```

## 🎨 Composants adaptés

### FolderFiltersMenuNuqs

Version nuqs du menu de filtres avec compatibilité ascendante.

```tsx
import { FolderFiltersMenuNuqs } from './folder-filters-menu-nuqs';

// Usage simple
<FolderFiltersMenuNuqs />

// Avec contrôles
<FolderFiltersMenuNuqs 
  forceStatusCategory="active"
  disableStatusChange={false}
  onFiltersChangeCallback={(filters) => console.log(filters)}
/>
```

## 🔧 Configuration avancée

### Parsers personnalisés

```typescript
// parsers.ts
export const customParser = parseAsArrayOf(
  parseAsStringEnum(['option1', 'option2'] as const)
).withDefault([]);
```

### Options de hook

```typescript
const [state, setState] = useQueryStates(schema, {
  shallow: false,           // Deep linking
  throttleMs: 300,         // Debounce URL updates
  clearOnDefault: true,    // Clean URLs
  history: 'push',         // Navigation method
});
```

## 🐛 Troubleshooting

### Problèmes courants

#### 1. Erreur d'hydratation

**Symptôme :** Console error sur hydration mismatch
**Solution :** S'assurer que le NuqsAdapter est au bon niveau dans le tree

```tsx
// ✅ Correct
<NuqsAdapter>
  <YourComponent />
</NuqsAdapter>

// ❌ Incorrect - trop profond ou manquant
<div>
  <YourComponent /> {/* nuqs hooks ici causent l'erreur */}
</div>
```

#### 2. Paramètres URL non mis à jour

**Symptôme :** L'état change mais pas l'URL
**Solution :** Vérifier que le composant est dans un client component

```tsx
// ✅ Correct
'use client';
import { useFolderFiltersUrl } from '@/hooks/nuqs';

// ❌ Incorrect - Server component
import { useFolderFiltersUrl } from '@/hooks/nuqs'; // Erreur
```

#### 3. Types non reconnus

**Symptôme :** TypeScript errors sur les parsers
**Solution :** Importer les types et parsers correctement

```typescript
// ✅ Correct
import { parseAsArrayOf, parseAsStringEnum } from 'nuqs';
import type { FolderFilters } from './types';

// ❌ Incorrect
import { parseAsArray } from 'nuqs'; // N'existe pas
```

#### 4. Conflits avec next-intl

**Symptôme :** Routes localisées cassées
**Solution :** Ordre des providers important

```tsx
// ✅ Correct - next-intl en premier
<NextIntlClientProvider>
  <NuqsAdapter>
    {children}
  </NuqsAdapter>
</NextIntlClientProvider>
```

### Debug

Ajouter des logs de debug :

```typescript
// En développement
if (process.env.NODE_ENV === 'development') {
  console.log('nuqs state:', { filters, statusCategory });
}
```

Page de test disponible : `/test-nuqs` pour validation complète.

## 🚀 Migration checklist

- [ ] NuqsAdapter ajouté au layout
- [ ] Hooks nuqs créés et testés
- [ ] Composants migrés vers nuqs
- [ ] Store Zustand adapté
- [ ] Tests de compatibilité i18n
- [ ] Documentation mise à jour
- [ ] Équipe formée sur la nouvelle API

## 📞 Support

- **Page de test :** `/test-nuqs`
- **Documentation officielle :** [nuqs.dev](https://nuqs.dev)
- **Types :** Voir `/hooks/nuqs/types.ts`
- **Exemples :** Voir `/app/[locale]/test-nuqs/`