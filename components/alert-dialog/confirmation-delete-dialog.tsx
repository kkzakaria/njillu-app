"use client"

import * as React from "react"
import { useId, useState } from "react"
import { CircleAlertIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type ConfirmationDeleteDialogProps } from "./types"

export const ConfirmationDeleteDialog = React.forwardRef<
  React.ComponentRef<typeof DialogContent>,
  ConfirmationDeleteDialogProps
>(({
  title = "Confirmation finale",
  description,
  trigger,
  cancelText = "Annuler",
  actionText = "Supprimer",
  onAction,
  onCancel,
  confirmationText,
  confirmationLabel = "Nom de confirmation",
  confirmationPlaceholder,
  className,
  actionLoading = false,
  disabled = false,
  ...props
}, ref) => {
  const id = useId()
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    if (disabled || isLoading || actionLoading || inputValue !== confirmationText) return
    
    setIsLoading(true)
    try {
      await onAction?.()
    } finally {
      setIsLoading(false)
    }
  }

  const isActionDisabled = disabled || isLoading || actionLoading || inputValue !== confirmationText

  const defaultDescription = (
    <>
      Cette action ne peut pas être annulée. Pour confirmer, veuillez saisir{" "}
      <span className="text-foreground font-medium">{confirmationText}</span>.
    </>
  )

  const finalPlaceholder = confirmationPlaceholder || `Tapez ${confirmationText} pour confirmer`

  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        ref={ref}
        className={cn("sm:max-w-md", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {description || defaultDescription}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAction(); }}>
          <div className="space-y-2">
            <Label htmlFor={id}>{confirmationLabel}</Label>
            <Input
              id={id}
              type="text"
              placeholder={finalPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onCancel}
              >
                {cancelText}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={isActionDisabled}
            >
              {(isLoading || actionLoading) ? "..." : actionText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})

ConfirmationDeleteDialog.displayName = "ConfirmationDeleteDialog"