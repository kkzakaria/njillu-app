'use client'

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useClients } from '@/hooks/useTranslation';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { ClientFilter, ClientStatus, ClientType, ClientPriority, ClientRiskLevel } from '@/types/clients';

interface ClientSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ClientFilter[]) => void;
  initialQuery?: string;
  className?: string;
}

export function ClientSearch({
  onSearch,
  onFilterChange,
  initialQuery = '',
  className
}: ClientSearchProps) {
  const t = useClients();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<ClientFilter[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const addFilter = (field: string, operator: string, value: any) => {
    // Remove existing filter for the same field
    const updatedFilters = filters.filter(f => f.field !== field);
    
    if (value) {
      updatedFilters.push({ field, operator, value });
    }
    
    setFilters(updatedFilters);
  };

  const removeFilter = (field: string) => {
    setFilters(filters.filter(f => f.field !== field));
  };

  const clearAllFilters = () => {
    setFilters([]);
    setQuery('');
  };

  const getFilterValue = (field: string) => {
    const filter = filters.find(f => f.field === field);
    return filter?.value;
  };

  const getActiveFiltersCount = () => {
    return filters.length + (query ? 1 : 0);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('search.filters')}
          {getActiveFiltersCount() > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
          >
            {t('search.clear_filters')}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {t(`filters.${filter.field}`)}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter(filter.field)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            {/* Basic Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Client Type */}
              <div className="space-y-2">
                <Label>{t('filters.type')}</Label>
                <Select
                  value={getFilterValue('client_type') || ''}
                  onValueChange={(value) => addFilter('client_type', 'eq', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="individual">{t('types.individual')}</SelectItem>
                    <SelectItem value="business">{t('types.business')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>{t('filters.status')}</Label>
                <Select
                  value={getFilterValue('status') || ''}
                  onValueChange={(value) => addFilter('status', 'eq', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="active">{t('statuses.active')}</SelectItem>
                    <SelectItem value="inactive">{t('statuses.inactive')}</SelectItem>
                    <SelectItem value="archived">{t('statuses.archived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>{t('filters.priority')}</Label>
                <Select
                  value={getFilterValue('priority') || ''}
                  onValueChange={(value) => addFilter('priority', 'eq', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="low">{t('priorities.low')}</SelectItem>
                    <SelectItem value="normal">{t('priorities.normal')}</SelectItem>
                    <SelectItem value="high">{t('priorities.high')}</SelectItem>
                    <SelectItem value="critical">{t('priorities.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label>{t('filters.risk_level')}</Label>
                <Select
                  value={getFilterValue('risk_level') || ''}
                  onValueChange={(value) => addFilter('risk_level', 'eq', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="low">{t('risk_levels.low')}</SelectItem>
                    <SelectItem value="medium">{t('risk_levels.medium')}</SelectItem>
                    <SelectItem value="high">{t('risk_levels.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Advanced Filters */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
                {t('search.advanced_search')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {/* Country */}
                  <div className="space-y-2">
                    <Label>{t('filters.country')}</Label>
                    <Input
                      placeholder="ex: FR, US, ES"
                      value={getFilterValue('country') || ''}
                      onChange={(e) => addFilter('country', 'eq', e.target.value || null)}
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label>{t('filters.industry')}</Label>
                    <Input
                      placeholder="ex: Technology, Retail"
                      value={getFilterValue('industry') || ''}
                      onChange={(e) => addFilter('industry', 'ilike', e.target.value || null)}
                    />
                  </div>

                  {/* Payment Terms */}
                  <div className="space-y-2">
                    <Label>{t('filters.payment_terms')}</Label>
                    <Select
                      value={getFilterValue('payment_terms') || ''}
                      onValueChange={(value) => addFilter('payment_terms', 'eq', value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes</SelectItem>
                        <SelectItem value="immediate">Immédiat</SelectItem>
                        <SelectItem value="net_15">Net 15</SelectItem>
                        <SelectItem value="net_30">Net 30</SelectItem>
                        <SelectItem value="net_60">Net 60</SelectItem>
                        <SelectItem value="net_90">Net 90</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Credit Limit Range */}
                  <div className="space-y-2">
                    <Label>Limite de crédit min</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={getFilterValue('credit_limit_min') || ''}
                      onChange={(e) => addFilter('credit_limit_min', 'gte', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Limite de crédit max</Label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={getFilterValue('credit_limit_max') || ''}
                      onChange={(e) => addFilter('credit_limit_max', 'lte', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Étiquettes</Label>
                    <Input
                      placeholder="ex: VIP, Prospect"
                      value={getFilterValue('tags') || ''}
                      onChange={(e) => addFilter('tags', 'contains', e.target.value || null)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}