"use client"

import * as React from "react"
import { useId } from "react"
import { cn } from "@/lib/utils"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { radioCardVariants } from "./variants"
import { type CardRadioProps } from "./types"

export const CardRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  CardRadioProps & {
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
  layout = "grid",
  columns = 3,
  cardSize = "md",
  showIcons = false,
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

  const gridClass = layout === "grid" 
    ? `grid grid-cols-${columns} gap-2`
    : "flex flex-wrap gap-2"

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
        className={gridClass}
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
            className={cn(
              radioCardVariants({ 
                size: cardSize,
                layout: showIcons ? "vertical" : "horizontal"
              })
            )}
          >
            <RadioGroupItem
              id={`${groupId}-${option.value}`}
              value={option.value}
              className="sr-only after:absolute after:inset-0"
              disabled={option.disabled || disabled}
            />
            
            {showIcons && option.icon && (
              <option.icon 
                size={cardSize === "sm" ? 16 : cardSize === "lg" ? 24 : 20} 
                className="text-muted-foreground" 
              />
            )}
            
            <div className="flex flex-col gap-1">
              <p className="text-foreground font-medium leading-none">
                {option.label}
              </p>
              {option.description && (
                <p className="text-muted-foreground text-xs">
                  {option.description}
                </p>
              )}
            </div>
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

CardRadioGroup.displayName = "CardRadioGroup"