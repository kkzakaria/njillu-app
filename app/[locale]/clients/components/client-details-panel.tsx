'use client'

import { useState, useEffect } from 'react';
import { 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Calendar,
  CreditCard,
  Tag,
  AlertCircle,
  Users,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClients } from '@/hooks/useTranslation';
import { Link } from '@/i18n/navigation';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import type { ClientSummary, ClientDetail, ContactPerson } from '@/types/clients';

interface ClientDetailsPanelProps {
  selectedClient: ClientSummary | null;
}

const dateLocaleMap = { fr, en: enUS, es };

export function ClientDetailsPanel({ selectedClient }: ClientDetailsPanelProps) {
  const t = useClients();
  const locale = useLocale() as keyof typeof dateLocaleMap;
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClient) {
      fetchClientDetail(selectedClient.id);
    } else {
      setClientDetail(null);
    }
  }, [selectedClient]);

  const fetchClientDetail = async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client details');

      const data = await response.json();
      setClientDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getClientDisplayName = (client: ClientSummary | ClientDetail): string => {
    if (client.client_type === 'individual') {
      return `${client.individual_info?.first_name || ''} ${client.individual_info?.last_name || ''}`.trim();
    } else {
      return client.business_info?.company_name || '';
    }
  };

  const getClientInitials = (client: ClientSummary | ClientDetail): string => {
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
      return format(new Date(dateString), 'PPP', {
        locale: dateLocaleMap[locale]
      });
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'normal':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!selectedClient) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {t('empty_states.no_clients')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un client pour voir ses détails
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Erreur</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button size="sm" onClick={() => fetchClientDetail(selectedClient.id)}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const client = clientDetail || selectedClient;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getClientInitials(client)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {getClientDisplayName(client)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {client.client_type === 'individual' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span className="text-sm text-muted-foreground">
                  {t(`types.${client.client_type}`)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(client.status)}>
                  {t(`statuses.${client.status}`)}
                </Badge>
                <Badge variant={getPriorityVariant(client.commercial_info?.priority || 'normal')}>
                  {t(`priorities.${client.commercial_info?.priority || 'normal'}`)}
                </Badge>
              </div>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Link>
          </Button>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('form.contact_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.contact_info?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${client.contact_info.email}`}
                  className="text-sm hover:underline"
                >
                  {client.contact_info.email}
                </a>
              </div>
            )}
            {client.contact_info?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${client.contact_info.phone}`}
                  className="text-sm hover:underline"
                >
                  {client.contact_info.phone}
                </a>
              </div>
            )}
            {client.contact_info?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
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

        {/* Individual Information */}
        {client.client_type === 'individual' && client.individual_info && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('form.personal_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Information */}
        {client.client_type === 'business' && client.business_info && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('form.company_info')}
                </CardTitle>
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
                    <div className="text-sm font-medium">{t('fields.siret')}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.legal_info.siret}
                    </div>
                  </div>
                )}
                {client.business_info.legal_info?.vat_number && (
                  <div>
                    <div className="text-sm font-medium">{t('fields.vat_number')}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.business_info.legal_info.vat_number}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Contacts */}
            {clientDetail?.business_info?.contacts && clientDetail.business_info.contacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('fields.contacts')}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/clients/${client.id}/edit#contacts`}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('contact.add')}
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientDetail.business_info.contacts.map((contact, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {`${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {contact.first_name} {contact.last_name}
                            </span>
                            {contact.is_primary && (
                              <Badge variant="outline" className="text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                          {contact.position && (
                            <div className="text-sm text-muted-foreground">
                              {contact.position}
                              {contact.department && ` - ${contact.department}`}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            {contact.email && (
                              <a 
                                href={`mailto:${contact.email}`}
                                className="text-xs text-muted-foreground hover:underline"
                              >
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-xs text-muted-foreground hover:underline"
                              >
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Commercial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('form.commercial_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.commercial_info?.credit_limit && (
              <div>
                <div className="text-sm font-medium">{t('fields.credit_limit')}</div>
                <div className="text-sm text-muted-foreground">
                  {client.commercial_info.credit_limit.toLocaleString()} {client.commercial_info.credit_limit_currency}
                </div>
              </div>
            )}
            {client.commercial_info?.payment_terms && (
              <div>
                <div className="text-sm font-medium">{t('fields.payment_terms')}</div>
                <div className="text-sm text-muted-foreground">
                  {client.commercial_info.payment_terms_days} jours ({client.commercial_info.payment_terms})
                </div>
              </div>
            )}
            {client.commercial_info?.risk_level && (
              <div>
                <div className="text-sm font-medium">Niveau de risque</div>
                <Badge variant={client.commercial_info.risk_level === 'high' ? 'destructive' : 'default'}>
                  {t(`risk_levels.${client.commercial_info.risk_level}`)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t('fields.tags')}
              </CardTitle>
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
              <CardTitle>{t('fields.notes')}</CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm font-medium">{t('fields.created_at')}</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(client.created_at)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{t('fields.updated_at')}</div>
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
  );
}