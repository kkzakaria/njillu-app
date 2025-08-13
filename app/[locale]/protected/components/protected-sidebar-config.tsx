'use client';

import { 
  Home, 
  User, 
  Shield, 
  Settings, 
  HelpCircle,
  FolderOpen,
  BarChart3,
  LogOut
} from 'lucide-react';
import { INavigationItem } from '@/types/sidebar.types';
import { useNavigation } from '@/hooks/useTranslation';

/**
 * Configuration de navigation spécifique à la page protégée
 * Fournit les items de menu adaptés à l'espace sécurisé
 */
export function useProtectedNavigationItems(): INavigationItem[] {
  const t = useNavigation();

  return [
    // Navigation principale
    { id: 'dashboard', icon: Home, labelKey: t('dashboard'), href: '/dashboard' },
    
    // Section utilisateur
    { 
      id: 'protected', 
      icon: Shield, 
      labelKey: 'Espace Protégé', 
      href: '/protected',
      badge: 'SECURE'
    },
    { id: 'profile', icon: User, labelKey: t('profile'), href: '/profile' },
    
    // Gestion
    { 
      id: 'folders', 
      icon: FolderOpen, 
      labelKey: 'Dossiers', 
      href: '/folders/active' 
    },
    { id: 'analytics', icon: BarChart3, labelKey: t('analytics'), href: '/analytics' },
    
    // Configuration
    { id: 'settings', icon: Settings, labelKey: t('settings'), href: '/settings' },
    { id: 'help', icon: HelpCircle, labelKey: t('help'), href: '/help' },
    
    // Déconnexion
    { 
      id: 'logout', 
      icon: LogOut, 
      labelKey: 'Se déconnecter', 
      href: '/auth/logout',
      variant: 'destructive'
    }
  ];
}