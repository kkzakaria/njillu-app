'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DetailActivities } from './detail-activities';
import { Clock, Users, Paperclip, Info, List } from 'lucide-react';
import type { 
  DetailViewTab,
  DetailViewActivity,
  DetailViewRelated
} from '@/types';

// ============================================================================
// DETAIL TABS COMPONENT
// ============================================================================

interface DetailTabsProps {
  tabs: DetailViewTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  entity: any;
  activities?: DetailViewActivity[];
  related?: DetailViewRelated;
}

export function DetailTabs({
  tabs,
  activeTab,
  onTabChange,
  entity,
  activities,
  related
}: DetailTabsProps) {
  const getTabIcon = (tabId: string) => {
    const icons: Record<string, React.ReactNode> = {
      overview: <Info className="h-4 w-4" />,
      details: <List className="h-4 w-4" />,
      activities: <Clock className="h-4 w-4" />,
      related: <Users className="h-4 w-4" />,
      attachments: <Paperclip className="h-4 w-4" />
    };
    return icons[tabId] || <Info className="h-4 w-4" />;
  };

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return <OverviewTab entity={entity} />;
      case 'details':
        return <DetailsTab entity={entity} />;
      case 'activities':
        return <DetailActivities activities={activities || []} />;
      case 'related':
        return <RelatedTab related={related} />;
      case 'attachments':
        return <AttachmentsTab entity={entity} />;
      default:
        return <div className="p-6 text-center text-muted-foreground">Content not available</div>;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Tab navigation */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary bg-muted/50'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {tab.icon ? (
                <span>{tab.icon}</span>
              ) : (
                getTabIcon(tab.id)
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {renderTabContent(activeTab)}
        </ScrollArea>
      </div>
    </div>
  );
}

// ============================================================================
// TAB CONTENT COMPONENTS
// ============================================================================

function OverviewTab({ entity }: { entity: any }) {
  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;

    return (
      <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
        </dd>
      </div>
    );
  };

  // Key fields to show in overview
  const overviewFields = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'created_at', label: 'Created', format: (v: string) => new Date(v).toLocaleString() },
    { key: 'updated_at', label: 'Updated', format: (v: string) => new Date(v).toLocaleString() },
    { key: 'assigned_to', label: 'Assigned To' },
    { key: 'due_date', label: 'Due Date', format: (v: string) => new Date(v).toLocaleDateString() }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Summary</h3>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            {entity.description || entity.summary || 'No description available.'}
          </p>
        </div>
      </div>

      <Separator />

      {/* Key Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Key Information</h3>
        <dl className="divide-y">
          {overviewFields.map(({ key, label, format }) => {
            const value = entity[key];
            if (!value) return null;
            
            return (
              <div key={key} className="grid grid-cols-3 gap-4 py-3">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="col-span-2 text-sm">
                  {format ? format(value) : String(value)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

function DetailsTab({ entity }: { entity: any }) {
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  };

  // Group fields by category
  const systemFields = ['id', 'created_at', 'updated_at', 'version'];
  const allFields = Object.keys(entity).filter(key => !systemFields.includes(key));
  
  return (
    <div className="p-6 space-y-6">
      {/* All Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Details</h3>
        <dl className="divide-y">
          {allFields.map((key) => (
            <div key={key} className="grid grid-cols-3 gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </dt>
              <dd className="col-span-2 text-sm font-mono">
                <pre className="whitespace-pre-wrap">
                  {renderValue(entity[key])}
                </pre>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {systemFields.some(field => entity[field]) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Information</h3>
            <dl className="divide-y">
              {systemFields.map((key) => {
                if (!entity[key]) return null;
                return (
                  <div key={key} className="grid grid-cols-3 gap-4 py-3">
                    <dt className="text-sm font-medium text-muted-foreground">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </dt>
                    <dd className="col-span-2 text-sm font-mono">
                      {renderValue(entity[key])}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </>
      )}
    </div>
  );
}

function RelatedTab({ related }: { related?: DetailViewRelated }) {
  if (!related || Object.keys(related).length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No related items found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {Object.entries(related).map(([relationName, relationData]) => (
        <div key={relationName} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {relationName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <Badge variant="secondary">
              {relationData.count}
            </Badge>
          </div>

          {relationData.items && relationData.items.length > 0 ? (
            <div className="space-y-2">
              {relationData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.type} • {item.status}
                    </div>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
              
              {relationData.count > relationData.items.length && (
                <div className="text-center py-2">
                  <button className="text-sm text-primary hover:underline">
                    View {relationData.count - relationData.items.length} more...
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No {relationName.toLowerCase()} items
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function AttachmentsTab({ entity }: { entity: any }) {
  const attachments = entity.attachments || entity.documents || [];

  if (attachments.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No attachments found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Attachments</h3>
      
      <div className="grid gap-4">
        {attachments.map((attachment: any, index: number) => (
          <div
            key={attachment.id || index}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <div className="font-medium">
                  {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {attachment.type || attachment.mime_type} • {attachment.size || 'Unknown size'}
                </div>
              </div>
            </div>
            
            {attachment.url && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}