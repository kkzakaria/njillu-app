'use client';

import React from 'react';
import { Ship, Clock, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onTrackAll: () => void;
  onUpdateArrivals: () => void;
  onGenerateReport: () => void;
  onAddContainer: () => void;
  hasContainers: boolean;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  onTrackAll, 
  onUpdateArrivals, 
  onGenerateReport, 
  onAddContainer,
  hasContainers,
  className 
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onTrackAll}
        disabled={!hasContainers}
        className="flex items-center gap-2"
      >
        <Ship className="w-4 h-4" />
        Suivre tous
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onUpdateArrivals}
        disabled={!hasContainers}
        className="flex items-center gap-2"
      >
        <Clock className="w-4 h-4" />
        Mettre à jour arrivées
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onGenerateReport}
        disabled={!hasContainers}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Générer rapport
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        onClick={onAddContainer}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter conteneur
      </Button>
    </div>
  );
};

export default QuickActions;