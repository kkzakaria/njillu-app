'use client'

import { useState, useEffect } from 'react'
import { useQueryStates } from 'nuqs'
import { Eye, Edit, MoreHorizontal, Plus, RotateCcw, AlertCircle, Calendar, MapPin, Package, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { fr, enUS, es } from 'date-fns/locale'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { folderSearchParsers } from '@/lib/search-params/folder-params'
import { buildApiSearchParams } from '@/lib/search-params/folder-params'
import { useFolders } from '@/hooks/useTranslation'
import { HighlightSearch } from './folder-search'
import type { Folder, FolderStatus, FolderPriority, FolderType } from '@/types/folders'

// Mock data pour la démonstration
const MOCK_FOLDERS: Array<Folder & {
  bl_count: number
  alert_count: number  
  completion_percentage: number
  days_until_deadline?: number
}> = [
  {
    id: '1',
    folder_number: 'M250804-000001',
    reference_number: 'REF-2024-001',
    internal_reference: 'INT-2024-001',
    type: 'import',
    category: 'commercial',
    priority: 'high',
    urgency: 'expedited',
    client_info: {
      name: 'ACME Corporation',
      company: 'ACME Corp.',
      email: 'contact@acme.com',
      country: 'France'
    },
    origin: {
      name: 'Port du Havre',
      city: 'Le Havre',
      country: 'France'
    },
    destination: {
      name: 'Port de Hambourg',
      city: 'Hamburg',
      country: 'Germany'
    },
    status: 'processing',
    processing_stage: 'customs_clearance',
    health_status: 'healthy',
    customs_regime: 'import_for_consumption',
    compliance_status: 'compliant',
    service_type: 'full_service',
    operation_type: 'standard',
    created_date: '2024-08-04T10:00:00Z',
    deadline_date: '2024-08-15T23:59:59Z',
    financial_info: {
      estimated_cost: 5000,
      currency: 'EUR'
    },
    metadata: {
      created_at: '2024-08-04T10:00:00Z',
      updated_at: '2024-08-04T10:00:00Z'
    },
    bl_count: 2,
    alert_count: 1,
    completion_percentage: 65,
    days_until_deadline: 5
  },
  {
    id: '2',
    folder_number: 'M250804-000002',
    reference_number: 'EXP-2024-002',
    type: 'export',
    category: 'urgent',
    priority: 'critical',
    urgency: 'rush',
    client_info: {
      name: 'Global Logistics Ltd',
      company: 'Global Logistics',
      country: 'United Kingdom'
    },
    origin: {
      name: 'CDG Airport',
      city: 'Paris',
      country: 'France'
    },
    destination: {
      name: 'JFK Airport',
      city: 'New York',
      country: 'United States'
    },
    status: 'open',
    processing_stage: 'documentation',
    health_status: 'warning',
    customs_regime: 'definitive_export',
    compliance_status: 'pending_review',
    service_type: 'express',
    operation_type: 'express',
    created_date: '2024-08-03T14:30:00Z',
    deadline_date: '2024-08-08T12:00:00Z',
    financial_info: {
      estimated_cost: 12000,
      currency: 'EUR'
    },
    metadata: {
      created_at: '2024-08-03T14:30:00Z',
      updated_at: '2024-08-04T09:15:00Z'
    },
    bl_count: 1,
    alert_count: 3,
    completion_percentage: 25,
    days_until_deadline: 2
  }
]

interface FolderListProps {
  className?: string
}

export function FolderList({ className }: FolderListProps) {
  const t = useFolders()
  const locale = useLocale()
  
  const [filters] = useQueryStates(folderSearchParsers)
  const [isLoading, setIsLoading] = useState(false)
  const [folders, setFolders] = useState(MOCK_FOLDERS)
  const [error, setError] = useState<string | null>(null)

  // Configuration de la locale pour date-fns
  const dateLocale = locale === 'fr' ? fr : locale === 'es' ? es : enUS

  // Simulation d'un appel API
  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Ici vous feriez l'appel API réel avec buildApiSearchParams(filters)
        const apiParams = buildApiSearchParams(filters)
        console.log('API call would be made with:', apiParams)
        
        // Pour la démo, on filtre les données mock
        let filteredFolders = MOCK_FOLDERS
        
        // Filtre par recherche avec vérifications null
        if (filters.search && typeof filters.search === 'string') {
          const searchLower = filters.search.toLowerCase()
          filteredFolders = filteredFolders.filter(folder =>
            (folder.folder_number || '').toLowerCase().includes(searchLower) ||
            (folder.reference_number || '').toLowerCase().includes(searchLower) ||
            (folder.client_info?.name || '').toLowerCase().includes(searchLower)
          )
        }
        
        // Filtre par statut avec vérifications null
        if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
          filteredFolders = filteredFolders.filter(folder =>
            folder.status && filters.status.includes(folder.status)
          )
        }
        
        // Filtre par type avec vérifications null
        if (filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
          filteredFolders = filteredFolders.filter(folder =>
            folder.type && filters.type.includes(folder.type)
          )
        }
        
        setFolders(filteredFolders)
      } catch (err) {
        setError(t('error.load_failed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFolders()
  }, [filters, t])

  // Badges de statut
  const getStatusBadge = (status: FolderStatus) => {
    const variants: Record<FolderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'outline',
      processing: 'default',
      completed: 'secondary',
      closed: 'secondary',
      on_hold: 'outline',
      cancelled: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {t(`filters.status.${status}`)}
      </Badge>
    )
  }

  // Badge de priorité avec couleurs
  const getPriorityBadge = (priority: FolderPriority) => {
    const colors: Record<FolderPriority, string> = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      normal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      critical: 'bg-red-600 text-white dark:bg-red-500'
    }
    
    return (
      <Badge className={colors[priority]}>
        {t(`filters.priority.${priority}`)}
      </Badge>
    )
  }

  // Actions sur les dossiers
  const handleView = (folderId: string) => {
    console.log('View folder:', folderId)
    // Navigation vers la page de détail
  }

  const handleEdit = (folderId: string) => {
    console.log('Edit folder:', folderId)
    // Navigation vers le formulaire d'édition
  }

  // Vue en cartes (mobile-first)
  const CardView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {folders.map((folder) => (
        <Card key={folder.id} className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <HighlightSearch 
                    text={folder.folder_number}
                    className="font-mono text-sm font-medium"
                  />
                  {folder.alert_count > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {folder.alert_count}
                    </Badge>
                  )}
                </div>
                <HighlightSearch 
                  text={folder.client_info.name}
                  className="text-sm text-muted-foreground"
                />
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(folder.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(folder.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(folder.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Package className="h-3 w-3 mr-1" />
                  {t(`filters.type.${folder.type}`)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {folder.origin.city} → {folder.destination.city}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {folder.deadline_date && format(new Date(folder.deadline_date), 'dd/MM', { locale: dateLocale })}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {folder.financial_info?.estimated_cost?.toLocaleString() || '0'} {folder.financial_info?.currency || 'EUR'}
                </div>
              </div>
            </div>

            {/* Progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{folder.completion_percentage || 0}%</span>
              </div>
              <Progress value={folder.completion_percentage || 0} className="h-2" />
            </div>

            {/* Badges et métriques */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getPriorityBadge(folder.priority)}
                {folder.days_until_deadline !== undefined && folder.days_until_deadline <= 3 && (
                  <Badge variant="destructive" className="text-xs">
                    {folder.days_until_deadline}j restants
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                {(folder.bl_count || 0) > 0 && (
                  <span>{folder.bl_count} B/L</span>
                )}
                {(folder.alert_count || 0) > 0 && (
                  <span className="flex items-center text-destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {folder.alert_count}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Vue en tableau (desktop)
  const TableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.folder_number')}</TableHead>
            <TableHead>{t('table.client_name')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.type')}</TableHead>
            <TableHead>{t('table.priority')}</TableHead>
            <TableHead>{t('table.deadline_date')}</TableHead>
            <TableHead>{t('table.completion_percentage')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <TableRow key={folder.id}>
              <TableCell className="font-mono">
                <HighlightSearch text={folder.folder_number} />
              </TableCell>
              <TableCell>
                <HighlightSearch text={folder.client_info.name} />
              </TableCell>
              <TableCell>{getStatusBadge(folder.status)}</TableCell>
              <TableCell>{t(`filters.type.${folder.type}`)}</TableCell>
              <TableCell>{getPriorityBadge(folder.priority)}</TableCell>
              <TableCell>
                {folder.deadline_date && format(new Date(folder.deadline_date), 'dd/MM/yyyy', { locale: dateLocale })}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={folder.completion_percentage || 0} className="h-2 w-16" />
                  <span className="text-sm text-muted-foreground">{folder.completion_percentage || 0}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(folder.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('actions.view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(folder.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  // État de chargement
  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-medium">{error}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('error.retry')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('error.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // État vide
  if (folders.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">{t('empty_state.title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('empty_state.description')}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('empty_state.create_first')}
                </Button>
                <Button variant="outline">
                  {t('empty_state.clear_filters')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* En-tête avec sélecteur de vue */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {t('pagination.showing', { 
            start: 1, 
            end: folders.length, 
            total: folders.length 
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select defaultValue="cards">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">{t('view_modes.cards')}</SelectItem>
              <SelectItem value="table">{t('view_modes.table')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Affichage adaptatif */}
      <div className="block xl:hidden">
        <CardView />
      </div>
      <div className="hidden xl:block">
        <TableView />
      </div>
    </div>
  )
}