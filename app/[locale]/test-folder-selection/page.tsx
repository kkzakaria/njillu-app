/**
 * Page de test pour la sélection de dossier avec nuqs
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Folder } from 'lucide-react'
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url'

export default function TestFolderSelectionPage() {
  const { 
    selectedFolderId, 
    setSelectedFolderId, 
    clearSelectedFolder,
    statusCategory,
    setStatusCategory 
  } = useFolderFiltersUrl()

  // Mock folders data
  const mockFolders = [
    {
      id: '1',
      folder_number: 'M250113-000001',
      client_name: 'ACME Corporation',
      status: 'processing'
    },
    {
      id: '2',
      folder_number: 'M250113-000002',
      client_name: 'Beta Industries',
      status: 'open'
    },
    {
      id: '3',
      folder_number: 'M250110-000003',
      client_name: 'Gamma Corp',
      status: 'completed'
    },
    {
      id: '4',
      folder_number: 'M241215-000004',
      client_name: 'Delta Ltd',
      status: 'on_hold'
    },
    {
      id: '5',
      folder_number: 'M241201-000005',
      client_name: 'Epsilon Group',
      status: 'cancelled'
    },
  ]

  const selectedFolder = mockFolders.find(f => f.id === selectedFolderId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test Sélection Dossier avec nuqs</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Simulateur de liste de dossiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Liste des Dossiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockFolders.map((folder) => (
              <div
                key={folder.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedFolderId === folder.id
                    ? 'border-primary bg-primary/5 border-l-4 border-l-primary'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{folder.folder_number}</p>
                    <p className="text-sm text-muted-foreground">{folder.client_name}</p>
                  </div>
                  <Badge variant="outline">{folder.status}</Badge>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelectedFolder}
              className="w-full mt-4"
            >
              Désélectionner
            </Button>
          </CardContent>
        </Card>

        {/* Simulateur de panel de détails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails du Dossier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFolder ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedFolder.folder_number}</h3>
                  <p className="text-muted-foreground">ID: {selectedFolder.id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-sm text-muted-foreground">{selectedFolder.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Statut</p>
                    <Badge variant="outline">{selectedFolder.status}</Badge>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="text-xs font-mono">
                    selectedFolderId: "{selectedFolderId}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Sélectionnez un dossier pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* État de l'URL et contrôles */}
      <Card>
        <CardHeader>
          <CardTitle>État URL et Contrôles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">URL actuelle</h4>
            <code className="text-xs bg-muted p-2 rounded block">
              {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Catégorie de statut</h4>
            <div className="flex gap-2">
              {['active', 'completed', 'archived', 'deleted'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusCategory === status ? 'default' : 'outline'}
                  onClick={() => setStatusCategory(status as any)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Sélection rapide</h4>
            <div className="flex gap-2 flex-wrap">
              {mockFolders.map((folder) => (
                <Button
                  key={folder.id}
                  size="sm"
                  variant={selectedFolderId === folder.id ? 'default' : 'outline'}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  {folder.folder_number}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">État nuqs</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{JSON.stringify({
  selectedFolderId,
  statusCategory,
  hasSelection: !!selectedFolder
}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            🧪 Instructions de Test
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>• <strong>Sélection</strong>: Cliquez sur un dossier → URL mise à jour</p>
          <p>• <strong>URL Sharing</strong>: Copiez l'URL → Ouvrir dans nouvel onglet</p>
          <p>• <strong>Navigation</strong>: Testez boutons précédent/suivant du navigateur</p>
          <p>• <strong>Rechargement</strong>: F5 → Sélection conservée</p>
          <p>• <strong>Deep Link</strong>: URL directe avec ?selectedFolder=1</p>
        </CardContent>
      </Card>
    </div>
  )
}