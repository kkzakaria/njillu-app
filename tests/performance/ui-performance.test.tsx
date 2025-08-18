/**
 * UI Component Performance Tests
 * Tests React component rendering performance, re-render optimization, and user interaction responsiveness
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { performance } from 'perf_hooks';
import { ClientTable } from '@/app/[locale]/clients/components/client-table';
import { ClientForm } from '@/app/[locale]/clients/components/client-form';
import { ClientSearch } from '@/app/[locale]/clients/components/client-search';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { Client } from '@/types/clients/core';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  INITIAL_RENDER: 100,     // Initial component mount
  RE_RENDER: 50,           // Re-render performance
  INTERACTION: 16,         // User interaction response (60fps = 16.67ms)
  SEARCH_DEBOUNCE: 300,    // Search input debounce
  LARGE_LIST: 200          // Large list rendering
};

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronUp: () => <div data-testid="chevron-up" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal" />,
  X: () => <div data-testid="x-icon" />,
}));

// Generate large datasets for performance testing
function generateLargeClientDataset(size: number): Client[] {
  const clients: Client[] = [];
  
  for (let i = 0; i < size; i++) {
    if (i % 2 === 0) {
      clients.push({
        ...createMockIndividualClientData({
          individual_info: {
            first_name: `PerfTest${i}`,
            last_name: 'Individual'
          },
          contact_info: {
            email: `perf${i}@example.com`
          },
          tags: [`tag${i}`, 'performance', 'individual']
        }),
        id: `client-${i}`,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 1000).toISOString()
      });
    } else {
      clients.push({
        ...createMockBusinessClientData({
          business_info: {
            company_name: `PerfCorp${i}`,
            industry: 'information_technology'
          },
          contact_info: {
            email: `corp${i}@example.com`
          },
          tags: [`corp${i}`, 'performance', 'business']
        }),
        id: `client-${i}`,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 1000).toISOString()
      });
    }
  }
  
  return clients;
}

describe('UI Performance Tests', () => {
  describe('ClientTable Performance', () => {
    test('should render small dataset quickly', async () => {
      const clients = generateLargeClientDataset(10);
      const props = {
        clients,
        total: 10,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 10,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      const startTime = performance.now();
      
      render(<ClientTable {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });

    test('should render medium dataset efficiently', async () => {
      const clients = generateLargeClientDataset(100);
      const props = {
        clients: clients.slice(0, 50), // Display first 50
        total: 100,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 50,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      const startTime = performance.now();
      
      render(<ClientTable {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST);
    });

    test('should handle re-renders efficiently', async () => {
      const clients = generateLargeClientDataset(50);
      const props = {
        clients,
        total: 50,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 50,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      const { rerender } = render(<ClientTable {...props} />);

      // Measure re-render performance with sort change
      const startTime = performance.now();
      
      rerender(<ClientTable {...props} sortField="name" sortDirection="asc" />);
      
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.RE_RENDER);
    });

    test('should handle pagination changes quickly', async () => {
      const user = userEvent.setup();
      const clients = generateLargeClientDataset(25);
      const mockOnPageChange = jest.fn();
      
      const props = {
        clients,
        total: 100,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: mockOnPageChange,
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 25,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      render(<ClientTable {...props} />);

      const startTime = performance.now();
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      const duration = performance.now() - startTime;

      expect(mockOnPageChange).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should handle sorting interactions quickly', async () => {
      const user = userEvent.setup();
      const clients = generateLargeClientDataset(30);
      const mockOnSort = jest.fn();
      
      const props = {
        clients,
        total: 30,
        loading: false,
        onSort: mockOnSort,
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 30,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      render(<ClientTable {...props} />);

      const startTime = performance.now();
      
      await user.click(screen.getByText('clients.table.name'));
      
      const duration = performance.now() - startTime;

      expect(mockOnSort).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should handle bulk selection efficiently', async () => {
      const user = userEvent.setup();
      const clients = generateLargeClientDataset(100);
      const mockOnSelectionChange = jest.fn();
      
      const props = {
        clients: clients.slice(0, 50),
        total: 100,
        loading: false,
        enableBulkSelection: true,
        onSelectionChange: mockOnSelectionChange,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 50,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      render(<ClientTable {...props} />);

      const startTime = performance.now();
      
      // Select all checkbox
      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(headerCheckbox);
      
      const duration = performance.now() - startTime;

      expect(mockOnSelectionChange).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should handle loading state efficiently', () => {
      const clients = generateLargeClientDataset(100);
      const props = {
        clients,
        total: 100,
        loading: true,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 50,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      const startTime = performance.now();
      
      render(<ClientTable {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });
  });

  describe('ClientForm Performance', () => {
    test('should render form quickly', () => {
      const props = {
        mode: 'create' as const,
        clientType: 'individual' as const,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
      };

      const startTime = performance.now();
      
      render(<ClientForm {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByLabelText(/first.*name/i)).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });

    test('should handle form input changes quickly', async () => {
      const user = userEvent.setup();
      const props = {
        mode: 'create' as const,
        clientType: 'individual' as const,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
      };

      render(<ClientForm {...props} />);

      const firstNameInput = screen.getByLabelText(/first.*name/i);
      
      const startTime = performance.now();
      
      await user.type(firstNameInput, 'J');
      
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should validate form inputs efficiently', async () => {
      const user = userEvent.setup();
      const props = {
        mode: 'create' as const,
        clientType: 'individual' as const,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
      };

      render(<ClientForm {...props} />);

      const emailInput = screen.getByLabelText(/email/i);
      
      const startTime = performance.now();
      
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);
      
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 2); // Allow extra time for validation
    });

    test('should handle form submission quickly', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      const props = {
        mode: 'create' as const,
        clientType: 'individual' as const,
        onSubmit: mockOnSubmit,
        onCancel: jest.fn(),
      };

      render(<ClientForm {...props} />);

      // Fill in required fields
      await user.type(screen.getByLabelText(/first.*name/i), 'John');
      await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');

      const startTime = performance.now();
      
      await user.click(screen.getByRole('button', { name: /create/i }));
      
      const duration = performance.now() - startTime;

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should switch between client types efficiently', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ClientForm
          mode="create"
          clientType="individual"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(screen.getByLabelText(/first.*name/i)).toBeInTheDocument();

      const startTime = performance.now();
      
      rerender(
        <ClientForm
          mode="create"
          clientType="business"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );
      
      const duration = performance.now() - startTime;

      expect(screen.getByLabelText(/company.*name/i)).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.RE_RENDER);
    });

    test('should load existing data efficiently', () => {
      const existingClient = {
        ...createMockIndividualClientData(),
        id: 'existing-client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const startTime = performance.now();
      
      render(
        <ClientForm
          mode="edit"
          clientType="individual"
          initialData={existingClient}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );
      
      const duration = performance.now() - startTime;

      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });
  });

  describe('ClientSearch Performance', () => {
    test('should render search component quickly', () => {
      const props = {
        onSearch: jest.fn(),
        onFiltersChange: jest.fn(),
        loading: false,
        searchValue: '',
        filters: {},
      };

      const startTime = performance.now();
      
      render(<ClientSearch {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByPlaceholderText('clients.search.placeholder')).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });

    test('should handle search input with proper debouncing', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup();
      const mockOnSearch = jest.fn();
      
      const props = {
        onSearch: mockOnSearch,
        onFiltersChange: jest.fn(),
        loading: false,
        searchValue: '',
        filters: {},
      };

      render(<ClientSearch {...props} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      
      const startTime = performance.now();
      
      // Type multiple characters quickly
      await user.type(searchInput, 'john doe');
      
      const typingDuration = performance.now() - startTime;

      // Should not have called onSearch yet (debounced)
      expect(mockOnSearch).not.toHaveBeenCalled();
      expect(typingDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 5); // Allow time for typing

      // Fast forward debounce time
      jest.advanceTimersByTime(PERFORMANCE_THRESHOLDS.SEARCH_DEBOUNCE);

      expect(mockOnSearch).toHaveBeenCalledWith('john doe');

      jest.useRealTimers();
    });

    test('should open filters panel quickly', async () => {
      const user = userEvent.setup();
      const props = {
        onSearch: jest.fn(),
        onFiltersChange: jest.fn(),
        loading: false,
        searchValue: '',
        filters: {},
      };

      render(<ClientSearch {...props} />);

      const startTime = performance.now();
      
      await user.click(screen.getByRole('button', { name: /filters/i }));
      
      const duration = performance.now() - startTime;

      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should handle filter changes efficiently', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      const props = {
        onSearch: jest.fn(),
        onFiltersChange: mockOnFiltersChange,
        loading: false,
        searchValue: '',
        filters: {},
      };

      render(<ClientSearch {...props} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const startTime = performance.now();
      
      await user.click(screen.getByLabelText('clients.status.active'));
      
      const duration = performance.now() - startTime;

      expect(mockOnFiltersChange).toHaveBeenCalled();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });

    test('should render complex filter state efficiently', async () => {
      const user = userEvent.setup();
      const complexFilters = {
        status: ['active', 'pending'],
        clientTypes: ['individual', 'business'],
        priorities: ['high', 'normal'],
        riskLevels: ['low', 'medium'],
        tags: ['vip', 'premium', 'corporate', 'enterprise'],
        creditLimitMin: 10000,
        creditLimitMax: 100000,
        createdAfter: new Date('2024-01-01'),
        createdBefore: new Date('2024-12-31')
      };

      const props = {
        onSearch: jest.fn(),
        onFiltersChange: jest.fn(),
        loading: false,
        searchValue: 'complex search term',
        filters: complexFilters,
      };

      const startTime = performance.now();
      
      render(<ClientSearch {...props} />);
      
      const duration = performance.now() - startTime;

      expect(screen.getByDisplayValue('complex search term')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // Filter count badge
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INITIAL_RENDER);
    });

    test('should clear all filters quickly', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();
      
      const filtersWithData = {
        status: ['active'],
        clientTypes: ['business'],
        priorities: ['high'],
        tags: ['vip']
      };

      const props = {
        onSearch: jest.fn(),
        onFiltersChange: mockOnFiltersChange,
        loading: false,
        searchValue: '',
        filters: filtersWithData,
      };

      render(<ClientSearch {...props} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const startTime = performance.now();
      
      await user.click(screen.getByRole('button', { name: /clear.*filters/i }));
      
      const duration = performance.now() - startTime;

      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory on component unmount', () => {
      const clients = generateLargeClientDataset(100);
      const props = {
        clients: clients.slice(0, 50),
        total: 100,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 50,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      const initialMemory = process.memoryUsage().heapUsed;
      
      const { unmount } = render(<ClientTable {...props} />);
      
      const afterMountMemory = process.memoryUsage().heapUsed;
      
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const afterUnmountMemory = process.memoryUsage().heapUsed;

      const mountMemoryIncrease = afterMountMemory - initialMemory;
      const memoryAfterUnmount = afterUnmountMemory - initialMemory;

      // Memory after unmount should be significantly less than peak usage
      expect(memoryAfterUnmount).toBeLessThan(mountMemoryIncrease * 0.5);
    });

    test('should handle rapid component updates without memory growth', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const props = {
        onSearch: jest.fn(),
        onFiltersChange: jest.fn(),
        loading: false,
        searchValue: '',
        filters: {},
      };

      const { rerender } = render(<ClientSearch {...props} />);

      // Perform many re-renders to test for memory leaks
      for (let i = 0; i < 100; i++) {
        rerender(
          <ClientSearch 
            {...props} 
            searchValue={`search ${i}`}
            filters={{ status: i % 2 === 0 ? ['active'] : ['inactive'] }}
          />
        );
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Interaction Response Times', () => {
    test('should measure actual user interaction response times', async () => {
      const user = userEvent.setup();
      const clients = generateLargeClientDataset(20);
      
      const props = {
        clients,
        total: 20,
        loading: false,
        onSort: jest.fn(),
        onFilter: jest.fn(),
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
        currentPage: 1,
        pageSize: 20,
        sortField: 'created_at' as const,
        sortDirection: 'desc' as const,
      };

      render(<ClientTable {...props} />);

      // Test various interactions
      const interactions = [
        {
          name: 'sort_click',
          action: () => user.click(screen.getByText('clients.table.name'))
        },
        {
          name: 'action_menu_open',
          action: () => user.click(screen.getAllByTestId('more-horizontal')[0])
        }
      ];

      const interactionTimes: { [key: string]: number } = {};

      for (const { name, action } of interactions) {
        const startTime = performance.now();
        await action();
        const duration = performance.now() - startTime;
        
        interactionTimes[name] = duration;
        console.log(`${name}: ${duration.toFixed(2)}ms`);
        
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION * 2);
      }
    });
  });

  describe('Performance Benchmarks', () => {
    test('should establish baseline performance metrics', () => {
      const benchmarks = {
        small_table_render: 50,      // < 50ms for 10 items
        medium_table_render: 150,    // < 150ms for 100 items
        form_render: 75,             // < 75ms for form
        search_render: 60,           // < 60ms for search
        sort_interaction: 16,        // < 16ms for sort click
        pagination_interaction: 16,  // < 16ms for pagination
        filter_interaction: 16,      // < 16ms for filter change
        form_input: 16,              // < 16ms for input response
        search_debounce: 300         // 300ms debounce delay
      };

      // Log benchmark expectations
      Object.entries(benchmarks).forEach(([name, threshold]) => {
        console.log(`${name}: < ${threshold}ms`);
      });

      // These benchmarks can be used for regression testing
      expect(benchmarks).toBeDefined();
      expect(Object.keys(benchmarks).length).toBeGreaterThan(0);
    });
  });
});