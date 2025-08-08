'use client';

import React from 'react';
import { ListDetailLayout } from '../layout/list-detail-layout';
import type { 
  ListViewResponse,
  DetailViewData,
  ListApiParams,
  DetailApiParams,
  ListViewItem,
  DetailViewTab,
  ListItemBadge,
  ListItemAction
} from '@/types';

// ============================================================================
// FOLDERS LIST-DETAIL LAYOUT
// ============================================================================

interface FolderListDetailLayoutProps {
  className?: string;
}

export function FolderListDetailLayout({ className }: FolderListDetailLayoutProps) {
  // Mock data loader for Folders list
  const loadFolderList = async (params: ListApiParams): Promise<ListViewResponse<'folder'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock Folders data
    const mockFolders: ListViewItem<'folder'>[] = [
      {
        id: 'folder-001',
        entityType: 'folder',
        title: 'CUSTOMS-2025-001',
        subtitle: 'Import Declaration - Electronics',
        status: 'active',
        priority: 'urgent',
        updatedAt: '2025-08-07T15:20:00Z',
        preview: {
          id: 'folder-001',
          folder_number: 'CUSTOMS-2025-001',
          status: 'active',
          folder_type: 'import',
          client_name: 'TechCorp International',
          commodity: 'Electronics',
          estimated_value: 125000,
          processing_stage: 'customs_clearance',
          created_at: '2025-08-01T08:30:00Z',
          updated_at: '2025-08-07T15:20:00Z'
        } as any,
        badges: [
          {
            label: '€125,000',
            variant: 'info',
            icon: '💰',
            tooltip: 'Estimated value'
          },
          {
            label: 'Urgent',
            variant: 'danger',
            icon: '🚨',
            tooltip: 'Urgent processing required'
          },
          {
            label: 'Customs',
            variant: 'warning',
            icon: '🏛️',
            tooltip: 'In customs clearance'
          }
        ] as ListItemBadge[],
        actions: [
          {
            id: 'process',
            label: 'Process',
            icon: '⚡',
            variant: 'primary'
          },
          {
            id: 'documents',
            label: 'Documents',
            icon: '📄',
            variant: 'secondary'
          }
        ] as ListItemAction[]
      },
      {
        id: 'folder-002',
        entityType: 'folder',
        title: 'TRANSIT-2025-045',
        subtitle: 'Transit Declaration - Machinery',
        status: 'pending',
        priority: 'high',
        updatedAt: '2025-08-06T11:15:00Z',
        preview: {
          id: 'folder-002',
          folder_number: 'TRANSIT-2025-045',
          status: 'pending',
          folder_type: 'transit',
          client_name: 'Industrial Solutions Ltd',
          commodity: 'Machinery Parts',
          estimated_value: 89000,
          processing_stage: 'document_review',
          created_at: '2025-08-05T14:20:00Z',
          updated_at: '2025-08-06T11:15:00Z'
        } as any,
        badges: [
          {
            label: '€89,000',
            variant: 'info',
            icon: '💰'
          },
          {
            label: 'High',
            variant: 'warning',
            icon: '⚠️'
          },
          {
            label: 'Review',
            variant: 'info',
            icon: '🔍'
          }
        ] as ListItemBadge[]
      },
      {
        id: 'folder-003',
        entityType: 'folder',
        title: 'EXPORT-2025-178',
        subtitle: 'Export Declaration - Textiles',
        status: 'completed',
        priority: 'medium',
        updatedAt: '2025-08-05T09:30:00Z',
        preview: {
          id: 'folder-003',
          folder_number: 'EXPORT-2025-178',
          status: 'completed',
          folder_type: 'export',
          client_name: 'Fashion Forward SA',
          commodity: 'Textile Products',
          estimated_value: 45000,
          processing_stage: 'completed',
          created_at: '2025-07-28T10:00:00Z',
          updated_at: '2025-08-05T09:30:00Z'
        } as any,
        badges: [
          {
            label: '€45,000',
            variant: 'info',
            icon: '💰'
          },
          {
            label: 'Completed',
            variant: 'success',
            icon: '✅'
          }
        ] as ListItemBadge[]
      },
      {
        id: 'folder-004',
        entityType: 'folder',
        title: 'IMPORT-2025-092',
        subtitle: 'Import Declaration - Food Products',
        status: 'on_hold',
        priority: 'low',
        updatedAt: '2025-08-04T16:45:00Z',
        preview: {
          id: 'folder-004',
          folder_number: 'IMPORT-2025-092',
          status: 'on_hold',
          folder_type: 'import',
          client_name: 'Gourmet Imports Inc',
          commodity: 'Organic Food Products',
          estimated_value: 23500,
          processing_stage: 'waiting_documents',
          created_at: '2025-08-02T13:15:00Z',
          updated_at: '2025-08-04T16:45:00Z'
        } as any,
        badges: [
          {
            label: '€23,500',
            variant: 'info',
            icon: '💰'
          },
          {
            label: 'On Hold',
            variant: 'warning',
            icon: '⏸️'
          },
          {
            label: 'Docs Missing',
            variant: 'danger',
            icon: '📋'
          }
        ] as ListItemBadge[]
      }
    ];

    // Apply search filter
    let filteredFolders = mockFolders;
    if (params.search) {
      filteredFolders = mockFolders.filter(folder =>
        folder.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        folder.subtitle?.toLowerCase().includes(params.search!.toLowerCase()) ||
        ((folder.preview as any).client_name?.toLowerCase().includes(params.search!.toLowerCase()))
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paginatedFolders = filteredFolders.slice(start, start + limit);

    return {
      data: paginatedFolders,
      pagination: {
        current_page: page,
        page_size: limit,
        total_count: filteredFolders.length,
        total_pages: Math.ceil(filteredFolders.length / limit),
        has_next_page: start + limit < filteredFolders.length,
        has_previous_page: page > 1
      },
      aggregates: {
        statusCounts: {
          'pending': 8,
          'active': 12,
          'completed': 25,
          'on_hold': 4,
          'archived': 15
        },
        priorityCounts: {
          'low': 12,
          'medium': 18,
          'high': 8,
          'urgent': 4
        }
      },
      facets: [
        {
          field: 'status',
          label: 'Status',
          values: [
            { value: 'pending', label: 'Pending', count: 8 },
            { value: 'active', label: 'Active', count: 12 },
            { value: 'completed', label: 'Completed', count: 25 },
            { value: 'on_hold', label: 'On Hold', count: 4 },
            { value: 'archived', label: 'Archived', count: 15 }
          ]
        },
        {
          field: 'folder_type',
          label: 'Type',
          values: [
            { value: 'import', label: 'Import', count: 32 },
            { value: 'export', label: 'Export', count: 28 },
            { value: 'transit', label: 'Transit', count: 15 }
          ]
        },
        {
          field: 'priority',
          label: 'Priority',
          values: [
            { value: 'urgent', label: 'Urgent', count: 4 },
            { value: 'high', label: 'High', count: 8 },
            { value: 'medium', label: 'Medium', count: 18 },
            { value: 'low', label: 'Low', count: 12 }
          ]
        }
      ]
    };
  };

  // Mock data loader for Folder detail
  const loadFolderDetail = async (params: DetailApiParams): Promise<DetailViewData<'folder'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock detailed Folder data
    const mockFolderDetail = {
      id: params.id,
      folder_number: `CUSTOMS-2025-${params.id.split('-')[1]}`,
      status: 'active',
      folder_type: 'import',
      client_name: 'TechCorp International',
      client_id: 'client-001',
      commodity: 'Electronic Components and Accessories',
      estimated_value: 125000,
      currency: 'EUR',
      processing_stage: 'customs_clearance',
      priority: 'urgent',
      assigned_agent: 'Marie Dubois',
      assigned_agent_id: 'agent-001',
      origin_country: 'China',
      destination_country: 'France',
      port_of_entry: 'Le Havre',
      expected_arrival: '2025-08-10T00:00:00Z',
      customs_value: 125000,
      duty_amount: 12500,
      vat_amount: 27500,
      total_charges: 40000,
      invoice_reference: 'INV-2025-001',
      bl_reference: 'BL-2025-001',
      container_numbers: ['COSCO-123456', 'COSCO-123457'],
      special_requirements: 'Electronics require CE marking verification',
      internal_notes: 'Client requested expedited processing due to production deadline',
      created_at: '2025-08-01T08:30:00Z',
      updated_at: '2025-08-07T15:20:00Z'
    };

    const tabs: DetailViewTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📋',
        component: 'FolderOverview'
      },
      {
        id: 'client',
        label: 'Client Info',
        icon: '🏢',
        component: 'FolderClient'
      },
      {
        id: 'customs',
        label: 'Customs',
        icon: '🏛️',
        component: 'FolderCustoms'
      },
      {
        id: 'charges',
        label: 'Charges',
        icon: '💰',
        component: 'FolderCharges'
      },
      {
        id: 'documents',
        label: 'Documents',
        badge: 8,
        icon: '📄',
        component: 'FolderDocuments'
      },
      {
        id: 'alerts',
        label: 'Alerts',
        badge: 2,
        icon: '🚨',
        component: 'FolderAlerts'
      },
      {
        id: 'activities',
        label: 'Activities',
        badge: 15,
        icon: '📝',
        component: 'FolderActivities'
      }
    ];

    return {
      entity: mockFolderDetail as any,
      metadata: {
        permissions: {
          canEdit: true,
          canDelete: false,
          canComment: true,
          canShare: true
        },
        tabs,
        breadcrumbs: [
          { label: 'Folders', href: '/folders' },
          { label: mockFolderDetail.folder_number }
        ]
      },
      activities: [
        {
          id: 'activity-1',
          action: 'status_changed',
          description: 'Processing stage changed to "customs_clearance"',
          created_at: '2025-08-07T15:20:00Z',
          updated_at: '2025-08-07T15:20:00Z',
          created_by: 'agent-001',
          updated_by: 'agent-001',
          changes: {
            processing_stage: {
              from: 'document_review',
              to: 'customs_clearance'
            }
          }
        },
        {
          id: 'activity-2',
          action: 'comment_added',
          description: 'Added processing note',
          created_at: '2025-08-07T14:45:00Z',
          updated_at: '2025-08-07T14:45:00Z',
          created_by: 'agent-001',
          updated_by: 'agent-001',
          comment: 'All documents verified. Proceeding with customs clearance.'
        },
        {
          id: 'activity-3',
          action: 'created',
          description: 'Folder created and assigned',
          created_at: '2025-08-01T08:30:00Z',
          updated_at: '2025-08-01T08:30:00Z',
          created_by: 'system',
          updated_by: 'system'
        }
      ],
      related: {
        documents: {
          count: 8,
          items: [
            {
              id: 'doc-1',
              title: 'Commercial Invoice',
              type: 'document' as any,
              status: 'verified'
            },
            {
              id: 'doc-2',
              title: 'Packing List',
              type: 'document' as any,
              status: 'verified'
            }
          ]
        },
        alerts: {
          count: 2,
          items: [
            {
              id: 'alert-1',
              title: 'Deadline Approaching',
              type: 'alert' as any,
              status: 'active'
            }
          ]
        },
        charges: {
          count: 5,
          items: [
            {
              id: 'charge-1',
              title: 'Customs Duty',
              type: 'charge' as any,
              status: 'pending'
            }
          ]
        }
      }
    };
  };

  return (
    <ListDetailLayout
      entityType="folder"
      onLoadList={loadFolderList}
      onLoadDetail={loadFolderDetail}
      config={{
        entityType: 'folder',
        mode: 'split',
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1280,
          xl: 1536
        },
        listWidth: 30,
        showSearch: true,
        showFilters: true,
        selectionMode: 'single'
      }}
      className={className}
    />
  );
}