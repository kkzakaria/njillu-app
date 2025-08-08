import * as React from "react";
import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import type { FolderPriority } from "@/types/folders";

interface PriorityBadgeProps {
  priority: FolderPriority;
  className?: string;
  children?: React.ReactNode;
}

export function PriorityBadge({ priority, className, children }: PriorityBadgeProps) {
  // Get badge variant based on priority level
  const getBadgeVariant = (priority: FolderPriority): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (priority) {
      case 'critical':
      case 'urgent':
        return 'destructive';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Only show visual indicators for urgent and critical levels
  const showIcon = priority === 'urgent' || priority === 'critical';
  const isCritical = priority === 'critical';
  const isUrgent = priority === 'urgent';

  const Icon = isCritical ? AlertTriangle : Zap;
  const shouldAnimate = isCritical;

  const badgeContent = children ?? priority;

  return (
    <Badge
      variant={getBadgeVariant(priority)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold uppercase",
        shouldAnimate && "animate-pulse",
        className
      )}
      role="status"
      aria-label={`Priorité: ${priority}`}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "w-3 h-3",
            isCritical && "text-red-500",
            isUrgent && "text-orange-500"
          )} 
          aria-hidden="true" 
        />
      )}
      {badgeContent}
    </Badge>
  );
} 