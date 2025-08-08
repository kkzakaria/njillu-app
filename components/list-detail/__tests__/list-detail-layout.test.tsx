/**
 * Unit tests for ListDetailLayout component
 * Tests responsive layout behavior, state management, and integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { axe } from 'jest-axe';
import { ListDetailLayout } from '../layout/list-detail-layout';
import type { ListDetailLayoutConfig } from '../types';

// Mock translation messages
const mockMessages = {
  'list-detail': {
    search: { placeholder: 'Search...', clear: 'Clear search' },
    filters: { title: 'Filters', clear: 'Clear filters', apply: 'Apply filters' },
    list: { loading: 'Loading...', error: 'Error loading data', empty: 'No items found' },
    detail: {
      loading: 'Loading details...',
      error: 'Error loading details',
      notFound: 'Item not found',
      backToList: 'Back to list',
    },
    actions: { refresh: 'Refresh', selectAll: 'Select all' },
    common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    <div style={{ width: '100vw', height: '100vh' }}>
      {children}
    </div>
  </NextIntlClientProvider>
);

// Mock API functions
const mockLoadList = jest.fn();
const mockLoadDetail = jest.fn();

// Mock data
const mockListData = {
  data: [
    {
      id: 'BL-001',
      title: 'Bill of Lading 001',
      subtitle: 'Shanghai to Rotterdam',
      status: 'in_transit',
      priority: 'high',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'BL-002', 
      title: 'Bill of Lading 002',
      subtitle: 'Singapore to Hamburg',
      status: 'loaded',
      priority: 'medium',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  per_page: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

const mockDetailData = {
  id: 'BL-001',
  title: 'Bill of Lading 001',
  subtitle: 'Shanghai to Rotterdam - COSCO SHIPPING UNIVERSE',
  status: 'in_transit',
  priority: 'high',
  metadata: {
    vessel: 'COSCO SHIPPING UNIVERSE',
    voyage: 'CS001E',
    shipper: 'ABC Trading Co.',
    consignee: 'XYZ Imports Ltd.',
  },
  tabs: [
    { id: 'overview', label: 'Overview', content: { type: 'overview' } },
    { id: 'containers', label: 'Containers', content: { type: 'containers', data: [] } },
  ],
  actions: [
    { id: 'edit', label: 'Edit', icon: 'edit', variant: 'secondary' as const },
    { id: 'delete', label: 'Delete', icon: 'trash', variant: 'destructive' as const },
  ],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('ListDetailLayout Component', () => {
  const defaultConfig: ListDetailLayoutConfig = {
    entityType: 'bills_of_lading',
    mode: 'split',
    listWidth: 30,
    showSearch: true,
    showFilters: true,
    selectionMode: 'single',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockLoadList.mockResolvedValue(mockListData);
    mockLoadDetail.mockResolvedValue(mockDetailData);

    // Reset to desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
    window.dispatchEvent(new Event('resize'));
  });

  describe('Basic Rendering', () => {
    test('renders layout with default configuration', async () => {
      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      // Should show list initially
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      // Check layout structure
      expect(screen.getByTestId('list-detail-layout')).toBeInTheDocument();
      expect(screen.getByTestId('list-panel')).toBeInTheDocument();
      expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    });

    test('renders search and filters when enabled', async () => {
      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
    });

    test('hides search and filters when disabled', async () => {
      const configWithoutSearch = {
        ...defaultConfig,
        showSearch: false,
        showFilters: false,
      };

      render(
        <TestWrapper>
          <ListDetailLayout
            config={configWithoutSearch}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('switches to mobile layout on small screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      // Should use mobile layout class
      const layout = screen.getByTestId('list-detail-layout');
      expect(layout).toHaveClass('mobile-layout');
    });

    test('switches to tablet layout on medium screens', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const layout = screen.getByTestId('list-detail-layout');
      expect(layout).toHaveClass('tablet-layout');
    });

    test('uses desktop layout on large screens', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const layout = screen.getByTestId('list-detail-layout');
      expect(layout).toHaveClass('desktop-layout');
    });

    test('adjusts list width based on configuration', async () => {
      const config = { ...defaultConfig, listWidth: 30 };

      render(
        <TestWrapper>
          <ListDetailLayout
            config={config}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const listPanel = screen.getByTestId('list-panel');
      expect(listPanel).toHaveStyle({ width: '30%' });
    });
  });

  describe('List and Detail Interaction', () => {
    test('loads detail when list item is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      // Wait for list to load
      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Click on first item
      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      // Should load detail
      await waitFor(() => {
        expect(mockLoadDetail).toHaveBeenCalledWith({ id: 'BL-001' });
      });
    });

    test('shows detail in mobile modal', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      await waitFor(() => {
        // Should show back button in mobile view
        expect(screen.getByText('Back to list')).toBeInTheDocument();
      });
    });

    test('navigates back from detail to list on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Select item to show detail
      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      await waitFor(() => {
        expect(screen.getByText('Back to list')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByText('Back to list');
      await user.click(backButton);

      // Should be back in list view
      expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      expect(screen.queryByText('Back to list')).not.toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    test('filters list when search is performed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Shanghai');

      // Should call onLoadList with search params
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Shanghai',
          })
        );
      }, { timeout: 600 });
    });

    test('applies filters when filter is changed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      // Open filters
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      // Apply a status filter (assuming UI exists)
      const statusFilter = screen.getByLabelText('Status');
      await user.selectOptions(statusFilter, 'in_transit');

      const applyButton = screen.getByText('Apply filters');
      await user.click(applyButton);

      // Should call onLoadList with filter params
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: 'in_transit',
            }),
          })
        );
      });
    });

    test('clears filters when clear is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      const clearButton = screen.getByText('Clear filters');
      await user.click(clearButton);

      // Should call onLoadList without filters
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {},
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('displays list loading error', async () => {
      mockLoadList.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading data')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('displays detail loading error', async () => {
      const user = userEvent.setup();
      mockLoadDetail.mockRejectedValue(new Error('Detail not found'));

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      await waitFor(() => {
        expect(screen.getByText('Error loading details')).toBeInTheDocument();
      });
    });

    test('retries loading when retry is clicked', async () => {
      const user = userEvent.setup();
      mockLoadList.mockRejectedValueOnce(new Error('Network error'))
                  .mockResolvedValueOnce(mockListData);

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading data')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Modes', () => {
    test('supports single selection mode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={{ ...defaultConfig, selectionMode: 'single' }}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Select first item
      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      // Should show as selected
      expect(firstItem.closest('[role="button"]')).toHaveAttribute('aria-selected', 'true');

      // Select second item
      const secondItem = screen.getByText('Bill of Lading 002');
      await user.click(secondItem);

      // First item should no longer be selected
      expect(firstItem.closest('[role="button"]')).toHaveAttribute('aria-selected', 'false');
      expect(secondItem.closest('[role="button"]')).toHaveAttribute('aria-selected', 'true');
    });

    test('supports multiple selection mode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={{ ...defaultConfig, selectionMode: 'multiple' }}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Should show select all checkbox
      expect(screen.getByLabelText('Select all')).toBeInTheDocument();

      // Select multiple items
      const firstItem = screen.getByText('Bill of Lading 001');
      const secondItem = screen.getByText('Bill of Lading 002');

      await user.click(firstItem);
      await user.click(secondItem);

      // Both should be selected
      expect(firstItem.closest('[role="button"]')).toHaveAttribute('aria-selected', 'true');
      expect(secondItem.closest('[role="button"]')).toHaveAttribute('aria-selected', 'true');
    });

    test('supports no selection mode', async () => {
      render(
        <TestWrapper>
          <ListDetailLayout
            config={{ ...defaultConfig, selectionMode: 'none' }}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Items should not be selectable
      const firstItem = screen.getByText('Bill of Lading 001');
      expect(firstItem.closest('[role="button"]')).not.toHaveAttribute('aria-selected');
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has proper landmark roles', async () => {
      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      // Check landmark roles
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Detail panel
      expect(screen.getByRole('search')).toBeInTheDocument(); // Search functionality
    });

    test('supports keyboard navigation between panels', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Navigate with Tab key between focusable elements
      const searchInput = screen.getByPlaceholderText('Search...');
      const firstItem = screen.getByText('Bill of Lading 001');

      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      await user.tab();
      // Should move to filters or first list item
      expect(document.activeElement).not.toBe(searchInput);
    });

    test('announces state changes to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Bill of Lading 001')).toBeInTheDocument();
      });

      // Select item
      const firstItem = screen.getByText('Bill of Lading 001');
      await user.click(firstItem);

      // Should have aria-live region for announcements
      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/detail.*loaded/i);
      });
    });
  });

  describe('Performance', () => {
    test('renders within performance budget', () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('debounces search input', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();

      render(
        <TestWrapper>
          <ListDetailLayout
            config={defaultConfig}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      mockLoadList.mockClear();

      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'test');

      // Fast forward past debounce delay
      jest.advanceTimersByTime(500);

      // Should only call once after debounce
      expect(mockLoadList).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    test('virtualizes large lists when enabled', async () => {
      const largeListData = {
        ...mockListData,
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `BL-${i + 1}`,
          title: `Bill of Lading ${i + 1}`,
          subtitle: `Route ${i + 1}`,
          status: 'active',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        total: 1000,
      };

      mockLoadList.mockResolvedValue(largeListData);

      const { container } = render(
        <TestWrapper>
          <ListDetailLayout
            config={{ ...defaultConfig, enableVirtualScrolling: true }}
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      // Should only render visible items
      const renderedItems = container.querySelectorAll('[data-testid="list-item"]');
      expect(renderedItems.length).toBeLessThan(1000);
      expect(renderedItems.length).toBeGreaterThan(0);
    });
  });
});