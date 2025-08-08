'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type {
  EntityType,
  EntityId,
  ListViewItem,
  DetailViewData,
  ListDetailLayoutConfig,
  LayoutMode,
  ListApiParams,
  DetailApiParams,
  ListViewResponse
} from '@/types';
import type {
  ListDetailContextValue,
  ListDetailProviderProps,
  UseListDetailReturn,
  ResponsiveState
} from '../types';

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

const ListDetailContext = createContext<ListDetailContextValue<any> | null>(null);

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export function useListDetail<T extends EntityType>(): ListDetailContextValue<T> {
  const context = useContext(ListDetailContext);
  if (!context) {
    throw new Error('useListDetail must be used within a ListDetailProvider');
  }
  return context as ListDetailContextValue<T>;
}

export function useResponsiveState(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'desktop'
  });

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
      });
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return state;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function ListDetailProvider<T extends EntityType>({
  entityType,
  config: userConfig,
  onLoadList,
  onLoadDetail,
  initialParams,
  initialSelectedId,
  children
}: ListDetailProviderProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const responsive = useResponsiveState();

  // Default configuration
  const config: ListDetailLayoutConfig = {
    entityType,
    mode: responsive.isMobile ? 'mobile' : 'split',
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
      xl: 1536
    },
    listWidth: 30,
    showSearch: true,
    showFilters: true,
    enableInfiniteScroll: false,
    selectionMode: 'single',
    ...userConfig
  };

  // State management
  const [items, setItems] = useState<ListViewItem<T>[]>([]);
  const [selectedItem, setSelectedItem] = useState<DetailViewData<T> | undefined>();
  const [selectedIds, setSelectedIds] = useState<EntityId[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // URL-based parameters
  const [listParams, setListParams] = useState<ListApiParams>(() => ({
    entityType,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '20', 10),
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') ? [{ field: searchParams.get('sort')!, direction: searchParams.get('sortDir') as 'asc' | 'desc' || 'desc' }] : [],
    includePreview: true,
    includeBadges: true,
    includeActions: false,
    ...initialParams
  }));

  // Layout mode management
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (responsive.isMobile) return 'mobile';
    return config.mode;
  });

  // Update layout mode based on responsive state
  useEffect(() => {
    if (responsive.isMobile && layoutMode !== 'mobile') {
      setLayoutMode('mobile');
    } else if (!responsive.isMobile && layoutMode === 'mobile') {
      setLayoutMode(config.mode);
    }
  }, [responsive.isMobile, layoutMode, config.mode]);

  // URL synchronization
  const updateURL = useCallback((params: Partial<ListApiParams>, selectedId?: EntityId) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (params.page !== undefined) newSearchParams.set('page', params.page.toString());
    if (params.limit !== undefined) newSearchParams.set('limit', params.limit.toString());
    if (params.search !== undefined) {
      if (params.search) {
        newSearchParams.set('search', params.search);
      } else {
        newSearchParams.delete('search');
      }
    }
    if (params.sort && params.sort.length > 0) {
      newSearchParams.set('sort', params.sort[0].field);
      newSearchParams.set('sortDir', params.sort[0].direction);
    }
    
    if (selectedId) {
      newSearchParams.set('selected', selectedId);
    } else {
      newSearchParams.delete('selected');
    }

    const newURL = `${pathname}?${newSearchParams.toString()}`;
    router.replace(newURL);
  }, [pathname, router, searchParams]);

  // Load list data
  const loadList = useCallback(async (params?: Partial<ListApiParams>) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const newParams = { ...listParams, ...params };
      setListParams(newParams);
      
      const response = await onLoadList(newParams);
      setItems(response.data);
      setTotalItems(response.pagination.total_count);
      setTotalPages(response.pagination.total_pages);
      
      updateURL(newParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load list data');
    } finally {
      setLoading(false);
    }
  }, [listParams, onLoadList, updateURL]);

  // Load detail data
  const loadDetail = useCallback(async (id: EntityId) => {
    try {
      setLoading(true);
      setError(undefined);
      
      const params: DetailApiParams = {
        entityType,
        id,
        includeRelated: true,
        includeActivities: true,
        includeMetadata: true
      };
      
      const data = await onLoadDetail(params);
      setSelectedItem(data);
      
      updateURL(listParams, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detail data');
      setSelectedItem(undefined);
    } finally {
      setLoading(false);
    }
  }, [entityType, onLoadDetail, listParams, updateURL]);

  // Selection management
  const selectItem = useCallback((id: EntityId) => {
    if (config.selectionMode === 'none') return;
    
    setSelectedIds(config.selectionMode === 'single' ? [id] : [...selectedIds, id]);
    loadDetail(id);
  }, [config.selectionMode, selectedIds, loadDetail]);

  const selectItems = useCallback((ids: EntityId[]) => {
    if (config.selectionMode === 'none') return;
    setSelectedIds(ids);
  }, [config.selectionMode]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedItem(undefined);
    updateURL(listParams);
  }, [listParams, updateURL]);

  // Filter and search management
  const updateFilters = useCallback((filters: Record<string, unknown>) => {
    loadList({ ...listParams, filters: Object.entries(filters).map(([field, value]) => ({ field, operator: 'equals' as const, value: value as any })), page: 1 });
  }, [listParams, loadList]);

  const updateSearch = useCallback((query: string) => {
    loadList({ ...listParams, search: query, page: 1 });
  }, [listParams, loadList]);

  const refresh = useCallback(async () => {
    await loadList();
    if (selectedIds.length > 0 && selectedItem) {
      await loadDetail(selectedIds[0]);
    }
  }, [loadList, loadDetail, selectedIds, selectedItem]);

  // Initial data load
  useEffect(() => {
    loadList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle initial selected item from URL
  useEffect(() => {
    const selectedFromURL = searchParams.get('selected') || initialSelectedId;
    if (selectedFromURL && !selectedItem) {
      loadDetail(selectedFromURL);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: ListDetailContextValue<T> = {
    // State
    items,
    selectedItem,
    selectedIds,
    loading,
    error,
    
    // List state
    listParams,
    totalItems,
    totalPages,
    
    // Layout state
    layoutMode,
    isMobile: responsive.isMobile,
    
    // Configuration
    config,
    
    // Actions
    loadList,
    loadDetail,
    selectItem,
    selectItems,
    clearSelection,
    updateFilters,
    updateSearch,
    setLayoutMode,
    refresh
  };

  return (
    <ListDetailContext.Provider value={contextValue}>
      {children}
    </ListDetailContext.Provider>
  );
}