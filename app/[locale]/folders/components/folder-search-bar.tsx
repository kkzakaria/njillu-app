'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Search, X, Filter, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFolderStore } from '@/lib/stores/folder-store'
import { useTranslations } from 'next-intl'

// ============================================================================
// Types et constantes
// ============================================================================

interface FolderSearchBarProps {
  placeholder?: string
  className?: string
  showAdvancedFilters?: boolean
  showViewControls?: boolean
}

const TRANSPORT_TYPES = [
  { value: 'M', label: 'Maritime' },
  { value: 'T', label: 'Terrestre' },
  { value: 'A', label: 'Aérien' }
]

const FOLDER_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Actif' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'archived', label: 'Archivé' }
]

const PRIORITIES = [
  { value: 'low', label: 'Faible' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critique' }
]

const VIEW_MODES = [
  { value: 'grid', label: 'Grille', icon: '⊞' },
  { value: 'list', label: 'Liste', icon: '☰' },
  { value: 'table', label: 'Tableau', icon: '▦' }
] as const

// ============================================================================
// Composant principal
// ============================================================================

export function FolderSearchBar({
  placeholder = 'Rechercher des dossiers...',
  className = '',
  showAdvancedFilters = true,
  showViewControls = true
}: FolderSearchBarProps) {
  const t = useTranslations('folders')
  
  // État local pour l'input de recherche (avant debounce)
  const [localSearchValue, setLocalSearchValue] = useState('')
  
  // État du store avec sélecteurs optimisés
  const filters = useFolderStore(state => state.filters)
  const viewMode = useFolderStore(state => state.viewMode)
  const isCompactMode = useFolderStore(state => state.isCompactMode)
  const updateFilters = useFolderStore(state => state.updateFilters)
  const clearFilters = useFolderStore(state => state.clearFilters)
  const setSearchQuery = useFolderStore(state => state.setSearchQuery)
  const setViewMode = useFolderStore(state => state.setViewMode)
  const toggleCompactMode = useFolderStore(state => state.toggleCompactMode)
  
  // Debounce de la recherche
  const [debouncedSearchValue] = useDebounce(localSearchValue, 300)
  
  // Initialiser la valeur locale avec la valeur du store au montage seulement
  useEffect(() => {
    setLocalSearchValue(filters.search || '')
  }, []) // Dépendance vide = seulement au montage
  
  // Sync avec le store quand le debounced value change
  useEffect(() => {
    setSearchQuery(debouncedSearchValue)
  }, [debouncedSearchValue, setSearchQuery])
  
  // Compteur de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.transport_type) count++
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.assigned_to) count++
    if (filters.date_from) count++
    if (filters.date_to) count++
    return count
  }, [filters])
  
  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value)
  }, [])
  
  const handleClearSearch = useCallback(() => {
    setLocalSearchValue('')
    setSearchQuery('')
  }, [setSearchQuery])
  
  const handleClearAllFilters = useCallback(() => {
    setLocalSearchValue('')
    clearFilters()
  }, [clearFilters])
  
  const handleFilterChange = useCallback((key: string, value: string | undefined) => {
    updateFilters({ [key]: value })
  }, [updateFilters])
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche principale */}
      <div className="flex items-center gap-2">
        {/* Input de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={localSearchValue}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {localSearchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Bouton filtres avancés */}
        {showAdvancedFilters && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Filtres avancés</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-4 space-y-4">
                {/* Type de transport */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de transport</label>
                  <Select
                    value={filters.transport_type || ''}
                    onValueChange={(value) => handleFilterChange('transport_type', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      {TRANSPORT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Statut */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les statuts</SelectItem>
                      {FOLDER_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Priorité */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorité</label>
                  <Select
                    value={filters.priority || ''}
                    onValueChange={(value) => handleFilterChange('priority', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les priorités</SelectItem>
                      {PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Actions */}
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleClearAllFilters}
                  disabled={activeFiltersCount === 0}
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  Effacer tous les filtres
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Contrôles de vue */}
        {showViewControls && (
          <div className="flex items-center gap-1 border rounded-md">
            {VIEW_MODES.map(mode => (
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? "default" : "ghost"}
                size="sm"
                className="px-3"
                onClick={() => setViewMode(mode.value)}
                title={mode.label}
              >
                <span className="text-sm">{mode.icon}</span>
              </Button>
            ))}
          </div>
        )}
        
        {/* Toggle mode compact */}
        {showViewControls && (
          <Button
            variant={isCompactMode ? "default" : "outline"}
            size="sm"
            onClick={toggleCompactMode}
            title="Mode compact"
          >
            <span className="text-xs">⌐</span>
          </Button>
        )}
      </div>
      
      {/* Affichage des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: &quot;{filters.search}&quot;
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleClearSearch()}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.transport_type && (
            <Badge variant="secondary" className="gap-1">
              Transport: {TRANSPORT_TYPES.find(t => t.value === filters.transport_type)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange('transport_type', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Statut: {FOLDER_STATUSES.find(s => s.value === filters.status)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange('status', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              Priorité: {PRIORITIES.find(p => p.value === filters.priority)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleFilterChange('priority', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {activeFiltersCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleClearAllFilters}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Tout effacer
            </Button>
          )}
        </div>
      )}
    </div>
  )
}