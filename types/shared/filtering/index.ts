/**
 * Point d'entrée du module Filtering
 * Export de tous les types de filtrage et tri
 * 
 * @module Shared/Filtering
 * @version 2.0.0
 * @since 2025-01-06
 */

export type {
  FilterOperator,
  LogicalOperator,
  SortDirection,
  SortMode,
  TextSearchOperator
} from './operators';

export type {
  Filter,
  TextFilter,
  RangeFilter,
  GeoFilter,
  FilterGroup,
  FilterCollection
} from './filters';

export type {
  SortParam,
  SortOptions,
  SortPreset,
  SortedResult
} from './sorting';