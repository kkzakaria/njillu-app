/**
 * Integration tests for ListDetailContext and state management
 * Tests data flow, cache management, and state synchronization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ListDetailProvider, useListDetailContext } from '../context/list-detail-context';
import type { ListViewParams, DetailApiParams } from '../types';

// Mock translation messages
const mockMessages = {
  'list-detail': {
    search: { placeholder: 'Search...', clear: 'Clear search' },
    list: { loading: 'Loading...', error: 'Error loading data', empty: 'No items found' },
    detail: { loading: 'Loading details...', error: 'Error loading details', notFound: 'Item not found' },
    common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    {children}
  </NextIntlClientProvider>
);

// Mock API functions
const mockLoadList = jest.fn();
const mockLoadDetail = jest.fn();

// Test component to access context
const TestContextConsumer: React.FC<{
  onStateChange?: (state: any) => void;
}> = ({ onStateChange }) => {
  const context = useListDetailContext();
  
  React.useEffect(() => {
    onStateChange?.(context);
  }, [context, onStateChange]);

  return (
    <div>
      <div data-testid="list-loading">{context.listLoading ? 'Loading list' : 'List loaded'}</div>
      <div data-testid="detail-loading">{context.detailLoading ? 'Loading detail' : 'Detail loaded'}</div>
      <div data-testid="selected-item">{context.selectedItemId || 'No selection'}</div>
      <div data-testid="list-items-count">{context.listData?.data.length || 0}</div>
      <div data-testid="search-query">{context.searchQuery}</div>
      <div data-testid="current-page">{context.pagination.page}</div>
      
      <button 
        data-testid="select-item-btn"
        onClick={() => context.selectItem('TEST-001')}
      >
        Select Item
      </button>
      
      <button 
        data-testid="search-btn"
        onClick={() => context.setSearchQuery('test query')}
      >
        Search
      </button>
      
      <button 
        data-testid="refresh-btn"
        onClick={() => context.refreshList()}
      >
        Refresh
      </button>

      <button 
        data-testid="next-page-btn"
        onClick={() => context.loadPage(2)}
      >
        Next Page
      </button>

      <div data-testid="cache-stats">
        List cached: {context.cacheInfo?.listCached ? 'Yes' : 'No'},
        Detail cached: {context.cacheInfo?.detailCached ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

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
  total: 100,
  page: 1,
  per_page: 20,
  total_pages: 5,
  has_next: true,
  has_previous: false,
};

const mockDetailData = {
  id: 'TEST-001',
  title: 'Test Bill of Lading',
  subtitle: 'Test Route',
  status: 'active',
  priority: 'high',
  metadata: { vessel: 'Test Vessel' },
  tabs: [
    { id: 'overview', label: 'Overview', content: { type: 'overview' } },
  ],
  actions: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('ListDetailContext Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock successful API responses
    mockLoadList.mockResolvedValue(mockListData);
    mockLoadDetail.mockResolvedValue(mockDetailData);
    
    // Clear localStorage cache
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State and Loading', () => {
    test('initializes with correct default state', async () => {
      const stateChangeSpy = jest.fn();

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer onStateChange={stateChangeSpy} />
          </ListDetailProvider>
        </TestWrapper>
      );

      // Should start in loading state
      expect(screen.getByText('Loading list')).toBeInTheDocument();
      expect(screen.getByText('No selection')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // items count
      expect(screen.getByText('')).toBeInTheDocument(); // search query
      expect(screen.getByText('1')).toBeInTheDocument(); // current page

      // Should call onLoadList on mount
      expect(mockLoadList).toHaveBeenCalledWith({
        query: '',
        page: 1,
        per_page: 20,
        sort_by: 'created_at',
        sort_direction: 'desc',
        filters: {},
      });
    });

    test('loads list data successfully', async () => {
      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Should show loaded data
      expect(screen.getByText('2')).toBeInTheDocument(); // items count
    });

    test('handles list loading errors', async () => {
      mockLoadList.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument(); // Loading completed
      });

      // Should handle error gracefully
      expect(screen.getByText('0')).toBeInTheDocument(); // No items loaded
    });
  });

  describe('Item Selection', () => {
    test('selects item and loads detail', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      // Wait for list to load
      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Select an item
      const selectButton = screen.getByTestId('select-item-btn');
      await user.click(selectButton);

      // Should show selected item and start loading detail
      expect(screen.getByText('TEST-001')).toBeInTheDocument();
      expect(screen.getByText('Loading detail')).toBeInTheDocument();

      // Should call onLoadDetail
      expect(mockLoadDetail).toHaveBeenCalledWith({ id: 'TEST-001' });

      // Wait for detail to load
      await waitFor(() => {
        expect(screen.getByText('Detail loaded')).toBeInTheDocument();
      });
    });

    test('handles detail loading errors', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockLoadDetail.mockRejectedValue(new Error('Detail not found'));

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId('select-item-btn');
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('Detail loaded')).toBeInTheDocument();
      });

      // Should handle error and still show selection
      expect(screen.getByText('TEST-001')).toBeInTheDocument();
    });

    test('prevents concurrent detail loading requests', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      // Mock slow detail loading
      mockLoadDetail.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockDetailData), 1000)
      ));

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId('select-item-btn');
      
      // Click multiple times quickly
      await user.click(selectButton);
      await user.click(selectButton);
      await user.click(selectButton);

      // Should only call onLoadDetail once
      expect(mockLoadDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Search Functionality', () => {
    test('performs search and reloads list', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      mockLoadList.mockClear();

      // Perform search
      const searchButton = screen.getByTestId('search-btn');
      await user.click(searchButton);

      // Should update search query immediately
      expect(screen.getByText('test query')).toBeInTheDocument();

      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should call onLoadList with search parameters
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalledWith({
          query: 'test query',
          page: 1,
          per_page: 20,
          sort_by: 'created_at',
          sort_direction: 'desc',
          filters: {},
        });
      });
    });

    test('debounces search requests', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      const TestSearchComponent: React.FC = () => {
        const context = useListDetailContext();
        const [inputValue, setInputValue] = React.useState('');

        return (
          <div>
            <input
              data-testid="search-input"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                context.setSearchQuery(e.target.value);
              }}
            />
            <div data-testid="search-query">{context.searchQuery}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestSearchComponent />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      mockLoadList.mockClear();

      // Type multiple characters quickly
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'abcd');

      // Should only call onLoadList once after debounce period
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockLoadList).toHaveBeenCalledTimes(1);
      expect(mockLoadList).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'abcd' })
      );
    });
  });

  describe('Pagination', () => {
    test('loads next page', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      mockLoadList.mockClear();

      // Load next page
      const nextPageButton = screen.getByTestId('next-page-btn');
      await user.click(nextPageButton);

      // Should update page number immediately
      expect(screen.getByText('2')).toBeInTheDocument();

      // Should call onLoadList with new page
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalledWith({
          query: '',
          page: 2,
          per_page: 20,
          sort_by: 'created_at',
          sort_direction: 'desc',
          filters: {},
        });
      });
    });

    test('handles pagination errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Mock error for page 2
      mockLoadList.mockRejectedValueOnce(new Error('Page not found'));

      const nextPageButton = screen.getByTestId('next-page-btn');
      await user.click(nextPageButton);

      // Should revert page number on error
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Back to page 1
      });
    });
  });

  describe('Cache Management', () => {
    test('caches list data', async () => {
      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
            cacheConfig={{ listTTL: 300, detailTTL: 300, enableCache: true }}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Should show cache status
      expect(screen.getByText(/List cached: Yes/)).toBeInTheDocument();

      // Refresh should use cache
      mockLoadList.mockClear();
      
      const refreshButton = screen.getByTestId('refresh-btn');
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await user.click(refreshButton);

      // Should not call API again immediately (cache hit)
      expect(mockLoadList).not.toHaveBeenCalled();
    });

    test('invalidates cache after TTL expires', async () => {
      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
            cacheConfig={{ listTTL: 1, detailTTL: 1, enableCache: true }} // 1 second TTL
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      mockLoadList.mockClear();

      // Fast-forward past cache TTL
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Refresh should hit API again
      const refreshButton = screen.getByTestId('refresh-btn');
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });
    });

    test('manages cache size limits', async () => {
      const largeMockData = {
        ...mockListData,
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `BL-${i}`,
          title: `Bill ${i}`,
          subtitle: `Route ${i}`,
          status: 'active',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      };

      mockLoadList.mockResolvedValue(largeMockData);

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
            cacheConfig={{ 
              listTTL: 300, 
              detailTTL: 300, 
              enableCache: true,
              maxCacheSize: 100 // Small cache size
            }}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Cache should handle large data appropriately
      expect(screen.getByText('1000')).toBeInTheDocument(); // All items loaded
    });
  });

  describe('State Synchronization', () => {
    test('synchronizes state across multiple context consumers', async () => {
      const StateDisplay: React.FC<{ testId: string }> = ({ testId }) => {
        const context = useListDetailContext();
        return (
          <div data-testid={testId}>
            {context.selectedItemId || 'none'}
          </div>
        );
      };

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
            <StateDisplay testId="state-display-1" />
            <StateDisplay testId="state-display-2" />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // All consumers should show same initial state
      expect(screen.getByTestId('state-display-1')).toHaveTextContent('none');
      expect(screen.getByTestId('state-display-2')).toHaveTextContent('none');

      // Select an item
      const selectButton = screen.getByTestId('select-item-btn');
      await user.click(selectButton);

      // All consumers should update synchronously
      expect(screen.getByTestId('selected-item')).toHaveTextContent('TEST-001');
      expect(screen.getByTestId('state-display-1')).toHaveTextContent('TEST-001');
      expect(screen.getByTestId('state-display-2')).toHaveTextContent('TEST-001');
    });

    test('handles concurrent state updates correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      const ConcurrentUpdater: React.FC = () => {
        const context = useListDetailContext();

        const handleConcurrentUpdates = () => {
          // Simulate multiple rapid state updates
          context.setSearchQuery('query1');
          context.selectItem('item1');
          context.setSearchQuery('query2');
          context.selectItem('item2');
        };

        return (
          <div>
            <button 
              data-testid="concurrent-btn"
              onClick={handleConcurrentUpdates}
            >
              Concurrent Updates
            </button>
            <div data-testid="final-search">{context.searchQuery}</div>
            <div data-testid="final-selection">{context.selectedItemId}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <ConcurrentUpdater />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const concurrentButton = screen.getByTestId('concurrent-btn');
      await user.click(concurrentButton);

      // Should apply all updates correctly
      expect(screen.getByTestId('final-search')).toHaveTextContent('query2');
      expect(screen.getByTestId('final-selection')).toHaveTextContent('item2');
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('recovers from API failures with retry mechanism', async () => {
      // Mock API failure followed by success
      mockLoadList.mockRejectedValueOnce(new Error('Network error'))
                  .mockResolvedValueOnce(mockListData);

      const RetryComponent: React.FC = () => {
        const context = useListDetailContext();
        return (
          <div>
            <button 
              data-testid="retry-btn"
              onClick={() => context.refreshList()}
            >
              Retry
            </button>
            <div data-testid="error-state">
              {context.listError ? 'Error' : 'No error'}
            </div>
          </div>
        );
      };

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <RetryComponent />
          </ListDetailProvider>
        </TestWrapper>
      );

      // Initial load should fail
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Retry should succeed
      const retryButton = screen.getByTestId('retry-btn');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });

      expect(mockLoadList).toHaveBeenCalledTimes(2);
    });

    test('maintains stable state during rapid network changes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      // Mock unstable network conditions
      let callCount = 0;
      mockLoadList.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Network unstable'));
        }
        return Promise.resolve(mockListData);
      });

      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="bills_of_lading"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <TestContextConsumer />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });

      // Perform multiple rapid refreshes
      const refreshButton = screen.getByTestId('refresh-btn');
      
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);

      // Should handle unstable network gracefully
      await waitFor(() => {
        // At least one successful load should have occurred
        expect(screen.getByText('List loaded')).toBeInTheDocument();
      });
    });
  });
});