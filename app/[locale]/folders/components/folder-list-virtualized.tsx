'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FolderCard } from './folder-card'
import { useFolderStore, useFolderActions } from '@/lib/stores/folder-store'
import { Loader2, AlertCircle, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFolders } from '@/hooks/use-folders'
import type { FolderSummary } from '@/types/folders'

// ============================================================================
// Types et interfaces
// ============================================================================

interface FolderListVirtualizedProps {
  onFolderClick?: (folder: FolderSummary) => void
  onFolderAction?: (action: string, folder: FolderSummary) => void
  className?: string
  showBulkActions?: boolean
}

interface VirtualizedItemProps {
  folder: FolderSummary
  index: number
  isSelected: boolean
  onFolderClick?: (folder: FolderSummary) => void
  onFolderAction?: (action: string, folder: FolderSummary) => void
  onToggleSelection: (id: string) => void
  viewMode: 'grid' | 'list' | 'table'
  isCompact: boolean
}

// ============================================================================
// Composant pour un item virtualisé
// ============================================================================

function VirtualizedFolderItem({
  folder,
  index,
  isSelected,
  onFolderClick,
  onFolderAction,
  onToggleSelection,
  viewMode,
  isCompact
}: VirtualizedItemProps) {
  const handleCardClick = useCallback((folder: FolderSummary) => {
    onFolderClick?.(folder)
  }, [onFolderClick])

  const handleActionClick = useCallback((action: string, folder: FolderSummary) => {
    onFolderAction?.(action, folder)
  }, [onFolderAction])

  const handleSelectionToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onToggleSelection(folder.id)
  }, [folder.id, onToggleSelection])

  const cardClassName = useMemo(() => {
    const baseClasses = 'transition-all duration-200'
    const selectedClasses = isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
    const hoverClasses = 'hover:shadow-lg hover:scale-[1.02]'
    
    return `${baseClasses} ${selectedClasses} ${hoverClasses}`
  }, [isSelected])

  return (
    <div
      className="relative"
      data-index={index}
      data-folder-id={folder.id}
    >
      {/* Checkbox de sélection en overlay */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectionToggle}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          aria-label={`Sélectionner le dossier ${folder.folder_number}`}
        />
      </div>
      
      {/* Composant FolderCard */}
      <FolderCard
        folder={folder}
        onClick={handleCardClick}
        onActionClick={handleActionClick}
        className={cardClassName}
        compact={isCompact}
        showActions={!isSelected} // Masquer les actions quand sélectionné
      />
    </div>
  )
}

// ============================================================================
// Composant principal FolderList virtualisé
// ============================================================================

export function FolderListVirtualized({
  onFolderClick,
  onFolderAction,
  className = '',
  showBulkActions = true
}: FolderListVirtualizedProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  // État du store avec sélecteurs individuels pour éviter les re-renders
  const viewMode = useFolderStore(state => state.viewMode)
  const isCompactMode = useFolderStore(state => state.isCompactMode)
  const selectedIds = useFolderStore(state => state.selectedIds)
  
  const toggleSelection = useFolderStore(state => state.toggleSelection)
  const selectAll = useFolderStore(state => state.selectAll)
  const clearSelection = useFolderStore(state => state.clearSelection)
  
  // Actions disponibles
  const { hasSelection, selectedCount } = useFolderActions()
  
  // Données des dossiers
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useFolders()
  
  // Flattern des données de pagination infinie
  const folders = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || []
  }, [data])
  
  // Configuration de la virtualisation
  const rowVirtualizer = useVirtualizer({
    count: folders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => {
      // Estimer la taille basée sur le mode de vue et compact
      if (viewMode === 'table') return 60
      if (isCompactMode) return 120
      return 160
    }, [viewMode, isCompactMode]),
    overscan: 5, // Nombre d'items à maintenir hors écran
    paddingStart: showBulkActions && hasSelection ? 60 : 16, // Espace pour actions bulk
    paddingEnd: 16,
  })
  
  // Gestion du scroll infini
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !hasNextPage || isFetchingNextPage) return
    
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    // Charger plus quand on est à 500px du bas
    if (distanceFromBottom < 500) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  
  // Actions bulk
  const handleSelectAll = useCallback(() => {
    if (hasSelection) {
      clearSelection()
    } else {
      selectAll(folders.map(f => f.id))
    }
  }, [hasSelection, clearSelection, selectAll, folders])
  
  // Gestion des erreurs
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des dossiers: {error.message}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  
  // État de chargement initial
  if (isLoading && folders.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des dossiers...</span>
        </div>
      </div>
    )
  }
  
  // Aucun résultat
  if (!isLoading && folders.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 text-center ${className}`}>
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun dossier trouvé</h3>
        <p className="text-muted-foreground">
          Essayez de modifier vos filtres de recherche
        </p>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Barre d'actions bulk */}
      {showBulkActions && hasSelection && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border-b sticky top-0 z-20">
          <input
            type="checkbox"
            checked={hasSelection}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">
            {selectedCount} dossier{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline">
              Modifier le statut
            </Button>
            <Button size="sm" variant="outline">
              Assigner
            </Button>
            <Button size="sm" variant="destructive">
              Supprimer
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Annuler
            </Button>
          </div>
        </div>
      )}
      
      {/* Liste virtualisée */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const folder = folders[virtualRow.index]
            if (!folder) return null
            
            const isSelected = selectedIds.has(folder.id)
            
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '8px 16px',
                }}
              >
                <VirtualizedFolderItem
                  folder={folder}
                  index={virtualRow.index}
                  isSelected={isSelected}
                  onFolderClick={onFolderClick}
                  onFolderAction={onFolderAction}
                  onToggleSelection={toggleSelection}
                  viewMode={viewMode}
                  isCompact={isCompactMode}
                />
              </div>
            )
          })}
        </div>
        
        {/* Indicateur de chargement pour pagination infinie */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement de plus de dossiers...</span>
            </div>
          </div>
        )}
        
        {/* Indicateur de fin */}
        {!hasNextPage && folders.length > 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Tous les dossiers ont été chargés ({folders.length} total)
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Export par défaut avec mémo pour optimiser les re-renders
// ============================================================================

export default FolderListVirtualized