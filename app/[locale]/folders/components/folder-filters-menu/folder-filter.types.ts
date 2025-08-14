import type { 
  FolderPriority, 
  FolderType, 
  FolderCategory,
  ProcessingStage,
  HealthStatus 
} from '@/types/folders';

// ============================================================================
// Types pour les filtres adaptatifs
// ============================================================================

export interface FolderFilters {
  // Filtres communs à toutes les catégories
  client_search?: string;
  type?: FolderType[];
  category?: FolderCategory[];
  
  // Filtres spécifiques ACTIVE (en cours)
  priority?: FolderPriority[];
  health_status?: HealthStatus[];
  processing_stage?: ProcessingStage[];
  transport_mode?: ('maritime' | 'terrestre' | 'aerien')[];
  transit_type?: ('import' | 'export')[];
  sla_threshold?: 'low' | 'medium' | 'high';
  deadline_proximity?: 'today' | 'week' | 'month';
  is_overdue?: boolean;
  created_recently?: 'today' | 'week';
  
  // Filtres spécifiques COMPLETED (terminés)
  // Note: Les dossiers sont archivés automatiquement après 1 mois
  completion_period?: 'today' | '3_days' | 'week' | '2_weeks' | 'month';
  performance_rating?: 'excellent' | 'good' | 'average' | 'poor';
  duration_vs_planned?: 'faster' | 'on_time' | 'delayed';
  cost_vs_estimated?: 'under' | 'on_budget' | 'over';
  
  // Filtres spécifiques ARCHIVED (archivés)
  // Note: Simplifiés pour ne garder que les périodes pertinentes
  archive_age?: 'recent' | 'month' | 'quarter' | 'semester' | 'old';
  
  // Filtres spécifiques DELETED (supprimés)
  // Note: Simplifiés pour ne garder que les périodes d'audit pertinentes
  deletion_period?: 'today' | '3_days' | 'week' | '2_weeks' | 'month' | 'quarter';
}

export type StatusCategory = 'active' | 'completed' | 'archived' | 'deleted';

// ============================================================================
// Types pour la configuration des filtres
// ============================================================================

export interface FilterSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: number; // Ordre d'affichage
}

export interface FilterOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface FilterConfig {
  sections: FilterSection[];
  options: {
    priority?: FilterOption<FolderPriority>[];
    health_status?: FilterOption<HealthStatus>[];
    type?: FilterOption<FolderType>[];
    category?: FilterOption<FolderCategory>[];
    processing_stage?: FilterOption<ProcessingStage>[];
    transport_mode?: FilterOption<'maritime' | 'terrestre' | 'aerien'>[];
    transit_type?: FilterOption<'import' | 'export'>[];
    sla_threshold?: FilterOption<'low' | 'medium' | 'high'>[];
    deadline_proximity?: FilterOption<'today' | 'week' | 'month'>[];
    completion_period?: FilterOption<'today' | '3_days' | 'week' | '2_weeks' | 'month'>[];
    performance_rating?: FilterOption<'excellent' | 'good' | 'average' | 'poor'>[];
    archive_age?: FilterOption<'recent' | 'month' | 'quarter' | 'semester' | 'old'>[];
    deletion_period?: FilterOption<'today' | '3_days' | 'week' | '2_weeks' | 'month' | 'quarter'>[];
    [key: string]: FilterOption<string | number | boolean>[] | undefined;
  };
}

// ============================================================================
// Props des composants
// ============================================================================

export interface FolderFiltersMenuProps {
  statusCategory: StatusCategory;
  filters: FolderFilters;
  onFiltersChange: (filters: FolderFilters) => void;
  activeFiltersCount?: number;
}

export interface FilterSectionProps {
  filters: FolderFilters;
  config: FilterConfig;
  onUpdateFilters: (updates: Partial<FolderFilters>) => void;
  onToggleArrayFilter: <T extends string>(
    key: keyof FolderFilters,
    value: T,
    currentArray?: T[]
  ) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}