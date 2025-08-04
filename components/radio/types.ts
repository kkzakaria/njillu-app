import * as React from "react"

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

export interface BaseRadioProps {
  options: RadioOption[]
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  className?: string
  disabled?: boolean
  required?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
}

export interface ColoredRadioProps extends BaseRadioProps {
  colorScheme?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "indigo" | "blue" | "green" | "red"
}

export interface CardRadioProps extends BaseRadioProps {
  layout?: "grid" | "flex"
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  cardSize?: "sm" | "md" | "lg"
  showIcons?: boolean
}

export interface ChipRadioProps extends BaseRadioProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "filled"
}

export type RadioVariant = "default" | "colored" | "card" | "chip"
export type RadioSize = "sm" | "md" | "lg"
export type RadioColorScheme = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "indigo" | "blue" | "green" | "red"