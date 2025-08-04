import * as React from "react"

export interface StepDefinition {
  step: number
  title?: string
  description?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  image?: string
  content?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  completed?: boolean
}

export interface BaseStepperProps {
  steps?: StepDefinition[]
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
  disabled?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
}

export interface ControlledStepperProps extends BaseStepperProps {
  showControls?: boolean
  controlsPosition?: "top" | "bottom" | "both"
  nextLabel?: string
  prevLabel?: string
  finishLabel?: string
  onComplete?: () => void
  loading?: boolean
}

export interface ProcessStepperProps extends BaseStepperProps {
  currentProcess?: string
  onProcessChange?: (process: string) => void
  autoProgress?: boolean
  progressInterval?: number
}

export interface FormStepperProps extends BaseStepperProps {
  onStepValidation?: (step: number) => boolean | Promise<boolean>
  allowSkip?: boolean
  validateOnNext?: boolean
  showStepContent?: boolean
}

export type StepperVariant = "default" | "controlled" | "process" | "form" | "wizard"
export type StepperSize = "sm" | "md" | "lg"
export type StepperStyle = "default" | "minimal" | "outlined" | "filled"