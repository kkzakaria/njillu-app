'use client';

import React from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InfoBannerProps {
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClose?: () => void;
  className?: string;
  variant?: 'info' | 'warning' | 'success';
}

export function InfoBanner({
  message,
  icon: Icon = Info,
  onClose,
  className,
  variant = 'info'
}: InfoBannerProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const iconStyles = {
    info: 'text-blue-500',
    warning: 'text-amber-500', 
    success: 'text-green-500'
  };

  return (
    <div className={cn(
      'rounded-lg border p-3 flex items-start gap-3',
      variantStyles[variant],
      className
    )}>
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconStyles[variant])} />
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-black/5"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}