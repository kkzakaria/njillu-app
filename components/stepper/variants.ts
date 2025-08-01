import { cva } from "class-variance-authority"

export const stepperVariants = cva(
  "group/stepper inline-flex",
  {
    variants: {
      orientation: {
        horizontal: "data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row",
        vertical: "data-[orientation=vertical]:flex-col"
      },
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4"
      },
      style: {
        default: "",
        minimal: "gap-1",
        outlined: "p-4 border border-border rounded-lg",
        filled: "p-4 bg-muted/50 rounded-lg"
      }
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "md",
      style: "default"
    }
  }
)

export const stepItemVariants = cva(
  "group/step flex items-center",
  {
    variants: {
      orientation: {
        horizontal: "group-data-[orientation=horizontal]/stepper:flex-row",
        vertical: "group-data-[orientation=vertical]/stepper:flex-col"
      },
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base"
      },
      layout: {
        compact: "gap-2",
        comfortable: "gap-3",
        spacious: "gap-4"
      }
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "md",
      layout: "comfortable"
    }
  }
)

export const stepIndicatorVariants = cva(
  "relative flex shrink-0 items-center justify-center rounded-full text-xs font-medium transition-all",
  {
    variants: {
      size: {
        sm: "size-5 text-xs",
        md: "size-6 text-xs", 
        lg: "size-8 text-sm"
      },
      variant: {
        default: "bg-muted text-muted-foreground data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
        minimal: "bg-transparent border-2 border-muted text-muted-foreground data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:text-primary data-[state=completed]:text-primary",
        filled: "bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
        outlined: "border-2 border-border bg-background text-foreground data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

export const stepSeparatorVariants = cva(
  "bg-muted group-data-[state=completed]/step:bg-primary transition-colors",
  {
    variants: {
      orientation: {
        horizontal: "h-0.5 w-full flex-1 group-data-[orientation=horizontal]/stepper:w-full",
        vertical: "w-0.5 h-12 group-data-[orientation=vertical]/stepper:h-12"
      },
      size: {
        sm: "group-data-[orientation=horizontal]/stepper:h-0.5 group-data-[orientation=vertical]/stepper:w-0.5 group-data-[orientation=vertical]/stepper:h-8",
        md: "group-data-[orientation=horizontal]/stepper:h-0.5 group-data-[orientation=vertical]/stepper:w-0.5 group-data-[orientation=vertical]/stepper:h-12",
        lg: "group-data-[orientation=horizontal]/stepper:h-1 group-data-[orientation=vertical]/stepper:w-1 group-data-[orientation=vertical]/stepper:h-16"
      },
      variant: {
        default: "",
        dashed: "border-dashed border-t-2 bg-transparent group-data-[orientation=vertical]/stepper:border-l-2 group-data-[orientation=vertical]/stepper:border-t-0",
        dotted: "border-dotted border-t-2 bg-transparent group-data-[orientation=vertical]/stepper:border-l-2 group-data-[orientation=vertical]/stepper:border-t-0",
        minimal: "opacity-30"
      }
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "md", 
      variant: "default"
    }
  }
)

export const stepContentVariants = cva(
  "space-y-2",
  {
    variants: {
      position: {
        inline: "px-2",
        below: "mt-4 px-2",
        side: "ml-4 px-2"
      },
      alignment: {
        left: "text-left",
        center: "text-center",
        right: "text-right"
      }
    },
    defaultVariants: {
      position: "inline",
      alignment: "left"
    }
  }
)

export const stepControlsVariants = cva(
  "flex justify-center gap-4",
  {
    variants: {
      position: {
        top: "mb-6",
        bottom: "mt-6",
        both: "my-6"
      },
      layout: {
        spread: "justify-between",
        center: "justify-center",
        start: "justify-start",
        end: "justify-end"
      }
    },
    defaultVariants: {
      position: "bottom",
      layout: "center"
    }
  }
)