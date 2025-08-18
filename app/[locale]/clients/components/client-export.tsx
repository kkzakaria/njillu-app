'use client'

import { useState } from 'react';
import { Download, FileText, File, Calendar, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useClients } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface ClientExportProps {
  open: boolean;
  onClose: () => void;
  selectedIds?: string[];
}

interface ExportConfig {
  format: 'csv' | 'xlsx' | 'json';
  includeContacts: boolean;
  includeArchived: boolean;
  dateRange: DateRange | undefined;
  customFields: string[];
}

export function ClientExport({ open, onClose, selectedIds = [] }: ClientExportProps) {
  const t = useClients();
  const [exporting, setExporting] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    includeContacts: true,
    includeArchived: false,
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date()
    },
    customFields: ['contact_info', 'commercial_info', 'tags']
  });

  const availableFields = [
    { id: 'contact_info', label: 'Informations de contact', description: 'Email, téléphone, adresse' },
    { id: 'commercial_info', label: 'Informations commerciales', description: 'Limite de crédit, conditions de paiement' },
    { id: 'business_info', label: 'Informations entreprise', description: 'SIRET, TVA, secteur' },
    { id: 'tags', label: 'Étiquettes', description: 'Tags associés aux clients' },
    { id: 'notes', label: 'Notes', description: 'Notes et commentaires' },
    { id: 'statistics', label: 'Statistiques', description: 'Données d\'activité et métriques' }
  ];

  const formatOptions = [
    { 
      value: 'csv', 
      label: 'CSV', 
      description: 'Format texte séparé par virgules',
      icon: FileText
    },
    { 
      value: 'xlsx', 
      label: 'Excel', 
      description: 'Fichier Excel avec feuilles multiples',
      icon: File
    },
    { 
      value: 'json', 
      label: 'JSON', 
      description: 'Format de données structurées',
      icon: Settings
    }
  ];

  const handleFieldToggle = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      customFields: prev.customFields.includes(fieldId)
        ? prev.customFields.filter(id => id !== fieldId)
        : [...prev.customFields, fieldId]
    }));
  };

  const startExport = async () => {
    try {
      setExporting(true);

      const exportParams = {
        ...config,
        selectedIds: selectedIds.length > 0 ? selectedIds : undefined,
        dateRange: config.dateRange ? {
          from: config.dateRange.from?.toISOString(),
          to: config.dateRange.to?.toISOString()
        } : undefined
      };

      const response = await fetch('/api/clients/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportParams)
      });

      if (!response.ok) throw new Error('Export failed');

      // Get the filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `clients-export-${format(new Date(), 'yyyy-MM-dd')}.${config.format}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(t('notifications.export_success'));
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'exportation');
    } finally {
      setExporting(false);
    }
  };

  const getExportSummary = () => {
    const items = [];
    
    if (selectedIds.length > 0) {
      items.push(`${selectedIds.length} clients sélectionnés`);
    } else {
      items.push('Tous les clients');
    }
    
    if (config.includeArchived) {
      items.push('inclut les archivés');
    }
    
    if (config.includeContacts) {
      items.push('avec contacts');
    }
    
    items.push(`${config.customFields.length} groupes de champs`);
    
    return items.join(' • ');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>{t('export.description')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="fields">Champs</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <div className="grid gap-3">
              {formatOptions.map((format) => (
                <Card 
                  key={format.value}
                  className={`cursor-pointer transition-colors ${
                    config.format === format.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, format: format.value as any }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <format.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {format.description}
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                        {config.format === format.value && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-contacts"
                  checked={config.includeContacts}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeContacts: !!checked }))
                  }
                />
                <Label htmlFor="include-contacts">{t('export.include_contacts')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-archived"
                  checked={config.includeArchived}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeArchived: !!checked }))
                  }
                />
                <Label htmlFor="include-archived">{t('export.include_archived')}</Label>
              </div>

              <div className="space-y-2">
                <Label>{t('export.date_range')}</Label>
                <DatePickerWithRange
                  date={config.dateRange}
                  onDateChange={(range) => 
                    setConfig(prev => ({ ...prev, dateRange: range }))
                  }
                />
              </div>

              {selectedIds.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <strong>Clients sélectionnés:</strong> {selectedIds.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Seuls les clients sélectionnés seront exportés
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Sélectionnez les groupes de données à inclure dans l'export:
              </div>
              
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={field.id}
                    checked={config.customFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={field.id} className="font-medium">
                      {field.label}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {field.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-3">
            <strong>Résumé de l'export:</strong> {getExportSummary()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={startExport} disabled={exporting}>
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Exportation...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('actions.export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}