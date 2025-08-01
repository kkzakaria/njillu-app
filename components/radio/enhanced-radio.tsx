"use client"

import * as React from "react"
import { useId } from "react"
import { cn } from "@/lib/utils"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { radioGroupVariants, colorSchemeVariants } from "./variants"
import { type ColoredRadioProps } from "./types"

export const EnhancedRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  ColoredRadioProps & {
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
  orientation = "vertical",
  colorScheme = "default",
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

  const colorClass = colorSchemeVariants[colorScheme] || colorSchemeVariants.default

  return (
    <fieldset className={cn("space-y-3", disabled && "opacity-50", className)}>
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
        className={cn(
          radioGroupVariants({ orientation }),
          colorClass
        )}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem 
              value={option.value} 
              id={`${groupId}-${option.value}`}
              disabled={option.disabled || disabled}
            />
            <Label 
              htmlFor={`${groupId}-${option.value}`}
              className={cn(
                "cursor-pointer",
                (option.disabled || disabled) && "cursor-not-allowed opacity-50"
              )}
            >
              {option.label}
              {option.description && (
                <span className="text-muted-foreground block text-xs mt-1">
                  {option.description}
                </span>
              )}
            </Label>
          </div>
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

EnhancedRadioGroup.displayName = "EnhancedRadioGroup"