'use client';

import React from 'react';
import { ListDetailLayout } from '../layout/list-detail-layout';
import { Badge } from '@/components/ui/badge';
import { Ship, Package, MapPin, Calendar } from 'lucide-react';
import type { 
  ListViewResponse,
  DetailViewData,
  ListViewParams,
  DetailApiParams,
  ListViewItem,
  DetailViewTab,
  ListItemBadge,
  ListItemAction
} from '@/types';

// ============================================================================
// BILLS OF LADING LIST-DETAIL LAYOUT
// ============================================================================

interface BLListDetailLayoutProps {
  className?: string;
}

export function BLListDetailLayout({ className }: BLListDetailLayoutProps) {
  // Mock data loader for Bills of Lading list
  const loadBLList = async (params: ListViewParams): Promise<ListViewResponse<'bill_of_lading'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Bills of Lading data
    const mockBLs: ListViewItem<'bill_of_lading'>[] = [
      {
        id: 'bl-001',
        entityType: 'bill_of_lading',
        title: 'BL-2025-001',
        subtitle: 'Shanghai to Le Havre',
        status: 'in_transit',
        priority: 'high',
        updatedAt: '2025-08-07T14:30:00Z',
        preview: {
          id: 'bl-001',
          bl_number: 'BL-2025-001',
          status: 'in_transit',
          origin_port: 'Shanghai',
          destination_port: 'Le Havre',
          vessel_name: 'COSCO SHIPPING',
          eta: '2025-08-15T00:00:00Z',
          total_containers: 24,
          created_at: '2025-07-20T09:00:00Z',
          updated_at: '2025-08-07T14:30:00Z'
        } as any,
        badges: [
          {
            label: '24 containers',
            variant: 'secondary',
            icon: '📦',
            tooltip: '24 containers loaded'
          },
          {
            label: 'Express',
            variant: 'warning',
            icon: '⚡',
            tooltip: 'Express shipping service'
          }
        ] as ListItemBadge[],
        actions: [
          {
            id: 'track',
            label: 'Track',
            icon: '🚢',
            variant: 'default'
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
        id: 'bl-002',
        entityType: 'bill_of_lading',
        title: 'BL-2025-002',
        subtitle: 'Rotterdam to New York',
        status: 'confirmed',
        priority: 'medium',
        updatedAt: '2025-08-06T10:15:00Z',
        preview: {
          id: 'bl-002',
          bl_number: 'BL-2025-002',
          status: 'confirmed',
          origin_port: 'Rotterdam',
          destination_port: 'New York',
          vessel_name: 'MAERSK LINE',
          eta: '2025-08-20T00:00:00Z',
          total_containers: 18,
          created_at: '2025-07-25T11:30:00Z',
          updated_at: '2025-08-06T10:15:00Z'
        } as any,
        badges: [
          {
            label: '18 containers',
            variant: 'secondary',
            icon: '📦'
          }
        ] as ListItemBadge[]
      },
      {
        id: 'bl-003',
        entityType: 'bill_of_lading',
        title: 'BL-2025-003',
        subtitle: 'Hamburg to Santos',
        status: 'delivered',
        priority: 'low',
        updatedAt: '2025-08-05T16:45:00Z',
        preview: {
          id: 'bl-003',
          bl_number: 'BL-2025-003',
          status: 'delivered',
          origin_port: 'Hamburg',
          destination_port: 'Santos',
          vessel_name: 'MSC CONTAINER',
          eta: '2025-07-30T00:00:00Z',
          total_containers: 12,
          created_at: '2025-07-10T08:20:00Z',
          updated_at: '2025-08-05T16:45:00Z'
        } as any,
        badges: [
          {
            label: '12 containers',
            variant: 'secondary',
            icon: '📦'
          },
          {
            label: 'Completed',
            variant: 'success',
            icon: '✅'
          }
        ] as ListItemBadge[]
      }
    ];

    // Apply search filter
    let filteredBLs = mockBLs;
    if (params.search) {
      filteredBLs = mockBLs.filter(bl =>
        bl.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        bl.subtitle.toLowerCase().includes(params.search!.toLowerCase()) ||
        bl.preview.vessel_name.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paginatedBLs = filteredBLs.slice(start, start + limit);

    return {
      data: paginatedBLs,
      pagination: {
        page,
        limit,
        total: filteredBLs.length,
        totalPages: Math.ceil(filteredBLs.length / limit),
        hasNext: start + limit < filteredBLs.length,
        hasPrev: page > 1
      },
      aggregates: {
        statusCounts: {
          'draft': 2,
          'confirmed': 5,
          'in_transit': 8,
          'delivered': 12,
          'cancelled': 1
        }
      }
    };
  };

  // Mock data loader for Bills of Lading detail
  const loadBLDetail = async (params: DetailApiParams): Promise<DetailViewData<'bill_of_lading'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock detailed BL data
    const mockBLDetail = {
      id: params.id,
      bl_number: `BL-2025-${params.id.split('-')[1]}`,
      status: 'in_transit',
      origin_port: 'Shanghai',
      destination_port: 'Le Havre',
      vessel_name: 'COSCO SHIPPING UNIVERSE',
      vessel_imo: 'IMO9876543',
      voyage_number: 'VOY-2025-08-001',
      booking_reference: 'BOOK-2025-001',
      shipper: {
        name: 'Shanghai Export Co.',
        address: '123 Shipping Street, Shanghai, China'
      },
      consignee: {
        name: 'Le Havre Import Ltd.',
        address: '456 Port Avenue, Le Havre, France'
      },
      notify_party: {
        name: 'French Customs Broker',
        address: '789 Customs Blvd, Le Havre, France'
      },
      port_of_loading: 'Shanghai',
      port_of_discharge: 'Le Havre',
      place_of_receipt: 'Shanghai Warehouse',
      place_of_delivery: 'Le Havre Terminal',
      freight_terms: 'prepaid',
      payment_terms: 'CAD',
      total_containers: 24,
      total_weight: 480000,
      total_volume: 576,
      commodity_description: 'Electronic Components and Machinery Parts',
      etd: '2025-07-25T08:00:00Z',
      eta: '2025-08-15T14:00:00Z',
      created_at: '2025-07-20T09:00:00Z',
      updated_at: '2025-08-07T14:30:00Z'
    };

    const tabs: DetailViewTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📋',
        component: 'BLOverview'
      },
      {
        id: 'containers',
        label: 'Containers',
        badge: mockBLDetail.total_containers,
        icon: '📦',
        component: 'BLContainers'
      },
      {
        id: 'parties',
        label: 'Parties',
        icon: '🏢',
        component: 'BLParties'
      },
      {
        id: 'documents',
        label: 'Documents',
        badge: 5,
        icon: '📄',
        component: 'BLDocuments'
      },
      {
        id: 'activities',
        label: 'Activities',
        badge: 12,
        icon: '📝',
        component: 'BLActivities'
      }
    ];

    return {
      entity: mockBLDetail as any,
      metadata: {
        permissions: {
          canEdit: true,
          canDelete: false,
          canComment: true,
          canShare: true
        },
        tabs,
        breadcrumbs: [
          { label: 'Bills of Lading', href: '/bills-of-lading' },
          { label: mockBLDetail.bl_number }
        ]
      },
      activities: [
        {
          id: 'activity-1',
          action: 'status_changed',
          description: 'Status changed from "confirmed" to "in_transit"',
          user_name: 'John Smith',
          user_id: 'user-1',
          created_at: '2025-08-07T14:30:00Z',
          updated_at: '2025-08-07T14:30:00Z',
          changes: {
            status: {
              from: 'confirmed',
              to: 'in_transit'
            }
          }
        },
        {
          id: 'activity-2',
          action: 'created',
          description: 'Bill of Lading created',
          user_name: 'System',
          user_id: 'system',
          created_at: '2025-07-20T09:00:00Z',
          updated_at: '2025-07-20T09:00:00Z'
        }
      ],
      related: {
        containers: {
          count: 24,
          items: [
            {
              id: 'container-1',
              title: 'COSCO-123456',
              type: 'bl_container' as any,
              status: 'loaded'
            },
            {
              id: 'container-2', 
              title: 'COSCO-123457',
              type: 'bl_container' as any,
              status: 'loaded'
            }
          ]
        },
        invoices: {
          count: 3,
          items: [
            {
              id: 'invoice-1',
              title: 'INV-2025-001',
              type: 'invoice' as any,
              status: 'paid'
            }
          ]
        }
      }
    };
  };

  return (
    <ListDetailLayout
      entityType="bill_of_lading"
      onLoadList={loadBLList}
      onLoadDetail={loadBLDetail}
      config={{
        entityType: 'bill_of_lading',
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