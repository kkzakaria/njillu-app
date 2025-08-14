/**
 * Client Table component tests
 * Tests data display, sorting, filtering, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientTable } from '@/app/[locale]/clients/components/client-table';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { Client } from '@/types/clients/core';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ChevronUp: () => <div data-testid="chevron-up" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal" />,
  Eye: () => <div data-testid="eye-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

describe('ClientTable', () => {
  const mockClients: Client[] = [
    {
      ...createMockIndividualClientData({
        individual_info: {
          first_name: 'John',
          last_name: 'Doe',
          profession: 'Software Developer'
        },
        contact_info: {
          email: 'john.doe@example.com',
          phone: '+33123456789'
        },
        status: 'active',
        commercial_info: {
          priority: 'normal',
          credit_limit: 10000
        },
        tags: ['individual', 'tech']
      }),
      id: 'client-1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      ...createMockBusinessClientData({
        business_info: {
          company_name: 'Tech Corp Ltd',
          industry: 'information_technology'
        },
        contact_info: {
          email: 'contact@techcorp.com',
          phone: '+33987654321'
        },
        status: 'active',
        commercial_info: {
          priority: 'high',
          credit_limit: 50000
        },
        tags: ['business', 'enterprise']
      }),
      id: 'client-2',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-16T14:30:00Z'
    }
  ];

  const mockProps = {
    clients: mockClients,
    total: 2,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('should render table with client data', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp Ltd')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('contact@techcorp.com')).toBeInTheDocument();
    });

    test('should render table headers', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByText('clients.table.name')).toBeInTheDocument();
      expect(screen.getByText('clients.table.type')).toBeInTheDocument();
      expect(screen.getByText('clients.table.email')).toBeInTheDocument();
      expect(screen.getByText('clients.table.status')).toBeInTheDocument();
      expect(screen.getByText('clients.table.priority')).toBeInTheDocument();
      expect(screen.getByText('clients.table.created')).toBeInTheDocument();
      expect(screen.getByText('clients.table.actions')).toBeInTheDocument();
    });

    test('should display correct client types', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByText('clients.type.individual')).toBeInTheDocument();
      expect(screen.getByText('clients.type.business')).toBeInTheDocument();
    });

    test('should display status badges', () => {
      render(<ClientTable {...mockProps} />);

      const statusElements = screen.getAllByText('clients.status.active');
      expect(statusElements).toHaveLength(2);
    });

    test('should display priority indicators', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByText('clients.priority.normal')).toBeInTheDocument();
      expect(screen.getByText('clients.priority.high')).toBeInTheDocument();
    });

    test('should format dates correctly', () => {
      render(<ClientTable {...mockProps} />);

      // Check that dates are displayed (format may vary based on implementation)
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    test('should display client tags', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByText('individual')).toBeInTheDocument();
      expect(screen.getByText('tech')).toBeInTheDocument();
      expect(screen.getByText('business')).toBeInTheDocument();
      expect(screen.getByText('enterprise')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    test('should show loading skeleton when loading', () => {
      render(<ClientTable {...mockProps} loading={true} />);

      expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('should show loading rows with correct count', () => {
      render(<ClientTable {...mockProps} loading={true} pageSize={5} />);

      const skeletonRows = screen.getAllByTestId('skeleton-row');
      expect(skeletonRows).toHaveLength(5);
    });
  });

  describe('empty state', () => {
    test('should show empty state when no clients', () => {
      render(<ClientTable {...mockProps} clients={[]} total={0} />);

      expect(screen.getByTestId('empty-clients-state')).toBeInTheDocument();
      expect(screen.getByText('clients.table.empty.title')).toBeInTheDocument();
      expect(screen.getByText('clients.table.empty.description')).toBeInTheDocument();
    });

    test('should show create button in empty state', () => {
      render(<ClientTable {...mockProps} clients={[]} total={0} />);

      expect(screen.getByRole('button', { name: /create.*client/i })).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    test('should show sort indicators in headers', () => {
      render(<ClientTable {...mockProps} />);

      // Should show sort indicator for currently sorted column
      const sortedHeader = screen.getByText('clients.table.created');
      expect(within(sortedHeader.closest('th')!).getByTestId('chevron-down')).toBeInTheDocument();
    });

    test('should call onSort when clicking sortable headers', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      await user.click(screen.getByText('clients.table.name'));

      expect(mockProps.onSort).toHaveBeenCalledWith('name', 'asc');
    });

    test('should toggle sort direction on repeated clicks', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} sortField="name" sortDirection="asc" />);

      await user.click(screen.getByText('clients.table.name'));

      expect(mockProps.onSort).toHaveBeenCalledWith('name', 'desc');
    });

    test('should show correct sort indicators for different directions', () => {
      const { rerender } = render(<ClientTable {...mockProps} sortField="name" sortDirection="asc" />);

      const nameHeader = screen.getByText('clients.table.name');
      expect(within(nameHeader.closest('th')!).getByTestId('chevron-up')).toBeInTheDocument();

      rerender(<ClientTable {...mockProps} sortField="name" sortDirection="desc" />);
      expect(within(nameHeader.closest('th')!).getByTestId('chevron-down')).toBeInTheDocument();
    });
  });

  describe('row actions', () => {
    test('should show action menu for each row', () => {
      render(<ClientTable {...mockProps} />);

      const actionButtons = screen.getAllByTestId('more-horizontal');
      expect(actionButtons).toHaveLength(2);
    });

    test('should open action menu on click', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      await user.click(firstActionButton);

      expect(screen.getByText('clients.actions.view')).toBeInTheDocument();
      expect(screen.getByText('clients.actions.edit')).toBeInTheDocument();
      expect(screen.getByText('clients.actions.delete')).toBeInTheDocument();
    });

    test('should navigate to client view on view action', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      await user.click(firstActionButton);
      await user.click(screen.getByText('clients.actions.view'));

      expect(mockPush).toHaveBeenCalledWith('/clients/client-1');
    });

    test('should navigate to client edit on edit action', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      await user.click(firstActionButton);
      await user.click(screen.getByText('clients.actions.edit'));

      expect(mockPush).toHaveBeenCalledWith('/clients/client-1/edit');
    });

    test('should show delete confirmation modal on delete action', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      await user.click(firstActionButton);
      await user.click(screen.getByText('clients.actions.delete'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('clients.delete.confirm.title')).toBeInTheDocument();
    });
  });

  describe('bulk selection', () => {
    test('should show checkboxes when bulk selection is enabled', () => {
      render(<ClientTable {...mockProps} enableBulkSelection={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    test('should select all items with header checkbox', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();
      
      render(
        <ClientTable 
          {...mockProps} 
          enableBulkSelection={true}
          onSelectionChange={onSelectionChange}
        />
      );

      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(headerCheckbox);

      expect(onSelectionChange).toHaveBeenCalledWith(['client-1', 'client-2']);
    });

    test('should select individual items', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();
      
      render(
        <ClientTable 
          {...mockProps} 
          enableBulkSelection={true}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First client checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(['client-1']);
    });

    test('should show bulk actions when items are selected', async () => {
      const user = userEvent.setup();
      
      render(
        <ClientTable 
          {...mockProps} 
          enableBulkSelection={true}
          selectedIds={['client-1']}
        />
      );

      expect(screen.getByText('clients.bulk.selected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bulk.*actions/i })).toBeInTheDocument();
    });

    test('should show correct selected count', () => {
      render(
        <ClientTable 
          {...mockProps} 
          enableBulkSelection={true}
          selectedIds={['client-1', 'client-2']}
        />
      );

      expect(screen.getByText('2 clients.bulk.selected')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    const paginationProps = {
      ...mockProps,
      total: 100,
      currentPage: 2,
      pageSize: 10
    };

    test('should show pagination controls', () => {
      render(<ClientTable {...paginationProps} />);

      expect(screen.getByText('clients.pagination.showing')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    test('should show correct page information', () => {
      render(<ClientTable {...paginationProps} />);

      expect(screen.getByText(/11.*20.*100/)).toBeInTheDocument();
    });

    test('should call onPageChange when clicking page buttons', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...paginationProps} />);

      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(mockProps.onPageChange).toHaveBeenCalledWith(3);
    });

    test('should show page size selector', () => {
      render(<ClientTable {...paginationProps} />);

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    test('should call onPageSizeChange when changing page size', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...paginationProps} />);

      await user.selectOptions(screen.getByDisplayValue('10'), '25');

      expect(mockProps.onPageSizeChange).toHaveBeenCalledWith(25);
    });

    test('should disable previous button on first page', () => {
      render(<ClientTable {...mockProps} currentPage={1} />);

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    test('should disable next button on last page', () => {
      render(<ClientTable {...mockProps} total={20} currentPage={2} pageSize={10} />);

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  describe('filtering', () => {
    test('should show filter button', () => {
      render(<ClientTable {...mockProps} />);

      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });

    test('should open filter panel on filter button click', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /filter/i }));

      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    test('should show active filter indicators', () => {
      const filtersProps = {
        ...mockProps,
        activeFilters: {
          status: ['active'],
          clientTypes: ['individual']
        }
      };

      render(<ClientTable {...filtersProps} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Filter count badge
    });

    test('should clear filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const filtersProps = {
        ...mockProps,
        activeFilters: {
          status: ['active']
        }
      };

      render(<ClientTable {...filtersProps} />);

      await user.click(screen.getByRole('button', { name: /clear.*filters/i }));

      expect(mockProps.onFilter).toHaveBeenCalledWith({});
    });
  });

  describe('search functionality', () => {
    test('should show search input', () => {
      render(<ClientTable {...mockProps} enableSearch={true} />);

      expect(screen.getByPlaceholderText('clients.search.placeholder')).toBeInTheDocument();
    });

    test('should call onSearch when typing in search input', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      
      render(<ClientTable {...mockProps} enableSearch={true} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('john');
      });
    });

    test('should debounce search input', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      
      render(<ClientTable {...mockProps} enableSearch={true} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText('clients.search.placeholder');
      await user.type(searchInput, 'john');

      // Should not call immediately
      expect(onSearch).not.toHaveBeenCalled();

      // Should call after debounce delay
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('john');
      }, { timeout: 1000 });
    });
  });

  describe('responsive design', () => {
    test('should adapt layout for mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ClientTable {...mockProps} />);

      expect(screen.getByTestId('mobile-client-list')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('should show desktop table for larger screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<ClientTable {...mockProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-client-list')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('should have proper table structure', () => {
      render(<ClientTable {...mockProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(within(table).getByRole('rowgroup')).toBeInTheDocument(); // thead or tbody
    });

    test('should have accessible sort buttons', () => {
      render(<ClientTable {...mockProps} />);

      const nameHeader = screen.getByText('clients.table.name');
      const sortButton = nameHeader.closest('button');
      
      expect(sortButton).toHaveAttribute('aria-sort');
    });

    test('should have accessible action menus', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      const actionButton = screen.getAllByRole('button', { name: /more.*actions/i })[0];
      expect(actionButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(actionButton);
      expect(actionButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ClientTable {...mockProps} />);

      // Tab to first action button
      await user.tab();
      await user.tab();
      
      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      expect(firstActionButton).toHaveFocus();

      // Enter should open menu
      await user.keyboard('{Enter}');
      expect(screen.getByText('clients.actions.view')).toBeInTheDocument();
    });

    test('should have proper ARIA labels', () => {
      render(<ClientTable {...mockProps} enableBulkSelection={true} />);

      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      expect(headerCheckbox).toHaveAttribute('aria-label', expect.stringContaining('select all'));

      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
      rowCheckboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAttribute('aria-label', expect.stringContaining(`select client`));
      });
    });
  });

  describe('error handling', () => {
    test('should handle missing client data gracefully', () => {
      const clientsWithMissingData = [
        {
          ...mockClients[0],
          individual_info: undefined,
          contact_info: { email: '' }
        }
      ] as any;

      render(<ClientTable {...mockProps} clients={clientsWithMissingData} />);

      // Should still render without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('should handle action errors gracefully', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      
      render(<ClientTable {...mockProps} onError={onError} />);

      // Simulate an action that would cause an error
      const firstActionButton = screen.getAllByTestId('more-horizontal')[0];
      await user.click(firstActionButton);

      // Mock navigation error
      mockPush.mockRejectedValueOnce(new Error('Navigation failed'));

      await user.click(screen.getByText('clients.actions.view'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});