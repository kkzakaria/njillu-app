"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { alertDialogVariants, iconVariants } from "./variants"
import { getTypeIcon, getActionVariant } from "./icons"
import { type BaseAlertDialogProps } from "./types"

interface ScrollableDialogProps extends BaseAlertDialogProps {
  onAction: () => Promise<void>
  isLoading: boolean
}

export const ScrollableDialog = React.forwardRef<
  React.ComponentRef<typeof DialogContent>,
  ScrollableDialogProps
>(({
  className,
  type,
  size,
  scrollable,
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

  const renderIconWithContent = (content: React.ReactNode) => {
    if (!showIcon) return content
    
    return (
      <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4 mb-4">
        <div className={cn(iconVariants({ type }))} aria-hidden="true">
          <IconComponent size={16} />
        </div>
        <div className="flex-1">
          {content}
        </div>
      </div>
    )
  }

  const renderFooter = (className?: string) => (
    <DialogFooter className={cn("sm:justify-start", className)}>
      {!hideCancel && (
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
        </DialogClose>
      )}
      <DialogClose asChild>
        <Button 
          type="button" 
          variant={finalActionVariant}
          onClick={onAction}
          disabled={disabled || isLoading || actionLoading}
        >
          {(isLoading || actionLoading) ? "..." : actionText}
        </Button>
      </DialogClose>
    </DialogFooter>
  )

  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        ref={ref}
        className={cn(
          alertDialogVariants({ size, scrollable }),
          scrollable !== "none" && "flex flex-col gap-0 p-0",
          scrollable === "native" && "[&>button:last-child]:hidden",
          scrollable === "stickyHeader" && "[&>button:last-child]:top-3.5",
          scrollable === "stickyFooter" && "[&>button:last-child]:hidden",
          scrollable === "stickyBoth" && "[&>button:last-child]:top-3.5",
          className
        )}
        {...props}
      >
        {/* Native scrollable */}
        {scrollable === "native" && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{typeof description === "string" ? description : "Dialog content"}</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto">
              <div className="px-6 pt-6">
                <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
              </div>
              <div className="p-6">
                {renderIconWithContent(description)}
                {!showIcon && description}
                {children}
              </div>
            </div>
            {renderFooter("px-6 pb-6")}
          </>
        )}

        {/* Sticky header */}
        {scrollable === "stickyHeader" && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{typeof description === "string" ? description : "Dialog content"}</DialogDescription>
            </DialogHeader>
            <div className="border-b px-6 py-4">
              <h2 className="text-base font-semibold leading-none tracking-tight">{title}</h2>
            </div>
            <div className="overflow-y-auto">
              <div className="px-6 py-4">
                {renderIconWithContent(description)}
                {!showIcon && description}
                {children}
              </div>
              {renderFooter("px-6 pb-6")}
            </div>
          </>
        )}

        {/* Sticky footer */}
        {scrollable === "stickyFooter" && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{typeof description === "string" ? description : "Dialog content"}</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto">
              <div className="px-6 pt-6">
                <h2 className="text-base font-semibold leading-none tracking-tight">{title}</h2>
              </div>
              <div className="p-6">
                {renderIconWithContent(description)}
                {!showIcon && description}
                {children}
              </div>
            </div>
            {renderFooter("border-t px-6 py-4")}
          </>
        )}

        {/* Sticky both (header and footer) */}
        {scrollable === "stickyBoth" && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{typeof description === "string" ? description : "Dialog content"}</DialogDescription>
            </DialogHeader>
            <div className="border-b px-6 py-4">
              <h2 className="text-base font-semibold leading-none tracking-tight">{title}</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="px-6 py-4">
                {renderIconWithContent(description)}
                {!showIcon && description}
                {children}
              </div>
            </div>
            {renderFooter("border-t px-6 py-4")}
          </>
        )}

        {/* Non-scrollable */}
        {scrollable === "none" && (
          <>
            {showIcon ? (
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div className={cn(iconVariants({ type }))} aria-hidden="true">
                  <IconComponent size={16} />
                </div>
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
              </div>
            ) : (
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
            )}
            {children}
            {renderFooter()}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
})

ScrollableDialog.displayName = "ScrollableDialog"