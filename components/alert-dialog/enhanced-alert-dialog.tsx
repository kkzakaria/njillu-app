"use client"

import * as React from "react"
import { StandardAlertDialog } from "./standard-alert-dialog"
import { ScrollableDialog } from "./scrollable-dialog"
import { type BaseAlertDialogProps } from "./types"

export const EnhancedAlertDialog = React.forwardRef<
  React.ComponentRef<typeof StandardAlertDialog>,
  BaseAlertDialogProps
>(({
  onAction,
  isDialog = false,
  scrollable = "none",
  ...props
}, ref) => {
  const [isLoading, setIsLoading] = React.useState(false)
  
  const handleAction = async () => {
    if (props.disabled || isLoading) return
    
    setIsLoading(true)
    try {
      await onAction?.()
    } finally {
      setIsLoading(false)
    }
  }

  const isScrollable = scrollable !== "none"

  if (isDialog || isScrollable) {
    return (
      <ScrollableDialog
        ref={ref}
        onAction={handleAction}
        isLoading={isLoading}
        scrollable={scrollable}
        {...props}
      />
    )
  }

  return (
    <StandardAlertDialog
      ref={ref}
      onAction={handleAction}
      isLoading={isLoading}
      {...props}
    />
  )
})

EnhancedAlertDialog.displayName = "EnhancedAlertDialog"