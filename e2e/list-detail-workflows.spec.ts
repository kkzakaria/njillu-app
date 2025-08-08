/**
 * End-to-End tests for list-detail workflows
 * Tests complete user journeys across different devices and browsers
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { authStateFile } from './utils/auth-helper';
import { mockApiResponses } from './utils/api-helper';
import { viewportSizes } from './utils/responsive-helper';

// Test data
const testBillsOfLading = [
  {
    id: 'TEST-BL-001',
    reference: 'TEST-BL-001',
    vessel: 'TEST VESSEL ONE',
    route: 'Shanghai to Le Havre',
    status: 'in_transit',
    priority: 'high',
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TEST-BL-002',
    reference: 'TEST-BL-002',
    vessel: 'TEST VESSEL TWO',
    route: 'Singapore to Hamburg',
    status: 'loaded',
    priority: 'medium',
    eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TEST-BL-003',
    reference: 'TEST-BL-003',
    vessel: 'TEST VESSEL THREE',
    route: 'Rotterdam to New York',
    status: 'completed',
    priority: 'low',
    eta: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const testFolders = [
  {
    id: 'TEST-FOL-001',
    reference: 'TEST-FOL-001',
    title: 'Import Declaration 001',
    client: 'Test Client One',
    status: 'in_progress',
    priority: 'high',
    processing_stage: 'customs_clearance',
  },
  {
    id: 'TEST-FOL-002',
    reference: 'TEST-FOL-002',
    title: 'Import Declaration 002',
    client: 'Test Client Two',
    status: 'pending',
    priority: 'medium',
    processing_stage: 'document_review',
  },
];

const testContainerArrivals = [
  {
    id: 'TEST-ARR-001',
    container_number: 'TEST1234567',
    vessel: 'TEST VESSEL ONE',
    status: 'arrived',
    urgency_level: 'high',
    days_remaining: 3,
    port: 'Le Havre',
  },
  {
    id: 'TEST-ARR-002',
    container_number: 'TEST2345678',
    vessel: 'TEST VESSEL TWO',
    status: 'discharged',
    urgency_level: 'medium',
    days_remaining: 7,
    port: 'Hamburg',
  },
];

test.describe('List-Detail Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocking
    await mockApiResponses(page, {
      billsOfLading: testBillsOfLading,
      folders: testFolders,
      containerArrivals: testContainerArrivals,
    });

    // Use authenticated state if available
    if (authStateFile.exists()) {
      await page.context().addStorageState({ path: authStateFile.path });
    }
  });

  test.describe('Desktop Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewportSizes.desktop);
    });

    test('should navigate Bills of Lading list-detail flow', async ({ page }) => {
      await page.goto('/demo/list-detail');

      // Select Bills of Lading entity
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      // Wait for list to load
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText('TEST-BL-001')).toBeVisible();
      await expect(page.getByText('Shanghai to Le Havre')).toBeVisible();

      // Verify split layout on desktop
      await expect(page.getByTestId('list-panel')).toBeVisible();
      await expect(page.getByTestId('detail-panel')).toBeVisible();

      // Select first item
      await page.getByText('TEST-BL-001').click();
      
      // Verify detail view loads
      await page.waitForSelector('[data-testid="detail-view"]');
      await expect(page.getByText('TEST VESSEL ONE')).toBeVisible();
      await expect(page.getByText('in_transit')).toBeVisible();

      // Test tab navigation
      await page.getByRole('tab', { name: 'Containers' }).click();
      await expect(page.getByRole('tabpanel', { name: 'Containers' })).toBeVisible();

      await page.getByRole('tab', { name: 'Activities' }).click();
      await expect(page.getByRole('tabpanel', { name: 'Activities' })).toBeVisible();

      // Select different item
      await page.getByText('TEST-BL-002').click();
      await expect(page.getByText('TEST VESSEL TWO')).toBeVisible();
      await expect(page.getByText('loaded')).toBeVisible();
    });

    test('should handle search and filtering', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test search functionality
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.fill('Shanghai');
      
      // Wait for search results
      await page.waitForTimeout(600); // Account for debounce
      await expect(page.getByText('TEST-BL-001')).toBeVisible();
      await expect(page.getByText('TEST-BL-002')).not.toBeVisible();

      // Clear search
      await page.getByLabel('Clear search').click();
      await expect(page.getByText('TEST-BL-002')).toBeVisible();

      // Test status filter
      await page.getByText('Filters').click();
      await page.getByLabel('Status').selectOption('in_transit');
      await page.getByText('Apply filters').click();

      await expect(page.getByText('TEST-BL-001')).toBeVisible();
      await expect(page.getByText('TEST-BL-002')).not.toBeVisible();

      // Clear filters
      await page.getByText('Clear filters').click();
      await expect(page.getByText('TEST-BL-002')).toBeVisible();
    });

    test('should handle multiple selection and bulk actions', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Enable multiple selection mode
      await page.getByLabel('Select all').check();
      await expect(page.getByLabel('Select all')).toBeChecked();

      // All items should be selected
      const listItems = page.locator('[data-testid="list-item"]');
      await expect(listItems.first()).toHaveAttribute('aria-selected', 'true');
      await expect(listItems.nth(1)).toHaveAttribute('aria-selected', 'true');

      // Bulk actions should be available
      await expect(page.getByText('2 items selected')).toBeVisible();
      await expect(page.getByText('Bulk Actions')).toBeVisible();

      // Test bulk status update
      await page.getByText('Bulk Actions').click();
      await page.getByText('Update Status').click();
      await page.getByLabel('New Status').selectOption('completed');
      await page.getByText('Apply to Selected').click();

      // Confirm bulk action
      await page.getByText('Update 2 items').click();
      
      // Should show success message
      await expect(page.getByText('Successfully updated 2 items')).toBeVisible();
    });

    test('should handle pagination', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        const url = new URL(route.request().url());
        const page = parseInt(url.searchParams.get('page') || '1');
        
        const mockData = {
          data: Array.from({ length: 20 }, (_, i) => ({
            id: `TEST-BL-${page * 20 + i + 1}`,
            reference: `TEST-BL-${page * 20 + i + 1}`,
            vessel: `Test Vessel ${i + 1}`,
            route: 'Test Route',
            status: 'active',
            priority: 'medium',
          })),
          total: 100,
          page,
          per_page: 20,
          total_pages: 5,
          has_next: page < 5,
          has_previous: page > 1,
        };

        await route.fulfill({ json: mockData });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Verify pagination info
      await expect(page.getByText('Showing 1 to 20 of 100 results')).toBeVisible();
      await expect(page.getByText('Page 1 of 5')).toBeVisible();

      // Navigate to next page
      await page.getByRole('button', { name: 'Next page' }).click();
      await expect(page.getByText('Showing 21 to 40 of 100 results')).toBeVisible();
      await expect(page.getByText('Page 2 of 5')).toBeVisible();

      // Change page size
      await page.getByLabel('Items per page').selectOption('50');
      await expect(page.getByText('Showing 1 to 50 of 100 results')).toBeVisible();
    });
  });

  test.describe('Mobile Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewportSizes.mobile);
    });

    test('should navigate mobile list-detail flow', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Mobile should show only list initially
      await expect(page.getByTestId('list-panel')).toBeVisible();
      await expect(page.getByTestId('detail-panel')).not.toBeVisible();

      // Select item should navigate to detail page
      await page.getByText('TEST-BL-001').click();
      
      // Should show detail view with back button
      await page.waitForSelector('[data-testid="detail-view"]');
      await expect(page.getByText('Back to list')).toBeVisible();
      await expect(page.getByText('TEST VESSEL ONE')).toBeVisible();

      // Navigate back to list
      await page.getByText('Back to list').click();
      await expect(page.getByTestId('list-panel')).toBeVisible();
      await expect(page.getByTestId('detail-panel')).not.toBeVisible();
    });

    test('should handle mobile search and filters', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Search should work on mobile
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.fill('TEST-BL-002');
      await page.waitForTimeout(600);
      
      await expect(page.getByText('TEST-BL-002')).toBeVisible();
      await expect(page.getByText('TEST-BL-001')).not.toBeVisible();

      // Mobile filters in drawer/modal
      await page.getByText('Filters').click();
      
      // Filter panel should be modal on mobile
      await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
      
      await page.getByLabel('Status').selectOption('loaded');
      await page.getByText('Apply filters').click();
      
      // Filter modal should close
      await expect(page.getByRole('dialog', { name: 'Filters' })).not.toBeVisible();
    });

    test('should handle mobile touch interactions', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test swipe gestures (simulate with drag)
      const firstItem = page.getByText('TEST-BL-001');
      const bbox = await firstItem.boundingBox();
      
      if (bbox) {
        // Swipe right to reveal actions
        await page.mouse.move(bbox.x + 10, bbox.y + bbox.height / 2);
        await page.mouse.down();
        await page.mouse.move(bbox.x + bbox.width - 10, bbox.y + bbox.height / 2);
        await page.mouse.up();
        
        // Should reveal action buttons
        await expect(page.getByText('Edit')).toBeVisible();
        await expect(page.getByText('Delete')).toBeVisible();
      }
    });

    test('should handle mobile keyboard navigation', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Focus on first item
      await page.getByText('TEST-BL-001').focus();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await expect(page.getByText('TEST-BL-002')).toBeFocused();

      await page.keyboard.press('ArrowUp');
      await expect(page.getByText('TEST-BL-001')).toBeFocused();

      // Select with Enter
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('detail-view')).toBeVisible();
    });
  });

  test.describe('Tablet Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewportSizes.tablet);
    });

    test('should adapt layout for tablet viewport', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Tablet should show adaptive layout
      await expect(page.getByTestId('list-panel')).toBeVisible();
      
      // Detail panel might be collapsible on tablet
      const detailPanel = page.getByTestId('detail-panel');
      if (await detailPanel.isVisible()) {
        // Split view mode
        await page.getByText('TEST-BL-001').click();
        await expect(page.getByTestId('detail-view')).toBeVisible();
      } else {
        // Modal/overlay mode
        await page.getByText('TEST-BL-001').click();
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test('should handle tablet orientation changes', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      // Landscape mode
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForSelector('[data-testid="list-view"]');
      
      await page.getByText('TEST-BL-001').click();
      await expect(page.getByTestId('detail-view')).toBeVisible();

      // Portrait mode
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Layout should adapt
      await expect(page.getByTestId('list-panel')).toBeVisible();
    });
  });

  test.describe('Cross-Entity Workflows', () => {
    test('should switch between different entity types', async ({ page }) => {
      await page.goto('/demo/list-detail');

      // Start with Bills of Lading
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText('TEST-BL-001')).toBeVisible();

      // Switch to Folders
      await page.getByRole('button', { name: 'Folders' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText('TEST-FOL-001')).toBeVisible();
      await expect(page.getByText('Import Declaration 001')).toBeVisible();

      // Switch to Container Arrivals
      await page.getByRole('button', { name: 'Container Arrivals' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText('TEST1234567')).toBeVisible();
      await expect(page.getByText('Le Havre')).toBeVisible();
    });

    test('should maintain separate state for different entities', async ({ page }) => {
      await page.goto('/demo/list-detail');

      // Search in Bills of Lading
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.fill('Shanghai');
      await page.waitForTimeout(600);
      await expect(page.getByText('TEST-BL-001')).toBeVisible();

      // Switch to Folders (search should reset)
      await page.getByRole('button', { name: 'Folders' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByPlaceholder('Search...')).toHaveValue('');

      // Search in Folders
      await page.getByPlaceholder('Search...').fill('Declaration');
      await page.waitForTimeout(600);
      await expect(page.getByText('Import Declaration 001')).toBeVisible();

      // Switch back to Bills of Lading (search should be cleared)
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByPlaceholder('Search...')).toHaveValue('');
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading states appropriately', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        // Delay response
        await page.waitForTimeout(1000);
        await route.fulfill({
          json: {
            data: testBillsOfLading,
            total: testBillsOfLading.length,
            page: 1,
            per_page: 20,
            total_pages: 1,
          }
        });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();

      // Should show loading skeleton/spinner
      await expect(page.getByTestId('list-loading')).toBeVisible();
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByTestId('list-loading')).not.toBeVisible();
      await expect(page.getByText('TEST-BL-001')).toBeVisible();
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `LARGE-BL-${i + 1}`,
        reference: `LARGE-BL-${i + 1}`,
        vessel: `Large Vessel ${i + 1}`,
        route: 'Test Route',
        status: 'active',
        priority: 'medium',
      }));

      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await route.fulfill({
          json: {
            data: largeDataset.slice(0, 20), // First page
            total: 1000,
            page: 1,
            per_page: 20,
            total_pages: 50,
          }
        });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure initial render time
      const startTime = Date.now();
      await expect(page.getByText('LARGE-BL-1')).toBeVisible();
      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      // Should handle scrolling smoothly
      await page.evaluate(() => {
        const listContainer = document.querySelector('[data-testid="list-view"]');
        listContainer?.scrollTo(0, 500);
      });

      // Should maintain performance during scrolling
      await expect(page.getByText('LARGE-BL-10')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await route.abort('networkError');
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();

      // Should show error state
      await expect(page.getByText('Error loading data')).toBeVisible();
      await expect(page.getByText('Retry')).toBeVisible();

      // Mock successful retry
      await page.unroute('**/api/v1/bills_of_lading**');
      await mockApiResponses(page, { billsOfLading: testBillsOfLading });

      // Retry should work
      await page.getByText('Retry').click();
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText('TEST-BL-001')).toBeVisible();
    });
  });

  test.describe('Internationalization', () => {
    test('should work in different languages', async ({ page }) => {
      // Test French locale
      await page.goto('/fr/demo/list-detail');
      await page.getByRole('button', { name: 'Connaissements' }).click(); // French for Bills of Lading
      
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByPlaceholder('Rechercher...')).toBeVisible(); // French search placeholder

      // Test Spanish locale
      await page.goto('/es/demo/list-detail');
      await page.getByRole('button', { name: 'Conocimientos de Embarque' }).click(); // Spanish for Bills of Lading
      
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByPlaceholder('Buscar...')).toBeVisible(); // Spanish search placeholder
    });

    test('should format dates and numbers according to locale', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      await page.getByText('TEST-BL-001').click();
      
      await page.waitForSelector('[data-testid="detail-view"]');
      
      // Date should be formatted according to locale
      const dateElement = page.locator('[data-testid="eta-date"]');
      await expect(dateElement).toBeVisible();
      
      // Check for English date format (MM/DD/YYYY or similar)
      const dateText = await dateElement.textContent();
      expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}/);
    });
  });
});

// Utility functions for better test organization
async function waitForListToLoad(page: Page) {
  await page.waitForSelector('[data-testid="list-view"]');
  await page.waitForFunction(() => {
    const loadingElement = document.querySelector('[data-testid="list-loading"]');
    return !loadingElement || loadingElement.textContent !== 'Loading...';
  });
}

async function selectListItem(page: Page, itemText: string) {
  await page.getByText(itemText).click();
  await page.waitForSelector('[data-testid="detail-view"]');
}

async function performSearch(page: Page, query: string) {
  const searchInput = page.getByPlaceholder('Search...');
  await searchInput.fill(query);
  await page.waitForTimeout(600); // Account for debounce
}

async function applyFilter(page: Page, filterType: string, value: string) {
  await page.getByText('Filters').click();
  await page.getByLabel(filterType).selectOption(value);
  await page.getByText('Apply filters').click();
}