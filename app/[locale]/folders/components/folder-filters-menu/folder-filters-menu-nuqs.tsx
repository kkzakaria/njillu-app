'use client'

/**
 * Version nuqs du composant FolderFiltersMenu
 * 
 * Cette version utilise nuqs pour la gestion d'état URL synchronisée
 * tout en maintenant la compatibilité avec l'architecture existante
 */

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

// Imports des modules existants
import { FILTER_CONFIGS } from './folder-filter-configs';
import { useFolderFilters } from '@/hooks/useTranslation';
import { useFolderFilterHandlers } from './folder-filter-nuqs-handlers';

// Imports des composants de section (réutilisation)
import { UrgencySection } from './sections/urgency-section';
import { WorkflowSection } from './sections/workflow-section';
import { DeadlinesSection } from './sections/deadlines-section';
import { PerformanceSection } from './sections/performance-section';
import { CostsSection } from './sections/costs-section';
import { PeriodSection } from './sections/period-section';
import { ArchivePeriodSection } from './sections/archive-period-section';
import { DeletionPeriodSection } from './sections/deletion-period-section';

// ============================================================================
// Props optionnelles pour forcer une catégorie de statut
// ============================================================================

interface FolderFiltersMenuNuqsProps {
  /**
   * Optionnel: Force une catégorie de statut spécifique
   * Si non fourni, utilise la valeur de l'URL
   */
  forceStatusCategory?: 'active' | 'completed' | 'archived' | 'deleted';
  
  /**
   * Optionnel: Désactive la modification de la catégorie de statut
   */
  disableStatusChange?: boolean;
  
  /**
   * Optionnel: Callback appelé lors du changement de filtres
   * Utile pour l'intégration avec d'autres systèmes
   */
  onFiltersChangeCallback?: (filters: any) => void;
}

// ============================================================================
// Composant principal refactorisé avec nuqs
// ============================================================================

export function FolderFiltersMenuNuqs({ 
  forceStatusCategory,
  disableStatusChange = false,
  onFiltersChangeCallback
}: FolderFiltersMenuNuqsProps = {}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const t = useFolderFilters();
  
  // Utiliser le hook nuqs
  const {
    filters,
    statusCategory,
    activeFiltersCount,
    createFilterHandlers,
    setStatusCategory,
    onFiltersChange,
  } = useFolderFilterHandlers();

  // Utiliser la catégorie forcée si fournie
  const effectiveStatusCategory = forceStatusCategory || statusCategory;
  
  const config = FILTER_CONFIGS[effectiveStatusCategory];
  const { updateFilters, toggleArrayFilter, clearAllFilters } = createFilterHandlers(
    filters, 
    (newFilters) => {
      onFiltersChange(newFilters);
      onFiltersChangeCallback?.(newFilters);
    },
    setIsOpen
  );

  // ============================================================================
  // Actions
  // ============================================================================

  const handleStatusChange = (newStatus: typeof statusCategory) => {
    if (!disableStatusChange) {
      setStatusCategory(newStatus);
    }
  };

  // Fonction pour rendre une section de filtres
  const renderFilterSection = (section: { 
    id: string; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
    priority: number 
  }) => {
    const SectionIcon = section.icon;
    
    return (
      <div key={section.id}>
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
          <SectionIcon className="w-3 h-3 mr-1 inline" />
          {t(section.label)}
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
      onToggleArrayFilter: toggleArrayFilter,
      t
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
        if (effectiveStatusCategory === 'completed') {
          return <PeriodSection {...sectionProps} />;
        } else if (effectiveStatusCategory === 'archived') {
          return <ArchivePeriodSection {...sectionProps} />;
        } else if (effectiveStatusCategory === 'deleted') {
          return <DeletionPeriodSection {...sectionProps} />;
        }
        return null;
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
          <span>{t('ui.categoryTitle', { category: effectiveStatusCategory })}</span>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {t('ui.reset')}
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
          {t('ui.activeFilters', { count: activeFiltersCount })}
        </DropdownMenuItem>

        {/* Debug info en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Debug: nuqs active, {activeFiltersCount} filtres
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Export avec alias pour compatibilité
// ============================================================================

// Alias pour faciliter la migration progressive
export { FolderFiltersMenuNuqs as FolderFiltersMenuWithUrl };