"use client"

import * as React from "react"
import { useId } from "react"
import { cn } from "@/lib/utils"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { radioChipVariants } from "./variants"
import { type ChipRadioProps } from "./types"

export const ChipRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  ChipRadioProps & {
    legend?: string
    description?: string
    error?: string
  }
>(({ 
  options,
  name,
  defaultValue,
  value,
  onValueChange,
  size = "md",
  variant = "default",
  legend,
  description,
  error,
  className,
  disabled,
  required,
  ...props 
}, ref) => {
  const id = useId()
  const groupId = name || id

  return (
    <fieldset className={cn("space-y-4", disabled && "opacity-50", className)}>
      {legend && (
        <legend className="text-foreground text-sm leading-none font-medium">
          {legend}
          {required && <span className="text-destructive ml-1">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      )}

      <RadioGroup
        ref={ref}
        className="flex flex-wrap gap-2"
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(radioChipVariants({ size, variant }))}
          >
            <RadioGroupItem
              id={`${groupId}-${option.value}`}
              value={option.value}
              className="sr-only after:absolute after:inset-0"
              disabled={option.disabled || disabled}
            />
            
            {option.icon && (
              <option.icon 
                size={size === "sm" ? 14 : size === "lg" ? 18 : 16} 
                className="mr-1.5" 
              />
            )}
            
            {option.label}
          </label>
        ))}
      </RadioGroup>

      {error && (
        <p className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
    </fieldset>
  )
})

ChipRadioGroup.displayName = "ChipRadioGroup"