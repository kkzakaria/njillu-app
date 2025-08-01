"use client"

import { useId } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface EnhancedCheckboxProps {
  label?: string
  description?: string
  color?: "default" | "primary" | "success" | "warning" | "destructive"
  size?: "sm" | "md" | "lg"
  position?: "left" | "right"
  disabled?: boolean
  checked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean | "indeterminate") => void
  className?: string
  labelClassName?: string
  id?: string
}

const colorVariants = {
  default: "",
  primary: "[&_[data-state=checked]]:bg-primary [&_[data-state=checked]]:border-primary [&_[data-state=checked]]:text-primary-foreground",
  success: "[&_[data-state=checked]]:bg-emerald-600 [&_[data-state=checked]]:border-emerald-600 [&_[data-state=checked]]:text-white",
  warning: "[&_[data-state=checked]]:bg-amber-500 [&_[data-state=checked]]:border-amber-500 [&_[data-state=checked]]:text-white",
  destructive: "[&_[data-state=checked]]:bg-destructive [&_[data-state=checked]]:border-destructive [&_[data-state=checked]]:text-destructive-foreground"
}

const sizeVariants = {
  sm: "size-3",
  md: "size-4", 
  lg: "size-5"
}

export function EnhancedCheckbox({
  label,
  description,
  color = "default",
  size = "md",
  position = "left",
  disabled = false,
  checked,
  onCheckedChange,
  className,
  labelClassName,
  id: providedId,
  ...props
}: EnhancedCheckboxProps) {
  const generatedId = useId()
  const id = providedId || generatedId

  const checkboxElement = (
    <Checkbox
      id={id}
      disabled={disabled}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(sizeVariants[size])}
      {...props}
    />
  )

  const textElement = (
    <div className="grid gap-1 leading-none">
      {label && (
        <Label 
          htmlFor={id}
          className={cn(
            "cursor-pointer",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            disabled && "cursor-not-allowed opacity-50",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      {description && (
        <p className={cn(
          "text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-xs", 
          size === "lg" && "text-sm",
          disabled && "opacity-50"
        )}>
          {description}
        </p>
      )}
    </div>
  )

  return (
    <div className={cn(
      "flex items-start gap-2", 
      position === "right" ? "flex-row-reverse" : "flex-row",
      colorVariants[color], 
      className
    )}>
      {checkboxElement}
      {textElement}
    </div>
  )
}

// Composant simple pour un usage basique
export function SimpleCheckbox({
  label,
  color = "primary",
  ...props
}: Omit<EnhancedCheckboxProps, "description" | "size">) {
  return (
    <EnhancedCheckbox
      label={label}
      color={color}
      size="md"
      {...props}
    />
  )
}