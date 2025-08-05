import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import { FolderFilters } from '@/components/folders/folder-filters'
import { FolderSearch } from '@/components/folders/folder-search'
import { FolderList } from '@/components/folders/folder-list'
import { folderSearchParamsCache } from '@/lib/search-params/folder-params'
import { Link } from '@/i18n/navigation'

interface FoldersPageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function FoldersPage({ searchParams }: FoldersPageProps) {
  const t = await getTranslations('folders')
  
  // Parser les paramètres de recherche pour SSR
  const parsedParams = folderSearchParamsCache.parse(await searchParams)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('list.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('list.subtitle')}
          </p>
        </div>
        
        <Link href="/folders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('list.actions.create_new')}
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Layout responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de filtres - Colonne gauche sur desktop */}
        <div className="lg:col-span-1">
          <Suspense fallback={<FiltersSkeleton />}>
            <FolderFilters />
          </Suspense>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Barre de recherche */}
          <Suspense fallback={<SearchSkeleton />}>
            <FolderSearch />
          </Suspense>

          {/* Liste des dossiers */}
          <Suspense fallback={<ListSkeleton />}>
            <FolderList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// Composants de chargement pour le SSR
function FiltersSkeleton() {
  return (
    <Card>
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </Card>
  )
}

function SearchSkeleton() {
  return <Skeleton className="h-10 w-full" />
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-3 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Génération des métadonnées pour SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'folders' })

  return {
    title: t('list.title'),
    description: t('list.subtitle'),
  }
}