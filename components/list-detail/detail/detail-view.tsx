'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DetailTabs } from './detail-tabs';
import { DetailActions } from './detail-actions';
import { DetailActivities } from './detail-activities';
import { BreadcrumbNavigation } from '../navigation/breadcrumb-navigation';
import { ArrowLeft, AlertCircle, RefreshCw, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import { useListDetail } from '../context/list-detail-context';
import type { EntityType } from '@/types';
import type { DetailViewProps } from '../types';

// ============================================================================
// DETAIL VIEW COMPONENT
// ============================================================================

export function DetailView<T extends EntityType>({
  data,
  loading,
  error,
  onClose,
  onEdit,
  onDelete,
  className
}: DetailViewProps<T>) {
  const t = useTranslations();
  const { config, isMobile } = useListDetail<T>();
  const [activeTab, setActiveTab] = useState('overview');

  // Handle refresh
  const handleRefresh = () => {
    if (data) {
      // Re-load the detail data
      window.location.reload();
    }
  };

  // Loading state
  if (loading && !data) {
    return (
      <Card className={cn('flex h-full flex-col', className)}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('detail.backToList')}
              </Button>
            )}
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('flex h-full flex-col', className)}>
        <CardHeader className="border-b">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose} className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('detail.backToList')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                {t('detail.error')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {error}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className={cn('flex h-full flex-col', className)}>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-muted-foreground">
              {t('detail.notFound')}
            </div>
            <div className="text-sm text-muted-foreground">
              Select an item from the list to view details
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { entity, metadata, activities, related } = data;

  // Get status color
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'pending': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <CardHeader className="border-b space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('detail.backToList')}
            </Button>
          )}
          
          {!isMobile && metadata.breadcrumbs && (
            <BreadcrumbNavigation breadcrumbs={metadata.breadcrumbs} />
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>

            {metadata.permissions.canEdit && (
              <Button
                size="sm"
                onClick={() => onEdit?.(entity.id)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('actions.edit')}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(entity.id)}>
                  Copy ID
                </DropdownMenuItem>
                {metadata.permissions.canShare && (
                  <DropdownMenuItem>
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {metadata.permissions.canDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(entity.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    {t('actions.delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and status */}
        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {(entity as any).title || (entity as any).name || `${config.entityType} ${entity.id}`}
            </h1>
            {(entity as any).description && (
              <p className="text-muted-foreground">
                {(entity as any).description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor((entity as any).status || 'draft')}>
              {((entity as any).status || 'draft').replace('_', ' ')}
            </Badge>
            
            {(entity as any).priority && (
              <Badge variant="outline">
                {(entity as any).priority}
              </Badge>
            )}

            {(entity as any).created_at && (
              <span className="text-sm text-muted-foreground">
                Created {new Date((entity as any).created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content with tabs */}
      <CardContent className="flex-1 overflow-hidden p-0">
        {metadata.tabs && metadata.tabs.length > 0 ? (
          <DetailTabs
            tabs={metadata.tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            entity={entity}
            activities={activities}
            related={related}
          />
        ) : (
          <div className="h-full overflow-auto p-6">
            <DetailOverview entity={entity} />
          </div>
        )}
      </CardContent>

      {/* Actions panel (mobile) */}
      {isMobile && (
        <div className="border-t p-4">
          <DetailActions
            entity={entity}
            permissions={metadata.permissions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// DETAIL OVERVIEW COMPONENT
// ============================================================================

function DetailOverview({ entity }: { entity: any }) {
  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;

    return (
      <div className="space-y-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </dd>
      </div>
    );
  };

  // Group fields by category
  const basicFields = ['id', 'name', 'title', 'description', 'status', 'priority'];
  const dateFields = ['created_at', 'updated_at', 'completed_at', 'due_date'];
  const otherFields = Object.keys(entity).filter(
    key => !basicFields.includes(key) && !dateFields.includes(key)
  );

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('ID', entity.id)}
          {renderField('Name', entity.name || entity.title)}
          {renderField('Description', entity.description)}
          {renderField('Status', entity.status)}
          {renderField('Priority', entity.priority)}
        </dl>
      </div>

      {/* Dates */}
      {dateFields.some(field => entity[field]) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dates</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dateFields.map(field => entity[field] && renderField(
                field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                new Date(entity[field]).toLocaleString()
              ))}
            </dl>
          </div>
        </>
      )}

      {/* Additional Fields */}
      {otherFields.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherFields.map(field => renderField(
                field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                entity[field]
              ))}
            </dl>
          </div>
        </>
      )}
    </div>
  );
}