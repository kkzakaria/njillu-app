import React from 'react';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function CostsSection({ 
  filters, 
  config, 
  onUpdateFilters 
}: FilterSectionProps): React.ReactElement | null {
  if (!config.options.cost_vs_estimated) return null;

  return (
    <>
      {/* Cost vs estimated */}
      {config.options.cost_vs_estimated.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.cost_vs_estimated === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            cost_vs_estimated: filters.cost_vs_estimated === option.value ? undefined : option.value as 'under' | 'on_budget' | 'over'
          })}
        >
          {option.description} {option.label}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}