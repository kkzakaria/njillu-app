"use client"

import * as React from "react"
import { withMask } from "use-mask-input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const maskedInputVariants = cva(
  "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input",
        filled: "bg-muted border-transparent",
        ghost: "border-transparent shadow-none",
        error: "border-destructive focus-visible:ring-destructive",
      },
      size: {
        sm: "h-8 px-2 py-1 text-sm",
        md: "h-9 px-3 py-1",
        lg: "h-11 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Masques prédéfinis
export const MASK_PATTERNS = {
  // Formats français
  PHONE_FR: "99 99 99 99 99",
  POSTAL_CODE_FR: "99999",
  SIRET: "999 999 999 99999",
  SIREN: "999 999 999",
  
  // Formats internationaux
  CREDIT_CARD: "9999 9999 9999 9999",
  EXPIRY_DATE: "99/99",
  CVV: "999",
  
  // Formats personnalisés
  LICENSE_PLATE_FR: "AA-999-AA",
  NIR: "9 99 99 99 999 999 99", // Numéro de sécurité sociale
  
  // Formats d'entreprise
  TVA_FR: "FR99 999999999",
  IBAN_FR: "FR99 9999 9999 9999 9999 9999 999",
  
  // Formats de date/heure
  DATE_FR: "99/99/9999",
  DATE_US: "99/99/9999",
  TIME: "99:99",
  DATETIME: "99/99/9999 99:99",
  
  // Formats divers
  IP_ADDRESS: "999.999.999.999",
  MAC_ADDRESS: "AA:AA:AA:AA:AA:AA",
  CUSTOM: "", // Pour masque personnalisé
} as const

export type MaskPattern = keyof typeof MASK_PATTERNS

export interface MaskedInputProps extends VariantProps<typeof maskedInputVariants> {
  mask?: string | MaskPattern
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  className?: string
  id?: string
  showMaskOnHover?: boolean
  showMaskOnFocus?: boolean
  maskPlaceholder?: string
  guide?: boolean
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({
    className,
    variant,
    size,
    mask = "CUSTOM",
    value,
    onChange,
    placeholder,
    label,
    description,
    error,
    disabled = false,
    id,
    showMaskOnHover = false,
    showMaskOnFocus = true,
    maskPlaceholder = "_",
    guide = true,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(value || "")
    
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const maskPattern = typeof mask === "string" && mask in MASK_PATTERNS 
      ? MASK_PATTERNS[mask as MaskPattern]
      : mask

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(newValue)
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
        
        <Input
          ref={withMask(maskPattern, {
            placeholder: maskPlaceholder,
            showMaskOnHover,
            showMaskOnFocus,
            guide,
          })}
          id={id}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(maskedInputVariants({ variant: currentVariant, size }), className)}
          {...props}
        />

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

MaskedInput.displayName = "MaskedInput"

// Composants spécialisés prédéfinis
const CreditCardInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "1234 5678 9012 3456", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="CREDIT_CARD"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

CreditCardInput.displayName = "CreditCardInput"

const PhoneFrInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "01 23 45 67 89", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="PHONE_FR"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

PhoneFrInput.displayName = "PhoneFrInput"

const PostalCodeInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "75001", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="POSTAL_CODE_FR"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

PostalCodeInput.displayName = "PostalCodeInput"

const SiretInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "123 456 789 12345", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="SIRET"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

SiretInput.displayName = "SiretInput"

const DateInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "dd/mm/yyyy", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="DATE_FR"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

DateInput.displayName = "DateInput"

const ExpiryDateInput = React.forwardRef<HTMLInputElement, Omit<MaskedInputProps, "mask">>(
  ({ placeholder = "MM/YY", ...props }, ref) => {
    return (
      <MaskedInput
        ref={ref}
        mask="EXPIRY_DATE"
        placeholder={placeholder}
        {...props}
      />
    )
  }
)

ExpiryDateInput.displayName = "ExpiryDateInput"

// Utilitaires de validation
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, "")
  return /^\d{16}$/.test(cleaned)
}

export const validatePostalCode = (postalCode: string): boolean => {
  return /^\d{5}$/.test(postalCode.replace(/\s/g, ""))
}

export const validateSiret = (siret: string): boolean => {
  const cleaned = siret.replace(/\s/g, "")
  return /^\d{14}$/.test(cleaned)
}

export const validatePhoneFr = (phone: string): boolean => {
  const cleaned = phone.replace(/\s/g, "")
  return /^0[1-9]\d{8}$/.test(cleaned)
}

export { 
  MaskedInput, 
  CreditCardInput, 
  PhoneFrInput, 
  PostalCodeInput, 
  SiretInput, 
  DateInput, 
  ExpiryDateInput,
  maskedInputVariants 
}