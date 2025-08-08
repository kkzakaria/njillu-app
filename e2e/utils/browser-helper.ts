/**
 * Browser-specific testing utilities and feature detection
 */

import { Page, Browser, BrowserContext } from '@playwright/test';

// Browser capability definitions
export const browserCapabilities = {
  chromium: {
    name: 'Chromium',
    engine: 'Blink',
    cssGrid: true,
    flexbox: true,
    customProperties: true,
    intersectionObserver: true,
    resizeObserver: true,
    webComponents: true,
    touchEvents: true,
    es2020: true,
    webp: true,
    avif: true,
    containerQueries: true,
  },
  firefox: {
    name: 'Firefox',
    engine: 'Gecko',
    cssGrid: true,
    flexbox: true,
    customProperties: true,
    intersectionObserver: true,
    resizeObserver: true,
    webComponents: true,
    touchEvents: false, // Limited on desktop
    es2020: true,
    webp: true,
    avif: true,
    containerQueries: true,
  },
  webkit: {
    name: 'Safari/WebKit',
    engine: 'WebKit',
    cssGrid: true,
    flexbox: true,
    customProperties: true,
    intersectionObserver: true,
    resizeObserver: false, // Limited in older versions
    webComponents: true,
    touchEvents: true,
    es2020: true,
    webp: true,
    avif: false, // Limited support
    containerQueries: false, // Partial support
  },
};

export type BrowserName = keyof typeof browserCapabilities;

/**
 * Browser-specific testing helper
 */
export class BrowserTestHelper {
  private page: Page;
  private browserName: string;
  private capabilities: typeof browserCapabilities[BrowserName];

  constructor(page: Page, browserName: string) {
    this.page = page;
    this.browserName = browserName;
    this.capabilities = browserCapabilities[browserName as BrowserName] || browserCapabilities.chromium;
  }

  /**
   * Get browser information
   */
  async getBrowserInfo() {
    return await this.page.evaluate(() => ({
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      deviceMemory: (navigator as any).deviceMemory || null,
      connection: (navigator as any).connection || null,
    }));
  }

  /**
   * Detect available browser features
   */
  async detectFeatures() {
    return await this.page.evaluate(() => {
      const features = {
        // CSS Features
        cssGrid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('color', 'var(--test)'),
        containerQueries: CSS.supports('container-type', 'inline-size'),
        
        // JavaScript APIs
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
        resizeObserver: typeof ResizeObserver !== 'undefined',
        mutationObserver: typeof MutationObserver !== 'undefined',
        performanceObserver: typeof PerformanceObserver !== 'undefined',
        
        // Web APIs
        fetch: typeof fetch !== 'undefined',
        websocket: typeof WebSocket !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        
        // Storage
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        
        // Media Features
        webgl: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch (e) {
            return false;
          }
        })(),
        
        // Image Formats
        webp: (() => {
          const canvas = document.createElement('canvas');
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        })(),
        
        // Touch and Input
        touchEvents: 'ontouchstart' in window,
        pointerEvents: 'onpointerdown' in window,
        
        // Modern JavaScript
        asyncAwait: typeof (async () => {})().then === 'function',
        promises: typeof Promise !== 'undefined',
        modules: 'import' in globalThis || typeof require !== 'undefined',
        
        // Accessibility
        ariaDescribedBy: document.createElement('div').setAttribute('aria-describedby', 'test') !== undefined,
        focusVisible: CSS.supports('selector(:focus-visible)'),
      };
      
      return features;
    });
  }

  /**
   * Test browser-specific performance characteristics
   */
  async measurePerformanceCapabilities() {
    return await this.page.evaluate(() => {
      const start = performance.now();
      
      // CPU-intensive task
      let sum = 0;
      for (let i = 0; i < 100000; i++) {
        sum += Math.random();
      }
      
      const cpuTime = performance.now() - start;
      
      // Memory information
      const memory = (performance as any).memory || null;
      
      // Timing information
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        cpuBenchmark: cpuTime,
        memory: memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        } : null,
        navigation: navigation ? {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load: navigation.loadEventEnd - navigation.loadEventStart,
        } : null,
        resourceTiming: performance.getEntriesByType('resource').length,
        paintTiming: performance.getEntriesByType('paint').map(entry => ({
          name: entry.name,
          startTime: entry.startTime,
        })),
      };
    });
  }

  /**
   * Check if browser supports a specific feature
   */
  supportsFeature(feature: keyof typeof browserCapabilities.chromium): boolean {
    return this.capabilities[feature] || false;
  }

  /**
   * Skip test if feature is not supported
   */
  skipIfNotSupported(feature: keyof typeof browserCapabilities.chromium): boolean {
    return !this.supportsFeature(feature);
  }

  /**
   * Apply browser-specific workarounds
   */
  async applyBrowserWorkarounds() {
    if (this.browserName === 'firefox') {
      // Firefox-specific workarounds
      await this.page.addInitScript(() => {
        // Disable smooth scrolling for consistent testing
        if ('scrollBehavior' in document.documentElement.style) {
          const originalScrollTo = window.scrollTo;
          window.scrollTo = function(x, y) {
            if (typeof x === 'object') {
              x.behavior = 'auto';
            }
            return originalScrollTo.call(this, x, y);
          };
        }
      });
    }

    if (this.browserName === 'webkit') {
      // Safari/WebKit-specific workarounds
      await this.page.addInitScript(() => {
        // Polyfill ResizeObserver if needed
        if (!window.ResizeObserver) {
          (window as any).ResizeObserver = class {
            constructor(callback: any) {
              this.callback = callback;
            }
            observe() {}
            unobserve() {}
            disconnect() {}
            callback: any;
          };
        }
      });
    }
  }

  /**
   * Get browser-specific CSS selectors
   */
  getBrowserSpecificSelectors() {
    const base = {
      focusVisible: ':focus-visible',
      hover: ':hover',
      active: ':active',
    };

    if (this.browserName === 'webkit') {
      return {
        ...base,
        // Safari sometimes needs webkit prefixes
        focusVisible: ':focus, :-webkit-any(button, input, select, textarea):focus',
      };
    }

    return base;
  }

  /**
   * Test responsive design features
   */
  async testResponsiveFeatures() {
    return await this.page.evaluate(() => {
      const features = {
        // Media queries
        mediaQueries: window.matchMedia('(min-width: 768px)').matches !== undefined,
        
        // Viewport meta
        viewportMeta: document.querySelector('meta[name="viewport"]') !== null,
        
        // Touch capabilities  
        touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        
        // Orientation
        orientationSupport: 'orientation' in window || 'onorientationchange' in window,
        
        // Pixel density
        devicePixelRatio: window.devicePixelRatio || 1,
        
        // Viewport dimensions
        viewport: {
          width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
          height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
        },
        
        // Screen information
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
        },
      };
      
      return features;
    });
  }

  /**
   * Test accessibility features
   */
  async testAccessibilitySupport() {
    return await this.page.evaluate(() => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      const features = {
        // ARIA support
        ariaLabel: testElement.setAttribute('aria-label', 'test') !== undefined,
        ariaDescribedBy: testElement.setAttribute('aria-describedby', 'test') !== undefined,
        ariaHidden: testElement.setAttribute('aria-hidden', 'true') !== undefined,
        
        // Focus management
        tabindex: testElement.setAttribute('tabindex', '-1') !== undefined,
        focusMethod: typeof testElement.focus === 'function',
        
        // Screen reader detection
        screenReaderDetection: {
          jaws: navigator.userAgent.includes('JAWS'),
          nvda: navigator.userAgent.includes('NVDA'),
          voiceOver: /Mac OS X.*Safari/.test(navigator.userAgent),
          narrator: navigator.userAgent.includes('Windows NT'),
        },
        
        // High contrast mode
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        
        // Reduced motion
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        // Color scheme preference
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      };
      
      document.body.removeChild(testElement);
      return features;
    });
  }

  /**
   * Generate browser compatibility report
   */
  async generateCompatibilityReport() {
    const browserInfo = await this.getBrowserInfo();
    const features = await this.detectFeatures();
    const performance = await this.measurePerformanceCapabilities();
    const responsive = await this.testResponsiveFeatures();
    const accessibility = await this.testAccessibilitySupport();

    return {
      browser: {
        name: this.browserName,
        ...this.capabilities,
      },
      runtime: browserInfo,
      features,
      performance,
      responsive,
      accessibility,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Compare actual vs expected capabilities
   */
  async validateCapabilities() {
    const features = await this.detectFeatures();
    const issues: string[] = [];

    // Check critical features
    const criticalFeatures = [
      'cssGrid', 'flexbox', 'customProperties', 'intersectionObserver', 'fetch'
    ];

    criticalFeatures.forEach(feature => {
      const expected = this.capabilities[feature as keyof typeof this.capabilities];
      const actual = features[feature as keyof typeof features];
      
      if (expected && !actual) {
        issues.push(`Expected ${feature} support but not available`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      features,
      expected: this.capabilities,
    };
  }
}

/**
 * Cross-browser test utilities
 */
export const crossBrowserUtils = {
  /**
   * Run test across all browsers with results comparison
   */
  async runAcrossBrowsers(
    browsers: { page: Page; browserName: string }[],
    testFn: (helper: BrowserTestHelper) => Promise<any>
  ) {
    const results: Record<string, any> = {};
    
    for (const { page, browserName } of browsers) {
      const helper = new BrowserTestHelper(page, browserName);
      await helper.applyBrowserWorkarounds();
      
      try {
        results[browserName] = await testFn(helper);
      } catch (error) {
        results[browserName] = { error: error.message };
      }
    }
    
    return results;
  },

  /**
   * Compare results across browsers
   */
  compareResults(results: Record<string, any>, tolerance = 0.1) {
    const browsers = Object.keys(results);
    const comparison: Record<string, any> = {};
    
    if (browsers.length < 2) return comparison;
    
    // Compare numeric values
    const firstResult = results[browsers[0]];
    if (typeof firstResult === 'number') {
      browsers.slice(1).forEach(browser => {
        const diff = Math.abs(results[browser] - firstResult);
        const percentDiff = diff / firstResult;
        
        comparison[`${browsers[0]}_vs_${browser}`] = {
          difference: diff,
          percentDifference: percentDiff,
          withinTolerance: percentDiff <= tolerance,
        };
      });
    }
    
    return comparison;
  },

  /**
   * Get browser-specific test configuration
   */
  getBrowserConfig(browserName: string) {
    const config = {
      retries: 1,
      timeout: 30000,
      skipFeatures: [] as string[],
    };

    switch (browserName) {
      case 'firefox':
        config.skipFeatures = ['touchEvents']; // Skip touch tests on desktop Firefox
        break;
      case 'webkit':
        config.skipFeatures = ['resizeObserver']; // May not be available in older Safari
        config.timeout = 45000; // Safari can be slower
        break;
    }

    return config;
  },

  /**
   * Generate cross-browser compatibility matrix
   */
  generateCompatibilityMatrix(results: Record<string, any>) {
    const matrix: Record<string, Record<string, boolean | string>> = {};
    const features = Object.keys(results[Object.keys(results)[0]]?.features || {});
    
    features.forEach(feature => {
      matrix[feature] = {};
      
      Object.entries(results).forEach(([browser, result]) => {
        if (result.features) {
          matrix[feature][browser] = result.features[feature] ? '✅' : '❌';
        } else {
          matrix[feature][browser] = '⚠️';
        }
      });
    });
    
    return matrix;
  },
};

/**
 * Browser-specific test data
 */
export const browserTestData = {
  /**
   * Get browser-appropriate test selectors
   */
  getSelectors(browserName: string) {
    const base = {
      button: 'button',
      input: 'input',
      link: 'a',
      listItem: '[role="listitem"], li',
    };

    if (browserName === 'webkit') {
      return {
        ...base,
        // Safari-specific selectors if needed
        focusableButton: 'button:not([disabled])',
      };
    }

    return base;
  },

  /**
   * Get browser-appropriate CSS values
   */
  getCSSValues(browserName: string) {
    return {
      transitionDuration: browserName === 'webkit' ? '0.3s' : '0.2s',
      borderRadius: '8px',
      boxShadow: browserName === 'firefox' ? 
        '0 2px 8px rgba(0,0,0,0.1)' : 
        '0 2px 8px 0 rgba(0,0,0,0.1)',
    };
  },
};

/**
 * Export utility function to create browser helper
 */
export function createBrowserHelper(page: Page, browserName: string) {
  return new BrowserTestHelper(page, browserName);
}