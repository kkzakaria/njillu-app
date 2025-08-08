'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ListDetailProvider, useListDetail } from '../context/list-detail-context';
import { ListView } from '../list/list-view';
import { DetailView } from '../detail/detail-view';
import { ResponsiveNavigation } from '../navigation/responsive-navigation';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EntityType } from '@/types';
import type { ListDetailLayoutProps } from '../types';

// ============================================================================
// LAYOUT CONTENT COMPONENT
// ============================================================================

function ListDetailLayoutContent<T extends EntityType>() {
  const {
    items,
    selectedItem,
    selectedIds,
    loading,
    error,
    layoutMode,
    isMobile,
    config,
    selectItem,
    clearSelection
  } = useListDetail<T>();

  // Mobile layout - stack vertically or use navigation
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <ResponsiveNavigation />
        
        {selectedItem ? (
          <div className="flex-1 overflow-hidden">
            <DetailView
              data={selectedItem}
              loading={loading}
              error={error}
              onClose={clearSelection}
              className="h-full"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <ListView
              items={items}
              loading={loading}
              error={error}
              selectedIds={selectedIds}
              onSelectItem={selectItem}
              className="h-full"
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout modes
  switch (layoutMode) {
    case 'split':
      return (
        <div className="flex h-full gap-4">
          {/* List Panel */}
          <Card className="flex-shrink-0 overflow-hidden" style={{ width: `${config.listWidth}%` }}>
            <ListView
              items={items}
              loading={loading}
              error={error}
              selectedIds={selectedIds}
              onSelectItem={selectItem}
              className="h-full"
            />
          </Card>

          <Separator orientation="vertical" className="h-full" />

          {/* Detail Panel */}
          <Card className="flex-1 overflow-hidden">
            {selectedItem ? (
              <DetailView
                data={selectedItem}
                loading={loading}
                error={error}
                onClose={clearSelection}
                className="h-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="mb-2 text-lg font-medium">Select an item</div>
                  <div className="text-sm">Choose an item from the list to view details</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      );

    case 'overlay':
      return (
        <div className="relative h-full">
          <ListView
            items={items}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onSelectItem={selectItem}
            className="h-full"
          />
          
          {selectedItem && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="flex h-full items-center justify-center p-4">
                <Card className="w-full max-w-4xl max-h-full overflow-hidden">
                  <DetailView
                    data={selectedItem}
                    loading={loading}
                    error={error}
                    onClose={clearSelection}
                    className="h-full"
                  />
                </Card>
              </div>
            </div>
          )}
        </div>
      );

    case 'tabs':
      return (
        <div className="flex h-full flex-col">
          <ResponsiveNavigation />
          
          <div className="flex-1 overflow-hidden">
            {selectedItem ? (
              <DetailView
                data={selectedItem}
                loading={loading}
                error={error}
                onClose={clearSelection}
                className="h-full"
              />
            ) : (
              <ListView
                items={items}
                loading={loading}
                error={error}
                selectedIds={selectedIds}
                onSelectItem={selectItem}
                className="h-full"
              />
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex h-full">
          <ListView
            items={items}
            loading={loading}
            error={error}
            selectedIds={selectedIds}
            onSelectItem={selectItem}
            className="h-full w-full"
          />
        </div>
      );
  }
}

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

export function ListDetailLayout<T extends EntityType>({
  className,
  children,
  ...providerProps
}: ListDetailLayoutProps<T>) {
  return (
    <ListDetailProvider {...providerProps}>
      <div className={cn('h-full w-full', className)}>
        <ListDetailLayoutContent />
        {children}
      </div>
    </ListDetailProvider>
  );
}