import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface UrgentBadgeProps {
  className?: string;
  children?: React.ReactNode;
}

export function Urgent({ className = "", children }: UrgentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase animate-pulse ${className}`}
    >
      <AlertTriangle className="w-3 h-3 text-red-500" />
      {children ?? "Urgent"}
    </span>
  );
} 