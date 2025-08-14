/**
 * Client Form component tests
 * Tests client form components with user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientForm } from '@/app/[locale]/clients/components/client-form';
import { createMockIndividualClientData } from '../setup/mocks/fixtures/clients';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ClientForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Individual Client Form', () => {
    test('should render individual client form fields', () => {
      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/first.*name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last.*name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profession/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('should submit valid individual client data', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill in the form
      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+33123456789');
      await user.type(screen.getByLabelText(/profession/i), 'Developer');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          client_type: 'individual',
          individual_info: {
            first_name: 'John',
            last_name: 'Doe',
            profession: 'Developer',
          },
          contact_info: {
            email: 'john.doe@example.com',
            phone: '+33123456789',
          },
        });
      });
    });

    test('should show validation errors for required fields', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Try to submit without filling required fields
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/first.*name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/last.*name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid.*email/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should validate phone format', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/phone/i), '123');

      // Blur the field to trigger validation
      fireEvent.blur(screen.getByLabelText(/phone/i));

      await waitFor(() => {
        const phoneField = screen.getByLabelText(/phone/i);
        expect(phoneField).toBeInvalid();
      });
    });
  });

  describe('Business Client Form', () => {
    test('should render business client form fields', () => {
      render(
        <ClientForm
          mode="create"
          clientType="business"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/company.*name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByText(/contact.*person/i)).toBeInTheDocument();
    });

    test('should submit valid business client data', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="business"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill in the business form
      await user.type(screen.getByLabelText(/company.*name/i), 'Test Corp');
      await user.selectOptions(screen.getByLabelText(/industry/i), 'information_technology');
      await user.type(screen.getByLabelText(/email/i), 'contact@testcorp.com');
      await user.type(screen.getByLabelText(/phone/i), '+33123456789');
      
      // Fill in contact person
      await user.type(screen.getByLabelText(/contact.*first.*name/i), 'Jane');
      await user.type(screen.getByLabelText(/contact.*last.*name/i), 'Smith');
      await user.type(screen.getByLabelText(/contact.*email/i), 'jane@testcorp.com');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            client_type: 'business',
            business_info: expect.objectContaining({
              company_name: 'Test Corp',
              industry: 'information_technology',
            }),
            contact_info: expect.objectContaining({
              email: 'contact@testcorp.com',
              phone: '+33123456789',
            }),
          })
        );
      });
    });

    test('should validate business required fields', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="business"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/company.*name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should handle contact person management', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="business"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Add contact person
      if (screen.queryByRole('button', { name: /add.*contact/i })) {
        await user.click(screen.getByRole('button', { name: /add.*contact/i }));
      }

      await user.type(screen.getByLabelText(/contact.*first.*name/i), 'John');
      await user.type(screen.getByLabelText(/contact.*last.*name/i), 'Manager');
      await user.type(screen.getByLabelText(/contact.*email/i), 'john@company.com');

      // The contact should be added to the form data
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Manager')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@company.com')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    test('should populate form with existing client data', () => {
      const existingClient = createMockIndividualClientData({
        individual_info: {
          first_name: 'Existing',
          last_name: 'Client',
          profession: 'Existing Profession',
        },
        contact_info: {
          email: 'existing@example.com',
          phone: '+33987654321',
        },
      });

      render(
        <ClientForm
          mode="edit"
          clientType="individual"
          initialData={existingClient}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Existing')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Client')).toBeInTheDocument();
      expect(screen.getByDisplayValue('existing@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+33987654321')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Profession')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    test('should submit updated data', async () => {
      const user = userEvent.setup();
      const existingClient = createMockIndividualClientData();

      render(
        <ClientForm
          mode="edit"
          clientType="individual"
          initialData={existingClient}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Update the profession field
      const professionField = screen.getByLabelText(/profession/i);
      await user.clear(professionField);
      await user.type(professionField, 'Senior Developer');

      await user.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            individual_info: expect.objectContaining({
              profession: 'Senior Developer',
            }),
          })
        );
      });
    });
  });

  describe('Form Interactions', () => {
    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={slowSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });

    test('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill in some data
      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');

      // Reset the form
      if (screen.queryByRole('button', { name: /reset/i })) {
        await user.click(screen.getByRole('button', { name: /reset/i }));

        expect(screen.getByLabelText(/first.*name/i)).toHaveValue('');
        expect(screen.getByLabelText(/last.*name/i)).toHaveValue('');
      }
    });
  });

  describe('Commercial Information', () => {
    test('should render commercial info fields', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Expand commercial info section if it's collapsible
      const commercialSection = screen.queryByText(/commercial.*info/i);
      if (commercialSection) {
        await user.click(commercialSection);
      }

      expect(screen.getByLabelText(/credit.*limit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment.*terms/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    });

    test('should validate credit limit', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const creditLimitField = screen.getByLabelText(/credit.*limit/i);
      await user.type(creditLimitField, '-1000');

      fireEvent.blur(creditLimitField);

      await waitFor(() => {
        expect(screen.getByText(/credit.*limit.*positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Address Information', () => {
    test('should render address fields', () => {
      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/postal.*code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    test('should validate postal code based on country', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.selectOptions(screen.getByLabelText(/country/i), 'FR');
      await user.type(screen.getByLabelText(/postal.*code/i), '123'); // Invalid French postal code

      fireEvent.blur(screen.getByLabelText(/postal.*code/i));

      await waitFor(() => {
        const postalField = screen.getByLabelText(/postal.*code/i);
        expect(postalField).toBeInvalid();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/first.*name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/last.*name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-required', 'true');
    });

    test('should associate error messages with fields', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        const firstNameField = screen.getByLabelText(/first.*name/i);
        expect(firstNameField).toHaveAttribute('aria-describedby');
        expect(firstNameField).toBeInvalid();
      });
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Tab through the form
      await user.tab();
      expect(screen.getByLabelText(/first.*name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/last.*name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    test('should display server errors', async () => {
      const user = userEvent.setup();
      const errorSubmit = jest.fn().mockRejectedValue(new Error('Server error'));

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={errorSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Button should be re-enabled after error
      expect(screen.getByRole('button', { name: /create/i })).toBeEnabled();
    });

    test('should clear previous errors on new submission', async () => {
      const user = userEvent.setup();
      const errorThenSuccess = jest.fn()
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce(undefined);

      render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={errorThenSuccess}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      // First submission with error
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Second submission should clear the error
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.queryByText(/server error/i)).not.toBeInTheDocument();
      });
    });
  });
});