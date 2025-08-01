"use client"

import { useId, useState } from "react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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

interface EnhancedSelectProps extends VariantProps<typeof selectVariants> {
  options: SelectOption[]
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  label?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  className?: string
  id?: string
  multiple?: boolean
  groupBy?: boolean
}

export function EnhancedSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner une option",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucune option trouvée",
  label,
  disabled = false,
  clearable = false,
  searchable = true,
  className,
  id,
  size,
  variant,
  groupBy = false,
  ...props
}: EnhancedSelectProps) {
  const generatedId = useId()
  const selectId = id || generatedId
  const [open, setOpen] = useState<boolean>(false)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (selectedValue: string) => {
    const newValue = selectedValue === value ? undefined : selectedValue
    onChange?.(newValue)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  // Grouper les options si nécessaire
  const groupedOptions = groupBy 
    ? options.reduce((groups, option) => {
        const group = option.group || "Autres"
        if (!groups[group]) {
          groups[group] = []
        }
        groups[group].push(option)
        return groups
      }, {} as Record<string, SelectOption[]>)
    : { "": options }

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
        <Label htmlFor={selectId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={selectId}
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
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] max-w-[400px] p-0"
          align="start"
        >
          <Command className="max-w-none">
            {searchable && (
              <CommandInput 
                placeholder={searchPlaceholder}
                className="h-9"
              />
            )}
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <CommandGroup key={groupName} heading={groupBy && groupName ? groupName : undefined}>
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={handleSelect}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{option.label}</span>
                      {value === option.value && (
                        <CheckIcon size={16} className="ml-2 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Composant simple pour usage basique
export function SimpleSelect({
  placeholder = "Sélectionner une option",
  searchPlaceholder = "Rechercher...",
  ...props
}: Omit<EnhancedSelectProps, "variant" | "size" | "groupBy">) {
  return (
    <EnhancedSelect
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      variant="default"
      size="md"
      groupBy={false}
      {...props}
    />
  )
}

// Composant pour sélection avec groupes
export function GroupedSelect({
  ...props
}: Omit<EnhancedSelectProps, "groupBy">) {
  return (
    <EnhancedSelect
      groupBy={true}
      {...props}
    />
  )
}