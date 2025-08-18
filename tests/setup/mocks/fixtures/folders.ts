/**
 * Folder test data fixtures and factories
 * Provides mock data for testing folder-related functionality
 */

import type { Folder, FolderStatus, FolderPriority } from '@/types/folders/core';
import type { FolderAlert } from '@/types/folders/alerts';

/**
 * Creates mock folder data with default values
 */
export function createMockFolderData(overrides: Partial<Folder> = {}): Omit<Folder, 'id' | 'created_at' | 'updated_at'> {
  const defaults: Omit<Folder, 'id' | 'created_at' | 'updated_at'> = {
    client_id: '550e8400-e29b-41d4-a716-446655440000',
    folder_number: `FOL-${Date.now()}`,
    status: 'pending',
    priority: 'normal',
    description: 'Test folder for automated testing',
    estimated_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    actual_completion_date: null,
    processing_stage: 'documentation_review',
    processing_notes: 'Folder created for testing purposes',
    assigned_to: null,
    tags: ['test', 'automated'],
    metadata: {
      source: 'test_suite',
      test_type: 'unit_test'
    },
    created_by: '550e8400-e29b-41d4-a716-446655440000',
    updated_by: '550e8400-e29b-41d4-a716-446655440000',
    deleted_at: null,
    deletion_reason: null
  };

  return {
    ...defaults,
    ...overrides,
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock folder with active status
 */
export function createMockActiveFolderData(overrides: Partial<Folder> = {}): Omit<Folder, 'id' | 'created_at' | 'updated_at'> {
  return createMockFolderData({
    status: 'active',
    processing_stage: 'in_progress',
    processing_notes: 'Folder is actively being processed',
    assigned_to: '550e8400-e29b-41d4-a716-446655440001',
    ...overrides
  });
}

/**
 * Creates mock folder with completed status
 */
export function createMockCompletedFolderData(overrides: Partial<Folder> = {}): Omit<Folder, 'id' | 'created_at' | 'updated_at'> {
  return createMockFolderData({
    status: 'completed',
    processing_stage: 'completed',
    processing_notes: 'Folder processing completed successfully',
    actual_completion_date: new Date().toISOString(),
    ...overrides
  });
}

/**
 * Creates mock folder with high priority
 */
export function createMockHighPriorityFolderData(overrides: Partial<Folder> = {}): Omit<Folder, 'id' | 'created_at' | 'updated_at'> {
  return createMockFolderData({
    priority: 'high',
    estimated_completion_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    processing_notes: 'High priority folder requiring expedited processing',
    tags: ['urgent', 'high-priority', 'test'],
    ...overrides
  });
}

/**
 * Creates mock folder with urgent priority
 */
export function createMockUrgentFolderData(overrides: Partial<Folder> = {}): Omit<Folder, 'id' | 'created_at' | 'updated_at'> {
  return createMockFolderData({
    priority: 'urgent',
    estimated_completion_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    processing_notes: 'Urgent folder requiring immediate attention',
    assigned_to: '550e8400-e29b-41d4-a716-446655440001',
    tags: ['urgent', 'critical', 'test'],
    ...overrides
  });
}

/**
 * Creates mock folder alert data
 */
export function createMockFolderAlertData(overrides: Partial<FolderAlert> = {}): Omit<FolderAlert, 'id' | 'created_at'> {
  const defaults: Omit<FolderAlert, 'id' | 'created_at'> = {
    folder_id: '550e8400-e29b-41d4-a716-446655440000',
    alert_type: 'deadline_approaching',
    severity: 'medium',
    title: 'Folder Deadline Approaching',
    message: 'This folder is approaching its estimated completion deadline',
    is_read: false,
    is_resolved: false,
    resolved_at: null,
    resolved_by: null,
    metadata: {
      days_until_deadline: 3,
      original_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  return {
    ...defaults,
    ...overrides,
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock critical folder alert
 */
export function createMockCriticalFolderAlertData(overrides: Partial<FolderAlert> = {}): Omit<FolderAlert, 'id' | 'created_at'> {
  return createMockFolderAlertData({
    alert_type: 'deadline_exceeded',
    severity: 'critical',
    title: 'Folder Deadline Exceeded',
    message: 'This folder has exceeded its estimated completion deadline and requires immediate attention',
    metadata: {
      days_overdue: 2,
      original_deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    ...overrides
  });
}

/**
 * Creates mock processing issue alert
 */
export function createMockProcessingIssueFolderAlertData(overrides: Partial<FolderAlert> = {}): Omit<FolderAlert, 'id' | 'created_at'> {
  return createMockFolderAlertData({
    alert_type: 'processing_issue',
    severity: 'high',
    title: 'Processing Issue Detected',
    message: 'An issue has been detected during folder processing that requires attention',
    metadata: {
      issue_type: 'missing_documentation',
      stage: 'documentation_review',
      required_action: 'contact_client'
    },
    ...overrides
  });
}

/**
 * Factory class for creating multiple related folders
 */
export class FolderFactory {
  private baseClientId: string;
  private counter: number = 0;

  constructor(baseClientId: string = '550e8400-e29b-41d4-a716-446655440000') {
    this.baseClientId = baseClientId;
  }

  /**
   * Creates a batch of folders with different statuses
   */
  createStatusVarietyBatch(count: number = 10): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const statuses: FolderStatus[] = ['pending', 'active', 'on_hold', 'completed', 'cancelled'];
    const folders: Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> = [];

    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      folders.push(createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-BATCH-${this.counter++}`,
        status,
        description: `Test folder ${i + 1} with ${status} status`
      }));
    }

    return folders;
  }

  /**
   * Creates a batch of folders with different priorities
   */
  createPriorityVarietyBatch(count: number = 8): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const priorities: FolderPriority[] = ['low', 'normal', 'high', 'urgent'];
    const folders: Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> = [];

    for (let i = 0; i < count; i++) {
      const priority = priorities[i % priorities.length];
      folders.push(createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-PRIORITY-${this.counter++}`,
        priority,
        description: `Test folder ${i + 1} with ${priority} priority`
      }));
    }

    return folders;
  }

  /**
   * Creates folders for performance testing
   */
  createPerformanceTestBatch(count: number = 100): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const folders: Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> = [];
    const statuses: FolderStatus[] = ['pending', 'active', 'completed'];
    const priorities: FolderPriority[] = ['low', 'normal', 'high'];

    for (let i = 0; i < count; i++) {
      folders.push(createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-PERF-${this.counter++}`,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        description: `Performance test folder ${i + 1}`,
        tags: ['performance', 'test', `batch-${Math.floor(i / 10)}`],
        metadata: {
          batch_id: Math.floor(i / 10),
          test_type: 'performance',
          sequence: i
        }
      }));
    }

    return folders;
  }

  /**
   * Creates folders with specific processing stages
   */
  createProcessingStagesBatch(): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const stages = [
      'documentation_review',
      'initial_assessment',
      'in_progress',
      'quality_check',
      'final_review',
      'completed'
    ];

    return stages.map((stage, index) => createMockFolderData({
      client_id: this.baseClientId,
      folder_number: `FOL-STAGE-${this.counter++}`,
      processing_stage: stage as any,
      status: stage === 'completed' ? 'completed' : 'active',
      description: `Test folder in ${stage} stage`,
      processing_notes: `Folder currently in ${stage} processing stage`
    }));
  }

  /**
   * Creates folders for deadline testing
   */
  createDeadlineTestBatch(): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return [
      // Overdue folders
      createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-OVERDUE-${this.counter++}`,
        estimated_completion_date: new Date(now - 5 * dayMs).toISOString(),
        status: 'active',
        priority: 'high',
        description: 'Overdue folder (5 days past deadline)'
      }),
      // Due today
      createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-TODAY-${this.counter++}`,
        estimated_completion_date: new Date(now).toISOString(),
        status: 'active',
        priority: 'high',
        description: 'Folder due today'
      }),
      // Due soon
      createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-SOON-${this.counter++}`,
        estimated_completion_date: new Date(now + 2 * dayMs).toISOString(),
        status: 'active',
        priority: 'normal',
        description: 'Folder due in 2 days'
      }),
      // Future deadline
      createMockFolderData({
        client_id: this.baseClientId,
        folder_number: `FOL-FUTURE-${this.counter++}`,
        estimated_completion_date: new Date(now + 14 * dayMs).toISOString(),
        status: 'pending',
        priority: 'normal',
        description: 'Folder due in 2 weeks'
      })
    ];
  }

  /**
   * Resets the counter for folder numbers
   */
  resetCounter(): void {
    this.counter = 0;
  }

  /**
   * Sets a new base client ID for subsequent folders
   */
  setBaseClientId(clientId: string): void {
    this.baseClientId = clientId;
  }
}

/**
 * Creates a batch of folder alerts for testing
 */
export function createMockFolderAlertsBatch(folderId: string, count: number = 5): Array<Omit<FolderAlert, 'id' | 'created_at'>> {
  const alertTypes = ['deadline_approaching', 'processing_issue', 'status_change', 'priority_change'] as const;
  const severities = ['low', 'medium', 'high', 'critical'] as const;
  const alerts: Array<Omit<FolderAlert, 'id' | 'created_at'>> = [];

  for (let i = 0; i < count; i++) {
    const alertType = alertTypes[i % alertTypes.length];
    const severity = severities[i % severities.length];
    
    alerts.push(createMockFolderAlertData({
      folder_id: folderId,
      alert_type: alertType,
      severity,
      title: `Test Alert ${i + 1}`,
      message: `This is test alert ${i + 1} of type ${alertType}`,
      is_read: i % 3 === 0, // Some alerts are read
      is_resolved: i % 4 === 0, // Some alerts are resolved
      metadata: {
        test_alert_index: i,
        alert_type: alertType,
        severity_level: severity
      }
    }));
  }

  return alerts;
}

/**
 * Utility functions for test data manipulation
 */
export const FolderTestUtils = {
  /**
   * Creates folders distributed across multiple clients
   */
  createMultiClientFolders(clientIds: string[], foldersPerClient: number = 3): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const folders: Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> = [];
    
    clientIds.forEach((clientId, clientIndex) => {
      for (let i = 0; i < foldersPerClient; i++) {
        folders.push(createMockFolderData({
          client_id: clientId,
          folder_number: `FOL-CLIENT${clientIndex}-${i}`,
          description: `Folder ${i + 1} for client ${clientIndex + 1}`,
          status: i % 2 === 0 ? 'active' : 'pending',
          priority: i === 0 ? 'high' : 'normal'
        }));
      }
    });

    return folders;
  },

  /**
   * Creates folders with realistic processing timelines
   */
  createRealisticTimeline(baseDate: Date = new Date()): Array<Omit<Folder, 'id' | 'created_at' | 'updated_at'>> {
    const timeline = [];
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Folder started 10 days ago, due in 5 days
    timeline.push(createMockFolderData({
      folder_number: 'FOL-TIMELINE-1',
      estimated_completion_date: new Date(baseDate.getTime() + 5 * dayMs).toISOString(),
      status: 'active',
      processing_stage: 'in_progress',
      description: 'Folder with realistic timeline - on track'
    }));

    // Folder started 15 days ago, was due 2 days ago (overdue)
    timeline.push(createMockFolderData({
      folder_number: 'FOL-TIMELINE-2',
      estimated_completion_date: new Date(baseDate.getTime() - 2 * dayMs).toISOString(),
      status: 'active',
      priority: 'urgent',
      processing_stage: 'quality_check',
      description: 'Overdue folder requiring urgent attention'
    }));

    // Recently completed folder
    timeline.push(createMockFolderData({
      folder_number: 'FOL-TIMELINE-3',
      estimated_completion_date: new Date(baseDate.getTime() - 1 * dayMs).toISOString(),
      actual_completion_date: new Date(baseDate.getTime() - 1 * dayMs).toISOString(),
      status: 'completed',
      processing_stage: 'completed',
      description: 'Recently completed folder'
    }));

    return timeline;
  }
};