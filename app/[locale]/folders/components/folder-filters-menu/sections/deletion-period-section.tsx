import React from 'react';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function DeletionPeriodSection({ 
  filters, 
  config, 
  onUpdateFilters,
  t
}: FilterSectionProps): React.ReactElement | null {
  if (!config.options.deletion_period) return null;

  return (
    <>
      {/* Deletion period */}
      {config.options.deletion_period.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.deletion_period === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            deletion_period: filters.deletion_period === option.value ? undefined : option.value as 'today' | '3_days' | 'week' | '2_weeks' | 'month' | 'quarter'
          })}
        >
          {t(option.label)}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}