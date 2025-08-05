import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FolderForm } from '@/components/folders/folder-form'
import { Link } from '@/i18n/navigation'

export default async function NewFolderPage() {
  const t = await getTranslations('folders.form')

  const handleSave = async (data: unknown) => {
    'use server'
    // Ici vous implémenteriez la logique de sauvegarde
    console.log('Creating folder:', data)
    // Redirection après création
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link href="/folders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('actions.back_to_list')}
          </Button>
        </Link>
      </div>

      {/* Formulaire */}
      <FolderForm />
    </div>
  )
}

// Métadonnées pour SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'folders.form' })

  return {
    title: t('create.title'),
    description: t('create.subtitle'),
  }
}