'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Clock, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EntityType } from '@/types';
import type { ListItemProps } from '../types';

// ============================================================================
// LIST ITEM COMPONENT
// ============================================================================

export function ListItem<T extends EntityType>({
  item,
  selected = false,
  onSelect,
  onAction,
  className
}: ListItemProps<T>) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId, item.id);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      // Bills of Lading statuses
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'in_transit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      
      // Folder statuses
      'pending': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'on_hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'archived': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      
      // Container statuses
      'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'arrived': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'delayed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    };
    
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const getPriorityColor = (priority?: string): string => {
    if (!priority) return '';
    
    const priorityColors: Record<string, string> = {
      'low': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100',
      'medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100',
      'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100',
      'urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100',
    };
    
    return priorityColors[priority.toLowerCase()] || '';
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        selected && 'bg-muted',
        'hover:bg-muted/50 transition-colors cursor-pointer',
        className
      )}
      onClick={handleSelect}
    >
      {/* Selection checkbox (if multi-select) */}
      <Checkbox
        checked={selected}
        onCheckedChange={handleSelect}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title and subtitle */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {item.subtitle}
              </p>
            )}
          </div>
          
          {/* Actions menu */}
          {item.actions && item.actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.actions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action.id);
                    }}
                    disabled={action.disabled}
                    className={cn(
                      action.variant === 'danger' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Badges and metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <Badge
            variant="secondary"
            className={cn('text-xs', getStatusColor(item.status))}
          >
            {item.status.replace('_', ' ')}
          </Badge>

          {/* Priority badge */}
          {item.priority && (
            <Badge
              variant="outline"
              className={cn('text-xs', getPriorityColor(item.priority))}
            >
              {item.priority}
            </Badge>
          )}

          {/* Custom badges */}
          {item.badges?.map((badge, index) => {
            // Map our badge variants to shadcn/ui Badge variants
            const mapVariant = (variant: string) => {
              switch (variant) {
                case 'default':
                case 'info':
                  return 'secondary';
                case 'success':
                  return 'default';
                case 'warning':
                case 'danger':
                  return 'destructive';
                default:
                  return 'secondary';
              }
            };
            
            return (
              <Badge
                key={index}
                variant={mapVariant(badge.variant)}
                className="text-xs"
                title={badge.tooltip}
              >
                {badge.icon && <span className="mr-1">{badge.icon}</span>}
                {badge.label}
              </Badge>
            );
          })}

          {/* Updated timestamp */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(item.updatedAt), 'MMM d, HH:mm')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}