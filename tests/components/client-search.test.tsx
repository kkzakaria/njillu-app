/**
 * Client Search component tests
 * Tests search functionality, filters, and advanced search features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientSearch } from '@/app/[locale]/clients/components/client-search';
import type { ClientSearchFilters } from '@/types/clients/views';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
}));

describe('ClientSearch', () => {
  const mockProps = {
    onSearch: jest.fn(),
    onFiltersChange: jest.fn(),
    loading: false,
    searchValue: '',
    filters: {} as ClientSearchFilters,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic search', () => {
    test('should render search input', () => {
      render(<ClientSearch {...mockProps} />);

      expect(screen.getByPlaceholderText('clients.search.placeholder')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    test('should call onSearch when typing', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(mockProps.onSearch).toHaveBeenCalledWith('john');
      });
    });

    test('should debounce search input', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      await user.type(searchInput, 'john');

      // Should not call immediately
      expect(mockProps.onSearch).not.toHaveBeenCalled();

      // Fast forward debounce time
      jest.advanceTimersByTime(300);

      expect(mockProps.onSearch).toHaveBeenCalledWith('john');

      jest.useRealTimers();
    });

    test('should show current search value', () => {
      render(<ClientSearch {...mockProps} searchValue="existing search" />);

      expect(screen.getByDisplayValue('existing search')).toBeInTheDocument();
    });

    test('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} searchValue="search term" />);

      const clearButton = screen.getByRole('button', { name: /clear.*search/i });
      await user.click(clearButton);

      expect(mockProps.onSearch).toHaveBeenCalledWith('');
    });

    test('should show loading state', () => {
      render(<ClientSearch {...mockProps} loading={true} />);

      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });
  });

  describe('filters panel', () => {
    test('should show filters button', () => {
      render(<ClientSearch {...mockProps} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });

    test('should open filters panel when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    });

    test('should show active filters count', () => {
      const filtersWithData: ClientSearchFilters = {
        status: ['active'],
        clientTypes: ['individual', 'business'],
        priorities: ['high']
      };

      render(<ClientSearch {...mockProps} filters={filtersWithData} />);

      expect(screen.getByText('3')).toBeInTheDocument(); // Badge showing active filter count
    });

    test('should render all filter categories', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('clients.filters.status')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.type')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.priority')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.risk')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.tags')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.dateRange')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.creditLimit')).toBeInTheDocument();
    });
  });

  describe('status filters', () => {
    test('should render status filter options', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.status.active')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.status.inactive')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.status.pending')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.status.suspended')).toBeInTheDocument();
    });

    test('should handle status filter selection', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.status.active'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        status: ['active']
      });
    });

    test('should show selected status filters', async () => {
      const user = userEvent.setup();
      const filtersWithStatus = { status: ['active', 'pending'] };
      
      render(<ClientSearch {...mockProps} filters={filtersWithStatus} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.status.active')).toBeChecked();
      expect(screen.getByLabelText('clients.status.pending')).toBeChecked();
      expect(screen.getByLabelText('clients.status.inactive')).not.toBeChecked();
    });
  });

  describe('client type filters', () => {
    test('should render client type filter options', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.type.individual')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.type.business')).toBeInTheDocument();
    });

    test('should handle client type selection', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.type.business'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        clientTypes: ['business']
      });
    });
  });

  describe('priority filters', () => {
    test('should render priority filter options', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.priority.high')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.priority.normal')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.priority.low')).toBeInTheDocument();
    });

    test('should handle priority selection', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.priority.high'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        priorities: ['high']
      });
    });
  });

  describe('risk level filters', () => {
    test('should render risk level filter options', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.risk.low')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.risk.medium')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.risk.high')).toBeInTheDocument();
    });

    test('should handle risk level selection', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.risk.medium'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        riskLevels: ['medium']
      });
    });
  });

  describe('tags filter', () => {
    test('should render tags input', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByPlaceholderText('clients.filters.tags.placeholder')).toBeInTheDocument();
    });

    test('should handle tag input', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      
      const tagInput = screen.getByPlaceholderText('clients.filters.tags.placeholder');
      await user.type(tagInput, 'vip, premium');
      await user.keyboard('{Enter}');

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        tags: ['vip', 'premium']
      });
    });

    test('should show selected tags as chips', async () => {
      const user = userEvent.setup();
      const filtersWithTags = { tags: ['vip', 'premium', 'corporate'] };
      
      render(<ClientSearch {...mockProps} filters={filtersWithTags} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('vip')).toBeInTheDocument();
      expect(screen.getByText('premium')).toBeInTheDocument();
      expect(screen.getByText('corporate')).toBeInTheDocument();
    });

    test('should remove tags when chip is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithTags = { tags: ['vip', 'premium'] };
      
      render(<ClientSearch {...mockProps} filters={filtersWithTags} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      
      const removeButton = within(screen.getByText('vip').closest('div')!).getByTestId('x-icon');
      await user.click(removeButton);

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        tags: ['premium']
      });
    });
  });

  describe('date range filters', () => {
    test('should render date range inputs', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.filters.createdAfter')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.filters.createdBefore')).toBeInTheDocument();
    });

    test('should handle date range selection', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const startDateInput = screen.getByLabelText('clients.filters.createdAfter');
      await user.type(startDateInput, '2024-01-01');

      const endDateInput = screen.getByLabelText('clients.filters.createdBefore');
      await user.type(endDateInput, '2024-12-31');

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        createdAfter: expect.any(Date),
        createdBefore: expect.any(Date)
      });
    });

    test('should show preset date ranges', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('clients.filters.datePresets.lastWeek')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.datePresets.lastMonth')).toBeInTheDocument();
      expect(screen.getByText('clients.filters.datePresets.lastYear')).toBeInTheDocument();
    });

    test('should apply preset date ranges', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByText('clients.filters.datePresets.lastMonth'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        createdAfter: expect.any(Date),
        createdBefore: expect.any(Date)
      });
    });
  });

  describe('credit limit filters', () => {
    test('should render credit limit range inputs', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText('clients.filters.creditLimitMin')).toBeInTheDocument();
      expect(screen.getByLabelText('clients.filters.creditLimitMax')).toBeInTheDocument();
    });

    test('should handle credit limit range input', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const minInput = screen.getByLabelText('clients.filters.creditLimitMin');
      await user.type(minInput, '10000');

      const maxInput = screen.getByLabelText('clients.filters.creditLimitMax');
      await user.type(maxInput, '50000');

      await waitFor(() => {
        expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
          creditLimitMin: 10000,
          creditLimitMax: 50000
        });
      });
    });

    test('should validate credit limit range', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const minInput = screen.getByLabelText('clients.filters.creditLimitMin');
      await user.type(minInput, '50000');

      const maxInput = screen.getByLabelText('clients.filters.creditLimitMax');
      await user.type(maxInput, '10000'); // Max less than min

      expect(screen.getByText('clients.filters.creditLimit.error')).toBeInTheDocument();
    });
  });

  describe('filter actions', () => {
    test('should clear all filters', async () => {
      const user = userEvent.setup();
      const filtersWithData: ClientSearchFilters = {
        status: ['active'],
        clientTypes: ['business'],
        priorities: ['high'],
        tags: ['vip']
      };

      render(<ClientSearch {...mockProps} filters={filtersWithData} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByRole('button', { name: /clear.*filters/i }));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({});
    });

    test('should apply filters and close panel', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.status.active'));
      await user.click(screen.getByRole('button', { name: /apply.*filters/i }));

      expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    });

    test('should show filter summary', async () => {
      const user = userEvent.setup();
      const filtersWithData: ClientSearchFilters = {
        status: ['active', 'pending'],
        clientTypes: ['business'],
        priorities: ['high'],
        tags: ['vip', 'premium']
      };

      render(<ClientSearch {...mockProps} filters={filtersWithData} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('clients.filters.summary.status')).toBeInTheDocument();
      expect(screen.getByText('2 selected')).toBeInTheDocument(); // Status count
      expect(screen.getByText('1 selected')).toBeInTheDocument(); // Client type count
    });
  });

  describe('saved searches', () => {
    test('should show saved searches dropdown', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} enableSavedSearches={true} />);

      expect(screen.getByRole('button', { name: /saved.*searches/i })).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /saved.*searches/i }));
      expect(screen.getByText('clients.search.saved.title')).toBeInTheDocument();
    });

    test('should save current search', async () => {
      const user = userEvent.setup();
      const onSaveSearch = jest.fn();
      
      render(
        <ClientSearch 
          {...mockProps} 
          enableSavedSearches={true}
          searchValue="john doe"
          filters={{ status: ['active'] }}
          onSaveSearch={onSaveSearch}
        />
      );

      await user.click(screen.getByRole('button', { name: /saved.*searches/i }));
      await user.click(screen.getByRole('button', { name: /save.*current/i }));

      const saveDialog = screen.getByRole('dialog');
      const nameInput = within(saveDialog).getByLabelText('clients.search.save.name');
      await user.type(nameInput, 'Active Johns');
      
      await user.click(within(saveDialog).getByRole('button', { name: /save/i }));

      expect(onSaveSearch).toHaveBeenCalledWith({
        name: 'Active Johns',
        query: 'john doe',
        filters: { status: ['active'] }
      });
    });

    test('should load saved search', async () => {
      const user = userEvent.setup();
      const savedSearches = [
        {
          id: '1',
          name: 'High Priority Clients',
          query: '',
          filters: { priorities: ['high'] }
        }
      ];

      render(
        <ClientSearch 
          {...mockProps} 
          enableSavedSearches={true}
          savedSearches={savedSearches}
        />
      );

      await user.click(screen.getByRole('button', { name: /saved.*searches/i }));
      await user.click(screen.getByText('High Priority Clients'));

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({ priorities: ['high'] });
      expect(mockProps.onSearch).toHaveBeenCalledWith('');
    });
  });

  describe('keyboard navigation', () => {
    test('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      // Ctrl+F should focus search input
      await user.keyboard('{Control>}f{/Control}');
      expect(screen.getByPlaceholderText('clients.search.placeholder')).toHaveFocus();

      // Ctrl+Shift+F should open filters
      await user.keyboard('{Control>}{Shift>}f{/Shift}{/Control}');
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();
    });

    test('should navigate through filters with keyboard', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      // Tab should navigate through filter options
      await user.tab();
      expect(screen.getByLabelText('clients.status.active')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('clients.status.inactive')).toHaveFocus();
    });

    test('should close filters panel with Escape key', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      expect(screen.getByTestId('filters-panel')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByTestId('filters-panel')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA labels', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      expect(searchInput).toHaveAttribute('aria-label', 'clients.search.ariaLabel');

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      expect(filtersButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(filtersButton);
      expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should have proper form labels', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const statusCheckboxes = screen.getAllByRole('checkbox');
      statusCheckboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('id');
        const label = checkbox.getAttribute('aria-labelledby');
        if (label) {
          expect(document.getElementById(label)).toBeInTheDocument();
        }
      });
    });

    test('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.click(screen.getByLabelText('clients.status.active'));

      expect(screen.getByRole('status')).toHaveTextContent('clients.filters.applied');
    });
  });

  describe('responsive design', () => {
    test('should adapt to mobile layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ClientSearch {...mockProps} />);

      expect(screen.getByTestId('mobile-search-layout')).toBeInTheDocument();
    });

    test('should stack filters vertically on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByTestId('mobile-filters-layout')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    test('should debounce search input to prevent excessive API calls', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'john');

      // Should not have called onSearch yet
      expect(mockProps.onSearch).not.toHaveBeenCalled();

      // Advance timer past debounce delay
      jest.advanceTimersByTime(300);

      // Should have called once with final value
      expect(mockProps.onSearch).toHaveBeenCalledTimes(1);
      expect(mockProps.onSearch).toHaveBeenCalledWith('john');

      jest.useRealTimers();
    });

    test('should debounce filter changes', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup();
      render(<ClientSearch {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const minCreditInput = screen.getByLabelText('clients.filters.creditLimitMin');
      await user.type(minCreditInput, '10000');

      // Should not call immediately
      expect(mockProps.onFiltersChange).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
        creditLimitMin: 10000
      });

      jest.useRealTimers();
    });
  });
});