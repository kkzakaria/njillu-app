'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Types pour le conteneur (mock)
interface MockContainer {
  id: string;
  container_number: string;
  customsClearanceDate?: Date;
  deliveryReadyDate?: Date;
  arrivalTracking: {
    status: 'scheduled' | 'delayed' | 'arrived' | 'early' | 'cancelled';
    actual_arrival_date: Date | null;
  };
}

interface TrackingTimelineProps {
  container: MockContainer;
  className?: string;
}

interface TimelineStage {
  key: string;
  label: string;
  completed: boolean;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ container, className }) => {
  const { arrivalTracking } = container;
  
  const stages: TimelineStage[] = [
    { 
      key: 'scheduled', 
      label: 'Programmé', 
      completed: true 
    },
    { 
      key: 'in_transit', 
      label: 'En transit', 
      completed: arrivalTracking.status !== 'scheduled' 
    },
    { 
      key: 'arrived', 
      label: 'Arrivé', 
      completed: arrivalTracking.status === 'arrived' || arrivalTracking.status === 'early' 
    },
    { 
      key: 'customs', 
      label: 'Dédouané', 
      completed: !!container.customsClearanceDate 
    },
    { 
      key: 'ready', 
      label: 'Prêt livraison', 
      completed: !!container.deliveryReadyDate 
    }
  ];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {stages.map((stage, index) => (
        <React.Fragment key={stage.key}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full border-2",
                stage.completed
                  ? "bg-green-500 border-green-500"
                  : "bg-gray-200 border-gray-300"
              )}
            />
            <span className="text-xs mt-1 text-gray-600 text-center">
              {stage.label}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2",
                stage.completed ? "bg-green-500" : "bg-gray-300"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TrackingTimeline;