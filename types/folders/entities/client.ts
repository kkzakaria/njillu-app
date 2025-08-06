/**
 * Entités client - Types relatifs aux clients et contacts
 */

/**
 * Informations de contact client
 */
export interface ClientInfo {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  client_code?: string;
  account_manager?: string;
}

/**
 * Contact étendu avec informations supplémentaires
 */
export interface ExtendedClientInfo extends ClientInfo {
  secondary_contacts?: Array<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  billing_info?: {
    billing_address?: string;
    billing_city?: string;
    billing_country?: string;
    payment_terms?: string;
    credit_limit?: number;
  };
  preferences?: {
    communication_language?: string;
    notification_methods?: Array<'email' | 'sms' | 'phone'>;
    preferred_contact_time?: string;
  };
}