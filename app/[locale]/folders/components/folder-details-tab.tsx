'use client';

import React from 'react';
import { 
  Info, 
  Package, 
  FileText, 
  History, 
  CheckCircle, 
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { FolderSummary } from '@/types/folders';
import { ContainersTab } from './tabs/containers-tab';
import { FolderInfoTab } from './tabs';

interface FolderDetailsTabProps {
  selectedFolder: FolderSummary | null;
  className?: string;
}

// Interfaces pour les indicateurs visuels
interface CompletionBadgeProps {
  value: string;
  className?: string;
}

interface AlertDotProps {
  show: boolean;
  className?: string;
}

interface CountBadgeProps {
  count: number;
  variant?: 'warning' | 'danger' | 'success' | 'info';
  className?: string;
}

interface ActivityIndicatorProps {
  lastActivity: string;
  className?: string;
}

interface StageBadgeProps {
  currentStage: string;
  className?: string;
}

interface TeamCountBadgeProps {
  count: number;
  className?: string;
}

interface TabIconProps {
  icon: 'info' | 'container' | 'documents' | 'history' | 'workflow' | 'team';
  className?: string;
}

// Composants d'indicateurs visuels
const TabIcon: React.FC<TabIconProps> = ({ icon, className }) => {
  const iconMap = {
    info: Info,
    container: Package,
    documents: FileText,
    history: History,
    workflow: CheckCircle,
    team: Users
  };
  
  const Icon = iconMap[icon];
  return <Icon className={cn("w-4 h-4 mr-2", className)} />;
};

const CompletionBadge: React.FC<CompletionBadgeProps> = ({ value, className }) => {
  const percentage = parseInt(value.replace('%', ''));
  const variant = percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'danger';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    danger: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn("ml-2 text-xs", variantClasses[variant], className)}
    >
      {value}
    </Badge>
  );
};

const AlertDot: React.FC<AlertDotProps> = ({ show, className }) => {
  if (!show) return null;
  
  return (
    <div className={cn("w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse", className)} />
  );
};

const CountBadge: React.FC<CountBadgeProps> = ({ count, variant = 'warning', className }) => {
  if (count === 0) return null;
  
  const variantClasses = {
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn("ml-2 text-xs", variantClasses[variant], className)}
    >
      {count}
    </Badge>
  );
};

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ lastActivity, className }) => {
  const isRecent = lastActivity.includes('h') || lastActivity.includes('min');
  
  return (
    <div className={cn("flex items-center ml-2", className)}>
      <Clock className="w-3 h-3 mr-1 text-gray-500" />
      <span className={cn("text-xs", isRecent ? "text-green-600" : "text-gray-500")}>
        {lastActivity}
      </span>
    </div>
  );
};

const StageBadge: React.FC<StageBadgeProps> = ({ currentStage, className }) => {
  // Mappage des étapes vers des libellés français
  const stageLabels: Record<string, string> = {
    elaboration_fdi: 'FDI',
    awaiting_documents: 'Docs',
    customs_clearance: 'Douane',
    delivery: 'Livraison',
    completed: 'Terminé'
  };
  
  const label = stageLabels[currentStage] || currentStage;
  
  return (
    <Badge 
      variant="outline"
      className={cn("ml-2 text-xs bg-blue-100 text-blue-800 border-blue-200", className)}
    >
      {label}
    </Badge>
  );
};

const TeamCountBadge: React.FC<TeamCountBadgeProps> = ({ count, className }) => {
  return (
    <Badge 
      variant="outline"
      className={cn("ml-2 text-xs bg-purple-100 text-purple-800 border-purple-200", className)}
    >
      {count}
    </Badge>
  );
};

// Hook pour générer des données mock basées sur le dossier
const useMockIndicators = (folder: Folder | null) => {
  if (!folder) {
    return {
      completionPercentage: '0%',
      hasDelayedContainers: false,
      missingDocuments: 0,
      lastActivity: 'N/A',
      currentStage: '',
      teamCount: 0
    };
  }
  
  // Mock data basé sur l'état du dossier
  const completion = folder.status === 'completed' ? '100%' :
                    folder.status === 'in_progress' ? '75%' :
                    folder.status === 'pending' ? '25%' : '90%';
  
  const hasDelays = folder.priority === 'urgent' || folder.health_status === 'at_risk';
  const docCount = folder.status === 'pending' ? 2 : 
                   folder.status === 'in_progress' ? 1 : 0;
  
  return {
    completionPercentage: completion,
    hasDelayedContainers: hasDelays,
    missingDocuments: docCount,
    lastActivity: '2h',
    currentStage: folder.processing_stage,
    teamCount: 3
  };
};

export const FolderDetailsTab: React.FC<FolderDetailsTabProps> = ({ 
  selectedFolder, 
  className 
}) => {
  const indicators = useMockIndicators(selectedFolder);

  if (!selectedFolder) {
    return (
      <div className={cn("flex items-center justify-center p-8 text-gray-500", className)}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucun dossier sélectionné</p>
          <p className="text-sm">Sélectionnez un dossier dans la liste pour voir ses détails.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger 
            value="info" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="info" />
            <span className="hidden sm:inline">Informations</span>
            <span className="sm:hidden">Info</span>
            <CompletionBadge value={indicators.completionPercentage} />
          </TabsTrigger>
          
          <TabsTrigger 
            value="containers" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="container" />
            <span className="hidden sm:inline">Conteneurs</span>
            <span className="sm:hidden">Cont.</span>
            <AlertDot show={indicators.hasDelayedContainers} />
          </TabsTrigger>
          
          <TabsTrigger 
            value="documents" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="documents" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
            <CountBadge count={indicators.missingDocuments} variant="warning" />
          </TabsTrigger>
          
          <TabsTrigger 
            value="history" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="history" />
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist.</span>
            <ActivityIndicator lastActivity={indicators.lastActivity} />
          </TabsTrigger>
          
          <TabsTrigger 
            value="workflow" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="workflow" />
            <span className="hidden sm:inline">Workflow</span>
            <span className="sm:hidden">Work.</span>
            <StageBadge currentStage={indicators.currentStage} />
          </TabsTrigger>
          
          <TabsTrigger 
            value="team" 
            className="flex items-center text-xs px-2 py-2"
          >
            <TabIcon icon="team" />
            <span className="hidden sm:inline">Équipe</span>
            <span className="sm:hidden">Team</span>
            <TeamCountBadge count={indicators.teamCount} />
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="info" className="mt-6">
          <FolderInfoTab selectedFolder={selectedFolder} />
        </TabsContent>

        <TabsContent value="containers" className="mt-6">
          <ContainersTab selectedFolder={selectedFolder} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Documents par étapes</h3>
            <p className="text-gray-600">
              Placeholder pour la gestion des documents organisés par workflow.
              Remplacera l'onglet Documents existant avec une approche par étapes.
            </p>
            {indicators.missingDocuments > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-orange-800 text-sm font-medium">
                    {indicators.missingDocuments} document(s) manquant(s)
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Timeline des événements</h3>
            <p className="text-gray-600">
              Placeholder pour l'historique amélioré.
              Remplacera l'onglet Historique existant avec une timeline enrichie.
            </p>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm font-medium">
                  Dernière activité: {indicators.lastActivity}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">ProcessingTimeline (8 étapes)</h3>
            <p className="text-gray-600">
              Placeholder pour le composant ProcessingTimeline.
              Affichera les 8 étapes de traitement avec progression visuelle.
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-800 text-sm font-medium">
                  Étape actuelle: {indicators.currentStage}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">UserAssignments</h3>
            <p className="text-gray-600">
              Placeholder pour le composant UserAssignments.
              Gérera les assignations d'utilisateurs par rôle et étape.
            </p>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-purple-800 text-sm font-medium">
                  {indicators.teamCount} personne(s) assignée(s)
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FolderDetailsTab;