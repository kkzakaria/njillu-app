'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, List, Eye, Grid, Columns, Layers } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useListDetail } from '../context/list-detail-context';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import type { LayoutMode } from '@/types';

// ============================================================================
// RESPONSIVE NAVIGATION COMPONENT
// ============================================================================

export function ResponsiveNavigation() {
  const t = useTranslations();
  const {
    selectedItem,
    selectedIds,
    layoutMode,
    isMobile,
    setLayoutMode,
    clearSelection,
    config
  } = useListDetail();

  // Layout mode options
  const layoutModes: Array<{ value: LayoutMode; label: string; icon: React.ReactNode }> = [
    { value: 'mobile', label: 'Mobile Stack', icon: <List className="h-4 w-4" /> },
    { value: 'split', label: 'Split View', icon: <Columns className="h-4 w-4" /> },
    { value: 'overlay', label: 'Overlay', icon: <Layers className="h-4 w-4" /> },
    { value: 'tabs', label: 'Tabbed', icon: <Grid className="h-4 w-4" /> },
  ];

  // Get current layout mode info
  const currentLayoutMode = layoutModes.find(mode => mode.value === layoutMode);

  // Mobile navigation
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Back button when viewing detail */}
        {selectedItem && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSelection}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('detail.backToList')}
          </Button>
        )}

        {/* Title */}
        <div className="flex-1">
          <h1 className="font-semibold">
            {selectedItem 
              ? (selectedItem.entity as any).title || (selectedItem.entity as any).name || 'Details'
              : t(`entities.${config.entityType}.plural`)
            }
          </h1>
        </div>

        {/* View toggle */}
        {!selectedItem && (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="flex items-center justify-between p-4 border-b">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2">
        <h1 className="font-semibold">
          {t(`entities.${config.entityType}.plural`)}
        </h1>
        
        {selectedIds.length > 0 && (
          <>
            <span className="text-muted-foreground">/</span>
            <Badge variant="secondary">
              {selectedIds.length} selected
            </Badge>
          </>
        )}
      </div>

      {/* Layout controls */}
      <div className="flex items-center gap-2">
        {/* Selection info */}
        {selectedItem && (
          <div className="text-sm text-muted-foreground mr-4">
            Viewing: {(selectedItem.entity as any).title || (selectedItem.entity as any).name || selectedItem.entity.id}
          </div>
        )}

        {/* Layout mode selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {currentLayoutMode?.icon}
              <span className="ml-2 hidden sm:inline">
                {currentLayoutMode?.label || 'Layout'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Layout Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {layoutModes
              .filter(mode => mode.value !== 'mobile') // Hide mobile mode on desktop
              .map((mode) => (
                <DropdownMenuItem
                  key={mode.value}
                  onClick={() => setLayoutMode(mode.value)}
                  className={cn(
                    'cursor-pointer',
                    layoutMode === mode.value && 'bg-accent'
                  )}
                >
                  {mode.icon}
                  <span className="ml-2">{mode.label}</span>
                  {layoutMode === mode.value && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear selection */}
        {selectedIds.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearSelection}
          >
            Clear Selection
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT MODE SWITCHER (COMPACT)
// ============================================================================

export function LayoutModeSwitcher() {
  const { layoutMode, setLayoutMode, isMobile } = useListDetail();

  if (isMobile) return null;

  const modes = [
    { value: 'split' as LayoutMode, icon: <Columns className="h-4 w-4" />, tooltip: 'Split View' },
    { value: 'overlay' as LayoutMode, icon: <Layers className="h-4 w-4" />, tooltip: 'Overlay' },
    { value: 'tabs' as LayoutMode, icon: <Grid className="h-4 w-4" />, tooltip: 'Tabbed' },
  ];

  return (
    <div className="flex items-center border rounded-md">
      {modes.map((mode, index) => (
        <Button
          key={mode.value}
          variant={layoutMode === mode.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLayoutMode(mode.value)}
          className={cn(
            'rounded-none h-8 w-8 p-0',
            index === 0 && 'rounded-l-md',
            index === modes.length - 1 && 'rounded-r-md'
          )}
          title={mode.tooltip}
        >
          {mode.icon}
        </Button>
      ))}
    </div>
  );
}