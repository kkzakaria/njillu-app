import React from 'react';
import { Clock } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function DeadlinesSection({ 
  filters, 
  config, 
  onUpdateFilters,
  t
}: FilterSectionProps): React.ReactElement {
  return (
    <>
      {/* En retard */}
      <DropdownMenuCheckboxItem
        checked={filters.is_overdue ?? false}
        onCheckedChange={(checked) => onUpdateFilters({ is_overdue: checked || undefined })}
      >
        {t('labels.overdue')}
      </DropdownMenuCheckboxItem>

      {/* Échéance proche */}
      {config.options.deadline_proximity && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock className="w-4 h-4 mr-2" />
            {t('labels.upcomingDeadline')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.deadline_proximity.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.deadline_proximity === option.value}
                onCheckedChange={() => onUpdateFilters({ 
                  deadline_proximity: filters.deadline_proximity === option.value ? undefined : option.value as 'today' | 'week' | 'month'
                })}
              >
                {t(option.label)}
                {option.description && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {t(option.description)}
                  </span>
                )}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </>
  );
}