import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FolderForm } from '@/components/folders/folder-form'
import { Link } from '@/i18n/navigation'

// Mock data - même dossier que la page de détail
const MOCK_FOLDER = {
  id: '1',
  folder_number: 'M250804-000001',
  reference_number: 'REF-2024-001',
  internal_reference: 'INT-2024-001',
  type: 'import' as const,
  category: 'commercial' as const,
  priority: 'high' as const,
  urgency: 'expedited' as const,
  client_info: {
    name: 'ACME Corporation',
    company: 'ACME Corp.',
    email: 'contact@acme.com',
    phone: '+33 1 23 45 67 89',
    country: 'France',
    city: 'Paris',
    address: '123 Rue de la Paix'
  },
  origin: {
    name: 'Port du Havre',
    city: 'Le Havre',
    country: 'France',
    port_code: 'FRLEH'
  },
  destination: {
    name: 'Port de Hambourg',  
    city: 'Hamburg',
    country: 'Germany',
    port_code: 'DEHAM'
  },
  status: 'processing' as const,
  processing_stage: 'customs_clearance' as const,
  health_status: 'healthy' as const,
  customs_regime: 'import_for_consumption' as const,
  compliance_status: 'compliant' as const,
  service_type: 'full_service' as const,
  operation_type: 'standard' as const,
  description: 'Importation de matériel informatique pour ACME Corporation. Dossier prioritaire avec dédouanement express.',
  cargo_description: 'Ordinateurs portables et équipements informatiques',
  created_date: '2024-08-04T10:00:00Z',
  deadline_date: '2024-08-15T23:59:59Z',
  expected_completion_date: '2024-08-14T17:00:00Z',
  financial_info: {
    estimated_cost: 5000,
    actual_cost: 4800,
    currency: 'EUR'
  },
  total_weight_kg: 1200,
  total_volume_cbm: 2.5,
  total_packages: 24,
  metadata: {
    created_at: '2024-08-04T10:00:00Z',
    updated_at: '2024-08-04T10:00:00Z'
  }
}

interface EditFolderPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function EditFolderPage({ params }: EditFolderPageProps) {
  const { id, locale } = await params
  const t = await getTranslations('folders')

  // Dans un vrai projet, vous feriez un appel API ici
  const folder = MOCK_FOLDER
  
  if (!folder) {
    notFound()
  }

  const handleSave = async (data: any) => {
    'use server'
    // Ici vous implémenteriez la logique de mise à jour
    console.log('Updating folder:', id, data)
    // Redirection après mise à jour
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link href={`/folders/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dossier
          </Button>
        </Link>
      </div>

      {/* Formulaire d'édition */}
      <FolderForm 
        folder={folder}
        onSave={handleSave}
      />
    </div>
  )
}

// Génération des métadonnées pour SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'folders' })

  // Dans un vrai projet, vous récupéreriez les infos du dossier
  const folderNumber = MOCK_FOLDER.folder_number

  return {
    title: `${t('form.edit.title')} - ${folderNumber}`,
    description: `Modifier le dossier ${folderNumber}`,
  }
}