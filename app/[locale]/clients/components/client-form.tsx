'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClients } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { ContactForm } from './contact-form';
import type { 
  Client,
  ClientDetail,
  CreateClientData,
  UpdateClientData,
  ContactPerson,
  ClientType,
  ClientStatus,
  ClientPriority,
  ClientRiskLevel,
  PaymentTerms,
  PaymentMethod,
  CountryCode,
  LanguageCode,
  Industry
} from '@/types/clients';

interface ClientFormProps {
  client?: ClientDetail;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

interface FormData {
  client_type: ClientType;
  status: ClientStatus;
  
  // Individual info
  individual_info?: {
    first_name: string;
    last_name: string;
  };
  
  // Business info
  business_info?: {
    company_name: string;
    legal_name?: string;
    industry?: Industry;
    legal_info?: {
      siret?: string;
      vat_number?: string;
      legal_form?: string;
    };
    contacts?: ContactPerson[];
  };
  
  // Contact info
  contact_info: {
    email: string;
    phone?: string;
    address?: {
      address_line1: string;
      address_line2?: string;
      city: string;
      postal_code: string;
      country: CountryCode;
    };
  };
  
  // Commercial info
  commercial_info?: {
    credit_limit?: number;
    credit_limit_currency?: string;
    payment_terms_days?: number;
    payment_terms?: PaymentTerms;
    payment_methods?: PaymentMethod[];
    preferred_language?: LanguageCode;
    priority?: ClientPriority;
    risk_level?: ClientRiskLevel;
  };
  
  tags?: string[];
  notes?: string;
}

export function ClientForm({ client, mode, onSuccess }: ClientFormProps) {
  const t = useClients();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>(() => {
    if (client && mode === 'edit') {
      return {
        client_type: client.client_type,
        status: client.status,
        individual_info: client.individual_info,
        business_info: client.business_info,
        contact_info: client.contact_info,
        commercial_info: client.commercial_info,
        tags: client.tags || [],
        notes: client.notes
      };
    }
    
    return {
      client_type: 'individual',
      status: 'active',
      contact_info: {
        email: '',
        address: {
          address_line1: '',
          city: '',
          postal_code: '',
          country: 'FR'
        }
      },
      individual_info: {
        first_name: '',
        last_name: ''
      },
      commercial_info: {
        credit_limit: 0,
        credit_limit_currency: 'EUR',
        payment_terms_days: 30,
        payment_terms: 'net_30',
        payment_methods: ['bank_transfer'],
        preferred_language: 'fr',
        priority: 'normal',
        risk_level: 'low'
      },
      tags: [],
      notes: ''
    };
  });

  const [tagInput, setTagInput] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<{ index: number; contact: ContactPerson } | null>(null);

  // Validate form data
  const validateForm = async () => {
    setValidating(true);
    setErrors({});
    setValidationErrors([]);

    try {
      const response = await fetch('/api/clients/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData,
          mode,
          client_id: client?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.validation_errors) {
          setValidationErrors(errorData.validation_errors);
        }
        if (errorData.field_errors) {
          setErrors(errorData.field_errors);
        }
        return false;
      }

      return true;
    } catch (error) {
      setValidationErrors(['Erreur de validation réseau']);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setSaving(true);

    try {
      const url = mode === 'create' 
        ? '/api/clients'
        : `/api/clients/${client!.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      
      toast.success(mode === 'create' 
        ? t('notifications.created')
        : t('notifications.updated')
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/clients/${result.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateNestedField = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData as any;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleClientTypeChange = (type: ClientType) => {
    const updates: Partial<FormData> = { client_type: type };
    
    if (type === 'individual') {
      updates.individual_info = {
        first_name: '',
        last_name: ''
      };
      updates.business_info = undefined;
    } else {
      updates.business_info = {
        company_name: '',
        contacts: []
      };
      updates.individual_info = undefined;
    }
    
    updateFormData(updates);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      updateFormData({ 
        tags: [...(formData.tags || []), tagInput.trim()] 
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({ 
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const addContact = (contact: ContactPerson) => {
    const contacts = formData.business_info?.contacts || [];
    updateNestedField(['business_info', 'contacts'], [...contacts, contact]);
    setShowContactForm(false);
  };

  const updateContact = (index: number, contact: ContactPerson) => {
    const contacts = [...(formData.business_info?.contacts || [])];
    contacts[index] = contact;
    updateNestedField(['business_info', 'contacts'], contacts);
    setEditingContact(null);
  };

  const removeContact = (index: number) => {
    const contacts = formData.business_info?.contacts?.filter((_, i) => i !== index) || [];
    updateNestedField(['business_info', 'contacts'], contacts);
  };

  const handleBack = () => {
    if (client) {
      router.push(`/clients/${client.id}`);
    } else {
      router.push('/clients');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('actions.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === 'create' ? t('form.create_title') : t('form.edit_title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' 
              ? 'Créez un nouveau client en remplissant les informations ci-dessous'
              : 'Modifiez les informations du client'
            }
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Informations de base</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="additional">Supplémentaire</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Client Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.select_type')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.client_type === 'individual' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleClientTypeChange('individual')}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6" />
                    <div>
                      <div className="font-medium">{t('types.individual')}</div>
                      <div className="text-sm text-muted-foreground">
                        Particulier ou personne physique
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.client_type === 'business' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleClientTypeChange('business')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    <div>
                      <div className="font-medium">{t('types.business')}</div>
                      <div className="text-sm text-muted-foreground">
                        Entreprise ou personne morale
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Information */}
          {formData.client_type === 'individual' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('form.personal_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      {t('fields.first_name')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      value={formData.individual_info?.first_name || ''}
                      onChange={(e) => updateNestedField(['individual_info', 'first_name'], e.target.value)}
                      className={errors.first_name ? 'border-destructive' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">
                      {t('fields.last_name')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      value={formData.individual_info?.last_name || ''}
                      onChange={(e) => updateNestedField(['individual_info', 'last_name'], e.target.value)}
                      className={errors.last_name ? 'border-destructive' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Information */}
          {formData.client_type === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('form.company_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      {t('fields.company_name')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.business_info?.company_name || ''}
                      onChange={(e) => updateNestedField(['business_info', 'company_name'], e.target.value)}
                      className={errors.company_name ? 'border-destructive' : ''}
                    />
                    {errors.company_name && (
                      <p className="text-sm text-destructive">{errors.company_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legal_name">Raison sociale</Label>
                    <Input
                      id="legal_name"
                      value={formData.business_info?.legal_name || ''}
                      onChange={(e) => updateNestedField(['business_info', 'legal_name'], e.target.value)}
                      placeholder="Si différente du nom commercial"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={formData.business_info?.legal_info?.siret || ''}
                      onChange={(e) => updateNestedField(['business_info', 'legal_info', 'siret'], e.target.value)}
                      placeholder="14 chiffres"
                      className={errors.siret ? 'border-destructive' : ''}
                    />
                    {errors.siret && (
                      <p className="text-sm text-destructive">{errors.siret}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vat_number">Numéro de TVA</Label>
                    <Input
                      id="vat_number"
                      value={formData.business_info?.legal_info?.vat_number || ''}
                      onChange={(e) => updateNestedField(['business_info', 'legal_info', 'vat_number'], e.target.value)}
                      placeholder="FR12345678901"
                      className={errors.vat_number ? 'border-destructive' : ''}
                    />
                    {errors.vat_number && (
                      <p className="text-sm text-destructive">{errors.vat_number}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Secteur d'activité</Label>
                  <Input
                    id="industry"
                    value={formData.business_info?.industry || ''}
                    onChange={(e) => updateNestedField(['business_info', 'industry'], e.target.value)}
                    placeholder="ex: Technologie, Commerce de détail"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData({ status: value as ClientStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('statuses.active')}</SelectItem>
                  <SelectItem value="inactive">{t('statuses.inactive')}</SelectItem>
                  <SelectItem value="archived">{t('statuses.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('form.contact_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('fields.email')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => updateNestedField(['contact_info', 'email'], e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('fields.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contact_info.phone || ''}
                    onChange={(e) => updateNestedField(['contact_info', 'phone'], e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">
                    Adresse <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address_line1"
                    value={formData.contact_info.address?.address_line1 || ''}
                    onChange={(e) => updateNestedField(['contact_info', 'address', 'address_line1'], e.target.value)}
                    placeholder="Numéro et nom de rue"
                    className={errors.address_line1 ? 'border-destructive' : ''}
                  />
                  {errors.address_line1 && (
                    <p className="text-sm text-destructive">{errors.address_line1}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line2">Complément d'adresse</Label>
                  <Input
                    id="address_line2"
                    value={formData.contact_info.address?.address_line2 || ''}
                    onChange={(e) => updateNestedField(['contact_info', 'address', 'address_line2'], e.target.value)}
                    placeholder="Bâtiment, étage, appartement"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">
                      Code postal <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="postal_code"
                      value={formData.contact_info.address?.postal_code || ''}
                      onChange={(e) => updateNestedField(['contact_info', 'address', 'postal_code'], e.target.value)}
                      className={errors.postal_code ? 'border-destructive' : ''}
                    />
                    {errors.postal_code && (
                      <p className="text-sm text-destructive">{errors.postal_code}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      Ville <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.contact_info.address?.city || ''}
                      onChange={(e) => updateNestedField(['contact_info', 'address', 'city'], e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Pays <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.contact_info.address?.country || 'FR'}
                      onValueChange={(value) => updateNestedField(['contact_info', 'address', 'country'], value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="BE">Belgique</SelectItem>
                        <SelectItem value="CH">Suisse</SelectItem>
                        <SelectItem value="DE">Allemagne</SelectItem>
                        <SelectItem value="ES">Espagne</SelectItem>
                        <SelectItem value="IT">Italie</SelectItem>
                        <SelectItem value="GB">Royaume-Uni</SelectItem>
                        <SelectItem value="US">États-Unis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Contacts */}
          {formData.client_type === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Contacts de l'entreprise
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowContactForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un contact
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.business_info?.contacts && formData.business_info.contacts.length > 0 ? (
                  <div className="space-y-3">
                    {formData.business_info.contacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {contact.first_name} {contact.last_name}
                            </span>
                            {contact.is_primary && (
                              <Badge variant="outline">Principal</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.position && `${contact.position} • `}
                            {contact.email}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingContact({ index, contact })}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeContact(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucun contact ajouté
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('form.commercial_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Limite de crédit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    value={formData.commercial_info?.credit_limit || ''}
                    onChange={(e) => updateNestedField(['commercial_info', 'credit_limit'], Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_currency">Devise</Label>
                  <Select
                    value={formData.commercial_info?.credit_limit_currency || 'EUR'}
                    onValueChange={(value) => updateNestedField(['commercial_info', 'credit_limit_currency'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms_days">Délai de paiement (jours)</Label>
                  <Input
                    id="payment_terms_days"
                    type="number"
                    value={formData.commercial_info?.payment_terms_days || ''}
                    onChange={(e) => updateNestedField(['commercial_info', 'payment_terms_days'], Number(e.target.value))}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Conditions de paiement</Label>
                  <Select
                    value={formData.commercial_info?.payment_terms || 'net_30'}
                    onValueChange={(value) => updateNestedField(['commercial_info', 'payment_terms'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiat</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                      <SelectItem value="net_90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select
                    value={formData.commercial_info?.priority || 'normal'}
                    onValueChange={(value) => updateNestedField(['commercial_info', 'priority'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('priorities.low')}</SelectItem>
                      <SelectItem value="normal">{t('priorities.normal')}</SelectItem>
                      <SelectItem value="high">{t('priorities.high')}</SelectItem>
                      <SelectItem value="critical">{t('priorities.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_level">Niveau de risque</Label>
                  <Select
                    value={formData.commercial_info?.risk_level || 'low'}
                    onValueChange={(value) => updateNestedField(['commercial_info', 'risk_level'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('risk_levels.low')}</SelectItem>
                      <SelectItem value="medium">{t('risk_levels.medium')}</SelectItem>
                      <SelectItem value="high">{t('risk_levels.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_language">Langue préférée</Label>
                <Select
                  value={formData.commercial_info?.preferred_language || 'fr'}
                  onValueChange={(value) => updateNestedField(['commercial_info', 'preferred_language'], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Étiquettes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ajouter une étiquette"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag}>
                  Ajouter
                </Button>
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="Notes et commentaires sur le client..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={handleBack}>
          {t('actions.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={saving || validating}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Enregistrement...
            </>
          ) : validating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Validation...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('actions.save')}
            </>
          )}
        </Button>
      </div>

      {/* Contact Form Modal */}
      {(showContactForm || editingContact) && (
        <ContactForm
          contact={editingContact?.contact}
          onSave={editingContact 
            ? (contact) => updateContact(editingContact.index, contact)
            : addContact
          }
          onCancel={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
}