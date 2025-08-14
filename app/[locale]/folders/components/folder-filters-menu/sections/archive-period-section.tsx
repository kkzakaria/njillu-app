import React from 'react';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function ArchivePeriodSection({ 
  filters, 
  config, 
  onUpdateFilters,
  t
}: FilterSectionProps): React.ReactElement | null {
  if (!config.options.archive_age) return null;

  return (
    <>
      {/* Archive age */}
      {config.options.archive_age.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.archive_age === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            archive_age: filters.archive_age === option.value ? undefined : option.value as 'recent' | 'month' | 'quarter' | 'semester' | 'old'
          })}
        >
          {t(option.label)}
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}