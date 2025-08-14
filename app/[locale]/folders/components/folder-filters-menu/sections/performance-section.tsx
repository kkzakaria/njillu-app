import React from 'react';
import { Clock } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function PerformanceSection({ 
  filters, 
  config, 
  onUpdateFilters,
  t
}: FilterSectionProps): React.ReactElement {
  return (
    <>
      {/* Performance rating */}
      {config.options.performance_rating?.map((option) => (
        <DropdownMenuCheckboxItem
          key={String(option.value)}
          checked={filters.performance_rating === option.value}
          onCheckedChange={() => onUpdateFilters({ 
            performance_rating: filters.performance_rating === option.value ? undefined : option.value as 'excellent' | 'good' | 'average' | 'poor'
          })}
        >
          <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
            {t(option.label)}
          </span>
        </DropdownMenuCheckboxItem>
      ))}

      {/* Duration vs planned */}
      {config.options.duration_vs_planned && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock className="w-4 h-4 mr-2" />
            {t('labels.durationVsPlanned')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.duration_vs_planned.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.duration_vs_planned === option.value}
                onCheckedChange={() => onUpdateFilters({ 
                  duration_vs_planned: filters.duration_vs_planned === option.value ? undefined : option.value as 'faster' | 'on_time' | 'delayed'
                })}
              >
                {t(option.description)} {t(option.label)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </>
  );
}