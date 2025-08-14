'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Filter, 
  ChevronDown,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Truck,
  Calendar,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Archive,
  Trash2,
  AlertCircle,
  MoveHorizontal,
  Ship,
  Plane
} from 'lucide-react';

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
  completion_period?: 'week' | 'month' | 'quarter' | 'year';
  performance_rating?: 'excellent' | 'good' | 'average' | 'poor';
  duration_vs_planned?: 'faster' | 'on_time' | 'delayed';
  cost_vs_estimated?: 'under' | 'on_budget' | 'over';
  
  // Filtres spécifiques ARCHIVED (archivés)
  archive_reason?: 'client_wait' | 'missing_docs' | 'customs_hold' | 'payment_pending' | 'other';
  archive_age?: 'recent' | 'month' | 'quarter' | 'old';
  reactivation_priority?: 'high' | 'medium' | 'low';
  
  // Filtres spécifiques DELETED (supprimés)
  deletion_reason?: 'cancelled' | 'duplicate' | 'error' | 'client_request' | 'other';
  deleted_by?: string;
  deletion_period?: 'today' | 'week' | 'month';
  financial_impact?: 'low' | 'medium' | 'high';
}

type StatusCategory = 'active' | 'completed' | 'archived' | 'deleted';

interface FolderFiltersMenuProps {
  statusCategory: StatusCategory;
  filters: FolderFilters;
  onFiltersChange: (filters: FolderFilters) => void;
  activeFiltersCount?: number;
}

// ============================================================================
// Configurations par catégorie de statut
// ============================================================================

interface FilterSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: number; // Ordre d'affichage
}

interface FilterOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface FilterConfig {
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
    completion_period?: FilterOption<'week' | 'month' | 'quarter' | 'year'>[];
    performance_rating?: FilterOption<'excellent' | 'good' | 'average' | 'poor'>[];
    archive_reason?: FilterOption<string>[];
    deletion_reason?: FilterOption<string>[];
    [key: string]: FilterOption<string | number | boolean>[] | undefined;
  };
}

const FILTER_CONFIGS: Record<StatusCategory, FilterConfig> = {
  // Configuration pour dossiers EN COURS
  active: {
    sections: [
      { id: 'urgency', label: 'URGENCE & PRIORITÉ', icon: AlertTriangle, priority: 1 },
      { id: 'workflow', label: 'WORKFLOW', icon: Building2, priority: 2 },
      { id: 'deadlines', label: 'ÉCHÉANCES', icon: Calendar, priority: 3 },
      { id: 'client', label: 'CLIENT & TYPE', icon: User, priority: 4 }
    ],
    options: {
      priority: [
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
        { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
        { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-800' },
      ],
      // sla_threshold: [
      //   { value: 'low', label: 'Critique (< 70%)', description: '🚨' },
      //   { value: 'medium', label: 'Attention (70-90%)', description: '⚠️' },
      //   { value: 'high', label: 'Bon (> 90%)', description: '✅' },
      // ],
      processing_stage: [
        { value: 'enregistrement', label: 'Enregistrement' },
        { value: 'declaration_douaniere', label: 'Déclaration douanière' },
        { value: 'controle_douanier', label: 'Contrôle douanier' },
        { value: 'livraison', label: 'Livraison' },
      ],
      deadline_proximity: [
        { value: 'today', label: 'Aujourd&apos;hui', description: 'Échéance dans 24h' },
        { value: 'week', label: 'Cette semaine', description: 'Échéance dans 7 jours' },
        { value: 'month', label: 'Ce mois', description: 'Échéance dans 30 jours' },
      ],
      transport_mode: [
        { value: 'maritime', label: 'Maritime', icon: Ship },
        { value: 'terrestre', label: 'Terrestre', icon: Truck },
        { value: 'aerien', label: 'Aérien', icon: Plane },
      ],
      transit_type: [
        { value: 'import', label: 'Import' },
        { value: 'export', label: 'Export' },
      ],
      type: [
        { value: 'import', label: 'Import', icon: Truck },
        { value: 'export', label: 'Export', icon: Truck },
        { value: 'transit', label: 'Transit', icon: Truck },
      ]
    }
  },

  // Configuration pour dossiers TERMINÉS
  completed: {
    sections: [
      { id: 'performance', label: 'PERFORMANCE', icon: TrendingUp, priority: 1 },
      { id: 'timing', label: 'DÉLAIS', icon: Clock, priority: 2 },
      { id: 'costs', label: 'COÛTS', icon: DollarSign, priority: 3 },
      { id: 'period', label: 'PÉRIODE', icon: Calendar, priority: 4 }
    ],
    options: {
      completion_period: [
        { value: 'week', label: 'Cette semaine' },
        { value: 'month', label: 'Ce mois' },
        { value: 'quarter', label: 'Ce trimestre' },
        { value: 'year', label: 'Cette année' },
      ],
      performance_rating: [
        { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
        { value: 'good', label: 'Bon', color: 'bg-blue-100 text-blue-800' },
        { value: 'average', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'poor', label: 'Médiocre', color: 'bg-red-100 text-red-800' },
      ],
      duration_vs_planned: [
        { value: 'faster', label: 'Plus rapide que prévu', description: '⚡' },
        { value: 'on_time', label: 'Dans les délais', description: '✅' },
        { value: 'delayed', label: 'En retard', description: '🚨' },
      ],
      cost_vs_estimated: [
        { value: 'under', label: 'Sous budget', description: '💚' },
        { value: 'on_budget', label: 'Dans le budget', description: '✅' },
        { value: 'over', label: 'Hors budget', description: '🚨' },
      ],
      transport_mode: [
        { value: 'maritime', label: 'Maritime', icon: Ship },
        { value: 'terrestre', label: 'Terrestre', icon: Truck },
        { value: 'aerien', label: 'Aérien', icon: Plane },
      ],
      transit_type: [
        { value: 'import', label: 'Import' },
        { value: 'export', label: 'Export' },
      ],
      type: [
        { value: 'import', label: 'Import', icon: Truck },
        { value: 'export', label: 'Export', icon: Truck },
        { value: 'transit', label: 'Transit', icon: Truck },
      ]
    }
  },

  // Configuration pour dossiers ARCHIVÉS
  archived: {
    sections: [
      { id: 'archive_info', label: 'ARCHIVAGE', icon: Archive, priority: 1 },
      { id: 'original', label: 'INFORMATIONS ORIGINALES', icon: Building2, priority: 2 },
      { id: 'reactivation', label: 'RÉACTIVATION', icon: CheckCircle2, priority: 3 }
    ],
    options: {
      archive_reason: [
        { value: 'client_wait', label: 'Attente client' },
        { value: 'missing_docs', label: 'Documents manquants' },
        { value: 'customs_hold', label: 'Retenue douanière' },
        { value: 'payment_pending', label: 'Paiement en attente' },
        { value: 'other', label: 'Autre raison' },
      ],
      archive_age: [
        { value: 'recent', label: 'Récent (< 1 mois)' },
        { value: 'month', label: '1-3 mois' },
        { value: 'quarter', label: '3-6 mois' },
        { value: 'old', label: 'Ancien (> 6 mois)' },
      ],
      reactivation_priority: [
        { value: 'high', label: 'Priorité haute', color: 'bg-red-100 text-red-800' },
        { value: 'medium', label: 'Priorité moyenne', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'low', label: 'Priorité faible', color: 'bg-green-100 text-green-800' },
      ],
      transport_mode: [
        { value: 'maritime', label: 'Maritime', icon: Ship },
        { value: 'terrestre', label: 'Terrestre', icon: Truck },
        { value: 'aerien', label: 'Aérien', icon: Plane },
      ],
      transit_type: [
        { value: 'import', label: 'Import' },
        { value: 'export', label: 'Export' },
      ],
      type: [
        { value: 'import', label: 'Import', icon: Truck },
        { value: 'export', label: 'Export', icon: Truck },
        { value: 'transit', label: 'Transit', icon: Truck },
      ]
    }
  },

  // Configuration pour dossiers SUPPRIMÉS
  deleted: {
    sections: [
      { id: 'deletion_info', label: 'SUPPRESSION', icon: Trash2, priority: 1 },
      { id: 'audit', label: 'AUDIT', icon: AlertCircle, priority: 2 },
      { id: 'impact', label: 'IMPACT', icon: DollarSign, priority: 3 }
    ],
    options: {
      deletion_reason: [
        { value: 'cancelled', label: 'Annulé par le client' },
        { value: 'duplicate', label: 'Dossier dupliqué' },
        { value: 'error', label: 'Erreur de saisie' },
        { value: 'client_request', label: 'Demande client' },
        { value: 'other', label: 'Autre raison' },
      ],
      deletion_period: [
        { value: 'today', label: 'Aujourd\'hui' },
        { value: 'week', label: 'Cette semaine' },
        { value: 'month', label: 'Ce mois' },
      ],
      financial_impact: [
        { value: 'low', label: 'Impact faible', color: 'bg-green-100 text-green-800' },
        { value: 'medium', label: 'Impact moyen', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'high', label: 'Impact élevé', color: 'bg-red-100 text-red-800' },
      ],
      transport_mode: [
        { value: 'maritime', label: 'Maritime', icon: Ship },
        { value: 'terrestre', label: 'Terrestre', icon: Truck },
        { value: 'aerien', label: 'Aérien', icon: Plane },
      ],
      transit_type: [
        { value: 'import', label: 'Import' },
        { value: 'export', label: 'Export' },
      ],
      type: [
        { value: 'import', label: 'Import', icon: Truck },
        { value: 'export', label: 'Export', icon: Truck },
        { value: 'transit', label: 'Transit', icon: Truck },
      ]
    }
  }
};

// ============================================================================
// Composant principal
// ============================================================================

export function FolderFiltersMenu({ 
  statusCategory, 
  filters, 
  onFiltersChange, 
  activeFiltersCount = 0 
}: FolderFiltersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const config = FILTER_CONFIGS[statusCategory];

  // Handlers pour les modifications de filtres
  const updateFilters = (updates: Partial<FolderFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof FolderFilters,
    value: T,
    currentArray: T[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray.length > 0 ? newArray : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  // Fonction pour rendre une section de filtres
  const renderFilterSection = (section: FilterSection) => {
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
    switch (sectionId) {
      case 'urgency':
        return (
          <>
            {/* Priorités */}
            {config.options.priority && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Niveau de priorité
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.priority.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.priority?.includes(option.value) ?? false}
                      onCheckedChange={() => toggleArrayFilter('priority', option.value, filters.priority)}
                    >
                      <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
                        {option.label}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </>
        );

      case 'workflow':
        return (
          <>
            {/* Mode de transport */}
            {config.options.transport_mode && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Truck className="w-4 h-4 mr-2" />
                  Mode de transport
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.transport_mode.map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={filters.transport_mode?.includes(option.value) ?? false}
                        onCheckedChange={() => toggleArrayFilter('transport_mode', option.value, filters.transport_mode)}
                      >
                        {Icon && <Icon className="w-4 h-4 mr-2" />}
                        {option.label}
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
                  Type de transit
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.transit_type.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.transit_type?.includes(option.value) ?? false}
                      onCheckedChange={() => toggleArrayFilter('transit_type', option.value, filters.transit_type)}
                    >
                      {option.label}
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
                  Étape de traitement
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.processing_stage.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.processing_stage?.includes(option.value) ?? false}
                      onCheckedChange={() => toggleArrayFilter('processing_stage', option.value, filters.processing_stage)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </>
        );

      case 'deadlines':
        return (
          <>
            {/* En retard */}
            <DropdownMenuCheckboxItem
              checked={filters.is_overdue ?? false}
              onCheckedChange={(checked) => updateFilters({ is_overdue: checked || undefined })}
            >
              🚨 En retard
            </DropdownMenuCheckboxItem>

            {/* Échéance proche */}
            {config.options.deadline_proximity && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="w-4 h-4 mr-2" />
                  Échéance proche
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.deadline_proximity?.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.deadline_proximity === option.value}
                      onCheckedChange={() => updateFilters({ 
                        deadline_proximity: filters.deadline_proximity === option.value ? undefined : option.value 
                      })}
                    >
                      {option.label}
                      {option.description && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {option.description}
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </>
        );

      case 'performance':
        return (
          <>
            {/* Performance rating */}
            {config.options.performance_rating?.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.performance_rating === option.value}
                onCheckedChange={() => updateFilters({ 
                  performance_rating: filters.performance_rating === option.value ? undefined : option.value 
                })}
              >
                <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
                  {option.label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}

            {/* Duration vs planned */}
            {config.options.duration_vs_planned && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="w-4 h-4 mr-2" />
                  Délais vs prévu
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {config.options.duration_vs_planned.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.duration_vs_planned === option.value}
                      onCheckedChange={() => updateFilters({ 
                        duration_vs_planned: filters.duration_vs_planned === option.value ? undefined : option.value 
                      })}
                    >
                      {option.description} {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </>
        );

      case 'costs':
        return (
          <>
            {/* Cost vs estimated */}
            {config.options.cost_vs_estimated?.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.cost_vs_estimated === option.value}
                onCheckedChange={() => updateFilters({ 
                  cost_vs_estimated: filters.cost_vs_estimated === option.value ? undefined : option.value 
                })}
              >
                {option.description} {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

      case 'period':
        return (
          <>
            {/* Completion period */}
            {config.options.completion_period?.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.completion_period === option.value}
                onCheckedChange={() => updateFilters({ 
                  completion_period: filters.completion_period === option.value ? undefined : option.value 
                })}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

      case 'archive_info':
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
                      key={option.value}
                      checked={filters.archive_reason === option.value}
                      onCheckedChange={() => updateFilters({ 
                        archive_reason: filters.archive_reason === option.value ? undefined : option.value 
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
                key={option.value}
                checked={filters.archive_age === option.value}
                onCheckedChange={() => updateFilters({ 
                  archive_age: filters.archive_age === option.value ? undefined : option.value 
                })}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

      case 'reactivation':
        return (
          <>
            {/* Reactivation priority */}
            {config.options.reactivation_priority?.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.reactivation_priority === option.value}
                onCheckedChange={() => updateFilters({ 
                  reactivation_priority: filters.reactivation_priority === option.value ? undefined : option.value 
                })}
              >
                <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
                  {option.label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

      case 'deletion_info':
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
                      key={option.value}
                      checked={filters.deletion_reason === option.value}
                      onCheckedChange={() => updateFilters({ 
                        deletion_reason: filters.deletion_reason === option.value ? undefined : option.value 
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
                key={option.value}
                checked={filters.deletion_period === option.value}
                onCheckedChange={() => updateFilters({ 
                  deletion_period: filters.deletion_period === option.value ? undefined : option.value 
                })}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

      case 'impact':
        return (
          <>
            {/* Financial impact */}
            {config.options.financial_impact?.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.financial_impact === option.value}
                onCheckedChange={() => updateFilters({ 
                  financial_impact: filters.financial_impact === option.value ? undefined : option.value 
                })}
              >
                <span className={`px-2 py-1 rounded text-xs mr-2 ${option.color}`}>
                  {option.label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </>
        );

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