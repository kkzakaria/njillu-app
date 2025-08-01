"use client"

import { useState } from "react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

const selectVariants = cva(
  "bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
  {
    variants: {
      size: {
        sm: "h-8 text-sm px-2",
        md: "h-10",
        lg: "h-12 px-4",
      },
      variant: {
        default: "",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        filled: "bg-muted border-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

interface SimpleSelectAlternativeProps extends VariantProps<typeof selectVariants> {
  options: SelectOption[]
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  id?: string
}

export function SimpleSelectAlternative({
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option",
  label,
  disabled = false,
  clearable = false,
  className,
  id,
  size,
  variant,
  ...props
}: SimpleSelectAlternativeProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? undefined : selectedValue
    onChange?.(newValue)
    setOpen(false)
    setSearchTerm("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const triggerContent = (
    <div className="flex items-center justify-between w-full">
      <span className={cn("truncate", !value && "text-muted-foreground")}>
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {clearable && value && (
          <div
            role="button"
            tabIndex={-1}
            className="flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent cursor-pointer transition-colors border border-transparent hover:border-border"
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClear(e as any)
              }
            }}
            title="Effacer la sélection"
          >
            <XIcon size={14} className="text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        )}
        <ChevronDownIcon
          size={16}
          className="text-muted-foreground/80"
          aria-hidden="true"
        />
      </div>
    </div>
  )

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(selectVariants({ size, variant }))}
          >
            {triggerContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] max-w-[400px] p-0"
          align="start"
        >
          {/* Simple search input */}
          <div className="flex items-center border-b border-border px-3 py-2">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Options list */}
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucune option trouvée
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-accent",
                    option.disabled && "cursor-not-allowed opacity-50",
                    value === option.value && "bg-accent"
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <CheckIcon size={16} className="ml-2 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}