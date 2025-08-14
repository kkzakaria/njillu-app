'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, RotateCcw, CheckCircle2 } from 'lucide-react';

// Imports des modules
import type { FolderFiltersMenuProps } from './folder-filter.types';
import { FILTER_CONFIGS } from './folder-filter-configs';
import { createFilterHandlers } from './folder-filter-handlers';

// Imports des composants de section
import { UrgencySection } from './sections/urgency-section';
import { WorkflowSection } from './sections/workflow-section';
import { DeadlinesSection } from './sections/deadlines-section';
import { PerformanceSection } from './sections/performance-section';
import { CostsSection } from './sections/costs-section';
import { PeriodSection } from './sections/period-section';
import { ArchiveSection } from './sections/archive-section';
import { DeletionSection } from './sections/deletion-section';

// ============================================================================
// Composant principal refactorisé
// ============================================================================

export function FolderFiltersMenu({ 
  statusCategory, 
  filters, 
  onFiltersChange, 
  activeFiltersCount = 0 
}: FolderFiltersMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  
  const config = FILTER_CONFIGS[statusCategory];
  const { updateFilters, toggleArrayFilter, clearAllFilters } = createFilterHandlers(
    filters, 
    onFiltersChange, 
    setIsOpen
  );

  // Fonction pour rendre une section de filtres
  const renderFilterSection = (section: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; priority: number }) => {
    const SectionIcon = section.icon;
    
    return (
      <div key={section.id}>
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
          <SectionIcon className="w-3 h-3 mr-1 inline" />
          {section.label}
        </DropdownMenuLabel>
        {renderSectionContent(section.id)}
      </div>
    );
  };

  // Fonction pour rendre le contenu d'une section
  const renderSectionContent = (sectionId: string) => {
    const sectionProps = {
      filters,
      config,
      onUpdateFilters: updateFilters,
      onToggleArrayFilter: toggleArrayFilter
    };

    switch (sectionId) {
      case 'urgency':
        return <UrgencySection {...sectionProps} />;
      case 'workflow':
        return <WorkflowSection {...sectionProps} />;
      case 'deadlines':
        return <DeadlinesSection {...sectionProps} />;
      case 'performance':
        return <PerformanceSection {...sectionProps} />;
      case 'timing':
        return <PerformanceSection {...sectionProps} />;
      case 'costs':
        return <CostsSection {...sectionProps} />;
      case 'period':
        return <PeriodSection {...sectionProps} />;
      case 'archive_info':
      case 'original':
      case 'reactivation':
        return <ArchiveSection {...sectionProps} />;
      case 'deletion_info':
      case 'audit':
      case 'impact':
        return <DeletionSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="relative"
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[1rem] h-4 text-xs bg-green-500 text-white hover:bg-green-600"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filtres - {statusCategory}</span>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Sections dynamiques basées sur la configuration */}
        {config.sections
          .sort((a, b) => a.priority - b.priority)
          .map((section, index) => (
            <div key={section.id}>
              {renderFilterSection(section)}
              {index < config.sections.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}

        <DropdownMenuSeparator />

        {/* Action d'application des filtres */}
        <DropdownMenuItem 
          className="text-primary focus:text-primary"
          onSelect={(e) => e.preventDefault()}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Filtres actifs ({activeFiltersCount})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}