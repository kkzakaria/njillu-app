import { 
  AlertTriangle,
  Clock,
  User,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle2,
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