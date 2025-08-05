'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, RotateCcw, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { useFoldersForm } from '@/hooks/useTranslation'
import type { 
  CreateFolderData, 
  UpdateFolderData, 
  Folder,
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ServiceType,
  OperationType
} from '@/types/folders'

interface FolderFormProps {
  folder?: Folder // Pour l'édition
  onSave?: (data: CreateFolderData | UpdateFolderData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function FolderForm({ folder, onSave, onCancel, className }: FolderFormProps) {
  const t = useFoldersForm()
  const router = useRouter()
  const isEditing = Boolean(folder)
  
  // État du formulaire
  const [formData, setFormData] = useState<CreateFolderData>({
    type: folder?.type || 'import',
    category: folder?.category || 'commercial',
    priority: folder?.priority || 'normal',
    urgency: folder?.urgency || 'standard',
    reference_number: folder?.reference_number || '',
    internal_reference: folder?.internal_reference || '',
    client_info: {
      name: folder?.client_info.name || '',
      company: folder?.client_info.company || '',
      email: folder?.client_info.email || '',
      phone: folder?.client_info.phone || '',
      address: folder?.client_info.address || '',
      city: folder?.client_info.city || '',
      country: folder?.client_info.country || '',
      tax_id: folder?.client_info.tax_id || '',
      client_code: folder?.client_info.client_code || ''
    },
    origin: {
      name: folder?.origin.name || '',
      address: folder?.origin.address || '',
      city: folder?.origin.city || '',
      country: folder?.origin.country || '',
      port_code: folder?.origin.port_code || '',
      airport_code: folder?.origin.airport_code || ''
    },
    destination: {
      name: folder?.destination.name || '',
      address: folder?.destination.address || '',
      city: folder?.destination.city || '',
      country: folder?.destination.country || '',
      port_code: folder?.destination.port_code || '',
      airport_code: folder?.destination.airport_code || ''
    },
    customs_regime: folder?.customs_regime || 'import_for_consumption',
    service_type: folder?.service_type || 'full_service',
    operation_type: folder?.operation_type || 'standard',
    description: folder?.description || '',
    cargo_description: folder?.cargo_description || '',
    special_instructions: folder?.special_instructions || '',
    expected_start_date: folder?.expected_start_date || '',
    expected_completion_date: folder?.expected_completion_date || '',
    deadline_date: folder?.deadline_date || '',
    financial_info: {
      estimated_cost: folder?.financial_info.estimated_cost || 0,
      currency: folder?.financial_info.currency || 'EUR'
    },
    total_weight_kg: folder?.total_weight_kg || 0,
    total_volume_cbm: folder?.total_volume_cbm || 0,
    total_packages: folder?.total_packages || 0
  })

  // État de l'interface
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // Sections du formulaire
  const sections = [
    { 
      key: 'basic_info', 
      title: t('form.sections.basic_info.title'),
      description: t('form.sections.basic_info.description')
    },
    { 
      key: 'client_info', 
      title: t('form.sections.client_info.title'),
      description: t('form.sections.client_info.description')
    },
    { 
      key: 'geography', 
      title: t('form.sections.geography.title'),
      description: t('form.sections.geography.description')
    },
    { 
      key: 'services', 
      title: t('form.sections.services.title'),
      description: t('form.sections.services.description')
    },
    { 
      key: 'timeline', 
      title: t('form.sections.timeline.title'),
      description: t('form.sections.timeline.description')
    },
    { 
      key: 'financial', 
      title: t('form.sections.financial.title'),
      description: t('form.sections.financial.description')
    },
    { 
      key: 'cargo', 
      title: t('form.sections.cargo.title'),
      description: t('form.sections.cargo.description')
    }
  ]

  // Validation
  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (sectionIndex) {
      case 0: // Basic info
        if (!formData.type) newErrors.type = t('form.validation.required')
        if (!formData.category) newErrors.category = t('form.validation.required')
        break
      case 1: // Client info
        if (!formData.client_info.name) newErrors['client_info.name'] = t('form.validation.required')
        if (!formData.client_info.country) newErrors['client_info.country'] = t('form.validation.required')
        if (formData.client_info.email && !/\S+@\S+\.\S+/.test(formData.client_info.email)) {
          newErrors['client_info.email'] = t('form.validation.invalid_email')
        }
        break
      case 2: // Geography
        if (!formData.origin.name) newErrors['origin.name'] = t('form.validation.required')
        if (!formData.origin.country) newErrors['origin.country'] = t('form.validation.required')
        if (!formData.destination.name) newErrors['destination.name'] = t('form.validation.required')
        if (!formData.destination.country) newErrors['destination.country'] = t('form.validation.required')
        break
      case 3: // Services
        if (!formData.customs_regime) newErrors.customs_regime = t('form.validation.required')
        if (!formData.service_type) newErrors.service_type = t('form.validation.required')
        if (!formData.operation_type) newErrors.operation_type = t('form.validation.required')
        break
      case 5: // Financial
        if (!formData.financial_info?.currency) newErrors['financial_info.currency'] = t('form.validation.required')
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.')
      if (keys.length === 1) {
        return { ...prev, [field]: value }
      } else {
        const [parent, child] = keys
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof CreateFolderData] as any,
            [child]: value
          }
        }
      }
    })

    // Effacer l'erreur si le champ est corrigé
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1)
      }
    }
  }

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
    }
  }

  const handleSave = async () => {
    // Valider toutes les sections
    let isValid = true
    for (let i = 0; i < sections.length; i++) {
      if (!validateSection(i)) {
        isValid = false
        if (i < currentSection) {
          setCurrentSection(i) // Aller à la première section avec erreur
        }
        break
      }
    }

    if (!isValid) return

    setIsLoading(true)
    try {
      if (onSave) {
        await onSave(formData)
      }
      // Redirection ou message de succès
    } catch (error) {
      console.error('Error saving folder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const handleReset = () => {
    if (confirm(t('form.messages.confirm_reset'))) {
      // Réinitialiser le formulaire
      setFormData({
        type: 'import',
        category: 'commercial',
        priority: 'normal',
        urgency: 'standard',
        reference_number: '',
        internal_reference: '',
        client_info: {
          name: '',
          company: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: ''
        },
        origin: {
          name: '',
          country: ''
        },
        destination: {
          name: '',
          country: ''
        },
        customs_regime: 'import_for_consumption',
        service_type: 'full_service',
        operation_type: 'standard',
        description: '',
        financial_info: {
          currency: 'EUR'
        }
      } as CreateFolderData)
      setErrors({})
      setCurrentSection(0)
    }
  }

  // Rendu de section
  const renderSection = () => {
    const section = sections[currentSection]
    
    switch (section.key) {
      case 'basic_info':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference_number">
                  {t('form.fields.reference_number.label')}
                </Label>
                <Input
                  id="reference_number"
                  placeholder={t('form.fields.reference_number.placeholder')}
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.fields.reference_number.description')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internal_reference">
                  {t('form.fields.internal_reference.label')}
                </Label>
                <Input
                  id="internal_reference"
                  placeholder={t('form.fields.internal_reference.placeholder')}
                  value={formData.internal_reference}
                  onChange={(e) => handleInputChange('internal_reference', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('form.fields.internal_reference.description')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  {t('form.fields.type.label')} *
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.fields.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                    <SelectItem value="transhipment">Transbordement</SelectItem>
                    <SelectItem value="storage">Stockage</SelectItem>
                    <SelectItem value="consolidation">Groupage</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t('form.fields.category.label')} *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.fields.category.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="hazmat">Matières dangereuses</SelectItem>
                    <SelectItem value="perishable">Périssable</SelectItem>
                    <SelectItem value="oversized">Hors dimensions</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="high_value">Forte valeur</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">
                  {t('form.fields.priority.label')}
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">
                  {t('form.fields.urgency.label')}
                </Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="expedited">Accéléré</SelectItem>
                    <SelectItem value="rush">Urgent</SelectItem>
                    <SelectItem value="emergency">Urgence absolue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('form.fields.description.label')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('form.fields.description.placeholder')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.fields.description.description')}
              </p>
            </div>
          </div>
        )

      case 'client_info':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">
                  {t('form.fields.client_info.name.label')} *
                </Label>
                <Input
                  id="client_name"
                  placeholder={t('form.fields.client_info.name.placeholder')}
                  value={formData.client_info.name}
                  onChange={(e) => handleInputChange('client_info.name', e.target.value)}
                />
                {errors['client_info.name'] && (
                  <p className="text-xs text-destructive">{errors['client_info.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_company">
                  {t('form.fields.client_info.company.label')}
                </Label>
                <Input
                  id="client_company"
                  placeholder={t('form.fields.client_info.company.placeholder')}
                  value={formData.client_info.company}
                  onChange={(e) => handleInputChange('client_info.company', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_email">
                  {t('form.fields.client_info.email.label')}
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder={t('form.fields.client_info.email.placeholder')}
                  value={formData.client_info.email}
                  onChange={(e) => handleInputChange('client_info.email', e.target.value)}
                />
                {errors['client_info.email'] && (
                  <p className="text-xs text-destructive">{errors['client_info.email']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">
                  {t('form.fields.client_info.phone.label')}
                </Label>
                <Input
                  id="client_phone"
                  placeholder={t('form.fields.client_info.phone.placeholder')}
                  value={formData.client_info.phone}
                  onChange={(e) => handleInputChange('client_info.phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_address">
                {t('form.fields.client_info.address.label')}
              </Label>
              <Input
                id="client_address"
                placeholder={t('form.fields.client_info.address.placeholder')}
                value={formData.client_info.address}
                onChange={(e) => handleInputChange('client_info.address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_city">
                  {t('form.fields.client_info.city.label')}
                </Label>
                <Input
                  id="client_city"
                  placeholder={t('form.fields.client_info.city.placeholder')}
                  value={formData.client_info.city}
                  onChange={(e) => handleInputChange('client_info.city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_country">
                  {t('form.fields.client_info.country.label')} *
                </Label>
                <Input
                  id="client_country"
                  placeholder={t('form.fields.client_info.country.placeholder')}
                  value={formData.client_info.country}
                  onChange={(e) => handleInputChange('client_info.country', e.target.value)}
                />
                {errors['client_info.country'] && (
                  <p className="text-xs text-destructive">{errors['client_info.country']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_tax_id">
                  {t('form.fields.client_info.tax_id.label')}
                </Label>
                <Input
                  id="client_tax_id"
                  placeholder={t('form.fields.client_info.tax_id.placeholder')}
                  value={formData.client_info.tax_id}
                  onChange={(e) => handleInputChange('client_info.tax_id', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_code">
                  {t('form.fields.client_info.client_code.label')}
                </Label>
                <Input
                  id="client_code"
                  placeholder={t('form.fields.client_info.client_code.placeholder')}
                  value={formData.client_info.client_code}
                  onChange={(e) => handleInputChange('client_info.client_code', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      // Autres sections similaires...
      default:
        return <div>Section en cours de développement</div>
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isEditing 
                  ? t('form.edit.title') 
                  : t('form.create.title')
                }
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? t('form.edit.subtitle', { folderNumber: folder?.folder_number })
                  : t('form.create.subtitle')
                }
              </CardDescription>
            </div>
            {isEditing && (
              <Badge variant="outline">
                {folder?.folder_number}
              </Badge>
            )}
          </div>

          {/* Indicateur de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
            </div>
            <Progress value={((currentSection + 1) / sections.length) * 100} className="h-2" />
          </div>

          {/* Navigation des sections - Mobile */}
          <div className="lg:hidden">
            <Select 
              value={currentSection.toString()} 
              onValueChange={(value) => setCurrentSection(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section, index) => (
                  <SelectItem key={section.key} value={index.toString()}>
                    {index + 1}. {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Navigation des sections - Desktop */}
          <div className="hidden lg:block">
            <div className="flex space-x-1">
              {sections.map((section, index) => (
                <Button
                  key={section.key}
                  variant={index === currentSection ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className="flex-1 text-xs"
                >
                  {index + 1}. {section.title}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* En-tête de section */}
          <div>
            <h3 className="text-lg font-medium">{sections[currentSection].title}</h3>
            <p className="text-sm text-muted-foreground">
              {sections[currentSection].description}
            </p>
          </div>

          {/* Contenu de la section */}
          {renderSection()}

          {/* Boutons de navigation */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevSection}
                disabled={currentSection === 0}
              >
                Précédent
              </Button>
              {currentSection < sections.length - 1 ? (
                <Button onClick={handleNextSection}>
                  Suivant
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Enregistrement...' : t('form.actions.save')}
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('form.actions.preview')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('form.actions.reset')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                {t('form.actions.cancel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}