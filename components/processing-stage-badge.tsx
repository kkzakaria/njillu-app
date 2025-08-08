import * as React from "react";
import { 
  FileText, 
  ShoppingCart, 
  FileCheck, 
  Shield, 
  Building, 
  Truck, 
  Receipt, 
  Package 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import type { ProcessingStage, StagePriority, StageStatus } from "@/types/folders/workflow/stages";

interface ProcessingStageBadgeProps {
  stage: ProcessingStage;
  status?: StageStatus;
  priority?: StagePriority;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function ProcessingStageBadge({ 
  stage, 
  status = 'pending',
  priority = 'normal',
  className, 
  children, 
  showIcon = true 
}: ProcessingStageBadgeProps) {
  
  // Get icon for each stage
  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage) {
      case 'enregistrement':
        return FileText;
      case 'revision_facture_commerciale':
        return ShoppingCart;
      case 'elaboration_fdi':
        return FileCheck;
      case 'elaboration_rfcv':
        return FileCheck;
      case 'declaration_douaniere':
        return Shield;
      case 'service_exploitation':
        return Building;
      case 'facturation_client':
        return Receipt;
      case 'livraison':
        return Truck;
      default:
        return Package;
    }
  };

  // Get badge variant based on status and priority
  const getBadgeVariant = (status: StageStatus, priority: StagePriority): 'default' | 'secondary' | 'destructive' | 'outline' => {
    // Priority takes precedence for visual distinction
    if (priority === 'urgent' || priority === 'high') {
      return status === 'blocked' ? 'destructive' : 'default';
    }

    // Status-based variants
    switch (status) {
      case 'completed':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'blocked':
        return 'destructive';
      case 'skipped':
        return 'outline';
      case 'pending':
      default:
        return 'outline';
    }
  };

  // Get color classes based on status
  const getStatusColors = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'blocked':
        return 'text-red-600';
      case 'skipped':
        return 'text-gray-500';
      case 'pending':
      default:
        return 'text-amber-600';
    }
  };

  // Animation based on status and priority
  const shouldAnimate = (status === 'blocked' && priority === 'urgent') || 
                       (status === 'in_progress' && priority === 'urgent');

  const Icon = getStageIcon(stage);
  const badgeContent = children ?? stage;

  return (
    <Badge
      variant={getBadgeVariant(status, priority)}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1",
        shouldAnimate && "animate-pulse",
        className
      )}
      role="status"
      aria-label={`Étape: ${stage}, Statut: ${status}`}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "w-3.5 h-3.5",
            getStatusColors(status)
          )} 
          aria-hidden="true" 
        />
      )}
      {badgeContent}
    </Badge>
  );
}