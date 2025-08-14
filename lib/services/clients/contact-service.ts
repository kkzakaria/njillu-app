/**
 * Contact service - Business client contact management
 * Handles adding, updating, and removing business contacts
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type {
  AddContactData,
  UpdateContactData,
  RemoveContactParams
} from '@/types/clients/operations';
import type { BusinessClient, ContactPerson } from '@/types/clients/core';
import type { EntityId } from '@/types/shared';
import { ClientService } from './client-service';

export class ContactService {
  /**
   * Add a new contact to a business client
   */
  static async addContact(data: AddContactData): Promise<BusinessClient> {
    const client = await ClientService.getById(data.client_id);
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.client_type !== 'business') {
      throw new Error('Can only add contacts to business clients');
    }

    // Validate contact data
    this.validateContactData(data.contact);

    // Prepare contact with defaults
    const newContact: ContactPerson = {
      ...data.contact,
      is_active: data.contact.is_active ?? true
    };

    // If this is being set as primary, ensure no other contact is primary
    if (newContact.is_primary) {
      const businessClient = client as BusinessClient;
      businessClient.business_info.contacts.forEach(contact => {
        contact.is_primary = false;
      });
    }

    // Add the new contact
    const updatedContacts = [...(client as BusinessClient).business_info.contacts, newContact];

    // Update the client
    const updatedClient = await ClientService.update({
      client_id: data.client_id,
      data: {
        business_info: {
          ...(client as BusinessClient).business_info,
          contacts: updatedContacts
        }
      }
    });

    return updatedClient as BusinessClient;
  }

  /**
   * Update an existing contact
   */
  static async updateContact(data: UpdateContactData): Promise<BusinessClient> {
    const client = await ClientService.getById(data.client_id);
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.client_type !== 'business') {
      throw new Error('Can only update contacts for business clients');
    }

    const businessClient = client as BusinessClient;
    const contacts = [...businessClient.business_info.contacts];

    if (data.contact_index < 0 || data.contact_index >= contacts.length) {
      throw new Error('Invalid contact index');
    }

    // Validate updates
    if (data.updates.first_name !== undefined || data.updates.last_name !== undefined) {
      this.validateContactData({
        ...contacts[data.contact_index],
        ...data.updates
      } as ContactPerson);
    }

    // Apply updates
    contacts[data.contact_index] = {
      ...contacts[data.contact_index],
      ...data.updates
    };

    // If setting this contact as primary, ensure no other contact is primary
    if (data.updates.is_primary === true) {
      contacts.forEach((contact, index) => {
        if (index !== data.contact_index) {
          contact.is_primary = false;
        }
      });
    }

    // Ensure at least one active primary contact exists
    const activePrimaryContacts = contacts.filter(c => c.is_active && c.is_primary);
    if (activePrimaryContacts.length === 0) {
      const firstActiveContact = contacts.find(c => c.is_active);
      if (firstActiveContact) {
        firstActiveContact.is_primary = true;
      }
    }

    // Update the client
    const updatedClient = await ClientService.update({
      client_id: data.client_id,
      data: {
        business_info: {
          ...businessClient.business_info,
          contacts
        }
      }
    });

    return updatedClient as BusinessClient;
  }

  /**
   * Remove a contact from a business client
   */
  static async removeContact(params: RemoveContactParams): Promise<BusinessClient> {
    const client = await ClientService.getById(params.client_id);
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.client_type !== 'business') {
      throw new Error('Can only remove contacts from business clients');
    }

    const businessClient = client as BusinessClient;
    const contacts = [...businessClient.business_info.contacts];

    if (params.contact_index < 0 || params.contact_index >= contacts.length) {
      throw new Error('Invalid contact index');
    }

    let updatedContacts: ContactPerson[];

    if (params.deactivate_only) {
      // Just deactivate the contact
      contacts[params.contact_index].is_active = false;
      contacts[params.contact_index].is_primary = false;
      updatedContacts = contacts;
    } else {
      // Remove the contact entirely
      updatedContacts = contacts.filter((_, index) => index !== params.contact_index);
    }

    // Ensure at least one contact remains
    const activeContacts = updatedContacts.filter(c => c.is_active);
    if (activeContacts.length === 0) {
      throw new Error('Cannot remove last active contact. At least one active contact is required.');
    }

    // Ensure at least one primary contact exists
    const activePrimaryContacts = updatedContacts.filter(c => c.is_active && c.is_primary);
    if (activePrimaryContacts.length === 0) {
      const firstActiveContact = updatedContacts.find(c => c.is_active);
      if (firstActiveContact) {
        firstActiveContact.is_primary = true;
      }
    }

    // Update the client
    const updatedClient = await ClientService.update({
      client_id: params.client_id,
      data: {
        business_info: {
          ...businessClient.business_info,
          contacts: updatedContacts
        }
      }
    });

    return updatedClient as BusinessClient;
  }

  /**
   * Get contact by index
   */
  static async getContact(
    clientId: EntityId,
    contactIndex: number
  ): Promise<ContactPerson | null> {
    const client = await ClientService.getById(clientId);
    if (!client || client.client_type !== 'business') {
      return null;
    }

    const businessClient = client as BusinessClient;
    const contacts = businessClient.business_info.contacts;

    if (contactIndex < 0 || contactIndex >= contacts.length) {
      return null;
    }

    return contacts[contactIndex];
  }

  /**
   * List all contacts for a business client
   */
  static async listContacts(
    clientId: EntityId,
    options: {
      activeOnly?: boolean;
      primaryOnly?: boolean;
    } = {}
  ): Promise<ContactPerson[]> {
    const client = await ClientService.getById(clientId);
    if (!client || client.client_type !== 'business') {
      return [];
    }

    const businessClient = client as BusinessClient;
    let contacts = businessClient.business_info.contacts;

    if (options.activeOnly) {
      contacts = contacts.filter(c => c.is_active);
    }

    if (options.primaryOnly) {
      contacts = contacts.filter(c => c.is_primary);
    }

    return contacts;
  }

  /**
   * Set primary contact
   */
  static async setPrimaryContact(
    clientId: EntityId,
    contactIndex: number
  ): Promise<BusinessClient> {
    return this.updateContact({
      client_id: clientId,
      contact_index: contactIndex,
      updates: { is_primary: true }
    });
  }

  /**
   * Validate contact data
   */
  private static validateContactData(contact: Partial<ContactPerson>): void {
    const errors: string[] = [];

    if (!contact.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!contact.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!contact.contact_type) {
      errors.push('Contact type is required');
    }

    if (contact.first_name && contact.first_name.length > 50) {
      errors.push('First name too long (max 50 characters)');
    }

    if (contact.last_name && contact.last_name.length > 50) {
      errors.push('Last name too long (max 50 characters)');
    }

    if (contact.title && contact.title.length > 100) {
      errors.push('Title too long (max 100 characters)');
    }

    if (contact.department && contact.department.length > 100) {
      errors.push('Department too long (max 100 characters)');
    }

    // Validate contact info if provided
    if (contact.contact_info) {
      if (contact.contact_info.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.contact_info.email)) {
          errors.push('Invalid email format');
        }
      }

      if (contact.contact_info.phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)\.]{7,20}$/;
        if (!phoneRegex.test(contact.contact_info.phone)) {
          errors.push('Invalid phone format');
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Contact validation failed: ${errors.join(', ')}`);
    }
  }
}