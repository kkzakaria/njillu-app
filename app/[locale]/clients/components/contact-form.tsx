'use client'

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useClients } from '@/hooks/useTranslation';
import type { ContactPerson } from '@/types/clients';

interface ContactFormProps {
  contact?: ContactPerson;
  onSave: (contact: ContactPerson) => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const t = useClients();
  const [formData, setFormData] = useState<ContactPerson>(() => {
    if (contact) {
      return { ...contact };
    }
    
    return {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      is_primary: false
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = t('form.required');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('form.required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('form.required');
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(formData.email)) {
      newErrors.email = t('form.invalid_email');
    }

    if (formData.phone && !/^[+]?[0-9\s\-()\.]+$/.test(formData.phone)) {
      newErrors.phone = t('form.invalid_phone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const updateField = (field: keyof ContactPerson, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contact ? t('contact.edit') : t('contact.add')}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Modifiez les informations du contact'
              : 'Ajoutez un nouveau contact pour cette entreprise'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_first_name">
                {t('contact.first_name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_first_name"
                value={formData.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                className={errors.first_name ? 'border-destructive' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_last_name">
                {t('contact.last_name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_last_name"
                value={formData.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">
              {t('contact.email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">{t('contact.phone')}</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_position">{t('contact.position')}</Label>
              <Input
                id="contact_position"
                value={formData.position || ''}
                onChange={(e) => updateField('position', e.target.value)}
                placeholder="ex: Directeur général"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_department">{t('contact.department')}</Label>
              <Input
                id="contact_department"
                value={formData.department || ''}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="ex: Direction, Commercial"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contact_is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => updateField('is_primary', !!checked)}
            />
            <Label htmlFor="contact_is_primary">{t('contact.is_primary')}</Label>
          </div>
          {formData.is_primary && (
            <p className="text-sm text-muted-foreground ml-6">
              Ce contact sera utilisé comme contact principal pour l'entreprise
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}