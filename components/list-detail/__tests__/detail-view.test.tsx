/**
 * Unit tests for DetailView component
 * Tests detail rendering, tab navigation, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { axe } from 'jest-axe';
import { DetailView } from '../detail/detail-view';
import { ListDetailProvider } from '../context/list-detail-context';
import type { DetailViewData, EntityType } from '../types';

// Mock translation messages
const mockMessages = {
  'list-detail': {
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
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      share: 'Share',
      export: 'Export',
    },
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

// Mock data factory
const createMockBLDetail = (id: string): DetailViewData<any> => ({
  id,
  title: `Bill of Lading ${id}`,
  subtitle: 'COSCO SHIPPING UNIVERSE - Shanghai to Le Havre',
  status: 'in_transit',
  priority: 'high',
  metadata: {
    vessel: 'COSCO SHIPPING UNIVERSE',
    voyage: 'CS001E',
    shipper: 'ABC Trading Co.',
    consignee: 'XYZ Imports Ltd.',
    port_of_loading: 'Shanghai',
    port_of_discharge: 'Le Havre',
    etd: '2025-01-15T10:00:00Z',
    eta: '2025-02-20T14:00:00Z',
    containers: [
      {
        id: 'TEMU1234567',
        type: '20GP',
        seal: 'ABC123',
        weight: 18500,
      }
    ],
  },
  activities: [
    {
      id: '1',
      type: 'status_change',
      description: 'Status changed from "loaded" to "in_transit"',
      timestamp: '2025-01-16T08:00:00Z',
      user: 'System',
    },
    {
      id: '2',
      type: 'document_upload',
      description: 'Bill of Lading document uploaded',
      timestamp: '2025-01-15T16:30:00Z',
      user: 'John Smith',
    },
  ],
  tabs: [
    { id: 'overview', label: 'Overview', content: { type: 'overview' } },
    { id: 'containers', label: 'Containers', content: { type: 'containers', data: [] } },
    { id: 'parties', label: 'Parties', content: { type: 'parties', data: {} } },
    { id: 'activities', label: 'Activities', content: { type: 'activities', data: [] } },
  ],
  actions: [
    { id: 'edit', label: 'Edit', icon: 'edit', variant: 'secondary' },
    { id: 'delete', label: 'Delete', icon: 'trash', variant: 'destructive' },
    { id: 'export', label: 'Export', icon: 'download', variant: 'outline' },
  ],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-16T08:00:00Z',
});

describe('DetailView Component', () => {
  const mockOnClose = jest.fn();
  const mockOnAction = jest.fn();
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset viewport to desktop
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
    window.dispatchEvent(new Event('resize'));
  });

  describe('Basic Rendering', () => {
    test('renders loading state', () => {
      render(
        <TestWrapper>
          <DetailView
            loading={true}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading details...')).toBeInTheDocument();
    });

    test('renders not found state', () => {
      render(
        <TestWrapper>
          <DetailView
            loading={false}
            error="Item not found"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Item not found')).toBeInTheDocument();
    });

    test('renders detail data correctly', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Check title and subtitle
      expect(screen.getByText('Bill of Lading BL-001')).toBeInTheDocument();
      expect(screen.getByText('COSCO SHIPPING UNIVERSE - Shanghai to Le Havre')).toBeInTheDocument();
      
      // Check status badge
      expect(screen.getByText('in_transit')).toBeInTheDocument();
      
      // Check priority badge
      expect(screen.getByText('high')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Check action buttons
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('renders all tabs', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Check that all tabs are rendered
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Containers')).toBeInTheDocument();
      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });

    test('switches tabs when clicked', async () => {
      const user = userEvent.setup();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Click on Containers tab
      const containersTab = screen.getByText('Containers');
      await user.click(containersTab);

      expect(mockOnTabChange).toHaveBeenCalledWith('containers');
    });

    test('shows correct tab content', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="activities"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Should show activities content
      expect(screen.getByText('Status changed from "loaded" to "in_transit"')).toBeInTheDocument();
      expect(screen.getByText('Bill of Lading document uploaded')).toBeInTheDocument();
    });

    test('supports keyboard navigation between tabs', async () => {
      const user = userEvent.setup();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const containersTab = screen.getByRole('tab', { name: 'Containers' });

      // Focus on first tab
      overviewTab.focus();
      expect(document.activeElement).toBe(overviewTab);

      // Navigate to next tab with arrow key
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(containersTab);

      // Activate tab with Enter
      await user.keyboard('{Enter}');
      expect(mockOnTabChange).toHaveBeenCalledWith('containers');
    });
  });

  describe('Action Handling', () => {
    test('calls onAction when action button is clicked', async () => {
      const user = userEvent.setup();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockOnAction).toHaveBeenCalledWith('edit', 'BL-001');
    });

    test('shows confirmation for destructive actions', async () => {
      const user = userEvent.setup();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByText('Confirm Delete');
      await user.click(confirmButton);

      expect(mockOnAction).toHaveBeenCalledWith('delete', 'BL-001');
    });
  });

  describe('Responsive Behavior', () => {
    test('shows back button in mobile view', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Back to list')).toBeInTheDocument();
    });

    test('hides back button in desktop view', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Back to list')).not.toBeInTheDocument();
    });

    test('adapts tab layout for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Check for mobile-specific tab layout
      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveClass('mobile-tabs'); // Assuming this class exists
    });

    test('stacks actions vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
      window.dispatchEvent(new Event('resize'));

      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const actionsContainer = screen.getByTestId('detail-actions');
      expect(actionsContainer).toHaveClass('mobile-actions'); // Assuming this class exists
    });
  });

  describe('Error Handling', () => {
    test('displays error message and retry button', async () => {
      const user = userEvent.setup();
      const mockOnRetry = jest.fn();
      
      render(
        <TestWrapper>
          <DetailView
            loading={false}
            error="Failed to load details"
            onRetry={mockOnRetry}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Failed to load details')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalled();
    });

    test('handles missing tab content gracefully', () => {
      const detail = {
        ...createMockBLDetail('BL-001'),
        tabs: [
          { id: 'empty', label: 'Empty Tab', content: null },
        ]
      };
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="empty"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Should show empty state instead of crashing
      expect(screen.getByText('No content available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const detail = createMockBLDetail('BL-001');
      
      const { container } = render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has proper ARIA labels for tabs', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveAttribute('aria-label');

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('aria-selected');
      });

      const tabPanels = screen.getAllByRole('tabpanel');
      tabPanels.forEach(panel => {
        expect(panel).toHaveAttribute('aria-labelledby');
      });
    });

    test('has proper labels for action buttons', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const editButton = screen.getByText('Edit');
      const deleteButton = screen.getByText('Delete');

      expect(editButton).toHaveAttribute('aria-label', 'Edit item');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete item');
    });

    test('manages focus properly when switching tabs', async () => {
      const user = userEvent.setup();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      const containersTab = screen.getByRole('tab', { name: 'Containers' });
      await user.click(containersTab);

      // Focus should move to the activated tab
      expect(document.activeElement).toBe(containersTab);
    });

    test('supports screen reader announcements for dynamic content', () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Check for aria-live regions
      expect(screen.getByRole('status')).toBeInTheDocument(); // For loading states
      expect(screen.getByRole('alert')).toBeInTheDocument(); // For errors
    });
  });

  describe('Performance', () => {
    test('lazy loads tab content', async () => {
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            activeTab="overview"
            lazyLoadTabs={true}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Only active tab content should be loaded initially
      expect(screen.queryByText('Status changed from "loaded" to "in_transit"')).not.toBeInTheDocument();

      // Switch to activities tab
      const user = userEvent.setup();
      const activitiesTab = screen.getByText('Activities');
      await user.click(activitiesTab);

      // Now activities content should be loaded
      await waitFor(() => {
        expect(screen.getByText('Status changed from "loaded" to "in_transit"')).toBeInTheDocument();
      });
    });

    test('memoizes expensive computations', () => {
      const detail = createMockBLDetail('BL-001');
      
      const { rerender } = render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Mock expensive computation spy
      const computationSpy = jest.spyOn(React, 'useMemo');

      // Rerender with same props
      rerender(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );

      // Expensive computations should be memoized
      expect(computationSpy).toHaveBeenCalled();
      
      computationSpy.mockRestore();
    });

    test('renders within performance budget', () => {
      const startTime = performance.now();
      const detail = createMockBLDetail('BL-001');
      
      render(
        <TestWrapper>
          <DetailView
            data={detail}
            loading={false}
            onClose={mockOnClose}
            onAction={mockOnAction}
            onTabChange={mockOnTabChange}
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 50ms
      expect(renderTime).toBeLessThan(50);
    });
  });
});