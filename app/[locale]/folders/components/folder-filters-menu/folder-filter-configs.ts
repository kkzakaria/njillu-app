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
// ============================================================================

export const FILTER_CONFIGS: Record<StatusCategory, FilterConfig> = {
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
      processing_stage: [
        { value: 'enregistrement', label: 'Enregistrement' },
        { value: 'revision_facture_commerciale', label: 'Révision facture commerciale' },
        { value: 'elaboration_fdi', label: 'Élaboration FDI' },
        { value: 'elaboration_rfcv', label: 'Élaboration RFCV' },
        { value: 'declaration_douaniere', label: 'Déclaration douanière' },
        { value: 'service_exploitation', label: 'Service exploitation' },
        { value: 'facturation_client', label: 'Facturation client' },
        { value: 'livraison', label: 'Livraison' },
      ],
      deadline_proximity: [
        { value: 'today', label: 'Aujourd\'hui', description: 'Échéance dans 24h' },
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
  // Note: Les dossiers sont archivés automatiquement après 1 mois
  completed: {
    sections: [
      { id: 'period', label: 'PÉRIODE', icon: Calendar, priority: 1 }
    ],
    options: {
      completion_period: [
        { value: 'today', label: 'Aujourd\'hui' },
        { value: '3_days', label: '3 derniers jours' },
        { value: 'week', label: 'Cette semaine' },
        { value: '2_weeks', label: '2 dernières semaines' },
        { value: 'month', label: 'Ce mois (max 30 jours)' },
      ]
    }
  },

  // Configuration pour dossiers ARCHIVÉS
  // Note: Les dossiers archivés nécessitent des périodes adaptées à leur ancienneté
  archived: {
    sections: [
      { id: 'period', label: 'PÉRIODE', icon: Calendar, priority: 1 }
    ],
    options: {
      archive_age: [
        { value: 'recent', label: 'Récent (< 1 mois)' },
        { value: 'month', label: '1-3 mois' },
        { value: 'quarter', label: '3-6 mois' },
        { value: 'semester', label: '6-12 mois' },
        { value: 'old', label: 'Ancien (> 1 an)' },
      ]
    }
  },

  // Configuration pour dossiers SUPPRIMÉS
  // Note: Les dossiers supprimés sont conservés pour audit, périodes courtes pertinentes
  deleted: {
    sections: [
      { id: 'period', label: 'PÉRIODE', icon: Calendar, priority: 1 }
    ],
    options: {
      deletion_period: [
        { value: 'today', label: 'Aujourd\'hui' },
        { value: '3_days', label: '3 derniers jours' },
        { value: 'week', label: 'Cette semaine' },
        { value: '2_weeks', label: '2 dernières semaines' },
        { value: 'month', label: 'Ce mois' },
        { value: 'quarter', label: 'Ce trimestre' },
      ]
    }
  }
};