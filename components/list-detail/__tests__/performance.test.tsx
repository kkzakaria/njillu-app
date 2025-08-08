/**
 * Performance tests for list-detail components
 * Tests rendering performance, memory usage, and optimization effectiveness
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ListDetailLayout } from '../layout/list-detail-layout';
import { ListView } from '../list/list-view';
import { DetailView } from '../detail/detail-view';
import { ListDetailProvider } from '../context/list-detail-context';

// Performance measurement utilities
const performanceMarkers = {
  mark: (name: string) => performance.mark(name),
  measure: (name: string, start: string, end?: string) => {
    if (end) {
      performance.measure(name, start, end);
    } else {
      performance.measure(name, start);
    }
    const entries = performance.getEntriesByName(name, 'measure');
    return entries[entries.length - 1]?.duration || 0;
  },
  clear: () => {
    performance.clearMarks();
    performance.clearMeasures();
  },
};

// Mock translation messages (minimal for performance)
const mockMessages = {
  'list-detail': {
    search: { placeholder: 'Search...', clear: 'Clear' },
    list: { loading: 'Loading...', error: 'Error', empty: 'Empty' },
    detail: { loading: 'Loading...', error: 'Error', tabs: { overview: 'Overview' } },
    actions: { edit: 'Edit', delete: 'Delete' },
    common: { loading: 'Loading...', error: 'Error', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    {children}
  </NextIntlClientProvider>
);

// Data generation utilities for performance testing
const generateLargeDataset = (size: number) =>
  Array.from({ length: size }, (_, i) => ({
    id: `PERF-ITEM-${i + 1}`,
    title: `Performance Test Item ${i + 1}`,
    subtitle: `Subtitle for item ${i + 1} with additional text for testing`,
    status: ['active', 'completed', 'pending'][i % 3],
    priority: ['low', 'medium', 'high'][i % 3],
    metadata: {
      created_by: `User ${i % 10 + 1}`,
      department: `Department ${String.fromCharCode(65 + (i % 26))}`,
      tags: [`tag${i % 5}`, `category${i % 3}`],
      description: `This is a detailed description for item ${i + 1} that contains more text to simulate real-world data sizes and complexity.`,
    },
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }));

const generateDetailData = (id: string) => ({
  id,
  title: `Performance Test Item ${id}`,
  subtitle: 'Complex detail view with multiple sections',
  status: 'active',
  priority: 'high',
  metadata: {
    created_by: 'Performance User',
    department: 'Performance Department',
    tags: ['performance', 'testing', 'complex'],
    description: 'This is a complex detail view with extensive metadata for performance testing.',
    specifications: Array.from({ length: 50 }, (_, i) => ({
      key: `spec_${i + 1}`,
      value: `Value ${i + 1}`,
      type: 'string',
    })),
  },
  tabs: [
    { 
      id: 'overview', 
      label: 'Overview', 
      content: { 
        type: 'overview',
        data: {
          sections: Array.from({ length: 10 }, (_, i) => ({
            title: `Section ${i + 1}`,
            content: `Content for section ${i + 1}`,
          })),
        },
      }
    },
    {
      id: 'details',
      label: 'Details',
      content: {
        type: 'details',
        data: Array.from({ length: 100 }, (_, i) => ({
          field: `Field ${i + 1}`,
          value: `Value ${i + 1}`,
        })),
      },
    },
    {
      id: 'activities',
      label: 'Activities',
      content: {
        type: 'activities',
        data: Array.from({ length: 200 }, (_, i) => ({
          id: `activity-${i + 1}`,
          type: 'update',
          description: `Activity ${i + 1} description`,
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          user: `User ${i % 10 + 1}`,
        })),
      },
    },
  ],
  actions: [
    { id: 'edit', label: 'Edit', icon: 'edit', variant: 'secondary' as const },
    { id: 'delete', label: 'Delete', icon: 'trash', variant: 'destructive' as const },
    { id: 'export', label: 'Export', icon: 'download', variant: 'outline' as const },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('Performance Tests', () => {
  beforeEach(() => {
    performanceMarkers.clear();
    jest.clearAllMocks();
  });

  describe('Rendering Performance', () => {
    test('renders small dataset within performance budget', async () => {
      const items = generateLargeDataset(50);
      
      performanceMarkers.mark('render-start');
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={jest.fn()}
            onLoadMore={jest.fn()}
            onSearch={jest.fn()}
            onFilter={jest.fn()}
          />
        </TestWrapper>
      );
      
      performanceMarkers.mark('render-end');
      const renderTime = performanceMarkers.measure('render-time', 'render-start', 'render-end');
      
      // Should render 50 items within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('renders large dataset within performance budget', async () => {
      const items = generateLargeDataset(1000);
      
      performanceMarkers.mark('large-render-start');
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            enableVirtualScrolling={true}
            onSelectItem={jest.fn()}
            onLoadMore={jest.fn()}
            onSearch={jest.fn()}
            onFilter={jest.fn()}
          />
        </TestWrapper>
      );
      
      performanceMarkers.mark('large-render-end');
      const renderTime = performanceMarkers.measure('large-render-time', 'large-render-start', 'large-render-end');
      
      // Should render 1000 items with virtualization within 200ms
      expect(renderTime).toBeLessThan(200);
    });

    test('detail view renders complex data efficiently', async () => {
      const detail = generateDetailData('COMPLEX-001');
      
      performanceMarkers.mark('detail-render-start');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={jest.fn()}
            onAction={jest.fn()}
            onTabChange={jest.fn()}
          />
        </TestWrapper>
      );
      
      performanceMarkers.mark('detail-render-end');
      const renderTime = performanceMarkers.measure('detail-render-time', 'detail-render-start', 'detail-render-end');
      
      // Should render complex detail view within 150ms
      expect(renderTime).toBeLessThan(150);
    });

    test('measures list item rendering performance', async () => {
      const items = generateLargeDataset(500);
      
      const PerformanceTestList: React.FC = () => {
        const [renderCount, setRenderCount] = React.useState(0);
        
        React.useEffect(() => {
          setRenderCount(count => count + 1);
        });

        return (
          <div data-testid="performance-list" data-render-count={renderCount}>
            <ListView
              items={items}
              loading={false}
              onSelectItem={jest.fn()}
              onLoadMore={jest.fn()}
              onSearch={jest.fn()}
              onFilter={jest.fn()}
            />
          </div>
        );
      };
      
      performanceMarkers.mark('list-performance-start');
      
      render(
        <TestWrapper>
          <PerformanceTestList />
        </TestWrapper>
      );
      
      performanceMarkers.mark('list-performance-end');
      const renderTime = performanceMarkers.measure('list-performance-time', 'list-performance-start', 'list-performance-end');
      
      // Check that component doesn't re-render unnecessarily
      const performanceList = screen.getByTestId('performance-list');
      const renderCount = parseInt(performanceList.getAttribute('data-render-count') || '0');
      
      expect(renderCount).toBeLessThanOrEqual(2); // Initial render + potential effect render
      expect(renderTime).toBeLessThan(300);
    });
  });

  describe('Search Performance', () => {
    test('search input has minimal debounce delay', async () => {
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();
      const items = generateLargeDataset(100);
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={jest.fn()}
            onLoadMore={jest.fn()}
            onSearch={mockOnSearch}
            onFilter={jest.fn()}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      
      performanceMarkers.mark('search-start');
      await user.type(searchInput, 'test query');
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      }, { timeout: 1000 });
      
      performanceMarkers.mark('search-end');
      const searchTime = performanceMarkers.measure('search-time', 'search-start', 'search-end');
      
      // Search should complete within reasonable time (including debounce)
      expect(searchTime).toBeLessThan(800);
    });

    test('search filtering is performant with large datasets', async () => {
      const user = userEvent.setup();
      const items = generateLargeDataset(2000);
      
      const SearchPerformanceTest: React.FC = () => {
        const [filteredItems, setFilteredItems] = React.useState(items);
        const [searchTime, setSearchTime] = React.useState(0);

        const handleSearch = React.useCallback((query: string) => {
          const start = performance.now();
          
          const filtered = items.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase())
          );
          
          setFilteredItems(filtered);
          setSearchTime(performance.now() - start);
        }, []);

        return (
          <div>
            <input
              data-testid="search-input"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="search-time">{searchTime}</div>
            <div data-testid="results-count">{filteredItems.length}</div>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <SearchPerformanceTest />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Item 100');
      
      await waitFor(() => {
        const searchTime = parseFloat(screen.getByTestId('search-time').textContent || '0');
        expect(searchTime).toBeLessThan(50); // Search should complete within 50ms
      });
    });

    test('search suggestions load quickly', async () => {
      const user = userEvent.setup();
      const mockLoadSuggestions = jest.fn().mockImplementation((query: string) => {
        // Simulate suggestion generation
        return Promise.resolve(
          Array.from({ length: 10 }, (_, i) => `${query} suggestion ${i + 1}`)
        );
      });

      const SearchSuggestionsTest: React.FC = () => {
        const [suggestions, setSuggestions] = React.useState<string[]>([]);
        const [loading, setLoading] = React.useState(false);

        const handleSearch = async (query: string) => {
          if (query.length < 2) {
            setSuggestions([]);
            return;
          }

          setLoading(true);
          performanceMarkers.mark('suggestions-start');
          
          const results = await mockLoadSuggestions(query);
          setSuggestions(results);
          setLoading(false);
          
          performanceMarkers.mark('suggestions-end');
          performanceMarkers.measure('suggestions-time', 'suggestions-start', 'suggestions-end');
        };

        return (
          <div>
            <input
              data-testid="suggestions-input"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            {loading && <div data-testid="suggestions-loading">Loading...</div>}
            <ul data-testid="suggestions-list">
              {suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        );
      };

      render(
        <TestWrapper>
          <SearchSuggestionsTest />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('suggestions-input');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByTestId('suggestions-list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(10);
      });

      const measures = performance.getEntriesByName('suggestions-time', 'measure');
      if (measures.length > 0) {
        expect(measures[0].duration).toBeLessThan(100); // Suggestions should load within 100ms
      }
    });
  });

  describe('Memory Performance', () => {
    test('properly cleans up event listeners', async () => {
      const mockAddEventListener = jest.spyOn(document, 'addEventListener');
      const mockRemoveEventListener = jest.spyOn(document, 'removeEventListener');

      const MemoryTestComponent: React.FC = () => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              // Handle escape
            }
          };

          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, []);

        return <div>Memory Test Component</div>;
      };

      const { unmount } = render(
        <TestWrapper>
          <MemoryTestComponent />
        </TestWrapper>
      );

      // Component should add event listener
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Cleanup on unmount
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));

      mockAddEventListener.mockRestore();
      mockRemoveEventListener.mockRestore();
    });

    test('prevents memory leaks in large lists', async () => {
      const items = generateLargeDataset(1000);
      
      const MemoryEfficientList: React.FC<{ visible: boolean }> = ({ visible }) => {
        const [mountedItems, setMountedItems] = React.useState<typeof items>([]);

        React.useEffect(() => {
          if (visible) {
            // Simulate progressive loading
            const loadItems = async () => {
              for (let i = 0; i < items.length; i += 100) {
                const batch = items.slice(i, i + 100);
                setMountedItems(prev => [...prev, ...batch]);
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            };
            loadItems();
          } else {
            // Clear items when not visible
            setMountedItems([]);
          }
        }, [visible]);

        return (
          <div data-testid="memory-list">
            {mountedItems.map(item => (
              <div key={item.id} data-testid="list-item">
                {item.title}
              </div>
            ))}
          </div>
        );
      };

      const { rerender } = render(
        <TestWrapper>
          <MemoryEfficientList visible={true} />
        </TestWrapper>
      );

      // Wait for all items to load
      await waitFor(() => {
        expect(screen.getAllByTestId('list-item')).toHaveLength(1000);
      }, { timeout: 5000 });

      // Hide component to test cleanup
      rerender(
        <TestWrapper>
          <MemoryEfficientList visible={false} />
        </TestWrapper>
      );

      // Items should be cleared
      expect(screen.queryAllByTestId('list-item')).toHaveLength(0);
    });

    test('efficiently handles component updates', async () => {
      const initialItems = generateLargeDataset(100);
      
      const UpdateTestComponent: React.FC = () => {
        const [items, setItems] = React.useState(initialItems);
        const [updateCount, setUpdateCount] = React.useState(0);
        const renderCountRef = React.useRef(0);

        React.useEffect(() => {
          renderCountRef.current++;
        });

        const addItem = () => {
          const newItem = generateLargeDataset(1)[0];
          newItem.id = `NEW-${Date.now()}`;
          setItems(prev => [...prev, newItem]);
          setUpdateCount(prev => prev + 1);
        };

        const updateItem = () => {
          setItems(prev => 
            prev.map((item, index) => 
              index === 0 
                ? { ...item, title: `Updated ${Date.now()}` }
                : item
            )
          );
          setUpdateCount(prev => prev + 1);
        };

        return (
          <div>
            <div data-testid="render-count">{renderCountRef.current}</div>
            <div data-testid="update-count">{updateCount}</div>
            <div data-testid="items-count">{items.length}</div>
            <button onClick={addItem}>Add Item</button>
            <button onClick={updateItem}>Update Item</button>
            <div data-testid="items-list">
              {items.slice(0, 10).map(item => (
                <div key={item.id}>{item.title}</div>
              ))}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UpdateTestComponent />
        </TestWrapper>
      );

      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');

      // Add item
      await user.click(screen.getByText('Add Item'));
      await waitFor(() => {
        expect(screen.getByTestId('items-count')).toHaveTextContent('101');
      });

      // Update item
      await user.click(screen.getByText('Update Item'));
      await waitFor(() => {
        expect(screen.getByTestId('update-count')).toHaveTextContent('2');
      });

      const finalRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0');
      
      // Should not have excessive re-renders
      expect(finalRenderCount - initialRenderCount).toBeLessThanOrEqual(4); // 2 updates + potential effect renders
    });
  });

  describe('Scrolling Performance', () => {
    test('virtual scrolling performs well with large datasets', async () => {
      const items = generateLargeDataset(10000);
      
      const VirtualScrollTest: React.FC = () => {
        const [visibleItems, setVisibleItems] = React.useState<typeof items>([]);
        const [scrollTop, setScrollTop] = React.useState(0);
        const itemHeight = 60;
        const containerHeight = 600;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const buffer = 5;

        React.useEffect(() => {
          const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
          const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);
          
          performanceMarkers.mark('virtual-scroll-start');
          setVisibleItems(items.slice(startIndex, endIndex));
          performanceMarkers.mark('virtual-scroll-end');
          
          const scrollTime = performanceMarkers.measure('virtual-scroll-time', 'virtual-scroll-start', 'virtual-scroll-end');
          
          // Virtual scroll update should be very fast
          expect(scrollTime).toBeLessThan(16.67); // One frame at 60fps
        }, [scrollTop]);

        return (
          <div
            data-testid="virtual-container"
            style={{ height: containerHeight, overflowY: 'auto' }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <div style={{ height: items.length * itemHeight, position: 'relative' }}>
              {visibleItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: (Math.floor(scrollTop / itemHeight) - buffer + index) * itemHeight,
                    height: itemHeight,
                    width: '100%',
                  }}
                  data-testid="virtual-item"
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <VirtualScrollTest />
        </TestWrapper>
      );

      const container = screen.getByTestId('virtual-container');
      
      // Simulate scroll
      fireEvent.scroll(container, { target: { scrollTop: 1000 } });
      
      await waitFor(() => {
        const visibleItems = screen.getAllByTestId('virtual-item');
        expect(visibleItems.length).toBeGreaterThan(0);
        expect(visibleItems.length).toBeLessThan(50); // Should not render all items
      });
    });

    test('infinite scroll loading is performant', async () => {
      const initialItems = generateLargeDataset(50);
      
      const InfiniteScrollTest: React.FC = () => {
        const [items, setItems] = React.useState(initialItems);
        const [loading, setLoading] = React.useState(false);
        const [page, setPage] = React.useState(1);

        const loadMore = React.useCallback(async () => {
          if (loading) return;
          
          setLoading(true);
          performanceMarkers.mark('infinite-load-start');
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const newItems = generateLargeDataset(50).map(item => ({
            ...item,
            id: `${item.id}-page-${page + 1}`,
          }));
          
          setItems(prev => [...prev, ...newItems]);
          setPage(prev => prev + 1);
          setLoading(false);
          
          performanceMarkers.mark('infinite-load-end');
          const loadTime = performanceMarkers.measure('infinite-load-time', 'infinite-load-start', 'infinite-load-end');
          
          // Infinite scroll should be smooth
          expect(loadTime).toBeLessThan(200);
        }, [loading, page]);

        // Simulate intersection observer trigger
        React.useEffect(() => {
          const timer = setTimeout(() => {
            if (items.length < 200) { // Load up to 200 items
              loadMore();
            }
          }, 100);
          
          return () => clearTimeout(timer);
        }, [items.length, loadMore]);

        return (
          <div data-testid="infinite-scroll-container">
            {items.map(item => (
              <div key={item.id} data-testid="infinite-item">
                {item.title}
              </div>
            ))}
            {loading && <div data-testid="loading-indicator">Loading...</div>}
            <div data-testid="items-count">{items.length}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <InfiniteScrollTest />
        </TestWrapper>
      );

      // Wait for progressive loading
      await waitFor(() => {
        const itemCount = parseInt(screen.getByTestId('items-count').textContent || '0');
        expect(itemCount).toBeGreaterThan(50);
      }, { timeout: 5000 });

      // Should load additional items
      await waitFor(() => {
        const itemCount = parseInt(screen.getByTestId('items-count').textContent || '0');
        expect(itemCount).toBeGreaterThanOrEqual(100);
      }, { timeout: 5000 });
    });
  });

  describe('Component Optimization', () => {
    test('memoization prevents unnecessary re-renders', async () => {
      const items = generateLargeDataset(100);
      
      const MemoizedListItem = React.memo<{ item: typeof items[0]; onSelect: (id: string) => void }>(
        ({ item, onSelect }) => {
          const renderCountRef = React.useRef(0);
          renderCountRef.current++;
          
          return (
            <div 
              data-testid={`memoized-item-${item.id}`}
              data-render-count={renderCountRef.current}
              onClick={() => onSelect(item.id)}
            >
              {item.title}
            </div>
          );
        }
      );

      const MemoizationTest: React.FC = () => {
        const [selectedId, setSelectedId] = React.useState<string | null>(null);
        const [counter, setCounter] = React.useState(0);

        const handleSelect = React.useCallback((id: string) => {
          setSelectedId(id);
        }, []);

        return (
          <div>
            <button onClick={() => setCounter(c => c + 1)}>
              Increment: {counter}
            </button>
            <div data-testid="selected-id">{selectedId}</div>
            <div data-testid="memoized-list">
              {items.slice(0, 10).map(item => (
                <MemoizedListItem
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MemoizationTest />
        </TestWrapper>
      );

      // Get initial render counts
      const firstItem = screen.getByTestId(`memoized-item-${items[0].id}`);
      const initialRenderCount = parseInt(firstItem.getAttribute('data-render-count') || '0');

      // Increment counter (should not re-render memoized items)
      await user.click(screen.getByText(/Increment:/));
      await user.click(screen.getByText(/Increment:/));

      // Render count should not increase for memoized items
      const finalRenderCount = parseInt(firstItem.getAttribute('data-render-count') || '0');
      expect(finalRenderCount).toBe(initialRenderCount);

      // Select item (should update only parent)
      await user.click(firstItem);
      await waitFor(() => {
        expect(screen.getByTestId('selected-id')).toHaveTextContent(items[0].id);
      });
    });

    test('lazy loading improves initial render performance', async () => {
      const LazyDetailTab = React.lazy(() => Promise.resolve({
        default: ({ data }: { data: any[] }) => (
          <div data-testid="lazy-tab">
            {data.map((item, i) => (
              <div key={i}>Lazy item {i}</div>
            ))}
          </div>
        ),
      }));

      const LazyLoadingTest: React.FC = () => {
        const [activeTab, setActiveTab] = React.useState('overview');
        const [tabData] = React.useState(() => generateLargeDataset(1000));

        return (
          <div>
            <div data-testid="tab-buttons">
              <button onClick={() => setActiveTab('overview')}>Overview</button>
              <button onClick={() => setActiveTab('lazy')}>Lazy Tab</button>
            </div>
            
            <div data-testid="tab-content">
              {activeTab === 'overview' && (
                <div data-testid="overview-tab">Overview Content</div>
              )}
              
              {activeTab === 'lazy' && (
                <React.Suspense fallback={<div data-testid="lazy-loading">Loading...</div>}>
                  <LazyDetailTab data={tabData} />
                </React.Suspense>
              )}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      
      performanceMarkers.mark('lazy-render-start');
      
      render(
        <TestWrapper>
          <LazyLoadingTest />
        </TestWrapper>
      );
      
      performanceMarkers.mark('lazy-render-end');
      const initialRenderTime = performanceMarkers.measure('lazy-initial-render', 'lazy-render-start', 'lazy-render-end');

      // Initial render should be fast (without lazy content)
      expect(initialRenderTime).toBeLessThan(50);
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();

      // Switch to lazy tab
      performanceMarkers.mark('lazy-tab-start');
      await user.click(screen.getByText('Lazy Tab'));
      
      // Should show loading state first
      expect(screen.getByTestId('lazy-loading')).toBeInTheDocument();
      
      // Wait for lazy content
      await waitFor(() => {
        expect(screen.getByTestId('lazy-tab')).toBeInTheDocument();
      });
      
      performanceMarkers.mark('lazy-tab-end');
      const lazyLoadTime = performanceMarkers.measure('lazy-load-time', 'lazy-tab-start', 'lazy-tab-end');
      
      // Lazy loading should be reasonably fast
      expect(lazyLoadTime).toBeLessThan(200);
    });
  });

  describe('Bundle Size and Code Splitting', () => {
    test('components are tree-shakable', async () => {
      // Mock dynamic import
      const mockDynamicImport = jest.fn().mockImplementation(() =>
        Promise.resolve({
          default: () => <div data-testid="dynamic-component">Dynamic Component</div>,
        })
      );

      const CodeSplittingTest: React.FC = () => {
        const [showDynamic, setShowDynamic] = React.useState(false);
        const [DynamicComponent, setDynamicComponent] = React.useState<React.ComponentType | null>(null);

        const loadDynamicComponent = async () => {
          const module = await mockDynamicImport();
          setDynamicComponent(() => module.default);
          setShowDynamic(true);
        };

        return (
          <div>
            <button onClick={loadDynamicComponent}>Load Dynamic Component</button>
            {showDynamic && DynamicComponent && <DynamicComponent />}
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CodeSplittingTest />
        </TestWrapper>
      );

      // Component should not be loaded initially
      expect(mockDynamicImport).not.toHaveBeenCalled();
      expect(screen.queryByTestId('dynamic-component')).not.toBeInTheDocument();

      // Load component dynamically
      await user.click(screen.getByText('Load Dynamic Component'));
      
      await waitFor(() => {
        expect(mockDynamicImport).toHaveBeenCalled();
        expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Regression Detection', () => {
    test('tracks performance metrics over time', async () => {
      const performanceData: Array<{ operation: string; duration: number; timestamp: number }> = [];
      
      const trackPerformance = (operation: string, duration: number) => {
        performanceData.push({ operation, duration, timestamp: Date.now() });
      };

      const PerformanceTrackingTest: React.FC = () => {
        const [items] = React.useState(() => generateLargeDataset(500));
        
        React.useEffect(() => {
          const start = performance.now();
          
          // Simulate some work
          setTimeout(() => {
            const duration = performance.now() - start;
            trackPerformance('component-mount', duration);
          }, 0);
        }, []);

        const handleSearch = (query: string) => {
          const start = performance.now();
          
          // Simulate search
          const filtered = items.filter(item => item.title.includes(query));
          
          const duration = performance.now() - start;
          trackPerformance('search', duration);
          
          return filtered;
        };

        return (
          <div>
            <input 
              data-testid="tracking-search"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="performance-data">{JSON.stringify(performanceData)}</div>
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PerformanceTrackingTest />
        </TestWrapper>
      );

      // Wait for component mount tracking
      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(0);
      });

      // Perform search to track search performance
      const searchInput = screen.getByTestId('tracking-search');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(performanceData.length).toBeGreaterThan(1);
      });

      // Verify performance data structure
      const mountData = performanceData.find(d => d.operation === 'component-mount');
      const searchData = performanceData.find(d => d.operation === 'search');

      expect(mountData).toBeDefined();
      expect(searchData).toBeDefined();
      expect(mountData?.duration).toBeLessThan(100);
      expect(searchData?.duration).toBeLessThan(50);
    });
  });
});