/**
 * Data mapper utilities for converting between nested API structures 
 * and flat database columns
 */

import type {
  Client,
  IndividualClient,
  BusinessClient,
  ContactInfo,
  BusinessInfo,
  IndividualInfo,
  CommercialInfo,
  CommercialHistory
} from '@/types/clients/core';
import type {
  CreateClientData,
  UpdateClientData,
  isCreateIndividualData,
  isCreateBusinessData
} from '@/types/clients/operations';
import type { EntityId } from '@/types/shared';

/**
 * Database row structure (flat columns)
 */
interface ClientDbRow {
  id: string;
  client_type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  
  // Contact information (flat)
  email: string;
  phone?: string;
  
  // Address (flat)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  state_province?: string;
  country: string;
  
  // Individual fields
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  personal_id?: string;
  
  // Business fields
  company_name?: string;
  siret?: string;
  contact_person_first_name?: string;
  contact_person_last_name?: string;
  contact_person_title?: string;
  industry?: string;
  vat_number?: string;
  
  // Commercial info (flat)
  credit_limit: number;
  credit_limit_currency: string;
  payment_terms_days: number;
  preferred_language: string;
  
  // Notes
  internal_notes?: string;
  client_notes?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string;
  deleted_by?: string;
}

/**
 * Convert API create data to flat database structure
 */
export function mapCreateDataToDb(
  data: CreateClientData,
  createdBy: EntityId
): Partial<ClientDbRow> {
  const baseData: Partial<ClientDbRow> = {
    client_type: data.client_type,
    status: 'active',
    
    // Contact info
    email: data.contact_info.email,
    phone: data.contact_info.phone,
    
    // Address
    address_line1: data.contact_info.address?.address_line1,
    address_line2: data.contact_info.address?.address_line2,
    city: data.contact_info.address?.city,
    postal_code: data.contact_info.address?.postal_code,
    state_province: data.contact_info.address?.state_province,
    country: data.contact_info.address?.country || 'FR',
    
    // Commercial info
    credit_limit: data.commercial_info?.credit_limit || 0,
    credit_limit_currency: data.commercial_info?.credit_limit_currency || 'EUR',
    payment_terms_days: data.commercial_info?.payment_terms_days || 30,
    preferred_language: data.commercial_info?.preferred_language || 'fr',
    
    // Notes
    internal_notes: data.internal_notes,
    client_notes: data.client_notes,
    
    // Audit
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    deleted_by: null
  };

  if (isCreateIndividualData(data)) {
    // Individual-specific fields
    baseData.first_name = data.individual_info.first_name;
    baseData.last_name = data.individual_info.last_name;
    baseData.date_of_birth = data.individual_info.date_of_birth;
    baseData.personal_id = data.individual_info.personal_id;
  } else if (isCreateBusinessData(data)) {
    // Business-specific fields
    baseData.company_name = data.business_info.company_name;
    baseData.industry = data.business_info.industry;
    baseData.siret = data.business_info.legal_info?.siret;
    baseData.vat_number = data.business_info.legal_info?.vat_number;
    
    // Primary contact (first in contacts array)
    const primaryContact = data.business_info.contacts.find(c => c.is_primary) || data.business_info.contacts[0];
    if (primaryContact) {
      baseData.contact_person_first_name = primaryContact.first_name;
      baseData.contact_person_last_name = primaryContact.last_name;
      baseData.contact_person_title = primaryContact.title;
    }
  }

  return baseData;
}

/**
 * Convert update data to flat database structure
 */
export function mapUpdateDataToDb(data: UpdateClientData): Partial<ClientDbRow> {
  const updateData: Partial<ClientDbRow> = {
    updated_at: new Date().toISOString()
  };

  // Contact info updates
  if (data.contact_info) {
    if (data.contact_info.email !== undefined) {
      updateData.email = data.contact_info.email;
    }
    if (data.contact_info.phone !== undefined) {
      updateData.phone = data.contact_info.phone;
    }
    if (data.contact_info.address) {
      const addr = data.contact_info.address;
      if (addr.address_line1 !== undefined) updateData.address_line1 = addr.address_line1;
      if (addr.address_line2 !== undefined) updateData.address_line2 = addr.address_line2;
      if (addr.city !== undefined) updateData.city = addr.city;
      if (addr.postal_code !== undefined) updateData.postal_code = addr.postal_code;
      if (addr.state_province !== undefined) updateData.state_province = addr.state_province;
      if (addr.country !== undefined) updateData.country = addr.country;
    }
  }

  // Individual info updates
  if ('individual_info' in data && data.individual_info) {
    const individual = data.individual_info;
    if (individual.first_name !== undefined) updateData.first_name = individual.first_name;
    if (individual.last_name !== undefined) updateData.last_name = individual.last_name;
    if (individual.date_of_birth !== undefined) updateData.date_of_birth = individual.date_of_birth;
    if (individual.personal_id !== undefined) updateData.personal_id = individual.personal_id;
  }

  // Business info updates
  if ('business_info' in data && data.business_info) {
    const business = data.business_info;
    if (business.company_name !== undefined) updateData.company_name = business.company_name;
    if (business.industry !== undefined) updateData.industry = business.industry;
    
    if (business.legal_info) {
      if (business.legal_info.siret !== undefined) updateData.siret = business.legal_info.siret;
      if (business.legal_info.vat_number !== undefined) updateData.vat_number = business.legal_info.vat_number;
    }
    
    // Update primary contact
    if (business.contacts) {
      const primaryContact = business.contacts.find(c => c.is_primary) || business.contacts[0];
      if (primaryContact) {
        updateData.contact_person_first_name = primaryContact.first_name;
        updateData.contact_person_last_name = primaryContact.last_name;
        updateData.contact_person_title = primaryContact.title;
      }
    }
  }

  // Commercial info updates
  if (data.commercial_info) {
    const commercial = data.commercial_info;
    if (commercial.credit_limit !== undefined) updateData.credit_limit = commercial.credit_limit;
    if (commercial.credit_limit_currency !== undefined) updateData.credit_limit_currency = commercial.credit_limit_currency;
    if (commercial.payment_terms_days !== undefined) updateData.payment_terms_days = commercial.payment_terms_days;
    if (commercial.preferred_language !== undefined) updateData.preferred_language = commercial.preferred_language;
  }

  // Notes updates
  if (data.internal_notes !== undefined) updateData.internal_notes = data.internal_notes;
  if (data.client_notes !== undefined) updateData.client_notes = data.client_notes;

  return updateData;
}

/**
 * Convert flat database row to nested API structure
 */
export function mapDbRowToClient(row: ClientDbRow): Client {
  // Build contact info
  const contactInfo: ContactInfo = {
    email: row.email,
    phone: row.phone,
    address: {
      address_line1: row.address_line1,
      address_line2: row.address_line2,
      city: row.city,
      postal_code: row.postal_code,
      state_province: row.state_province,
      country: row.country as 'FR' | 'US' | 'CA' | 'GB' | 'DE' | 'ES' | 'IT'
    }
  };

  // Build commercial info
  const commercialInfo: CommercialInfo = {
    credit_limit: row.credit_limit,
    credit_limit_currency: row.credit_limit_currency as 'EUR' | 'USD' | 'GBP',
    payment_terms_days: row.payment_terms_days,
    payment_terms: 'net_30',
    payment_methods: ['bank_transfer'],
    preferred_language: row.preferred_language as 'fr' | 'en' | 'es',
    priority: 'normal',
    risk_level: 'low'
  };

  // Build commercial history (defaults since not stored in DB)
  const commercialHistory: CommercialHistory = {
    total_orders_amount: 0,
    total_orders_count: 0,
    current_balance: 0,
    average_payment_delay_days: 0
  };

  const baseClient = {
    id: row.id,
    client_type: row.client_type,
    status: row.status,
    contact_info: contactInfo,
    commercial_info: commercialInfo,
    commercial_history: commercialHistory,
    internal_notes: row.internal_notes,
    client_notes: row.client_notes,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at || null,
    deleted_by: row.deleted_by || null,
    deletion_reason: null // Not stored in current schema
  };

  if (row.client_type === 'individual') {
    const individualInfo: IndividualInfo = {
      first_name: row.first_name!,
      last_name: row.last_name!,
      date_of_birth: row.date_of_birth,
      personal_id: row.personal_id
    };

    return {
      ...baseClient,
      client_type: 'individual' as const,
      individual_info: individualInfo
    } as IndividualClient;
  } else {
    const businessInfo: BusinessInfo = {
      company_name: row.company_name!,
      industry: (row.industry || 'other') as 'agriculture' | 'automotive' | 'banking' | 'construction' | 'consulting' | 'education' | 'energy' | 'finance' | 'food_beverage' | 'healthcare' | 'hospitality' | 'information_technology' | 'insurance' | 'logistics' | 'manufacturing' | 'media' | 'mining' | 'pharmaceutical' | 'real_estate' | 'retail' | 'telecommunications' | 'textiles' | 'transportation' | 'utilities' | 'other',
      contacts: [
        {
          first_name: row.contact_person_first_name!,
          last_name: row.contact_person_last_name!,
          title: row.contact_person_title,
          contact_type: 'primary',
          is_primary: true,
          is_active: true
        }
      ],
      legal_info: {
        siret: row.siret,
        vat_number: row.vat_number
      }
    };

    return {
      ...baseClient,
      client_type: 'business' as const,
      business_info: businessInfo
    } as BusinessClient;
  }
}