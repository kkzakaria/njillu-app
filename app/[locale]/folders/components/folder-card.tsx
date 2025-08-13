'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import {
  Folder,
  FolderOpen,
  FolderArchive,
  FolderCheck,
  FolderX,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Archive,
  Copy,
  Download,
  Calendar,
  FileText
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/priority-badge';
import { ProcessingStageBadge } from '@/components/processing-stage-badge';
import { cn } from '@/lib/utils';
import { useFolders } from '@/hooks/useTranslation';

import type { FolderSummary, FolderStatus } from '@/types/folders';

// Action type for menu items
export interface FolderAction {
  id: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

// Component props
export interface FolderCardProps {
  // Data
  folder: FolderSummary;
  primaryBLNumber?: string;
  statusCategory?: string;
  
  // Behavior
  onClick?: (folder: FolderSummary) => void;
  onActionClick?: (action: string, folder: FolderSummary) => void;
  
  // Styling
  className?: string;
  compact?: boolean;
  
  // Features
  showActions?: boolean;
  actions?: FolderAction[];
  showStatus?: boolean;
  showPriority?: boolean;
  showProcessingStage?: boolean;
  showClient?: boolean;
}

// Default actions
const defaultActions: FolderAction[] = [
  { id: 'view', label: 'view', icon: Eye },
  { id: 'edit', label: 'edit', icon: Edit },
  { separator: true, id: 'sep1' },
  { id: 'duplicate', label: 'duplicate', icon: Copy },
  { id: 'export', label: 'export', icon: Download },
  { id: 'archive', label: 'archive', icon: Archive },
  { separator: true, id: 'sep2' },
  { id: 'delete', label: 'delete', icon: Trash2, variant: 'destructive' },
];

// Get status icon and color
const getStatusIcon = (status: FolderStatus) => {
  switch (status) {
    case 'open':
    case 'processing':
      return { 
        Icon: FolderOpen, 
        colorClass: 'text-amber-500' 
      };
    case 'completed':
    case 'closed':
      return { 
        Icon: FolderCheck, 
        colorClass: 'text-green-500' 
      };
    case 'cancelled':
      return { 
        Icon: FolderX, 
        colorClass: 'text-red-500' 
      };
    case 'on_hold':
      return { 
        Icon: FolderArchive, 
        colorClass: 'text-blue-500' 
      };
    default:
      return { 
        Icon: Folder, 
        colorClass: 'text-muted-foreground' 
      };
  }
};

// Get locale for date-fns
const getDateLocale = (locale: string) => {
  switch (locale) {
    case 'fr':
      return fr;
    case 'es':
      return es;
    default:
      return enUS;
  }
};

// Get contextual date based on status category
const getContextualDate = (folder: FolderSummary, statusCategory?: string) => {
  switch (statusCategory) {
    case 'completed':
      return folder.completion_date || folder.created_date;
    case 'archived':
      return folder.archived_date || folder.created_date;
    case 'deleted':
      return folder.deleted_date || folder.created_date;
    default:
      return folder.created_date;
  }
};

// Get contextual date label key for translation
const getDateLabelKey = (statusCategory?: string) => {
  switch (statusCategory) {
    case 'completed':
      return 'completedOn';
    case 'archived':
      return 'archivedOn';
    case 'deleted':
      return 'deletedOn';
    default:
      return 'createdOn';
  }
};

// Determine if priority and processing stage should be shown based on status
const shouldShowProgressInfo = (statusCategory?: string) => {
  return statusCategory === 'active' || !statusCategory;
};

export function FolderCard({
  folder,
  primaryBLNumber,
  statusCategory,
  onClick,
  onActionClick,
  className,
  compact = false,
  showActions = true,
  actions = defaultActions,
  showStatus = true, // eslint-disable-line @typescript-eslint/no-unused-vars -- keeping for API compatibility
  showPriority = true,
  showProcessingStage = true,
  showClient = false,
}: FolderCardProps) {
  const locale = useLocale();
  const t = useFolders();
  const dateLocale = getDateLocale(locale);
  
  // Determine contextual display logic
  const showProgressInfo = shouldShowProgressInfo(statusCategory);
  const contextualDate = getContextualDate(folder, statusCategory);
  const dateLabelKey = getDateLabelKey(statusCategory);


  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (locale === 'fr') {
      return format(date, "dd/MM/yyyy 'à' HH:mm:ss", { locale: dateLocale });
    } else if (locale === 'es') {
      return format(date, "dd/MM/yyyy 'a las' HH:mm:ss", { locale: dateLocale });
    } else {
      return format(date, 'MM/dd/yyyy \'at\' h:mm:ss a', { locale: dateLocale });
    }
  };

  // Get status icon and color for this folder
  const { Icon: StatusIcon, colorClass } = getStatusIcon(folder.status);

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(folder);
    }
  };

  // Handle action click
  const handleActionClick = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(actionId, folder);
    }
  };

  // Prepare translated actions
  const translatedActions = actions.map((action) => ({
    ...action,
    label: action.separator || !action.label ? '' : t(`actions.${action.label}`)
  }));

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md cursor-pointer',
        'hover:border-primary/50',
        compact && 'p-0',
        className
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={t('accessibility.folderCard')}
    >
      <CardHeader className={cn(
        'flex flex-row items-start justify-between relative',
        compact ? 'p-3 pb-2' : 'p-4 pb-3'
      )}>
        <div className={cn(
          'flex items-start',
          compact ? 'gap-2' : 'gap-3'
        )}>
          <StatusIcon 
            className={cn(
              'mt-0.5',
              compact ? 'h-4 w-4' : 'h-5 w-5',
              colorClass
            )} 
            aria-hidden="true"
          />
          <div className={cn(
            'flex flex-col',
            compact ? 'gap-0.5' : 'gap-1'
          )}>
            <div className={cn(
              'flex items-center',
              compact ? 'gap-1.5' : 'gap-2'
            )}>
              <h3 className={cn(
                'font-semibold leading-tight',
                compact ? 'text-sm' : 'text-base'
              )}>
                {folder.folder_number}
              </h3>
              {showProgressInfo && showPriority && folder.priority && (
                <PriorityBadge 
                  priority={folder.priority}
                  aria-label={`${t('accessibility.folderPriority')}: ${t(`priority.${folder.priority}`)}`}
                >
                  {t(`priority.${folder.priority}`)}
                </PriorityBadge>
              )}
            </div>
            {showClient && folder.client_name && (
              <p className="text-sm text-muted-foreground">
                {folder.client_name}
              </p>
            )}
          </div>
        </div>
        
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 absolute top-2 right-2"
                aria-label={t('accessibility.openMenu')}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {translatedActions.map((action, index) => {
                if (action.separator) {
                  return <DropdownMenuSeparator key={`${action.id}-${index}`} />;
                }
                
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    onClick={(e) => handleActionClick(e, action.id)}
                    className={cn(
                      action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className={cn(
        compact ? 'p-3 pt-0 space-y-1' : 'p-4 pt-0 space-y-2'
      )}>
        {primaryBLNumber ? (
          <div className={cn(
            'flex items-center text-sm',
            compact ? 'gap-1.5' : 'gap-2'
          )}>
            <FileText className={cn(
              'text-muted-foreground',
              compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )} aria-hidden="true" />
            <span className={cn(
              'font-mono',
              compact ? 'text-xs' : 'text-sm'
            )}>{primaryBLNumber}</span>
          </div>
        ) : (
          <p className={cn(
            'text-muted-foreground italic',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {t('labels.noBL')}
          </p>
        )}

        {!compact && folder.origin_name && folder.destination_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{folder.origin_name}</span>
            <span>→</span>
            <span>{folder.destination_name}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        'justify-between',
        compact ? 'p-3 pt-1.5' : 'p-4 pt-2'
      )}>
        {showProgressInfo && showProcessingStage && folder.processing_stage ? (
          <ProcessingStageBadge 
            stage={folder.processing_stage}
            aria-label={`${t('accessibility.processingStage')}: ${t(`processingStages.${folder.processing_stage}`)}`}
          >
            {t(`processingStages.${folder.processing_stage}`)}
          </ProcessingStageBadge>
        ) : (
          <div /> 
        )}
        
        <div className={cn(
          'flex items-center text-muted-foreground',
          compact ? 'gap-1 text-xs' : 'gap-2 text-xs'
        )}>
          <Calendar className={cn(
            compact ? 'h-3 w-3' : 'h-3 w-3'
          )} aria-hidden="true" />
          <time dateTime={contextualDate} className={cn(
            compact ? 'text-xs leading-none' : 'text-xs'
          )}>
            {formatDate(contextualDate)}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
}