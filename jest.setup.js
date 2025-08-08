import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
  notFound: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    return <a {...props}>{children}</a>;
  },
}));

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    then: jest.fn(),
  })),
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for infinite scroll tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    return null;
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};

// Mock performance.mark and performance.measure for performance tests
if (!global.performance.mark) {
  global.performance.mark = jest.fn();
}

if (!global.performance.measure) {
  global.performance.measure = jest.fn();
}

if (!global.performance.clearMarks) {
  global.performance.clearMarks = jest.fn();
}

if (!global.performance.clearMeasures) {
  global.performance.clearMeasures = jest.fn();
}

// Mock console methods in tests to avoid noise
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Ignore specific React warnings that are expected in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: Failed prop type'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Ignore specific warnings that are expected in tests
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Add custom matchers for accessibility testing
expect.extend({
  toBeAccessible: async function (container) {
    const results = await axe(container);
    const pass = results.violations.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected element to have accessibility violations, but it was accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => 
          `Expected element to be accessible, but it had ${results.violations.length} violations:\n${
            results.violations.map(violation => `  - ${violation.description}`).join('\n')
          }`,
        pass: false,
      };
    }
  },
});

// Set up test data factories
global.testFactories = {
  createMockBillOfLading: (overrides = {}) => ({
    id: 'BL-2025-001',
    reference: 'BL-2025-001',
    vessel: 'COSCO SHIPPING UNIVERSE',
    route: 'Shanghai to Le Havre',
    status: 'in_transit',
    priority: 'high',
    etd: '2025-01-15T10:00:00Z',
    eta: '2025-02-20T14:00:00Z',
    shipper: 'ABC Trading Co.',
    consignee: 'XYZ Imports Ltd.',
    containers: [
      {
        id: 'TEMU1234567',
        type: '20GP',
        seal: 'ABC123',
        weight: 18500,
      }
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }),

  createMockFolder: (overrides = {}) => ({
    id: 'FOL-2025-001',
    reference: 'FOL-2025-001',
    title: 'Import Declaration FOL-2025-001',
    status: 'in_progress',
    priority: 'high',
    client: {
      name: 'International Trade Corp',
      code: 'ITC001',
      contact: 'john.doe@example.com',
    },
    processing_stage: 'customs_clearance',
    alerts: [
      {
        type: 'delay_risk',
        severity: 'medium',
        message: 'Potential customs delay detected',
      }
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }),

  createMockContainerArrival: (overrides = {}) => ({
    id: 'ARR-2025-001',
    container_number: 'TEMU1234567',
    vessel: 'COSCO SHIPPING UNIVERSE',
    voyage: 'CS001E',
    status: 'arrived',
    urgency_level: 'high',
    arrival_date: '2025-01-20T08:00:00Z',
    demurrage_start: '2025-01-23T00:00:00Z',
    days_remaining: 5,
    port: 'Le Havre',
    terminal: 'Terminal A',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-20T08:00:00Z',
    ...overrides,
  }),

  createMockListResponse: (items = [], overrides = {}) => ({
    data: items,
    total: items.length,
    page: 1,
    per_page: 20,
    total_pages: Math.ceil(items.length / 20),
    has_next: false,
    has_previous: false,
    ...overrides,
  }),

  createMockSearchParams: (overrides = {}) => ({
    query: '',
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    sort_direction: 'desc',
    filters: {},
    ...overrides,
  }),
};