import React from 'react';
import { Truck, CheckCircle2, MoveHorizontal } from 'lucide-react';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterSectionProps } from '../folder-filter.types';

export function WorkflowSection({ 
  filters, 
  config, 
  onToggleArrayFilter,
  t
}: FilterSectionProps): React.ReactElement {
  return (
    <>
      {/* Mode de transport */}
      {config.options.transport_mode && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Truck className="w-4 h-4 mr-2" />
            {t('labels.transportMode')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.transport_mode.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuCheckboxItem
                  key={String(option.value)}
                  checked={filters.transport_mode?.includes(option.value) ?? false}
                  onCheckedChange={() => onToggleArrayFilter('transport_mode', option.value, filters.transport_mode)}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {t(option.label)}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}

      {/* Type de transit */}
      {config.options.transit_type && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MoveHorizontal className="w-4 h-4 mr-2" />
            {t('labels.transitType')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.transit_type.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.transit_type?.includes(option.value) ?? false}
                onCheckedChange={() => onToggleArrayFilter('transit_type', option.value, filters.transit_type)}
              >
                {t(option.label)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}

      {/* Étapes de traitement */}
      {config.options.processing_stage && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t('labels.processingStage')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {config.options.processing_stage.map((option) => (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={filters.processing_stage?.includes(option.value) ?? false}
                onCheckedChange={() => onToggleArrayFilter('processing_stage', option.value, filters.processing_stage)}
              >
                {t(option.label)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </>
  );
}