"use client"

import * as React from "react"
import { useState } from "react"
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
import { stepperVariants, stepContentVariants } from "./variants"
import { type FormStepperProps, type StepDefinition } from "./types"

export const WizardStepper = React.forwardRef<
  React.ComponentRef<typeof Stepper>,
  FormStepperProps & {
    showStepContent?: boolean
    contentPosition?: "below" | "side"
    renderStepContent?: (step: number, stepData?: unknown) => React.ReactNode
  }
>(({ 
  steps = [],
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  onStepValidation,
  allowSkip = false,
  validateOnNext = true,
  showStepContent = true,
  contentPosition = "below",
  renderStepContent,
  className,
  disabled,
  ...props 
}, ref) => {

  const [currentStep, setCurrentStep] = useState(defaultValue)
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<Record<number, string>>({})

  const actualCurrentStep = value ?? currentStep
  
  // Générer des étapes par défaut si aucune n'est fournie
  const defaultSteps = React.useMemo(() => {
    if (steps.length > 0) return steps
    return Array.from({ length: 4 }, (_, i) => ({
      step: i + 1,
      title: `Step ${i + 1}`,
      description: `Configure step ${i + 1}`,
      content: `Content for step ${i + 1}`,
      completed: false,
      disabled: false,
      loading: false
    }))
  }, [steps])

  const handleStepChange = React.useCallback(async (step: number) => {
    // Validation lors du changement d'étape
    if (validateOnNext && onStepValidation && actualCurrentStep !== step) {
      try {
        const isValid = await onStepValidation(actualCurrentStep)
        if (!isValid && !allowSkip) {
          setErrors(prev => ({ ...prev, [actualCurrentStep]: "Please complete this step before continuing" }))
          return
        }
        if (isValid) {
          setValidatedSteps(prev => new Set([...prev, actualCurrentStep]))
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[actualCurrentStep]
            return newErrors
          })
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, [actualCurrentStep]: error instanceof Error ? error.message : "Validation failed" }))
        return
      }
    }

    if (value === undefined) {
      setCurrentStep(step)
    }
    onValueChange?.(step)
  }, [actualCurrentStep, value, onValueChange, onStepValidation, validateOnNext, allowSkip])

  const isStepAccessible = React.useCallback((step: number) => {
    if (allowSkip) return true
    if (step <= actualCurrentStep) return true
    return validatedSteps.has(step - 1)
  }, [allowSkip, actualCurrentStep, validatedSteps])

  const currentStepData = defaultSteps.find(s => s.step === actualCurrentStep)

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn(
        "flex",
        contentPosition === "side" ? "gap-8" : "flex-col"
      )}>
        <div className={contentPosition === "side" ? "flex-shrink-0" : ""}>
          <Stepper
            ref={ref}
            className={stepperVariants({ orientation })}
            value={actualCurrentStep}
            onValueChange={handleStepChange}
            orientation={orientation}
            data-orientation={orientation}
            {...props}
          >
            {defaultSteps.map((stepDef) => {
              const isAccessible = isStepAccessible(stepDef.step)
              const hasError = errors[stepDef.step]
              const isValidated = validatedSteps.has(stepDef.step)
              
              return (
                <StepperItem
                  key={stepDef.step}
                  step={stepDef.step}
                  completed={stepDef.completed || isValidated}
                  disabled={stepDef.disabled || disabled || !isAccessible}
                  loading={stepDef.loading}
                  className={cn(
                    "group/step flex items-center",
                    orientation === "horizontal" ? "flex-1" : "flex-col items-start",
                    hasError && "group-data-[state=active]/step:text-destructive"
                  )}
                >
                  <StepperTrigger 
                    className={cn(
                      "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-3 rounded-full outline-none focus-visible:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                      hasError && "ring-2 ring-destructive"
                    )}
                    disabled={!isAccessible || stepDef.disabled || disabled}
                  >
                    <StepperIndicator 
                      className={cn(
                        hasError && stepDef.step === actualCurrentStep && "bg-destructive text-destructive-foreground"
                      )}
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
                          <StepperTitle className={cn(
                            hasError && stepDef.step === actualCurrentStep && "text-destructive"
                          )}>
                            {stepDef.title}
                          </StepperTitle>
                        )}
                        {stepDef.description && (
                          <StepperDescription>
                            {stepDef.description}
                          </StepperDescription>
                        )}
                      </div>
                    )}
                  </StepperTrigger>
                  
                  {stepDef.step < defaultSteps.length && <StepperSeparator />}
                </StepperItem>
              )
            })}
          </Stepper>
        </div>

        {showStepContent && (
          <div className={cn(
            stepContentVariants({ 
              position: contentPosition === "side" ? "side" : "below"
            }),
            contentPosition === "side" ? "flex-1" : "w-full"
          )}>
            {errors[actualCurrentStep] && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 mb-4">
                <p className="text-destructive text-sm font-medium">
                  {errors[actualCurrentStep]}
                </p>
              </div>
            )}
            
            <div className="p-4 bg-muted/30 rounded-lg border">
              <h3 className="font-semibold mb-2">
                {currentStepData?.title || `Step ${actualCurrentStep}`}
              </h3>
              
              {renderStepContent ? (
                renderStepContent(actualCurrentStep, currentStepData)
              ) : (
                <div className="space-y-2">
                  {currentStepData?.content && (
                    <p className="text-sm text-muted-foreground">
                      {currentStepData.content}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    This is the content area for step {actualCurrentStep}. 
                    You can render forms, information, or any custom content here.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-muted-foreground text-xs" role="region" aria-live="polite">
          Step {actualCurrentStep} of {defaultSteps.length}
          {errors[actualCurrentStep] && " - Please resolve the error above"}
        </p>
      </div>
    </div>
  )
})

WizardStepper.displayName = "WizardStepper"