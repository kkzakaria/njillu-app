'use client'

import { useState, useCallback } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { useClients } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientImportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ImportResult {
  total: number;
  success: number;
  errors: ImportError[];
  warnings: string[];
}

export function ClientImport({ open, onClose, onSuccess }: ClientImportProps) {
  const t = useClients();
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processFile = async (file: File) => {
    setCurrentStep('preview');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/clients/import/preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process file');

      const data = await response.json();
      setPreviewData(data.preview);
      setUploadProgress(100);
    } catch (error) {
      toast.error('Erreur lors du traitement du fichier');
      setCurrentStep('upload');
    }
  };

  const startImport = async () => {
    if (!uploadedFile) return;

    setCurrentStep('processing');
    setProcessing(true);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to import clients');

      const result = await response.json();
      setImportResult(result);
      setCurrentStep('results');

      if (result.success > 0) {
        toast.success(t('notifications.import_success', { count: result.success }));
        onSuccess();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'importation');
      setCurrentStep('preview');
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/api/clients/import/template';
    link.download = 'client-import-template.csv';
    link.click();
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setUploadProgress(0);
    setPreviewData([]);
    setImportResult(null);
    setProcessing(false);
  };

  const handleClose = () => {
    resetImport();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
          <DialogDescription>{t('import.description')}</DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>
              1. Upload
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={currentStep !== 'preview'}>
              2. {t('import.preview')}
            </TabsTrigger>
            <TabsTrigger value="processing" disabled={currentStep !== 'processing'}>
              3. {t('import.processing')}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={currentStep !== 'results'}>
              4. Résultats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Formats supportés</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>• CSV (UTF-8)</div>
                    <div>• Excel (.xlsx, .xls)</div>
                    <div>• {t('import.max_size')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Modèle de fichier</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Téléchargez le modèle pour voir la structure attendue
                  </p>
                  <Button size="sm" variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le modèle
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? 'Déposez le fichier ici' : t('import.drop_zone')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('import.formats')}</p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {uploadedFile && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{uploadedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={resetImport}>
                  <X className="h-4 w-4 mr-2" />
                  Changer de fichier
                </Button>
              </div>
            )}

            {uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyse du fichier...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {previewData.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {t('import.preview')} ({previewData.length} lignes)
                  </h4>
                  <Button onClick={startImport}>
                    Commencer l'importation
                  </Button>
                </div>

                <ScrollArea className="h-64 border rounded">
                  <div className="p-4">
                    <div className="grid gap-2">
                      {previewData.slice(0, 10).map((row, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 text-sm">
                          <div className="font-medium">{row.name}</div>
                          <div>{row.email}</div>
                          <div>{row.type}</div>
                          <div>{row.status}</div>
                        </div>
                      ))}
                    </div>
                    {previewData.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        ... et {previewData.length - 10} lignes supplémentaires
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">{t('import.processing')}</h3>
              <p className="text-sm text-muted-foreground">
                Importation en cours, veuillez patienter...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.success}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Clients importés
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importResult.errors.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Erreurs
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {importResult.total}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total traité
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {importResult.errors.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        {t('import.errors')}
                      </h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                              Ligne {error.row}: {error.message} (champ: {error.field})
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {importResult.warnings.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        {t('import.warnings')}
                      </h4>
                      <div className="space-y-1">
                        {importResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm text-orange-600">
                            {warning}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetImport}>
                    Nouvelle importation
                  </Button>
                  <Button onClick={handleClose}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}