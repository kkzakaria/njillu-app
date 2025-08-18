'use client'

import { MoreHorizontal, Edit, Trash2, Archive, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClients } from '@/hooks/useTranslation';
import { Link } from '@/i18n/navigation';
import type { ClientSummary } from '@/types/clients';

interface ClientActionsProps {
  client: ClientSummary;
  onAction: (action: string, clientId: string) => void;
}

export function ClientActions({ client, onAction }: ClientActionsProps) {
  const t = useClients();

  const actions = [
    { 
      key: 'view', 
      label: t('actions.view_details'),
      icon: Eye,
      href: `/clients/${client.id}`
    },
    { 
      key: 'edit', 
      label: t('actions.edit'),
      icon: Edit,
      href: `/clients/${client.id}/edit`
    }
  ];

  if (client.status === 'archived') {
    actions.push({ 
      key: 'unarchive', 
      label: t('actions.unarchive'),
      icon: RotateCcw,
      action: 'activate'
    });
  } else if (client.status === 'active') {
    actions.push({ 
      key: 'archive', 
      label: t('actions.archive'),
      icon: Archive,
      action: 'archive'
    });
  } else {
    actions.push({ 
      key: 'activate', 
      label: t('actions.activate'),
      icon: RotateCcw,
      action: 'activate'
    });
  }

  actions.push({ 
    key: 'delete', 
    label: t('actions.delete'),
    icon: Trash2,
    action: 'delete',
    destructive: true
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('table.columns.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            className={action.destructive ? 'text-destructive' : ''}
            asChild={!!action.href}
            onClick={action.action ? () => onAction(action.action, client.id) : undefined}
          >
            {action.href ? (
              <Link href={action.href}>
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Link>
            ) : (
              <>
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}