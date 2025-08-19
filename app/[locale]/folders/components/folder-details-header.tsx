'use client'

import { 
  Button 
} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { 
  Edit, 
  Trash2, 
  Share2,
  MoreVertical,
  Clock,
  Package,
  CalendarClock,
  Printer
} from 'lucide-react';
import type { FolderSummary, FolderStatus, FolderPriority } from '@/types/folders';
import { PriorityBadge } from './priority-badge';

interface FolderDetailsHeaderProps {
  selectedFolder?: FolderSummary | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function FolderDetailsHeader({
  selectedFolder,
  onEdit,
  onDelete,
  onShare,
  onPrint
}: FolderDetailsHeaderProps) {
  if (!selectedFolder) {
    return (
      <div className="p-6 border-b bg-background border-border">
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Sélectionnez un dossier pour voir les détails</p>
        </div>
      </div>
    );
  }

  // Calculs pour les métriques
  const mockProgress = Math.floor(Math.random() * 100); // Mock progression
  const mockContainers = Math.floor(Math.random() * 5) + 1; // Mock nombre conteneurs
  const mockDaysRemaining = Math.floor(Math.random() * 30) + 1; // Mock jours restants


  return (
    <div className="border-b bg-background border-border">
      {/* Header principal */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedFolder.folder_number}
              </h1>
              <PriorityBadge priority={selectedFolder.priority} />
            </div>

            {/* Métriques rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Progression */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Progression</span>
                    <span className="text-sm font-bold text-blue-600">{mockProgress}%</span>
                  </div>
                  <Progress value={mockProgress} className="h-2" />
                </div>
              </div>

              {/* Conteneurs */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Conteneurs</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{mockContainers}</p>
                </div>
              </div>

              {/* Jours restants */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <CalendarClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Jours restants</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{mockDaysRemaining}j</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Boutons desktop - masqués sur mobile */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                onClick={onEdit}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </Button>

              <Button 
                onClick={onShare}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </Button>

              <Button 
                onClick={onPrint}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </Button>

              <Button 
                onClick={onDelete}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-600 border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </Button>
            </div>

            {/* Menu mobile - visible uniquement sur mobile */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Route et informations complémentaires */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedFolder.origin_name} → {selectedFolder.destination_name}
              </span>
              <span>•</span>
              <span>
                Créé le {new Date(selectedFolder.created_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {selectedFolder.reference_number && (
              <div>
                Réf. client: <span className="font-medium">{selectedFolder.reference_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}