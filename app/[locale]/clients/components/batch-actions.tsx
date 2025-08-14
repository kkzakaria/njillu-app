'use client'

import { useState } from 'react';
import { 
  Trash2, 
  Archive, 
  RotateCcw, 
  Tag, 
  X, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface BatchActionsProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClearSelection: () => void;
  className?: string;
}

export function BatchActions({
  selectedCount,
  onAction,
  onClearSelection,
  className
}: BatchActionsProps) {
  const t = useClients();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleAction = (action: string) => {
    if (action === 'delete') {
      setShowDeleteDialog(true);
    } else if (action === 'archive') {
      setShowArchiveDialog(true);
    } else {
      onAction(action);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      onAction(pendingAction);
      setPendingAction(null);
    }
    setShowDeleteDialog(false);
    setShowArchiveDialog(false);
  };

  const actions = [
    {
      key: 'activate',
      label: t('actions.activate'),
      icon: RotateCcw,
      color: 'text-green-600'
    },
    {
      key: 'deactivate',
      label: t('actions.deactivate'),
      icon: Archive,
      color: 'text-orange-600'
    },
    {
      key: 'archive',
      label: t('actions.archive'),
      icon: Archive,
      color: 'text-gray-600'
    },
    {
      key: 'unarchive',
      label: t('actions.unarchive'),
      icon: RotateCcw,
      color: 'text-blue-600'
    },
    {
      key: 'export',
      label: t('actions.export'),
      icon: Download,
      color: 'text-blue-600'
    },
    {
      key: 'delete',
      label: t('actions.delete'),
      icon: Trash2,
      color: 'text-red-600',
      destructive: true
    }
  ];

  return (
    <>
      <div className={cn(
        'flex items-center justify-between p-3 bg-muted/50 border rounded-lg',
        className
      )}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-medium">
            {selectedCount} {selectedCount === 1 ? 'client sélectionné' : 'clients sélectionnés'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                {t('actions.bulk_actions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('actions.bulk_actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={() => handleAction(action.key)}
                  className={action.destructive ? 'text-destructive' : ''}
                >
                  <action.icon className={`h-4 w-4 mr-2 ${action.color}`} />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('confirmations.bulk_delete', { count: selectedCount })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmations.delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setPendingAction('delete');
                confirmAction();
              }}
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmations.bulk_archive', { count: selectedCount })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmations.archive_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setPendingAction('archive');
              confirmAction();
            }}>
              {t('actions.archive')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}