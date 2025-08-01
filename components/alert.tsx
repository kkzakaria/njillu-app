"use client"

import { InfoIcon, TriangleAlert, CircleAlert, CircleCheckIcon, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const alertVariants = cva(
  "rounded-md border px-4 py-3 text-sm relative",
  {
    variants: {
      variant: {
        info: "border-blue-500/50 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20",
        warning: "border-amber-500/50 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20",
        error: "border-red-500/50 text-red-600 bg-red-50/50 dark:bg-red-950/20",
        success: "border-emerald-500/50 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconMap = {
  info: InfoIcon,
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheckIcon,
}

export interface AlertProps extends VariantProps<typeof alertVariants> {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function Alert({ 
  children, 
  variant = "info", 
  onClose, 
  className,
  ...props 
}: AlertProps) {
  const Icon = iconMap[variant || "info"]

  return (
    <div 
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon
          className="opacity-60 flex-shrink-0 mt-0.5"
          size={16}
          aria-hidden="true"
        />
        <div className="flex-1">{children}</div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-auto p-1 text-current hover:bg-current/10"
            aria-label="Fermer l'alerte"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}

export { alertVariants }