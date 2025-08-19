/**
 * Page de test pour l'intégration nuqs
 * 
 * Cette page permet de tester les hooks nuqs avant la migration complète
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderFiltersMenuNuqs } from '../folders/components/folder-filters-menu/folder-filters-menu-nuqs';
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url';
import { useClientSearchUrl } from '@/hooks/nuqs/use-client-search-url';
import { usePaginationUrl } from '@/hooks/nuqs/use-pagination-url';
import { useSearchUrl } from '@/hooks/nuqs/use-search-url';
import { FolderStateDemo } from './components/folder-state-demo';

export default function TestNuqsPage() {
  // Test des différents hooks nuqs
  const folderFilters = useFolderFiltersUrl();
  const clientSearch = useClientSearchUrl();
  const pagination = usePaginationUrl();
  const search = useSearchUrl();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test d'Intégration nuqs</h1>
      
      {/* Test Folder Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Folder Filters Test
            <FolderFiltersMenuNuqs />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">État actuel :</h4>
              <p>Statut : <Badge>{folderFilters.statusCategory}</Badge></p>
              <p>Filtres actifs : <Badge>{folderFilters.activeFiltersCount}</Badge></p>
            </div>
            <div>
              <h4 className="font-semibold">Actions :</h4>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => folderFilters.setStatusCategory('active')}
                >
                  Active
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => folderFilters.setStatusCategory('completed')}
                >
                  Completed
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => folderFilters.clearAllFilters()}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          {folderFilters.activeFiltersCount > 0 && (
            <div>
              <h5 className="font-medium mb-2">Filtres appliqués :</h5>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                {JSON.stringify(folderFilters.filters, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Client Search */}
      <Card>
        <CardHeader>
          <CardTitle>Client Search Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={clientSearch.searchParams.query}
              onChange={(e) => clientSearch.setQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={() => clientSearch.addFilter('active')}>
              Add Active Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={() => clientSearch.clearSearch()}
            >
              Clear
            </Button>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Paramètres de recherche :</h5>
            <pre className="bg-muted p-2 rounded text-sm overflow-auto">
              {JSON.stringify(clientSearch.searchParams, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Test Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Pagination Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => pagination.prevPage()}
              disabled={!pagination.canGoPrev()}
            >
              Précédent
            </Button>
            
            <Badge variant="outline">
              Page {pagination.page} (Taille: {pagination.page_size})
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => pagination.nextPage()}
            >
              Suivant
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => pagination.setSort('name', 'asc')}
            >
              Trier par nom
            </Button>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">État pagination :</h5>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify({
                page: pagination.page,
                page_size: pagination.page_size,
                sort_field: pagination.sort_field,
                sort_direction: pagination.sort_direction
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Test Generic Search */}
      <Card>
        <CardHeader>
          <CardTitle>Generic Search Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Recherche générique..."
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={() => search.addFilter('test-filter')}>
              Add Filter
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline">
              Query: "{search.debouncedQuery}"
            </Badge>
            <Badge variant="outline">
              Filters: {search.getActiveFiltersCount()}
            </Badge>
            <Badge variant={search.hasActiveSearch() ? "default" : "secondary"}>
              {search.hasActiveSearch() ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">État recherche :</h5>
            <pre className="bg-muted p-2 rounded text-sm">
              {JSON.stringify(search.debouncedSearchState, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Folder State Demo (Zustand + nuqs) */}
      <FolderStateDemo />

      {/* URL State Debug */}
      <Card>
        <CardHeader>
          <CardTitle>URL State Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            URL actuelle : {typeof window !== 'undefined' ? window.location.href : 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            Tous les paramètres URL sont gérés automatiquement par nuqs et synchronisés 
            entre les différents hooks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}