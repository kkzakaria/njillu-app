'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  User, 
  Edit, 
  Trash, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Paperclip
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { DetailViewActivity } from '@/types';

// ============================================================================
// DETAIL ACTIVITIES COMPONENT
// ============================================================================

interface DetailActivitiesProps {
  activities: DetailViewActivity[];
  className?: string;
}

export function DetailActivities({ activities, className }: DetailActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('p-6 text-center text-muted-foreground', className)}>
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No activities found</p>
        <p className="text-sm mt-2">Activity history will appear here when actions are performed.</p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, DetailViewActivity[]>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={cn('p-6', className)}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Activity History</h3>
        
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                {/* Date header */}
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </div>
                  <Separator className="flex-1" />
                </div>

                {/* Activities for this date */}
                <div className="space-y-4">
                  {groupedActivities[date].map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: DetailViewActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const [showChanges, setShowChanges] = React.useState(false);

  const getActionIcon = (action: string) => {
    const icons = {
      created: <CheckCircle className="h-4 w-4 text-green-500" />,
      updated: <Edit className="h-4 w-4 text-blue-500" />,
      deleted: <Trash className="h-4 w-4 text-red-500" />,
      status_changed: <AlertCircle className="h-4 w-4 text-orange-500" />,
      comment_added: <MessageCircle className="h-4 w-4 text-purple-500" />,
    };
    return icons[action as keyof typeof icons] || <Info className="h-4 w-4 text-gray-500" />;
  };

  const getActionColor = (action: string) => {
    const colors = {
      created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      status_changed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      comment_added: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const hasChanges = activity.changes && Object.keys(activity.changes).length > 0;
  const hasAttachments = activity.attachments && activity.attachments.length > 0;

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
      
      {/* Activity indicator */}
      <div className="absolute left-1 top-2 p-1 bg-background border border-border rounded-full">
        {getActionIcon(activity.action)}
      </div>

      {/* Activity content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', getActionColor(activity.action))}>
              {activity.action.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(activity.created_at), 'HH:mm')}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src="" />
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            System
          </span>
        </div>

        {/* Description */}
        <p className="text-sm">{activity.description}</p>

        {/* Comment */}
        {activity.comment && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"{activity.comment}"</p>
          </div>
        )}

        {/* Changes */}
        {hasChanges && (
          <Collapsible open={showChanges} onOpenChange={setShowChanges}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <ChevronDown className={cn(
                  'h-3 w-3 mr-1 transition-transform',
                  showChanges && 'transform rotate-180'
                )} />
                View Changes ({Object.keys(activity.changes!).length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                {Object.entries(activity.changes!).map(([field, change]) => (
                  <div key={field} className="text-xs">
                    <div className="font-medium mb-1">
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">From:</div>
                        <div className="p-1 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 font-mono">
                          {String(change.from)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">To:</div>
                        <div className="p-1 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300 font-mono">
                          {String(change.to)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Attachments:
            </div>
            <div className="space-y-1">
              {activity.attachments!.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs"
                >
                  <Paperclip className="h-3 w-3" />
                  <span className="flex-1">{attachment.name}</span>
                  <span className="text-muted-foreground">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </span>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}