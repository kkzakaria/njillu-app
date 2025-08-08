'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// BREADCRUMB NAVIGATION COMPONENT
// ============================================================================

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export function BreadcrumbNavigation({ breadcrumbs, className }: BreadcrumbNavigationProps) {
  if (breadcrumbs.length === 0) return null;

  const handleNavigate = (href?: string) => {
    if (href) {
      // In a real app, you'd use Next.js router or similar
      window.location.href = href;
    }
  };

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {/* Home link */}
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('/')}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Button>
        </li>

        {/* Breadcrumb items */}
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              
              {breadcrumb.href && !isLast ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate(breadcrumb.href)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  {breadcrumb.label}
                </Button>
              ) : (
                <span
                  className={cn(
                    'px-2 py-1',
                    isLast 
                      ? 'font-medium text-foreground' 
                      : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {breadcrumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// BREADCRUMB SEPARATOR
// ============================================================================

export function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <ChevronRight className={cn('h-4 w-4 text-muted-foreground', className)} />
  );
}

// ============================================================================
// MOBILE BREADCRUMB (SIMPLIFIED)
// ============================================================================

interface MobileBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function MobileBreadcrumb({ 
  breadcrumbs, 
  showBackButton = true,
  onBack,
  className 
}: MobileBreadcrumbProps) {
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showBackButton && parentBreadcrumb && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="ml-1 truncate max-w-[100px]">
            {parentBreadcrumb.label}
          </span>
        </Button>
      )}
      
      <div className="text-sm font-medium truncate">
        {lastBreadcrumb?.label}
      </div>
    </div>
  );
}

// ============================================================================
// BREADCRUMB WITH DROPDOWN (FOR LONG PATHS)
// ============================================================================

interface CollapsedBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
  maxVisible?: number;
  className?: string;
}

export function CollapsedBreadcrumb({ 
  breadcrumbs, 
  maxVisible = 3,
  className 
}: CollapsedBreadcrumbProps) {
  if (breadcrumbs.length <= maxVisible) {
    return <BreadcrumbNavigation breadcrumbs={breadcrumbs} className={className} />;
  }

  const visibleBreadcrumbs = [
    breadcrumbs[0], // First item
    ...breadcrumbs.slice(-(maxVisible - 1)) // Last few items
  ];
  
  const hiddenBreadcrumbs = breadcrumbs.slice(1, -(maxVisible - 1));

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {/* Home */}
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
        </li>

        {/* First breadcrumb */}
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => visibleBreadcrumbs[0].href && (window.location.href = visibleBreadcrumbs[0].href)}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            {visibleBreadcrumbs[0].label}
          </Button>
        </li>

        {/* Collapsed indicator */}
        {hiddenBreadcrumbs.length > 0 && (
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="px-2 py-1 text-muted-foreground">...</span>
          </li>
        )}

        {/* Remaining visible breadcrumbs */}
        {visibleBreadcrumbs.slice(1).map((breadcrumb, index) => {
          const isLast = index === visibleBreadcrumbs.length - 2;
          
          return (
            <li key={`end-${index}`} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              
              {breadcrumb.href && !isLast ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = breadcrumb.href!}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  {breadcrumb.label}
                </Button>
              ) : (
                <span
                  className={cn(
                    'px-2 py-1',
                    isLast 
                      ? 'font-medium text-foreground' 
                      : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {breadcrumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}