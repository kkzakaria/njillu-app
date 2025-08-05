'use client'

import { useState } from 'react'
import { useQueryStates } from 'nuqs'
import { X, Filter, ChevronDown, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { folderSearchParams, countActiveFilters, getResetFilters, FOLDER_VIEW_PRESETS } from '@/lib/search-params/folder-params'
import { useFolders } from '@/hooks/useTranslation'
import type { FolderStatus, FolderType, FolderCategory, FolderPriority } from '@/types/folders'

interface FolderFiltersProps {
  className?: string
}

export function FolderFilters({ className }: FolderFiltersProps) {
  const t = useFolders()
  const [isOpen, setIsOpen] = useState(false)
  
  const [filters, setFilters] = useQueryStates(folderSearchParams, {
    shallow: false,
    clearOnDefault: true
  })

  const activeFilterCount = countActiveFilters(filters)

  const handleResetFilters = () => {
    setFilters(getResetFilters())
  }

  const handlePresetSelect = (presetKey: string) => {
    const preset = FOLDER_VIEW_PRESETS[presetKey as keyof typeof FOLDER_VIEW_PRESETS]
    if (preset) {
      setFilters({ ...getResetFilters(), ...preset.params })
    }
  }

  // Composant de section de filtre collapsible
  const FilterSection = ({ 
    title, 
    children, 
    defaultOpen = false 
  }: { 
    title: string
    children: React.ReactNode
    defaultOpen?: boolean 
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="font-medium text-sm">{title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          {children}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  // Composant de filtre par statut multiple
  const StatusFilter = ({ 
    label, 
    values, 
    selectedValues, 
    onChange,
    options 
  }: {
    label: string
    values: readonly string[]
    selectedValues: string[]
    onChange: (values: string[]) => void
    options: Record<string, string>
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {values.map((value) => (
          <div key={value} className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-${value}`}
              checked={selectedValues.includes(value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selectedValues, value])
                } else {
                  onChange(selectedValues.filter(v => v !== value))
                }
              }}
            />
            <Label 
              htmlFor={`${label}-${value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {options[value] || value}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  const filterContent = (
    <div className="space-y-6">
      {/* Vues prédéfinies */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('list.presets.title')}</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(FOLDER_VIEW_PRESETS).slice(0, 6).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect(key)}
              className="justify-start text-xs"
            >
              {t(`list.presets.${key}`)}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filtres par statut */}
      <FilterSection title={t('list.filters.status.label')} defaultOpen>
        <StatusFilter
          label={t('list.filters.status.label')}
          values={['open', 'processing', 'completed', 'closed', 'on_hold', 'cancelled']}
          selectedValues={filters.status}
          onChange={(values) => setFilters({ status: values as FolderStatus[] })}
          options={{
            open: t('list.filters.status.open'),
            processing: t('list.filters.status.processing'),
            completed: t('list.filters.status.completed'),
            closed: t('list.filters.status.closed'),
            on_hold: t('list.filters.status.on_hold'),
            cancelled: t('list.filters.status.cancelled')
          }}
        />
      </FilterSection>

      <Separator />

      {/* Filtres par type */}
      <FilterSection title={t('list.filters.type.label')}>
        <StatusFilter
          label={t('list.filters.type.label')}
          values={['import', 'export', 'transit', 'transhipment', 'storage', 'consolidation', 'distribution']}
          selectedValues={filters.type}
          onChange={(values) => setFilters({ type: values as FolderType[] })}
          options={{
            import: t('list.filters.type.import'),
            export: t('list.filters.type.export'),
            transit: t('list.filters.type.transit'),
            transhipment: t('list.filters.type.transhipment'),
            storage: t('list.filters.type.storage'),
            consolidation: t('list.filters.type.consolidation'),
            distribution: t('list.filters.type.distribution')
          }}
        />
      </FilterSection>

      <Separator />

      {/* Filtres par catégorie */}
      <FilterSection title={t('list.filters.category.label')}>
        <StatusFilter
          label={t('list.filters.category.label')}
          values={['commercial', 'urgent', 'vip', 'hazmat', 'perishable', 'oversized', 'fragile', 'high_value']}
          selectedValues={filters.category}
          onChange={(values) => setFilters({ category: values as FolderCategory[] })}
          options={{
            commercial: t('list.filters.category.commercial'),
            urgent: t('list.filters.category.urgent'),
            vip: t('list.filters.category.vip'),
            hazmat: t('list.filters.category.hazmat'),
            perishable: t('list.filters.category.perishable'),
            oversized: t('list.filters.category.oversized'),
            fragile: t('list.filters.category.fragile'),
            high_value: t('list.filters.category.high_value')
          }}
        />
      </FilterSection>

      <Separator />

      {/* Filtres par priorité */}
      <FilterSection title={t('list.filters.priority.label')}>
        <StatusFilter
          label={t('list.filters.priority.label')}
          values={['low', 'normal', 'high', 'urgent', 'critical']}
          selectedValues={filters.priority}
          onChange={(values) => setFilters({ priority: values as FolderPriority[] })}
          options={{
            low: t('list.filters.priority.low'),
            normal: t('list.filters.priority.normal'),
            high: t('list.filters.priority.high'),
            urgent: t('list.filters.priority.urgent'),
            critical: t('list.filters.priority.critical')
          }}
        />
      </FilterSection>

      <Separator />

      {/* Filtres client et géographie */}
      <FilterSection title={t('list.filters.client.label')}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="client-filter" className="text-sm font-medium">
              {t('list.filters.client.label')}
            </Label>
            <Input
              id="client-filter"
              placeholder={t('list.filters.client.placeholder')}
              value={filters.client}
              onChange={(e) => setFilters({ client: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="origin-country" className="text-sm font-medium">
              {t('list.filters.geography.origin_country')}
            </Label>
            <Input
              id="origin-country"
              placeholder="France"
              value={filters.origin_country}
              onChange={(e) => setFilters({ origin_country: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="destination-country" className="text-sm font-medium">
              {t('list.filters.geography.destination_country')}
            </Label>
            <Input
              id="destination-country"
              placeholder="Germany"
              value={filters.destination_country}
              onChange={(e) => setFilters({ destination_country: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Filtres financiers */}
      <FilterSection title={t('list.filters.financial.cost_min')}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="cost-min" className="text-sm font-medium">
                {t('list.filters.financial.cost_min')}
              </Label>
              <Input
                id="cost-min"
                type="number"
                placeholder="0"
                value={filters.cost_min || ''}
                onChange={(e) => setFilters({ cost_min: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cost-max" className="text-sm font-medium">
                {t('list.filters.financial.cost_max')}
              </Label>
              <Input
                id="cost-max"
                type="number"
                placeholder="10000"
                value={filters.cost_max || ''}
                onChange={(e) => setFilters({ cost_max: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="currency" className="text-sm font-medium">
              {t('list.filters.financial.currency')}
            </Label>
            <Select value={filters.currency} onValueChange={(value) => setFilters({ currency: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="EUR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Filtres relations */}
      <FilterSection title={t('list.filters.relations.has_alerts')}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-alerts"
              checked={filters.has_alerts === 'true'}
              onCheckedChange={(checked) => setFilters({ has_alerts: checked ? 'true' : '' })}
            />
            <Label htmlFor="has-alerts" className="text-sm font-normal">
              {t('list.filters.relations.has_alerts')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-overdue"
              checked={filters.is_overdue === 'true'}
              onCheckedChange={(checked) => setFilters({ is_overdue: checked ? 'true' : '' })}
            />
            <Label htmlFor="is-overdue" className="text-sm font-normal">
              {t('list.filters.relations.is_overdue')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-bls"
              checked={filters.has_bls === 'true'}
              onCheckedChange={(checked) => setFilters({ has_bls: checked ? 'true' : '' })}
            />
            <Label htmlFor="has-bls" className="text-sm font-normal">
              {t('list.filters.relations.has_bls')}
            </Label>
          </div>
        </div>
      </FilterSection>

      {/* Bouton de réinitialisation */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('list.filters.clear_all')}
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className={className}>
      {/* Desktop - Panel latéral */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">
              {t('list.filters.title')}
            </CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-6">
                {activeFilterCount}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {filterContent}
          </CardContent>
        </Card>
      </div>

      {/* Mobile - Sheet */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              {t('list.filters.title')}
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                {t('list.filters.title')}
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="h-6">
                    {t('list.filters.active_count', { count: activeFilterCount })}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {filterContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}