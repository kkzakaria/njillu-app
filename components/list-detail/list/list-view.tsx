'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useListDetail } from '../context/list-detail-context';
import { ListSearch } from './list-search';
import { ListFilters } from './list-filters';
import { ListItem } from './list-item';
import { ListPagination } from './list-pagination';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import type { EntityType } from '@/types';
import type { ListViewProps } from '../types';

// ============================================================================
// LIST VIEW COMPONENT
// ============================================================================

export function ListView<T extends EntityType>({
  items,
  loading,
  error,
  selectedIds = [],
  onSelectItem,
  onSelectItems,
  onRefresh,
  className
}: ListViewProps<T>) {
  const t = useTranslations();
  const {
    listParams,
    totalItems,
    totalPages,
    config,
    updateSearch,
    updateFilters,
    loadList,
    refresh
  } = useListDetail<T>();

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadList({ ...listParams, page });
  };

  const handlePageSizeChange = (limit: number) => {
    loadList({ ...listParams, limit, page: 1 });
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    updateSearch(query);
  };

  const handleSearchClear = () => {
    updateSearch('');
  };

  // Handle filters
  const handleFiltersChange = (filters: Record<string, unknown>) => {
    updateFilters(filters);
  };

  const handleClearFilters = () => {
    updateFilters({});
  };

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refresh();
    }
  };

  // Loading state
  if (loading && items.length === 0) {
    return (
      <Card className={cn('flex h-full flex-col', className)}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          {config.showSearch && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('flex h-full flex-col', className)}>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                {t('list.error')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {error}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('list.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      {/* Header with actions */}
      <CardHeader className="border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {t(`entities.${config.entityType}.plural`)}
            </h2>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                ({totalItems})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.new')}
            </Button>
          </div>
        </div>

        {/* Search */}
        {config.showSearch && (
          <ListSearch
            query={listParams.search || ''}
            onQueryChange={handleSearchChange}
            onClear={handleSearchClear}
            placeholder={t('search.placeholder')}
          />
        )}

        {/* Filters */}
        {config.showFilters && (
          <ListFilters
            filters={{}}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        )}
      </CardHeader>

      {/* List content */}
      <CardContent className="flex-1 overflow-auto p-0">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-lg font-medium text-muted-foreground">
                {t('list.empty')}
              </div>
              <div className="text-sm text-muted-foreground">
                No items match your current filters
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                onSelect={onSelectItem}
                className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
              />
            ))}
          </div>
        )}

        {/* Loading overlay for pagination */}
        {loading && items.length > 0 && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t('list.loading')}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t p-4">
          <ListPagination
            currentPage={listParams.page || 1}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={listParams.limit || 20}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </Card>
  );
}