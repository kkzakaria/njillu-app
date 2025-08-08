/**
 * Unit tests for ListView component
 * Tests list rendering, search, pagination, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { axe } from 'jest-axe';
import { ListView } from '../list/list-view';
import { ListDetailProvider } from '../context/list-detail-context';
import type { ListViewItem, EntityType } from '../types';

// Mock translation messages
const mockMessages = {
  'list-detail': {
    search: { placeholder: 'Search...', clear: 'Clear search' },
    list: { loading: 'Loading...', error: 'Error loading data', empty: 'No items found' },
    actions: { selectAll: 'Select all', refresh: 'Refresh' },
    common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode; entityType?: EntityType }> = ({ 
  children, 
  entityType = 'bills_of_lading' 
}) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    <ListDetailProvider 
      entityType={entityType}
      onLoadList={jest.fn()}
      onLoadDetail={jest.fn()}
    >
      {children}
    </ListDetailProvider>
  </NextIntlClientProvider>
);

// Mock data
const createMockBLItems = (count: number): ListViewItem<any>[] => 
  Array.from({ length: count }, (_, i) => ({
    id: `BL-${i + 1}`,
    title: `Bill of Lading ${i + 1}`,
    subtitle: `Vessel ${i + 1} - Route ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'completed',
    priority: i % 3 === 0 ? 'high' : 'medium',
    metadata: {
      vessel: `Test Vessel ${i + 1}`,
      route: `Port A to Port B`,
      eta: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
    },
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }));

describe('ListView Component', () => {
  const mockOnSelectItem = jest.fn();
  const mockOnLoadMore = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders empty state when no items provided', () => {
      render(
        <TestWrapper>
          <ListView
            items={[]}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    test('renders loading state', () => {
      render(
        <TestWrapper>
          <ListView
            items={[]}
            loading={true}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders list items correctly', () => {
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // Check that all items are rendered
      expect(screen.getByText('Bill of Lading 1')).toBeInTheDocument();
      expect(screen.getByText('Bill of Lading 2')).toBeInTheDocument();
      expect(screen.getByText('Bill of Lading 3')).toBeInTheDocument();

      // Check subtitles
      expect(screen.getByText('Vessel 1 - Route 1')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('calls onSearch when typing in search input', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(5);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test query');

      // Should debounce the search calls
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test query');
      }, { timeout: 600 }); // Account for debounce delay
    });

    test('clears search when clear button is clicked', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(5);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test');
      
      // Wait for search to be called
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      });

      // Clear the search
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Item Selection', () => {
    test('calls onSelectItem when item is clicked', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const firstItem = screen.getByText('Bill of Lading 1');
      await user.click(firstItem);

      expect(mockOnSelectItem).toHaveBeenCalledWith('BL-1');
    });

    test('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const firstItem = screen.getByRole('button', { name: /Bill of Lading 1/ });
      
      // Focus on first item and press Enter
      firstItem.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelectItem).toHaveBeenCalledWith('BL-1');
    });

    test('supports multiple selection mode', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            selectionMode="multiple"
            selectedIds={['BL-1']}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // First item should be selected
      const firstItem = screen.getByRole('button', { name: /Bill of Lading 1/ });
      expect(firstItem).toHaveAttribute('aria-selected', 'true');

      // Select second item
      const secondItem = screen.getByRole('button', { name: /Bill of Lading 2/ });
      await user.click(secondItem);

      expect(mockOnSelectItem).toHaveBeenCalledWith('BL-2');
    });
  });

  describe('Responsive Behavior', () => {
    test('adapts layout for mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // Check mobile-specific classes or layout
      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveClass('mobile-layout'); // Assuming this class exists
    });

    test('adapts layout for tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveClass('tablet-layout'); // Assuming this class exists
    });

    test('adapts layout for desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveClass('desktop-layout'); // Assuming this class exists
    });
  });

  describe('Pagination & Infinite Scroll', () => {
    test('calls onLoadMore when scrolling to bottom', async () => {
      const items = createMockBLItems(20);
      
      const { container } = render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            hasMore={true}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // Mock IntersectionObserver callback
      const [callback] = (global.IntersectionObserver as jest.MockedClass<typeof IntersectionObserver>).mock.calls[0];
      
      // Simulate intersection
      callback([{ isIntersecting: true, target: container.querySelector('[data-testid="load-more-trigger"]') }] as any, {} as any);

      expect(mockOnLoadMore).toHaveBeenCalled();
    });

    test('shows loading indicator when loading more', () => {
      const items = createMockBLItems(10);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            loadingMore={true}
            hasMore={true}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-more-indicator')).toBeInTheDocument();
    });

    test('does not show load more trigger when hasMore is false', () => {
      const items = createMockBLItems(10);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            hasMore={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      expect(screen.queryByTestId('load-more-trigger')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error message when error prop is provided', () => {
      const errorMessage = 'Failed to load data';
      
      render(
        <TestWrapper>
          <ListView
            items={[]}
            loading={false}
            error={errorMessage}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    test('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRetry = jest.fn();
      
      render(
        <TestWrapper>
          <ListView
            items={[]}
            loading={false}
            error="Network error"
            onRetry={mockOnRetry}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const items = createMockBLItems(5);
      
      const { container } = render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has proper ARIA labels and roles', () => {
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // Check main list role
      expect(screen.getByRole('list')).toBeInTheDocument();

      // Check search input accessibility
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('aria-label');

      // Check list items are properly labeled
      const listItems = screen.getAllByRole('button');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('aria-describedby');
      });
    });

    test('supports keyboard navigation between items', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(3);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const listItems = screen.getAllByRole('button');
      
      // Focus on first item
      listItems[0].focus();
      expect(document.activeElement).toBe(listItems[0]);

      // Navigate to next item with arrow key
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(listItems[1]);

      // Navigate to previous item with arrow key
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(listItems[0]);
    });
  });

  describe('Performance', () => {
    test('renders large datasets efficiently', () => {
      const startTime = performance.now();
      const items = createMockBLItems(100);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (100ms for 100 items)
      expect(renderTime).toBeLessThan(100);
    });

    test('uses virtual scrolling for very large datasets', () => {
      const items = createMockBLItems(1000);
      
      const { container } = render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            enableVirtualScrolling={true}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      // Should only render visible items
      const renderedItems = container.querySelectorAll('[data-testid="list-item"]');
      expect(renderedItems.length).toBeLessThan(items.length);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    test('debounces search input to avoid excessive API calls', async () => {
      const user = userEvent.setup();
      const items = createMockBLItems(5);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelectItem}
            onLoadMore={mockOnLoadMore}
            onSearch={mockOnSearch}
            onFilter={mockOnFilter}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'abcd');
      
      // Should only call onSearch once after debounce period
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledTimes(1);
        expect(mockOnSearch).toHaveBeenCalledWith('abcd');
      }, { timeout: 600 });
    });
  });
});