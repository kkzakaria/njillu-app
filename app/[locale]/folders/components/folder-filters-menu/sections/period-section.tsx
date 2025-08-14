import React from 'react';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function PeriodSection({ 
  filters, 
  config, 
  onUpdateFilters,
  t
}: FilterSectionProps): React.ReactElement | null {
  if (!config.options.completion_period) return null;

  return (
    <>
      {/* Completion period */}
      {config.options.completion_period.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.completion_period === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            completion_period: filters.completion_period === option.value ? undefined : option.value as 'week' | 'month' | 'quarter' | 'year'
          })}
        >
          {t(option.label)}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}