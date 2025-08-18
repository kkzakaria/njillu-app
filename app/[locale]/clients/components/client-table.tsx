'use client'

import { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Archive, 
  User, 
  Building2,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/hooks/useTranslation';
import { Link } from '@/i18n/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import type { 
  ClientSummary, 
  ClientSearchParams,
  getClientDisplayName,
  isIndividualClient,
  isBusinessClient 
} from '@/types/clients';

interface ClientTableProps {
  clients: ClientSummary[];
  selectedIds: string[];
  selectedClientId?: string;
  onSelectionChange: (ids: string[]) => void;
  onClientSelect: (client: ClientSummary) => void;
  onClientAction: (action: string, clientId: string) => void;
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  loading: boolean;
  searchParams: ClientSearchParams;
}

const dateLocaleMap = { fr, en: enUS, es };

export function ClientTable({
  clients,
  selectedIds,
  selectedClientId,
  onSelectionChange,
  onClientSelect,
  onClientAction,
  onSort,
  onPageChange,
  loading,
  searchParams
}: ClientTableProps) {
  const t = useClients();
  const locale = useLocale() as keyof typeof dateLocaleMap;
  
  const allSelected = clients.length > 0 && selectedIds.length === clients.length;
  const partialSelected = selectedIds.length > 0 && selectedIds.length < clients.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(clients.map(client => client.id));
    }
  };

  const handleSelectOne = (clientId: string) => {
    if (selectedIds.includes(clientId)) {
      onSelectionChange(selectedIds.filter(id => id !== clientId));
    } else {
      onSelectionChange([...selectedIds, clientId]);
    }
  };

  const handleSort = (field: string) => {
    const isCurrentField = searchParams.sort_field === field;
    const newDirection = isCurrentField && searchParams.sort_direction === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const getSortIcon = (field: string) => {
    if (searchParams.sort_field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return searchParams.sort_direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getClientDisplayName = (client: ClientSummary): string => {
    if (client.client_type === 'individual') {
      return `${client.individual_info?.first_name || ''} ${client.individual_info?.last_name || ''}`.trim();
    } else {
      return client.business_info?.company_name || '';
    }
  };

  const getClientInitials = (client: ClientSummary): string => {
    const name = getClientDisplayName(client);
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatRelativeDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: dateLocaleMap[locale]
      });
    } catch {
      return dateString;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'normal':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getAvailableActions = (client: ClientSummary) => {
    const actions = [];
    
    actions.push({ 
      key: 'view', 
      label: t('actions.view_details'),
      icon: Eye,
      href: `/clients/${client.id}`
    });
    
    actions.push({ 
      key: 'edit', 
      label: t('actions.edit'),
      icon: Edit,
      href: `/clients/${client.id}/edit`
    });

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

    return actions;
  };

  if (loading && clients.length === 0) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="mb-4">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">{t('empty_states.no_clients')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('empty_states.no_clients_description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/create">
            {t('actions.create')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected || partialSelected}
                onCheckedChange={handleSelectAll}
                aria-label={t('table.columns.select')}
                ref={(ref) => {
                  if (ref) ref.indeterminate = partialSelected;
                }}
              />
            </TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                {t('table.columns.name')}
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead className="w-24">{t('table.columns.type')}</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center gap-2">
                {t('table.columns.email')}
                {getSortIcon('email')}
              </div>
            </TableHead>
            <TableHead>{t('table.columns.phone')}</TableHead>
            <TableHead>{t('table.columns.country')}</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-2">
                {t('table.columns.status')}
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead>{t('table.columns.priority')}</TableHead>
            <TableHead 
              className="cursor-pointer select-none"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center gap-2">
                {t('table.columns.created_at')}
                {getSortIcon('created_at')}
              </div>
            </TableHead>
            <TableHead className="w-12">{t('table.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(clients || []).map((client) => (
            <TableRow 
              key={client.id}
              className={`cursor-pointer hover:bg-muted/50 ${
                selectedClientId === client.id ? 'bg-muted' : ''
              }`}
              onClick={() => onClientSelect(client)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(client.id)}
                  onCheckedChange={() => handleSelectOne(client.id)}
                  aria-label={`${t('table.columns.select')} ${getClientDisplayName(client)}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getClientInitials(client)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {getClientDisplayName(client)}
                    </div>
                    {client.client_type === 'business' && client.business_info?.legal_name && 
                     client.business_info.legal_name !== client.business_info.company_name && (
                      <div className="text-sm text-muted-foreground">
                        {client.business_info.legal_name}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {client.client_type === 'individual' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {t(`types.${client.client_type}`)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {client.contact_info?.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {client.contact_info?.phone}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {client.contact_info?.address?.country}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(client.status)}>
                  {t(`statuses.${client.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityVariant(client.commercial_info?.priority || 'normal')}>
                  {t(`priorities.${client.commercial_info?.priority || 'normal'}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatRelativeDate(client.created_at)}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('table.columns.actions')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getAvailableActions(client).map((action) => (
                      <DropdownMenuItem
                        key={action.key}
                        className={action.destructive ? 'text-destructive' : ''}
                        asChild={!!action.href}
                        onClick={action.action ? () => onClientAction(action.action, client.id) : undefined}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {loading && (
        <div className="p-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </div>
      )}
    </div>
  );
}