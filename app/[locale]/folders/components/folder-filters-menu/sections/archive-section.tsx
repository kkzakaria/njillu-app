import React from 'react';
import { Archive } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function ArchiveSection({ 
  filters, 
  config, 
  onUpdateFilters 
}: FilterSectionProps): React.ReactElement {
  return (
    <>
      {/* Archive reason */}
      {config.options.archive_reason && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Archive className="w-4 h-4 mr-2" />
            Raison d&apos;archivage
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.archive_reason.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.archive_reason === option.value}
                onCheckedChange={() => onUpdateFilters({ 
                  archive_reason: filters.archive_reason === option.value ? undefined : option.value as 'client_wait' | 'missing_docs' | 'customs_hold' | 'payment_pending' | 'other'
                })}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}

      {/* Archive age */}
      {config.options.archive_age?.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.archive_age === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            archive_age: filters.archive_age === option.value ? undefined : option.value as 'recent' | 'month' | 'quarter' | 'old'
          })}
        >
          {option.label}
        </DropdownMenuCheckboxItem>
      ))}

      {/* Reactivation priority */}
      {config.options.reactivation_priority?.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.reactivation_priority === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            reactivation_priority: filters.reactivation_priority === option.value ? undefined : option.value as 'high' | 'medium' | 'low'
          })}
        >
          <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
            {option.label}
          </span>
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
}