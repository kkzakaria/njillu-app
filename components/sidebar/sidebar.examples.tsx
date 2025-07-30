// Exemples d'utilisation de la sidebar refactorisée selon SOLID
'use client'

import React from 'react'
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  BarChart3, 
  Shield 
} from 'lucide-react'

import {
  AppSidebar,
  createSidebarVariant,
  INavigationItem,
  SidebarConfig
} from './index'

// Exemple 1: Sidebar basique avec configuration par défaut
export const BasicSidebarExample: React.FC = () => {
  const navigationItems: INavigationItem[] = [
    { id: 'home', icon: Home, labelKey: 'Accueil', href: '/' },
    { id: 'profile', icon: User, labelKey: 'Profil', href: '/profile' },
    { id: 'settings', icon: Settings, labelKey: 'Paramètres', href: '/settings' }
  ]

  return (
    <AppSidebar 
      navigationItems={navigationItems}
      onItemClick={(item) => console.log('Navigation vers:', item.href)}
    />
  )
}

// Exemple 2: Sidebar avec configuration personnalisée (OCP)
export const CustomConfigSidebarExample: React.FC = () => {
  const customConfig: Partial<SidebarConfig> = {
    position: 'right',
    theme: 'dark',
    collapsedWidth: 80,
    expandedWidth: 280,
    animationDuration: 500,
    autoCollapse: false
  }

  const navigationItems: INavigationItem[] = [
    { id: 'dashboard', icon: Home, labelKey: 'Dashboard', href: '/dashboard' },
    { id: 'analytics', icon: BarChart3, labelKey: 'Analytics', href: '/analytics', badge: '5' },
    { id: 'security', icon: Shield, labelKey: 'Security', href: '/security', isActive: true }
  ]

  return (
    <AppSidebar 
      config={customConfig}
      navigationItems={navigationItems}
      className="shadow-2xl"
    />
  )
}

// Exemple 3: Sidebar avec provider personnalisé (DIP)
export const CustomProviderSidebarExample: React.FC = () => {
  // Provider personnalisé pour les données utilisateur
  const customUserDataProvider = {
    async getUserName() { return 'John Doe Custom' },
    async getUserEmail() { return 'john.custom@example.com' },
    async getUserAvatar() { return 'https://example.com/avatar.jpg' }
  }

  const navigationItems: INavigationItem[] = [
    { id: 'home', icon: Home, labelKey: 'Accueil', href: '/' },
    { id: 'settings', icon: Settings, labelKey: 'Paramètres', href: '/settings' }
  ]

  return (
    <AppSidebar 
      navigationItems={navigationItems}
      userDataProvider={customUserDataProvider}
      onItemClick={(item) => {
        console.log('Custom action for:', item.id)
        // Logique personnalisée ici
      }}
    />
  )
}

// Exemple 4: Variant de sidebar créé avec factory (OCP)
const AdminSidebar = createSidebarVariant(
  {
    theme: 'dark',
    expandedWidth: 300,
    position: 'left'
  },
  [
    { id: 'admin-dashboard', icon: Home, labelKey: 'Admin Dashboard', href: '/admin' },
    { id: 'users', icon: User, labelKey: 'Users Management', href: '/admin/users' },
    { id: 'system', icon: Settings, labelKey: 'System Settings', href: '/admin/system' },
    { id: 'security', icon: Shield, labelKey: 'Security Center', href: '/admin/security' }
  ]
)

export const AdminSidebarExample: React.FC = () => {
  return (
    <AdminSidebar 
      onItemClick={(item) => console.log('Admin action:', item.id)}
    />
  )
}

// Exemple 5: Sidebar avec gestion d'événements avancée
export const AdvancedEventsSidebarExample: React.FC = () => {
  const handleItemClick = (item: INavigationItem) => {
    switch (item.id) {
      case 'logout':
        // Logique de déconnexion
        console.log('Logging out...')
        break
      case 'settings':
        // Ouvrir un modal de paramètres
        console.log('Opening settings modal...')
        break
      default:
        // Navigation normale
        console.log('Navigating to:', item.href)
    }
  }

  const navigationItems: INavigationItem[] = [
    { 
      id: 'documents', 
      icon: FileText, 
      labelKey: 'Documents', 
      href: '/documents',
      badge: 12 
    },
    { 
      id: 'settings', 
      icon: Settings, 
      labelKey: 'Settings', 
      href: '/settings' 
    }
  ]

  return (
    <AppSidebar 
      navigationItems={navigationItems}
      onItemClick={handleItemClick}
      config={{
        animationDuration: 200,
        hoverDelay: 50
      }}
    />
  )
}

// Exemple 6: Sidebar responsive avec breakpoints personnalisés
export const ResponsiveSidebarExample: React.FC = () => {
  return (
    <AppSidebar 
      config={{
        mobileBreakpoint: 768,  // md
        tabletBreakpoint: 640,  // sm
        autoCollapse: true
      }}
      className="lg:shadow-lg"
    />
  )
}

// Export des exemples pour documentation
export const SidebarExamples = {
  Basic: BasicSidebarExample,
  CustomConfig: CustomConfigSidebarExample,
  CustomProvider: CustomProviderSidebarExample,
  Admin: AdminSidebarExample,
  AdvancedEvents: AdvancedEventsSidebarExample,
  Responsive: ResponsiveSidebarExample
}