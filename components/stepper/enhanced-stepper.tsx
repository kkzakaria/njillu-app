"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperTrigger,
} from "@/components/ui/stepper"
import { stepperVariants, stepItemVariants, stepIndicatorVariants } from "./variants"
import { type BaseStepperProps } from "./types"

export const EnhancedStepper = React.forwardRef<
  React.ComponentRef<typeof Stepper>,
  BaseStepperProps & {
    size?: "sm" | "md" | "lg"
    variant?: "default" | "minimal" | "filled" | "outlined"
    showTitles?: boolean
    showDescriptions?: boolean
    interactive?: boolean
  }
>(({ 
  steps = [],
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  size = "md",
  variant = "default",
  showTitles = false,
  showDescriptions = false,
  interactive = true,
  className,
  disabled,
  ...props 
}, ref) => {

  // Générer des étapes par défaut si aucune n'est fournie
  const defaultSteps = React.useMemo(() => {
    if (steps.length > 0) return steps
    return Array.from({ length: 4 }, (_, i) => ({
      step: i + 1,
      title: `Step ${i + 1}`,
      description: `Description for step ${i + 1}`
    }))
  }, [steps])

  return (
    <div className={cn("space-y-6", className)}>
      <Stepper
        ref={ref}
        className={stepperVariants({ 
          orientation, 
          size, 
          style: variant 
        })}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        data-orientation={orientation}
        {...props}
      >
        {defaultSteps.map((stepDef) => (
          <StepperItem
            key={stepDef.step}
            step={stepDef.step}
            completed={stepDef.completed}
            disabled={stepDef.disabled || disabled}
            loading={stepDef.loading}
            className={cn(
              stepItemVariants({ orientation, size }),
              "group/step flex items-center",
              orientation === "horizontal" ? "flex-1" : "",
              orientation === "vertical" ? "flex-col items-start" : ""
            )}
          >
            <StepperTrigger 
              className={cn(
                "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                (showTitles || showDescriptions) && orientation === "horizontal" && "flex-col text-center",
                (showTitles || showDescriptions) && orientation === "vertical" && "flex-row items-start"
              )}
              disabled={!interactive || stepDef.disabled || disabled}
            >
              <StepperIndicator 
                className={stepIndicatorVariants({ 
                  size, 
                  variant: variant === "minimal" ? "minimal" : variant === "outlined" ? "outlined" : "default" 
                })}
                asChild={!!stepDef.icon}
              >
                {stepDef.icon ? (
                  <stepDef.icon 
                    size={size === "sm" ? 12 : size === "lg" ? 16 : 14} 
                    className="text-current" 
                  />
                ) : (
                  stepDef.step
                )}
              </StepperIndicator>
              
              {(showTitles || showDescriptions) && (
                <div className={cn(
                  "space-y-0.5",
                  orientation === "horizontal" ? "mt-2 text-center" : "ml-2 text-left"
                )}>
                  {showTitles && stepDef.title && (
                    <StepperTitle className={cn(
                      size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-sm"
                    )}>
                      {stepDef.title}
                    </StepperTitle>
                  )}
                  {showDescriptions && stepDef.description && (
                    <StepperDescription className={cn(
                      size === "sm" ? "text-xs" : "text-sm"
                    )}>
                      {stepDef.description}
                    </StepperDescription>
                  )}
                </div>
              )}
            </StepperTrigger>
            
            {stepDef.step < defaultSteps.length && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  )
})

EnhancedStepper.displayName = "EnhancedStepper"