'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Archive, 
  RotateCcw, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useTranslation';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ClientDetail } from '@/types/clients';

interface ClientDetailPageProps {
  clientId: string;
}

export function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const t = useClients();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client non trouvé');
        }
        throw new Error('Erreur lors du chargement du client');
      }

      const data = await response.json();
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!client) return;

    try {
      setActionLoading(true);
      let response;

      switch (action) {
        case 'delete':
          response = await fetch(`/api/clients/${client.id}`, {
            method: 'DELETE'
          });
          break;
        case 'archive':
          response = await fetch(`/api/clients/${client.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' })
          });
          break;
        case 'activate':
          response = await fetch(`/api/clients/${client.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          break;
        default:
          return;
      }

      if (response?.ok) {
        if (action === 'delete') {
          toast.success(t('notifications.deleted'));
          router.push('/clients');
        } else {
          await fetchClient();
          toast.success(
            action === 'archive' 
              ? t('notifications.archived')
              : t('notifications.activated')
          );
        }
      } else {
        throw new Error('Erreur lors de l\'action');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setActionLoading(false);
    }
  };

  const getClientDisplayName = (client: ClientDetail): string => {
    if (client.client_type === 'individual') {
      return `${client.individual_info?.first_name || ''} ${client.individual_info?.last_name || ''}`.trim();
    } else {
      return client.business_info?.company_name || '';
    }
  };

  const getClientInitials = (client: ClientDetail): string => {
    const name = getClientDisplayName(client);
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/clients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
            <Button onClick={fetchClient}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Client non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Le client demandé n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('actions.back')}
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getClientInitials(client)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">
                {getClientDisplayName(client)}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(client.status)}>
                  {t(`statuses.${client.status}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`types.${client.client_type}`)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Link>
          </Button>

          {client.status === 'archived' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('activate')}
              disabled={actionLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('actions.unarchive')}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('archive')}
              disabled={actionLoading}
            >
              <Archive className="h-4 w-4 mr-2" />
              {t('actions.archive')}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={actionLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('actions.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmations.delete')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('confirmations.delete_description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleAction('delete')}
                >
                  {t('actions.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content - This will use the ClientDetailsPanel component but in full width */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.contact_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.contact_info?.email && (
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <a 
                    href={`mailto:${client.contact_info.email}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {client.contact_info.email}
                  </a>
                </div>
              )}
              
              {client.contact_info?.phone && (
                <div>
                  <div className="text-sm font-medium">Téléphone</div>
                  <a 
                    href={`tel:${client.contact_info.phone}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {client.contact_info.phone}
                  </a>
                </div>
              )}

              {client.contact_info?.address && (
                <div>
                  <div className="text-sm font-medium">Adresse</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{client.contact_info.address.address_line1}</div>
                    {client.contact_info.address.address_line2 && (
                      <div>{client.contact_info.address.address_line2}</div>
                    )}
                    <div>
                      {client.contact_info.address.postal_code} {client.contact_info.address.city}
                    </div>
                    <div>{client.contact_info.address.country}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual/Business specific info */}
          {client.client_type === 'individual' && client.individual_info && (
            <Card>
              <CardHeader>
                <CardTitle>{t('form.personal_info')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">{t('fields.first_name')}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.individual_info.first_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">{t('fields.last_name')}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.individual_info.last_name}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {client.client_type === 'business' && client.business_info && (
            <Card>
              <CardHeader>
                <CardTitle>{t('form.company_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium">{t('fields.company_name')}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.business_info.company_name}
                  </div>
                </div>
                
                {client.business_info.legal_name && 
                 client.business_info.legal_name !== client.business_info.company_name && (
                  <div>
                    <div className="text-sm font-medium">Raison sociale</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.legal_name}
                    </div>
                  </div>
                )}

                {client.business_info.industry && (
                  <div>
                    <div className="text-sm font-medium">{t('fields.industry')}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.industry}
                    </div>
                  </div>
                )}

                {client.business_info.legal_info?.siret && (
                  <div>
                    <div className="text-sm font-medium">SIRET</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.legal_info.siret}
                    </div>
                  </div>
                )}

                {client.business_info.legal_info?.vat_number && (
                  <div>
                    <div className="text-sm font-medium">Numéro de TVA</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.legal_info.vat_number}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Commercial Information */}
          {client.commercial_info && (
            <Card>
              <CardHeader>
                <CardTitle>{t('form.commercial_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.commercial_info.credit_limit && (
                  <div>
                    <div className="text-sm font-medium">Limite de crédit</div>
                    <div className="text-sm text-muted-foreground">
                      {client.commercial_info.credit_limit.toLocaleString()} {client.commercial_info.credit_limit_currency}
                    </div>
                  </div>
                )}

                {client.commercial_info.payment_terms && (
                  <div>
                    <div className="text-sm font-medium">Conditions de paiement</div>
                    <div className="text-sm text-muted-foreground">
                      {client.commercial_info.payment_terms_days} jours ({client.commercial_info.payment_terms})
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Priorité</div>
                    <Badge variant="outline">
                      {t(`priorities.${client.commercial_info.priority || 'normal'}`)}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Niveau de risque</div>
                    <Badge variant={client.commercial_info.risk_level === 'high' ? 'destructive' : 'outline'}>
                      {t(`risk_levels.${client.commercial_info.risk_level || 'low'}`)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Étiquettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Créé le</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(client.created_at)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Modifié le</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(client.updated_at)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Créé par</div>
                <div className="text-sm text-muted-foreground">
                  {client.created_by}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}