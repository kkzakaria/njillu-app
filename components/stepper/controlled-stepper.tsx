"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperTrigger,
} from "@/components/ui/stepper"
import { stepperVariants, stepControlsVariants } from "./variants"
import { type ControlledStepperProps, type StepDefinition } from "./types"

export const ControlledStepper = React.forwardRef<
  React.ComponentRef<typeof Stepper>,
  ControlledStepperProps
>(({ 
  steps = [],
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  showControls = true,
  controlsPosition = "bottom",
  nextLabel = "Next step",
  prevLabel = "Prev step", 
  finishLabel = "Finish",
  onComplete,
  loading = false,
  className,
  disabled,
  ...props 
}, ref) => {

  const [currentStep, setCurrentStep] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  const actualCurrentStep = value ?? currentStep
  const maxStep = steps.length || 4

  // Générer des étapes par défaut si aucune n'est fournie
  const defaultSteps = React.useMemo(() => {
    if (steps.length > 0) return steps
    return Array.from({ length: 4 }, (_, i) => ({
      step: i + 1,
      title: `Step ${i + 1}`,
      description: `Description for step ${i + 1}`,
      completed: false,
      disabled: false,
      loading: false
    }))
  }, [steps])

  const handleStepChange = React.useCallback((step: number) => {
    if (value === undefined) {
      setCurrentStep(step)
    }
    onValueChange?.(step)
  }, [value, onValueChange])

  const handleNext = React.useCallback(async () => {
    if (loading || isLoading) return
    
    setIsLoading(true)
    
    // Simuler un délai asynchrone
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (actualCurrentStep >= maxStep) {
      onComplete?.()
    } else {
      handleStepChange(actualCurrentStep + 1)
    }
    
    setIsLoading(false)
  }, [actualCurrentStep, maxStep, loading, isLoading, onComplete, handleStepChange])

  const handlePrev = React.useCallback(() => {
    if (loading || isLoading || actualCurrentStep <= 1) return
    handleStepChange(actualCurrentStep - 1)
  }, [actualCurrentStep, loading, isLoading, handleStepChange])

  const Controls = React.useMemo(() => (
    <div className={stepControlsVariants({ position: controlsPosition })}>
      <Button
        variant="outline"
        className="w-32"
        onClick={handlePrev}
        disabled={actualCurrentStep === 1 || loading || isLoading || disabled}
      >
        {prevLabel}
      </Button>
      <Button
        variant="outline"
        className="w-32"
        onClick={handleNext}
        disabled={loading || isLoading || disabled}
      >
        {actualCurrentStep >= maxStep ? finishLabel : nextLabel}
      </Button>
    </div>
  ), [actualCurrentStep, maxStep, loading, isLoading, disabled, prevLabel, nextLabel, finishLabel, handlePrev, handleNext, controlsPosition])

  return (
    <div className={cn("space-y-6", className)}>
      {showControls && (controlsPosition === "top" || controlsPosition === "both") && Controls}
      
      <Stepper
        ref={ref}
        className={stepperVariants({ orientation })}
        value={actualCurrentStep}
        onValueChange={handleStepChange}
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
            loading={(isLoading || loading) && stepDef.step === actualCurrentStep}
            className={cn(
              "group/step flex items-center",
              orientation === "horizontal" ? "flex-1" : "flex-col items-start"
            )}
          >
            <StepperTrigger 
              className={cn(
                "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <StepperIndicator 
                asChild={!!(stepDef as StepDefinition).icon}
              >
                {(stepDef as StepDefinition).icon ? (
                  React.createElement((stepDef as StepDefinition).icon!, {
                    size: 14,
                    className: "text-current"
                  })
                ) : (
                  stepDef.step
                )}
              </StepperIndicator>
              
              {(stepDef.title || stepDef.description) && (
                <div className="space-y-0.5 px-2">
                  {stepDef.title && (
                    <StepperTitle>{stepDef.title}</StepperTitle>
                  )}
                  {stepDef.description && (
                    <StepperDescription>{stepDef.description}</StepperDescription>
                  )}
                </div>
              )}
            </StepperTrigger>
            
            {stepDef.step < defaultSteps.length && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>

      {showControls && (controlsPosition === "bottom" || controlsPosition === "both") && Controls}
      
      <p className="text-muted-foreground text-xs text-center" role="region" aria-live="polite">
        {isLoading || loading ? "Loading..." : `Step ${actualCurrentStep} of ${maxStep}`}
      </p>
    </div>
  )
})

ControlledStepper.displayName = "ControlledStepper"