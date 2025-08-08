'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, X, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import type { ListFiltersProps } from '../types';

// ============================================================================
// LIST FILTERS COMPONENT
// ============================================================================

export function ListFilters({
  filters,
  facets = [],
  onFiltersChange,
  onClearFilters,
  className
}: ListFiltersProps) {
  const t = useTranslations();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['status']));

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key] !== undefined && filters[key] !== '' && filters[key] !== null
  ).length;

  // Toggle section open/closed
  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  // Handle filter change
  const handleFilterChange = (field: string, value: unknown) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '' || value === null) {
      delete newFilters[field];
    } else {
      newFilters[field] = value;
    }
    
    onFiltersChange(newFilters);
  };

  // Handle checkbox filter (for multi-select)
  const handleCheckboxFilter = (field: string, value: string, checked: boolean) => {
    const currentValues = (filters[field] as string[]) || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    handleFilterChange(field, newValues.length > 0 ? newValues : undefined);
  };

  // Remove specific filter
  const removeFilter = (field: string) => {
    handleFilterChange(field, undefined);
  };

  // Default facets if none provided
  const defaultFacets = [
    {
      field: 'status',
      label: t('filters.status'),
      values: [
        { value: 'draft', label: 'Draft', count: 12 },
        { value: 'active', label: 'Active', count: 45 },
        { value: 'completed', label: 'Completed', count: 23 },
        { value: 'cancelled', label: 'Cancelled', count: 5 },
      ]
    },
    {
      field: 'priority',
      label: t('filters.priority'),
      values: [
        { value: 'low', label: 'Low', count: 15 },
        { value: 'medium', label: 'Medium', count: 30 },
        { value: 'high', label: 'High', count: 20 },
        { value: 'urgent', label: 'Urgent', count: 8 },
      ]
    }
  ];

  const facetsToShow = facets.length > 0 ? facets : defaultFacets;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{t('filters.title')}</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('filters.clear')}
          </Button>
        )}
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(filters).map(([field, value]) => {
            if (value === undefined || value === '' || value === null) return null;
            
            const displayValue = Array.isArray(value) 
              ? value.join(', ')
              : String(value);

            return (
              <Badge
                key={field}
                variant="secondary"
                className="text-xs pr-1"
              >
                <span className="font-medium">{field}:</span>
                <span className="ml-1">{displayValue}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(field)}
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-2">
        {facetsToShow.map((facet) => {
          const isOpen = openSections.has(facet.field);
          const currentValues = (filters[facet.field] as string[]) || [];

          return (
            <Collapsible
              key={facet.field}
              open={isOpen}
              onOpenChange={() => toggleSection(facet.field)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto w-full justify-between p-2 text-sm font-medium hover:bg-muted/50"
                >
                  <span>{facet.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isOpen && 'transform rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2 px-2 pb-2">
                {facet.values.map((option) => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${facet.field}-${option.value}`}
                        checked={currentValues.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxFilter(facet.field, option.value, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`${facet.field}-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {option.count}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Mobile filter dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              {t('filters.title')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>{t('filters.title')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {facetsToShow.map((facet) => (
              <div key={facet.field}>
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  {facet.label}
                </DropdownMenuLabel>
                {facet.values.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="flex items-center justify-between"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={(filters[facet.field] as string[] || []).includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxFilter(facet.field, option.value, !!checked)
                        }
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {option.count}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            ))}
            
            {activeFilterCount > 0 && (
              <DropdownMenuItem onClick={onClearFilters}>
                <X className="mr-2 h-4 w-4" />
                {t('filters.clear')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}