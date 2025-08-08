'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Share, 
  Copy, 
  Download, 
  Archive,
  MoreHorizontal,
  Star,
  Flag,
  Send
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import type { EntityId } from '@/types';

// ============================================================================
// DETAIL ACTIONS COMPONENT
// ============================================================================

interface DetailActionsProps {
  entity: any;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canComment: boolean;
    canShare: boolean;
  };
  onEdit?: (id: EntityId) => void;
  onDelete?: (id: EntityId) => void;
  onShare?: (id: EntityId) => void;
  onArchive?: (id: EntityId) => void;
  onDuplicate?: (id: EntityId) => void;
  className?: string;
}

export function DetailActions({
  entity,
  permissions,
  onEdit,
  onDelete,
  onShare,
  onArchive,
  onDuplicate,
  className
}: DetailActionsProps) {
  const t = useTranslations();

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText((entity as any).id);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('selected', (entity as any).id);
      await navigator.clipboard.writeText(url.toString());
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleExport = () => {
    // Export entity data as JSON
    const dataStr = JSON.stringify(entity, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(entity as any).id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {/* Primary actions */}
      <div className="flex items-center gap-2">
        {permissions.canEdit && (
          <Button
            onClick={() => onEdit?.((entity as any).id)}
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('actions.edit')}
          </Button>
        )}

        {permissions.canShare && (
          <Button
            onClick={() => onShare?.((entity as any).id)}
            variant="outline"
            size="sm"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      {/* Secondary actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Copy actions */}
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Entity actions */}
          {onDuplicate && (
            <DropdownMenuItem onClick={() => onDuplicate((entity as any).id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem>
            <Star className="mr-2 h-4 w-4" />
            Add to Favorites
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Flag className="mr-2 h-4 w-4" />
            Flag for Review
          </DropdownMenuItem>
          
          {onArchive && entity.status !== 'archived' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive((entity as any).id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </>
          )}
          
          {permissions.canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.((entity as any).id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============================================================================
// COMPACT ACTIONS (FOR MOBILE)
// ============================================================================

interface CompactActionsProps {
  entity: any;
  permissions: DetailActionsProps['permissions'];
  onEdit?: (id: EntityId) => void;
  onDelete?: (id: EntityId) => void;
  className?: string;
}

export function CompactActions({
  entity,
  permissions,
  onEdit,
  onDelete,
  className
}: CompactActionsProps) {
  const t = useTranslations();

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {permissions.canEdit && (
        <Button
          onClick={() => onEdit?.((entity as any).id)}
          size="sm"
          className="w-full"
        >
          <Edit className="h-4 w-4 mr-2" />
          {t('actions.edit')}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText((entity as any).id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Export
          </DropdownMenuItem>
          
          {permissions.canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.((entity as any).id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}