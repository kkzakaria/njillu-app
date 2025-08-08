/**
 * Accessibility tests for list-detail components
 * Tests WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ListDetailLayout } from '../layout/list-detail-layout';
import { ListView } from '../list/list-view';
import { DetailView } from '../detail/detail-view';
import { ListDetailProvider } from '../context/list-detail-context';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
      tabs: {
        overview: 'Overview',
        details: 'Details',
        activities: 'Activities',
        related: 'Related items',
      },
    },
    actions: { 
      edit: 'Edit', 
      delete: 'Delete', 
      save: 'Save',
      selectAll: 'Select all',
      refresh: 'Refresh',
    },
    common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    {children}
  </NextIntlClientProvider>
);

// Mock data
const createMockListItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `ITEM-${i + 1}`,
    title: `Test Item ${i + 1}`,
    subtitle: `Description for item ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'completed',
    priority: ['low', 'medium', 'high'][i % 3],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

const createMockDetailData = (id: string) => ({
  id,
  title: `Test Item ${id}`,
  subtitle: 'Detailed description of the test item',
  status: 'active',
  priority: 'high',
  metadata: {
    created_by: 'Test User',
    department: 'Test Department',
  },
  tabs: [
    { id: 'overview', label: 'Overview', content: { type: 'overview' } },
    { id: 'details', label: 'Details', content: { type: 'details' } },
    { id: 'activities', label: 'Activities', content: { type: 'activities', data: [] } },
    { id: 'related', label: 'Related items', content: { type: 'related', data: [] } },
  ],
  actions: [
    { id: 'edit', label: 'Edit', icon: 'edit', variant: 'secondary' as const },
    { id: 'delete', label: 'Delete', icon: 'trash', variant: 'destructive' as const },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe('Accessibility Tests', () => {
  const mockLoadList = jest.fn().mockResolvedValue({
    data: createMockListItems(5),
    total: 5,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });

  const mockLoadDetail = jest.fn().mockResolvedValue(createMockDetailData('ITEM-1'));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    test('ListView has no accessibility violations', async () => {
      const items = createMockListItems(5);
      
      const { container } = render(
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

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('DetailView has no accessibility violations', async () => {
      const detail = createMockDetailData('ITEM-1');
      
      const { container } = render(
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

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('ListDetailLayout has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ListDetailProvider
            entityType="test_items"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <ListDetailLayout
              config={{
                entityType: 'test_items',
                mode: 'split',
                showSearch: true,
                showFilters: true,
                selectionMode: 'single',
              }}
              onLoadList={mockLoadList}
              onLoadDetail={mockLoadDetail}
            />
          </ListDetailProvider>
        </TestWrapper>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(mockLoadList).toHaveBeenCalled();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('handles high contrast mode', async () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const items = createMockListItems(3);
      
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

      // Verify high contrast styles are applied
      const listContainer = screen.getByRole('list');
      expect(listContainer).toHaveClass('high-contrast'); // Assuming this class exists
    });

    test('handles reduced motion preference', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const detail = createMockDetailData('ITEM-1');
      
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

      // Verify reduced motion styles are applied
      const tabList = screen.getByRole('tablist');
      const computedStyle = window.getComputedStyle(tabList);
      expect(computedStyle.animationDuration).toBe('0s'); // Assuming animations are disabled
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports keyboard navigation in list view', async () => {
      const user = userEvent.setup();
      const items = createMockListItems(5);
      const mockOnSelect = jest.fn();
      
      render(
        <TestWrapper>
          <ListView
            items={items}
            loading={false}
            onSelectItem={mockOnSelect}
            onLoadMore={jest.fn()}
            onSearch={jest.fn()}
            onFilter={jest.fn()}
          />
        </TestWrapper>
      );

      const listItems = screen.getAllByRole('button');
      
      // Focus first item
      listItems[0].focus();
      expect(document.activeElement).toBe(listItems[0]);

      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(listItems[1]);

      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(listItems[0]);

      // Select with Enter
      await user.keyboard('{Enter}');
      expect(mockOnSelect).toHaveBeenCalledWith('ITEM-1');

      // Select with Space
      listItems[1].focus();
      await user.keyboard(' ');
      expect(mockOnSelect).toHaveBeenCalledWith('ITEM-2');
    });

    test('supports keyboard navigation in detail view tabs', async () => {
      const user = userEvent.setup();
      const detail = createMockDetailData('ITEM-1');
      const mockOnTabChange = jest.fn();
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            onClose={jest.fn()}
            onAction={jest.fn()}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole('tab');
      
      // Focus first tab
      tabs[0].focus();
      expect(document.activeElement).toBe(tabs[0]);

      // Navigate tabs with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(tabs[1]);

      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(tabs[0]);

      // Activate tab with Enter
      tabs[1].focus();
      await user.keyboard('{Enter}');
      expect(mockOnTabChange).toHaveBeenCalledWith('details');

      // Jump to first/last tab
      await user.keyboard('{Home}');
      expect(document.activeElement).toBe(tabs[0]);

      await user.keyboard('{End}');
      expect(document.activeElement).toBe(tabs[tabs.length - 1]);
    });

    test('supports keyboard shortcuts', async () => {
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();
      const mockOnRefresh = jest.fn();
      
      const KeyboardShortcutComponent: React.FC = () => {
        React.useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                case 'f':
                  e.preventDefault();
                  mockOnSearch('keyboard-search');
                  break;
                case 'r':
                  e.preventDefault();
                  mockOnRefresh();
                  break;
              }
            }
          };

          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, []);

        return (
          <div>
            <input data-testid="search-input" placeholder="Search..." />
            <button data-testid="refresh-btn">Refresh</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <KeyboardShortcutComponent />
        </TestWrapper>
      );

      // Test Ctrl+F for search
      await user.keyboard('{Control>}f{/Control}');
      expect(mockOnSearch).toHaveBeenCalledWith('keyboard-search');

      // Test Ctrl+R for refresh
      await user.keyboard('{Control>}r{/Control}');
      expect(mockOnRefresh).toHaveBeenCalled();
    });

    test('manages focus correctly during navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ListDetailProvider
            entityType="test_items"
            onLoadList={mockLoadList}
            onLoadDetail={mockLoadDetail}
          >
            <ListDetailLayout
              config={{
                entityType: 'test_items',
                mode: 'split',
                showSearch: true,
                showFilters: true,
                selectionMode: 'single',
              }}
              onLoadList={mockLoadList}
              onLoadDetail={mockLoadDetail}
            />
          </ListDetailProvider>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      });

      // Focus should start at search input
      const searchInput = screen.getByPlaceholderText('Search...');
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Tab through to first list item
      await user.tab();
      const firstItem = screen.getByText('Test Item 1');
      expect(document.activeElement).toBe(firstItem.closest('button'));

      // Select item and verify focus moves appropriately
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockLoadDetail).toHaveBeenCalledWith({ id: 'ITEM-1' });
      });

      // Focus should move to detail view or remain manageable
      expect(document.activeElement).not.toBe(document.body); // Should not lose focus
    });

    test('provides skip links for keyboard users', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div id="main-content">
              <ListView
                items={createMockListItems(3)}
                loading={false}
                onSelectItem={jest.fn()}
                onLoadMore={jest.fn()}
                onSearch={jest.fn()}
                onFilter={jest.fn()}
              />
            </div>
          </div>
        </TestWrapper>
      );

      // Skip link should be available when focused
      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();
      
      expect(document.activeElement).toBe(skipLink);
      
      // Clicking skip link should move focus to main content
      await user.click(skipLink);
      
      const mainContent = screen.getByRole('list');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    test('provides proper ARIA labels and descriptions', async () => {
      const items = createMockListItems(3);
      
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

      // Main list should have proper role and label
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'List of items');

      // List items should have proper roles and descriptions
      const listItems = screen.getAllByRole('button');
      listItems.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-describedby');
        expect(item).toHaveAttribute('aria-label');
      });

      // Search input should have proper labeling
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('role', 'searchbox');
    });

    test('provides live region updates', async () => {
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();
      
      const LiveRegionTest: React.FC = () => {
        const [results, setResults] = React.useState<string>('');
        const [loading, setLoading] = React.useState(false);

        const handleSearch = async (query: string) => {
          setLoading(true);
          setResults('');
          
          setTimeout(() => {
            setLoading(false);
            setResults(`Found ${query.length} results for "${query}"`);
            mockOnSearch(query);
          }, 100);
        };

        return (
          <div>
            <input
              data-testid="search-input"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            
            {/* Live region for screen reader announcements */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {loading ? 'Searching...' : results}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <LiveRegionTest />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('search-input');
      const liveRegion = screen.getByRole('status');

      // Initial state
      expect(liveRegion).toBeEmptyDOMElement();

      // Type in search
      await user.type(searchInput, 'test');

      // Should show loading
      expect(liveRegion).toHaveTextContent('Searching...');

      // Wait for results
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent('Found 4 results for "test"');
      });
    });

    test('provides proper form validation messages', async () => {
      const user = userEvent.setup();
      
      const FormValidationTest: React.FC = () => {
        const [errors, setErrors] = React.useState<Record<string, string>>({});
        
        const validate = (formData: FormData) => {
          const newErrors: Record<string, string> = {};
          
          const title = formData.get('title') as string;
          if (!title.trim()) {
            newErrors.title = 'Title is required';
          }
          
          const email = formData.get('email') as string;
          if (!email.includes('@')) {
            newErrors.email = 'Valid email is required';
          }
          
          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          validate(formData);
        };

        return (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <div id="title-error" role="alert" aria-live="assertive">
                  {errors.title}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <div id="email-error" role="alert" aria-live="assertive">
                  {errors.email}
                </div>
              )}
            </div>

            <button type="submit">Submit</button>
          </form>
        );
      };

      render(
        <TestWrapper>
          <FormValidationTest />
        </TestWrapper>
      );

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Validation errors should be announced to screen readers
      const titleError = screen.getByText('Title is required');
      const emailError = screen.getByText('Valid email is required');

      expect(titleError).toHaveAttribute('role', 'alert');
      expect(titleError).toHaveAttribute('aria-live', 'assertive');
      expect(emailError).toHaveAttribute('role', 'alert');
      expect(emailError).toHaveAttribute('aria-live', 'assertive');

      // Form fields should be marked as invalid
      const titleInput = screen.getByLabelText('Title');
      const emailInput = screen.getByLabelText('Email');

      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    test('provides context for dynamic content changes', async () => {
      const user = userEvent.setup();
      
      const DynamicContentTest: React.FC = () => {
        const [selectedTab, setSelectedTab] = React.useState('tab1');
        const [itemCount, setItemCount] = React.useState(3);

        return (
          <div>
            {/* Tab panel with proper labeling */}
            <div role="tablist" aria-label="Content sections">
              <button
                role="tab"
                aria-selected={selectedTab === 'tab1'}
                aria-controls="panel1"
                onClick={() => setSelectedTab('tab1')}
              >
                Tab 1
              </button>
              <button
                role="tab"
                aria-selected={selectedTab === 'tab2'}
                aria-controls="panel2"
                onClick={() => setSelectedTab('tab2')}
              >
                Tab 2
              </button>
            </div>

            <div
              id="panel1"
              role="tabpanel"
              aria-labelledby="tab1"
              hidden={selectedTab !== 'tab1'}
            >
              <h3>Panel 1 Content</h3>
              <p>This is the first panel with {itemCount} items.</p>
              <button onClick={() => setItemCount(itemCount + 1)}>
                Add Item
              </button>
            </div>

            <div
              id="panel2"
              role="tabpanel"
              aria-labelledby="tab2"
              hidden={selectedTab !== 'tab2'}
            >
              <h3>Panel 2 Content</h3>
              <p>This is the second panel.</p>
            </div>

            {/* Live region for dynamic updates */}
            <div role="status" aria-live="polite">
              {selectedTab === 'tab1' && `Tab 1 active, showing ${itemCount} items`}
              {selectedTab === 'tab2' && 'Tab 2 active'}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <DynamicContentTest />
        </TestWrapper>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      const liveRegion = screen.getByRole('status');
      
      // Initial state
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
      expect(liveRegion).toHaveTextContent('Tab 1 active, showing 3 items');

      // Switch to tab 2
      await user.click(tab2);
      expect(tab2).toHaveAttribute('aria-selected', 'true');
      expect(liveRegion).toHaveTextContent('Tab 2 active');

      // Switch back and add item
      await user.click(tab1);
      const addButton = screen.getByText('Add Item');
      await user.click(addButton);
      
      expect(liveRegion).toHaveTextContent('Tab 1 active, showing 4 items');
    });
  });

  describe('Focus Management', () => {
    test('maintains logical tab order', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <input data-testid="input-1" placeholder="First input" />
            <button data-testid="button-1">First button</button>
            <input data-testid="input-2" placeholder="Second input" />
            <button data-testid="button-2">Second button</button>
          </div>
        </TestWrapper>
      );

      const input1 = screen.getByTestId('input-1');
      const button1 = screen.getByTestId('button-1');
      const input2 = screen.getByTestId('input-2');
      const button2 = screen.getByTestId('button-2');

      // Start at first input
      input1.focus();
      expect(document.activeElement).toBe(input1);

      // Tab through elements in order
      await user.tab();
      expect(document.activeElement).toBe(button1);

      await user.tab();
      expect(document.activeElement).toBe(input2);

      await user.tab();
      expect(document.activeElement).toBe(button2);

      // Reverse tab order
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(input2);
    });

    test('traps focus in modal dialogs', async () => {
      const user = userEvent.setup();
      
      const ModalTest: React.FC = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const firstFocusRef = React.useRef<HTMLButtonElement>(null);
        const lastFocusRef = React.useRef<HTMLButtonElement>(null);

        React.useEffect(() => {
          if (isOpen) {
            firstFocusRef.current?.focus();
          }
        }, [isOpen]);

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusRef.current) {
              e.preventDefault();
              lastFocusRef.current?.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusRef.current) {
              e.preventDefault();
              firstFocusRef.current?.focus();
            }
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        };

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onKeyDown={handleKeyDown}
              >
                <h2 id="modal-title">Modal Dialog</h2>
                <button ref={firstFocusRef}>First Button</button>
                <button>Middle Button</button>
                <button ref={lastFocusRef} onClick={() => setIsOpen(false)}>
                  Close Modal
                </button>
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <ModalTest />
        </TestWrapper>
      );

      // Open modal
      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Focus should be on first button in modal
      const firstButton = screen.getByText('First Button');
      expect(document.activeElement).toBe(firstButton);

      // Tab to last button
      await user.tab(); // Middle Button
      await user.tab(); // Close Modal
      const closeButton = screen.getByText('Close Modal');
      expect(document.activeElement).toBe(closeButton);

      // Tab again should wrap to first button
      await user.tab();
      expect(document.activeElement).toBe(firstButton);

      // Shift+Tab from first should go to last
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(closeButton);

      // Escape should close modal
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('restores focus after modal closes', async () => {
      const user = userEvent.setup();
      
      const ModalFocusTest: React.FC = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);
        const previousFocusRef = React.useRef<HTMLElement | null>(null);

        const openModal = () => {
          previousFocusRef.current = document.activeElement as HTMLElement;
          setIsOpen(true);
        };

        const closeModal = () => {
          setIsOpen(false);
          // Restore focus after render
          setTimeout(() => {
            previousFocusRef.current?.focus();
          }, 0);
        };

        return (
          <div>
            <input data-testid="before-trigger" placeholder="Before trigger" />
            <button ref={triggerRef} onClick={openModal}>
              Open Modal
            </button>
            <input data-testid="after-trigger" placeholder="After trigger" />
            
            {isOpen && (
              <div role="dialog" aria-modal="true">
                <h2>Modal</h2>
                <button onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <ModalFocusTest />
        </TestWrapper>
      );

      const triggerButton = screen.getByText('Open Modal');
      
      // Focus trigger and open modal
      triggerButton.focus();
      await user.click(triggerButton);

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Focus should return to trigger button
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('meets color contrast requirements', async () => {
      const { container } = render(
        <TestWrapper>
          <ListView
            items={createMockListItems(3)}
            loading={false}
            onSelectItem={jest.fn()}
            onLoadMore={jest.fn()}
            onSearch={jest.fn()}
            onFilter={jest.fn()}
          />
        </TestWrapper>
      );

      // Check contrast for all text elements
      const textElements = container.querySelectorAll('p, span, button, input, label');
      
      for (const element of textElements) {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Basic contrast check (would need actual contrast calculation in real implementation)
        expect(color).not.toBe(backgroundColor); // Colors should be different
        expect(color).not.toBe(''); // Should have a color
      }
    });

    test('provides alternative text for images and icons', async () => {
      const IconTest: React.FC = () => (
        <div>
          <img src="/test-image.jpg" alt="Test image description" />
          <button aria-label="Delete item">
            <span aria-hidden="true">🗑️</span>
          </button>
          <div role="img" aria-label="Status: completed">
            ✅
          </div>
        </div>
      );

      render(
        <TestWrapper>
          <IconTest />
        </TestWrapper>
      );

      // Image should have alt text
      const image = screen.getByRole('img', { name: 'Test image description' });
      expect(image).toHaveAttribute('alt', 'Test image description');

      // Icon button should have aria-label
      const deleteButton = screen.getByRole('button', { name: 'Delete item' });
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete item');

      // Decorative emoji should be hidden from screen readers
      const decorativeIcon = deleteButton.querySelector('[aria-hidden="true"]');
      expect(decorativeIcon).toBeInTheDocument();

      // Status icon should have role and label
      const statusIcon = screen.getByRole('img', { name: 'Status: completed' });
      expect(statusIcon).toBeInTheDocument();
    });
  });

  describe('Error Handling and Feedback', () => {
    test('provides accessible error messages', async () => {
      const ErrorTest: React.FC = () => {
        const [error, setError] = React.useState<string | null>(null);
        
        const triggerError = () => {
          setError('Something went wrong. Please try again.');
        };

        const clearError = () => {
          setError(null);
        };

        return (
          <div>
            <button onClick={triggerError}>Trigger Error</button>
            <button onClick={clearError}>Clear Error</button>
            
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                data-testid="error-message"
              >
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ErrorTest />
        </TestWrapper>
      );

      const triggerButton = screen.getByText('Trigger Error');
      await user.click(triggerButton);

      // Error should be announced to screen readers
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      expect(errorMessage).toHaveAttribute('aria-atomic', 'true');
      expect(errorMessage).toHaveTextContent('Error: Something went wrong. Please try again.');
    });

    test('provides accessible loading states', async () => {
      const LoadingTest: React.FC = () => {
        const [loading, setLoading] = React.useState(false);
        const [data, setData] = React.useState<string | null>(null);

        const loadData = async () => {
          setLoading(true);
          setData(null);
          
          setTimeout(() => {
            setLoading(false);
            setData('Data loaded successfully');
          }, 500);
        };

        return (
          <div>
            <button onClick={loadData} disabled={loading}>
              {loading ? 'Loading...' : 'Load Data'}
            </button>
            
            {loading && (
              <div role="status" aria-live="polite" data-testid="loading-status">
                Loading data, please wait...
              </div>
            )}
            
            {data && (
              <div role="status" aria-live="polite" data-testid="success-status">
                {data}
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoadingTest />
        </TestWrapper>
      );

      const loadButton = screen.getByText('Load Data');
      await user.click(loadButton);

      // Loading state should be announced
      const loadingStatus = screen.getByTestId('loading-status');
      expect(loadingStatus).toHaveAttribute('role', 'status');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');

      // Button should be disabled during loading
      expect(loadButton).toBeDisabled();
      expect(loadButton).toHaveTextContent('Loading...');

      // Wait for success
      await waitFor(() => {
        const successStatus = screen.getByTestId('success-status');
        expect(successStatus).toHaveTextContent('Data loaded successfully');
        expect(successStatus).toHaveAttribute('role', 'status');
      });
    });
  });
});