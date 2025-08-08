/**
 * End-to-End accessibility tests for list-detail components
 * Tests WCAG compliance, keyboard navigation, and screen reader compatibility
 */

import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import { authStateFile } from './utils/auth-helper';
import { mockApiResponses, testDataFactory } from './utils/api-helper';

// Test data
const testBillsOfLading = testDataFactory.generateBatch('billOfLading', 5);
const testFolders = testDataFactory.generateBatch('folder', 5);
const testContainerArrivals = testDataFactory.generateBatch('containerArrival', 5);

test.describe('Accessibility E2E Tests', () => {
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

    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('list view meets accessibility standards', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      // Wait for content to load
      await page.waitForSelector('[data-testid="list-view"]');
      await expect(page.getByText(testBillsOfLading[0].reference)).toBeVisible();

      // Check accessibility
      await checkA11y(page, '[data-testid="list-view"]', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('detail view meets accessibility standards', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Select first item to show detail
      await page.getByText(testBillsOfLading[0].reference).click();
      await page.waitForSelector('[data-testid="detail-view"]');

      // Check accessibility
      await checkA11y(page, '[data-testid="detail-view"]', {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });

    test('search and filters are accessible', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test search accessibility
      const searchInput = page.getByPlaceholder('Search...');
      await expect(searchInput).toHaveAttribute('aria-label');
      await expect(searchInput).toHaveAttribute('role', 'searchbox');

      // Test filter accessibility
      await page.getByText('Filters').click();
      const filtersPanel = page.locator('[data-testid="filters-panel"]');
      await expect(filtersPanel).toBeVisible();

      // Check filters accessibility
      await checkA11y(page, '[data-testid="filters-panel"]');
    });

    test('pagination controls are accessible', async ({ page }) => {
      // Mock large dataset for pagination
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        const largeDataset = testDataFactory.generateBatch('billOfLading', 100);
        const url = new URL(route.request().url());
        const page_num = parseInt(url.searchParams.get('page') || '1');
        const per_page = parseInt(url.searchParams.get('per_page') || '20');
        
        const start = (page_num - 1) * per_page;
        const end = start + per_page;
        const paginatedData = largeDataset.slice(start, end);
        
        await route.fulfill({
          json: {
            data: paginatedData,
            total: 100,
            page: page_num,
            per_page: per_page,
            total_pages: 5,
            has_next: page_num < 5,
            has_previous: page_num > 1,
          }
        });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="pagination"]');

      // Check pagination accessibility
      const pagination = page.locator('[data-testid="pagination"]');
      await expect(pagination).toHaveAttribute('aria-label', 'Pagination');

      const nextButton = page.getByRole('button', { name: 'Next page' });
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toHaveAttribute('aria-label');

      // Check accessibility
      await checkA11y(page, '[data-testid="pagination"]');
    });

    test('mobile responsive layout is accessible', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check mobile layout accessibility
      await checkA11y(page, '[data-testid="list-detail-layout"]');

      // Test mobile navigation
      await page.getByText(testBillsOfLading[0].reference).click();
      await page.waitForSelector('[data-testid="detail-view"]');

      const backButton = page.getByText('Back to list');
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute('aria-label');

      // Check detail view accessibility on mobile
      await checkA11y(page, '[data-testid="detail-view"]');
    });

    test('high contrast mode support', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ 
        colorScheme: 'dark',
        forcedColors: 'active'
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Verify high contrast styles are applied
      const listItem = page.getByText(testBillsOfLading[0].reference).first();
      const styles = await listItem.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
        };
      });

      // In forced colors mode, colors should be system colors
      expect(styles.color).not.toBe('');
      expect(styles.backgroundColor).not.toBe('');

      // Check accessibility in high contrast mode
      await checkA11y(page, '[data-testid="list-detail-layout"]');
    });

    test('reduced motion preference is respected', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test that animations are disabled/reduced
      const listContainer = page.locator('[data-testid="list-view"]');
      const animationStyles = await listContainer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });

      // Animations should be disabled or very short
      expect(animationStyles.animationDuration).toBe('0s');
      expect(animationStyles.transitionDuration).toBe('0s');

      // Check accessibility
      await checkA11y(page, '[data-testid="list-detail-layout"]');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('supports full keyboard navigation in list view', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Start with search input
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.focus();
      await expect(searchInput).toBeFocused();

      // Tab to first list item
      await page.keyboard.press('Tab');
      const firstItem = page.getByText(testBillsOfLading[0].reference).first();
      await expect(firstItem).toBeFocused();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      const secondItem = page.getByText(testBillsOfLading[1].reference).first();
      await expect(secondItem).toBeFocused();

      await page.keyboard.press('ArrowUp');
      await expect(firstItem).toBeFocused();

      // Select with Enter
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="detail-view"]');

      // Verify detail view is loaded
      await expect(page.getByText(testBillsOfLading[0].reference)).toBeVisible();
    });

    test('supports keyboard navigation in detail view tabs', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Select first item
      await page.getByText(testBillsOfLading[0].reference).click();
      await page.waitForSelector('[data-testid="detail-view"]');

      // Focus on first tab
      const tabs = page.locator('[role="tab"]');
      await tabs.first().focus();
      await expect(tabs.first()).toBeFocused();

      // Navigate tabs with arrow keys
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect(tabs.first()).toBeFocused();

      // Jump to first/last tab
      await page.keyboard.press('Home');
      await expect(tabs.first()).toBeFocused();

      await page.keyboard.press('End');
      await expect(tabs.last()).toBeFocused();

      // Activate tab with Enter
      await page.keyboard.press('Enter');
      const activeTab = tabs.last();
      await expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    test('supports keyboard shortcuts', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test Ctrl+F for search (if implemented)
      await page.keyboard.press('Control+f');
      const searchInput = page.getByPlaceholder('Search...');
      await expect(searchInput).toBeFocused();

      // Test Escape to clear/close
      await page.keyboard.press('Escape');
      
      // Test other keyboard shortcuts (if implemented)
      await page.keyboard.press('Control+r'); // Refresh
      
      // Should still be accessible
      await page.waitForSelector('[data-testid="list-view"]');
    });

    test('maintains focus during dynamic content updates', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Focus on search input
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.focus();
      await expect(searchInput).toBeFocused();

      // Type search query
      await searchInput.fill('TEST-BL-001');
      
      // Wait for search results (debounced)
      await page.waitForTimeout(600);
      
      // Focus should remain on search input
      await expect(searchInput).toBeFocused();

      // Clear search
      await page.keyboard.press('Escape');
      
      // Focus should still be manageable
      await expect(searchInput).toBeFocused();
    });

    test('provides skip links for efficient navigation', async ({ page }) => {
      await page.goto('/demo/list-detail');
      
      // Focus on skip link (should be first focusable element)
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a').first();
      const skipLinkText = await skipLink.textContent();
      
      if (skipLinkText?.includes('Skip')) {
        await expect(skipLink).toBeFocused();
        
        // Activate skip link
        await page.keyboard.press('Enter');
        
        // Focus should move to main content
        const mainContent = page.locator('main, [role="main"], #main-content').first();
        await expect(mainContent).toBeFocused();
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('provides proper ARIA landmarks', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check for main landmarks
      await expect(page.locator('[role="main"], main')).toBeVisible();
      await expect(page.locator('[role="search"]')).toBeVisible();
      await expect(page.locator('[role="navigation"], nav')).toBeVisible();

      // Check for complementary content (detail panel)
      const detailPanel = page.locator('[role="complementary"]');
      if (await detailPanel.isVisible()) {
        await expect(detailPanel).toBeVisible();
      }
    });

    test('provides descriptive headings hierarchy', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      let previousLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        
        // Heading levels should not skip more than one level
        if (previousLevel > 0) {
          expect(level).toBeLessThanOrEqual(previousLevel + 1);
        }
        
        previousLevel = level;
      }
    });

    test('provides live region updates for dynamic content', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      await expect(liveRegions.first()).toBeVisible();

      // Perform search to trigger live region update
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.fill('TEST-BL-001');
      
      // Wait for live region update
      await page.waitForTimeout(700);
      
      // Live region should announce results
      const statusRegion = page.locator('[role="status"]').first();
      const statusText = await statusRegion.textContent();
      expect(statusText).toBeTruthy();
    });

    test('provides proper form labels and descriptions', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check search input labeling
      const searchInput = page.getByPlaceholder('Search...');
      await expect(searchInput).toHaveAttribute('aria-label');

      // Open filters to check form controls
      await page.getByText('Filters').click();
      
      const filterControls = page.locator('select, input[type="checkbox"], input[type="radio"]');
      const controlCount = await filterControls.count();
      
      for (let i = 0; i < controlCount; i++) {
        const control = filterControls.nth(i);
        
        // Each control should have a label or aria-label
        const hasLabel = await control.evaluate(el => {
          const id = el.getAttribute('id');
          const ariaLabel = el.getAttribute('aria-label');
          const labelElement = id ? document.querySelector(`label[for="${id}"]`) : null;
          
          return !!(ariaLabel || labelElement);
        });
        
        expect(hasLabel).toBe(true);
      }
    });

    test('handles error states accessibly', async ({ page }) => {
      // Mock API error
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await route.fulfill({
          status: 500,
          json: { error: 'Internal server error' }
        });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();

      // Wait for error state
      await expect(page.getByText('Error loading data')).toBeVisible();

      // Error should be in an alert region
      const errorMessage = page.getByText('Error loading data');
      const alertRegion = errorMessage.locator('xpath=ancestor-or-self::*[@role="alert"]').first();
      
      await expect(alertRegion).toBeVisible();
      
      // Retry button should be accessible
      const retryButton = page.getByText('Retry');
      await expect(retryButton).toBeVisible();
      await expect(retryButton).toHaveAttribute('aria-label');
    });

    test('provides context for table data', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      
      // If list is displayed as a table
      const table = page.locator('table');
      if (await table.isVisible()) {
        // Table should have caption or aria-label
        const hasCaption = await table.locator('caption').isVisible();
        const hasLabel = await table.getAttribute('aria-label');
        
        expect(hasCaption || !!hasLabel).toBe(true);
        
        // Headers should be properly associated
        const headers = table.locator('th');
        const headerCount = await headers.count();
        
        for (let i = 0; i < headerCount; i++) {
          const header = headers.nth(i);
          const scope = await header.getAttribute('scope');
          expect(scope).toBeTruthy(); // Should have col or row scope
        }
      }
    });
  });

  test.describe('Touch and Mobile Accessibility', () => {
    test('provides adequate touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Check touch target sizes (minimum 44x44 pixels for WCAG AA)
      const touchTargets = page.locator('button, a, input, [role="button"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) { // Check first 10 targets
        const target = touchTargets.nth(i);
        const box = await target.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('supports swipe gestures accessibly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Test swipe on list item (if supported)
      const firstItem = page.getByText(testBillsOfLading[0].reference).first();
      const box = await firstItem.boundingBox();
      
      if (box) {
        // Simulate swipe gesture
        await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
        
        // If swipe reveals actions, they should be accessible
        const actionButtons = page.locator('[data-testid*="action"]');
        if (await actionButtons.first().isVisible()) {
          const actionCount = await actionButtons.count();
          
          for (let i = 0; i < actionCount; i++) {
            const action = actionButtons.nth(i);
            await expect(action).toHaveAttribute('aria-label');
          }
        }
      }
    });

    test('maintains accessibility in landscape orientation', async ({ page }) => {
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Wait for layout adjustment
      await page.waitForTimeout(200);
      
      // Check accessibility in landscape mode
      await checkA11y(page, '[data-testid="list-detail-layout"]');
      
      // Navigation should still be accessible
      const searchInput = page.getByPlaceholder('Search...');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('aria-label');
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('maintains accessibility during loading states', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await page.waitForTimeout(2000);
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

      // Check loading state accessibility
      const loadingIndicator = page.locator('[role="status"]');
      await expect(loadingIndicator).toBeVisible();
      await expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');

      // Wait for data to load
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Check final state accessibility
      await checkA11y(page, '[data-testid="list-detail-layout"]');
    });

    test('handles large datasets accessibly', async ({ page }) => {
      // Mock large dataset
      const largeDataset = testDataFactory.generateBatch('billOfLading', 1000);
      
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await route.fulfill({
          json: {
            data: largeDataset.slice(0, 20),
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

      // Should still be accessible with large dataset
      await checkA11y(page, '[data-testid="list-view"]');

      // Pagination should be properly labeled
      const pagination = page.locator('[data-testid="pagination"]');
      await expect(pagination).toBeVisible();
      await expect(pagination).toHaveAttribute('aria-label');
    });

    test('accessibility is maintained during animations', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      
      await page.waitForSelector('[data-testid="list-view"]');

      // Click item to trigger animation (loading detail)
      await page.getByText(testBillsOfLading[0].reference).click();
      
      // During animation/transition
      await page.waitForTimeout(100);
      
      // Should still be accessible during animation
      await checkA11y(page, '[data-testid="list-detail-layout"]', {
        rules: {
          // Allow color-contrast violations during animations
          'color-contrast': { enabled: false }
        }
      });
      
      // Wait for animation to complete
      await page.waitForSelector('[data-testid="detail-view"]');
      
      // Final state should be fully accessible
      await checkA11y(page, '[data-testid="detail-view"]');
    });
  });
});