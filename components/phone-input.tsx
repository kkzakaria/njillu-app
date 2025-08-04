"use client"

import * as React from "react"
import { ChevronDownIcon, PhoneIcon } from "lucide-react" 
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const phoneInputVariants = cva(
  "flex rounded-md shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        filled: "[&_[data-slot=phone-input]]:bg-muted [&_[data-slot=country-select]]:bg-muted",
        error: "[&_[data-slot=phone-input]]:border-destructive [&_[data-slot=country-select]]:border-destructive",
      },
      size: {
        sm: "[&_[data-slot=phone-input]]:h-8 [&_[data-slot=country-select]]:py-1",
        md: "[&_[data-slot=phone-input]]:h-9 [&_[data-slot=country-select]]:py-2",
        lg: "[&_[data-slot=phone-input]]:h-11 [&_[data-slot=country-select]]:py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface PhoneInputProps extends VariantProps<typeof phoneInputVariants> {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  className?: string
  id?: string
  defaultCountry?: RPNInput.Country
  countries?: RPNInput.Country[]
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({
    className,
    variant,
    size,
    value,
    onChange,
    placeholder = "Entrez votre numéro de téléphone",
    label,
    description,
    error,
    disabled = false,
    id,
    defaultCountry = "FR",
    countries,
    ...props
  }, ref) => {
    const hasError = !!error
    const currentVariant = hasError ? "error" : variant

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <RPNInput.default
          className={cn(phoneInputVariants({ variant: currentVariant, size }), className)}
          international
          defaultCountry={defaultCountry}
          countries={countries}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInputField}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
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

PhoneInput.displayName = "PhoneInput"

// Composant Input interne
const PhoneInputField = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-slot="phone-input"
        className={cn(
          "-ms-px rounded-s-none shadow-none focus-visible:z-10",
          className
        )}
        {...props}
      />
    )
  }
)

PhoneInputField.displayName = "PhoneInputField"

// Props pour le sélecteur de pays
type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: { label: string; value: RPNInput.Country | undefined }[]
}

// Composant sélecteur de pays
const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country)
  }

  return (
    <div 
      data-slot="country-select"
      className="relative inline-flex items-center self-stretch rounded-s-md border border-input bg-background px-3 py-2 transition-colors hover:bg-accent hover:text-foreground focus-within:z-10 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring has-disabled:pointer-events-none has-disabled:opacity-50"
    >
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent country={value} countryName={value} />
        <ChevronDownIcon size={16} className="text-muted-foreground/80" />
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0 cursor-pointer"
        aria-label="Sélectionner le pays"
      >
        <option key="default" value="">
          Sélectionner un pays
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option key={option.value ?? `empty-${i}`} value={option.value}>
              {option.label}{" "}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  )
}

// Composant drapeau
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon size={16} />
      )}
    </span>
  )
}

// Utilitaires de validation
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return RPNInput.isValidPhoneNumber(phoneNumber)
}

export const formatPhoneNumber = (phoneNumber: string, country?: RPNInput.Country): string => {
  return RPNInput.formatPhoneNumber(phoneNumber, country)
}

export const getCountryFromPhoneNumber = (phoneNumber: string): RPNInput.Country | undefined => {
  return RPNInput.getCountryCallingCode ? undefined : undefined // Simplified for now
}

export { PhoneInput, phoneInputVariants }