'use client';

import React from 'react';
import { AppBar } from '@/components/appbar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { INavigationItem } from '@/types/sidebar.types';

interface MainAppLayoutProps {
  children: React.ReactNode;
  className?: string;
  navigationItems?: INavigationItem[];
  sidebarConfig?: {
    showHeader?: boolean;
    showFooter?: boolean;
    headerTitle?: string;
  };
}

/**
 * Layout principal de l'application avec sidebar et appbar intégrées
 * Fournit la structure de base pour toutes les pages principales
 */
export function MainAppLayout({ 
  children, 
  className,
  navigationItems,
  sidebarConfig 
}: MainAppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        {/* AppBar */}
        <AppBar />
        
        {/* Conteneur principal avec sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AppSidebar 
            navigationItems={navigationItems}
            config={sidebarConfig}
          />
          
          {/* Contenu principal */}
          <main className={`flex-1 overflow-hidden ${className || ''}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}