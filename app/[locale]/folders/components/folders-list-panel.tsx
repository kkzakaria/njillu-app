'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter } from 'lucide-react';

export function FoldersListPanel() {
  // Mock data pour la démonstration
  const folders = [
    {
      id: '1',
      number: 'DOS-2024-001',
      client: 'ACME Corporation',
      status: 'En cours',
      priority: 'Haute',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      number: 'DOS-2024-002',
      client: 'Beta Industries',
      status: 'Attente',
      priority: 'Moyenne',
      createdAt: '2024-01-14',
    },
    {
      id: '3',
      number: 'DOS-2024-003',
      client: 'Gamma Solutions',
      status: 'Terminé',
      priority: 'Basse',
      createdAt: '2024-01-13',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Attente': return 'bg-yellow-100 text-yellow-800';
      case 'Terminé': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-orange-100 text-orange-800';
      case 'Basse': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        {/* Search and action buttons */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un dossier..."
              className="pl-9"
            />
          </div>
          <Button size="sm" variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Folders list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {folders.map((folder) => (
            <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{folder.number}</span>
                    <Badge className={`text-xs ${getPriorityColor(folder.priority)}`}>
                      {folder.priority}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">{folder.client}</p>
                    <p className="text-xs text-gray-500">Créé le {folder.createdAt}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getStatusColor(folder.status)}`}>
                      {folder.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          {folders.length} dossier(s) au total
        </div>
      </div>
    </div>
  );
}