'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Edit, 
  FileText, 
  Calendar, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { FolderSummary } from '@/types/folders';

interface FolderDetailsPanelProps {
  selectedFolder?: FolderSummary | null;
}

export function FolderDetailsPanel({ selectedFolder }: FolderDetailsPanelProps) {
  // Mock data étendu pour la démonstration (basé sur le dossier sélectionné)
  const getMockExtendedData = (folder: FolderSummary) => ({
    ...folder,
    client: {
      name: folder.client_name,
      contact: 'Jean Dupont',
      email: 'jean.dupont@' + folder.client_name.toLowerCase().replace(' ', '') + '.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Paix, 75001 Paris'
    },
    description: `Dossier ${folder.type} pour ${folder.client_name}`,
    documents: [
      { name: 'Facture commerciale', status: 'Reçu', date: '2024-01-15' },
      { name: 'Liste de colisage', status: 'Reçu', date: '2024-01-15' },
      { name: 'Connaissement', status: folder.status === 'completed' ? 'Reçu' : 'En attente', date: folder.status === 'completed' ? '2024-01-16' : null },
      { name: 'Certificat d\'origine', status: 'Reçu', date: '2024-01-16' },
    ],
    timeline: [
      { date: '2024-01-20', action: 'Dossier mis à jour', user: 'Agent Smith' },
      { date: '2024-01-18', action: 'Documents vérifiés', user: 'Agent Johnson' },
      { date: '2024-01-16', action: 'Certificat d\'origine reçu', user: 'Agent Smith' },
      { date: folder.created_date.split('T')[0], action: 'Dossier créé', user: 'Agent Smith' },
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'Reçu': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'En attente': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Manquant': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!selectedFolder) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Sélectionnez un dossier pour voir les détails</p>
        </div>
      </div>
    );
  }

  const extendedData = getMockExtendedData(selectedFolder);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{selectedFolder.folder_number}</h1>
            <p className="text-gray-600">{extendedData.description}</p>
          </div>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className={`${getStatusColor(selectedFolder.status)}`}>
            {selectedFolder.status}
          </Badge>
          <Badge className={`${getPriorityColor(selectedFolder.priority)}`}>
            Priorité {selectedFolder.priority}
          </Badge>
          <span className="text-sm text-gray-500">
            Créé le {selectedFolder.created_date.split('T')[0]}
          </span>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Historique</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Informations Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{extendedData.client.name}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{extendedData.client.contact}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{extendedData.client.email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{extendedData.client.phone}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                          <span className="text-sm">{extendedData.client.address}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Informations de Traitement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date de création</p>
                        <p>{selectedFolder.created_date.split('T')[0]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Origine → Destination</p>
                        <p>{selectedFolder.origin_name} → {selectedFolder.destination_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut</p>
                        <Badge className={`${getStatusColor(selectedFolder.status)}`}>
                          {selectedFolder.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents Requis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {extendedData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          {getDocumentStatusIcon(doc.status)}
                          <div className="ml-3">
                            <p className="font-medium">{doc.name}</p>
                            {doc.date && (
                              <p className="text-sm text-gray-500">Reçu le {doc.date}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={doc.status === 'Reçu' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {extendedData.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium">{event.action}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{event.date}</span>
                            <span>•</span>
                            <span>par {event.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notes et Commentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        Le client a demandé un traitement prioritaire pour ce dossier. 
                        Les documents sont attendus avant le 25 janvier.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>Agent Smith</span>
                        <span className="mx-2">•</span>
                        <span>15 janvier 2024</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm">
                        ⚠️ Attention : Le connaissement n&apos;est toujours pas arrivé. 
                        Relancer la compagnie maritime.
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>Agent Johnson</span>
                        <span className="mx-2">•</span>
                        <span>18 janvier 2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}