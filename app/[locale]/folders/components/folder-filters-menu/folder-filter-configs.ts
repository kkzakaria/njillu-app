import { 
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Ship,
  Truck,
  Plane
} from 'lucide-react';

import type { StatusCategory, FilterConfig } from './folder-filter.types';

// ============================================================================
// Configurations des filtres par catégorie de statut
// Note: Les labels utilisent maintenant des clés de traduction
// ============================================================================

export const FILTER_CONFIGS: Record<StatusCategory, FilterConfig> = {
  // Configuration pour dossiers EN COURS
  active: {
    sections: [
      { id: 'urgency', label: 'sections.urgency', icon: AlertTriangle, priority: 1 },
      { id: 'workflow', label: 'sections.workflow', icon: Building2, priority: 2 },
      { id: 'deadlines', label: 'sections.deadlines', icon: Calendar, priority: 3 },
      { id: 'client', label: 'sections.client', icon: User, priority: 4 }
    ],
    options: {
      priority: [
        { value: 'urgent', label: 'options.priority.urgent', color: 'bg-red-100 text-red-800' },
        { value: 'normal', label: 'options.priority.normal', color: 'bg-blue-100 text-blue-800' },
        { value: 'low', label: 'options.priority.low', color: 'bg-green-100 text-green-800' },
      ],
      processing_stage: [
        { value: 'enregistrement', label: 'options.processing_stage.enregistrement' },
        { value: 'revision_facture_commerciale', label: 'options.processing_stage.revision_facture_commerciale' },
        { value: 'elaboration_fdi', label: 'options.processing_stage.elaboration_fdi' },
        { value: 'elaboration_rfcv', label: 'options.processing_stage.elaboration_rfcv' },
        { value: 'declaration_douaniere', label: 'options.processing_stage.declaration_douaniere' },
        { value: 'service_exploitation', label: 'options.processing_stage.service_exploitation' },
        { value: 'facturation_client', label: 'options.processing_stage.facturation_client' },
        { value: 'livraison', label: 'options.processing_stage.livraison' },
      ],
      deadline_proximity: [
        { value: 'today', label: 'options.deadline_proximity.today', description: 'descriptions.deadline_proximity.today' },
        { value: 'week', label: 'options.deadline_proximity.week', description: 'descriptions.deadline_proximity.week' },
        { value: 'month', label: 'options.deadline_proximity.month', description: 'descriptions.deadline_proximity.month' },
      ],
      transport_mode: [
        { value: 'maritime', label: 'options.transport_mode.maritime', icon: Ship },
        { value: 'terrestre', label: 'options.transport_mode.terrestre', icon: Truck },
        { value: 'aerien', label: 'options.transport_mode.aerien', icon: Plane },
      ],
      transit_type: [
        { value: 'import', label: 'options.transit_type.import' },
        { value: 'export', label: 'options.transit_type.export' },
      ],
      type: [
        { value: 'import', label: 'options.type.import', icon: Truck },
        { value: 'export', label: 'options.type.export', icon: Truck },
        { value: 'transit', label: 'options.type.transit', icon: Truck },
      ]
    }
  },

  // Configuration pour dossiers TERMINÉS
  // Note: Les dossiers sont archivés automatiquement après 1 mois
  completed: {
    sections: [
      { id: 'period', label: 'sections.period', icon: Calendar, priority: 1 }
    ],
    options: {
      completion_period: [
        { value: 'today', label: 'options.completion_period.today' },
        { value: '3_days', label: 'options.completion_period.3_days' },
        { value: 'week', label: 'options.completion_period.week' },
        { value: '2_weeks', label: 'options.completion_period.2_weeks' },
        { value: 'month', label: 'options.completion_period.month' },
      ]
    }
  },

  // Configuration pour dossiers ARCHIVÉS
  // Note: Les dossiers archivés nécessitent des périodes adaptées à leur ancienneté
  archived: {
    sections: [
      { id: 'period', label: 'sections.period', icon: Calendar, priority: 1 }
    ],
    options: {
      archive_age: [
        { value: 'recent', label: 'options.archive_age.recent' },
        { value: 'month', label: 'options.archive_age.month' },
        { value: 'quarter', label: 'options.archive_age.quarter' },
        { value: 'semester', label: 'options.archive_age.semester' },
        { value: 'old', label: 'options.archive_age.old' },
      ]
    }
  },

  // Configuration pour dossiers SUPPRIMÉS
  // Note: Les dossiers supprimés sont conservés pour audit, périodes courtes pertinentes
  deleted: {
    sections: [
      { id: 'period', label: 'sections.period', icon: Calendar, priority: 1 }
    ],
    options: {
      deletion_period: [
        { value: 'today', label: 'options.deletion_period.today' },
        { value: '3_days', label: 'options.deletion_period.3_days' },
        { value: 'week', label: 'options.deletion_period.week' },
        { value: '2_weeks', label: 'options.deletion_period.2_weeks' },
        { value: 'month', label: 'options.deletion_period.month' },
        { value: 'quarter', label: 'options.deletion_period.quarter' },
      ]
    }
  }
};