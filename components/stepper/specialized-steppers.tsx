"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
  User, 
  CreditCard, 
  CheckCircle, 
  Settings,
  FileText,
  Download,
  Upload,
  Zap,
  Package,
  Truck,
  ShoppingCart,
  Heart
} from "lucide-react"
import { EnhancedStepper } from "./enhanced-stepper"
import { ControlledStepper } from "./controlled-stepper"
import { WizardStepper } from "./wizard-stepper"
import { type BaseStepperProps, type ControlledStepperProps, type FormStepperProps } from "./types"

// Composants spécialisés prédéfinis

export const OnboardingStepper = React.forwardRef<
  React.ComponentRef<typeof EnhancedStepper>,
  Omit<BaseStepperProps, "steps"> & {
    userType?: "individual" | "business" | "enterprise"
  }
>(({ userType = "individual", ...props }, ref) => {
  const onboardingSteps = React.useMemo(() => {
    const baseSteps = [
      {
        step: 1,
        title: "Welcome",
        description: "Get started with your account",
        icon: User
      },
      {
        step: 2,
        title: "Profile",
        description: "Complete your profile information",
        icon: FileText
      },
    ]

    if (userType === "business" || userType === "enterprise") {
      baseSteps.push({
        step: 3,
        title: "Verification",
        description: "Verify your business information",
        icon: CheckCircle
      })
    }

    baseSteps.push({
      step: baseSteps.length + 1,
      title: "Setup",
      description: "Configure your preferences",
      icon: Settings
    })

    return baseSteps
  }, [userType])

  return (
    <EnhancedStepper
      ref={ref}
      steps={onboardingSteps}
      showTitles
      showDescriptions
      orientation="horizontal"
      {...props}
    />
  )
})

OnboardingStepper.displayName = "OnboardingStepper"

export const CheckoutStepper = React.forwardRef<
  React.ComponentRef<typeof ControlledStepper>,
  Omit<ControlledStepperProps, "steps">
>(({ ...props }, ref) => {
  const checkoutSteps = [
    {
      step: 1,
      title: "Cart",
      description: "Review your items",
      icon: ShoppingCart
    },
    {
      step: 2,
      title: "Shipping",
      description: "Delivery information",
      icon: Truck
    },
    {
      step: 3,
      title: "Payment",
      description: "Payment details",
      icon: CreditCard
    },
    {
      step: 4,
      title: "Confirmation",
      description: "Order summary",
      icon: CheckCircle
    }
  ]

  return (
    <ControlledStepper
      ref={ref}
      steps={checkoutSteps}
      orientation="horizontal"
      nextLabel="Continue"
      prevLabel="Back"
      finishLabel="Place Order"
      {...props}
    />
  )
})

CheckoutStepper.displayName = "CheckoutStepper"

export const FormWizardStepper = React.forwardRef<
  React.ComponentRef<typeof WizardStepper>,
  Omit<FormStepperProps, "steps"> & {
    formType?: "survey" | "application" | "registration"
  }
>(({ formType = "survey", ...props }, ref) => {
  const formSteps = React.useMemo(() => {
    switch (formType) {
      case "application":
        return [
          {
            step: 1,
            title: "Personal Info",
            description: "Basic information",
            content: "Enter your personal details, name, email, and contact information."
          },
          {
            step: 2,
            title: "Experience",
            description: "Work experience",
            content: "Provide details about your work experience and qualifications."
          },
          {
            step: 3,
            title: "Documents",
            description: "Upload documents",
            content: "Upload your resume, cover letter, and supporting documents."
          },
          {
            step: 4,
            title: "Review",
            description: "Final review",
            content: "Review all information before submitting your application."
          }
        ]
      case "registration":
        return [
          {
            step: 1,
            title: "Account",
            description: "Create account",
            content: "Choose your username and password."
          },
          {
            step: 2,
            title: "Profile",
            description: "Profile setup",
            content: "Complete your profile with personal information."
          },
          {
            step: 3,
            title: "Preferences",
            description: "Set preferences",
            content: "Configure your account preferences and settings."
          }
        ]
      default: // survey
        return [
          {
            step: 1,
            title: "Introduction",
            description: "Survey overview",
            content: "Welcome to our survey. This will take approximately 5 minutes."
          },
          {
            step: 2,
            title: "Questions",
            description: "Answer questions",
            content: "Please answer the following questions honestly."
          },
          {
            step: 3,
            title: "Demographics",
            description: "Optional info",
            content: "Provide optional demographic information."
          },
          {
            step: 4,
            title: "Complete",
            description: "Finish survey",
            content: "Review your answers and submit the survey."
          }
        ]
    }
  }, [formType])

  return (
    <WizardStepper
      ref={ref}
      steps={formSteps}
      showStepContent
      contentPosition="below"
      allowSkip={formType === "survey"}
      validateOnNext={formType === "application"}
      {...props}
    />
  )
})

FormWizardStepper.displayName = "FormWizardStepper"

export const ProcessStepper = React.forwardRef<
  React.ComponentRef<typeof EnhancedStepper>,
  Omit<BaseStepperProps, "steps"> & {
    processType?: "upload" | "download" | "installation" | "deployment"
    currentProcess?: string
    autoProgress?: boolean
  }
>(({ processType = "upload", autoProgress = false, ...props }, ref) => {
  const [currentStep, setCurrentStep] = useState(1)

  const processSteps = React.useMemo(() => {
    switch (processType) {
      case "download":
        return [
          {
            step: 1,
            title: "Preparing",
            description: "Preparing download",
            icon: Package
          },
          {
            step: 2,
            title: "Downloading",
            description: "Downloading files",
            icon: Download
          },
          {
            step: 3,
            title: "Complete",
            description: "Download complete",
            icon: CheckCircle
          }
        ]
      case "installation":
        return [
          {
            step: 1,
            title: "Initializing",
            description: "Starting installation",
            icon: Zap
          },
          {
            step: 2,
            title: "Installing",
            description: "Installing components",
            icon: Package
          },
          {
            step: 3,
            title: "Configuring",
            description: "Setting up configuration",
            icon: Settings
          },
          {
            step: 4,
            title: "Complete",
            description: "Installation finished",
            icon: CheckCircle
          }
        ]
      case "deployment":
        return [
          {
            step: 1,
            title: "Building",
            description: "Building application",
            icon: Package
          },
          {
            step: 2,
            title: "Testing",
            description: "Running tests",
            icon: CheckCircle
          },
          {
            step: 3,
            title: "Deploying",
            description: "Deploying to server",
            icon: Upload
          },
          {
            step: 4,
            title: "Live",
            description: "Deployment complete",
            icon: Zap
          }
        ]
      default: // upload
        return [
          {
            step: 1,
            title: "Selecting",
            description: "Choose files",
            icon: FileText
          },
          {
            step: 2,
            title: "Uploading",
            description: "Uploading files",
            icon: Upload
          },
          {
            step: 3,
            title: "Processing",
            description: "Processing upload",
            icon: Settings
          },
          {
            step: 4,
            title: "Complete",
            description: "Upload finished",
            icon: CheckCircle
          }
        ]
    }
  }, [processType])

  // Auto-progression si activée
  useEffect(() => {
    if (!autoProgress) return
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processSteps.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [autoProgress, processSteps.length])

  const stepsWithLoading = processSteps.map(step => ({
    ...step,
    loading: step.step === currentStep && currentStep < processSteps.length,
    completed: step.step < currentStep
  }))

  return (
    <EnhancedStepper
      ref={ref}
      steps={stepsWithLoading}
      value={currentStep}
      showTitles
      showDescriptions
      interactive={!autoProgress}
      orientation="horizontal"
      {...props}
    />
  )
})

ProcessStepper.displayName = "ProcessStepper"

export const ProgressStepper = React.forwardRef<
  React.ComponentRef<typeof EnhancedStepper>,
  Omit<BaseStepperProps, "steps"> & {
    progress?: number // 0-100
    showProgress?: boolean
  }
>(({ progress = 0, showProgress = true, ...props }, ref) => {
  const progressSteps = [
    {
      step: 1,
      title: "Start",
      description: "Getting started",
      completed: progress > 0
    },
    {
      step: 2,
      title: "Progress",
      description: "In progress",
      completed: progress > 25,
      loading: progress > 0 && progress <= 50
    },
    {
      step: 3,
      title: "Almost Done",
      description: "Nearly finished",
      completed: progress > 75,
      loading: progress > 50 && progress <= 75
    },
    {
      step: 4,
      title: "Complete",
      description: "Finished",
      completed: progress >= 100,
      loading: progress > 75 && progress < 100
    }
  ]

  return (
    <div className="space-y-4">
      <EnhancedStepper
        ref={ref}
        steps={progressSteps}
        showTitles
        showDescriptions
        interactive={false}
        orientation="horizontal"
        {...props}
      />
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
})

ProgressStepper.displayName = "ProgressStepper"

export const CustomElementStepper = React.forwardRef<
  React.ComponentRef<typeof EnhancedStepper>,
  Omit<BaseStepperProps, "steps">
>(({ ...props }, ref) => {
  const customSteps = [
    {
      step: 1,
      title: "User Profile",
      description: "Profile avatar",
      // Utilisation d'un avatar personnalisé (simulation avec Heart icon)
      icon: User
    },
    {
      step: 2,
      title: "Processing",
      description: "Current step",
      // Cette étape sera en loading
    },
    {
      step: 3,
      title: "Custom Icon",
      description: "Heart icon",
      icon: Heart
    }
  ]

  return (
    <EnhancedStepper
      ref={ref}
      steps={customSteps}
      showTitles
      showDescriptions
      value={2} // Étape actuelle avec loading
      orientation="horizontal"
      {...props}
    />
  )
})

CustomElementStepper.displayName = "CustomElementStepper"