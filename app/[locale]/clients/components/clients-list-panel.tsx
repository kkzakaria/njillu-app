'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/hooks/useTranslation';
import { ClientTable } from './client-table';
import { ClientSearch } from './client-search';
import { ClientStats } from './client-stats';
import { ClientActions } from './client-actions';
import { BatchActions } from './batch-actions';
import { ClientImport } from './client-import';
import { ClientExport } from './client-export';
import type { ClientSummary, ClientStatus, ClientSearchParams } from '@/types/clients';
import { Link } from '@/i18n/navigation';

interface ClientsListPanelProps {
  selectedClientId?: string;
  onClientSelect: (client: ClientSummary | null) => void;
  statusFilter?: ClientStatus[];
  statusCategory?: string;
}

export function ClientsListPanel({
  selectedClientId,
  onClientSelect,
  statusFilter,
  statusCategory
}: ClientsListPanelProps) {
  const t = useClients();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<ClientSearchParams>({
    query: '',
    filters: [],
    page: 1,
    page_size: 50,
    sort_field: 'created_at',
    sort_direction: 'desc'
  });
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
    individuals: 0,
    businesses: 0
  });

  // Stabilize statusFilter to prevent unnecessary re-renders
  const stableStatusFilter = useMemo(() => statusFilter, [JSON.stringify(statusFilter)]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.append('page', searchParams.page.toString());
        queryParams.append('page_size', searchParams.page_size.toString());
        queryParams.append('sort_field', searchParams.sort_field);
        queryParams.append('sort_direction', searchParams.sort_direction);
        
        if (searchParams.query) {
          queryParams.append('search_term', searchParams.query);
        }
        
        // Add status filter if provided
        if (stableStatusFilter && stableStatusFilter.length > 0) {
          queryParams.append('statuses', stableStatusFilter.join(','));
        }
        
        // Add other filters
        searchParams.filters.forEach(filter => {
          if (filter.field !== 'status' && Array.isArray(filter.value)) {
            queryParams.append(`${filter.field}s`, filter.value.join(','));
          }
        });

        const response = await fetch(`/api/clients?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch clients');

        const data = await response.json();
        setClients(data.data.clients || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [
    searchParams.query,
    searchParams.page, 
    searchParams.page_size, 
    searchParams.sort_field, 
    searchParams.sort_direction,
    JSON.stringify(searchParams.filters),
    stableStatusFilter
  ]);

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/clients/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((filters: any[]) => {
    setSearchParams(prev => ({ ...prev, filters, page: 1 }));
  }, []);

  const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSearchParams(prev => ({ 
      ...prev, 
      sort_field: field, 
      sort_direction: direction,
      page: 1 
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch('/api/clients/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          client_ids: selectedIds
        })
      });

      if (response.ok) {
        await fetchClients();
        await fetchStats();
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  const handleClientAction = async (action: string, clientId: string) => {
    try {
      let response;
      
      switch (action) {
        case 'delete':
          response = await fetch(`/api/clients/${clientId}`, {
            method: 'DELETE'
          });
          break;
        case 'archive':
          response = await fetch(`/api/clients/${clientId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' })
          });
          break;
        case 'activate':
          response = await fetch(`/api/clients/${clientId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          break;
        default:
          return;
      }

      if (response?.ok) {
        await fetchClients();
        await fetchStats();
        if (selectedClientId === clientId) {
          onClientSelect(null);
        }
      }
    } catch (err) {
      console.error('Client action failed:', err);
    }
  };

  const getCategoryTitle = () => {
    switch (statusCategory) {
      case 'active':
        return t('navigation.active');
      case 'inactive':
        return t('navigation.inactive');
      case 'archived':
        return t('navigation.archived');
      default:
        return t('navigation.all');
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">{getCategoryTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} {t('title').toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImport(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('actions.import')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExport(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('actions.export')}
            </Button>
            <Button size="sm" asChild>
              <Link href="/clients/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.create')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <ClientStats stats={stats} />

        {/* Search and Filters */}
        <ClientSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          initialQuery={searchParams.query}
          className="mt-4"
        />

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <BatchActions
            selectedCount={selectedIds.length}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            className="mt-4"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="p-4 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button size="sm" onClick={fetchClients}>
              Retry
            </Button>
          </div>
        ) : (
          <ClientTable
            clients={clients}
            selectedIds={selectedIds}
            selectedClientId={selectedClientId}
            onSelectionChange={handleSelectionChange}
            onClientSelect={onClientSelect}
            onClientAction={handleClientAction}
            onSort={handleSort}
            onPageChange={handlePageChange}
            loading={loading}
            searchParams={searchParams}
          />
        )}
      </div>

      {/* Modals */}
      {showImport && (
        <ClientImport
          open={showImport}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            fetchClients();
            fetchStats();
          }}
        />
      )}

      {showExport && (
        <ClientExport
          open={showExport}
          onClose={() => setShowExport(false)}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}