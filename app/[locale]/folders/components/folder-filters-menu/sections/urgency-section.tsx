import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function UrgencySection({ 
  filters, 
  config, 
  onToggleArrayFilter,
  t
}: FilterSectionProps): React.ReactElement | null {
  // Priorités
  if (!config.options.priority) return null;

  return (
    <>
      {config.options.priority && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t('labels.priorityLevel')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.priority.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.priority?.includes(option.value) ?? false}
                onCheckedChange={() => onToggleArrayFilter('priority', option.value, filters.priority)}
              >
                <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
                  {t(option.label)}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </>
  );
}