"use client"

import * as React from "react"
import { useState } from "react"
import { ArrowRightIcon, ArrowLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type OnboardingDialogProps } from "./types"

export const OnboardingDialog = React.forwardRef<
  React.ComponentRef<typeof DialogContent>,
  OnboardingDialogProps
>(({
  steps,
  trigger,
  onComplete,
  onSkip,
  onStepChange,
  className,
  skipText = "Ignorer",
  nextText = "Suivant",
  completeText = "Terminer",
  showProgressDots = true,
  autoReset = true,
  ...props
}, ref) => {
  const [step, setStep] = useState(1)

  const totalSteps = steps.length
  const currentStep = steps[step - 1]
  const isLastStep = step === totalSteps
  const isFirstStep = step === 1

  const handleNext = () => {
    if (step < totalSteps) {
      const nextStep = step + 1
      setStep(nextStep)
      onStepChange?.(nextStep)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      const prevStep = step - 1
      setStep(prevStep)
      onStepChange?.(prevStep)
    }
  }

  const handleComplete = () => {
    onComplete?.()
  }

  const handleSkip = () => {
    onSkip?.()
  }

  const handleOpenChange = (open: boolean) => {
    if (open && autoReset) {
      setStep(1)
      onStepChange?.(1)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        ref={ref}
        className={cn("gap-0 p-0 [&>button:last-child]:text-white", className)}
        {...props}
      >
        {/* Image Section */}
        {currentStep.image && (
          <div className="p-2">
            <img
              className="w-full rounded-md"
              src={currentStep.image}
              alt={`Étape ${step}`}
            />
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-6 px-6 pt-3 pb-6">
          <DialogHeader>
            <DialogTitle>{currentStep.title}</DialogTitle>
            <DialogDescription>
              {currentStep.description}
            </DialogDescription>
          </DialogHeader>

          {/* Custom Content */}
          {currentStep.content && (
            <div className="text-sm text-muted-foreground">
              {currentStep.content}
            </div>
          )}

          {/* Footer with Progress and Navigation */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            
            {/* Progress Dots */}
            {showProgressDots && (
              <div className="flex justify-center space-x-1.5 max-sm:order-1">
                {[...Array(totalSteps)].map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      index + 1 === step 
                        ? "bg-primary" 
                        : "bg-primary/20"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <DialogFooter className="flex-row gap-2">
              {/* Skip/Previous Button */}
              {isFirstStep ? (
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    {skipText}
                  </Button>
                </DialogClose>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                  className="group"
                >
                  <ArrowLeftIcon
                    className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
                    size={16}
                    aria-hidden="true"
                  />
                  Précédent
                </Button>
              )}

              {/* Next/Complete Button */}
              {isLastStep ? (
                <DialogClose asChild>
                  <Button 
                    type="button"
                    onClick={handleComplete}
                  >
                    {completeText}
                  </Button>
                </DialogClose>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="group"
                >
                  {nextText}
                  <ArrowRightIcon
                    className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

OnboardingDialog.displayName = "OnboardingDialog"