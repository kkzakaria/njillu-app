'use client';

import { 
  Home, 
  FolderOpen, 
  FolderCheck, 
  Archive, 
  Trash2,
  BarChart3, 
  Settings, 
  HelpCircle
} from 'lucide-react';
import { INavigationItem } from '@/types/sidebar.types';
import { useNavigation, useFolders } from '@/hooks/useTranslation';

/**
 * Configuration de navigation spécifique aux dossiers
 * Fournit les items de menu adaptés à la gestion de dossiers
 */
export function useFoldersNavigationItems(): INavigationItem[] {
  const t = useNavigation();
  const tFolders = useFolders();

  return [
    // Navigation principale
    { id: 'dashboard', icon: Home, labelKey: t('dashboard'), href: '/dashboard' },
    
    // Séparateur visuel
    { id: 'folders-section', icon: FolderOpen, labelKey: 'Gestion des dossiers', href: '#', disabled: true },
    
    // Gestion des dossiers par statut
    { 
      id: 'folders-active', 
      icon: FolderOpen, 
      labelKey: tFolders('statusCategories.active'), 
      href: '/folders/active',
      badge: 'NEW'
    },
    { 
      id: 'folders-completed', 
      icon: FolderCheck, 
      labelKey: tFolders('statusCategories.completed'), 
      href: '/folders/completed' 
    },
    { 
      id: 'folders-archived', 
      icon: Archive, 
      labelKey: tFolders('statusCategories.archived'), 
      href: '/folders/archived' 
    },
    { 
      id: 'folders-deleted', 
      icon: Trash2, 
      labelKey: tFolders('statusCategories.deleted'), 
      href: '/folders/deleted' 
    },
    
    // Autres sections
    { id: 'analytics', icon: BarChart3, labelKey: t('analytics'), href: '/analytics' },
    { id: 'settings', icon: Settings, labelKey: t('settings'), href: '/settings' },
    { id: 'help', icon: HelpCircle, labelKey: t('help'), href: '/help' }
  ];
}