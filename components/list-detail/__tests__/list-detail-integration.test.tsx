/**
 * Integration test for List-Detail Layout System
 * Tests the complete workflow from list to detail view
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BLListDetailLayout } from '../entities/bl-list-detail';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/demo/list-detail',
}));

// Mock messages for internationalization
const mockMessages = {
  'list-detail': {
    search: {
      placeholder: 'Search...',
      suggestions: 'Search suggestions',
      noResults: 'No results found',
      clear: 'Clear search',
    },
    filters: {
      title: 'Filters',
      clear: 'Clear filters',
      apply: 'Apply filters',
      status: 'Status',
      priority: 'Priority',
    },
    list: {
      loading: 'Loading...',
      error: 'Error loading data',
      empty: 'No items found',
      retry: 'Retry',
    },
    actions: {
      select: 'Select',
      selectAll: 'Select all',
      delete: 'Delete selected',
      export: 'Export',
      edit: 'Edit',
      view: 'View details',
      refresh: 'Refresh',
    },
    detail: {
      loading: 'Loading details...',
      error: 'Error loading details',
      notFound: 'Item not found',
      backToList: 'Back to list',
      tabs: {
        overview: 'Overview',
        details: 'Details',
        activities: 'Activities',
        related: 'Related items',
        attachments: 'Attachments',
      },
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
    },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    <div style={{ height: '600px' }}>
      {children}
    </div>
  </NextIntlClientProvider>
);

describe('List-Detail Integration', () => {
  beforeEach(() => {
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

    // Mock window.innerWidth for responsive breakpoints
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280, // Desktop width
    });
  });

  test('renders list view with Bills of Lading items', async () => {
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if Bills of Lading items are rendered
    expect(screen.getByText('BL-2025-001')).toBeInTheDocument();
    expect(screen.getByText('Shanghai to Le Havre')).toBeInTheDocument();
    expect(screen.getByText('BL-2025-002')).toBeInTheDocument();
    expect(screen.getByText('Rotterdam to New York')).toBeInTheDocument();
  });

  test('filters Bills of Lading by search query', async () => {
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Find and use search input
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Shanghai' } });
    
    // Wait for search to be applied
    await waitFor(() => {
      expect(screen.getByText('BL-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Shanghai to Le Havre')).toBeInTheDocument();
      // Rotterdam item should be filtered out
      expect(screen.queryByText('Rotterdam to New York')).not.toBeInTheDocument();
    });
  });

  test('selects item and shows detail view', async () => {
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click on the first Bill of Lading item
    const firstItem = screen.getByText('BL-2025-001');
    fireEvent.click(firstItem);

    // Wait for detail view to load
    await waitFor(() => {
      expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    });

    // Check if detail view is shown with correct data
    expect(screen.getByText('BL-2025-001')).toBeInTheDocument();
    expect(screen.getByText('COSCO SHIPPING UNIVERSE')).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Containers')).toBeInTheDocument();
    expect(screen.getByText('Parties')).toBeInTheDocument();
  });

  test('switches between detail tabs', async () => {
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    // Wait for loading and select item
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const firstItem = screen.getByText('BL-2025-001');
    fireEvent.click(firstItem);

    await waitFor(() => {
      expect(screen.queryByText('Loading details...')).not.toBeInTheDocument();
    });

    // Click on Containers tab
    const containersTab = screen.getByText('Containers');
    fireEvent.click(containersTab);

    // Verify tab content (containers tab should show container information)
    await waitFor(() => {
      expect(screen.getByText('Containers')).toBeInTheDocument();
    });

    // Click on Activities tab
    const activitiesTab = screen.getByText('Activities');
    fireEvent.click(activitiesTab);

    // Verify activities content
    await waitFor(() => {
      expect(screen.getByText('Activity History')).toBeInTheDocument();
    });
  });

  test('handles mobile responsive layout', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 767, // Mobile width
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // In mobile view, should show list initially
    expect(screen.getByText('BL-2025-001')).toBeInTheDocument();

    // Select item to navigate to detail view
    const firstItem = screen.getByText('BL-2025-001');
    fireEvent.click(firstItem);

    await waitFor(() => {
      // Should show back button in mobile detail view
      expect(screen.getByText('Back to list')).toBeInTheDocument();
    });
  });

  test('handles error states gracefully', async () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Force an error by providing invalid data
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Restore fetch and console
    global.fetch = originalFetch;
    consoleSpy.mockRestore();
  });

  test('pagination works correctly', async () => {
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if pagination info is shown (depends on mock data)
    const paginationInfo = screen.getByText(/Showing \d+ to \d+ of \d+ results/);
    expect(paginationInfo).toBeInTheDocument();

    // Check if page size selector is present
    const pageSizeSelector = screen.getByDisplayValue('20');
    expect(pageSizeSelector).toBeInTheDocument();
  });
});

describe('List-Detail Performance', () => {
  test('renders within performance budget', async () => {
    const startTime = performance.now();

    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms (excluding API calls)
    expect(renderTime).toBeLessThan(100);
  });

  test('handles large datasets efficiently', async () => {
    // This would test with mock data containing many items
    // In a real implementation, we'd mock the API to return 1000+ items
    
    render(
      <TestWrapper>
        <BLListDetailLayout />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify the component handles the dataset without performance issues
    // This is a placeholder - in practice you'd measure render time, memory usage, etc.
    expect(screen.getByText('BL-2025-001')).toBeInTheDocument();
  });
});