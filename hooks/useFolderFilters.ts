'use client'

import { useState, useMemo } from 'react';
import type { FolderFilters } from '@/app/[locale]/folders/components/folder-filters-menu';
import type { FolderSummary } from '@/types/folders';

// ============================================================================
// Types pour le hook
// ============================================================================

interface UseFolderFiltersReturn {
  filters: FolderFilters;
  setFilters: (filters: FolderFilters) => void;
  activeFiltersCount: number;
  filteredFolders: FolderSummary[];
  clearAllFilters: () => void;
  filterFolder: (folder: FolderSummary) => boolean;
}

interface UseFolderFiltersOptions {
  folders: FolderSummary[];
  statusCategory: 'active' | 'completed' | 'archived' | 'deleted';
  searchQuery?: string;
}

// ============================================================================
// Fonctions utilitaires pour les filtres
// ============================================================================

/**
 * Vérifie si un dossier correspond à un filtre de priorité
 */
const matchesPriorityFilter = (folder: FolderSummary, priorities: string[]): boolean => {
  return priorities.length === 0 || priorities.includes(folder.priority);
};


/**
 * Vérifie si un dossier correspond à un filtre de type
 */
const matchesTypeFilter = (folder: FolderSummary, types: string[]): boolean => {
  return types.length === 0 || types.includes(folder.type);
};

/**
 * Vérifie si un dossier correspond à un filtre de catégorie
 */
const matchesCategoryFilter = (folder: FolderSummary, categories: string[]): boolean => {
  return categories.length === 0 || categories.includes(folder.category);
};

/**
 * Vérifie si un dossier correspond à un filtre d'étape de traitement
 */
const matchesProcessingStageFilter = (folder: FolderSummary, stages: string[]): boolean => {
  return stages.length === 0 || stages.includes(folder.processing_stage);
};

/**
 * Vérifie si un dossier correspond à un seuil SLA
 */
const matchesSLAThresholdFilter = (folder: FolderSummary, threshold: string): boolean => {
  const slaCompliance = folder.sla_compliance || 0;
  
  switch (threshold) {
    case 'low':
      return slaCompliance < 70;
    case 'medium':
      return slaCompliance >= 70 && slaCompliance <= 90;
    case 'high':
      return slaCompliance > 90;
    default:
      return true;
  }
};

/**
 * Vérifie si un dossier est en retard
 */
const matchesOverdueFilter = (folder: FolderSummary, isOverdue: boolean): boolean => {
  if (!isOverdue) return true;
  
  const expectedDate = folder.expected_completion_date;
  if (!expectedDate) return false;
  
  const now = new Date();
  const deadline = new Date(expectedDate);
  
  return deadline < now;
};

/**
 * Vérifie si un dossier a une échéance proche
 */
const matchesDeadlineProximityFilter = (folder: FolderSummary, proximity: string): boolean => {
  const expectedDate = folder.expected_completion_date;
  if (!expectedDate) return true;
  
  const now = new Date();
  const deadline = new Date(expectedDate);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (proximity) {
    case 'today':
      return diffDays <= 1;
    case 'week':
      return diffDays <= 7;
    case 'month':
      return diffDays <= 30;
    default:
      return true;
  }
};

/**
 * Vérifie si un dossier a été créé récemment
 */
const matchesCreatedRecentlyFilter = (folder: FolderSummary, recently: string): boolean => {
  const createdDate = folder.created_date;
  if (!createdDate) return true;
  
  const now = new Date();
  const created = new Date(createdDate);
  const diffDays = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (recently) {
    case 'today':
      return diffDays <= 1;
    case 'week':
      return diffDays <= 7;
    default:
      return true;
  }
};

/**
 * Vérifie si un dossier correspond à une période de complétion
 * Note: Les dossiers terminés sont archivés automatiquement après 1 mois
 */
const matchesCompletionPeriodFilter = (folder: FolderSummary, period: string): boolean => {
  const completionDate = folder.completion_date || folder.actual_completion_date;
  if (!completionDate) return false;
  
  const now = new Date();
  const completed = new Date(completionDate);
  const diffDays = Math.ceil((now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (period) {
    case 'today':
      return diffDays <= 1;
    case '3_days':
      return diffDays <= 3;
    case 'week':
      return diffDays <= 7;
    case '2_weeks':
      return diffDays <= 14;
    case 'month':
      return diffDays <= 30; // Maximum avant archivage automatique
    default:
      return true;
  }
};

/**
 * Vérifie si un dossier correspond à une recherche textuelle
 */
const matchesSearchQuery = (folder: FolderSummary, query: string): boolean => {
  if (!query.trim()) return true;
  
  const searchableFields = [
    folder.folder_number,
    folder.reference_number,
    folder.internal_reference,
    folder.client_name,
    folder.origin_name,
    folder.destination_name,
    folder.cargo_description,
    folder.special_instructions,
    folder.notes
  ].filter(Boolean);
  
  const searchTerm = query.toLowerCase();
  
  return searchableFields.some(field => 
    field?.toLowerCase().includes(searchTerm)
  );
};

// ============================================================================
// Hook principal
// ============================================================================

export function useFolderFilters({ 
  folders, 
  statusCategory, 
  searchQuery = '' 
}: UseFolderFiltersOptions): UseFolderFiltersReturn {
  const [filters, setFilters] = useState<FolderFilters>({});

  // Fonction pour vérifier si un dossier correspond à tous les filtres actifs
  const filterFolder = useMemo(() => {
    return (folder: FolderSummary): boolean => {
      // Recherche textuelle
      if (!matchesSearchQuery(folder, searchQuery)) {
        return false;
      }

      // Filtres spécifiques aux dossiers EN COURS
      if (statusCategory === 'active') {
        // Priorité
        if (filters.priority && !matchesPriorityFilter(folder, filters.priority)) {
          return false;
        }


        // Étapes de traitement
        if (filters.processing_stage && !matchesProcessingStageFilter(folder, filters.processing_stage)) {
          return false;
        }

        // SLA threshold
        if (filters.sla_threshold && !matchesSLAThresholdFilter(folder, filters.sla_threshold)) {
          return false;
        }

        // En retard
        if (filters.is_overdue && !matchesOverdueFilter(folder, filters.is_overdue)) {
          return false;
        }

        // Échéance proche
        if (filters.deadline_proximity && !matchesDeadlineProximityFilter(folder, filters.deadline_proximity)) {
          return false;
        }

        // Créé récemment
        if (filters.created_recently && !matchesCreatedRecentlyFilter(folder, filters.created_recently)) {
          return false;
        }

        // Mode de transport - Simulation basée sur les données existantes
        if (filters.transport_mode && filters.transport_mode.length > 0) {
          // Simulation: maritime pour import, terrestre pour export, aérien pour transit
          let simulatedTransportMode: string;
          if (folder.type === 'import') simulatedTransportMode = 'maritime';
          else if (folder.type === 'export') simulatedTransportMode = 'terrestre';
          else simulatedTransportMode = 'aerien';
          
          if (!filters.transport_mode.includes(simulatedTransportMode as any)) {
            return false;
          }
        }

        // Type de transit 
        if (filters.transit_type && filters.transit_type.length > 0) {
          if (!filters.transit_type.includes(folder.type as any)) {
            return false;
          }
        }
      }

      // Filtres spécifiques aux dossiers TERMINÉS
      if (statusCategory === 'completed') {
        // Période de complétion
        if (filters.completion_period && !matchesCompletionPeriodFilter(folder, filters.completion_period)) {
          return false;
        }

        // Performance rating - Simulation basée sur SLA compliance
        if (filters.performance_rating) {
          const sla = folder.sla_compliance || 0;
          let rating: string;
          
          if (sla >= 95) rating = 'excellent';
          else if (sla >= 85) rating = 'good';
          else if (sla >= 70) rating = 'average';
          else rating = 'poor';
          
          if (rating !== filters.performance_rating) {
            return false;
          }
        }

        // Duration vs planned - Simulation
        if (filters.duration_vs_planned) {
          const sla = folder.sla_compliance || 0;
          let durationStatus: string;
          
          if (sla >= 95) durationStatus = 'faster';
          else if (sla >= 80) durationStatus = 'on_time';
          else durationStatus = 'delayed';
          
          if (durationStatus !== filters.duration_vs_planned) {
            return false;
          }
        }

        // Cost vs estimated - Simulation
        if (filters.cost_vs_estimated) {
          const sla = folder.sla_compliance || 0;
          let costStatus: string;
          
          if (sla >= 90) costStatus = 'under';
          else if (sla >= 75) costStatus = 'on_budget';
          else costStatus = 'over';
          
          if (costStatus !== filters.cost_vs_estimated) {
            return false;
          }
        }
      }

      // Filtres spécifiques aux dossiers ARCHIVÉS
      if (statusCategory === 'archived') {
        // Archive age - Basé sur archived_date ou created_date
        if (filters.archive_age) {
          const archiveDate = folder.archived_date || folder.created_date;
          if (!archiveDate) return false;
          
          const now = new Date();
          const archived = new Date(archiveDate);
          const diffDays = Math.ceil((now.getTime() - archived.getTime()) / (1000 * 60 * 60 * 24));
          
          let matches = false;
          switch (filters.archive_age) {
            case 'recent':
              matches = diffDays <= 30; // < 1 mois
              break;
            case 'month':
              matches = diffDays > 30 && diffDays <= 90; // 1-3 mois
              break;
            case 'quarter':
              matches = diffDays > 90 && diffDays <= 180; // 3-6 mois
              break;
            case 'semester':
              matches = diffDays > 180 && diffDays <= 365; // 6-12 mois
              break;
            case 'old':
              matches = diffDays > 365; // > 1 an
              break;
          }
          
          if (!matches) return false;
        }
      }

      // Filtres spécifiques aux dossiers SUPPRIMÉS
      if (statusCategory === 'deleted') {
        // Deletion period - Basé sur deleted_date ou created_date
        if (filters.deletion_period) {
          const deletionDate = folder.deleted_date || folder.created_date;
          if (!deletionDate) return false;
          
          const now = new Date();
          const deleted = new Date(deletionDate);
          const diffDays = Math.ceil((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24));
          
          let matches = false;
          switch (filters.deletion_period) {
            case 'today':
              matches = diffDays <= 1;
              break;
            case '3_days':
              matches = diffDays <= 3;
              break;
            case 'week':
              matches = diffDays <= 7;
              break;
            case '2_weeks':
              matches = diffDays <= 14;
              break;
            case 'month':
              matches = diffDays <= 30;
              break;
            case 'quarter':
              matches = diffDays <= 90;
              break;
          }
          
          if (!matches) return false;
        }
      }

      // Filtres communs à toutes les catégories
      
      // Type
      if (filters.type && !matchesTypeFilter(folder, filters.type)) {
        return false;
      }

      // Catégorie
      if (filters.category && !matchesCategoryFilter(folder, filters.category)) {
        return false;
      }

      // Client search - Simulation d'une recherche client
      if (filters.client_search && filters.client_search.trim()) {
        const clientQuery = filters.client_search.toLowerCase();
        if (!folder.client_name?.toLowerCase().includes(clientQuery)) {
          return false;
        }
      }

      return true;
    };
  }, [filters, statusCategory, searchQuery]);

  // Calcul des dossiers filtrés
  const filteredFolders = useMemo(() => {
    return folders.filter(filterFolder);
  }, [folders, filterFolder]);

  // Calcul du nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    // Comptage des filtres actifs
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) count++;
        } else if (typeof value === 'boolean') {
          if (value) count++;
        } else if (typeof value === 'string') {
          if (value.trim()) count++;
        } else {
          count++;
        }
      }
    });
    
    return count;
  }, [filters]);

  // Fonction pour effacer tous les filtres
  const clearAllFilters = () => {
    setFilters({});
  };

  return {
    filters,
    setFilters,
    activeFiltersCount,
    filteredFolders,
    clearAllFilters,
    filterFolder
  };
}