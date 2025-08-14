/**
 * Client validation service - Data validation and business rules
 * Handles validation of client data before creation/update
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type {
  CreateClientData,
  UpdateClientData,
  ClientValidationResult,
  ClientValidationOptions,
  isCreateIndividualData,
  isCreateBusinessData
} from '@/types/clients/operations';
import type { ContactInfo, BusinessInfo, IndividualInfo } from '@/types/clients/core';
import type { EntityId } from '@/types/shared';

export class ClientValidationService {
  /**
   * Validate client data before creation
   */
  static async validateCreate(
    data: CreateClientData,
    options: ClientValidationOptions = {}
  ): Promise<ClientValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Validate common fields
    await this.validateContactInfo(data.contact_info, errors, warnings, options);
    
    // Validate type-specific fields
    if (isCreateIndividualData(data)) {
      this.validateIndividualInfo(data.individual_info, errors, warnings);
    } else if (isCreateBusinessData(data)) {
      await this.validateBusinessInfo(data.business_info, errors, warnings, options);
    }

    // Validate commercial info if provided
    if (data.commercial_info) {
      this.validateCommercialInfo(data.commercial_info, errors, warnings);
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate client data before update
   */
  static async validateUpdate(
    clientId: EntityId,
    data: UpdateClientData,
    options: ClientValidationOptions = {}
  ): Promise<ClientValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    const updateOptions = { ...options, exclude_client_id: clientId };

    // Validate contact info if provided
    if (data.contact_info) {
      await this.validateContactInfo(data.contact_info, errors, warnings, updateOptions);
    }

    // Validate individual info if provided
    if ('individual_info' in data && data.individual_info) {
      this.validateIndividualInfo(data.individual_info, errors, warnings);
    }

    // Validate business info if provided
    if ('business_info' in data && data.business_info) {
      await this.validateBusinessInfo(data.business_info, errors, warnings, updateOptions);
    }

    // Validate commercial info if provided
    if (data.commercial_info) {
      this.validateCommercialInfo(data.commercial_info, errors, warnings);
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate contact information
   */
  private static async validateContactInfo(
    contactInfo: Partial<ContactInfo>,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>,
    options: ClientValidationOptions
  ): Promise<void> {
    // Required email validation
    if (!contactInfo.email) {
      errors.push({
        field: 'contact_info.email',
        message: 'Email address is required',
        code: 'REQUIRED_FIELD'
      });
    } else {
      // Email format validation
      if (options.check_formats !== false) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactInfo.email)) {
          errors.push({
            field: 'contact_info.email',
            message: 'Invalid email format',
            code: 'INVALID_FORMAT'
          });
        }
      }

      // Email uniqueness validation
      if (options.check_email_uniqueness !== false) {
        const isDuplicate = await this.checkEmailUniqueness(
          contactInfo.email,
          options.exclude_client_id
        );
        if (isDuplicate) {
          errors.push({
            field: 'contact_info.email',
            message: 'Email address already exists',
            code: 'DUPLICATE_EMAIL'
          });
        }
      }
    }

    // Phone validation
    if (contactInfo.phone && options.check_formats !== false) {
      // Basic phone format validation (international format)
      const phoneRegex = /^\+?[\d\s\-\(\)\.]{7,20}$/;
      if (!phoneRegex.test(contactInfo.phone)) {
        warnings.push({
          field: 'contact_info.phone',
          message: 'Phone number format may be invalid',
          code: 'PHONE_FORMAT_WARNING'
        });
      }
    }

    // Address validation
    if (contactInfo.address) {
      if (!contactInfo.address.country) {
        errors.push({
          field: 'contact_info.address.country',
          message: 'Country is required',
          code: 'REQUIRED_FIELD'
        });
      }

      // Postal code validation for France
      if (contactInfo.address.country === 'FR' && contactInfo.address.postal_code) {
        const frenchPostalRegex = /^[0-9]{5}$/;
        if (!frenchPostalRegex.test(contactInfo.address.postal_code)) {
          warnings.push({
            field: 'contact_info.address.postal_code',
            message: 'French postal code should be 5 digits',
            code: 'POSTAL_CODE_FORMAT'
          });
        }
      }
    }
  }

  /**
   * Validate individual information
   */
  private static validateIndividualInfo(
    individualInfo: Partial<IndividualInfo>,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>
  ): void {
    // Required fields
    if (!individualInfo.first_name?.trim()) {
      errors.push({
        field: 'individual_info.first_name',
        message: 'First name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!individualInfo.last_name?.trim()) {
      errors.push({
        field: 'individual_info.last_name',
        message: 'Last name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Date of birth validation
    if (individualInfo.date_of_birth) {
      const birthDate = new Date(individualInfo.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime())) {
        errors.push({
          field: 'individual_info.date_of_birth',
          message: 'Invalid date format',
          code: 'INVALID_FORMAT'
        });
      } else if (age < 16) {
        warnings.push({
          field: 'individual_info.date_of_birth',
          message: 'Client appears to be under 16 years old',
          code: 'AGE_WARNING'
        });
      } else if (age > 120) {
        errors.push({
          field: 'individual_info.date_of_birth',
          message: 'Invalid birth date',
          code: 'INVALID_DATE'
        });
      }
    }

    // Name length validation
    if (individualInfo.first_name && individualInfo.first_name.length > 50) {
      errors.push({
        field: 'individual_info.first_name',
        message: 'First name too long (max 50 characters)',
        code: 'MAX_LENGTH'
      });
    }

    if (individualInfo.last_name && individualInfo.last_name.length > 50) {
      errors.push({
        field: 'individual_info.last_name',
        message: 'Last name too long (max 50 characters)',
        code: 'MAX_LENGTH'
      });
    }
  }

  /**
   * Validate business information
   */
  private static async validateBusinessInfo(
    businessInfo: Partial<BusinessInfo>,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>,
    options: ClientValidationOptions
  ): Promise<void> {
    // Required fields
    if (!businessInfo.company_name?.trim()) {
      errors.push({
        field: 'business_info.company_name',
        message: 'Company name is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!businessInfo.industry) {
      errors.push({
        field: 'business_info.industry',
        message: 'Industry is required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Company name length
    if (businessInfo.company_name && businessInfo.company_name.length > 100) {
      errors.push({
        field: 'business_info.company_name',
        message: 'Company name too long (max 100 characters)',
        code: 'MAX_LENGTH'
      });
    }

    // Contacts validation
    if (businessInfo.contacts) {
      if (businessInfo.contacts.length === 0) {
        errors.push({
          field: 'business_info.contacts',
          message: 'At least one contact is required',
          code: 'REQUIRED_FIELD'
        });
      } else {
        // Check for primary contact
        const primaryContacts = businessInfo.contacts.filter(c => c.is_primary);
        if (primaryContacts.length === 0) {
          errors.push({
            field: 'business_info.contacts',
            message: 'At least one primary contact is required',
            code: 'PRIMARY_CONTACT_REQUIRED'
          });
        } else if (primaryContacts.length > 1) {
          warnings.push({
            field: 'business_info.contacts',
            message: 'Multiple primary contacts found',
            code: 'MULTIPLE_PRIMARY_CONTACTS'
          });
        }

        // Validate each contact
        businessInfo.contacts.forEach((contact, index) => {
          if (!contact.first_name?.trim()) {
            errors.push({
              field: `business_info.contacts[${index}].first_name`,
              message: 'Contact first name is required',
              code: 'REQUIRED_FIELD'
            });
          }

          if (!contact.last_name?.trim()) {
            errors.push({
              field: `business_info.contacts[${index}].last_name`,
              message: 'Contact last name is required',
              code: 'REQUIRED_FIELD'
            });
          }
        });
      }
    }

    // Legal info validation
    if (businessInfo.legal_info) {
      const { legal_info } = businessInfo;
      
      // SIRET validation for French companies
      if (legal_info.siret) {
        if (options.check_formats !== false) {
          const siretRegex = /^[0-9]{14}$/;
          if (!siretRegex.test(legal_info.siret)) {
            errors.push({
              field: 'business_info.legal_info.siret',
              message: 'SIRET must be 14 digits',
              code: 'INVALID_FORMAT'
            });
          }
        }

        // SIRET uniqueness check
        if (options.check_siret_uniqueness !== false) {
          const isDuplicate = await this.checkSiretUniqueness(
            legal_info.siret,
            options.exclude_client_id
          );
          if (isDuplicate) {
            errors.push({
              field: 'business_info.legal_info.siret',
              message: 'SIRET already exists',
              code: 'DUPLICATE_SIRET'
            });
          }
        }
      }

      // VAT number format validation
      if (legal_info.vat_number && options.check_formats !== false) {
        const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,13}$/;
        if (!vatRegex.test(legal_info.vat_number)) {
          warnings.push({
            field: 'business_info.legal_info.vat_number',
            message: 'VAT number format may be invalid',
            code: 'VAT_FORMAT_WARNING'
          });
        }
      }
    }
  }

  /**
   * Validate commercial information
   */
  private static validateCommercialInfo(
    commercialInfo: Partial<any>,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string; code: string }>
  ): void {
    // Credit limit validation
    if (commercialInfo.credit_limit !== undefined) {
      if (commercialInfo.credit_limit < 0) {
        errors.push({
          field: 'commercial_info.credit_limit',
          message: 'Credit limit cannot be negative',
          code: 'INVALID_VALUE'
        });
      }

      if (commercialInfo.credit_limit > 1000000) {
        warnings.push({
          field: 'commercial_info.credit_limit',
          message: 'High credit limit amount',
          code: 'HIGH_CREDIT_LIMIT'
        });
      }
    }

    // Payment terms validation
    if (commercialInfo.payment_terms_days !== undefined) {
      if (commercialInfo.payment_terms_days < 0) {
        errors.push({
          field: 'commercial_info.payment_terms_days',
          message: 'Payment terms cannot be negative',
          code: 'INVALID_VALUE'
        });
      }

      if (commercialInfo.payment_terms_days > 365) {
        warnings.push({
          field: 'commercial_info.payment_terms_days',
          message: 'Payment terms exceed one year',
          code: 'LONG_PAYMENT_TERMS'
        });
      }
    }
  }

  /**
   * Check email uniqueness
   */
  private static async checkEmailUniqueness(
    email: string,
    excludeClientId?: EntityId
  ): Promise<boolean> {
    const supabase = await createSupabaseClient();
    
    let query = supabase
      .from('clients')
      .select('id')
      .eq('contact_info->email', email)
      .is('deleted_at', null);

    if (excludeClientId) {
      query = query.neq('id', excludeClientId);
    }

    const { data, error } = await query.limit(1);
    
    if (error) {
      throw new Error(`Email uniqueness check failed: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Check SIRET uniqueness
   */
  private static async checkSiretUniqueness(
    siret: string,
    excludeClientId?: EntityId
  ): Promise<boolean> {
    const supabase = await createSupabaseClient();
    
    let query = supabase
      .from('clients')
      .select('id')
      .eq('business_info->legal_info->siret', siret)
      .is('deleted_at', null);

    if (excludeClientId) {
      query = query.neq('id', excludeClientId);
    }

    const { data, error } = await query.limit(1);
    
    if (error) {
      throw new Error(`SIRET uniqueness check failed: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  }
}