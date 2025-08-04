"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { EyeIcon, EyeOffIcon, XIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const inputVariants = cva(
  "flex w-full rounded-md border bg-transparent text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      size: {
        sm: "h-8 px-2 py-1 text-sm",
        md: "h-9 px-3 py-1",
        lg: "h-11 px-4 py-2",
      },
      variant: {
        default: "border-input",
        filled: "bg-muted border-transparent",
        ghost: "border-transparent shadow-none",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface EnhancedInputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  label?: string
  description?: string
  error?: string
  success?: string
  clearable?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClear?: () => void
  showPasswordToggle?: boolean
  containerClassName?: string
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    type,
    size,
    variant,
    label,
    description,
    error,
    success,
    clearable = false,
    leftIcon,
    rightIcon,
    onClear,
    showPasswordToggle = false,
    containerClassName,
    value,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [internalType, setInternalType] = React.useState(type)

    React.useEffect(() => {
      if (showPasswordToggle && type === "password") {
        setInternalType(showPassword ? "text" : "password")
      } else {
        setInternalType(type)
      }
    }, [showPassword, type, showPasswordToggle])

    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const currentVariant = hasError ? "error" : hasSuccess ? "success" : variant

    const handleClear = () => {
      onClear?.()
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const hasValue = value !== undefined && value !== null && String(value).length > 0

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label 
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            type={internalType}
            className={cn(
              inputVariants({ size, variant: currentVariant }),
              leftIcon && "pl-10",
              (rightIcon || clearable || showPasswordToggle || hasError || hasSuccess) && "pr-10",
              className
            )}
            ref={ref}
            value={value}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Status icons */}
            {hasError && (
              <AlertCircleIcon size={16} className="text-destructive" />
            )}
            {hasSuccess && (
              <CheckCircleIcon size={16} className="text-green-500" />
            )}
            
            {/* Clear button */}
            {clearable && hasValue && !hasError && !hasSuccess && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-accent rounded-sm transition-colors"
                tabIndex={-1}
              >
                <XIcon size={14} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
            
            {/* Password toggle */}
            {showPasswordToggle && type === "password" && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-0.5 hover:bg-accent rounded-sm transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon size={16} className="text-muted-foreground hover:text-foreground" />
                ) : (
                  <EyeIcon size={16} className="text-muted-foreground hover:text-foreground" />
                )}
              </button>
            )}
            
            {/* Custom right icon */}
            {rightIcon && !clearable && !showPasswordToggle && !hasError && !hasSuccess && (
              <div className="text-muted-foreground pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        {description && !error && !success && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircleIcon size={14} />
            {error}
          </p>
        )}
        
        {/* Success message */}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircleIcon size={14} />
            {success}
          </p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

// Composant simple pour usage basique
const SimpleInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, "variant" | "size">>(
  ({ ...props }, ref) => {
    return (
      <EnhancedInput
        ref={ref}
        variant="default"
        size="md"
        {...props}
      />
    )
  }
)

SimpleInput.displayName = "SimpleInput"

// Composant pour mots de passe
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, "type" | "showPasswordToggle">>(
  ({ ...props }, ref) => {
    return (
      <EnhancedInput
        ref={ref}
        type="password"
        showPasswordToggle
        {...props}
      />
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { EnhancedInput, SimpleInput, PasswordInput, inputVariants }