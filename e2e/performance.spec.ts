/**
 * End-to-End performance tests for list-detail components
 * Tests Core Web Vitals, loading performance, and runtime performance
 */

import { test, expect, Page } from '@playwright/test';
import { authStateFile } from './utils/auth-helper';
import { mockApiResponses, testDataFactory } from './utils/api-helper';
import { viewportSizes } from './utils/responsive-helper';

// Performance thresholds based on Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  // Loading Performance
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  
  // Interactivity
  FID: 100,  // First Input Delay (ms)
  TTI: 3800, // Time to Interactive (ms)
  
  // Visual Stability
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom Metrics
  SEARCH_RESPONSE: 300,   // Search response time (ms)
  LIST_RENDER: 500,       // List rendering time (ms)
  DETAIL_LOAD: 800,       // Detail view loading time (ms)
  SCROLL_PERFORMANCE: 16, // Scroll frame time (ms) - 60fps
};

// Test data generators
const generateLargeDataset = (size: number, type: 'billOfLading' | 'folder' | 'containerArrival') => {
  return testDataFactory.generateBatch(type, size);
};

// Performance measurement utilities
async function measureWebVitals(page: Page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {};
      
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.FCP = lastEntry.startTime;
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      
      // Cumulative Layout Shift
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        vitals.CLS = cls;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Time to Interactive (approximation)
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      vitals.TTI = navigation.domInteractive;
      
      // Resolve after a short delay to collect all metrics
      setTimeout(() => {
        lcpObserver.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
        resolve(vitals);
      }, 1000);
    });
  });
}

async function measureMemoryUsage(page: Page) {
  return await page.evaluate(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  });
}

async function measureCustomMetrics(page: Page) {
  return await page.evaluate(() => {
    const entries = performance.getEntriesByType('measure');
    const metrics: Record<string, number> = {};
    
    entries.forEach(entry => {
      metrics[entry.name] = entry.duration;
    });
    
    return metrics;
  });
}

test.describe('Performance E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocking with performance data
    const testBillsOfLading = generateLargeDataset(1000, 'billOfLading');
    const testFolders = generateLargeDataset(500, 'folder');
    const testContainerArrivals = generateLargeDataset(300, 'containerArrival');

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

  test.describe('Loading Performance', () => {
    test('meets Core Web Vitals thresholds', async ({ page }) => {
      // Navigate to page and measure initial load
      const startTime = Date.now();
      await page.goto('/demo/list-detail');
      
      // Start measuring performance
      await page.evaluate(() => {
        performance.mark('page-load-start');
      });
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      await page.evaluate(() => {
        performance.mark('page-load-end');
        performance.measure('page-load-time', 'page-load-start', 'page-load-end');
      });

      // Select entity and wait for list to load
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure Core Web Vitals
      const webVitals = await measureWebVitals(page);
      
      console.log('Core Web Vitals:', webVitals);
      
      // Assert thresholds
      expect(webVitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      expect(webVitals.FCP).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
      expect(webVitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      expect(webVitals.TTI).toBeLessThan(PERFORMANCE_THRESHOLDS.TTI);
    });

    test('list renders within performance budget', async ({ page }) => {
      await page.goto('/demo/list-detail');
      
      // Measure list rendering time
      await page.evaluate(() => {
        performance.mark('list-render-start');
      });
      
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Wait for all list items to be visible
      await page.waitForFunction(() => {
        const items = document.querySelectorAll('[data-testid="list-item"]');
        return items.length > 0;
      });
      
      await page.evaluate(() => {
        performance.mark('list-render-end');
        performance.measure('list-render-time', 'list-render-start', 'list-render-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('List render time:', metrics['list-render-time']);
      
      expect(metrics['list-render-time']).toBeLessThan(PERFORMANCE_THRESHOLDS.LIST_RENDER);
    });

    test('detail view loads efficiently', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure detail loading time
      await page.evaluate(() => {
        performance.mark('detail-load-start');
      });

      // Click first item to load detail
      await page.locator('[data-testid="list-item"]').first().click();
      await page.waitForSelector('[data-testid="detail-view"]');

      await page.evaluate(() => {
        performance.mark('detail-load-end');
        performance.measure('detail-load-time', 'detail-load-start', 'detail-load-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Detail load time:', metrics['detail-load-time']);
      
      expect(metrics['detail-load-time']).toBeLessThan(PERFORMANCE_THRESHOLDS.DETAIL_LOAD);
    });

    test('search response time is acceptable', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      const searchInput = page.getByPlaceholder('Search...');
      
      // Measure search performance
      await page.evaluate(() => {
        performance.mark('search-start');
      });

      await searchInput.fill('TEST-BL-001');
      
      // Wait for search results (accounting for debounce)
      await page.waitForTimeout(600);
      
      await page.evaluate(() => {
        performance.mark('search-end');
        performance.measure('search-time', 'search-start', 'search-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Search time:', metrics['search-time']);
      
      expect(metrics['search-time']).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE);
    });

    test('pagination performs well with large datasets', async ({ page }) => {
      // Mock API with pagination
      await page.route('**/api/v1/bills_of_lading**', async (route) => {
        const url = new URL(route.request().url());
        const page_num = parseInt(url.searchParams.get('page') || '1');
        const per_page = parseInt(url.searchParams.get('per_page') || '20');
        
        const allData = generateLargeDataset(10000, 'billOfLading');
        const start = (page_num - 1) * per_page;
        const end = start + per_page;
        const paginatedData = allData.slice(start, end);
        
        // Simulate network delay
        await page.waitForTimeout(50);
        
        await route.fulfill({
          json: {
            data: paginatedData,
            total: 10000,
            page: page_num,
            per_page,
            total_pages: Math.ceil(10000 / per_page),
            has_next: page_num < Math.ceil(10000 / per_page),
            has_previous: page_num > 1,
          }
        });
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure pagination performance
      await page.evaluate(() => {
        performance.mark('pagination-start');
      });

      const nextButton = page.getByRole('button', { name: 'Next page' });
      await nextButton.click();
      
      await page.waitForSelector('[data-testid="list-view"]');
      
      await page.evaluate(() => {
        performance.mark('pagination-end');
        performance.measure('pagination-time', 'pagination-start', 'pagination-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Pagination time:', metrics['pagination-time']);
      
      // Pagination should be fast even with large datasets
      expect(metrics['pagination-time']).toBeLessThan(1000);
    });
  });

  test.describe('Runtime Performance', () => {
    test('scrolling performance is smooth', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure scroll performance
      const scrollMetrics = await page.evaluate(async () => {
        const container = document.querySelector('[data-testid="list-view"]')!;
        const metrics: number[] = [];
        
        const measureFrame = () => {
          const start = performance.now();
          
          // Simulate scroll event processing
          const scrollTop = container.scrollTop;
          const items = container.querySelectorAll('[data-testid="list-item"]');
          items.forEach((item, index) => {
            // Simulate some processing
            item.getBoundingClientRect();
          });
          
          metrics.push(performance.now() - start);
        };

        // Simulate multiple scroll events
        for (let i = 0; i < 10; i++) {
          container.scrollTop = i * 100;
          measureFrame();
          await new Promise(resolve => setTimeout(resolve, 16)); // 60fps
        }
        
        return {
          avgFrameTime: metrics.reduce((a, b) => a + b, 0) / metrics.length,
          maxFrameTime: Math.max(...metrics),
          frames: metrics.length,
        };
      });

      console.log('Scroll performance:', scrollMetrics);
      
      expect(scrollMetrics.avgFrameTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SCROLL_PERFORMANCE);
      expect(scrollMetrics.maxFrameTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SCROLL_PERFORMANCE * 2);
    });

    test('memory usage remains stable during navigation', async ({ page }) => {
      await page.goto('/demo/list-detail');
      
      // Initial memory measurement
      const initialMemory = await measureMemoryUsage(page);
      
      // Navigate through different entities
      const entities = ['Bills of Lading', 'Folders', 'Container Arrivals'];
      
      for (const entity of entities) {
        await page.getByRole('button', { name: entity }).click();
        await page.waitForSelector('[data-testid="list-view"]');
        
        // Select and view detail
        const firstItem = page.locator('[data-testid="list-item"]').first();
        if (await firstItem.isVisible()) {
          await firstItem.click();
          await page.waitForSelector('[data-testid="detail-view"]', { timeout: 5000 }).catch(() => {
            // Detail might not load on some viewports
          });
        }
        
        // Wait for any cleanup
        await page.waitForTimeout(100);
      }
      
      // Final memory measurement
      const finalMemory = await measureMemoryUsage(page);
      
      if (initialMemory && finalMemory) {
        console.log('Memory usage:', { initial: initialMemory, final: finalMemory });
        
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const memoryIncreaseRatio = memoryIncrease / initialMemory.usedJSHeapSize;
        
        // Memory should not increase by more than 50% during normal usage
        expect(memoryIncreaseRatio).toBeLessThan(0.5);
      }
    });

    test('filter operations are performant', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Measure filter performance
      await page.evaluate(() => {
        performance.mark('filter-start');
      });

      // Open filters
      await page.getByText('Filters').click();
      
      // Apply multiple filters
      const statusFilter = page.getByLabel('Status').first();
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('active');
      }
      
      const priorityFilter = page.getByLabel('Priority').first();
      if (await priorityFilter.isVisible()) {
        await priorityFilter.selectOption('high');
      }
      
      // Apply filters
      await page.getByText('Apply filters').click();
      
      // Wait for filtered results
      await page.waitForSelector('[data-testid="list-view"]');
      
      await page.evaluate(() => {
        performance.mark('filter-end');
        performance.measure('filter-time', 'filter-start', 'filter-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Filter time:', metrics['filter-time']);
      
      // Filter operations should be responsive
      expect(metrics['filter-time']).toBeLessThan(1000);
    });

    test('tab switching in detail view is smooth', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Select first item
      await page.locator('[data-testid="list-item"]').first().click();
      await page.waitForSelector('[data-testid="detail-view"]');

      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        // Measure tab switching performance
        const switchTimes: number[] = [];

        for (let i = 0; i < Math.min(tabCount, 5); i++) {
          await page.evaluate(() => {
            performance.mark('tab-switch-start');
          });

          await tabs.nth(i).click();
          await page.waitForSelector('[role="tabpanel"]');

          await page.evaluate(() => {
            performance.mark('tab-switch-end');
            performance.measure('tab-switch-time', 'tab-switch-start', 'tab-switch-end');
          });

          const metrics = await measureCustomMetrics(page);
          switchTimes.push(metrics['tab-switch-time']);
          
          // Clear performance entries for next measurement
          await page.evaluate(() => {
            performance.clearMarks();
            performance.clearMeasures();
          });
        }

        const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
        console.log('Tab switch times:', switchTimes, 'Average:', avgSwitchTime);

        // Tab switching should be instantaneous
        expect(avgSwitchTime).toBeLessThan(100);
      }
    });
  });

  test.describe('Performance Across Devices', () => {
    test('mobile performance meets thresholds', async ({ page }) => {
      await page.setViewportSize(viewportSizes.mobile);
      
      await page.goto('/demo/list-detail');
      
      // Measure mobile performance
      const startTime = Date.now();
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      const loadTime = Date.now() - startTime;

      console.log('Mobile load time:', loadTime);
      expect(loadTime).toBeLessThan(3000); // Mobile should load within 3 seconds

      // Test mobile-specific interactions
      const firstItem = page.locator('[data-testid="list-item"]').first();
      
      await page.evaluate(() => {
        performance.mark('mobile-navigation-start');
      });
      
      await firstItem.click();
      await page.waitForSelector('[data-testid="detail-view"]');
      
      await page.evaluate(() => {
        performance.mark('mobile-navigation-end');
        performance.measure('mobile-navigation-time', 'mobile-navigation-start', 'mobile-navigation-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Mobile navigation time:', metrics['mobile-navigation-time']);
      
      // Mobile navigation should be responsive
      expect(metrics['mobile-navigation-time']).toBeLessThan(800);
    });

    test('tablet performance is optimized', async ({ page }) => {
      await page.setViewportSize(viewportSizes.tablet);
      
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Test orientation change performance
      await page.evaluate(() => {
        performance.mark('orientation-change-start');
      });

      // Switch to landscape
      await page.setViewportSize(viewportSizes.tabletLandscape);
      await page.waitForTimeout(200); // Allow layout to settle

      await page.evaluate(() => {
        performance.mark('orientation-change-end');
        performance.measure('orientation-change-time', 'orientation-change-start', 'orientation-change-end');
      });

      const metrics = await measureCustomMetrics(page);
      console.log('Orientation change time:', metrics['orientation-change-time']);
      
      // Orientation changes should be smooth
      expect(metrics['orientation-change-time']).toBeLessThan(500);
    });

    test('desktop performance is optimal', async ({ page }) => {
      await page.setViewportSize(viewportSizes.desktop);
      
      await page.goto('/demo/list-detail');
      
      // Measure desktop-specific performance
      const startTime = Date.now();
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      
      // Select item (should load in split view)
      await page.locator('[data-testid="list-item"]').first().click();
      await page.waitForSelector('[data-testid="detail-view"]');
      
      const totalTime = Date.now() - startTime;
      
      console.log('Desktop total interaction time:', totalTime);
      
      // Desktop should be fastest
      expect(totalTime).toBeLessThan(1500);
    });
  });

  test.describe('Performance Under Load', () => {
    test('handles rapid user interactions', async ({ page }) => {
      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Simulate rapid interactions
      const interactions = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        const interactionStart = performance.now();
        
        // Rapid search updates
        const searchInput = page.getByPlaceholder('Search...');
        await searchInput.fill(`test${i}`);
        
        // Quick selection changes
        const items = page.locator('[data-testid="list-item"]');
        const itemCount = await items.count();
        if (itemCount > 0) {
          await items.nth(i % itemCount).click();
        }
        
        interactions.push(performance.now() - interactionStart);
        
        // Small delay between interactions
        await page.waitForTimeout(50);
      }
      
      const totalTime = Date.now() - startTime;
      const avgInteractionTime = interactions.reduce((a, b) => a + b, 0) / interactions.length;
      
      console.log('Rapid interactions:', { totalTime, avgInteractionTime, interactions });
      
      // System should handle rapid interactions without significant degradation
      expect(avgInteractionTime).toBeLessThan(100);
      expect(totalTime).toBeLessThan(2000);
    });

    test('maintains performance with network delays', async ({ page }) => {
      // Mock slow network responses
      await page.route('**/api/v1/**', async (route) => {
        await page.waitForTimeout(500); // Simulate slow network
        await route.continue();
      });

      await page.goto('/demo/list-detail');
      
      const startTime = Date.now();
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      const loadTime = Date.now() - startTime;

      console.log('Load time with network delay:', loadTime);
      
      // UI should remain responsive even with slow network
      expect(loadTime).toBeGreaterThan(500); // Should include network delay
      expect(loadTime).toBeLessThan(2000);   // But not hang indefinitely

      // Test that UI is still responsive during loading
      const searchInput = page.getByPlaceholder('Search...');
      const searchStart = Date.now();
      await searchInput.click();
      const searchResponseTime = Date.now() - searchStart;
      
      // UI interactions should remain fast despite network delays
      expect(searchResponseTime).toBeLessThan(100);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('tracks performance metrics over time', async ({ page }) => {
      // Add performance monitoring
      await page.addInitScript(() => {
        const performanceData: Array<{ metric: string; value: number; timestamp: number }> = [];
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            performanceData.push({
              metric: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
            });
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'mark', 'paint', 'largest-contentful-paint'] });
        
        (window as any).getPerformanceData = () => performanceData;
      });

      await page.goto('/demo/list-detail');
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');

      // Perform various operations
      await page.locator('[data-testid="list-item"]').first().click();
      await page.waitForSelector('[data-testid="detail-view"]').catch(() => {});
      
      const searchInput = page.getByPlaceholder('Search...');
      await searchInput.fill('test');
      await page.waitForTimeout(600); // Wait for debounce

      // Retrieve performance data
      const performanceData = await page.evaluate(() => {
        return (window as any).getPerformanceData();
      });

      console.log('Performance monitoring data:', performanceData);
      
      expect(performanceData).toBeInstanceOf(Array);
      expect(performanceData.length).toBeGreaterThan(0);
      
      // Verify we captured relevant metrics
      const paintMetrics = performanceData.filter(d => d.metric.includes('paint'));
      expect(paintMetrics.length).toBeGreaterThan(0);
    });

    test('detects performance regressions', async ({ page }) => {
      // Baseline measurement
      await page.goto('/demo/list-detail');
      
      const baselineStart = Date.now();
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      const baselineTime = Date.now() - baselineStart;

      // Simulate performance regression (add artificial delay)
      await page.addInitScript(() => {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(originalFetch.apply(this, args));
            }, 200); // Add 200ms delay
          });
        };
      });

      // Reload page with regression
      await page.reload();
      
      const regressionStart = Date.now();
      await page.getByRole('button', { name: 'Bills of Lading' }).click();
      await page.waitForSelector('[data-testid="list-view"]');
      const regressionTime = Date.now() - regressionStart;

      console.log('Performance comparison:', { baselineTime, regressionTime });
      
      // Detect regression
      const performanceDegradation = (regressionTime - baselineTime) / baselineTime;
      
      // Should detect significant performance regression
      expect(performanceDegradation).toBeGreaterThan(0.1); // 10% degradation threshold
      expect(regressionTime).toBeGreaterThan(baselineTime + 100); // At least 100ms slower
    });
  });
});