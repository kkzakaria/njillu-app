'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr, enUS, es } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { 
  Edit, 
  MoreHorizontal, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  AlertCircle,
  FileText,
  Activity,
  Settings,
  BarChart3,
  Truck
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { useFoldersDetail } from '@/hooks/useTranslation'
import type { Folder } from '@/types/folders'

interface FolderDetailProps {
  folder: Folder & {
    bl_count: number
    alert_count: number
    completion_percentage: number
    days_until_deadline?: number
  }
  className?: string
}

export function FolderDetail({ folder, className }: FolderDetailProps) {
  const t = useFoldersDetail()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Configuration de la locale pour date-fns
  const dateLocale = locale === 'fr' ? fr : locale === 'es' ? es : enUS

  // Badges de statut
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'outline',
      processing: 'default',
      completed: 'secondary',
      closed: 'secondary',
      on_hold: 'outline',
      cancelled: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(`detail.status_badge.${status}`)}
      </Badge>
    )
  }

  const getHealthBadge = (health: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'secondary',
      warning: 'outline',
      critical: 'destructive',
      failed: 'destructive'
    }
    
    return (
      <Badge variant={variants[health] || 'outline'}>
        {t(`detail.health_badge.${health}`)}
      </Badge>
    )
  }

  return (
    <div className={className}>
      {/* En-tête du dossier */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">
                  {t('detail.folder_number')} {folder.folder_number}
                </h1>
                {getStatusBadge(folder.status)}
                {getHealthBadge(folder.health_status)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {folder.origin.city} → {folder.destination.city}
                </span>
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  {t(`filters.type.${folder.type}`)}
                </span>
                {folder.deadline_date && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(folder.deadline_date), 'dd MMM yyyy', { locale: dateLocale })}
                  </span>
                )}
              </div>

              {folder.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {folder.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {t('detail.actions.edit')}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    {t('detail.actions.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t('detail.actions.export')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t('detail.actions.archive')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Métriques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{folder.bl_count}</div>
              <div className="text-xs text-muted-foreground">Bills of Lading</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{folder.alert_count}</div>
              <div className="text-xs text-muted-foreground">Alertes actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{folder.completion_percentage}%</div>
              <div className="text-xs text-muted-foreground">Progression</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {folder.days_until_deadline || 0}
              </div>
              <div className="text-xs text-muted-foreground">Jours restants</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression du dossier</span>
              <span className="font-medium">{folder.completion_percentage}%</span>
            </div>
            <Progress value={folder.completion_percentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Onglets de contenu */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview" className="text-xs">
            <FileText className="h-4 w-4 mr-1 hidden sm:block" />
            {t('detail.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            <FileText className="h-4 w-4 mr-1 hidden sm:block" />
            {t('detail.tabs.documents')}
          </TabsTrigger>
          <TabsTrigger value="bills_of_lading" className="text-xs">
            <Truck className="h-4 w-4 mr-1 hidden sm:block" />
            {t('detail.tabs.bills_of_lading')}
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs hidden lg:block">
            <Activity className="h-4 w-4 mr-1" />
            {t('detail.tabs.activities')}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs hidden lg:block">
            <AlertCircle className="h-4 w-4 mr-1" />
            {t('detail.tabs.alerts')}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-xs hidden lg:block">
            <BarChart3 className="h-4 w-4 mr-1" />
            {t('detail.tabs.statistics')}
          </TabsTrigger>
          <TabsTrigger value="configuration" className="text-xs hidden lg:block">
            <Settings className="h-4 w-4 mr-1" />
            {t('detail.tabs.configuration')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('detail.overview.basic_info.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.reference_number')}:
                    </span>
                    <div className="font-medium">{folder.reference_number || '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.internal_reference')}:
                    </span>
                    <div className="font-medium">{folder.internal_reference || '-'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.priority')}:
                    </span>
                    <div className="font-medium">{t(`filters.priority.${folder.priority}`)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.urgency')}:
                    </span>
                    <div className="font-medium">{t(`filters.urgency.${folder.urgency}`)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.processing_stage')}:
                    </span>
                    <div className="font-medium">{t(`filters.processing_stage.${folder.processing_stage}`)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('detail.overview.basic_info.created_date')}:
                    </span>
                    <div className="font-medium">
                      {format(new Date(folder.created_date), 'dd MMM yyyy', { locale: dateLocale })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('detail.overview.client_info.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground text-sm">
                      {t('detail.overview.client_info.name')}:
                    </span>
                    <div className="font-medium">{folder.client_info.name}</div>
                  </div>
                  {folder.client_info.company && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        {t('detail.overview.client_info.company')}:
                      </span>
                      <div className="font-medium">{folder.client_info.company}</div>
                    </div>
                  )}
                  {folder.client_info.email && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        {t('detail.overview.client_info.email')}:
                      </span>
                      <div className="font-medium">{folder.client_info.email}</div>
                    </div>
                  )}
                  {folder.client_info.phone && (
                    <div>
                      <span className="text-muted-foreground text-sm">
                        {t('detail.overview.client_info.phone')}:
                      </span>
                      <div className="font-medium">{folder.client_info.phone}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Géographie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('detail.overview.geography.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{t('detail.overview.geography.origin')}</h4>
                  <div className="text-sm space-y-1">
                    <div>{folder.origin.name}</div>
                    <div className="text-muted-foreground">
                      {folder.origin.city}, {folder.origin.country}
                    </div>
                    {folder.origin.port_code && (
                      <div className="text-muted-foreground">Port: {folder.origin.port_code}</div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-2">{t('detail.overview.geography.destination')}</h4>
                  <div className="text-sm space-y-1">
                    <div>{folder.destination.name}</div>
                    <div className="text-muted-foreground">
                      {folder.destination.city}, {folder.destination.country}
                    </div>
                    {folder.destination.port_code && (
                      <div className="text-muted-foreground">Port: {folder.destination.port_code}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations financières */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('detail.overview.financial.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t('detail.overview.financial.estimated_cost')}:
                  </span>
                  <div className="font-medium">
                    {folder.financial_info.estimated_cost?.toLocaleString()} {folder.financial_info.currency}
                  </div>
                </div>
                {folder.financial_info.actual_cost && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      {t('detail.overview.financial.actual_cost')}:
                    </span>
                    <div className="font-medium">
                      {folder.financial_info.actual_cost.toLocaleString()} {folder.financial_info.currency}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.documents.title')}</CardTitle>
              <CardDescription>
                {t('detail.documents.total_count', { count: 0 })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun document pour le moment</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills_of_lading">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.bills_of_lading.title')}</CardTitle>
              <CardDescription>
                {t('detail.bills_of_lading.total_count', { count: folder.bl_count })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bills of Lading à implémenter</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autres onglets peuvent être ajoutés ici */}
      </Tabs>
    </div>
  )
}