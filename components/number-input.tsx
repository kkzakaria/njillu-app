"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const numberInputVariants = cva(
  "relative inline-flex w-full items-center overflow-hidden rounded-md border text-sm shadow-sm transition-colors",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-9", 
        lg: "h-11",
      },
      variant: {
        default: "border-input focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        filled: "bg-muted border-transparent focus-within:bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        error: "border-destructive focus-within:ring-1 focus-within:ring-destructive",
      },
      buttonStyle: {
        sides: "", // boutons sur les côtés
        stacked: "", // boutons empilés à droite
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default", 
      buttonStyle: "sides",
    },
  }
)

const buttonVariants = cva(
  "flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
      buttonStyle: {
        sides: "aspect-square h-full border border-input bg-background",
        stacked: "w-6 h-1/2 border border-input bg-background",
      },
      position: {
        left: "rounded-s-md -me-px",
        right: "rounded-e-md -ms-px", 
        stackedTop: "rounded-se-none rounded-sw-none -me-px",
        stackedBottom: "rounded-ne-none rounded-nw-none -me-px -mt-px",
      },
    },
  }
)

export interface NumberInputProps extends VariantProps<typeof numberInputVariants> {
  value?: number
  onChange?: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  className?: string
  id?: string
  formatOptions?: Intl.NumberFormatOptions
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    className,
    size,
    variant,
    buttonStyle,
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    placeholder,
    label,
    description,
    error,
    disabled = false,
    id,
    formatOptions,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined ? value.toString() : ""
    )

    React.useEffect(() => {
      if (value !== undefined) {
        if (formatOptions) {
          try {
            const formatter = new Intl.NumberFormat(undefined, formatOptions)
            setInternalValue(formatter.format(value))
          } catch {
            setInternalValue(value.toString())
          }
        } else {
          setInternalValue(value.toString())
        }
      }
    }, [value, formatOptions])

    const parseValue = (str: string): number | undefined => {
      if (!str) return undefined
      
      // Nettoyer la chaîne pour les formats monétaires
      const cleanStr = str.replace(/[^\d.,\-]/g, '').replace(',', '.')
      const num = parseFloat(cleanStr)
      return isNaN(num) ? undefined : num
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      
      const parsedValue = parseValue(newValue)
      if (parsedValue !== undefined) {
        // Vérifier les limites
        if ((min !== undefined && parsedValue < min) || (max !== undefined && parsedValue > max)) {
          return
        }
      }
      onChange?.(parsedValue)
    }

    const increment = () => {
      const currentValue = value ?? 0
      const newValue = currentValue + step
      if (max === undefined || newValue <= max) {
        onChange?.(newValue)
      }
    }

    const decrement = () => {
      const currentValue = value ?? 0
      const newValue = currentValue - step
      if (min === undefined || newValue >= min) {
        onChange?.(newValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        increment()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        decrement()
      }
    }

    const hasError = !!error
    const currentVariant = hasError ? "error" : variant

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <div className={cn(numberInputVariants({ size, variant: currentVariant, buttonStyle }), className)}>
          {buttonStyle === "sides" && (
            <button
              type="button"
              onClick={decrement}
              disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
              className={cn(
                buttonVariants({ size, buttonStyle, position: "left" })
              )}
            >
              <MinusIcon size={size === "sm" ? 14 : 16} />
            </button>
          )}

          <input
            ref={ref}
            id={id}
            type="text"
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "bg-transparent text-center tabular-nums w-full px-3 py-2 focus:outline-none",
              buttonStyle === "stacked" && "pr-8"
            )}
            {...props}
          />

          {buttonStyle === "sides" && (
            <button
              type="button"
              onClick={increment}
              disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
              className={cn(
                buttonVariants({ size, buttonStyle, position: "right" })
              )}
            >
              <PlusIcon size={size === "sm" ? 14 : 16} />
            </button>
          )}

          {buttonStyle === "stacked" && (
            <div className="flex h-full flex-col">
              <button
                type="button"
                onClick={increment}
                disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
                className={cn(
                  buttonVariants({ size, buttonStyle, position: "stackedTop" })
                )}
              >
                <ChevronUpIcon size={12} />
              </button>
              <button
                type="button" 
                onClick={decrement}
                disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
                className={cn(
                  buttonVariants({ size, buttonStyle, position: "stackedBottom" })
                )}
              >
                <ChevronDownIcon size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

NumberInput.displayName = "NumberInput"

// Composants spécialisés
const CurrencyInput = React.forwardRef<HTMLInputElement, Omit<NumberInputProps, "formatOptions">>(
  ({ step = 0.01, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        step={step}
        formatOptions={{
          style: "currency",
          currency: "EUR",
          currencySign: "accounting",
        }}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

const PercentageInput = React.forwardRef<HTMLInputElement, Omit<NumberInputProps, "formatOptions">>(
  ({ step = 1, min = 0, max = 100, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        step={step} 
        min={min}
        max={max}
        formatOptions={{
          style: "percent",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }}
        {...props}
      />
    )
  }
)

PercentageInput.displayName = "PercentageInput"

export { NumberInput, CurrencyInput, PercentageInput, numberInputVariants }