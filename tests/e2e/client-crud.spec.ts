/**
 * End-to-End tests for Client CRUD operations
 * Tests complete user journeys for client management
 */

import { test, expect } from '@playwright/test';

test.describe('Client CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to clients page
    await page.goto('/clients');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Client Creation', () => {
    test('should create individual client successfully', async ({ page }) => {
      // Click create client button
      await page.click('[data-testid="create-client-button"]');
      
      // Select individual client type
      await page.click('[data-testid="client-type-individual"]');
      
      // Fill in individual client form
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.fill('[data-testid="email-input"]', 'john.doe@e2etest.com');
      await page.fill('[data-testid="phone-input"]', '+33123456789');
      await page.fill('[data-testid="profession-input"]', 'Software Developer');
      
      // Fill address information
      await page.fill('[data-testid="address-input"]', '123 Test Street');
      await page.fill('[data-testid="city-input"]', 'Paris');
      await page.fill('[data-testid="postal-code-input"]', '75001');
      await page.selectOption('[data-testid="country-select"]', 'FR');
      
      // Submit the form
      await page.click('[data-testid="submit-client-form"]');
      
      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Client created successfully');
      
      // Verify redirect to client list
      await expect(page).toHaveURL(/\/clients$/);
      
      // Verify new client appears in list
      await expect(page.locator('[data-testid="client-table"]')).toContainText('John Doe');
      await expect(page.locator('[data-testid="client-table"]')).toContainText('john.doe@e2etest.com');
    });

    test('should create business client successfully', async ({ page }) => {
      await page.click('[data-testid="create-client-button"]');
      await page.click('[data-testid="client-type-business"]');
      
      // Fill business information
      await page.fill('[data-testid="company-name-input"]', 'E2E Test Corp');
      await page.selectOption('[data-testid="industry-select"]', 'information_technology');
      await page.fill('[data-testid="business-email-input"]', 'contact@e2etest.com');
      await page.fill('[data-testid="business-phone-input"]', '+33123456789');
      
      // Fill address
      await page.fill('[data-testid="business-address-input"]', '456 Business Ave');
      await page.fill('[data-testid="business-city-input"]', 'Lyon');
      await page.fill('[data-testid="business-postal-code-input"]', '69000');
      
      // Add contact person
      await page.click('[data-testid="add-contact-button"]');
      await page.fill('[data-testid="contact-first-name-input"]', 'Jane');
      await page.fill('[data-testid="contact-last-name-input"]', 'Smith');
      await page.fill('[data-testid="contact-email-input"]', 'jane.smith@e2etest.com');
      await page.fill('[data-testid="contact-phone-input"]', '+33987654321');
      
      await page.click('[data-testid="submit-client-form"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-table"]')).toContainText('E2E Test Corp');
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.click('[data-testid="create-client-button"]');
      await page.click('[data-testid="client-type-individual"]');
      
      // Try to submit without required fields
      await page.click('[data-testid="submit-client-form"]');
      
      // Check for validation errors
      await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      
      // Fill invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.blur('[data-testid="email-input"]');
      
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock server error
      await page.route('/api/clients', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await page.click('[data-testid="create-client-button"]');
      await page.click('[data-testid="client-type-individual"]');
      
      await page.fill('[data-testid="first-name-input"]', 'Server');
      await page.fill('[data-testid="last-name-input"]', 'Error');
      await page.fill('[data-testid="email-input"]', 'server.error@e2etest.com');
      
      await page.click('[data-testid="submit-client-form"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Server error');
    });
  });

  test.describe('Client Listing and Search', () => {
    test('should display client list with pagination', async ({ page }) => {
      // Check that client table is visible
      await expect(page.locator('[data-testid="client-table"]')).toBeVisible();
      
      // Check pagination controls
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-size-selector"]')).toBeVisible();
      
      // Check table headers
      await expect(page.locator('[data-testid="client-table"]')).toContainText('Name');
      await expect(page.locator('[data-testid="client-table"]')).toContainText('Email');
      await expect(page.locator('[data-testid="client-table"]')).toContainText('Status');
      await expect(page.locator('[data-testid="client-table"]')).toContainText('Created');
    });

    test('should search clients by name', async ({ page }) => {
      // Enter search term
      await page.fill('[data-testid="client-search-input"]', 'John');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForLoadState('networkidle');
      
      // Verify results contain search term
      const clientRows = page.locator('[data-testid="client-table-row"]');
      const count = await clientRows.count();
      
      for (let i = 0; i < count; i++) {
        const row = clientRows.nth(i);
        await expect(row).toContainText(/john/i);
      }
    });

    test('should filter clients by type', async ({ page }) => {
      // Open filter menu
      await page.click('[data-testid="filter-button"]');
      
      // Select individual clients only
      await page.uncheck('[data-testid="filter-business-checkbox"]');
      await page.click('[data-testid="apply-filters-button"]');
      
      // Wait for filtered results
      await page.waitForLoadState('networkidle');
      
      // Verify all results are individual clients
      const typeColumns = page.locator('[data-testid="client-type-column"]');
      const count = await typeColumns.count();
      
      for (let i = 0; i < count; i++) {
        await expect(typeColumns.nth(i)).toContainText('Individual');
      }
    });

    test('should sort clients by different columns', async ({ page }) => {
      // Click on name column to sort
      await page.click('[data-testid="sort-name-column"]');
      await page.waitForLoadState('networkidle');
      
      // Verify ascending sort
      const nameColumns = page.locator('[data-testid="client-name-column"]');
      const firstClient = await nameColumns.first().textContent();
      const secondClient = await nameColumns.nth(1).textContent();
      
      expect(firstClient!.localeCompare(secondClient!)).toBeLessThanOrEqual(0);
      
      // Click again for descending sort
      await page.click('[data-testid="sort-name-column"]');
      await page.waitForLoadState('networkidle');
      
      const firstClientDesc = await nameColumns.first().textContent();
      const secondClientDesc = await nameColumns.nth(1).textContent();
      
      expect(firstClientDesc!.localeCompare(secondClientDesc!)).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Client Details and Editing', () => {
    test('should view client details', async ({ page }) => {
      // Click on first client in list
      await page.click('[data-testid="client-table-row"]:first-child [data-testid="view-client-button"]');
      
      // Verify client details page
      await expect(page).toHaveURL(/\/clients\/[^\/]+$/);
      await expect(page.locator('[data-testid="client-details"]')).toBeVisible();
      
      // Check details sections
      await expect(page.locator('[data-testid="client-info-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-info-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="commercial-info-section"]')).toBeVisible();
      
      // Check action buttons
      await expect(page.locator('[data-testid="edit-client-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-client-button"]')).toBeVisible();
    });

    test('should edit individual client successfully', async ({ page }) => {
      // Navigate to client details
      await page.click('[data-testid="client-table-row"]:first-child [data-testid="view-client-button"]');
      
      // Click edit button
      await page.click('[data-testid="edit-client-button"]');
      
      // Verify edit form is loaded
      await expect(page.locator('[data-testid="client-edit-form"]')).toBeVisible();
      
      // Update profession
      await page.fill('[data-testid="profession-input"]', 'Senior Software Developer');
      
      // Add tag
      await page.fill('[data-testid="tags-input"]', 'updated, vip');
      
      // Update credit limit
      await page.fill('[data-testid="credit-limit-input"]', '15000');
      
      // Submit changes
      await page.click('[data-testid="update-client-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Verify updated data is displayed
      await expect(page.locator('[data-testid="profession-display"]')).toContainText('Senior Software Developer');
      await expect(page.locator('[data-testid="credit-limit-display"]')).toContainText('15,000');
    });

    test('should handle edit validation errors', async ({ page }) => {
      await page.click('[data-testid="client-table-row"]:first-child [data-testid="view-client-button"]');
      await page.click('[data-testid="edit-client-button"]');
      
      // Clear required field
      await page.fill('[data-testid="email-input"]', '');
      await page.click('[data-testid="update-client-button"]');
      
      // Check validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('required');
    });
  });

  test.describe('Business Client Contacts', () => {
    test('should manage business client contacts', async ({ page }) => {
      // Find and click on a business client
      const businessRow = page.locator('[data-testid="client-table-row"]')
        .filter({ hasText: 'Business' })
        .first();
      
      await businessRow.locator('[data-testid="view-client-button"]').click();
      
      // Navigate to contacts tab
      await page.click('[data-testid="contacts-tab"]');
      
      // Add new contact
      await page.click('[data-testid="add-contact-button"]');
      
      await page.fill('[data-testid="contact-first-name-input"]', 'New');
      await page.fill('[data-testid="contact-last-name-input"]', 'Contact');
      await page.fill('[data-testid="contact-email-input"]', 'new.contact@business.com');
      await page.selectOption('[data-testid="contact-type-select"]', 'technical');
      
      await page.click('[data-testid="save-contact-button"]');
      
      // Verify contact was added
      await expect(page.locator('[data-testid="contact-list"]')).toContainText('New Contact');
      
      // Edit contact
      await page.click('[data-testid="edit-contact-button"]');
      await page.fill('[data-testid="contact-title-input"]', 'Technical Manager');
      await page.click('[data-testid="save-contact-button"]');
      
      await expect(page.locator('[data-testid="contact-list"]')).toContainText('Technical Manager');
    });
  });

  test.describe('Client Deletion', () => {
    test('should delete client successfully', async ({ page }) => {
      // Go to client details
      await page.click('[data-testid="client-table-row"]:first-child [data-testid="view-client-button"]');
      
      const clientName = await page.locator('[data-testid="client-name-display"]').textContent();
      
      // Click delete button
      await page.click('[data-testid="delete-client-button"]');
      
      // Confirm deletion in modal
      await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
      await page.selectOption('[data-testid="deletion-type-select"]', 'soft');
      await page.fill('[data-testid="deletion-reason-input"]', 'E2E test deletion');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify success and redirect
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page).toHaveURL(/\/clients$/);
      
      // Verify client is no longer in active list
      await expect(page.locator('[data-testid="client-table"]')).not.toContainText(clientName!);
    });

    test('should prevent deletion of client with active folders', async ({ page }) => {
      // Find a client with active folders
      const clientWithFolders = page.locator('[data-testid="client-table-row"]')
        .filter({ hasText: /folders.*[1-9]/ })
        .first();
      
      await clientWithFolders.locator('[data-testid="view-client-button"]').click();
      
      await page.click('[data-testid="delete-client-button"]');
      
      // Try to delete without force
      await page.selectOption('[data-testid="deletion-type-select"]', 'soft');
      await page.fill('[data-testid="deletion-reason-input"]', 'Should fail');
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should show error about active folders
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('active folders');
    });
  });

  test.describe('Batch Operations', () => {
    test('should perform batch client operations', async ({ page }) => {
      // Select multiple clients
      await page.check('[data-testid="client-checkbox"]:nth-child(1)');
      await page.check('[data-testid="client-checkbox"]:nth-child(2)');
      
      // Open batch actions menu
      await page.click('[data-testid="batch-actions-button"]');
      
      // Select batch tag operation
      await page.click('[data-testid="batch-add-tags-option"]');
      
      // Add tags
      await page.fill('[data-testid="batch-tags-input"]', 'e2e-test, batch-updated');
      await page.click('[data-testid="apply-batch-action-button"]');
      
      // Wait for batch operation to complete
      await expect(page.locator('[data-testid="batch-success-message"]')).toBeVisible();
      
      // Verify tags were applied (refresh and check)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check first updated client
      await page.click('[data-testid="client-table-row"]:first-child [data-testid="view-client-button"]');
      await expect(page.locator('[data-testid="client-tags"]')).toContainText('e2e-test');
      await expect(page.locator('[data-testid="client-tags"]')).toContainText('batch-updated');
    });
  });

  test.describe('Client Statistics', () => {
    test('should display client statistics', async ({ page }) => {
      // Go to a business client with data
      const businessRow = page.locator('[data-testid="client-table-row"]')
        .filter({ hasText: 'Business' })
        .first();
      
      await businessRow.locator('[data-testid="view-client-button"]').click();
      
      // Navigate to statistics tab
      await page.click('[data-testid="statistics-tab"]');
      
      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-folders-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-payment-delay-stat"]')).toBeVisible();
      
      // Check charts are rendered
      await expect(page.locator('[data-testid="folders-status-chart"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile layout
      await expect(page.locator('[data-testid="mobile-client-list"]')).toBeVisible();
      
      // Mobile-specific interactions
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Create client on mobile
      await page.click('[data-testid="mobile-create-client-button"]');
      await expect(page.locator('[data-testid="mobile-client-form"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load client list quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/clients');
      await page.waitForSelector('[data-testid="client-table"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large client lists efficiently', async ({ page }) => {
      // Set large page size
      await page.selectOption('[data-testid="page-size-selector"]', '100');
      await page.waitForLoadState('networkidle');
      
      // Check that table renders without performance issues
      const clientRows = page.locator('[data-testid="client-table-row"]');
      const count = await clientRows.count();
      
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(100);
    });
  });
});