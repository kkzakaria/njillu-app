'use client';

import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useTranslations } from 'next-intl';
import { TwoColumnsLayout } from "@/components/layouts/two-columns-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Users, 
  BarChart, 
  Globe,
  Truck,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  DollarSign
} from "lucide-react";

// Types pour les données de démonstration
interface DemoItem {
  id: string;
  type: 'folder' | 'container' | 'bl' | 'client';
  title: string;
  subtitle: string;
  status: 'active' | 'pending' | 'completed' | 'urgent';
  date: string;
  value?: string;
  location?: string;
  details: {
    description: string;
    metadata: Record<string, string>;
    timeline: Array<{
      date: string;
      action: string;
      status: 'completed' | 'pending' | 'upcoming';
    }>;
    contacts?: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
  };
}

// Données de démonstration
const demoItems: DemoItem[] = [
  {
    id: '1',
    type: 'folder',
    title: 'IMPORT/2024/001247',
    subtitle: 'Container MSKU7845123',
    status: 'completed',
    date: '2024-08-11',
    value: '45,890 €',
    location: 'Le Havre',
    details: {
      description: 'Importation de marchandises textiles en provenance de Chine. Container 40 pieds avec documentation complète.',
      metadata: {
        'Référence': 'IMPORT/2024/001247',
        'Container': 'MSKU7845123',
        'Type': '40\' HC',
        'Poids': '28,450 kg',
        'Navire': 'CMA CGM ANTOINE DE SAINT EXUPERY',
        'Voyage': '424W',
        'Port origine': 'Shanghai',
        'Port destination': 'Le Havre',
        'Client': 'Textiles Europe SAS',
        'Transitaire': 'Geodis Wilson',
        'Valeur déclarée': '45,890 €'
      },
      timeline: [
        { date: '2024-08-01', action: 'Départ Shanghai', status: 'completed' },
        { date: '2024-08-25', action: 'Arrivée Le Havre', status: 'completed' },
        { date: '2024-08-26', action: 'Dédouanement', status: 'completed' },
        { date: '2024-08-27', action: 'Livraison finale', status: 'completed' }
      ],
      contacts: [
        { name: 'Marie Dubois', role: 'Chargée de clientèle', email: 'marie.dubois@geodis.com', phone: '+33 1 42 58 96 74' },
        { name: 'Jean Martin', role: 'Responsable douane', email: 'jean.martin@douanes.gouv.fr', phone: '+33 1 57 53 82 19' }
      ]
    }
  },
  {
    id: '2',
    type: 'container',
    title: 'TCLU1234567',
    subtitle: 'En transit - ETA 3 jours',
    status: 'active',
    date: '2024-08-08',
    value: '32,150 €',
    location: 'Méditerranée',
    details: {
      description: 'Container 20 pieds transportant des pièces automobiles. Actuellement en transit maritime vers Marseille.',
      metadata: {
        'Container': 'TCLU1234567',
        'Type': '20\' DV',
        'Poids': '18,750 kg',
        'Navire': 'MSC GRANDIOSA',
        'Voyage': '24082W',
        'Port origine': 'Algeciras',
        'Port destination': 'Marseille',
        'ETA': '2024-08-14',
        'Position actuelle': '42.3601° N, 3.4634° E',
        'Vitesse': '18.5 nœuds',
        'Client': 'AutoParts France',
        'Valeur déclarée': '32,150 €'
      },
      timeline: [
        { date: '2024-08-05', action: 'Départ Algeciras', status: 'completed' },
        { date: '2024-08-11', action: 'Passage Détroit de Gibraltar', status: 'completed' },
        { date: '2024-08-14', action: 'Arrivée prévue Marseille', status: 'upcoming' },
        { date: '2024-08-15', action: 'Dédouanement prévu', status: 'upcoming' }
      ],
      contacts: [
        { name: 'Pierre Leclerc', role: 'Agent maritime', email: 'p.leclerc@cma-cgm.com', phone: '+33 4 88 91 90 00' },
        { name: 'Sophie Bernard', role: 'Import manager', email: 'sophie.bernard@autoparts.fr', phone: '+33 4 42 97 85 63' }
      ]
    }
  },
  {
    id: '3',
    type: 'bl',
    title: 'BL-240115-001',
    subtitle: 'Documents manquants',
    status: 'urgent',
    date: '2024-08-09',
    value: '67,320 €',
    location: 'Marseille',
    details: {
      description: 'Connaissement pour importation de produits électroniques. Attente de documents complémentaires pour dédouanement.',
      metadata: {
        'Connaissement': 'BL-240115-001',
        'Container': 'MSKU9876543',
        'Type': '40\' HC',
        'Poids': '26,800 kg',
        'Navire': 'EVER GIVEN',
        'Port origine': 'Hong Kong',
        'Port destination': 'Marseille',
        'Arrivée': '2024-08-09',
        'Client': 'Electronics Import SAS',
        'Statut douanier': 'Contrôle documentaire',
        'Documents manquants': 'Certificat CE, Facture commerciale détaillée',
        'Valeur déclarée': '67,320 €'
      },
      timeline: [
        { date: '2024-07-20', action: 'Départ Hong Kong', status: 'completed' },
        { date: '2024-08-09', action: 'Arrivée Marseille', status: 'completed' },
        { date: '2024-08-10', action: 'Contrôle documentaire', status: 'pending' },
        { date: 'En attente', action: 'Dédouanement', status: 'upcoming' }
      ],
      contacts: [
        { name: 'Ahmed Kouachi', role: 'Inspecteur douanes', email: 'ahmed.kouachi@douanes.gouv.fr', phone: '+33 4 91 39 42 00' },
        { name: 'Claire Moreau', role: 'Responsable import', email: 'claire.moreau@electronics-import.fr', phone: '+33 4 42 78 96 52' }
      ]
    }
  },
  {
    id: '4',
    type: 'client',
    title: 'Luxe Fashion Group',
    subtitle: '12 dossiers actifs',
    status: 'active',
    date: '2024-08-11',
    value: '2,450,000 €',
    location: 'Paris',
    details: {
      description: 'Client premium spécialisé dans l\'importation de produits de luxe et textile haut de gamme depuis l\'Asie.',
      metadata: {
        'Raison sociale': 'Luxe Fashion Group SAS',
        'SIRET': '12345678901234',
        'TVA Intracommunautaire': 'FR12345678901',
        'Adresse': '75 Avenue des Champs-Élysées, 75008 Paris',
        'Secteur d\'activité': 'Import textile et maroquinerie de luxe',
        'Chiffre d\'affaires annuel': '2,450,000 €',
        'Nombre de dossiers 2024': '89',
        'Dossiers actifs': '12',
        'Statut': 'Client premium',
        'Gestionnaire': 'Marie-Claire Fontaine'
      },
      timeline: [
        { date: '2024-08-08', action: 'Nouveau dossier IMPORT/2024/001255', status: 'completed' },
        { date: '2024-08-10', action: 'Réunion planning Q4', status: 'completed' },
        { date: '2024-08-15', action: 'Livraison container TCLU9998877', status: 'upcoming' },
        { date: '2024-08-20', action: 'Révision contrat annuel', status: 'upcoming' }
      ],
      contacts: [
        { name: 'Marie-Claire Fontaine', role: 'Account Manager', email: 'mc.fontaine@njillu.com', phone: '+33 1 42 68 97 85' },
        { name: 'Bernard Rousseau', role: 'Directeur Supply Chain', email: 'bernard.rousseau@luxefashion.fr', phone: '+33 1 53 89 74 62' },
        { name: 'Isabella Chen', role: 'Import Coordinator', email: 'isabella.chen@luxefashion.fr', phone: '+33 1 53 89 74 68' }
      ]
    }
  }
];

interface DemoMasterDetailProps {
  messages: any;
  locale: string;
}

function DemoMasterDetailContent() {
  const [selectedItem, setSelectedItem] = useState<DemoItem>(demoItems[0]);
  const t = useTranslations('demo');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'active': return <Activity className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'folder': return <FileText className="h-5 w-5" />;
      case 'container': return <Package className="h-5 w-5" />;
      case 'bl': return <Truck className="h-5 w-5" />;
      case 'client': return <Building className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'upcoming': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  // Colonne de gauche - Liste des éléments
  const leftColumn = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Liste des Éléments</h2>
        <p className="text-sm text-muted-foreground">Sélectionnez un élément pour voir les détails</p>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          {demoItems.map((item) => (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedItem.id === item.id ? 'ring-2 ring-primary bg-muted/30' : ''
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {item.subtitle}
                        </p>
                      </div>
                      <Badge className={`ml-2 ${getStatusColor(item.status)}`} variant="outline">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          <span className="text-xs">
                            {item.status === 'completed' ? 'Terminé' :
                             item.status === 'active' ? 'Actif' :
                             item.status === 'pending' ? 'En attente' : 'Urgent'}
                          </span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                        {item.location && (
                          <>
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                          </>
                        )}
                      </div>
                      {item.value && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">{item.value}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Colonne de droite - Détails de l'élément sélectionné
  const rightColumn = (
    <div className="p-6 space-y-6">
      {/* Header avec titre et statut */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getTypeIcon(selectedItem.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedItem.title}</h1>
              <p className="text-muted-foreground">{selectedItem.subtitle}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(selectedItem.status)}`} variant="outline">
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedItem.status)}
              <span>
                {selectedItem.status === 'completed' ? 'Terminé' :
                 selectedItem.status === 'active' ? 'Actif' :
                 selectedItem.status === 'pending' ? 'En attente' : 'Urgent'}
              </span>
            </div>
          </Badge>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{selectedItem.date}</span>
          </div>
          {selectedItem.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{selectedItem.location}</span>
            </div>
          )}
          {selectedItem.value && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{selectedItem.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6">{selectedItem.details.description}</p>
        </CardContent>
      </Card>

      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedItem.details.metadata).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {key}
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Chronologie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedItem.details.timeline.map((event, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getTimelineStatusColor(event.status)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{event.action}</p>
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      {selectedItem.details.contacts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedItem.details.contacts.map((contact, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${contact.name}`} />
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{contact.name}</h4>
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Voir plus
            </Button>
            <Button variant="outline" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="h-full">
      <TwoColumnsLayout 
        left={leftColumn}
        right={rightColumn}
        className="min-h-screen"
      />
    </div>
  );
}

export function DemoMasterDetail({ messages, locale }: DemoMasterDetailProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <DemoMasterDetailContent />
    </NextIntlClientProvider>
  );
}