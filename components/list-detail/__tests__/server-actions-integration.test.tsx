/**
 * Integration tests for Server Actions with list-detail components
 * Tests Next.js App Router integration, form actions, and data mutations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';

// Mock Next.js server actions
jest.mock('@/lib/actions/list-detail-actions', () => ({
  searchBillsOfLading: jest.fn(),
  getBillOfLadingDetail: jest.fn(),
  updateBillOfLading: jest.fn(),
  deleteBillOfLading: jest.fn(),
  createBillOfLading: jest.fn(),
  bulkUpdateBillsOfLading: jest.fn(),
}));

import {
  searchBillsOfLading,
  getBillOfLadingDetail,
  updateBillOfLading,
  deleteBillOfLading,
  createBillOfLading,
  bulkUpdateBillsOfLading,
} from '@/lib/actions/list-detail-actions';

// Mock form state
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useFormStatus: () => ({ pending: false }),
  useFormState: () => [null, jest.fn()],
}));

const mockMessages = {
  'list-detail': {
    search: { placeholder: 'Search...', clear: 'Clear search' },
    list: { loading: 'Loading...', error: 'Error loading data', empty: 'No items found' },
    detail: { loading: 'Loading details...', error: 'Error loading details' },
    actions: { 
      create: 'Create', 
      edit: 'Edit', 
      delete: 'Delete', 
      save: 'Save', 
      cancel: 'Cancel',
      bulkUpdate: 'Bulk Update',
      export: 'Export'
    },
    forms: {
      reference: 'Reference',
      vessel: 'Vessel Name',
      shipper: 'Shipper',
      consignee: 'Consignee',
      status: 'Status',
      priority: 'Priority',
      saving: 'Saving...',
      saved: 'Saved successfully',
      error: 'Save failed',
    },
    common: { loading: 'Loading...', error: 'An error occurred', retry: 'Retry' },
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider messages={mockMessages} locale="en">
    {children}
  </NextIntlClientProvider>
);

// Mock components that use server actions
const ServerActionForm: React.FC<{
  action: 'create' | 'update' | 'delete';
  itemId?: string;
  initialData?: any;
}> = ({ action, itemId, initialData }) => {
  const [formData, setFormData] = React.useState(initialData || {});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      switch (action) {
        case 'create':
          response = await createBillOfLading(formData);
          break;
        case 'update':
          response = await updateBillOfLading(itemId!, formData);
          break;
        case 'delete':
          response = await deleteBillOfLading(itemId!);
          break;
      }
      setResult(response);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid={`${action}-form`}>
      {action !== 'delete' && (
        <>
          <input
            data-testid="reference-input"
            name="reference"
            placeholder="Reference"
            value={formData.reference || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
          />
          <input
            data-testid="vessel-input"
            name="vessel"
            placeholder="Vessel Name"
            value={formData.vessel || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, vessel: e.target.value }))}
          />
          <select
            data-testid="status-select"
            name="status"
            value={formData.status || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Select Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </>
      )}
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        data-testid={`${action}-submit-btn`}
      >
        {isSubmitting ? 'Submitting...' : action.charAt(0).toUpperCase() + action.slice(1)}
      </button>

      {result && (
        <div data-testid="form-result">
          {result.error ? `Error: ${result.error}` : 'Success'}
        </div>
      )}
    </form>
  );
};

const BulkActionForm: React.FC<{
  selectedIds: string[];
}> = ({ selectedIds }) => {
  const [bulkAction, setBulkAction] = React.useState('');
  const [bulkData, setBulkData] = React.useState<any>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await bulkUpdateBillsOfLading(selectedIds, bulkData);
      setResult(response);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleBulkSubmit} data-testid="bulk-form">
      <div data-testid="selected-count">
        Selected items: {selectedIds.length}
      </div>
      
      <select
        data-testid="bulk-action-select"
        value={bulkAction}
        onChange={(e) => setBulkAction(e.target.value)}
      >
        <option value="">Select Action</option>
        <option value="updateStatus">Update Status</option>
        <option value="updatePriority">Update Priority</option>
        <option value="delete">Delete All</option>
      </select>

      {bulkAction === 'updateStatus' && (
        <select
          data-testid="bulk-status-select"
          onChange={(e) => setBulkData({ status: e.target.value })}
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )}

      {bulkAction === 'updatePriority' && (
        <select
          data-testid="bulk-priority-select"
          onChange={(e) => setBulkData({ priority: e.target.value })}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      )}

      <button 
        type="submit" 
        disabled={isSubmitting || !bulkAction}
        data-testid="bulk-submit-btn"
      >
        {isSubmitting ? 'Processing...' : 'Apply'}
      </button>

      {result && (
        <div data-testid="bulk-result">
          {result.error ? `Error: ${result.error}` : `Updated ${result.count} items`}
        </div>
      )}
    </form>
  );
};

const SearchWithServerAction: React.FC = () => {
  const [searchResults, setSearchResults] = React.useState<any>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  
  const handleSearch = async (formData: FormData) => {
    setIsSearching(true);
    try {
      const query = formData.get('query') as string;
      const filters = {
        status: formData.get('status') as string,
        priority: formData.get('priority') as string,
      };
      
      const results = await searchBillsOfLading({
        query,
        filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
        page: 1,
        per_page: 20,
      });
      
      setSearchResults(results);
    } catch (error) {
      setSearchResults({ error: error.message });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <form action={handleSearch} data-testid="search-form">
        <input
          name="query"
          placeholder="Search..."
          data-testid="search-input"
        />
        
        <select name="status" data-testid="status-filter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select name="priority" data-testid="priority-filter">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit" disabled={isSearching} data-testid="search-submit-btn">
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchResults && (
        <div data-testid="search-results">
          {searchResults.error ? (
            <div>Error: {searchResults.error}</div>
          ) : (
            <div>
              Found {searchResults.total} items
              {searchResults.data?.map((item: any) => (
                <div key={item.id} data-testid={`result-${item.id}`}>
                  {item.reference} - {item.status}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

describe('Server Actions Integration', () => {
  // Mock server action implementations
  const mockSearchResults = {
    data: [
      { id: 'BL-001', reference: 'BL-001', status: 'active', vessel: 'Test Vessel 1' },
      { id: 'BL-002', reference: 'BL-002', status: 'completed', vessel: 'Test Vessel 2' },
    ],
    total: 2,
    page: 1,
    per_page: 20,
    total_pages: 1,
  };

  const mockDetailData = {
    id: 'BL-001',
    reference: 'BL-001',
    vessel: 'Test Vessel 1',
    shipper: 'Test Shipper',
    consignee: 'Test Consignee',
    status: 'active',
    priority: 'high',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (searchBillsOfLading as jest.Mock).mockResolvedValue(mockSearchResults);
    (getBillOfLadingDetail as jest.Mock).mockResolvedValue(mockDetailData);
    (createBillOfLading as jest.Mock).mockResolvedValue({ id: 'BL-NEW', success: true });
    (updateBillOfLading as jest.Mock).mockResolvedValue({ id: 'BL-001', success: true });
    (deleteBillOfLading as jest.Mock).mockResolvedValue({ success: true });
    (bulkUpdateBillsOfLading as jest.Mock).mockResolvedValue({ count: 2, success: true });
  });

  describe('Search Operations', () => {
    test('performs search with server action', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SearchWithServerAction />
        </TestWrapper>
      );

      // Fill search form
      const searchInput = screen.getByTestId('search-input');
      const statusFilter = screen.getByTestId('status-filter');
      const submitButton = screen.getByTestId('search-submit-btn');

      await user.type(searchInput, 'test query');
      await user.selectOptions(statusFilter, 'active');
      await user.click(submitButton);

      // Should call server action with correct parameters
      await waitFor(() => {
        expect(searchBillsOfLading).toHaveBeenCalledWith({
          query: 'test query',
          filters: { status: 'active' },
          page: 1,
          per_page: 20,
        });
      });

      // Should display results
      await waitFor(() => {
        expect(screen.getByText('Found 2 items')).toBeInTheDocument();
        expect(screen.getByTestId('result-BL-001')).toHaveTextContent('BL-001 - active');
        expect(screen.getByTestId('result-BL-002')).toHaveTextContent('BL-002 - completed');
      });
    });

    test('handles search errors gracefully', async () => {
      (searchBillsOfLading as jest.Mock).mockRejectedValue(new Error('Search failed'));
      
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SearchWithServerAction />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('search-input');
      const submitButton = screen.getByTestId('search-submit-btn');

      await user.type(searchInput, 'test');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error: Search failed')).toBeInTheDocument();
      });
    });

    test('shows loading state during search', async () => {
      // Mock slow server action
      (searchBillsOfLading as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 1000))
      );

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SearchWithServerAction />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('search-submit-btn');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('CRUD Operations', () => {
    test('creates new item with server action', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServerActionForm action="create" />
        </TestWrapper>
      );

      // Fill form
      const referenceInput = screen.getByTestId('reference-input');
      const vesselInput = screen.getByTestId('vessel-input');
      const statusSelect = screen.getByTestId('status-select');
      const submitButton = screen.getByTestId('create-submit-btn');

      await user.type(referenceInput, 'BL-NEW-001');
      await user.type(vesselInput, 'New Test Vessel');
      await user.selectOptions(statusSelect, 'draft');
      await user.click(submitButton);

      // Should call create server action
      await waitFor(() => {
        expect(createBillOfLading).toHaveBeenCalledWith({
          reference: 'BL-NEW-001',
          vessel: 'New Test Vessel',
          status: 'draft',
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    test('updates existing item with server action', async () => {
      const user = userEvent.setup();
      const initialData = {
        reference: 'BL-001',
        vessel: 'Original Vessel',
        status: 'active',
      };

      render(
        <TestWrapper>
          <ServerActionForm 
            action="update" 
            itemId="BL-001"
            initialData={initialData}
          />
        </TestWrapper>
      );

      // Update vessel name
      const vesselInput = screen.getByTestId('vessel-input');
      const submitButton = screen.getByTestId('update-submit-btn');

      await user.clear(vesselInput);
      await user.type(vesselInput, 'Updated Vessel');
      await user.click(submitButton);

      // Should call update server action
      await waitFor(() => {
        expect(updateBillOfLading).toHaveBeenCalledWith('BL-001', {
          reference: 'BL-001',
          vessel: 'Updated Vessel',
          status: 'active',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    test('deletes item with server action', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServerActionForm action="delete" itemId="BL-001" />
        </TestWrapper>
      );

      const deleteButton = screen.getByTestId('delete-submit-btn');
      await user.click(deleteButton);

      // Should call delete server action
      await waitFor(() => {
        expect(deleteBillOfLading).toHaveBeenCalledWith('BL-001');
      });

      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    test('handles form validation errors', async () => {
      (createBillOfLading as jest.Mock).mockRejectedValue(new Error('Validation failed: Reference is required'));
      
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServerActionForm action="create" />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('create-submit-btn');
      await user.click(submitButton); // Submit without filling required fields

      await waitFor(() => {
        expect(screen.getByText('Error: Validation failed: Reference is required')).toBeInTheDocument();
      });
    });

    test('shows loading state during form submission', async () => {
      (updateBillOfLading as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ServerActionForm 
            action="update" 
            itemId="BL-001"
            initialData={{ reference: 'BL-001', vessel: 'Test' }}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('update-submit-btn');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Bulk Operations', () => {
    test('performs bulk status update', async () => {
      const user = userEvent.setup();
      const selectedIds = ['BL-001', 'BL-002', 'BL-003'];

      render(
        <TestWrapper>
          <BulkActionForm selectedIds={selectedIds} />
        </TestWrapper>
      );

      // Select bulk action and status
      const actionSelect = screen.getByTestId('bulk-action-select');
      const submitButton = screen.getByTestId('bulk-submit-btn');

      await user.selectOptions(actionSelect, 'updateStatus');
      
      // Status select should appear
      const statusSelect = screen.getByTestId('bulk-status-select');
      await user.selectOptions(statusSelect, 'completed');
      
      await user.click(submitButton);

      // Should call bulk update server action
      await waitFor(() => {
        expect(bulkUpdateBillsOfLading).toHaveBeenCalledWith(
          selectedIds,
          { status: 'completed' }
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Updated 2 items')).toBeInTheDocument();
      });
    });

    test('performs bulk priority update', async () => {
      const user = userEvent.setup();
      const selectedIds = ['BL-001', 'BL-002'];

      render(
        <TestWrapper>
          <BulkActionForm selectedIds={selectedIds} />
        </TestWrapper>
      );

      const actionSelect = screen.getByTestId('bulk-action-select');
      await user.selectOptions(actionSelect, 'updatePriority');
      
      const prioritySelect = screen.getByTestId('bulk-priority-select');
      await user.selectOptions(prioritySelect, 'high');
      
      const submitButton = screen.getByTestId('bulk-submit-btn');
      await user.click(submitButton);

      await waitFor(() => {
        expect(bulkUpdateBillsOfLading).toHaveBeenCalledWith(
          selectedIds,
          { priority: 'high' }
        );
      });
    });

    test('disables submit button when no action selected', () => {
      const selectedIds = ['BL-001'];

      render(
        <TestWrapper>
          <BulkActionForm selectedIds={selectedIds} />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('bulk-submit-btn');
      expect(submitButton).toBeDisabled();
    });

    test('shows selected items count', () => {
      const selectedIds = ['BL-001', 'BL-002', 'BL-003'];

      render(
        <TestWrapper>
          <BulkActionForm selectedIds={selectedIds} />
        </TestWrapper>
      );

      expect(screen.getByText('Selected items: 3')).toBeInTheDocument();
    });

    test('handles bulk operation errors', async () => {
      (bulkUpdateBillsOfLading as jest.Mock).mockRejectedValue(new Error('Bulk update failed'));
      
      const user = userEvent.setup();
      const selectedIds = ['BL-001'];

      render(
        <TestWrapper>
          <BulkActionForm selectedIds={selectedIds} />
        </TestWrapper>
      );

      const actionSelect = screen.getByTestId('bulk-action-select');
      await user.selectOptions(actionSelect, 'updateStatus');
      
      const statusSelect = screen.getByTestId('bulk-status-select');
      await user.selectOptions(statusSelect, 'active');
      
      const submitButton = screen.getByTestId('bulk-submit-btn');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error: Bulk update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Optimistic Updates', () => {
    test('shows immediate UI feedback before server confirmation', async () => {
      // Mock slow server response
      let resolveUpdate: (value: any) => void;
      (updateBillOfLading as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          resolveUpdate = resolve;
        })
      );

      const OptimisticUpdateForm: React.FC = () => {
        const [localData, setLocalData] = React.useState({
          reference: 'BL-001',
          status: 'active',
        });
        const [isUpdating, setIsUpdating] = React.useState(false);

        const handleOptimisticUpdate = async (newStatus: string) => {
          // Optimistic update
          const previousStatus = localData.status;
          setLocalData(prev => ({ ...prev, status: newStatus }));
          setIsUpdating(true);

          try {
            await updateBillOfLading('BL-001', { ...localData, status: newStatus });
            // Server confirmed - keep optimistic state
          } catch (error) {
            // Revert optimistic update
            setLocalData(prev => ({ ...prev, status: previousStatus }));
          } finally {
            setIsUpdating(false);
          }
        };

        return (
          <div>
            <div data-testid="current-status">{localData.status}</div>
            <div data-testid="updating-indicator">{isUpdating ? 'Updating...' : 'Ready'}</div>
            <button
              data-testid="update-to-completed-btn"
              onClick={() => handleOptimisticUpdate('completed')}
              disabled={isUpdating}
            >
              Mark as Completed
            </button>
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <OptimisticUpdateForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-status')).toHaveTextContent('active');

      const updateButton = screen.getByTestId('update-to-completed-btn');
      await user.click(updateButton);

      // Should immediately show optimistic update
      expect(screen.getByTestId('current-status')).toHaveTextContent('completed');
      expect(screen.getByTestId('updating-indicator')).toHaveTextContent('Updating...');

      // Resolve server action
      resolveUpdate({ success: true });

      await waitFor(() => {
        expect(screen.getByTestId('updating-indicator')).toHaveTextContent('Ready');
        expect(screen.getByTestId('current-status')).toHaveTextContent('completed');
      });
    });

    test('reverts optimistic update on server error', async () => {
      (updateBillOfLading as jest.Mock).mockRejectedValue(new Error('Server error'));

      const OptimisticUpdateForm: React.FC = () => {
        const [localData, setLocalData] = React.useState({
          reference: 'BL-001',
          status: 'active',
        });
        const [error, setError] = React.useState<string | null>(null);

        const handleOptimisticUpdate = async (newStatus: string) => {
          const previousStatus = localData.status;
          setLocalData(prev => ({ ...prev, status: newStatus }));
          setError(null);

          try {
            await updateBillOfLading('BL-001', { ...localData, status: newStatus });
          } catch (err) {
            // Revert optimistic update
            setLocalData(prev => ({ ...prev, status: previousStatus }));
            setError(err.message);
          }
        };

        return (
          <div>
            <div data-testid="current-status">{localData.status}</div>
            <div data-testid="error-message">{error || 'No error'}</div>
            <button
              data-testid="update-btn"
              onClick={() => handleOptimisticUpdate('completed')}
            >
              Update
            </button>
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <OptimisticUpdateForm />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-status')).toHaveTextContent('active');

      const updateButton = screen.getByTestId('update-btn');
      await user.click(updateButton);

      // Should show optimistic update first
      expect(screen.getByTestId('current-status')).toHaveTextContent('completed');

      // Then revert and show error
      await waitFor(() => {
        expect(screen.getByTestId('current-status')).toHaveTextContent('active');
        expect(screen.getByTestId('error-message')).toHaveTextContent('Server error');
      });
    });
  });

  describe('Form State Management', () => {
    test('preserves form data during navigation', async () => {
      const FormWithNavigation: React.FC = () => {
        const [formData, setFormData] = React.useState({ reference: '', vessel: '' });
        const [currentView, setCurrentView] = React.useState('form');

        return (
          <div>
            {currentView === 'form' ? (
              <div>
                <input
                  data-testid="reference-input"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Reference"
                />
                <input
                  data-testid="vessel-input"
                  value={formData.vessel}
                  onChange={(e) => setFormData(prev => ({ ...prev, vessel: e.target.value }))}
                  placeholder="Vessel"
                />
                <button 
                  data-testid="navigate-btn"
                  onClick={() => setCurrentView('other')}
                >
                  Navigate Away
                </button>
              </div>
            ) : (
              <div>
                <div data-testid="other-view">Other View</div>
                <button 
                  data-testid="back-btn"
                  onClick={() => setCurrentView('form')}
                >
                  Back to Form
                </button>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <FormWithNavigation />
        </TestWrapper>
      );

      // Fill form
      const referenceInput = screen.getByTestId('reference-input');
      const vesselInput = screen.getByTestId('vessel-input');

      await user.type(referenceInput, 'BL-TEST');
      await user.type(vesselInput, 'Test Vessel');

      // Navigate away
      const navigateButton = screen.getByTestId('navigate-btn');
      await user.click(navigateButton);

      expect(screen.getByTestId('other-view')).toBeInTheDocument();

      // Navigate back
      const backButton = screen.getByTestId('back-btn');
      await user.click(backButton);

      // Form data should be preserved
      expect(screen.getByTestId('reference-input')).toHaveValue('BL-TEST');
      expect(screen.getByTestId('vessel-input')).toHaveValue('Test Vessel');
    });

    test('handles concurrent form submissions', async () => {
      let submitCount = 0;
      (createBillOfLading as jest.Mock).mockImplementation(() => {
        submitCount++;
        return new Promise(resolve => 
          setTimeout(() => resolve({ id: `BL-${submitCount}`, success: true }), 100)
        );
      });

      const ConcurrentSubmissionForm: React.FC = () => {
        const [submissions, setSubmissions] = React.useState<string[]>([]);
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const handleSubmit = async () => {
          if (isSubmitting) return;
          
          setIsSubmitting(true);
          try {
            const result = await createBillOfLading({ reference: 'BL-CONCURRENT' });
            setSubmissions(prev => [...prev, result.id]);
          } catch (error) {
            setSubmissions(prev => [...prev, `Error: ${error.message}`]);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div>
            <button 
              data-testid="concurrent-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <div data-testid="submissions-list">
              {submissions.map((submission, index) => (
                <div key={index} data-testid={`submission-${index}`}>
                  {submission}
                </div>
              ))}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ConcurrentSubmissionForm />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('concurrent-submit-btn');
      
      // Try to submit multiple times quickly
      await user.click(submitButton);
      await user.click(submitButton); // Should be disabled
      await user.click(submitButton); // Should be disabled

      // Wait for first submission to complete
      await waitFor(() => {
        expect(screen.getByTestId('submission-0')).toHaveTextContent('BL-1');
      });

      // Should only have one submission
      expect(screen.queryByTestId('submission-1')).not.toBeInTheDocument();
      expect(createBillOfLading).toHaveBeenCalledTimes(1);
    });
  });
});