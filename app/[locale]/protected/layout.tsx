'use client';

import { MainAppLayout } from "@/components/layouts/main-app-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainAppLayout 
      debugMode={false}
      appTitle="Njillu App - Espace Protégé"
    >
      {children}
    </MainAppLayout>
  );
}