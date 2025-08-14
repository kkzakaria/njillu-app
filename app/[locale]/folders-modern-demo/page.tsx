'use client'

import { Suspense } from 'react'
import { QueryProvider } from '@/lib/providers/query-provider'
import FolderListVirtualized from '@/app/[locale]/folders/components/folder-list-virtualized'
import { FolderSearchBar } from '@/app/[locale]/folders/components/folder-search-bar'
import { useFolderStore } from '@/lib/stores/folder-store'
import { useFolderCounters, useFoldersAttention, useFolderMutations } from '@/hooks/use-folders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  RefreshCw,
  BarChart3,
  Settings
} from 'lucide-react'
import type { FolderSummary } from '@/types/folders'

// ============================================================================
// Composant de statistiques (compteurs)
// ============================================================================

function FolderStatsPanel() {
  const { data: counters, isLoading, error } = useFolderCounters()
  const { refreshViews, isRefreshing } = useFolderMutations()

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Erreur chargement statistiques</p>
        </CardContent>
      </Card>
    )
  }

  // Calculer les totaux
  const totals = counters?.reduce((acc, counter) => {
    acc.total += counter.count
    acc.withBL += counter.folders_with_bl
    acc.withoutBL += counter.folders_without_bl
    acc.totalValue += counter.total_estimated_value
    return acc
  }, { total: 0, withBL: 0, withoutBL: 0, totalValue: 0 }) || { total: 0, withBL: 0, withoutBL: 0, totalValue: 0 }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : totals.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Tous statuts confondus
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avec BL</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? '...' : totals.withBL.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {totals.total > 0 ? `${Math.round((totals.withBL / totals.total) * 100)}%` : '0%'} du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sans BL</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {isLoading ? '...' : totals.withoutBL.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Nécessitent attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valeur Totale
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 w-6 p-0"
              onClick={() => refreshViews()}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : `${totals.totalValue.toLocaleString()} €`}
          </div>
          <p className="text-xs text-muted-foreground">
            Estimation globale
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Composant d'alertes et dossiers nécessitant attention
// ============================================================================

function FolderAttentionPanel() {
  const { data: attentionFolders, isLoading } = useFoldersAttention({ limit: 5 })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dossiers nécessitant attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!attentionFolders || attentionFolders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dossiers nécessitant attention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucun dossier urgent</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Dossiers nécessitant attention
          <Badge variant="secondary">{attentionFolders.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {attentionFolders.map(folder => (
          <div key={folder.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1">
              <p className="text-sm font-medium">{folder.folder_number}</p>
              <div className="flex gap-1 mt-1">
                {folder.overdue && <Badge variant="destructive" className="text-xs">En retard</Badge>}
                {folder.missing_bl && <Badge variant="secondary" className="text-xs">Sans BL</Badge>}
                {folder.high_priority && <Badge variant="outline" className="text-xs">Priorité haute</Badge>}
                {folder.unassigned && <Badge variant="outline" className="text-xs">Non assigné</Badge>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-orange-600">
                Score: {folder.attention_score}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Composant principal de la page
// ============================================================================

function FoldersModernDemoContent() {
  // État du store avec sélecteurs optimisés
  const selectedIds = useFolderStore(state => state.selectedIds)
  const viewMode = useFolderStore(state => state.viewMode)
  const isCompactMode = useFolderStore(state => state.isCompactMode)

  // Handlers pour les actions sur les dossiers
  const handleFolderClick = (folder: FolderSummary) => {
    console.log('Folder clicked:', folder.folder_number)
    // TODO: Navigation vers détail du dossier
  }

  const handleFolderAction = (action: string, folder: FolderSummary) => {
    console.log('Folder action:', action, folder.folder_number)
    // TODO: Implémenter les actions spécifiques
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion Moderne des Dossiers</h1>
          <p className="text-muted-foreground mt-1">
            Démonstration de l&apos;architecture scalable avec virtualisation et cache intelligent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Vue: {viewMode}
          </Badge>
          {isCompactMode && (
            <Badge variant="outline" className="text-xs">
              Compact
            </Badge>
          )}
          {selectedIds.size > 0 && (
            <Badge variant="secondary">
              {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <FolderStatsPanel />

      {/* Layout principal avec sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar avec alertes */}
        <div className="lg:col-span-1 space-y-4">
          <FolderAttentionPanel />
          
          {/* Placeholder pour autres widgets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-3 w-3" />
                Filtres Sauvegardés
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="mr-2 h-3 w-3" />
                Rapports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Zone principale avec liste */}
        <div className="lg:col-span-3">
          <Card className="h-[800px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Liste des Dossiers</CardTitle>
              <Separator />
              {/* Barre de recherche et filtres */}
              <FolderSearchBar 
                placeholder="Rechercher par numéro, client, référence..."
                onSearch={(value) => console.log('Search:', value)}
                onFilter={() => console.log('Filter clicked')}
                onAdd={() => console.log('Add clicked')}
              />
            </CardHeader>
            <CardContent className="p-0 h-full">
              {/* Liste virtualisée */}
              <FolderListVirtualized
                onFolderClick={handleFolderClick}
                onFolderAction={handleFolderAction}
                showBulkActions
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer avec informations système */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              🚀 Architecture moderne : TanStack Query + Zustand + React Virtual | 
              📊 PostgreSQL avec recherche full-text et vues matérialisées | 
              ⚡ Cache multi-niveau intelligent
            </p>
            <p className="mt-1">
              Support de 10K+ dossiers avec performance optimale et UX fluide
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Page principale avec providers
// ============================================================================

export default function FoldersModernDemoPage() {
  return (
    <QueryProvider>
      <Suspense fallback={<div>Chargement...</div>}>
        <FoldersModernDemoContent />
      </Suspense>
    </QueryProvider>
  )
}