"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface NativeDatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: string
  max?: string
}

export function NativeDatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled = false,
  className,
  min,
  max,
  ...props
}: NativeDatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      onChange?.(new Date(dateValue))
    } else {
      onChange?.(undefined)
    }
  }

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={cn("relative", className)} {...props}>
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleDateChange}
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      />
    </div>
  )
}

// Version avec popover pour ressembler au DatePicker classique
export function PopoverNativeDatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled = false,
  className,
  ...props
}: NativeDatePickerProps) {
  return (
    <Popover>
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
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">Sélectionner une date :</p>
          <NativeDatePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}