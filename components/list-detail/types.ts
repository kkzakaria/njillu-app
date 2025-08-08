/**
 * List-Detail Component Types
 * Type definitions for the list-detail layout system
 */

import type { ReactNode } from 'react';
import type {
  EntityType,
  EntityId,
  ListViewItem,
  ListViewResponse,
  DetailViewData,
  ListDetailLayoutConfig,
  LayoutMode,
  ListViewParams,
  DetailApiParams,
  ListItemAction,
  ListItemBadge
} from '@/types';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ListDetailLayoutProps<T extends EntityType> {
  entityType: T;
  config?: Partial<ListDetailLayoutConfig>;
  className?: string;
  children?: ReactNode;
  
  // Data fetching functions
  onLoadList: (params: ListViewParams) => Promise<ListViewResponse<T>>;
  onLoadDetail: (params: DetailApiParams) => Promise<DetailViewData<T>>;
  
  // Event handlers
  onSelectItem?: (id: EntityId) => void;
  onSelectItems?: (ids: EntityId[]) => void;
  onCreateNew?: () => void;
  onDeleteItems?: (ids: EntityId[]) => Promise<void>;
  onRefresh?: () => void;
  
  // Initial state
  initialSelectedId?: EntityId;
  initialParams?: ListViewParams;
}

export interface ListViewProps<T extends EntityType> {
  items: ListViewItem<T>[];
  loading?: boolean;
  error?: string;
  selectedIds?: EntityId[];
  onSelectItem?: (id: EntityId) => void;
  onSelectItems?: (ids: EntityId[]) => void;
  onRefresh?: () => void;
  className?: string;
}

export interface ListItemProps<T extends EntityType> {
  item: ListViewItem<T>;
  selected?: boolean;
  onSelect?: (id: EntityId) => void;
  onAction?: (action: string, id: EntityId) => void;
  className?: string;
}

export interface DetailViewProps<T extends EntityType> {
  data?: DetailViewData<T>;
  loading?: boolean;
  error?: string;
  onClose?: () => void;
  onEdit?: (id: EntityId) => void;
  onDelete?: (id: EntityId) => void;
  className?: string;
}

export interface ListFiltersProps {
  filters: Record<string, unknown>;
  facets?: Array<{
    field: string;
    label: string;
    values: Array<{ value: string; label: string; count: number }>;
  }>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface ListSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export interface ListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseListDetailOptions<T extends EntityType> {
  entityType: T;
  config?: Partial<ListDetailLayoutConfig>;
  onLoadList: (params: ListViewParams) => Promise<ListViewResponse<T>>;
  onLoadDetail: (params: DetailApiParams) => Promise<DetailViewData<T>>;
  initialParams?: ListViewParams;
  initialSelectedId?: EntityId;
}

export interface UseListDetailReturn<T extends EntityType> {
  // State
  items: ListViewItem<T>[];
  selectedItem?: DetailViewData<T>;
  selectedIds: EntityId[];
  loading: boolean;
  error?: string;
  
  // List state
  listParams: ListViewParams;
  totalItems: number;
  totalPages: number;
  
  // Layout state
  layoutMode: LayoutMode;
  isMobile: boolean;
  
  // Actions
  loadList: (params?: Partial<ListViewParams>) => Promise<void>;
  loadDetail: (id: EntityId) => Promise<void>;
  selectItem: (id: EntityId) => void;
  selectItems: (ids: EntityId[]) => void;
  clearSelection: () => void;
  updateFilters: (filters: Record<string, unknown>) => void;
  updateSearch: (query: string) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  refresh: () => Promise<void>;
}

// ============================================================================
// RESPONSIVE TYPES
// ============================================================================

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

// ============================================================================
// ENTITY-SPECIFIC TYPES
// ============================================================================

export interface EntityListItemConfig<T extends EntityType> {
  titleField: keyof ListViewItem<T>;
  subtitleField?: keyof ListViewItem<T>;
  getBadges?: (item: ListViewItem<T>) => ListItemBadge[];
  getActions?: (item: ListViewItem<T>) => ListItemAction[];
  getStatusColor?: (status: string) => string;
}

export interface EntityDetailConfig<T extends EntityType> {
  tabs: Array<{
    key: string;
    label: string;
    component: ReactNode;
  }>;
  actions?: Array<{
    key: string;
    label: string;
    icon?: string;
    variant?: 'default' | 'primary' | 'secondary' | 'danger';
    onClick: (data: DetailViewData<T>) => void;
  }>;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface ListDetailContextValue<T extends EntityType> extends UseListDetailReturn<T> {
  config: ListDetailLayoutConfig;
}

export interface ListDetailProviderProps<T extends EntityType> extends UseListDetailOptions<T> {
  children: ReactNode;
}