'use client';

import { 
  Info, 
  FileText, 
  Target, 
  Building, 
  MapPin, 
  Calendar,
  DollarSign,
  Package,
  Ship,
  Users,
  Globe,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { FolderSummary, BillOfLading } from '@/types';
import { 
  InfoSection, 
  DataField, 
  StatusIndicator, 
  ProgressBar, 
  RiskBadge 
} from '../info-section';

interface FolderInfoTabProps {
  selectedFolder: FolderSummary;
}

// Mock data pour simuler des données étendues
function getExtendedFolderData(folder: FolderSummary) {
  return {
    // Données de base étendues
    internal_reference: `INT-${folder.folder_number.slice(-6)}`,
    customs_regime: 'DDP',
    service_type: 'Door-to-Door',
    operation_type: 'Import',
    cargo_description: 'Electronic components and consumer goods',
    special_instructions: 'Handle with care - fragile items',
    notes: 'Customer requires delivery confirmation',
    
    // Données géographiques étendues
    current_location: 'Port of Le Havre, France',
    origin_details: {
      port: 'Port of Shanghai',
      country: 'China',
      terminal: 'SIPG Terminal'
    },
    destination_details: {
      port: 'Port of Le Havre', 
      country: 'France',
      terminal: 'Terminal de France'
    },
    
    // Dates étendues
    expected_start_date: '2024-08-01',
    actual_start_date: '2024-08-02',
    deadline_date: '2024-08-25',
    
    // Informations financières
    estimated_value: 125000,
    currency: 'EUR',
    estimated_cost: 8500,
    cost_breakdown: {
      transport: 6500,
      customs: 1200,
      insurance: 800
    },
    
    // Métriques de performance
    sla_compliance: 92,
    processing_time_days: 18,
    cost_efficiency: 88,
    
    // Client étendu
    client: {
      name: 'TechCorp International',
      contact: 'Marie Dubois',
      email: 'marie.dubois@techcorp.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue des Champs-Élysées, 75008 Paris, France'
    }
  };
}

// Mock data pour le Bill of Lading
function getMockBillOfLading(folder: FolderSummary): BillOfLading | null {
  // Simulate que 60% des dossiers ont un BL associé
  if (Math.random() > 0.4) {
    return {
      id: `bl_${folder.id}`,
      bl_number: `MSCU${folder.folder_number.slice(-8)}`,
      booking_reference: `BKG${Math.random().toString().slice(2, 10)}`,
      service_contract: 'SC-2024-001',
      
      shipping_company_id: 'msc_001',
      shipping_company: {
        id: 'msc_001',
        name: 'Mediterranean Shipping Company',
        short_name: 'MSC',
        scac_code: 'MSCU',
        headquarters_country: 'CH',
        headquarters_city: 'Geneva',
        contact_info: {
          phone: '+41 22 703 8888',
          email: 'info@msc.com',
          website: 'www.msc.com'
        },
        status: 'active' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-08-01T00:00:00Z'
      },
      
      shipper_info: {
        name: 'Shanghai Electronics Ltd',
        address: '456 Pudong Avenue',
        city: 'Shanghai',
        country: 'China',
        email: 'export@shanghai-electronics.cn',
        phone: '+86 21 5555 0123'
      },
      
      consignee_info: {
        name: 'TechCorp International',
        address: '123 Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France',
        email: 'import@techcorp.com',
        phone: '+33 1 23 45 67 89'
      },
      
      notify_party_info: {
        name: 'TechCorp Logistics',
        address: '789 Rue de Rivoli',
        city: 'Paris',
        country: 'France',
        email: 'logistics@techcorp.com'
      },
      
      port_of_loading: 'CNSHA - Port of Shanghai',
      port_of_discharge: 'FRLEH - Port of Le Havre',
      place_of_receipt: 'Shanghai Electronics Ltd Factory',
      place_of_delivery: 'TechCorp Paris Warehouse',
      
      vessel_name: 'MSC OSCAR',
      voyage_number: 'W24035E',
      vessel_imo_number: '9729428',
      
      issue_date: '2024-07-28',
      shipped_on_board_date: '2024-08-02',
      estimated_arrival_date: '2024-08-20',
      
      freight_terms: 'prepaid' as const,
      loading_method: 'fcl' as const,
      
      cargo_description: 'Electronic components and consumer goods - 2 x 40HC containers',
      total_packages: 480,
      total_gross_weight_kg: 28500,
      total_volume_cbm: 132.6,
      
      declared_value_amount: 125000,
      declared_value_currency: 'EUR',
      
      status: 'confirmed' as const,
      created_at: '2024-07-28T00:00:00Z',
      updated_at: '2024-08-02T00:00:00Z'
    };
  }
  return null;
}

function getRiskLevel(folder: FolderSummary): 'low' | 'medium' | 'high' | 'critical' {
  const sla = folder.sla_compliance || 0;
  if (sla >= 95) return 'low';
  if (sla >= 85) return 'medium';
  if (sla >= 70) return 'high';
  return 'critical';
}

function getNextCriticalSteps(folder: FolderSummary): string[] {
  const stage = folder.processing_stage;
  switch (stage) {
    case 'pre_clearance':
      return ['Soumission documents douane', 'Vérification conformité', 'Planification dédouanement'];
    case 'customs_clearance':
      return ['Traitement déclaration', 'Paiement droits/taxes', 'Obtention mainlevée'];
    case 'customs_examination':
      return ['Coordination visite douane', 'Présentation marchandises', 'Régularisation si nécessaire'];
    case 'post_clearance':
      return ['Organisation transport final', 'Coordination livraison', 'Préparation documents'];
    case 'delivery_preparation':
      return ['Confirmation rendez-vous', 'Préparation équipe', 'Vérification matériel'];
    case 'in_transit':
      return ['Suivi transport', 'Gestion aléas', 'Communication client'];
    default:
      return ['Analyse dossier', 'Planification étapes', 'Allocation ressources'];
  }
}

export function FolderInfoTab({ selectedFolder }: FolderInfoTabProps) {
  const extendedData = getExtendedFolderData(selectedFolder);
  const billOfLading = getMockBillOfLading(selectedFolder);
  const hasBillOfLading = billOfLading !== null;

  return (
    <div className="space-y-6">
      {/* Section 1: Informations Générales */}
      <InfoSection title="Informations Générales" icon={Info}>
        <div className="space-y-6">
          {/* Identification */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Identification</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataField label="Numéro de dossier" value={selectedFolder.folder_number} />
              <DataField label="Référence client" value={selectedFolder.reference_number} />
              <DataField label="Référence interne" value={extendedData.internal_reference} />
            </div>
          </div>

          {/* Classification */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Classification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                <StatusIndicator status={selectedFolder.type} type="info" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</p>
                <StatusIndicator status={selectedFolder.category} type="default" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priorité</p>
                <StatusIndicator 
                  status={selectedFolder.priority} 
                  type={selectedFolder.priority === 'high' ? 'danger' : selectedFolder.priority === 'medium' ? 'warning' : 'success'}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Régime douanier</p>
                <StatusIndicator status={extendedData.customs_regime} type="info" />
              </div>
            </div>
          </div>

          {/* Géographie */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Géographie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DataField 
                label="Origine" 
                value={`${selectedFolder.origin_name} (${extendedData.origin_details.country})`} 
              />
              <DataField 
                label="Destination" 
                value={`${selectedFolder.destination_name} (${extendedData.destination_details.country})`} 
              />
              <DataField label="Lieu actuel" value={extendedData.current_location} />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Dates importantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DataField label="Date de création" value={selectedFolder.created_date.split('T')[0]} />
              <DataField label="Début prévu" value={extendedData.expected_start_date} />
              <DataField label="Début réel" value={extendedData.actual_start_date} />
              <DataField label="Fin prévue" value={selectedFolder.expected_completion_date?.split('T')[0]} />
              <DataField label="Date limite" value={extendedData.deadline_date} />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
                <StatusIndicator 
                  status={selectedFolder.status} 
                  type={selectedFolder.status === 'completed' ? 'success' : selectedFolder.status === 'cancelled' ? 'danger' : 'warning'}
                />
              </div>
            </div>
          </div>

          {/* Financier */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informations financières</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DataField 
                label="Valeur estimée" 
                value={`${extendedData.estimated_value.toLocaleString()} ${extendedData.currency}`} 
              />
              <DataField 
                label="Coût estimé" 
                value={`${extendedData.estimated_cost.toLocaleString()} ${extendedData.currency}`} 
              />
              <DataField label="Devise" value={extendedData.currency} />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Répartition coûts</p>
                <div className="text-sm space-y-1">
                  <div>Transport: {extendedData.cost_breakdown.transport}€</div>
                  <div>Douane: {extendedData.cost_breakdown.customs}€</div>
                  <div>Assurance: {extendedData.cost_breakdown.insurance}€</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Description et notes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="Description du cargo" value={extendedData.cargo_description} multiline />
              <DataField label="Instructions spéciales" value={extendedData.special_instructions} multiline />
            </div>
            <div className="mt-4">
              <DataField label="Notes" value={extendedData.notes} multiline />
            </div>
          </div>
        </div>
      </InfoSection>

      {/* Section 2: Bill of Lading (si associé) */}
      {hasBillOfLading && billOfLading && (
        <InfoSection title="Bill of Lading" icon={FileText} collapsible defaultExpanded={false}>
          <div className="space-y-6">
            {/* Transport Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informations de transport</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataField label="Numéro BL" value={billOfLading.bl_number} />
                <DataField label="Référence booking" value={billOfLading.booking_reference} />
                <DataField label="Contrat de service" value={billOfLading.service_contract} />
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Compagnie maritime</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataField label="Compagnie" value={billOfLading.shipping_company?.name} />
                <DataField label="Code SCAC" value={billOfLading.shipping_company?.scac_code} />
                <DataField label="Contact" value={billOfLading.shipping_company?.contact_info.phone} />
              </div>
            </div>

            {/* Parties */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Parties impliquées</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <DataField label="Expéditeur (Shipper)" value={billOfLading.shipper_info.name} />
                  <DataField label="Ville" value={`${billOfLading.shipper_info.city}, ${billOfLading.shipper_info.country}`} />
                </div>
                <div>
                  <DataField label="Destinataire (Consignee)" value={billOfLading.consignee_info.name} />
                  <DataField label="Ville" value={`${billOfLading.consignee_info.city}, ${billOfLading.consignee_info.country}`} />
                </div>
                <div>
                  <DataField label="Notify Party" value={billOfLading.notify_party_info?.name} />
                  <DataField label="Ville" value={billOfLading.notify_party_info ? `${billOfLading.notify_party_info.city}, ${billOfLading.notify_party_info.country}` : undefined} />
                </div>
              </div>
            </div>

            {/* Ports */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Ports et lieux</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataField label="Port de chargement" value={billOfLading.port_of_loading} />
                <DataField label="Port de déchargement" value={billOfLading.port_of_discharge} />
                <DataField label="Lieu de réception" value={billOfLading.place_of_receipt} />
                <DataField label="Lieu de livraison" value={billOfLading.place_of_delivery} />
              </div>
            </div>

            {/* Vessel */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informations navire</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataField label="Nom du navire" value={billOfLading.vessel_name} />
                <DataField label="Numéro de voyage" value={billOfLading.voyage_number} />
                <DataField label="IMO Number" value={billOfLading.vessel_imo_number} />
              </div>
            </div>

            {/* Dates */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Dates importantes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataField label="Date d'émission" value={billOfLading.issue_date} />
                <DataField label="Date d'embarquement" value={billOfLading.shipped_on_board_date} />
                <DataField label="Arrivée estimée" value={billOfLading.estimated_arrival_date} />
              </div>
            </div>

            {/* Commercial */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Termes commerciaux</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Freight Terms</p>
                  <StatusIndicator 
                    status={billOfLading.freight_terms === 'prepaid' ? 'Prépayé' : 'À collecter'} 
                    type={billOfLading.freight_terms === 'prepaid' ? 'success' : 'warning'}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Méthode de chargement</p>
                  <StatusIndicator 
                    status={billOfLading.loading_method === 'fcl' ? 'FCL (Container complet)' : 'LCL (Groupage)'} 
                    type="info"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut BL</p>
                  <StatusIndicator 
                    status={billOfLading.status} 
                    type={billOfLading.status === 'confirmed' ? 'success' : 'warning'}
                  />
                </div>
              </div>
            </div>

            {/* Cargo */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informations marchandises</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DataField label="Description cargo" value={billOfLading.cargo_description} multiline />
                <div className="grid grid-cols-2 gap-4">
                  <DataField label="Nombre de colis" value={billOfLading.total_packages?.toString()} />
                  <DataField label="Poids brut (kg)" value={billOfLading.total_gross_weight_kg?.toLocaleString()} />
                  <DataField label="Volume (CBM)" value={billOfLading.total_volume_cbm?.toString()} />
                  <DataField 
                    label="Valeur déclarée" 
                    value={`${billOfLading.declared_value_amount?.toLocaleString()} ${billOfLading.declared_value_currency}`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* Message si pas de BL */}
      {!hasBillOfLading && (
        <InfoSection title="Bill of Lading" icon={FileText} collapsible defaultExpanded={false}>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun Bill of Lading associé à ce dossier</p>
            <p className="text-sm text-gray-400 mt-2">Le BL sera ajouté lors de la réservation du transport maritime</p>
          </div>
        </InfoSection>
      )}

      {/* Section 3: Résumé Exécutif */}
      <InfoSection title="Résumé Exécutif" icon={Target}>
        <div className="space-y-6">
          {/* Performance */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Métriques de performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <ProgressBar 
                  value={selectedFolder.sla_compliance || 0} 
                  label="Respect des SLA" 
                  color={selectedFolder.sla_compliance && selectedFolder.sla_compliance >= 85 ? 'green' : 'orange'}
                />
                <ProgressBar 
                  value={extendedData.cost_efficiency} 
                  label="Efficacité coût" 
                  color={extendedData.cost_efficiency >= 85 ? 'green' : 'orange'}
                />
              </div>
              <div className="space-y-4">
                <DataField 
                  label="Temps de traitement" 
                  value={`${extendedData.processing_time_days} jours`} 
                />
                <DataField 
                  label="Étape actuelle" 
                  value={selectedFolder.processing_stage} 
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Santé du dossier</p>
                  <StatusIndicator 
                    status={selectedFolder.health_status} 
                    type={selectedFolder.health_status === 'healthy' ? 'success' : 'warning'}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Niveau de risque</p>
                  <RiskBadge level={getRiskLevel(selectedFolder)} />
                </div>
              </div>
            </div>
          </div>

          {/* Assessment des risques */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Assessment des risques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Délai serré</span>
                  </div>
                  <RiskBadge level="medium" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Documentation complète</span>
                  </div>
                  <RiskBadge level="low" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Points d'attention</p>
                <ul className="text-sm space-y-1">
                  <li>• Surveiller les délais de dédouanement</li>
                  <li>• Confirmer la disponibilité du transport final</li>
                  <li>• Vérifier la conformité des documents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chemin critique */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Prochaines étapes critiques</h4>
            <div className="space-y-3">
              {getNextCriticalSteps(selectedFolder).map((step, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goulots d'étranglement */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Goulots d'étranglement identifiés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="font-medium text-orange-900 dark:text-orange-100">Délai de traitement douane</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Traitement plus lent que prévu. Impact estimé: +2 jours
                </p>
              </div>
              <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Opportunité d'amélioration</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Optimisation possible du transport final pour réduire les coûts
                </p>
              </div>
            </div>
          </div>
        </div>
      </InfoSection>
    </div>
  );
}