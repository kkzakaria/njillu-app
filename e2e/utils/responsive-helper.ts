/**
 * Responsive design testing utilities for E2E tests
 */

import { Page, BrowserContext } from '@playwright/test';

export const viewportSizes = {
  mobile: { width: 375, height: 667 },          // iPhone SE
  mobileLarge: { width: 414, height: 896 },     // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 },         // iPad
  tabletLandscape: { width: 1024, height: 768 }, // iPad Landscape
  desktop: { width: 1280, height: 720 },        // Desktop
  desktopLarge: { width: 1920, height: 1080 },  // Large Desktop
  desktopXL: { width: 2560, height: 1440 },     // 4K Desktop
};

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  xl: 1536,
};

/**
 * Test responsive behavior across multiple viewport sizes
 */
export async function testAcrossViewports(
  page: Page, 
  testFn: (viewport: { width: number; height: number }) => Promise<void>,
  viewports = [viewportSizes.mobile, viewportSizes.tablet, viewportSizes.desktop]
) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100); // Allow layout to settle
    await testFn(viewport);
  }
}

/**
 * Get current breakpoint based on viewport width
 */
export function getCurrentBreakpoint(width: number): string {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  if (width < breakpoints.desktop) return 'desktop';
  return 'xl';
}

/**
 * Test responsive layout changes
 */
export class ResponsiveTestHelper {
  constructor(private page: Page) {}

  /**
   * Set viewport and wait for layout changes
   */
  async setViewport(size: { width: number; height: number }) {
    await this.page.setViewportSize(size);
    await this.page.waitForTimeout(200); // Allow CSS transitions to complete
    
    // Wait for any dynamic layout adjustments
    await this.page.waitForFunction(() => {
      return document.readyState === 'complete';
    });
  }

  /**
   * Test mobile-specific layout
   */
  async testMobileLayout() {
    await this.setViewport(viewportSizes.mobile);
    
    // Common mobile layout assertions
    const assertions = {
      // Check for mobile navigation (hamburger menu, etc.)
      hasMobileNav: async () => {
        const mobileNav = this.page.locator('[data-testid="mobile-nav"]');
        return await mobileNav.isVisible();
      },
      
      // Check for stacked layout instead of side-by-side
      hasStackedLayout: async () => {
        const container = this.page.locator('[data-testid="list-detail-layout"]');
        const classes = await container.getAttribute('class');
        return classes?.includes('mobile-layout') || classes?.includes('stacked');
      },
      
      // Check for mobile-optimized touch targets
      hasTouchOptimizedTargets: async () => {
        const buttons = this.page.locator('button');
        const count = await buttons.count();
        
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();
          
          if (box && (box.height < 44 || box.width < 44)) {
            return false; // Touch target too small
          }
        }
        return true;
      },
    };
    
    return assertions;
  }

  /**
   * Test tablet-specific layout
   */
  async testTabletLayout() {
    await this.setViewport(viewportSizes.tablet);
    
    const assertions = {
      // Check for adaptive layout (could be split or stacked)
      hasAdaptiveLayout: async () => {
        const container = this.page.locator('[data-testid="list-detail-layout"]');
        const classes = await container.getAttribute('class');
        return classes?.includes('tablet-layout') || classes?.includes('adaptive');
      },
      
      // Check for collapsible panels
      hasCollapsiblePanels: async () => {
        const collapseButtons = this.page.locator('[data-testid*="collapse"]');
        return await collapseButtons.count() > 0;
      },
    };
    
    return assertions;
  }

  /**
   * Test desktop-specific layout
   */
  async testDesktopLayout() {
    await this.setViewport(viewportSizes.desktop);
    
    const assertions = {
      // Check for side-by-side layout
      hasSplitLayout: async () => {
        const listPanel = this.page.locator('[data-testid="list-panel"]');
        const detailPanel = this.page.locator('[data-testid="detail-panel"]');
        
        return (await listPanel.isVisible()) && (await detailPanel.isVisible());
      },
      
      // Check for desktop-specific features (keyboard shortcuts, etc.)
      hasDesktopFeatures: async () => {
        const keyboardHints = this.page.locator('[data-testid*="keyboard"]');
        return await keyboardHints.count() > 0;
      },
    };
    
    return assertions;
  }

  /**
   * Test orientation changes (for tablets/mobile)
   */
  async testOrientationChange(device: 'mobile' | 'tablet' = 'tablet') {
    const baseSize = viewportSizes[device];
    
    // Portrait
    await this.setViewport(baseSize);
    const portraitLayout = await this.getLayoutInfo();
    
    // Landscape
    await this.setViewport({ width: baseSize.height, height: baseSize.width });
    const landscapeLayout = await this.getLayoutInfo();
    
    return { portraitLayout, landscapeLayout };
  }

  /**
   * Get current layout information
   */
  private async getLayoutInfo() {
    return await this.page.evaluate(() => {
      const container = document.querySelector('[data-testid="list-detail-layout"]');
      const listPanel = document.querySelector('[data-testid="list-panel"]');
      const detailPanel = document.querySelector('[data-testid="detail-panel"]');
      
      return {
        containerClasses: container?.className || '',
        listVisible: listPanel ? getComputedStyle(listPanel).display !== 'none' : false,
        detailVisible: detailPanel ? getComputedStyle(detailPanel).display !== 'none' : false,
        layoutDirection: container ? getComputedStyle(container).flexDirection : '',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    });
  }

  /**
   * Test scroll behavior on different devices
   */
  async testScrollBehavior() {
    const results: Record<string, any> = {};
    
    for (const [name, viewport] of Object.entries(viewportSizes)) {
      await this.setViewport(viewport);
      
      // Test vertical scroll
      const initialScroll = await this.page.evaluate(() => window.scrollY);
      await this.page.evaluate(() => window.scrollTo(0, 500));
      const afterScroll = await this.page.evaluate(() => window.scrollY);
      
      // Test smooth scrolling
      await this.page.evaluate(() => {
        window.scrollTo({ top: 1000, behavior: 'smooth' });
      });
      
      await this.page.waitForTimeout(500); // Wait for smooth scroll
      const smoothScroll = await this.page.evaluate(() => window.scrollY);
      
      results[name] = {
        initialScroll,
        afterScroll,
        smoothScroll,
        scrollWorking: afterScroll > initialScroll,
      };
    }
    
    return results;
  }

  /**
   * Test responsive images and media
   */
  async testResponsiveMedia() {
    const results: Record<string, any> = {};
    
    for (const [name, viewport] of Object.entries(viewportSizes)) {
      await this.setViewport(viewport);
      
      const images = await this.page.locator('img').all();
      const imageInfo = [];
      
      for (const img of images) {
        const src = await img.getAttribute('src');
        const box = await img.boundingBox();
        const naturalDimensions = await img.evaluate((el: HTMLImageElement) => ({
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
        }));
        
        imageInfo.push({
          src,
          displayed: box,
          natural: naturalDimensions,
          aspectRatioPreserved: box ? 
            Math.abs((box.width / box.height) - (naturalDimensions.naturalWidth / naturalDimensions.naturalHeight)) < 0.1 : 
            false,
        });
      }
      
      results[name] = imageInfo;
    }
    
    return results;
  }

  /**
   * Test touch gestures (mobile/tablet)
   */
  async testTouchGestures(element: string) {
    const target = this.page.locator(element);
    const box = await target.boundingBox();
    
    if (!box) return false;
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Test tap
    await this.page.touchscreen.tap(centerX, centerY);
    
    // Test swipe
    await this.page.touchscreen.tap(centerX - 100, centerY);
    await this.page.mouse.move(centerX + 100, centerY);
    await this.page.touchscreen.tap(centerX + 100, centerY);
    
    // Test pinch (simulate)
    await this.page.evaluate((coords) => {
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          new Touch({
            identifier: 1,
            target: document.elementFromPoint(coords.x, coords.y)!,
            clientX: coords.x - 50,
            clientY: coords.y,
          }),
          new Touch({
            identifier: 2,
            target: document.elementFromPoint(coords.x, coords.y)!,
            clientX: coords.x + 50,
            clientY: coords.y,
          }),
        ],
      });
      
      document.elementFromPoint(coords.x, coords.y)?.dispatchEvent(touchEvent);
    }, { x: centerX, y: centerY });
    
    return true;
  }

  /**
   * Test CSS Grid and Flexbox responsiveness
   */
  async testLayoutSystems() {
    const results: Record<string, any> = {};
    
    for (const [name, viewport] of Object.entries(viewportSizes)) {
      await this.setViewport(viewport);
      
      const layoutInfo = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('[data-testid*="layout"], .grid, .flex'));
        
        return elements.map(el => {
          const styles = getComputedStyle(el);
          return {
            tagName: el.tagName,
            className: el.className,
            display: styles.display,
            flexDirection: styles.flexDirection,
            gridTemplateColumns: styles.gridTemplateColumns,
            gridTemplateRows: styles.gridTemplateRows,
            alignItems: styles.alignItems,
            justifyContent: styles.justifyContent,
          };
        });
      });
      
      results[name] = layoutInfo;
    }
    
    return results;
  }

  /**
   * Performance testing across viewports
   */
  async testPerformanceAcrossViewports() {
    const results: Record<string, any> = {};
    
    for (const [name, viewport] of Object.entries(viewportSizes)) {
      await this.setViewport(viewport);
      
      const startTime = Date.now();
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Measure rendering performance
      const renderMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };
      });
      
      results[name] = {
        viewport,
        loadTime,
        renderMetrics,
      };
    }
    
    return results;
  }
}

/**
 * Common responsive test utilities
 */
export const responsiveUtils = {
  /**
   * Check if element is visible at current viewport
   */
  async isVisibleAtViewport(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector);
    return await element.isVisible();
  },

  /**
   * Get element dimensions at current viewport
   */
  async getElementDimensions(page: Page, selector: string) {
    const element = page.locator(selector);
    return await element.boundingBox();
  },

  /**
   * Check if layout adapts correctly
   */
  async verifyLayoutAdaptation(page: Page, expectedClasses: Record<string, string[]>) {
    const viewport = await page.viewportSize();
    const breakpoint = getCurrentBreakpoint(viewport?.width || 1280);
    
    const container = page.locator('[data-testid="list-detail-layout"]');
    const classes = await container.getAttribute('class');
    
    const expectedClassesForBreakpoint = expectedClasses[breakpoint] || [];
    
    return expectedClassesForBreakpoint.every(cls => classes?.includes(cls));
  },

  /**
   * Test text readability at different sizes
   */
  async testTextReadability(page: Page) {
    return await page.evaluate(() => {
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'));
      
      return textElements.map(el => {
        const styles = getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        const lineHeight = parseFloat(styles.lineHeight) / fontSize;
        
        return {
          tagName: el.tagName,
          fontSize,
          lineHeight,
          readable: fontSize >= 16 && lineHeight >= 1.4, // WCAG guidelines
        };
      });
    });
  },
};