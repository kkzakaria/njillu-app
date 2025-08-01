import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { alertDialogVariants } from "./variants"

export interface BaseAlertDialogProps extends VariantProps<typeof alertDialogVariants> {
  title: string
  description: string | React.ReactNode
  children?: React.ReactNode
  trigger?: React.ReactNode
  cancelText?: string
  actionText?: string
  onAction?: () => void | Promise<void>
  onCancel?: () => void
  showIcon?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
  isDialog?: boolean
  actionVariant?: ButtonVariant
  actionLoading?: boolean
  hideCancel?: boolean
  disabled?: boolean
}

export interface ConfirmationDeleteDialogProps {
  title?: string
  description?: string | React.ReactNode
  trigger?: React.ReactNode
  cancelText?: string
  actionText?: string
  onAction?: () => void | Promise<void>
  onCancel?: () => void
  confirmationText: string
  confirmationLabel?: string
  confirmationPlaceholder?: string
  className?: string
  actionLoading?: boolean
  disabled?: boolean
}

export interface OnboardingStep {
  title: string
  description: string
  image?: string
  content?: React.ReactNode
}

export interface OnboardingDialogProps {
  steps: OnboardingStep[]
  trigger?: React.ReactNode
  onComplete?: () => void
  onSkip?: () => void
  onStepChange?: (step: number) => void
  className?: string
  skipText?: string
  nextText?: string
  completeText?: string
  showProgressDots?: boolean
  autoReset?: boolean
}

export type AlertDialogType = "default" | "info" | "success" | "warning" | "error" | "question"
export type ScrollableMode = "none" | "native" | "stickyHeader" | "stickyFooter" | "stickyBoth"
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"