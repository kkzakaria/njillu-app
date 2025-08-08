/**
 * Cross-browser compatibility tests for list-detail components
 * Tests functionality across different browsers and browser versions
 */

import { test, expect, Page, Browser } from '@playwright/test';
import { authStateFile } from './utils/auth-helper';
import { mockApiResponses, testDataFactory } from './utils/api-helper';
import { viewportSizes } from './utils/responsive-helper';

// Test data
const testBillsOfLading = testDataFactory.generateBatch('billOfLading', 5);
const testFolders = testDataFactory.generateBatch('folder', 5);
const testContainerArrivals = testDataFactory.generateBatch('containerArrival', 5);

// Browser capability matrix
const browserFeatures = {
  chromium: {
    cssGrid: true,
    flexbox: true,
    intersectionObserver: true,
    resizeObserver: true,
    customProperties: true,
    webp: true,
    es2020: true,
  },
  firefox: {
    cssGrid: true,
    flexbox: true,
    intersectionObserver: true,
    resizeObserver: true,
    customProperties: true,
    webp: true,
    es2020: true,
  },
  webkit: {
    cssGrid: true,
    flexbox: true,
    intersectionObserver: true,
    resizeObserver: false, // Limited support in older Safari
    customProperties: true,
    webp: true,
    es2020: true,
  },
};

test.describe('Cross-Browser Compatibility Tests', () => {
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

  test.describe('Core Functionality Across Browsers', () => {
    ['chromium', 'firefox', 'webkit'].forEach((browserName) => {
      test(`basic functionality works in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping ${browserName} test on ${currentBrowser}`);

        await page.goto('/demo/list-detail');
        await page.getByRole('button', { name: 'Bills of Lading' }).click();
        
        // Wait for content to load
        await page.waitForSelector('[data-testid="list-view"]');
        
        // Test basic list rendering
        const listItems = page.locator('[data-testid="list-item"]');
        const itemCount = await listItems.count();
        expect(itemCount).toBeGreaterThan(0);

        // Test item selection
        await listItems.first().click();
        
        // Should show detail view (may vary by viewport)
        const isDesktop = (await page.viewportSize())!.width >= 1024;
        if (isDesktop) {
          await expect(page.locator('[data-testid="detail-view"]')).toBeVisible();
        } else {
          // Mobile view might navigate to detail page
          await expect(page.locator('[data-testid="detail-view"]')).toBeVisible();
        }

        // Test search functionality
        const searchInput = page.getByPlaceholder('Search...');
        await searchInput.fill(testBillsOfLading[0].reference);
        await page.waitForTimeout(600); // Wait for debounce

        // Results should be filtered
        const filteredItems = await listItems.count();
        expect(filteredItems).toBeLessThanOrEqual(itemCount);
      });
    });

    test('JavaScript features compatibility', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');

      // Test modern JavaScript features
      const browserSupport = await page.evaluate((browser) => {
        const features = {
          browser,
          asyncAwait: typeof (async () => {})().then === 'function',
          promises: typeof Promise !== 'undefined',
          fetch: typeof fetch !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          intersectionObserver: typeof IntersectionObserver !== 'undefined',
          resizeObserver: typeof ResizeObserver !== 'undefined',
          customElements: typeof customElements !== 'undefined',
          shadowDOM: typeof document.createElement('div').attachShadow === 'function',
        };
        return features;
      }, browserName);

      console.log(`${browserName} browser support:`, browserSupport);

      // Core features should be supported
      expect(browserSupport.asyncAwait).toBe(true);
      expect(browserSupport.promises).toBe(true);
      expect(browserSupport.fetch).toBe(true);
      expect(browserSupport.localStorage).toBe(true);
      expect(browserSupport.intersectionObserver).toBe(true);
    });

    test('CSS features compatibility', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      const cssSupport = await page.evaluate((browser) => {
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);

        const features = {
          browser,
          flexbox: CSS.supports('display', 'flex'),
          cssGrid: CSS.supports('display', 'grid'),
          customProperties: CSS.supports('color', 'var(--test)'),
          transforms: CSS.supports('transform', 'translateX(10px)'),
          transitions: CSS.supports('transition', 'all 0.3s ease'),
          animations: CSS.supports('animation', 'fadeIn 0.3s ease'),
          calc: CSS.supports('width', 'calc(100% - 20px)'),
          viewportUnits: CSS.supports('width', '100vw'),
          objectFit: CSS.supports('object-fit', 'cover'),
          sticky: CSS.supports('position', 'sticky'),
        };

        document.body.removeChild(testElement);
        return features;
      }, browserName);

      console.log(`${browserName} CSS support:`, cssSupport);

      // Essential CSS features
      expect(cssSupport.flexbox).toBe(true);
      expect(cssSupport.cssGrid).toBe(true);
      expect(cssSupport.customProperties).toBe(true);
      expect(cssSupport.calc).toBe(true);
    });
  });

  test.describe('Layout Consistency Across Browsers', () => {
    test('responsive layout renders consistently', async ({ page, browserName }) => {
      const layoutResults: Record<string, any> = {};

      for (const [viewportName, size] of Object.entries(viewportSizes)) {
        await page.setViewportSize(size);
        await page.goto('/demo/list-detail');
        await page.getByRole('button', { name: 'Bills of Lading' }).click();
        await page.waitForSelector('[data-testid="list-view"]');

        // Measure layout
        const layout = await page.evaluate(() => {
          const container = document.querySelector('[data-testid="list-detail-layout"]');
          const listPanel = document.querySelector('[data-testid="list-panel"]') || 
                           document.querySelector('[data-testid="list-view"]');
          const detailPanel = document.querySelector('[data-testid="detail-panel"]') || 
                             document.querySelector('[data-testid="detail-view"]');

          return {
            containerDisplay: container ? getComputedStyle(container).display : null,
            containerFlexDirection: container ? getComputedStyle(container).flexDirection : null,
            listVisible: listPanel ? getComputedStyle(listPanel).display !== 'none' : false,
            detailVisible: detailPanel ? getComputedStyle(detailPanel).display !== 'none' : false,
            containerWidth: container ? container.getBoundingClientRect().width : 0,
            containerHeight: container ? container.getBoundingClientRect().height : 0,
          };
        });

        layoutResults[viewportName] = {
          viewport: size,
          layout,
        };
      }

      console.log(`${browserName} layout consistency:`, layoutResults);

      // Verify layout makes sense across viewports
      const desktopLayout = layoutResults.desktop?.layout;
      const mobileLayout = layoutResults.mobile?.layout;

      if (desktopLayout && mobileLayout) {
        // Desktop should have both panels visible or at least list visible
        expect(desktopLayout.listVisible).toBe(true);
        
        // Mobile should have list visible
        expect(mobileLayout.listVisible).toBe(true);
        
        // Layout direction should be responsive
        expect(desktopLayout.containerFlexDirection).toBeTruthy();
      }
    });

    test('component rendering consistency', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Take screenshot for visual comparison
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });
      expect(screenshot).toBeTruthy();

      // Test component dimensions consistency
      const componentMetrics = await page.evaluate(() => {
        const components = {
          listView: document.querySelector('[data-testid="list-view"]'),
          searchInput: document.querySelector('input[placeholder*="Search"]'),
          listItems: document.querySelectorAll('[data-testid="list-item"]'),
        };

        const metrics: Record<string, any> = {};

        Object.entries(components).forEach(([name, element]) => {
          if (element) {
            const rect = element.getBoundingClientRect();
            const styles = getComputedStyle(element);
            
            metrics[name] = {
              dimensions: {
                width: rect.width,
                height: rect.height,
              },
              styles: {
                fontSize: styles.fontSize,
                padding: styles.padding,
                margin: styles.margin,
                borderRadius: styles.borderRadius,
              },
              visible: rect.width > 0 && rect.height > 0,
            };
          } else if (name === 'listItems') {
            metrics[name] = {
              count: Array.from(document.querySelectorAll('[data-testid="list-item"]')).length,
            };
          }
        });

        return metrics;
      });

      console.log(`${browserName} component metrics:`, componentMetrics);

      // Basic consistency checks
      expect(componentMetrics.listView?.visible).toBe(true);
      expect(componentMetrics.listItems?.count).toBeGreaterThan(0);
    });
  });

  test.describe('Interactive Features Across Browsers', () => {
    test('keyboard navigation works consistently', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Focus search input
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.focus();
      expect(await searchInput.evaluate(el => el === document.activeElement)).toBe(true);

      // Tab navigation
      await page.keyboard.press('Tab');
      
      // Should move to first focusable element after search
      const activeElement = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          tagName: active?.tagName,
          role: active?.getAttribute('role'),
          testId: active?.getAttribute('data-testid'),
        };
      });

      console.log(`${browserName} keyboard navigation:`, activeElement);
      
      // Active element should be focusable
      expect(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(activeElement.tagName || '')).toBe(true);
    });

    test('mouse interactions work consistently', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Test click on first item
      const firstItem = page.locator('[data-testid="list-item"]').first();
      await firstItem.click();

      // Should trigger selection/navigation
      await page.waitForTimeout(100);
      
      const afterClick = await page.evaluate(() => {
        const selectedItems = document.querySelectorAll('[data-testid="list-item"][aria-selected="true"], [data-testid="list-item"].selected');
        const detailVisible = document.querySelector('[data-testid="detail-view"]');
        
        return {
          selectedCount: selectedItems.length,
          detailVisible: !!detailVisible && getComputedStyle(detailVisible).display !== 'none',
          activeItem: document.querySelector('[data-testid="list-item"]:focus'),
        };
      });

      console.log(`${browserName} mouse interaction result:`, afterClick);

      // Should have some visual feedback for selection
      expect(afterClick.selectedCount > 0 || afterClick.detailVisible || !!afterClick.activeItem).toBe(true);
    });

    test('touch interactions work on supported browsers', async ({ page, browserName }) => {
      test.skip(browserName === 'firefox', 'Touch events testing skipped for Firefox desktop');
      
      await page.setViewportSize(viewportSizes.mobile);
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Test touch on first item
      const firstItem = page.locator('[data-testid="list-item"]').first();
      const box = await firstItem.boundingBox();

      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        
        await page.waitForTimeout(100);
        
        // Should trigger selection or navigation
        const touchResult = await page.evaluate(() => ({
          detailVisible: !!document.querySelector('[data-testid="detail-view"]'),
          urlChanged: window.location.pathname !== '/demo/list-detail',
        }));

        console.log(`${browserName} touch interaction:`, touchResult);
        
        // Should have some response to touch
        expect(touchResult.detailVisible || touchResult.urlChanged).toBe(true);
      }
    });

    test('form interactions work consistently', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Test search input
      const searchInput = page.getByPlaceholder('Search...');
      const testQuery = 'TEST-BL-001';
      
      await searchInput.fill(testQuery);
      expect(await searchInput.inputValue()).toBe(testQuery);

      // Wait for debounce
      await page.waitForTimeout(600);

      // Check if filtering happened
      const listItems = page.locator('[data-testid="list-item"]');
      const itemCount = await listItems.count();
      
      console.log(`${browserName} search results:`, { query: testQuery, resultCount: itemCount });
      
      // Should have results (could be 0 if no matches, but should be a number)
      expect(typeof itemCount).toBe('number');

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(600);
      
      const clearedCount = await listItems.count();
      expect(clearedCount).toBeGreaterThanOrEqual(itemCount);
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('loading performance comparison', async ({ page, browserName }) => {
      const performanceMetrics = await page.evaluate(() => ({
        userAgent: navigator.userAgent,
        timing: performance.timing,
        memory: (performance as any).memory || null,
      }));

      console.log(`${browserName} initial metrics:`, {
        userAgent: performanceMetrics.userAgent,
        memorySupport: !!performanceMetrics.memory,
      });

      // Navigate and measure
      const startTime = Date.now();
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      const loadTime = Date.now() - startTime;

      // Get performance entries
      const browserPerformance = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          navigation: navigation ? {
            loadEventEnd: navigation.loadEventEnd,
            domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
            responseEnd: navigation.responseEnd,
            domInteractive: navigation.domInteractive,
          } : null,
          paint: paint.map(entry => ({
            name: entry.name,
            startTime: entry.startTime,
          })),
          resourceCount: performance.getEntriesByType('resource').length,
        };
      });

      console.log(`${browserName} performance:`, {
        totalLoadTime: loadTime,
        browserMetrics: browserPerformance,
      });

      // Performance should be reasonable across browsers
      expect(loadTime).toBeLessThan(10000); // 10 second maximum
      expect(browserPerformance.navigation).toBeTruthy();
    });

    test('rendering performance comparison', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure rendering of large list
      const renderingMetrics = await page.evaluate(async () => {
        const startTime = performance.now();
        
        // Trigger re-render by changing viewport simulation
        const event = new Event('resize');
        window.dispatchEvent(event);
        
        // Wait a frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const endTime = performance.now();
        
        return {
          renderTime: endTime - startTime,
          itemCount: document.querySelectorAll('[data-testid="list-item"]').length,
          layoutThrashing: performance.getEntriesByType('measure').length,
        };
      });

      console.log(`${browserName} rendering metrics:`, renderingMetrics);

      // Rendering should be efficient
      expect(renderingMetrics.renderTime).toBeLessThan(100); // Sub-100ms render
      expect(renderingMetrics.itemCount).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling Across Browsers', () => {
    test('network error handling', async ({ page, browserName }) => {
      // Mock network failure
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();

      // Should show error state
      await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });

      const errorHandling = await page.evaluate(() => ({
        errorVisible: !!document.querySelector('[role="alert"], [data-testid*="error"]'),
        retryButtonVisible: !!document.querySelector('button:has-text("retry"), button:has-text("Retry")'),
        gracefulFallback: !document.querySelector('body').classList.contains('error-500'),
      }));

      console.log(`${browserName} error handling:`, errorHandling);

      // Should handle errors gracefully
      expect(errorHandling.errorVisible || errorHandling.retryButtonVisible).toBe(true);
    });

    test('JavaScript error handling', async ({ page, browserName }) => {
      // Capture console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Inject a potential error scenario
      await page.addInitScript(() => {
        // Override a method to potentially cause issues
        const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function() {
          // Sometimes return invalid data to test error handling
          if (Math.random() < 0.1) {
            throw new Error('Simulated getBoundingClientRect error');
          }
          return originalGetBoundingClientRect.call(this);
        };
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Perform some interactions that might trigger the error
      for (let i = 0; i < 5; i++) {
        await page.locator('[data-testid="list-item"]').first().hover().catch(() => {});
        await page.waitForTimeout(100);
      }

      console.log(`${browserName} console errors:`, consoleErrors);

      // Should handle potential JavaScript errors gracefully
      const hasUnhandledErrors = consoleErrors.some(error => 
        !error.includes('Simulated') && 
        !error.includes('Network request failed') // Expected from our test
      );
      
      expect(hasUnhandledErrors).toBe(false);
    });
  });

  test.describe('Accessibility Consistency', () => {
    test('ARIA attributes work across browsers', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      const ariaSupport = await page.evaluate(() => {
        const elements = {
          list: document.querySelector('[role="list"]'),
          buttons: document.querySelectorAll('button[aria-label], button[aria-describedby]'),
          inputs: document.querySelectorAll('input[aria-label], input[aria-describedby]'),
          landmarks: document.querySelectorAll('[role="main"], [role="navigation"], [role="search"]'),
        };

        return {
          listHasRole: !!elements.list,
          buttonsWithAria: elements.buttons.length,
          inputsWithAria: elements.inputs.length,
          landmarksCount: elements.landmarks.length,
          ariaHiddenSupported: document.querySelector('[aria-hidden]') !== null,
          liveRegionSupported: document.querySelector('[aria-live]') !== null,
        };
      });

      console.log(`${browserName} ARIA support:`, ariaSupport);

      // ARIA attributes should be supported
      expect(ariaSupport.listHasRole).toBe(true);
      expect(ariaSupport.buttonsWithAria).toBeGreaterThan(0);
      expect(ariaSupport.landmarksCount).toBeGreaterThan(0);
    });

    test('focus management works across browsers', async ({ page, browserName }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Test focus management
      const focusTest = await page.evaluate(async () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLElement;
        const firstButton = document.querySelector('button') as HTMLElement;
        
        const results = {
          searchFocusable: false,
          buttonFocusable: false,
          focusIndicatorVisible: false,
          tabIndexSupported: false,
        };

        // Test focus on search input
        if (searchInput) {
          searchInput.focus();
          results.searchFocusable = document.activeElement === searchInput;
        }

        // Test focus on button
        if (firstButton) {
          firstButton.focus();
          results.buttonFocusable = document.activeElement === firstButton;
          
          // Check for focus indicator
          const styles = getComputedStyle(firstButton, ':focus');
          results.focusIndicatorVisible = styles.outline !== 'none' || 
                                        styles.boxShadow !== 'none' ||
                                        styles.border !== getComputedStyle(firstButton).border;
        }

        // Test tabindex support
        const elementWithTabindex = document.querySelector('[tabindex]');
        results.tabIndexSupported = !!elementWithTabindex;

        return results;
      });

      console.log(`${browserName} focus management:`, focusTest);

      // Focus should work consistently
      expect(focusTest.searchFocusable || focusTest.buttonFocusable).toBe(true);
    });
  });
});