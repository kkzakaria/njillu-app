'use client';

import React from 'react';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Folder } from '@/types/folders';
import type { BLContainer, ContainerType } from '@/types/bl';
import type { ContainerArrivalTracking } from '@/types/containers';
import { ContainersSummary, ContainerCard, QuickActions } from '../containers';

interface ContainersTabProps {
  selectedFolder: Folder | null;
  className?: string;
}

// Types pour les données mock
interface MockContainer extends BLContainer {
  arrivalTracking: ContainerArrivalTracking;
  type: ContainerType;
  actualWeights: {
    tareWeight: number;
    grossWeight: number;
    netWeight: number;
    volumeUsed: number;
  };
  sealNumber: string;
  arrivalLocation: string;
  customsClearanceDate?: Date;
  deliveryReadyDate?: Date;
  arrivalNotes?: string;
}




// Hook pour générer des données mock
const useMockContainers = (folder: Folder | null): MockContainer[] => {
  if (!folder) return [];

  const mockContainers: MockContainer[] = [
    {
      id: '1',
      bl_id: 'bl-1',
      container_number: 'MSCU4567890',
      type: {
        id: '1',
        name: '40ft High Cube Dry Van',
        iso_code: '40GP',
        length_ft: 40,
        width_ft: 8,
        height_ft: 9.5,
        teu_capacity: 2.0,
        max_gross_weight_kg: 30480,
        tare_weight_kg: 3750,
        max_payload_kg: 26730,
        volume_cbm: 76.2,
        door_opening_width_ft: 7.8,
        door_opening_height_ft: 8.5,
        category: 'dry',
        height_type: 'high_cube',
        special_features: null
      },
      container_type_id: '1',
      seal_number: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      net_weight_kg: null,
      volume_used_cbm: null,
      loading_method: 'fcl',
      marks_and_numbers: null,
      created_at: new Date(),
      updated_at: new Date(),
      actualWeights: {
        tareWeight: 3750,
        grossWeight: 28500,
        netWeight: 24750,
        volumeUsed: 68.5
      },
      sealNumber: 'SL789012',
      arrivalLocation: 'Port du Havre',
      customsClearanceDate: new Date('2024-01-16'),
      deliveryReadyDate: new Date('2024-01-17'),
      arrivalNotes: 'Arrivé sans incident, inspection complétée.',
      arrivalTracking: {
        id: '1',
        folder_id: folder.id,
        container_id: '1',
        estimated_arrival_date: new Date('2024-01-15'),
        actual_arrival_date: new Date('2024-01-15'),
        status: 'arrived',
        location: 'Port du Havre',
        urgency_level: 'normal',
        delay_hours: 0,
        notes: 'Arrivée dans les temps',
        created_at: new Date(),
        updated_at: new Date()
      }
    },
    {
      id: '2',
      bl_id: 'bl-1',
      container_number: 'MSCU4567891',
      type: {
        id: '2',
        name: '20ft Dry Van',
        iso_code: '20GP',
        length_ft: 20,
        width_ft: 8,
        height_ft: 8.5,
        teu_capacity: 1.0,
        max_gross_weight_kg: 24000,
        tare_weight_kg: 2200,
        max_payload_kg: 21800,
        volume_cbm: 33.2,
        door_opening_width_ft: 7.8,
        door_opening_height_ft: 7.5,
        category: 'dry',
        height_type: 'standard',
        special_features: null
      },
      container_type_id: '2',
      seal_number: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      net_weight_kg: null,
      volume_used_cbm: null,
      loading_method: 'lcl',
      marks_and_numbers: null,
      created_at: new Date(),
      updated_at: new Date(),
      actualWeights: {
        tareWeight: 2200,
        grossWeight: 18500,
        netWeight: 16300,
        volumeUsed: 25.8
      },
      sealNumber: 'SL789013',
      arrivalLocation: 'Port de Marseille',
      arrivalNotes: 'Retard de 2 jours dû aux conditions météorologiques.',
      arrivalTracking: {
        id: '2',
        folder_id: folder.id,
        container_id: '2',
        estimated_arrival_date: new Date('2024-01-20'),
        actual_arrival_date: null,
        status: 'delayed',
        location: 'En mer',
        urgency_level: 'high',
        delay_hours: 48,
        notes: 'Retard dû aux conditions météo',
        created_at: new Date(),
        updated_at: new Date()
      }
    },
    {
      id: '3',
      bl_id: 'bl-1',
      container_number: 'MSCU4567892',
      type: {
        id: '1',
        name: '40ft Dry Van',
        iso_code: '40GP',
        length_ft: 40,
        width_ft: 8,
        height_ft: 8.5,
        teu_capacity: 2.0,
        max_gross_weight_kg: 30480,
        tare_weight_kg: 3900,
        max_payload_kg: 26580,
        volume_cbm: 67.7,
        door_opening_width_ft: 7.8,
        door_opening_height_ft: 7.5,
        category: 'dry',
        height_type: 'standard',
        special_features: null
      },
      container_type_id: '1',
      seal_number: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      net_weight_kg: null,
      volume_used_cbm: null,
      loading_method: 'fcl',
      marks_and_numbers: null,
      created_at: new Date(),
      updated_at: new Date(),
      actualWeights: {
        tareWeight: 3900,
        grossWeight: 29800,
        netWeight: 25900,
        volumeUsed: 62.4
      },
      sealNumber: 'SL789014',
      arrivalLocation: 'Port du Havre',
      arrivalTracking: {
        id: '3',
        folder_id: folder.id,
        container_id: '3',
        estimated_arrival_date: new Date('2024-01-25'),
        actual_arrival_date: null,
        status: 'scheduled',
        location: 'En transit',
        urgency_level: 'normal',
        delay_hours: 0,
        notes: 'Voyage en cours',
        created_at: new Date(),
        updated_at: new Date()
      }
    }
  ];

  return mockContainers;
};

// Composant principal ContainersTab
export const ContainersTab: React.FC<ContainersTabProps> = ({ selectedFolder, className }) => {
  const containers = useMockContainers(selectedFolder);
  const hasContainers = containers.length > 0;

  // Calculs des métriques
  const totalContainers = containers.length;
  const totalTEU = containers.reduce((sum, container) => sum + container.type.teu_capacity, 0);
  const inTransit = containers.filter(c => c.arrivalTracking.status === 'scheduled').length;
  const delayed = containers.filter(c => c.arrivalTracking.status === 'delayed').length;
  const arrived = containers.filter(c => c.arrivalTracking.status === 'arrived' || c.arrivalTracking.status === 'early').length;

  const handleTrackAll = () => {
    console.log('Tracking all containers...');
  };

  const handleUpdateArrivals = () => {
    console.log('Updating all arrivals...');
  };

  const handleGenerateReport = () => {
    console.log('Generating containers report...');
  };

  const handleAddContainer = () => {
    console.log('Adding new container...');
  };

  if (!selectedFolder) {
    return (
      <div className={cn("flex items-center justify-center p-8 text-gray-500", className)}>
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucun dossier sélectionné</p>
          <p className="text-sm">Sélectionnez un dossier pour voir ses conteneurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {hasContainers ? (
        <>
          {/* Section 1: Vue d'ensemble des conteneurs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Vue d&apos;Ensemble des Conteneurs
            </h3>
            <ContainersSummary
              totalContainers={totalContainers}
              totalTEU={totalTEU}
              inTransit={inTransit}
              delayed={delayed}
              arrived={arrived}
            />
          </div>

          {/* Section 2: Actions rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions Rapides</h3>
            <QuickActions
              onTrackAll={handleTrackAll}
              onUpdateArrivals={handleUpdateArrivals}
              onGenerateReport={handleGenerateReport}
              onAddContainer={handleAddContainer}
              hasContainers={hasContainers}
              className="mb-6"
            />
          </div>

          {/* Section 3: Liste détaillée des conteneurs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liste Détaillée des Conteneurs</h3>
            <div className="space-y-4">
              {containers.map((container) => (
                <ContainerCard key={container.id} container={container} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center p-12 text-gray-500">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun conteneur trouvé</h3>
            <p className="text-sm mb-6">Ce dossier ne contient pas encore de conteneurs.</p>
            <Button 
              onClick={handleAddContainer}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter le premier conteneur
            </Button>
          </div>
        </div>
      )}

      {/* Alerte pour retards */}
      {delayed > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-red-800">Conteneurs en retard détectés</h4>
                <p className="text-sm text-red-700 mt-1">
                  {delayed} conteneur(s) sont actuellement en retard. 
                  Consultez les détails ci-dessus et contactez les compagnies de transport si nécessaire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContainersTab;