"use client"

import { useState } from "react"
import { format, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DropdownNavProps, DropdownProps } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Import dynamique des locales pour éviter les problèmes SSR
const getLocale = async (locale: "fr" | "en" | "es") => {
  switch (locale) {
    case "fr":
      const { fr } = await import("date-fns/locale")
      return fr
    case "en":
      const { enUS } = await import("date-fns/locale") 
      return enUS
    case "es":
      const { es } = await import("date-fns/locale")
      return es
    default:
      return undefined
  }
}

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
  
  const selectedLocale = locales[locale]
  const displayPlaceholder = placeholder || defaultPlaceholders[locale]
  const dateFormat = formatString || defaultFormats[locale]

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

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

  // Composant calendrier avec dropdowns
  const CalendarComponent = () => (
    <Calendar
      mode="single"
      selected={value}
      onSelect={handleDateSelect}
      className="rounded-md border-0 p-3"
      locale={selectedLocale}
      classNames={{
        month_caption: "mx-0",
      }}
      captionLayout={showYearSelect || showMonthSelect ? "dropdown" : "navigation"}
      defaultMonth={value || new Date()}
      startMonth={new Date(startYear, 0)}
      endMonth={new Date(endYear, 11)}
      hideNavigation={showYearSelect || showMonthSelect}
      components={
        showYearSelect || showMonthSelect
          ? {
              DropdownNav: (props: DropdownNavProps) => (
                <div className="flex w-full items-center gap-2">
                  {props.children}
                </div>
              ),
              Dropdown: (props: DropdownProps) => (
                <Select
                  value={String(props.value)}
                  onValueChange={(value) => {
                    if (props.onChange) {
                      handleCalendarChange(value, props.onChange)
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-fit font-medium first:grow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                    {props.options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            }
          : undefined
      }
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
            ? format(value, dateFormat, { locale: selectedLocale })
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