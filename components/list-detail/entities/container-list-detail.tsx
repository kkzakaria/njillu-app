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
// CONTAINER ARRIVALS LIST-DETAIL LAYOUT
// ============================================================================

interface ContainerListDetailLayoutProps {
  className?: string;
}

export function ContainerListDetailLayout({ className }: ContainerListDetailLayoutProps) {
  // Mock data loader for Container Arrivals list
  const loadContainerList = async (params: ListApiParams): Promise<ListViewResponse<'container_arrival_tracking'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    // Mock Container Arrivals data
    const mockContainers: ListViewItem<'container_arrival_tracking'>[] = [
      {
        id: 'container-001',
        entityType: 'container_arrival_tracking',
        title: 'COSCO-123456',
        subtitle: 'Shanghai → Le Havre',
        status: 'delayed',
        priority: 'urgent',
        updatedAt: '2025-08-07T16:30:00Z',
        preview: {
          id: 'container-001',
          container_number: 'COSCO-123456',
          status: 'delayed',
          vessel_name: 'COSCO SHIPPING UNIVERSE',
          voyage_number: 'VOY-2025-08-001',
          origin_port: 'Shanghai',
          destination_port: 'Le Havre',
          scheduled_arrival: '2025-08-10T08:00:00Z',
          estimated_arrival: '2025-08-12T14:00:00Z',
          delay_hours: 54,
          delay_reason: 'Weather conditions',
          container_type: '40HC',
          commodity: 'Electronics',
          bl_reference: 'BL-2025-001',
          booking_reference: 'BOOK-2025-001',
          created_at: '2025-07-25T10:00:00Z',
          updated_at: '2025-08-07T16:30:00Z'
        } as any,
        badges: [
          {
            label: '54h delay',
            variant: 'danger',
            icon: '⏰',
            tooltip: '54 hours delayed due to weather'
          },
          {
            label: '40HC',
            variant: 'info',
            icon: '📦',
            tooltip: '40-foot High Cube container'
          },
          {
            label: 'Weather',
            variant: 'warning',
            icon: '🌊',
            tooltip: 'Delay due to weather conditions'
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
            id: 'notify',
            label: 'Notify Client',
            icon: '📧',
            variant: 'primary'
          }
        ] as ListItemAction[]
      },
      {
        id: 'container-002',
        entityType: 'container_arrival_tracking',
        title: 'MAERSK-789012',
        subtitle: 'Rotterdam → Hamburg',
        status: 'arrived',
        priority: 'high',
        updatedAt: '2025-08-07T12:15:00Z',
        preview: {
          id: 'container-002',
          container_number: 'MAERSK-789012',
          status: 'arrived',
          vessel_name: 'MAERSK EDINBURGH',
          voyage_number: 'VOY-2025-07-045',
          origin_port: 'Rotterdam',
          destination_port: 'Hamburg',
          scheduled_arrival: '2025-08-07T10:00:00Z',
          actual_arrival: '2025-08-07T09:45:00Z',
          container_type: '20DV',
          commodity: 'Machinery Parts',
          bl_reference: 'BL-2025-002',
          booking_reference: 'BOOK-2025-002',
          created_at: '2025-08-05T14:30:00Z',
          updated_at: '2025-08-07T12:15:00Z'
        } as any,
        badges: [
          {
            label: 'On time',
            variant: 'success',
            icon: '✅',
            tooltip: 'Arrived 15 minutes early'
          },
          {
            label: '20DV',
            variant: 'info',
            icon: '📦'
          },
          {
            label: 'Processing',
            variant: 'info',
            icon: '⚡'
          }
        ] as ListItemBadge[]
      },
      {
        id: 'container-003',
        entityType: 'container_arrival_tracking',
        title: 'MSC-456789',
        subtitle: 'Antwerp → Valencia',
        status: 'scheduled',
        priority: 'medium',
        updatedAt: '2025-08-06T18:00:00Z',
        preview: {
          id: 'container-003',
          container_number: 'MSC-456789',
          status: 'scheduled',
          vessel_name: 'MSC MEDITERRANEAN',
          voyage_number: 'VOY-2025-08-012',
          origin_port: 'Antwerp',
          destination_port: 'Valencia',
          scheduled_arrival: '2025-08-09T16:00:00Z',
          estimated_arrival: '2025-08-09T16:00:00Z',
          container_type: '40DV',
          commodity: 'Textiles',
          bl_reference: 'BL-2025-003',
          booking_reference: 'BOOK-2025-003',
          created_at: '2025-08-06T18:00:00Z',
          updated_at: '2025-08-06T18:00:00Z'
        } as any,
        badges: [
          {
            label: '2 days',
            variant: 'info',
            icon: '📅',
            tooltip: 'Arriving in 2 days'
          },
          {
            label: '40DV',
            variant: 'info',
            icon: '📦'
          }
        ] as ListItemBadge[]
      },
      {
        id: 'container-004',
        entityType: 'container_arrival_tracking',
        title: 'CMA-234567',
        subtitle: 'Marseille → Barcelona',
        status: 'processing',
        priority: 'low',
        updatedAt: '2025-08-05T14:20:00Z',
        preview: {
          id: 'container-004',
          container_number: 'CMA-234567',
          status: 'processing',
          vessel_name: 'CMA CGM ANTOINE DE SAINT EXUPERY',
          voyage_number: 'VOY-2025-07-089',
          origin_port: 'Marseille',
          destination_port: 'Barcelona',
          scheduled_arrival: '2025-08-05T08:00:00Z',
          actual_arrival: '2025-08-05T07:30:00Z',
          container_type: '20HC',
          commodity: 'Food Products',
          bl_reference: 'BL-2025-004',
          booking_reference: 'BOOK-2025-004',
          processing_status: 'customs_inspection',
          created_at: '2025-08-03T09:15:00Z',
          updated_at: '2025-08-05T14:20:00Z'
        } as any,
        badges: [
          {
            label: 'Customs',
            variant: 'warning',
            icon: '🏛️',
            tooltip: 'Under customs inspection'
          },
          {
            label: '20HC',
            variant: 'info',
            icon: '📦'
          }
        ] as ListItemBadge[]
      }
    ];

    // Apply search filter
    let filteredContainers = mockContainers;
    if (params.search) {
      filteredContainers = mockContainers.filter(container =>
        container.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        container.subtitle?.toLowerCase().includes(params.search!.toLowerCase()) ||
        ((container.preview as any).vessel_name?.toLowerCase().includes(params.search!.toLowerCase()))
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paginatedContainers = filteredContainers.slice(start, start + limit);

    return {
      data: paginatedContainers,
      pagination: {
        current_page: page,
        page_size: limit,
        total_count: filteredContainers.length,
        total_pages: Math.ceil(filteredContainers.length / limit),
        has_next_page: start + limit < filteredContainers.length,
        has_previous_page: page > 1
      },
      aggregates: {
        statusCounts: {
          'scheduled': 45,
          'arrived': 23,
          'delayed': 8,
          'processing': 12,
          'completed': 156
        }
      },
      facets: [
        {
          field: 'status',
          label: 'Status',
          values: [
            { value: 'scheduled', label: 'Scheduled', count: 45 },
            { value: 'arrived', label: 'Arrived', count: 23 },
            { value: 'delayed', label: 'Delayed', count: 8 },
            { value: 'processing', label: 'Processing', count: 12 },
            { value: 'completed', label: 'Completed', count: 156 }
          ]
        },
        {
          field: 'container_type',
          label: 'Container Type',
          values: [
            { value: '20DV', label: '20\' Dry Van', count: 89 },
            { value: '40DV', label: '40\' Dry Van', count: 102 },
            { value: '20HC', label: '20\' High Cube', count: 34 },
            { value: '40HC', label: '40\' High Cube', count: 67 }
          ]
        },
        {
          field: 'urgency',
          label: 'Urgency',
          values: [
            { value: 'urgent', label: 'Urgent', count: 12 },
            { value: 'high', label: 'High', count: 23 },
            { value: 'medium', label: 'Medium', count: 45 },
            { value: 'low', label: 'Low', count: 78 }
          ]
        }
      ]
    };
  };

  // Mock data loader for Container detail
  const loadContainerDetail = async (params: DetailApiParams): Promise<DetailViewData<'container_arrival_tracking'>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock detailed Container data
    const mockContainerDetail = {
      id: params.id,
      container_number: `COSCO-${params.id.split('-')[1]}23456`,
      status: 'delayed',
      vessel_name: 'COSCO SHIPPING UNIVERSE',
      vessel_imo: 'IMO9876543',
      voyage_number: 'VOY-2025-08-001',
      origin_port: 'Shanghai',
      destination_port: 'Le Havre',
      scheduled_arrival: '2025-08-10T08:00:00Z',
      estimated_arrival: '2025-08-12T14:00:00Z',
      actual_arrival: null,
      delay_hours: 54,
      delay_reason: 'Severe weather conditions in Bay of Biscay',
      container_type: '40HC',
      container_size: '40ft High Cube',
      seal_number: 'SEAL123456',
      commodity: 'Electronic Components and Accessories',
      weight: 25600,
      volume: 67.5,
      bl_reference: 'BL-2025-001',
      booking_reference: 'BOOK-2025-001',
      shipper: 'Shanghai Export Co.',
      consignee: 'Le Havre Import Ltd.',
      port_of_loading: 'Shanghai',
      port_of_discharge: 'Le Havre',
      terminal: 'Terminal A',
      berth: 'Berth 12',
      tracking_events: [
        {
          timestamp: '2025-08-07T16:30:00Z',
          location: 'Bay of Biscay',
          event: 'Vessel delayed due to weather',
          description: 'Storm conditions causing 54-hour delay'
        },
        {
          timestamp: '2025-07-28T14:20:00Z',
          location: 'Shanghai Port',
          event: 'Container loaded',
          description: 'Container loaded onto vessel'
        },
        {
          timestamp: '2025-07-27T09:15:00Z',
          location: 'Shanghai Terminal',
          event: 'Container received',
          description: 'Container arrived at terminal'
        }
      ],
      performance_metrics: {
        on_time_percentage: 78,
        average_delay_hours: 12,
        tracking_accuracy: 95
      },
      created_at: '2025-07-25T10:00:00Z',
      updated_at: '2025-08-07T16:30:00Z'
    };

    const tabs: DetailViewTab[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📋',
        component: 'ContainerOverview'
      },
      {
        id: 'tracking',
        label: 'Tracking',
        badge: mockContainerDetail.tracking_events.length,
        icon: '🚢',
        component: 'ContainerTracking'
      },
      {
        id: 'vessel',
        label: 'Vessel Info',
        icon: '⚓',
        component: 'ContainerVessel'
      },
      {
        id: 'cargo',
        label: 'Cargo Details',
        icon: '📦',
        component: 'ContainerCargo'
      },
      {
        id: 'alerts',
        label: 'Alerts',
        badge: 3,
        icon: '🚨',
        component: 'ContainerAlerts'
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: '📊',
        component: 'ContainerPerformance'
      },
      {
        id: 'activities',
        label: 'Activities',
        badge: 8,
        icon: '📝',
        component: 'ContainerActivities'
      }
    ];

    return {
      entity: mockContainerDetail as any,
      metadata: {
        permissions: {
          canEdit: true,
          canDelete: false,
          canComment: true,
          canShare: true
        },
        tabs,
        breadcrumbs: [
          { label: 'Container Arrivals', href: '/containers' },
          { label: mockContainerDetail.container_number }
        ]
      },
      activities: [
        {
          id: 'activity-1',
          action: 'status_changed',
          description: 'Status changed from "scheduled" to "delayed"',
          created_at: '2025-08-07T16:30:00Z',
          updated_at: '2025-08-07T16:30:00Z',
          created_by: 'system',
          updated_by: 'system',
          changes: {
            status: {
              from: 'scheduled',
              to: 'delayed'
            },
            estimated_arrival: {
              from: '2025-08-10T08:00:00Z',
              to: '2025-08-12T14:00:00Z'
            }
          }
        },
        {
          id: 'activity-2',
          action: 'updated',
          description: 'Tracking information updated',
          created_at: '2025-08-06T10:20:00Z',
          updated_at: '2025-08-06T10:20:00Z',
          created_by: 'port-001',
          updated_by: 'port-001'
        },
        {
          id: 'activity-3',
          action: 'created',
          description: 'Container tracking initiated',
          created_at: '2025-07-25T10:00:00Z',
          updated_at: '2025-07-25T10:00:00Z',
          created_by: 'system',
          updated_by: 'system'
        }
      ],
      related: {
        bill_of_lading: {
          count: 1,
          items: [
            {
              id: 'bl-001',
              title: 'BL-2025-001',
              type: 'bill_of_lading' as any,
              status: 'in_transit'
            }
          ]
        },
        alerts: {
          count: 3,
          items: [
            {
              id: 'alert-1',
              title: 'Delay Alert',
              type: 'alert' as any,
              status: 'active'
            },
            {
              id: 'alert-2',
              title: 'Weather Warning',
              type: 'alert' as any,
              status: 'active'
            }
          ]
        },
        notifications: {
          count: 5,
          items: [
            {
              id: 'notif-1',
              title: 'Client Notification Sent',
              type: 'notification' as any,
              status: 'sent'
            }
          ]
        }
      }
    };
  };

  return (
    <ListDetailLayout
      entityType="container_arrival_tracking"
      onLoadList={loadContainerList}
      onLoadDetail={loadContainerDetail}
      config={{
        entityType: 'container_arrival_tracking',
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