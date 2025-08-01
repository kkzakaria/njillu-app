"use client"

import { useState } from "react"
import { format, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface EnhancedDatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  locale?: "fr" | "en" | "es"
  variant?: "input" | "inline"
  showYearSelect?: boolean
  showMonthSelect?: boolean
  startYear?: number
  endYear?: number
  formatString?: string
  clearable?: boolean
}

// Configuration des locales simplifiée

const defaultPlaceholders = {
  fr: "Choisir une date",
  en: "Pick a date", 
  es: "Elegir una fecha"
}

const defaultFormats = {
  fr: "dd/MM/yyyy",
  en: "MM/dd/yyyy",
  es: "dd/MM/yyyy"
}

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  locale = "fr",
  variant = "input",
  showYearSelect = true,
  showMonthSelect = true,
  startYear = 1980,
  endYear = new Date().getFullYear() + 10,
  formatString,
  clearable = true,
  ...props
}: EnhancedDatePickerProps) {
  const [open, setOpen] = useState(false)
  
  // Suppression de la référence à locales qui n'existe plus
  const displayPlaceholder = placeholder || defaultPlaceholders[locale]
  const dateFormat = formatString || defaultFormats[locale]

  const handleDateSelect = (date: Date | undefined) => {
    onChange?.(date)
    if (variant === "input") {
      setOpen(false)
    }
  }

  const handleClear = () => {
    onChange?.(undefined)
    setOpen(false)
  }

  // Composant calendrier simplifié sans props problématiques
  const CalendarComponent = () => (
    <Calendar
      mode="single"
      selected={value}
      onSelect={handleDateSelect}
      className="rounded-md border-0 p-3"
      defaultMonth={value || new Date()}
      {...props}
    />
  )

  if (variant === "inline") {
    return (
      <div className={cn("w-fit", className)}>
        <CalendarComponent />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value && isValid(value) 
            ? format(value, dateFormat)
            : displayPlaceholder
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent />
        {clearable && value && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              Effacer
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Composant simple pour usage basique
export function SimpleDatePicker({
  placeholder = "Choisir une date",
  ...props
}: Omit<EnhancedDatePickerProps, "variant" | "showYearSelect" | "showMonthSelect">) {
  return (
    <EnhancedDatePicker
      placeholder={placeholder}
      variant="input"
      showYearSelect={true}
      showMonthSelect={true}
      {...props}
    />
  )
}

// Composant calendrier inline
export function InlineDatePicker({
  ...props
}: Omit<EnhancedDatePickerProps, "variant" | "placeholder">) {
  return (
    <EnhancedDatePicker
      variant="inline"
      {...props}
    />
  )
}