import { cva } from "class-variance-authority"

export const radioGroupVariants = cva(
  "grid gap-3",
  {
    variants: {
      orientation: {
        horizontal: "grid-flow-col auto-cols-fr",
        vertical: "grid-flow-row"
      },
      size: {
        sm: "gap-2",
        md: "gap-3", 
        lg: "gap-4"
      }
    },
    defaultVariants: {
      orientation: "vertical",
      size: "md"
    }
  }
)

export const radioCardVariants = cva(
  "relative flex cursor-pointer transition-all outline-none",
  {
    variants: {
      variant: {
        default: "border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 border rounded-md shadow-xs has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
        outline: "border-2 border-muted has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 rounded-md has-focus-visible:ring-2 has-focus-visible:ring-ring",
        filled: "bg-muted has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground rounded-md"
      },
      size: {
        sm: "p-2 text-sm",
        md: "p-3 text-sm",
        lg: "p-4 text-base"
      },
      layout: {
        horizontal: "flex-row items-center gap-3",
        vertical: "flex-col items-center gap-2 text-center"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "horizontal"
    }
  }
)

export const radioChipVariants = cva(
  "border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/10 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center justify-center rounded-full border transition-all outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm", 
        lg: "h-10 px-5 text-sm"
      },
      variant: {
        default: "bg-background",
        outline: "border-2",
        filled: "bg-muted has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-data-[state=checked]:border-primary"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

export const colorSchemeVariants = {
  default: "text-foreground",
  primary: "[--primary:hsl(var(--primary))] [--ring:hsl(var(--ring))]",
  secondary: "[--primary:hsl(var(--secondary))] [--ring:hsl(var(--secondary))]",
  success: "[--primary:hsl(var(--success))] [--ring:hsl(var(--success))]",
  warning: "[--primary:hsl(var(--warning))] [--ring:hsl(var(--warning))]",
  error: "[--primary:hsl(var(--destructive))] [--ring:hsl(var(--destructive))]",
  indigo: "[--primary:var(--color-indigo-500)] [--ring:var(--color-indigo-300)] in-[.dark]:[--primary:var(--color-indigo-500)] in-[.dark]:[--ring:var(--color-indigo-900)]",
  blue: "[--primary:var(--color-blue-500)] [--ring:var(--color-blue-300)] in-[.dark]:[--primary:var(--color-blue-500)] in-[.dark]:[--ring:var(--color-blue-900)]",
  green: "[--primary:var(--color-green-500)] [--ring:var(--color-green-300)] in-[.dark]:[--primary:var(--color-green-500)] in-[.dark]:[--ring:var(--color-green-900)]",
  red: "[--primary:var(--color-red-500)] [--ring:var(--color-red-300)] in-[.dark]:[--primary:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-900)]"
}