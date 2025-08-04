"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { alertDialogVariants, iconVariants } from "./variants"
import { getTypeIcon, getActionVariant } from "./icons"
import { type BaseAlertDialogProps } from "./types"

interface StandardAlertDialogProps extends BaseAlertDialogProps {
  onAction: () => Promise<void>
  isLoading: boolean
}

export const StandardAlertDialog = React.forwardRef<
  React.ComponentRef<typeof AlertDialogContent>,
  StandardAlertDialogProps
>(({
  className,
  type,
  size,
  title,
  description,
  children,
  trigger,
  cancelText = "Annuler",
  actionText = "Confirmer",
  onAction,
  onCancel,
  showIcon = false,
  icon,
  actionVariant = "default",
  actionLoading = false,
  hideCancel = false,
  disabled = false,
  isLoading,
  ...props
}, ref) => {
  const IconComponent = icon || getTypeIcon(type || "default")
  const finalActionVariant = getActionVariant(type || "default", actionVariant || "default")

  return (
    <AlertDialog>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent 
        ref={ref}
        className={cn(alertDialogVariants({ type, size }), className)}
        {...props}
      >
        {showIcon ? (
          <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
            <div className={cn(iconVariants({ type }))} aria-hidden="true">
              <IconComponent size={16} />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
          </div>
        ) : (
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
        )}
        {children}
        <AlertDialogFooter>
          {!hideCancel && (
            <AlertDialogCancel onClick={onCancel}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction 
            className={cn(buttonVariants({ variant: finalActionVariant }))}
            onClick={onAction}
            disabled={disabled || isLoading || actionLoading}
          >
            {(isLoading || actionLoading) ? "..." : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

StandardAlertDialog.displayName = "StandardAlertDialog"