/**
 * Composant démo qui montre l'intégration Zustand + nuqs
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Grid3X3, 
  List, 
  Table, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Filter,
  Trash2 
} from 'lucide-react'

import { useFolderState } from '@/lib/stores/folder-store-nuqs'

export function FolderStateDemo() {
  const state = useFolderState()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Démonstration Zustand + nuqs Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Section État UI (Zustand) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">État UI (Zustand) - Local uniquement</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Mode de vue */}
            <div className="space-y-2">
              <h4 className="font-medium">Mode de vue</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={state.ui.viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => state.setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={state.ui.viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => state.setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  size="sm"
                  variant={state.ui.viewMode === 'table' ? 'default' : 'outline'}
                  onClick={() => state.setViewMode('table')}
                >
                  <Table className="w-4 h-4 mr-1" />
                  Table
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Actuel: <Badge variant="outline">{state.ui.viewMode}</Badge>
              </p>
            </div>

            {/* Mode compact */}
            <div className="space-y-2">
              <h4 className="font-medium">Affichage</h4>
              <Button
                size="sm"
                variant={state.ui.isCompactMode ? 'default' : 'outline'}
                onClick={state.toggleCompactMode}
              >
                {state.ui.isCompactMode ? (
                  <>
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Compact
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Normal
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {state.ui.isCompactMode ? 'Mode compact activé' : 'Mode normal'}
              </p>
            </div>
          </div>

          {/* Sélections */}
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Sélections (temporaire)</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => state.toggleSelection('folder-1')}
              >
                Toggle Dossier 1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => state.toggleSelection('folder-2')}
              >
                Toggle Dossier 2
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => state.selectAll(['folder-1', 'folder-2', 'folder-3'])}
              >
                Tout sélectionner
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={state.clearSelection}
              >
                Effacer sélection
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Sélectionnés: <Badge>{state.ui.selectedIds.size}</Badge>
              {state.ui.selectedIds.size > 0 && (
                <span className="ml-2">
                  [{Array.from(state.ui.selectedIds).join(', ')}]
                </span>
              )}
            </p>
          </div>
        </div>

        <Separator />

        {/* Section État URL (nuqs) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">État URL (nuqs) - Synchronisé et partageable</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Catégorie de statut */}
            <div className="space-y-2">
              <h4 className="font-medium">Catégorie de statut</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={state.url.statusCategory === 'active' ? 'default' : 'outline'}
                  onClick={() => state.setStatusCategory('active')}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={state.url.statusCategory === 'completed' ? 'default' : 'outline'}
                  onClick={() => state.setStatusCategory('completed')}
                >
                  Completed
                </Button>
                <Button
                  size="sm"
                  variant={state.url.statusCategory === 'archived' ? 'default' : 'outline'}
                  onClick={() => state.setStatusCategory('archived')}
                >
                  Archived
                </Button>
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="space-y-2">
              <h4 className="font-medium">Filtres rapides</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => state.updateFilters({ 
                    priority: state.url.filters.priority?.includes('high') 
                      ? state.url.filters.priority.filter(p => p !== 'high')
                      : [...(state.url.filters.priority || []), 'high']
                  })}
                >
                  Priorité haute
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => state.updateFilters({ 
                    transport_mode: state.url.filters.transport_mode?.includes('maritime')
                      ? state.url.filters.transport_mode.filter(t => t !== 'maritime')
                      : [...(state.url.filters.transport_mode || []), 'maritime']
                  })}
                >
                  Maritime
                </Button>
              </div>
            </div>
          </div>

          {/* Informations sur les filtres */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtres actifs</h4>
              <Badge variant="secondary">{state.url.activeFiltersCount} filtres</Badge>
            </div>
            
            {state.url.activeFiltersCount > 0 && (
              <div className="bg-muted p-3 rounded text-sm">
                <pre>{JSON.stringify(state.url.filters, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions globales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actions globales</h3>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={state.clearAllFilters}
              disabled={state.url.activeFiltersCount === 0}
            >
              <Filter className="w-4 h-4 mr-1" />
              Effacer filtres URL
            </Button>
            
            <Button
              variant="outline"
              onClick={state.resetUIState}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset état UI
            </Button>
            
            <Button
              variant="destructive"
              onClick={state.resetAll}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Reset complet
            </Button>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-6 p-4 bg-muted rounded">
          <h4 className="font-medium mb-2">Debug - Paramètres API</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(state.getSearchParams(), null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}