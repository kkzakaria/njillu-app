'use client'

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TwoColumnsLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

/**
 * Mise en page à deux colonnes : colonne gauche 25% (min 300px, max 400px), colonne droite adaptative.
 * Sur mobile, les colonnes sont empilées verticalement.
 */
export function TwoColumnsLayout({ left, right, className }: TwoColumnsLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`flex h-full w-full ${isMobile ? 'flex-col' : 'flex-row'} ${className ?? ''}`}
    >
      <aside
        className={`h-full flex flex-col min-h-0 flex-shrink-0 basis-1/4 min-w-[300px] max-w-[400px] border-r border-border bg-muted ${isMobile ? 'border-b border-r-0 max-w-full w-full min-w-0 basis-auto' : ''}`}
        style={{ boxSizing: 'border-box' }}
      >
        {left}
      </aside>
      <section className={`flex-1 min-w-0 h-full overflow-auto ${isMobile ? 'w-full' : ''}`}>
        {right}
      </section>
    </div>
  );
} 