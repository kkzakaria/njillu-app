import { cva } from "class-variance-authority"

export const alertDialogVariants = cva(
  "",
  {
    variants: {
      type: {
        default: "",
        info: "",
        success: "",
        warning: "",
        error: "",
        question: "",
      },
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md", 
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
      },
      scrollable: {
        none: "",
        native: "sm:max-h-[min(640px,80vh)]",
        stickyHeader: "sm:max-h-[min(640px,80vh)]",
        stickyFooter: "sm:max-h-[min(640px,80vh)]",
        stickyBoth: "sm:max-h-[min(640px,80vh)]",
      },
    },
    defaultVariants: {
      type: "default",
      size: "md",
      scrollable: "none",
    },
  }
)

export const iconVariants = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-full border",
  {
    variants: {
      type: {
        default: "border-border text-muted-foreground",
        info: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
        success: "border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
        warning: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
        error: "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
        question: "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400",
      },
    },
    defaultVariants: {
      type: "default",
    },
  }
)