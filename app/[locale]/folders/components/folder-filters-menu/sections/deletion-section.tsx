import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function DeletionSection({ 
  filters, 
  config, 
  onUpdateFilters 
}: FilterSectionProps): React.ReactElement {
  return (
    <>
      {/* Deletion reason */}
      {config.options.deletion_reason && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Trash2 className="w-4 h-4 mr-2" />
            Raison de suppression
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.deletion_reason.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.deletion_reason === option.value}
                onCheckedChange={() => onUpdateFilters({ 
                  deletion_reason: filters.deletion_reason === option.value ? undefined : option.value as 'cancelled' | 'duplicate' | 'error' | 'client_request' | 'other'
                })}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}

      {/* Deletion period */}
      {config.options.deletion_period?.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.deletion_period === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            deletion_period: filters.deletion_period === option.value ? undefined : option.value as 'today' | 'week' | 'month'
          })}
        >
          {option.label}
        </DropdownMenuCheckboxItem>
      ))}

      {/* Financial impact */}
      {config.options.financial_impact?.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.financial_impact === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            financial_impact: filters.financial_impact === option.value ? undefined : option.value as 'low' | 'medium' | 'high'
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