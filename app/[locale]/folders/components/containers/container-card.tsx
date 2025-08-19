'use client';

import React from 'react';
import { 
  Package,
  Calendar,
  Weight,
  Ruler,
  CheckCircle2,
  MapPin,
  Ship,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ContainerArrivalStatus } from '@/types/containers';
import { TrackingTimeline } from './tracking-timeline';

// Types pour les données du conteneur (mock)
interface ContainerType {
  id: string;
  name: string;
  length_ft: number;
  width_ft: number;
  height_ft: number;
  teu_capacity: number;
  max_gross_weight_kg: number;
  volume_cbm: number;
}

interface ContainerArrivalTracking {
  status: ContainerArrivalStatus;
  estimated_arrival_date: Date | null;
  actual_arrival_date: Date | null;
}

interface ActualWeights {
  tareWeight: number;
  grossWeight: number;
  netWeight: number;
  volumeUsed: number;
}

interface MockContainer {
  id: string;
  container_number: string;
  type: ContainerType;
  arrivalTracking: ContainerArrivalTracking;
  actualWeights: ActualWeights;
  sealNumber: string;
  arrivalLocation: string;
  customsClearanceDate?: Date;
  deliveryReadyDate?: Date;
  arrivalNotes?: string;
}

interface ContainerCardProps {
  container: MockContainer;
  className?: string;
}

interface ContainerStatusBadgeProps {
  status: ContainerArrivalStatus;
  className?: string;
}

const ContainerStatusBadge: React.FC<ContainerStatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    scheduled: { label: 'Programmé', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    delayed: { label: 'En retard', className: 'bg-red-100 text-red-800 border-red-200' },
    arrived: { label: 'Arrivé', className: 'bg-green-100 text-green-800 border-green-200' },
    early: { label: 'En avance', className: 'bg-green-100 text-green-800 border-green-200' },
    cancelled: { label: 'Annulé', className: 'bg-gray-100 text-gray-800 border-gray-200' }
  };

  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export const ContainerCard: React.FC<ContainerCardProps> = ({ container, className }) => {
  const { type, actualWeights, arrivalTracking } = container;
  
  // Calculs
  const netWeight = actualWeights.grossWeight - actualWeights.tareWeight;
  const volumePercentage = (actualWeights.volumeUsed / type.volume_cbm) * 100;
  const weightPercentage = (actualWeights.grossWeight / type.max_gross_weight_kg) * 100;

  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{container.container_number}</CardTitle>
              <p className="text-sm text-gray-600">{type.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ContainerStatusBadge status={arrivalTracking.status} />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {container.sealNumber}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Spécifications techniques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Ruler className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Dimensions</p>
              <p className="text-sm text-gray-600">
                {type.length_ft}ft × {type.width_ft}ft × {type.height_ft}&apos;
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Capacité TEU</p>
              <p className="text-sm text-gray-600">{type.teu_capacity}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Weight className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Poids max</p>
              <p className="text-sm text-gray-600">{type.max_gross_weight_kg.toLocaleString()} kg</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Volume</p>
              <p className="text-sm text-gray-600">{type.volume_cbm} CBM</p>
            </div>
          </div>
        </div>

        {/* Poids et chargement réels */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Poids et Chargement Réels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Poids tare</p>
              <p className="text-sm text-gray-600">{actualWeights.tareWeight.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium">Poids brut</p>
              <p className="text-sm text-gray-600">{actualWeights.grossWeight.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium">Poids net</p>
              <p className="text-sm text-gray-600 font-semibold">{netWeight.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-sm font-medium">Volume utilisé</p>
              <p className="text-sm text-gray-600">{actualWeights.volumeUsed} CBM</p>
            </div>
          </div>
          
          {/* Barres de progression */}
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Utilisation du poids</span>
                <span>{weightPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={weightPercentage} 
                className={cn(
                  "h-2",
                  weightPercentage > 90 ? "text-red-600" : weightPercentage > 75 ? "text-orange-600" : "text-green-600"
                )}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Utilisation du volume</span>
                <span>{volumePercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={volumePercentage} 
                className={cn(
                  "h-2",
                  volumePercentage > 90 ? "text-red-600" : volumePercentage > 75 ? "text-orange-600" : "text-green-600"
                )}
              />
            </div>
          </div>
        </div>

        {/* Suivi d'arrivée */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center">
            <Ship className="w-4 h-4 mr-2 text-blue-600" />
            Suivi d&apos;Arrivée
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Arrivée estimée</p>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {arrivalTracking.estimated_arrival_date ? 
                  new Date(arrivalTracking.estimated_arrival_date).toLocaleDateString('fr-FR') : 
                  'Non définie'
                }
              </p>
            </div>
            {arrivalTracking.actual_arrival_date && (
              <div>
                <p className="text-sm font-medium">Arrivée réelle</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                  {new Date(arrivalTracking.actual_arrival_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Lieu d&apos;arrivée</p>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {container.arrivalLocation}
              </p>
            </div>
            {container.customsClearanceDate && (
              <div>
                <p className="text-sm font-medium">Dédouanement</p>
                <p className="text-sm text-gray-600">
                  {container.customsClearanceDate.toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
          
          {container.arrivalNotes && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-sm font-medium mb-1">Notes d&apos;arrivée</p>
              <p className="text-sm text-gray-600">{container.arrivalNotes}</p>
            </div>
          )}
        </div>

        {/* Timeline d'arrivée */}
        <div>
          <h4 className="font-medium mb-3">Progression du Suivi</h4>
          <TrackingTimeline container={container} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContainerCard;