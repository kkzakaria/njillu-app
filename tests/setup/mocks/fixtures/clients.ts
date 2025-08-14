/**
 * Mock client data fixtures for testing
 */

import type { ClientSummary, ClientDetail } from '@/types/clients/core';

export const mockClients: ClientSummary[] = [
  {
    id: 'client-individual-1',
    client_type: 'individual',
    status: 'active',
    display_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33123456789',
    city: 'Paris',
    country: 'FR',
    credit_limit: 5000,
    credit_limit_currency: 'EUR',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'client-business-1',
    client_type: 'business',
    status: 'active',
    display_name: 'Tech Solutions SARL',
    email: 'contact@techsolutions.fr',
    phone: '+33123456789',
    city: 'Lyon',
    country: 'FR',
    credit_limit: 50000,
    credit_limit_currency: 'EUR',
    created_at: '2024-01-10T09:00:00.000Z',
    updated_at: '2024-01-20T15:30:00.000Z'
  },
  {
    id: 'client-individual-2',
    client_type: 'individual',
    status: 'inactive',
    display_name: 'Marie Martin',
    email: 'marie.martin@example.com',
    phone: '+33987654321',
    city: 'Marseille',
    country: 'FR',
    credit_limit: 3000,
    credit_limit_currency: 'EUR',
    created_at: '2024-01-05T14:00:00.000Z',
    updated_at: '2024-01-25T11:00:00.000Z'
  },
  {
    id: 'client-business-2',
    client_type: 'business',
    status: 'active',
    display_name: 'Global Import Export Ltd',
    email: 'info@globalimport.com',
    phone: '+33456789123',
    city: 'Nice',
    country: 'FR',
    credit_limit: 100000,
    credit_limit_currency: 'EUR',
    created_at: '2023-12-01T08:00:00.000Z',
    updated_at: '2024-02-01T16:00:00.000Z'
  }
];

export const mockClientDetail: ClientDetail[] = [
  {
    client: {
      id: 'client-individual-1',
      client_type: 'individual',
      individual_info: {
        first_name: 'Jean',
        last_name: 'Dupont',
        date_of_birth: '1985-03-15',
        profession: 'Ingénieur'
      },
      contact_info: {
        email: 'jean.dupont@example.com',
        phone: '+33123456789',
        address: {
          address_line1: '123 Rue de la Paix',
          city: 'Paris',
          postal_code: '75001',
          country: 'FR'
        }
      },
      commercial_info: {
        credit_limit: 5000,
        credit_limit_currency: 'EUR',
        payment_terms_days: 30,
        payment_terms: 'net_30',
        payment_methods: ['bank_transfer'],
        preferred_language: 'fr',
        priority: 'normal',
        risk_level: 'low'
      },
      commercial_history: {
        total_orders_amount: 12500,
        total_orders_count: 3,
        current_balance: 0,
        average_payment_delay_days: 2
      },
      status: 'active',
      tags: ['vip', 'engineer'],
      created_by: 'user-1',
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null
    },
    display_info: {
      display_name: 'Jean Dupont',
      contact_name: 'Jean Dupont',
      type_label_fr: 'Particulier',
      type_label_en: 'Individual',
      type_label_es: 'Particular'
    },
    total_folders: 3,
    active_folders: 2,
    last_activity_date: '2024-02-10T14:30:00.000Z',
    can_modify: true,
    can_delete: false
  },
  {
    client: {
      id: 'client-business-1',
      client_type: 'business',
      business_info: {
        company_name: 'Tech Solutions SARL',
        industry: 'information_technology',
        business_description: 'Solutions informatiques pour entreprises',
        employee_count: 50,
        contacts: [
          {
            first_name: 'Marie',
            last_name: 'Martin',
            title: 'Directrice Commerciale',
            contact_type: 'primary',
            is_primary: true,
            is_active: true,
            contact_info: {
              email: 'marie.martin@techsolutions.fr',
              phone: '+33198765432'
            }
          },
          {
            first_name: 'Pierre',
            last_name: 'Durand',
            title: 'Directeur Technique',
            contact_type: 'technical',
            is_primary: false,
            is_active: true,
            contact_info: {
              email: 'pierre.durand@techsolutions.fr',
              phone: '+33187654321'
            }
          }
        ],
        legal_info: {
          siret: '12345678901234',
          vat_number: 'FR12345678901'
        }
      },
      contact_info: {
        email: 'contact@techsolutions.fr',
        phone: '+33123456789',
        website: 'https://techsolutions.fr',
        address: {
          address_line1: '456 Avenue des Champs',
          city: 'Lyon',
          postal_code: '69000',
          country: 'FR'
        }
      },
      commercial_info: {
        credit_limit: 50000,
        credit_limit_currency: 'EUR',
        payment_terms_days: 45,
        payment_terms: 'net_45',
        payment_methods: ['bank_transfer', 'check'],
        preferred_language: 'fr',
        priority: 'high',
        risk_level: 'medium'
      },
      commercial_history: {
        total_orders_amount: 125000,
        total_orders_count: 15,
        current_balance: 5000,
        average_payment_delay_days: 7
      },
      status: 'active',
      tags: ['technology', 'corporate'],
      created_by: 'user-1',
      created_at: '2024-01-10T09:00:00.000Z',
      updated_at: '2024-01-20T15:30:00.000Z',
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null
    },
    display_info: {
      display_name: 'Tech Solutions SARL',
      contact_name: 'Marie Martin',
      type_label_fr: 'Entreprise',
      type_label_en: 'Business',
      type_label_es: 'Empresa'
    },
    total_folders: 8,
    active_folders: 5,
    last_activity_date: '2024-02-15T09:15:00.000Z',
    can_modify: true,
    can_delete: false
  }
];

export const createMockClient = (overrides: Partial<ClientSummary> = {}): ClientSummary => ({
  id: `mock-${Date.now()}`,
  client_type: 'individual',
  status: 'active',
  display_name: 'Test Client',
  email: 'test@example.com',
  phone: '+33123456789',
  city: 'Paris',
  country: 'FR',
  credit_limit: 5000,
  credit_limit_currency: 'EUR',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createMockIndividualClientData = (overrides: any = {}) => ({
  client_type: 'individual',
  individual_info: {
    first_name: 'Test',
    last_name: 'User',
    date_of_birth: '1990-01-01',
    profession: 'Developer'
  },
  contact_info: {
    email: 'test@example.com',
    phone: '+33123456789',
    address: {
      address_line1: '123 Test Street',
      city: 'Paris',
      postal_code: '75001',
      country: 'FR'
    }
  },
  commercial_info: {
    credit_limit: 5000,
    credit_limit_currency: 'EUR',
    payment_terms_days: 30,
    payment_terms: 'net_30',
    payment_methods: ['bank_transfer'],
    preferred_language: 'fr',
    priority: 'normal',
    risk_level: 'low'
  },
  tags: ['test'],
  ...overrides
});

export const createMockBusinessClientData = (overrides: any = {}) => ({
  client_type: 'business',
  business_info: {
    company_name: 'Test Business Corp',
    industry: 'information_technology',
    business_description: 'Test business for testing',
    employee_count: 10,
    contacts: [
      {
        first_name: 'John',
        last_name: 'Doe',
        title: 'CEO',
        contact_type: 'primary',
        is_primary: true,
        is_active: true,
        contact_info: {
          email: 'john@testbusiness.com',
          phone: '+33987654321'
        }
      }
    ],
    legal_info: {
      siret: '12345678901234',
      vat_number: 'FR12345678901'
    }
  },
  contact_info: {
    email: 'contact@testbusiness.com',
    phone: '+33123456789',
    website: 'https://testbusiness.com',
    address: {
      address_line1: '456 Business Ave',
      city: 'Lyon',
      postal_code: '69000',
      country: 'FR'
    }
  },
  commercial_info: {
    credit_limit: 50000,
    credit_limit_currency: 'EUR',
    payment_terms_days: 45,
    payment_terms: 'net_45',
    payment_methods: ['bank_transfer', 'check'],
    preferred_language: 'fr',
    priority: 'high',
    risk_level: 'medium'
  },
  tags: ['test', 'business'],
  ...overrides
});