import {
  Eye,
  Edit,
  Copy,
  Download,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import type { FolderAction } from './folder-card';

/**
 * Status-based folder action generator
 * Provides contextual menu actions based on folder status category
 */
export function getFolderActions(statusCategory?: string): FolderAction[] {
  switch (statusCategory) {
    case 'active':
      // Active folders: Full functionality
      return [
        { id: 'view', label: 'view', icon: Eye },
        { id: 'edit', label: 'edit', icon: Edit },
        { separator: true, id: 'sep1' },
        { id: 'duplicate', label: 'duplicate', icon: Copy },
        { id: 'export', label: 'export', icon: Download },
        { id: 'archive', label: 'archive', icon: Archive },
        { separator: true, id: 'sep2' },
        { id: 'delete', label: 'delete', icon: Trash2, variant: 'destructive' },
      ];

    case 'completed':
      // Completed folders: View-only + export + archive
      return [
        { id: 'view', label: 'view', icon: Eye },
        { separator: true, id: 'sep1' },
        { id: 'duplicate', label: 'duplicate', icon: Copy },
        { id: 'export', label: 'export', icon: Download },
        { id: 'archive', label: 'archive', icon: Archive },
        { separator: true, id: 'sep2' },
        { id: 'delete', label: 'delete', icon: Trash2, variant: 'destructive' },
      ];

    case 'archived':
      // Archived folders: View + restore + export
      return [
        { id: 'view', label: 'view', icon: Eye },
        { separator: true, id: 'sep1' },
        { id: 'restore', label: 'restore', icon: RotateCcw },
        { id: 'export', label: 'export', icon: Download },
        { separator: true, id: 'sep2' },
        { id: 'delete', label: 'delete', icon: Trash2, variant: 'destructive' },
      ];

    case 'deleted':
      // Deleted folders: Minimal actions
      return [
        { id: 'view', label: 'view', icon: Eye },
        { separator: true, id: 'sep1' },
        { id: 'restore', label: 'restore', icon: RotateCcw },
        { separator: true, id: 'sep2' },
        { 
          id: 'delete_permanently', 
          label: 'delete_permanently', 
          icon: AlertTriangle, 
          variant: 'destructive' 
        },
      ];

    default:
      // Default fallback: Full functionality
      return [
        { id: 'view', label: 'view', icon: Eye },
        { id: 'edit', label: 'edit', icon: Edit },
        { separator: true, id: 'sep1' },
        { id: 'duplicate', label: 'duplicate', icon: Copy },
        { id: 'export', label: 'export', icon: Download },
        { id: 'archive', label: 'archive', icon: Archive },
        { separator: true, id: 'sep2' },
        { id: 'delete', label: 'delete', icon: Trash2, variant: 'destructive' },
      ];
  }
}

/**
 * Action availability checker
 * Determines if a specific action is available for the given status
 */
export function isActionAvailable(actionId: string, statusCategory?: string): boolean {
  const actions = getFolderActions(statusCategory);
  return actions.some(action => action.id === actionId && !action.separator);
}

/**
 * Get action context for analytics or logging
 */
export function getActionContext(statusCategory?: string) {
  return {
    statusCategory,
    availableActions: getFolderActions(statusCategory)
      .filter(action => !action.separator)
      .map(action => action.id),
    actionCount: getFolderActions(statusCategory)
      .filter(action => !action.separator).length
  };
}