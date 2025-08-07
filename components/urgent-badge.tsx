import * as React from "react";
import { AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import type { FolderUrgency } from "@/types/folders";

interface UrgentBadgeProps {
  urgency: FolderUrgency;
  className?: string;
  children?: React.ReactNode;
}

export function UrgentBadge({ urgency, className, children }: UrgentBadgeProps) {
  // Only show badge for rush and emergency levels
  if (urgency !== 'rush' && urgency !== 'emergency') {
    return null;
  }

  const isEmergency = urgency === 'emergency';
  const isRush = urgency === 'rush';

  const baseClasses = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase";
  
  const urgencyClasses = {
    rush: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse"
  };

  const Icon = isEmergency ? AlertTriangle : Zap;
  const iconClasses = isEmergency ? "w-3 h-3 text-red-500" : "w-3 h-3 text-orange-500";

  return (
    <span
      className={cn(
        baseClasses,
        urgencyClasses[urgency],
        className
      )}
      role="status"
      aria-label={`Urgence: ${urgency}`}
    >
      <Icon className={iconClasses} aria-hidden="true" />
      {children ?? (isEmergency ? "Urgence" : "Rush")}
    </span>
  );
} 