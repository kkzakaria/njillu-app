"use client"

import { useState } from "react"
import { format } from "date-fns"
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
  variant?: "input" | "inline"
  clearable?: boolean
}

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled = false,
  className,
  variant = "input",
  clearable = true,
  ...props
}: EnhancedDatePickerProps) {
  const [open, setOpen] = useState(false)

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

  // Composant calendrier
  const CalendarComponent = () => (
    <Calendar
      mode="single"
      selected={value}
      onSelect={handleDateSelect}
      className="rounded-md border-0 p-3"
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
          {value ? format(value, "dd/MM/yyyy") : placeholder}
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
}: Omit<EnhancedDatePickerProps, "variant">) {
  return (
    <EnhancedDatePicker
      placeholder={placeholder}
      variant="input"
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