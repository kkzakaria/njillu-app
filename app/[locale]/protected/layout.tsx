'use client';

import { MainAppLayout } from "@/components/layouts/main-app-layout";
import { useProtectedNavigationItems } from "./components/protected-sidebar-config";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = useProtectedNavigationItems();

  return (
    <MainAppLayout 
      debugMode={false}
      appTitle="Njillu App - Espace Protégé"
      navigationItems={navigationItems}
      sidebarConfig={{
        showHeader: true,
        showFooter: true,
        headerClickable: true,
        animationDuration: 300,
        hoverDelay: 100
      }}
    >
      {children}
    </MainAppLayout>
  );
}