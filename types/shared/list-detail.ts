/**
 * Types for List-Detail Layout System
 * Provides responsive layout types for list views and detail panels
 * 
 * @module Shared/ListDetail
 * @version 1.0.0
 * @since 2025-08-08
 */

import type { 
  EntityId, 
  Timestamp, 
  PaginationParams, 
  PaginatedResponse,
  Filter,
  SortParam,
  AuditMetadata 
} from './index';
import type { EntityType, EntityTypeMap } from '../index';

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

/**
 * Responsive breakpoint configuration for list-detail layout
 */
export interface LayoutBreakpoints {
  /** Mobile breakpoint (default: 768px) */
  readonly mobile: number;
  /** Tablet breakpoint (default: 1024px) */
  readonly tablet: number;
  /** Desktop breakpoint (default: 1280px) */
  readonly desktop: number;
  /** Large desktop breakpoint (default: 1536px) */
  readonly xl: number;
}

/**
 * Layout mode configuration
 */
export type LayoutMode = 
  | 'mobile'      // Stack: List above detail
  | 'split'       // Side-by-side: List | Detail
  | 'overlay'     // Modal: Detail overlays list
  | 'tabs';       // Tabbed: Switch between list/detail

/**
 * List-detail layout configuration
 */
export interface ListDetailLayoutConfig {
  readonly entityType: EntityType;
  readonly mode: LayoutMode;
  readonly breakpoints: LayoutBreakpoints;
  readonly listWidth?: number;      // Percentage (default: 30)
  readonly showSearch?: boolean;    // Show search bar (default: true)
  readonly showFilters?: boolean;   // Show filter panel (default: true)
  readonly enableInfiniteScroll?: boolean; // Infinite scroll (default: false)
  readonly selectionMode?: 'single' | 'multi' | 'none'; // Selection mode (default: 'single')
}

// ============================================================================
// LIST VIEW TYPES
// ============================================================================

/**
 * Base interface for list view items
 * Minimal data needed for list display
 */
export interface ListViewItemBase {
  readonly id: EntityId;
  readonly title: string;
  readonly subtitle?: string;
  readonly status: string;
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
  readonly updatedAt: Timestamp;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Generic list view item for specific entity types
 */
export interface ListViewItem<T extends EntityType> extends ListViewItemBase {
  readonly entityType: T;
  readonly preview: Partial<EntityTypeMap[T]>;
  readonly badges?: ListItemBadge[];
  readonly actions?: ListItemAction[];
}

/**
 * List item badge for status indicators
 */
export interface ListItemBadge {
  readonly label: string;
  readonly variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  readonly icon?: string;
  readonly tooltip?: string;
}

/**
 * Quick action for list items
 */
export interface ListItemAction {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly variant?: 'default' | 'primary' | 'secondary' | 'danger';
  readonly requiresConfirmation?: boolean;
  readonly disabled?: boolean;
  readonly tooltip?: string;
}

// ============================================================================
// LIST VIEW PARAMETERS
// ============================================================================

/**
 * List view query parameters
 */
export interface ListViewParams extends PaginationParams {
  readonly search?: string;
  readonly filters?: Filter[];
  readonly sort?: SortParam[];
  readonly includePreview?: boolean;  // Include preview data (default: true)
  readonly includeBadges?: boolean;   // Include badge data (default: true)
  readonly includeActions?: boolean;  // Include action data (default: false)
}

/**
 * List view response
 */
export interface ListViewResponse<T extends EntityType> extends PaginatedResponse<ListViewItem<T>> {
  readonly aggregates?: ListViewAggregates;
  readonly facets?: ListViewFacet[];
}

/**
 * List view aggregation data
 */
export interface ListViewAggregates {
  readonly statusCounts: Record<string, number>;
  readonly priorityCounts?: Record<string, number>;
  readonly totalValue?: number;
  readonly averageValue?: number;
  readonly customMetrics?: Record<string, number>;
}

/**
 * List view facet for filtering
 */
export interface ListViewFacet {
  readonly field: string;
  readonly label: string;
  readonly values: Array<{
    readonly value: string;
    readonly label: string;
    readonly count: number;
  }>;
}

// ============================================================================
// DETAIL VIEW TYPES
// ============================================================================

/**
 * Base interface for detail view data
 * Complete entity data plus related information
 */
export interface DetailViewData<T extends EntityType> {
  readonly entity: EntityTypeMap[T];
  readonly related?: DetailViewRelated;
  readonly activities?: DetailViewActivity[];
  readonly metadata: DetailViewMetadata;
}

/**
 * Related entities and references
 */
export interface DetailViewRelated {
  readonly [key: string]: {
    readonly count: number;
    readonly items?: Array<{
      readonly id: EntityId;
      readonly title: string;
      readonly type: EntityType;
      readonly status?: string;
    }>;
  };
}

/**
 * Activity/audit trail for detail view
 */
export interface DetailViewActivity extends AuditMetadata {
  readonly id: EntityId;
  readonly action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'comment_added';
  readonly description: string;
  readonly changes?: Record<string, {
    readonly from: unknown;
    readonly to: unknown;
  }>;
  readonly comment?: string;
  readonly attachments?: Array<{
    readonly id: EntityId;
    readonly name: string;
    readonly url: string;
    readonly type: string;
    readonly size: number;
  }>;
}

/**
 * Detail view metadata
 */
export interface DetailViewMetadata {
  readonly permissions: {
    readonly canEdit: boolean;
    readonly canDelete: boolean;
    readonly canComment: boolean;
    readonly canShare: boolean;
  };
  readonly tabs?: DetailViewTab[];
  readonly breadcrumbs?: Array<{
    readonly label: string;
    readonly href?: string;
  }>;
}

/**
 * Detail view tab configuration
 */
export interface DetailViewTab {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly badge?: number;
  readonly component: string;
  readonly lazy?: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * List API request parameters
 */
export interface ListApiParams extends ListViewParams {
  readonly entityType: EntityType;
}

/**
 * Detail API request parameters
 */
export interface DetailApiParams {
  readonly entityType: EntityType;
  readonly id: EntityId;
  readonly includeRelated?: boolean;
  readonly includeActivities?: boolean;
  readonly includeMetadata?: boolean;
  readonly activityLimit?: number;
}

/**
 * Bulk operation parameters
 */
export interface BulkOperationParams {
  readonly entityType: EntityType;
  readonly ids: EntityId[];
  readonly operation: 'delete' | 'update_status' | 'assign' | 'export';
  readonly params?: Record<string, unknown>;
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

/**
 * Advanced search configuration
 */
export interface SearchConfig {
  readonly fields: SearchField[];
  readonly enableFuzzy?: boolean;
  readonly enableHighlight?: boolean;
  readonly minQueryLength?: number;
  readonly maxResults?: number;
}

/**
 * Searchable field configuration
 */
export interface SearchField {
  readonly name: string;
  readonly weight: number;
  readonly type: 'text' | 'keyword' | 'number' | 'date' | 'boolean';
  readonly searchable: boolean;
  readonly filterable: boolean;
  readonly sortable: boolean;
}

/**
 * Search suggestion result
 */
export interface SearchSuggestion {
  readonly text: string;
  readonly field: string;
  readonly count: number;
  readonly highlight?: string;
}

// ============================================================================
// CACHE AND PERFORMANCE
// ============================================================================

/**
 * Cache configuration for list-detail views
 */
export interface CacheConfig {
  readonly listTTL: number;        // List cache TTL in seconds
  readonly detailTTL: number;      // Detail cache TTL in seconds
  readonly aggregateTTL: number;   // Aggregate cache TTL in seconds
  readonly enableOptimisticUpdates: boolean;
  readonly staleWhileRevalidate: boolean;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  readonly queryTime: number;      // Query execution time (ms)
  readonly renderTime: number;     // Client render time (ms)
  readonly cacheHitRate: number;   // Cache hit rate (0-1)
  readonly totalResults: number;   // Total results count
  readonly memoryUsage: number;    // Memory usage (MB)
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * List-detail view state
 */
export interface ListDetailState<T extends EntityType> {
  readonly config: ListDetailLayoutConfig;
  readonly list: {
    readonly items: ListViewItem<T>[];
    readonly loading: boolean;
    readonly error?: string;
    readonly hasMore: boolean;
    readonly selectedIds: EntityId[];
  };
  readonly detail: {
    readonly data?: DetailViewData<T>;
    readonly loading: boolean;
    readonly error?: string;
    readonly activeTab?: string;
  };
  readonly filters: {
    readonly active: Filter[];
    readonly facets: ListViewFacet[];
  };
  readonly search: {
    readonly query: string;
    readonly suggestions: SearchSuggestion[];
    readonly recent: string[];
  };
}

/**
 * List-detail actions
 */
export type ListDetailAction<T extends EntityType> =
  | { type: 'LOAD_LIST'; payload: ListViewParams }
  | { type: 'LOAD_LIST_SUCCESS'; payload: ListViewResponse<T> }
  | { type: 'LOAD_LIST_ERROR'; payload: string }
  | { type: 'LOAD_DETAIL'; payload: { id: EntityId; params?: DetailApiParams } }
  | { type: 'LOAD_DETAIL_SUCCESS'; payload: DetailViewData<T> }
  | { type: 'LOAD_DETAIL_ERROR'; payload: string }
  | { type: 'SELECT_ITEMS'; payload: EntityId[] }
  | { type: 'UPDATE_FILTERS'; payload: Filter[] }
  | { type: 'UPDATE_SEARCH'; payload: string }
  | { type: 'CHANGE_LAYOUT_MODE'; payload: LayoutMode }
  | { type: 'SET_ACTIVE_TAB'; payload: string };

// ============================================================================
// INTERNATIONALIZATION
// ============================================================================

/**
 * i18n keys for list-detail components
 */
export interface ListDetailI18nKeys {
  readonly list: {
    readonly title: string;
    readonly search: {
      readonly placeholder: string;
      readonly suggestions: string;
      readonly noResults: string;
    };
    readonly filters: {
      readonly title: string;
      readonly clear: string;
      readonly apply: string;
    };
    readonly actions: {
      readonly select: string;
      readonly selectAll: string;
      readonly delete: string;
      readonly export: string;
    };
  };
  readonly detail: {
    readonly loading: string;
    readonly error: string;
    readonly notFound: string;
    readonly tabs: Record<string, string>;
  };
  readonly common: {
    readonly loading: string;
    readonly error: string;
    readonly retry: string;
    readonly cancel: string;
    readonly save: string;
  };
}